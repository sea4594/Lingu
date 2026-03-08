import type { UserProgress, LanguageProgress } from '../types';
import { getVocabForLanguage } from '../data/vocabIndex';
import { createNewSRSCard } from './spacedRepetition';

const STORAGE_KEY = 'lingu_progress';

export const DEFAULT_LANGUAGE_PROGRESS = (languageCode: string): LanguageProgress => ({
  languageCode,
  unlockedVocab: [],
  srsCards: {},
  totalXP: 0,
  streak: 0,
  lastStudiedDate: '',
  completedActivities: 0,
  level: 1,
  wordsLearned: 0,
  wordsInReview: 0,
  wordsMastered: 0,
});

export const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProgress;
    }
  } catch {
    // ignore parse errors
  }
  return {
    languages: {},
    selectedLanguage: 'es',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors (e.g., private browsing)
  }
};

export const getLanguageProgress = (
  progress: UserProgress,
  langCode: string
): LanguageProgress => {
  return progress.languages[langCode] ?? DEFAULT_LANGUAGE_PROGRESS(langCode);
};

/**
 * Initialize vocabulary for a language - unlock first 20 words
 */
export const initializeLanguage = (
  progress: UserProgress,
  langCode: string
): UserProgress => {
  if (progress.languages[langCode]) return progress;

  const vocab = getVocabForLanguage(langCode);
  const initialVocab = vocab
    .filter((v) => v.difficulty === 1)
    .slice(0, 20)
    .map((v) => v.id);

  const srsCards: LanguageProgress['srsCards'] = {};
  initialVocab.forEach((id) => {
    srsCards[id] = createNewSRSCard(id);
  });

  const langProgress: LanguageProgress = {
    ...DEFAULT_LANGUAGE_PROGRESS(langCode),
    unlockedVocab: initialVocab,
    srsCards,
  };

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: langProgress,
    },
  };
};

/**
 * Award XP and check for level up
 */
export const awardXP = (
  progress: UserProgress,
  langCode: string,
  xp: number
): UserProgress => {
  const langProgress = getLanguageProgress(progress, langCode);
  const newXP = langProgress.totalXP + xp;
  const newLevel = calculateLevel(newXP);

  const updated: LanguageProgress = {
    ...langProgress,
    totalXP: newXP,
    level: newLevel,
  };

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: updated,
    },
  };
};

/**
 * Calculate level based on total XP
 * Each level requires progressively more XP
 */
export const calculateLevel = (xp: number): number => {
  // Level thresholds: 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500+
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
  }
  return Math.min(level, 10);
};

export const xpForNextLevel = (currentLevel: number): number => {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
  return thresholds[Math.min(currentLevel, thresholds.length - 1)] ?? 5500;
};

/**
 * Update streak based on study activity
 */
export const updateStreak = (
  progress: UserProgress,
  langCode: string
): UserProgress => {
  const langProgress = getLanguageProgress(progress, langCode);
  const today = new Date().toISOString().split('T')[0];
  const lastDate = langProgress.lastStudiedDate;

  let streak = langProgress.streak;
  if (lastDate === today) {
    // Already studied today
  } else if (isYesterday(lastDate)) {
    streak += 1;
  } else {
    streak = 1; // Reset streak
  }

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: {
        ...langProgress,
        streak,
        lastStudiedDate: today,
        completedActivities: langProgress.completedActivities + 1,
      },
    },
  };
};

const isYesterday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
};

/**
 * Unlock new vocabulary when user has mastered enough words
 */
export const unlockNewVocab = (
  progress: UserProgress,
  langCode: string
): UserProgress => {
  const langProgress = getLanguageProgress(progress, langCode);
  const vocab = getVocabForLanguage(langCode);
  const currentUnlocked = new Set(langProgress.unlockedVocab);

  // Count mastered words
  const masteredCount = Object.values(langProgress.srsCards).filter(
    (c) => c.stage === 'mastered'
  ).length;

  // Unlock new words based on mastered count
  const unlockThreshold = Math.floor(masteredCount / 5) + 1; // Unlock 1 batch per 5 mastered
  const maxDifficulty = Math.min(5, Math.ceil(unlockThreshold / 2));

  const eligibleVocab = vocab.filter(
    (v) => !currentUnlocked.has(v.id) && v.difficulty <= maxDifficulty
  );

  if (eligibleVocab.length === 0) return progress;

  const newVocab = eligibleVocab.slice(0, 5); // Unlock 5 at a time
  const newSrsCards = { ...langProgress.srsCards };
  newVocab.forEach((v) => {
    if (!newSrsCards[v.id]) {
      newSrsCards[v.id] = createNewSRSCard(v.id);
    }
  });

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: {
        ...langProgress,
        unlockedVocab: [...langProgress.unlockedVocab, ...newVocab.map((v) => v.id)],
        srsCards: newSrsCards,
      },
    },
  };
};

/**
 * Recalculate stats (wordsLearned, wordsInReview, wordsMastered)
 */
export const recalculateStats = (
  progress: UserProgress,
  langCode: string
): UserProgress => {
  const langProgress = getLanguageProgress(progress, langCode);
  const cards = Object.values(langProgress.srsCards);

  const wordsLearned = cards.filter((c) => c.repetitions > 0).length;
  const wordsInReview = cards.filter((c) => c.stage === 'review' || c.stage === 'learning').length;
  const wordsMastered = cards.filter((c) => c.stage === 'mastered').length;

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: {
        ...langProgress,
        wordsLearned,
        wordsInReview,
        wordsMastered,
      },
    },
  };
};
