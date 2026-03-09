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
  recordAnswerStats,
} from '../utils/progress';
import { updateSRSCard, boolToQuality } from '../utils/spacedRepetition';

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  const updateProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const selectLanguage = useCallback(
    (langCode: string) => {
      updateProgress((prev) => {
        let updated = { ...prev, selectedLanguage: langCode };
        updated = initializeLanguage(updated, langCode);
        return updated;
      });
    },
    [updateProgress]
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
      updateProgress((prev) => {
        const ensured = initializeLanguage(prev, langCode);
        const langProgress = getLanguageProgress(ensured, langCode);
        const existingCard = langProgress.srsCards[vocabId];
        if (!existingCard) return ensured;

        const quality = boolToQuality(correct, timeTakenMs);
        const updatedCard = updateSRSCard(existingCard, quality);

        let updated = {
          ...ensured,
          languages: {
            ...ensured.languages,
            [langCode]: {
              ...langProgress,
              srsCards: {
                ...langProgress.srsCards,
                [vocabId]: updatedCard,
              },
            },
          },
        };

        updated = recordAnswerStats(updated, langCode, correct, timeTakenMs);
        if (correct) {
          updated = awardXP(updated, langCode, xpReward);
        }

        updated = updateStreak(updated, langCode);
        updated = unlockNewVocab(updated, langCode);
        updated = recalculateStats(updated, langCode);
        return updated;
      });
    },
    [updateProgress]
  );

  const resetLanguage = useCallback(
    (langCode: string) => {
      updateProgress((prev) => {
        const updated = {
          ...prev,
          languages: {
            ...prev.languages,
            [langCode]: undefined as unknown as LanguageProgress,
          },
        };
        delete updated.languages[langCode];
        return initializeLanguage(updated, langCode);
      });
    },
    [updateProgress]
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
