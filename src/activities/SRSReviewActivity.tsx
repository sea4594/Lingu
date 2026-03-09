import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Check, X, RotateCcw } from 'lucide-react';
import type { Language, LanguageProgress, VocabEntry } from '../types';
import { getVocabById, getDistractors } from '../data/vocabIndex';
import { getReviewQueue } from '../utils/spacedRepetition';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  language: Language;
  langProgress: LanguageProgress;
  onAnswer: (vocabId: string, correct: boolean, timeTaken: number) => void;
  onExit: () => void;
}

interface SessionResult {
  vocabId: string;
  correct: boolean;
}

export default function SRSReviewActivity({ language, langProgress, onAnswer, onExit }: Props) {
  const allIds = langProgress.unlockedVocab;
  const reviewQueue = getReviewQueue(langProgress.srsCards, allIds, 8, 40);
  const queue = reviewQueue.filter((id) => getVocabById(language.code, id));

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [done, setDone] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);

  const startTimeRef = useRef(Date.now());
  const { speak, isSpeechSupported } = useSpeech();

  // Alternate between flashcard (even) and multiple-choice (odd) for variety
  const useFlashcard = index % 2 === 0;

  const current: VocabEntry | undefined = queue[index]
    ? getVocabById(language.code, queue[index])
    : undefined;

  const buildOptions = useCallback(
    (entry: VocabEntry) => {
      const distractors = getDistractors(language.code, entry.id, 3, 'english');
      setOptions([entry.english, ...distractors].sort(() => Math.random() - 0.5));
    },
    [language.code]
  );

  useEffect(() => {
    if (!current) return;
    setFlipped(false);
    setSelectedOption(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
    if (!useFlashcard) buildOptions(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All caught up!</h2>
          <p className="text-gray-500 mb-6">No cards due right now. Keep a streak to retain long-term memory.</p>
          <button onClick={onExit} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    const pct = Math.round((correctCount / results.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Session Complete!</h2>
          <p className="text-gray-500 mb-6">Great work reviewing your cards</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-indigo-600">{results.length}</p>
              <p className="text-xs text-gray-500">Reviewed</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{pct}%</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-600">+{xpEarned}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </div>

          <button onClick={onExit} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const timeTaken = () => Date.now() - startTimeRef.current;

  const advance = (correct: boolean) => {
    const xp = correct ? 10 : 0;
    setFeedback({ correct });
    setXpEarned((p) => p + xp);
    setResults((prev) => [...prev, { vocabId: current.id, correct }]);
    onAnswer(current.id, correct, timeTaken());
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= queue.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 1200);
  };

  const optionColor = (opt: string) => {
    if (!selectedOption) return 'bg-white hover:bg-indigo-50 border-gray-200 hover:border-indigo-300';
    if (opt === current.english) return 'bg-green-50 border-green-400 text-green-800';
    if (opt === selectedOption) return 'bg-red-50 border-red-400 text-red-800';
    return 'bg-white border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} /> <span className="text-sm font-medium">Exit</span>
        </button>
        <div className="text-sm font-semibold text-gray-700">
          Review {index + 1} / {queue.length}
        </div>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
          +{xpEarned} XP
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${((index + 1) / queue.length) * 100}%` }}
        />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mx-4 mt-3 p-3 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2 ${
          feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {feedback.correct ? <><Check size={16} /> Correct! +10 XP</> : <><X size={16} /> Review this again</>}
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Mode badge */}
        <div className="flex justify-center">
          <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">
            {useFlashcard ? '🗂 Flashcard' : '🔤 Multiple Choice'}
          </span>
        </div>

        {/* Card */}
        {useFlashcard ? (
          <div className="space-y-4">
            <div
              className="cursor-pointer"
              onClick={() => {
                setFlipped(true);
                speak(current.translation, { lang: language.speechCode ?? language.code });
              }}
            >
              <div className={`min-h-[200px] rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 transition-all ${
                flipped
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                  : 'bg-white text-gray-800'
              }`}>
                {!flipped ? (
                  <>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{language.name}</p>
                    <p className="text-3xl font-bold text-center">{current.translation}</p>
                    {current.romanization && <p className="text-gray-400 mt-1 text-sm">{current.romanization}</p>}
                    <p className="text-xs text-gray-400 mt-4">Tap to reveal English</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-widest text-violet-200 mb-2">English</p>
                    <p className="text-3xl font-bold text-center">{current.english}</p>
                    {current.exampleSentence && (
                      <p className="text-violet-200 text-xs mt-3 italic text-center">"{current.exampleSentence}"</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="p-3 rounded-full bg-white shadow border border-gray-200 hover:bg-indigo-50 disabled:opacity-40"
              >
                <Volume2 size={18} className="text-indigo-600" />
              </button>
            </div>

            {flipped && (
              <div className="flex gap-3">
                <button
                  onClick={() => advance(false)}
                  className="flex-1 py-3 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Forgot
                </button>
                <button
                  onClick={() => advance(true)}
                  className="flex-1 py-3 rounded-xl bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Remembered
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{language.name}</p>
              <p className="text-2xl font-bold text-gray-800">{current.translation}</p>
              {current.romanization && <p className="text-sm text-gray-400 mt-1">{current.romanization}</p>}
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="mt-3 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-40"
              >
                <Volume2 size={16} className="text-indigo-400" />
              </button>
            </div>

            <p className="text-center text-sm font-medium text-gray-500">Choose the English translation</p>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    if (selectedOption) return;
                    setSelectedOption(opt);
                    setTimeout(() => advance(opt === current.english), 600);
                  }}
                  className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${optionColor(opt)}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
