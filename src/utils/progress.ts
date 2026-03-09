import type { UserProgress, LanguageProgress } from '../types';
import { getVocabForLanguage } from '../data/vocabIndex';
import { createNewSRSCard } from './spacedRepetition';

const STORAGE_KEY = 'lingu_progress';
const BACKUP_KEYS = ['lingu_progress_backup_a', 'lingu_progress_backup_b'] as const;
const SCHEMA_VERSION = 2;

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
  totalAnswers: 0,
  correctAnswers: 0,
  averageResponseMs: 0,
  bestStreak: 0,
});

const buildDefaultProgress = (): UserProgress => ({
  languages: {},
  selectedLanguage: 'es',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  schemaVersion: SCHEMA_VERSION,
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const coerceLanguageProgress = (langCode: string, raw: unknown): LanguageProgress => {
  const defaults = DEFAULT_LANGUAGE_PROGRESS(langCode);
  if (!isObject(raw)) return defaults;

  const unlocked = Array.isArray(raw.unlockedVocab)
    ? raw.unlockedVocab.filter((id): id is string => typeof id === 'string')
    : defaults.unlockedVocab;

  const srsCards = isObject(raw.srsCards)
    ? (raw.srsCards as LanguageProgress['srsCards'])
    : defaults.srsCards;

  return {
    ...defaults,
    ...raw,
    languageCode: langCode,
    unlockedVocab: unlocked,
    srsCards,
    totalAnswers: typeof raw.totalAnswers === 'number' ? raw.totalAnswers : defaults.totalAnswers,
    correctAnswers: typeof raw.correctAnswers === 'number' ? raw.correctAnswers : defaults.correctAnswers,
    averageResponseMs:
      typeof raw.averageResponseMs === 'number' ? raw.averageResponseMs : defaults.averageResponseMs,
    bestStreak: typeof raw.bestStreak === 'number' ? raw.bestStreak : defaults.bestStreak,
  };
};

const coerceProgress = (raw: unknown): UserProgress | null => {
  if (!isObject(raw) || !isObject(raw.languages)) return null;

  const languages: UserProgress['languages'] = {};
  for (const [langCode, value] of Object.entries(raw.languages)) {
    languages[langCode] = coerceLanguageProgress(langCode, value);
  }

  return {
    languages,
    selectedLanguage: typeof raw.selectedLanguage === 'string' ? raw.selectedLanguage : 'es',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1,
  };
};

const migrateProgress = (progress: UserProgress): UserProgress => {
  let migrated: UserProgress = {
    ...progress,
    schemaVersion: SCHEMA_VERSION,
  };

  for (const langCode of Object.keys(migrated.languages)) {
    migrated = initializeLanguage(migrated, langCode);
    const langProgress = getLanguageProgress(migrated, langCode);
    const cardMap = { ...langProgress.srsCards };
    let changed = false;

    for (const vocabId of langProgress.unlockedVocab) {
      if (!cardMap[vocabId]) {
        cardMap[vocabId] = createNewSRSCard(vocabId);
        changed = true;
      }
    }

    if (changed) {
      migrated = {
        ...migrated,
        languages: {
          ...migrated.languages,
          [langCode]: {
            ...langProgress,
            srsCards: cardMap,
          },
        },
      };
    }

    migrated = recalculateStats(migrated, langCode);
  }

  return migrated;
};

export const loadProgress = (): UserProgress => {
  const candidates = [STORAGE_KEY, ...BACKUP_KEYS];

  try {
    for (const key of candidates) {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const parsed = coerceProgress(JSON.parse(stored));
      if (!parsed) continue;

      const migrated = migrateProgress(parsed);
      saveProgress(migrated);
      return migrated;
    }
  } catch {
    // ignore parse errors
  }

  return buildDefaultProgress();
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    const snapshot: UserProgress = {
      ...progress,
      updatedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };
    const serialized = JSON.stringify(snapshot);

    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const index = Date.now() % BACKUP_KEYS.length;
      localStorage.setItem(BACKUP_KEYS[index], existing);
    }

    localStorage.setItem(STORAGE_KEY, serialized);
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
        bestStreak: Math.max(langProgress.bestStreak, streak),
        lastStudiedDate: today,
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

  const recentAccuracy =
    langProgress.totalAnswers > 0
      ? langProgress.correctAnswers / langProgress.totalAnswers
      : 0.5;

  const unlockPace = recentAccuracy >= 0.85 ? 8 : recentAccuracy >= 0.7 ? 6 : 4;

  // Unlock new words based on mastered count
  const unlockThreshold = Math.floor(masteredCount / 5) + 1; // Unlock 1 batch per 5 mastered
  const maxDifficulty = Math.min(5, Math.ceil(unlockThreshold / 2) + (recentAccuracy >= 0.9 ? 1 : 0));

  const eligibleVocab = vocab.filter(
    (v) => !currentUnlocked.has(v.id) && v.difficulty <= maxDifficulty
  );

  if (eligibleVocab.length === 0) return progress;

  const newVocab = eligibleVocab.slice(0, unlockPace);
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

export const recordAnswerStats = (
  progress: UserProgress,
  langCode: string,
  correct: boolean,
  timeTakenMs: number
): UserProgress => {
  const langProgress = getLanguageProgress(progress, langCode);
  const totalAnswers = langProgress.totalAnswers + 1;
  const correctAnswers = langProgress.correctAnswers + (correct ? 1 : 0);
  const cumulativeMs = langProgress.averageResponseMs * langProgress.totalAnswers + Math.max(0, timeTakenMs);
  const averageResponseMs = Math.round(cumulativeMs / totalAnswers);

  return {
    ...progress,
    languages: {
      ...progress.languages,
      [langCode]: {
        ...langProgress,
        totalAnswers,
        correctAnswers,
        averageResponseMs,
        completedActivities: langProgress.completedActivities + 1,
      },
    },
  };
};
