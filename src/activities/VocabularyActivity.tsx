import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Mic, Check, RotateCcw, ChevronRight } from 'lucide-react';
import type { Language, LanguageProgress, VocabEntry, QuizMode } from '../types';
import { getVocabById, getDistractors } from '../data/vocabIndex';
import { checkAnswer, checkPronunciation } from '../utils/fuzzyMatch';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  language: Language;
  langProgress: LanguageProgress;
  onAnswer: (vocabId: string, correct: boolean, timeTaken: number) => void;
  onExit: () => void;
}

const MODES: { id: QuizMode; label: string }[] = [
  { id: 'flashcard', label: 'Flashcard' },
  { id: 'multiple-choice-en', label: 'Multiple Choice' },
  { id: 'type-translation-en', label: 'Type Answer' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'listening', label: 'Listening' },
];

const XP_MAP: Record<string, number> = {
  exact: 15,
  close: 10,
  correct: 10,
  easy: 5,
  good: 10,
};

export default function VocabularyActivity({ language, langProgress, onAnswer, onExit }: Props) {
  const [mode, setMode] = useState<QuizMode>('flashcard');
  const [mcDirection, setMcDirection] = useState<'en-tl' | 'tl-en'>('en-tl');
  const [typeDirection, setTypeDirection] = useState<'en-tl' | 'tl-en'>('en-tl');

  const vocab = langProgress.unlockedVocab
    .map((id) => getVocabById(language.code, id))
    .filter((v): v is VocabEntry => v !== undefined);

  const [index, setIndex] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean; message: string; xp: number }>(null);
  const [flipped, setFlipped] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typeInput, setTypeInput] = useState('');
  const [typeResult, setTypeResult] = useState<null | 'exact' | 'close' | 'wrong'>(null);
  const [isListening, setIsListening] = useState(false);
  const [pronResult, setPronResult] = useState<null | 'exact' | 'close' | 'wrong'>(null);

  const startTimeRef = useRef(Date.now());
  const { speak, recognize, isSpeechSupported, isRecognitionSupported } = useSpeech();

  const current = vocab[index];

  const buildOptions = useCallback(
    (entry: VocabEntry, field: 'translation' | 'english') => {
      const distractors = getDistractors(language.code, entry.id, 3, field);
      const all = [entry[field], ...distractors].sort(() => Math.random() - 0.5);
      setOptions(all);
    },
    [language.code]
  );

  useEffect(() => {
    setFlipped(false);
    setSelectedOption(null);
    setTypeInput('');
    setTypeResult(null);
    setPronResult(null);
    setFeedback(null);
    startTimeRef.current = Date.now();

    if (!current) return;

    if (mode === 'multiple-choice-en') {
      buildOptions(current, mcDirection === 'en-tl' ? 'translation' : 'english');
    } else if (mode === 'listening') {
      buildOptions(current, 'english');
      const lang = language.speechCode ?? language.code;
      speak(current.translation, { lang });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, mode, mcDirection]);

  if (!current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-xl text-gray-600">No vocabulary unlocked yet!</p>
          <button onClick={onExit} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const timeTaken = () => Date.now() - startTimeRef.current;

  const advance = (correct: boolean, xp: number, message: string) => {
    setFeedback({ correct, message, xp });
    setXpTotal((p) => p + xp);
    onAnswer(current.id, correct, timeTaken());
    setTimeout(() => {
      setFeedback(null);
      setIndex((i) => (i + 1) % vocab.length);
    }, 1400);
  };

  // ── Flashcard handlers ──────────────────────────────────────────────────────
  const handleFlashcardRate = (rating: 'again' | 'good' | 'easy') => {
    const correct = rating !== 'again';
    const xp = rating === 'easy' ? XP_MAP.easy : rating === 'good' ? XP_MAP.good : 0;
    advance(correct, xp, correct ? '👍 Marked as known!' : '🔁 Practice again');
  };

  // ── Multiple choice handlers ─────────────────────────────────────────────────
  const handleOptionSelect = (opt: string) => {
    if (selectedOption) return;
    setSelectedOption(opt);
    const trueAnswer =
      mode === 'listening' ? current.english : mcDirection === 'en-tl' ? current.translation : current.english;
    const isCorrect = opt === trueAnswer;
    setTimeout(() => advance(isCorrect, isCorrect ? XP_MAP.correct : 0, isCorrect ? '✅ Correct!' : '❌ Wrong'), 700);
  };

  // ── Type answer handlers ──────────────────────────────────────────────────────
  const handleTypeSubmit = () => {
    if (!typeInput.trim()) return;
    const expected = typeDirection === 'en-tl' ? current.translation : current.english;
    const result = checkAnswer(typeInput, expected);
    setTypeResult(result);
    const correct = result !== 'wrong';
    const xp = result === 'exact' ? XP_MAP.exact : result === 'close' ? XP_MAP.close : 0;
    const msg = result === 'exact' ? '✅ Exact!' : result === 'close' ? '🟡 Close enough!' : '❌ Wrong';
    advance(correct, xp, msg);
  };

  // ── Pronunciation handlers ────────────────────────────────────────────────────
  const handlePronunciation = async () => {
    setIsListening(true);
    try {
      const lang = language.speechCode ?? language.code;
      const transcript = await recognize(lang);
      const result = checkPronunciation(transcript, current.translation);
      setPronResult(result);
      const correct = result !== 'wrong';
      const xp = result === 'exact' ? XP_MAP.exact : result === 'close' ? XP_MAP.close : 0;
      advance(correct, xp, result === 'exact' ? '🎤 Perfect!' : result === 'close' ? '🟡 Almost!' : '❌ Try again');
    } catch {
      setPronResult('wrong');
    } finally {
      setIsListening(false);
    }
  };

  const optionColor = (opt: string) => {
    if (!selectedOption) return 'bg-white hover:bg-indigo-50 border-gray-200 hover:border-indigo-300';
    const trueAnswer =
      mode === 'listening' ? current.english : mcDirection === 'en-tl' ? current.translation : current.english;
    if (opt === trueAnswer) return 'bg-green-50 border-green-400 text-green-800';
    if (opt === selectedOption) return 'bg-red-50 border-red-400 text-red-800';
    return 'bg-white border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} /> <span className="text-sm font-medium">Exit</span>
        </button>
        <div className="text-sm font-semibold text-gray-700">
          {index + 1} / {vocab.length} words
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            🔥 {langProgress.streak}
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            +{xpTotal} XP
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${((index + 1) / vocab.length) * 100}%` }}
        />
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              mode === m.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Feedback overlay */}
      {feedback && (
        <div
          className={`mx-4 mb-3 p-3 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2 ${
            feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {feedback.message}
          {feedback.xp > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">+{feedback.xp} XP</span>
          )}
        </div>
      )}

      {/* Main card area */}
      <div className="px-4 pb-8">
        {/* ── FLASHCARD ── */}
        {mode === 'flashcard' && (
          <div className="space-y-4">
            <div
              className="cursor-pointer select-none"
              onClick={() => {
                setFlipped((f) => !f);
                if (!flipped) {
                  speak(current.translation, { lang: language.speechCode ?? language.code });
                }
              }}
            >
              <div className={`relative min-h-[220px] rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                flipped
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                  : 'bg-white text-gray-800'
              }`}>
                {!flipped ? (
                  <>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">English</p>
                    <p className="text-3xl font-bold text-center">{current.english}</p>
                    <p className="text-xs text-gray-400 mt-4">Tap to reveal</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-widest text-indigo-200 mb-2">{language.name}</p>
                    <p className={`text-3xl font-bold text-center ${language.rtl ? 'direction-rtl' : ''}`}>{current.translation}</p>
                    {current.romanization && (
                      <p className="text-indigo-200 mt-1 text-sm">{current.romanization}</p>
                    )}
                    {current.pronunciation && (
                      <p className="text-indigo-300 text-xs mt-1">[{current.pronunciation}]</p>
                    )}
                    {current.exampleSentence && (
                      <p className="text-indigo-100 text-xs mt-3 italic text-center">"{current.exampleSentence}"</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="p-3 rounded-full bg-white shadow border border-gray-200 hover:bg-indigo-50 disabled:opacity-40 transition-colors"
              >
                <Volume2 size={18} className="text-indigo-600" />
              </button>
            </div>

            {flipped && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleFlashcardRate('again')}
                  className="flex-1 py-3 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Again
                </button>
                <button
                  onClick={() => handleFlashcardRate('good')}
                  className="flex-1 py-3 rounded-xl bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Good
                </button>
                <button
                  onClick={() => handleFlashcardRate('easy')}
                  className="flex-1 py-3 rounded-xl bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronRight size={16} /> Easy
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MULTIPLE CHOICE ── */}
        {mode === 'multiple-choice-en' && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center mb-1">
              <button
                onClick={() => { setMcDirection('en-tl'); buildOptions(current, 'translation'); setSelectedOption(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${mcDirection === 'en-tl' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >EN → {language.name}</button>
              <button
                onClick={() => { setMcDirection('tl-en'); buildOptions(current, 'english'); setSelectedOption(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${mcDirection === 'tl-en' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >{language.name} → EN</button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 text-center min-h-[120px] flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                {mcDirection === 'en-tl' ? 'English' : language.name}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {mcDirection === 'en-tl' ? current.english : current.translation}
              </p>
              {mcDirection === 'tl-en' && current.romanization && (
                <p className="text-sm text-gray-400 mt-1">{current.romanization}</p>
              )}
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="mt-3 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-40"
              >
                <Volume2 size={16} className="text-indigo-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${optionColor(opt)}`}
                >
                  {opt}
                  {selectedOption && opt === (mcDirection === 'en-tl' ? current.translation : current.english) && (
                    <Check size={14} className="inline ml-1 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TYPE ANSWER ── */}
        {mode === 'type-translation-en' && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center mb-1">
              <button
                onClick={() => { setTypeDirection('en-tl'); setTypeInput(''); setTypeResult(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${typeDirection === 'en-tl' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >EN → {language.name}</button>
              <button
                onClick={() => { setTypeDirection('tl-en'); setTypeInput(''); setTypeResult(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${typeDirection === 'tl-en' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >{language.name} → EN</button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                {typeDirection === 'en-tl' ? 'Translate to ' + language.name : 'Translate to English'}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {typeDirection === 'en-tl' ? current.english : current.translation}
              </p>
              {typeDirection === 'tl-en' && current.romanization && (
                <p className="text-sm text-gray-400 mt-1">{current.romanization}</p>
              )}
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="mt-3 p-2 rounded-full hover:bg-indigo-50 disabled:opacity-40"
              >
                <Volume2 size={16} className="text-indigo-400" />
              </button>
            </div>

            <input
              type="text"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
              placeholder={typeDirection === 'en-tl' ? `Type in ${language.name}…` : 'Type in English…'}
              className={`w-full p-4 rounded-xl border-2 text-base focus:outline-none transition-colors ${
                typeResult === 'exact'
                  ? 'border-green-400 bg-green-50'
                  : typeResult === 'close'
                  ? 'border-amber-400 bg-amber-50'
                  : typeResult === 'wrong'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-indigo-400'
              }`}
            />

            {typeResult && (
              <div className={`p-3 rounded-xl text-sm font-medium ${
                typeResult !== 'wrong' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                Correct answer: <span className="font-bold">{typeDirection === 'en-tl' ? current.translation : current.english}</span>
              </div>
            )}

            <button
              onClick={handleTypeSubmit}
              disabled={!typeInput.trim() || !!typeResult}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Check Answer
            </button>
          </div>
        )}

        {/* ── PRONUNCIATION ── */}
        {mode === 'pronunciation' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
              <p className="text-xs uppercase tracking-widest text-indigo-200 mb-2">Say this in {language.name}</p>
              <p className="text-3xl font-bold">{current.translation}</p>
              {current.romanization && <p className="text-indigo-200 mt-1">{current.romanization}</p>}
              {current.pronunciation && <p className="text-indigo-300 text-sm mt-1">[{current.pronunciation}]</p>}
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="mt-4 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm flex items-center gap-2 mx-auto disabled:opacity-40"
              >
                <Volume2 size={16} /> Hear it
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">Original: <span className="font-semibold text-gray-700">{current.english}</span></p>

            <div className="flex justify-center">
              <button
                onClick={handlePronunciation}
                disabled={!isRecognitionSupported || isListening}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 font-semibold text-sm transition-all shadow-lg ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : pronResult === 'exact'
                    ? 'bg-green-500 text-white'
                    : pronResult === 'close'
                    ? 'bg-amber-500 text-white'
                    : pronResult === 'wrong'
                    ? 'bg-red-400 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Mic size={28} />
                {isListening ? 'Listening…' : 'Speak'}
              </button>
            </div>

            {!isRecognitionSupported && (
              <p className="text-center text-xs text-gray-400">Speech recognition not supported in this browser.</p>
            )}

            {pronResult && (
              <div className={`p-3 rounded-xl text-sm text-center font-medium ${
                pronResult !== 'wrong' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {pronResult === 'exact' ? '🎤 Perfect pronunciation!' : pronResult === 'close' ? '🟡 Almost there!' : '❌ Try again'}
              </div>
            )}
          </div>
        )}

        {/* ── LISTENING ── */}
        {mode === 'listening' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">What did you hear?</p>
              <button
                onClick={() => speak(current.translation, { lang: language.speechCode ?? language.code })}
                disabled={!isSpeechSupported}
                className="w-20 h-20 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center mx-auto mb-2 disabled:opacity-40 transition-colors"
              >
                <Volume2 size={32} className="text-indigo-600" />
              </button>
              <p className="text-xs text-gray-400">Tap to replay</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    !selectedOption
                      ? 'bg-white hover:bg-indigo-50 border-gray-200 hover:border-indigo-300'
                      : opt === current.english
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : opt === selectedOption
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-white border-gray-200 opacity-50'
                  }`}
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
