import { useState, useCallback, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { ArrowLeft, Volume2, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Language, LanguageProgress, VocabEntry } from '../types';
import { getVocabForLanguage } from '../data/vocabIndex';
import { useSpeech } from '../hooks/useSpeech';

interface StoryActivityProps {
  language: Language;
  langProgress: LanguageProgress;
  onAnswer: (vocabId: string, correct: boolean, timeTaken: number) => void;
  onExit: () => void;
}

interface StoryPage {
  target: string;
  english: string;
  vocab: VocabEntry[];
}

interface WordPopup {
  word: string;
  translation: string;
  romanization?: string;
  x: number;
  y: number;
}

// Build simple stories from vocabulary entries with example sentences
function buildStories(vocab: VocabEntry[], unlockedIds: string[]): StoryPage[] {
  const unlocked = vocab
    .filter((v) => unlockedIds.includes(v.id) && v.exampleSentence && v.exampleTranslation)
    .sort(() => Math.random() - 0.5);
  if (unlocked.length === 0) {
    // Fallback: use any vocab with example sentences
    const withExamples = vocab
      .filter((v) => v.exampleSentence && v.exampleTranslation)
      .slice(0, 9);
    if (withExamples.length === 0) return [];
    return withExamples.reduce<StoryPage[]>((pages, _, idx) => {
      if (idx % 3 === 0) {
        const chunk = withExamples.slice(idx, idx + 3);
        if (chunk.length > 0) pages.push(buildPage(chunk));
      }
      return pages;
    }, []);
  }

  const pages: StoryPage[] = [];
  const chunkSize = 3;
  for (let i = 0; i < Math.min(unlocked.length, 90); i += chunkSize) {
    const chunk = unlocked.slice(i, i + chunkSize);
    if (chunk.length > 0) pages.push(buildPage(chunk));
  }
  return pages;
}

function buildPage(entries: VocabEntry[]): StoryPage {
  const targetSentences = entries.map((e) => e.exampleSentence ?? e.translation);
  const englishSentences = entries.map((e) => e.exampleTranslation ?? e.english);
  return {
    target: targetSentences.join(' '),
    english: englishSentences.join(' '),
    vocab: entries,
  };
}

export default function StoryActivity({ language, langProgress, onAnswer, onExit }: StoryActivityProps) {
  const vocab = getVocabForLanguage(language.code);
  const [stories] = useState<StoryPage[]>(() => buildStories(vocab, langProgress.unlockedVocab));
  const [pageIndex, setPageIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [popup, setPopup] = useState<WordPopup | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionStartAt, setQuestionStartAt] = useState(() => Date.now());
  const { speak, isSpeechSupported } = useSpeech();

  const currentPage = stories[pageIndex];
  const quizTarget = currentPage?.vocab[0];
  const quizOptions = useMemo(() => {
    if (!currentPage) return [];
    return [
      ...new Set(
        [
          quizTarget?.english,
          ...currentPage.vocab.slice(1).map((v) => v.english),
          ...vocab.filter((v) => v.category === quizTarget?.category).slice(0, 2).map((v) => v.english),
        ].filter((word): word is string => Boolean(word))
      ),
    ]
      .slice(0, 4)
      .sort(() => Math.random() - 0.5);
  }, [currentPage, quizTarget?.category, quizTarget?.english, vocab]);

  const handleSpeak = useCallback(async () => {
    if (!currentPage || speaking) return;
    setSpeaking(true);
    try {
      await speak(currentPage.target, { lang: language.speechCode ?? language.code });
    } catch {
      // ignore
    } finally {
      setSpeaking(false);
    }
  }, [currentPage, speaking, speak, language]);

  const handleWordClick = (word: string, event: MouseEvent) => {
    // Find matching vocab entry
    const clean = word
      .toLowerCase()
      .replace(/[.,!?;:"'()\[\]{}]/g, '')
      .trim();
    const match = currentPage?.vocab.find(
      (v) =>
        v.translation.toLowerCase().includes(clean) ||
        clean.includes(v.translation.toLowerCase()) ||
        v.romanization?.toLowerCase().includes(clean) ||
        clean.includes(v.romanization?.toLowerCase() ?? '')
    );

    if (match) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setPopup({
        word,
        translation: match.english,
        romanization: match.romanization,
        x: rect.left,
        y: rect.bottom + window.scrollY + 4,
      });
    } else {
      setPopup(null);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <BookOpen size={48} className="text-sky-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Stories Yet</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Practice more vocabulary to unlock stories with example sentences!
          </p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col"
      onClick={() => setPopup(null)}
    >
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} />
          <span className="font-medium">Reading Stories</span>
        </button>
        <span className="text-sm text-gray-400">
          Page {pageIndex + 1} / {stories.length}
        </span>
      </div>

      {/* Story content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Story header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <BookOpen size={20} />
              <span className="font-semibold">
                {language.flag} {language.name} Story
              </span>
            </div>
            {isSpeechSupported && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
                disabled={speaking}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <Volume2 size={18} className={speaking ? 'animate-pulse' : ''} />
              </button>
            )}
          </div>

          {/* Story text */}
          <div className="p-6">
            <div
              className="text-xl leading-relaxed text-gray-800 mb-4 select-none"
              dir={language.rtl ? 'rtl' : 'ltr'}
            >
              {currentPage.target.split(' ').map((word, i) => (
                <span
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleWordClick(word, e); }}
                  className="cursor-pointer hover:bg-sky-100 hover:text-sky-700 rounded px-0.5 transition-colors"
                >
                  {word}{' '}
                </span>
              ))}
            </div>

            {/* Tip */}
            <p className="text-xs text-sky-500 mb-3">💡 Tap any word to see its translation</p>

            {/* Translation toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowTranslation(!showTranslation); }}
              className="text-sm text-sky-600 hover:text-sky-800 font-medium underline"
            >
              {showTranslation ? 'Hide translation' : 'Show English translation'}
            </button>

            {showTranslation && (
              <div className="mt-3 p-3 bg-sky-50 rounded-xl text-sm text-gray-700 italic border border-sky-100">
                {currentPage.english}
              </div>
            )}

            {quizTarget && quizOptions.length >= 2 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Comprehension check</h3>
                <p className="text-sm text-gray-700 mb-3">
                  In this passage, what does <span className="font-semibold">{quizTarget.translation}</span> mean?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quizOptions.map((opt) => {
                    const isCorrect = opt === quizTarget.english;
                    const isSelected = selectedAnswer === opt;
                    return (
                      <button
                        key={opt}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedAnswer) return;
                          setSelectedAnswer(opt);
                          onAnswer(quizTarget.id, isCorrect, Date.now() - questionStartAt);
                        }}
                        className={`text-sm rounded-lg border px-3 py-2 text-left transition-colors ${
                          !selectedAnswer
                            ? 'bg-white border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                            : isCorrect
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : isSelected
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-gray-200 opacity-60'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vocabulary in this story */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Vocabulary in this passage
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentPage.vocab.map((v) => (
                  <div
                    key={v.id}
                    className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="font-semibold text-indigo-700">{v.translation}</span>
                    {v.romanization && (
                      <span className="text-indigo-400 ml-1 text-xs">({v.romanization})</span>
                    )}
                    <span className="text-gray-400 ml-1">= {v.english}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-100 p-4 flex items-center justify-between">
            <button
              onClick={(e) => { e.stopPropagation(); setPageIndex(Math.max(0, pageIndex - 1)); setShowTranslation(false); setSelectedAnswer(null); setQuestionStartAt(Date.now()); }}
              disabled={pageIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex gap-1">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === pageIndex ? 'bg-sky-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            {pageIndex < stories.length - 1 ? (
              <button
                onClick={(e) => { e.stopPropagation(); setPageIndex(pageIndex + 1); setShowTranslation(false); setSelectedAnswer(null); setQuestionStartAt(Date.now()); }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onExit(); }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Finish ✓
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Word popup */}
      {popup && (
        <div
          className="fixed bg-gray-900 text-white text-sm rounded-xl px-3 py-2 shadow-xl z-50 pointer-events-none"
          style={{ left: Math.min(popup.x, window.innerWidth - 180), top: popup.y }}
        >
          <div className="font-semibold">{popup.word}</div>
          {popup.romanization && <div className="text-gray-300 text-xs">{popup.romanization}</div>}
          <div className="text-yellow-300">{popup.translation}</div>
        </div>
      )}
    </div>
  );
}
