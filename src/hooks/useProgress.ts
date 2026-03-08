import { useState, useCallback } from 'react';
import type { UserProgress, LanguageProgress } from '../types';
import {
  loadProgress,
  saveProgress,
  getLanguageProgress,
  initializeLanguage,
  awardXP,
  updateStreak,
  unlockNewVocab,
  recalculateStats,
} from '../utils/progress';
import { updateSRSCard, boolToQuality } from '../utils/spacedRepetition';

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  const updateProgress = useCallback((newProgress: UserProgress) => {
    setProgress(newProgress);
    saveProgress(newProgress);
  }, []);

  const selectLanguage = useCallback(
    (langCode: string) => {
      let updated = { ...progress, selectedLanguage: langCode };
      updated = initializeLanguage(updated, langCode);
      updateProgress(updated);
    },
    [progress, updateProgress]
  );

  const getLangProgress = useCallback(
    (langCode?: string): LanguageProgress => {
      const code = langCode ?? progress.selectedLanguage;
      return getLanguageProgress(progress, code);
    },
    [progress]
  );

  const recordAnswer = useCallback(
    (
      langCode: string,
      vocabId: string,
      correct: boolean,
      timeTakenMs: number,
      xpReward = 10
    ) => {
      const langProgress = getLanguageProgress(progress, langCode);
      const existingCard = langProgress.srsCards[vocabId];
      if (!existingCard) return;

      const quality = boolToQuality(correct, timeTakenMs);
      const updatedCard = updateSRSCard(existingCard, quality);

      let updated = {
        ...progress,
        languages: {
          ...progress.languages,
          [langCode]: {
            ...langProgress,
            srsCards: {
              ...langProgress.srsCards,
              [vocabId]: updatedCard,
            },
          },
        },
      };

      if (correct) {
        updated = awardXP(updated, langCode, xpReward);
      }

      updated = updateStreak(updated, langCode);
      updated = unlockNewVocab(updated, langCode);
      updated = recalculateStats(updated, langCode);

      updateProgress(updated);
    },
    [progress, updateProgress]
  );

  const resetLanguage = useCallback(
    (langCode: string) => {
      const updated = {
        ...progress,
        languages: {
          ...progress.languages,
          [langCode]: undefined as unknown as LanguageProgress,
        },
      };
      // Remove the key
      delete updated.languages[langCode];
      const reinitialized = initializeLanguage(updated, langCode);
      updateProgress(reinitialized);
    },
    [progress, updateProgress]
  );

  return {
    progress,
    selectLanguage,
    getLangProgress,
    recordAnswer,
    resetLanguage,
    selectedLanguage: progress.selectedLanguage,
  };
};
