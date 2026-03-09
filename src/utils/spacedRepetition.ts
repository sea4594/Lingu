/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import type { SRSCard } from '../types';

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

// Quality ratings: 0-5
// 5 - perfect response
// 4 - correct response after a hesitation
// 3 - correct response recalled with serious difficulty
// 2 - incorrect response; where the correct one seemed easy to recall
// 1 - incorrect response; the correct one remembered
// 0 - complete blackout

export const createNewSRSCard = (vocabId: string): SRSCard => ({
  vocabId,
  interval: 0,
  easeFactor: INITIAL_EASE_FACTOR,
  repetitions: 0,
  nextReview: Date.now(),
  lastReview: Date.now(),
  stage: 'new',
});

/**
 * Update SRS card based on quality of recall (0-5)
 */
export const updateSRSCard = (card: SRSCard, quality: number): SRSCard => {
  const now = Date.now();
  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    // Failed - reset repetitions but keep ease factor decrease
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  const newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  let stage: SRSCard['stage'];
  if (repetitions === 0) {
    stage = 'learning';
  } else if (repetitions < 3) {
    stage = 'learning';
  } else if (interval >= 21) {
    stage = 'mastered';
  } else {
    stage = 'review';
  }

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lastReview: now,
    stage,
  };
};

/**
 * Convert a boolean correct/incorrect result to a quality rating
 */
export const boolToQuality = (correct: boolean, timeTakenMs: number): number => {
  if (!correct) return 1;
  // Fast correct answers get higher quality
  if (timeTakenMs < 3000) return 5;
  if (timeTakenMs < 6000) return 4;
  return 3;
};

/**
 * Get cards due for review today
 */
export const getDueCards = (cards: Record<string, SRSCard>): SRSCard[] => {
  const now = Date.now();
  return Object.values(cards).filter((card) => card.nextReview <= now);
};

/**
 * Get new cards (never reviewed) up to a limit
 */
export const getNewCards = (
  cards: Record<string, SRSCard>,
  allVocabIds: string[],
  limit: number
): string[] => {
  const knownIds = new Set(Object.keys(cards));
  const newIds = allVocabIds.filter((id) => !knownIds.has(id));
  return newIds.slice(0, limit);
};

/**
 * Sort cards by priority for review session
 * Due cards first, then new cards, sorted by urgency
 */
export const getReviewQueue = (
  cards: Record<string, SRSCard>,
  allVocabIds: string[],
  maxNew = 10,
  maxReview = 20
): string[] => {
  const now = Date.now();
  const dueCards = Object.values(cards)
    .filter((c) => c.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, maxReview)
    .map((c) => c.vocabId);

  const upcomingCards = Object.values(cards)
    .filter((c) => c.nextReview > now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, Math.max(0, maxReview - dueCards.length))
    .map((c) => c.vocabId);

  const newIds = getNewCards(cards, allVocabIds, maxNew);
  return [...dueCards, ...upcomingCards, ...newIds];
};
