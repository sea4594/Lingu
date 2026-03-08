import type { VocabEntry } from '../types';
import spanishVocab from './vocab/spanish';
import mandarinVocab from './vocab/mandarin';
import frenchVocab from './vocab/french';
import germanVocab from './vocab/german';
import japaneseVocab from './vocab/japanese';
import portugueseVocab from './vocab/portuguese';
import russianVocab from './vocab/russian';
import arabicVocab from './vocab/arabic';
import hindiVocab from './vocab/hindi';
import koreanVocab from './vocab/korean';
import italianVocab from './vocab/italian';
import turkishVocab from './vocab/turkish';
import vietnameseVocab from './vocab/vietnamese';
import thaiVocab from './vocab/thai';
import polishVocab from './vocab/polish';
import bengaliVocab from './vocab/bengali';
import punjabiVocab from './vocab/punjabi';
import tamilVocab from './vocab/tamil';
import urduVocab from './vocab/urdu';

// English vocab (for when the user is learning English)
const englishVocab: VocabEntry[] = [
  { id: 'en-001', english: 'to run', translation: 'to run', category: 'verbs', difficulty: 1, exampleSentence: 'I run every morning.', exampleTranslation: 'I run every morning.' },
  { id: 'en-002', english: 'beautiful', translation: 'beautiful', category: 'adjectives', difficulty: 1, exampleSentence: 'What a beautiful day!', exampleTranslation: 'What a beautiful day!' },
  { id: 'en-003', english: 'opportunity', translation: 'opportunity', category: 'work', difficulty: 3, exampleSentence: 'This is a great opportunity.', exampleTranslation: 'This is a great opportunity.' },
  { id: 'en-004', english: 'furthermore', translation: 'furthermore', category: 'phrases', difficulty: 4, exampleSentence: 'Furthermore, the results show...', exampleTranslation: 'Furthermore, the results show...' },
  { id: 'en-005', english: 'nevertheless', translation: 'nevertheless', category: 'phrases', difficulty: 5, exampleSentence: 'Nevertheless, we continued.', exampleTranslation: 'Nevertheless, we continued.' },
];

export const VOCAB_BY_LANGUAGE: Record<string, VocabEntry[]> = {
  es: spanishVocab,
  zh: mandarinVocab,
  fr: frenchVocab,
  de: germanVocab,
  ja: japaneseVocab,
  pt: portugueseVocab,
  ru: russianVocab,
  ar: arabicVocab,
  hi: hindiVocab,
  ko: koreanVocab,
  it: italianVocab,
  tr: turkishVocab,
  vi: vietnameseVocab,
  th: thaiVocab,
  pl: polishVocab,
  bn: bengaliVocab,
  pa: punjabiVocab,
  ta: tamilVocab,
  ur: urduVocab,
  en: englishVocab,
};

export const getVocabForLanguage = (langCode: string): VocabEntry[] => {
  return VOCAB_BY_LANGUAGE[langCode] ?? [];
};

export const getVocabById = (langCode: string, id: string): VocabEntry | undefined => {
  return getVocabForLanguage(langCode).find((v) => v.id === id);
};

export const getVocabByDifficulty = (langCode: string, maxDifficulty: number): VocabEntry[] => {
  return getVocabForLanguage(langCode).filter((v) => v.difficulty <= maxDifficulty);
};

export const getVocabByCategory = (langCode: string, category: string): VocabEntry[] => {
  return getVocabForLanguage(langCode).filter((v) => v.category === category);
};

// Get random distractors for multiple choice (entries that are NOT the correct answer)
export const getDistractors = (
  langCode: string,
  correctId: string,
  count: number,
  field: 'translation' | 'english' = 'translation'
): string[] => {
  const all = getVocabForLanguage(langCode).filter((v) => v.id !== correctId);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((v) => v[field]);
};
