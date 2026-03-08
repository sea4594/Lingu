import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import type { Language, LanguageProgress, VocabEntry } from '../types';
import { getVocabById, getDistractors } from '../data/vocabIndex';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  language: Language;
  langProgress: LanguageProgress;
  onAnswer: (vocabId: string, correct: boolean, timeTaken: number) => void;
  onExit: () => void;
}

type Speed = 'slow' | 'normal' | 'fast';
const SPEED_RATE: Record<Speed, number> = { slow: 0.5, normal: 0.9, fast: 1.3 };

export default function ListeningActivity({ language, langProgress, onAnswer, onExit }: Props) {
  const vocab: VocabEntry[] = langProgress.unlockedVocab
    .map((id) => getVocabById(language.code, id))
    .filter((v): v is VocabEntry => v !== undefined);

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [xpTotal, setXpTotal] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startTimeRef = useRef(Date.now());
  const { speak, isSpeechSupported } = useSpeech();

  const current = vocab[index];

  const playAudio = async (entry: VocabEntry, rate: number) => {
    if (!isSpeechSupported) return;
    setIsPlaying(true);
    try {
      await speak(entry.translation, { lang: language.speechCode ?? language.code, rate });
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!current) return;
    const distractors = getDistractors(language.code, current.id, 3, 'english');
    setOptions([current.english, ...distractors].sort(() => Math.random() - 0.5));
    setSelected(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
    // Auto-play
    playAudio(current, SPEED_RATE[speed]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (vocab.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No vocabulary available yet.</p>
          <button onClick={onExit} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Go Back</button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const timeTaken = () => Date.now() - startTimeRef.current;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === current.english;
    setFeedback({ correct });
    setXpTotal((p) => p + (correct ? 10 : 0));
    onAnswer(current.id, correct, timeTaken());
    setTimeout(() => {
      setFeedback(null);
      setIndex((i) => (i + 1) % vocab.length);
    }, 1300);
  };

  const optionColor = (opt: string) => {
    if (!selected) return 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300';
    if (opt === current.english) return 'bg-green-50 border-green-400 text-green-800';
    if (opt === selected) return 'bg-red-50 border-red-400 text-red-800';
    return 'bg-white border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} /> <span className="text-sm font-medium">Exit</span>
        </button>
        <div className="text-sm font-semibold text-gray-700">{index + 1} / {vocab.length}</div>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">+{xpTotal} XP</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${((index + 1) / vocab.length) * 100}%` }}
        />
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`mx-4 mt-3 p-3 rounded-xl text-center font-semibold text-sm ${
          feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {feedback.correct ? '✅ Correct! +10 XP' : `❌ It was: "${current.english}"`}
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        {/* Audio player card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">What do you hear?</p>

          <button
            onClick={() => playAudio(current, SPEED_RATE[speed])}
            disabled={!isSpeechSupported || isPlaying}
            className={`w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-blue-400 text-white scale-95'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105'
            } disabled:opacity-40`}
          >
            <Volume2 size={36} />
            <span className="text-xs font-semibold">{isPlaying ? 'Playing…' : 'Replay'}</span>
          </button>

          {!isSpeechSupported && (
            <p className="text-xs text-gray-400 mt-4">Audio not supported in this browser.</p>
          )}
        </div>

        {/* Speed selector */}
        <div className="flex justify-center gap-2">
          <span className="text-xs text-gray-500 self-center">Speed:</span>
          {(['slow', 'normal', 'fast'] as Speed[]).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                speed === s
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Options */}
        <div>
          <p className="text-center text-sm font-medium text-gray-500 mb-3">Select the correct translation</p>
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${optionColor(opt)}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
