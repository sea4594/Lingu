import { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Check, X, RotateCcw } from 'lucide-react';
import type { Language, LanguageProgress, VocabEntry } from '../types';
import { getVocabById } from '../data/vocabIndex';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  language: Language;
  langProgress: LanguageProgress;
  onAnswer: (vocabId: string, correct: boolean, timeTaken: number) => void;
  onExit: () => void;
}

interface SentenceChallenge {
  vocab: VocabEntry;
  english: string;
  targetSentence: string;
  words: string[];
  answer: string[];
}

const tokenizeForNoSpaceScripts = (sentence: string): string[] =>
  sentence
    .split('')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .filter((segment) => /\p{L}|\p{N}/u.test(segment));

const segmentSentence = (sentence: string, locale: string): string[] => {
  const cleaned = sentence.trim();
  if (!cleaned) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    const segments = Array.from(segmenter.segment(cleaned))
      .map((segment) => segment.segment.trim())
      .filter((segment) => segment.length > 0)
      .filter((segment) => /\p{L}|\p{N}/u.test(segment));

    if (segments.length > 0) return segments;
  }

  const noSpaceLocale = /^(zh|ja|th|ko)/i.test(locale);
  if (noSpaceLocale) {
    const charSegments = tokenizeForNoSpaceScripts(cleaned);
    if (charSegments.length > 1) return charSegments;
  }

  const bySpace = cleaned.split(/\s+/).filter(Boolean);
  if (bySpace.length > 0) return bySpace;

  return cleaned.split('').filter(Boolean);
};

function buildChallenges(vocab: VocabEntry[], locale: string): SentenceChallenge[] {
  const seed = [...vocab].sort(() => Math.random() - 0.5);
  const sentenceTokenPool = vocab
    .filter((v) => v.exampleSentence)
    .flatMap((v) => segmentSentence(v.exampleSentence ?? '', locale));

  return vocab
    .filter((v) => v.exampleSentence && v.exampleTranslation)
    .concat(seed.filter((v) => v.exampleSentence && v.exampleTranslation))
    .map((v) => {
      const target = v.exampleSentence!;
      const rawWords = segmentSentence(target, locale);
      if (rawWords.length < 2) return null;

      const decoys = sentenceTokenPool
        .filter((token) => !rawWords.includes(token))
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(2, Math.max(1, Math.floor(rawWords.length / 4))));

      const shuffled = [...rawWords, ...decoys].sort(() => Math.random() - 0.5);
      // Ensure shuffle is actually different
      let attempts = 0;
      while (shuffled.join(' ') === [...rawWords, ...decoys].join(' ') && attempts < 10) {
        shuffled.sort(() => Math.random() - 0.5);
        attempts++;
      }
      return {
        vocab: v,
        english: v.exampleTranslation!,
        targetSentence: target,
        words: shuffled,
        answer: rawWords,
      };
    })
    .filter((challenge): challenge is SentenceChallenge => challenge !== null)
    .slice(0, 24);
}

export default function SentenceBuilderActivity({ language, langProgress, onAnswer, onExit }: Props) {
  const allVocab: VocabEntry[] = langProgress.unlockedVocab
    .map((id) => getVocabById(language.code, id))
    .filter((v): v is VocabEntry => v !== undefined);

  const [challenges] = useState<SentenceChallenge[]>(() => {
    const c = buildChallenges(allVocab, language.speechCode ?? language.code);
    return c.length > 0 ? c : [];
  });

  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const { speak, isSpeechSupported } = useSpeech();

  const current = challenges[index];

  useEffect(() => {
    if (!current) return;
    setBank([...current.words]);
    setPlaced([]);
    setSubmitted(false);
    setIsCorrect(false);
    setStartedAt(Date.now());
  }, [index, current]);

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-600 mb-2">No example sentences available yet.</p>
          <p className="text-sm text-gray-400 mb-6">Unlock more vocabulary to get sentences!</p>
          <button onClick={onExit} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold">Go Back</button>
        </div>
      </div>
    );
  }

  if (index >= challenges.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">All done!</h2>
          <p className="text-gray-500 mb-6">You completed all sentence challenges</p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-3xl font-bold text-emerald-600">{score} / {challenges.length}</p>
            <p className="text-sm text-gray-500 mt-1">correct on first try</p>
          </div>
          <button onClick={onExit} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const addWord = (word: string, bankIdx: number) => {
    if (submitted) return;
    setPlaced((p) => [...p, word]);
    setBank((b) => b.filter((_, i) => i !== bankIdx));
  };

  const removeWord = (placedIdx: number) => {
    if (submitted) return;
    const word = placed[placedIdx];
    setPlaced((p) => p.filter((_, i) => i !== placedIdx));
    setBank((b) => [...b, word]);
  };

  const handleSubmit = () => {
    if (placed.length !== current.answer.length) return;
    const correct = placed.join(' ') === current.answer.join(' ');
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(current.vocab.id, correct, Date.now() - startedAt);
    if (correct) setScore((s) => s + 1);
    if (correct) speak(current.targetSentence, { lang: language.speechCode ?? language.code });
  };

  const handleNext = () => setIndex((i) => i + 1);

  const handleReset = () => {
    setBank([...current.words]);
    setPlaced([]);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={20} /> <span className="text-sm font-medium">Exit</span>
        </button>
        <div className="text-sm font-semibold text-gray-700">{index + 1} / {challenges.length}</div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
          {score} correct
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${((index + 1) / challenges.length) * 100}%` }}
        />
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* English prompt */}
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Translate to {language.name}</p>
          <p className="text-lg font-semibold text-gray-800">"{current.english}"</p>
          <p className="text-xs text-gray-400 mt-2">
            Vocabulary: <span className="font-medium text-gray-600">{current.vocab.english} = {current.vocab.translation}</span>
          </p>
        </div>

        {/* Answer area */}
        <div className="bg-white rounded-2xl shadow p-4 min-h-[80px]">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your sentence</p>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {placed.map((w, i) => (
              <button
                key={`placed-${i}`}
                onClick={() => removeWord(i)}
                disabled={submitted}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                  submitted
                    ? isCorrect
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : 'bg-red-100 border-red-400 text-red-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {w}
              </button>
            ))}
            {placed.length === 0 && (
              <p className="text-sm text-gray-300 italic">Tap words below to build the sentence…</p>
            )}
          </div>
        </div>

        {/* Feedback */}
        {submitted && (
          <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-red-500" />}
              <span className={`font-semibold text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Correct! 🎉' : 'Not quite…'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-sm text-gray-700">
                Correct: <span className="font-semibold">{current.answer.join(' ')}</span>
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => speak(current.targetSentence, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="p-1.5 rounded-full hover:bg-white disabled:opacity-40"
              >
                <Volume2 size={16} className="text-emerald-600" />
              </button>
              <p className="text-xs text-gray-500 italic">"{current.targetSentence}"</p>
            </div>
          </div>
        )}

        {/* Word bank */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Word Bank</p>
          <div className="flex flex-wrap gap-2">
            {bank.map((w, i) => (
              <button
                key={`bank-${i}`}
                onClick={() => addWord(w, i)}
                disabled={submitted}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-40 transition-all shadow-sm"
              >
                {w}
              </button>
            ))}
            {bank.length === 0 && !submitted && (
              <p className="text-sm text-gray-300 italic">All words placed!</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!submitted ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={placed.length !== current.answer.length}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                Check Answer
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              {index + 1 < challenges.length ? 'Next Sentence →' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
