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
import vietnameseVocab from './vocab/vietnamese';
import thaiVocab from './vocab/thai';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = Array.from({ length: n + 1 }, () => 0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
};

const similarity = (a: string, b: string): number => {
  const left = normalize(a);
  const right = normalize(b);
  const max = Math.max(left.length, right.length);
  if (max === 0) return 1;
  return 1 - levenshtein(left, right) / max;
};

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
  vi: vietnameseVocab,
  th: thaiVocab,
  en: englishVocab,
};

const buildExpandedPhraseDeck = (langCode: string, base: VocabEntry[]): VocabEntry[] => {
  const fromExamples = base
    .filter((entry) => entry.exampleSentence && entry.exampleTranslation)
    .map((entry, index) => ({
      id: `${langCode}-xp-${String(index + 1).padStart(3, '0')}`,
      english: entry.exampleTranslation!,
      translation: entry.exampleSentence!,
      romanization: entry.romanization,
      category: 'phrases' as const,
      difficulty: Math.min(5, entry.difficulty + 1) as 1 | 2 | 3 | 4 | 5,
      exampleSentence: entry.exampleSentence,
      exampleTranslation: entry.exampleTranslation,
      tags: ['expanded-content', 'from-example'],
    }));

  const fromPhrases = base
    .filter((entry) => entry.category === 'phrases' || entry.category === 'questions')
    .flatMap((entry, index) => {
      const variants: VocabEntry[] = [];
      if (entry.exampleSentence && entry.exampleTranslation) {
        variants.push({
          id: `${langCode}-conv-${String(index + 1).padStart(3, '0')}-a`,
          english: `In conversation: ${entry.exampleTranslation}`,
          translation: entry.exampleSentence,
          romanization: entry.romanization,
          category: 'phrases',
          difficulty: Math.min(5, entry.difficulty + 1) as 1 | 2 | 3 | 4 | 5,
          exampleSentence: entry.exampleSentence,
          exampleTranslation: entry.exampleTranslation,
          tags: ['expanded-content', 'conversation', 'contextual-variant'],
        });
      }
      variants.push({
        id: `${langCode}-conv-${String(index + 1).padStart(3, '0')}-b`,
        english: `I often use this phrase: ${entry.english}`,
        translation: entry.translation,
        romanization: entry.romanization,
        category: 'phrases',
        difficulty: Math.min(5, entry.difficulty + 1) as 1 | 2 | 3 | 4 | 5,
        exampleSentence: entry.exampleSentence,
        exampleTranslation: entry.exampleTranslation,
        tags: ['expanded-content', 'conversation', 'reuse-variant'],
      });
      return variants;
    });

  return [...base, ...fromExamples, ...fromPhrases];
};

const EXPANDED_VOCAB_BY_LANGUAGE: Record<string, VocabEntry[]> = Object.fromEntries(
  Object.entries(VOCAB_BY_LANGUAGE).map(([langCode, vocab]) => [
    langCode,
    buildExpandedPhraseDeck(langCode, vocab),
  ])
);

export const getVocabForLanguage = (langCode: string): VocabEntry[] => {
  return EXPANDED_VOCAB_BY_LANGUAGE[langCode] ?? [];
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
  const vocab = getVocabForLanguage(langCode);
  const correct = vocab.find((v) => v.id === correctId);
  if (!correct) return [];

  const dedupe = new Set<string>([normalize(correct[field])]);

  const scored = vocab
    .filter((v) => v.id !== correctId)
    .map((candidate) => {
      const sameCategory = candidate.category === correct.category ? 1 : 0;
      const sameDifficulty = Math.max(0, 1 - Math.abs(candidate.difficulty - correct.difficulty) * 0.3);
      const lexical = similarity(candidate[field], correct[field]);
      const englishCloseness = similarity(candidate.english, correct.english);
      const score = sameCategory * 2 + sameDifficulty * 1.5 + lexical * 1.2 + englishCloseness;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  for (const { candidate } of scored) {
    const value = candidate[field];
    const key = normalize(value);
    if (dedupe.has(key)) continue;
    dedupe.add(key);
    picked.push(value);
    if (picked.length >= count) return picked;
  }

  // Fallback in case vocabulary pool is tiny
  return vocab
    .filter((v) => v.id !== correctId)
    .map((v) => v[field])
    .filter((value) => {
      const key = normalize(value);
      if (dedupe.has(key)) return false;
      dedupe.add(key);
      return true;
    })
    .slice(0, count - picked.length)
    .concat(picked)
    .slice(0, count);
};
