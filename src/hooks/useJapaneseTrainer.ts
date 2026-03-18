import { useCallback, useMemo, useState } from 'react';
import {
  GROUP_BY_ID,
  JAPANESE_VOCAB_BY_ID,
  JAPANESE_VOCAB_GROUPS,
  JAPANESE_VOCABULARY,
} from '../data/japaneseVocabulary';
import type {
  FlashcardSettings,
  JapaneseTrainerState,
  JapaneseVocabEntry,
  JapaneseVocabGroup,
  PlacementQuestion,
  WordLearningStats,
} from '../types';

const STORAGE_KEY = 'lingu-japanese-trainer-v3';

const DEFAULT_SETTINGS: FlashcardSettings = {
  direction: 'en-to-ja',
  showJapaneseOnBack: true,
  showRomajiOnBack: true,
  showContextOnBack: true,
};

const DEFAULT_STATE: JapaneseTrainerState = {
  placementDone: false,
  estimatedRank: 1,
  activeGroupIds: [],
  activeWordIds: [],
  selectedLanguage: 'japanese',
  groupCursor: 0,
  settings: DEFAULT_SETTINGS,
  statsByWordId: {},
  updatedAt: new Date().toISOString(),
};

function loadState(): JapaneseTrainerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as JapaneseTrainerState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
      statsByWordId: parsed.statsByWordId ?? {},
      activeGroupIds: parsed.activeGroupIds ?? [],
      activeWordIds: parsed.activeWordIds ?? [],
      selectedLanguage: 'japanese',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(next: JapaneseTrainerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function toWordStats(wordId: string, now: number): WordLearningStats {
  return {
    wordId,
    repetitions: 0,
    correct: 0,
    incorrect: 0,
    lastSeenAt: now,
    nextDueAt: now,
    intervalDays: 0,
    comprehension: 25,
  };
}

function applyDecay(stats: WordLearningStats, now: number): number {
  const elapsedDays = Math.max(0, (now - stats.lastSeenAt) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.round(stats.comprehension - elapsedDays * 1.35));
}

function createPlacementQuestions(): PlacementQuestion[] {
  const questionCount = 18;
  const stride = Math.floor(JAPANESE_VOCABULARY.length / questionCount);
  const questions: PlacementQuestion[] = [];

  for (let idx = 0; idx < questionCount; idx += 1) {
    const entry = JAPANESE_VOCABULARY[Math.min(JAPANESE_VOCABULARY.length - 1, idx * stride + Math.floor(stride / 2))];
    questions.push({
      wordId: entry.id,
      prompt: entry.japanese,
      romaji: entry.romaji,
      english: entry.english,
      rank: entry.rank,
    });
  }

  return questions;
}

const PLACEMENT_QUESTIONS = createPlacementQuestions();

export const useJapaneseTrainer = () => {
  const [state, setState] = useState<JapaneseTrainerState>(() => loadState());

  const update = useCallback((updater: (prev: JapaneseTrainerState) => JapaneseTrainerState) => {
    setState((prev) => {
      const next = updater(prev);
      next.updatedAt = new Date().toISOString();
      saveState(next);
      return next;
    });
  }, []);

  const activateGroup = useCallback(
    (prev: JapaneseTrainerState, group: JapaneseVocabGroup): JapaneseTrainerState => {
      const now = Date.now();
      const activeGroupIds = prev.activeGroupIds.includes(group.id)
        ? prev.activeGroupIds
        : [...prev.activeGroupIds, group.id];

      const knownWords = new Set(prev.activeWordIds);
      const statsByWordId = { ...prev.statsByWordId };

      group.wordIds.forEach((wordId) => {
        knownWords.add(wordId);
        if (!statsByWordId[wordId]) {
          statsByWordId[wordId] = toWordStats(wordId, now);
        }
      });

      return {
        ...prev,
        activeGroupIds,
        activeWordIds: Array.from(knownWords),
        statsByWordId,
      };
    },
    [],
  );

  const finishPlacement = useCallback(
    (answers: Record<string, boolean>) => {
      update((prev) => {
        const weighted = PLACEMENT_QUESTIONS.reduce(
          (acc, question) => {
            const known = answers[question.wordId] ?? false;
            return {
              knownWeight: acc.knownWeight + (known ? question.rank : 0),
              totalWeight: acc.totalWeight + question.rank,
            };
          },
          { knownWeight: 0, totalWeight: 0 },
        );

        const ratio = weighted.totalWeight === 0 ? 0 : weighted.knownWeight / weighted.totalWeight;
        const estimatedRank = Math.max(1, Math.floor(ratio * JAPANESE_VOCABULARY.length));

        const startingGroupIndex = Math.min(
          JAPANESE_VOCAB_GROUPS.length - 1,
          Math.floor((estimatedRank / JAPANESE_VOCABULARY.length) * JAPANESE_VOCAB_GROUPS.length),
        );

        let nextState: JapaneseTrainerState = {
          ...prev,
          placementDone: true,
          estimatedRank,
          groupCursor: startingGroupIndex,
          activeGroupIds: [],
          activeWordIds: [],
          statsByWordId: {},
        };

        for (let offset = 0; offset < 4; offset += 1) {
          const group = JAPANESE_VOCAB_GROUPS[startingGroupIndex + offset];
          if (group) {
            nextState = activateGroup(nextState, group);
          }
        }

        return {
          ...nextState,
          groupCursor: startingGroupIndex + 4,
        };
      });
    },
    [activateGroup, update],
  );

  const addNextGroup = useCallback(() => {
    update((prev) => {
      const group = JAPANESE_VOCAB_GROUPS[prev.groupCursor];
      if (!group) {
        return prev;
      }

      const activated = activateGroup(prev, group);
      return {
        ...activated,
        groupCursor: prev.groupCursor + 1,
      };
    });
  }, [activateGroup, update]);

  const addGroups = useCallback(
    (groupIds: string[]) => {
      update((prev) => {
        let next = { ...prev };
        groupIds.forEach((groupId) => {
          const group = GROUP_BY_ID[groupId];
          if (group) {
            next = activateGroup(next, group);
          }
        });
        return next;
      });
    },
    [activateGroup, update],
  );

  const addWords = useCallback((wordIds: string[]) => {
    update((prev) => {
      const now = Date.now();
      const nextWordSet = new Set(prev.activeWordIds);
      const statsByWordId = { ...prev.statsByWordId };

      wordIds.forEach((wordId) => {
        if (!JAPANESE_VOCAB_BY_ID[wordId]) {
          return;
        }

        nextWordSet.add(wordId);
        if (!statsByWordId[wordId]) {
          statsByWordId[wordId] = toWordStats(wordId, now);
        }
      });

      return {
        ...prev,
        activeWordIds: Array.from(nextWordSet),
        statsByWordId,
      };
    });
  }, [update]);

  const removeGroup = useCallback((groupId: string) => {
    update((prev) => {
      const group = GROUP_BY_ID[groupId];
      if (!group) {
        return prev;
      }

      const activeGroupIds = prev.activeGroupIds.filter((id) => id !== groupId);
      const activeGroupWordIds = new Set(
        activeGroupIds.flatMap((id) => GROUP_BY_ID[id]?.wordIds ?? []),
      );

      const activeWordIds = prev.activeWordIds.filter((wordId) => activeGroupWordIds.has(wordId));
      return {
        ...prev,
        activeGroupIds,
        activeWordIds,
      };
    });
  }, [update]);

  const removeWord = useCallback((wordId: string) => {
    update((prev) => ({
      ...prev,
      activeWordIds: prev.activeWordIds.filter((id) => id !== wordId),
    }));
  }, [update]);

  const updateSettings = useCallback((settingsPatch: Partial<FlashcardSettings>) => {
    update((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsPatch,
      },
    }));
  }, [update]);

  const recordCardResult = useCallback((wordId: string, correct: boolean) => {
    update((prev) => {
      const now = Date.now();
      const oldStats = prev.statsByWordId[wordId] ?? toWordStats(wordId, now);
      const decayedBeforeAttempt = applyDecay(oldStats, now);

      const nextCorrect = oldStats.correct + (correct ? 1 : 0);
      const nextIncorrect = oldStats.incorrect + (correct ? 0 : 1);
      const attempts = nextCorrect + nextIncorrect;
      const accuracy = attempts > 0 ? nextCorrect / attempts : 0;

      const nextInterval = correct
        ? Math.max(0.5, (oldStats.intervalDays || 0.5) * (1.55 + accuracy * 0.5))
        : 0.2;

      const comprehension = Math.min(
        100,
        Math.max(0, decayedBeforeAttempt + (correct ? 8 : -18)),
      );

      const nextStats: WordLearningStats = {
        ...oldStats,
        repetitions: oldStats.repetitions + 1,
        correct: nextCorrect,
        incorrect: nextIncorrect,
        intervalDays: nextInterval,
        lastSeenAt: now,
        nextDueAt: now + nextInterval * 24 * 60 * 60 * 1000,
        comprehension,
      };

      return {
        ...prev,
        statsByWordId: {
          ...prev.statsByWordId,
          [wordId]: nextStats,
        },
      };
    });
  }, [update]);

  const activeEntries = useMemo(
    () => state.activeWordIds
      .map((wordId) => JAPANESE_VOCAB_BY_ID[wordId])
      .filter((entry): entry is JapaneseVocabEntry => Boolean(entry)),
    [state.activeWordIds],
  );

  const activeGroups = useMemo(
    () => state.activeGroupIds
      .map((groupId) => GROUP_BY_ID[groupId])
      .filter((group): group is JapaneseVocabGroup => Boolean(group)),
    [state.activeGroupIds],
  );

  const upcomingGroups = useMemo(
    () => JAPANESE_VOCAB_GROUPS.filter((group) => !state.activeGroupIds.includes(group.id)).slice(0, 60),
    [state.activeGroupIds],
  );

  const comprehensionForWord = useCallback((wordId: string): number => {
    const stats = state.statsByWordId[wordId];
    if (!stats) {
      return 0;
    }

    return applyDecay(stats, Date.now());
  }, [state.statsByWordId]);

  const pickNextCard = useCallback((excludeWordIds: Set<string> = new Set()): JapaneseVocabEntry | null => {
    const now = Date.now();
    const candidates = activeEntries.filter((entry) => !excludeWordIds.has(entry.id));

    if (candidates.length === 0) {
      return null;
    }

    const scored = candidates.map((entry) => {
      const stats = state.statsByWordId[entry.id] ?? toWordStats(entry.id, now);
      const comprehension = applyDecay(stats, now);
      const dueMinutes = (stats.nextDueAt - now) / (60 * 1000);
      const dueBoost = dueMinutes <= 0 ? 2.2 : 1 / Math.max(1, dueMinutes / 60);
      const newWordBoost = stats.repetitions === 0 ? 1.8 : 0;
      const weaknessBoost = (100 - comprehension) / 45;
      const randomness = Math.random() * 0.9;

      return {
        entry,
        score: dueBoost + newWordBoost + weaknessBoost + randomness,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topWindow = scored.slice(0, Math.min(7, scored.length));
    return topWindow[Math.floor(Math.random() * topWindow.length)]?.entry ?? scored[0].entry;
  }, [activeEntries, state.statsByWordId]);

  const totalAttempts = useMemo(
    () => Object.values(state.statsByWordId).reduce((sum, stat) => sum + stat.repetitions, 0),
    [state.statsByWordId],
  );

  const totalAccuracy = useMemo(() => {
    const stats = Object.values(state.statsByWordId);
    const correct = stats.reduce((sum, stat) => sum + stat.correct, 0);
    const attempts = stats.reduce((sum, stat) => sum + stat.correct + stat.incorrect, 0);
    return attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  }, [state.statsByWordId]);

  return {
    state,
    placementQuestions: PLACEMENT_QUESTIONS,
    finishPlacement,
    addNextGroup,
    addGroups,
    addWords,
    removeGroup,
    removeWord,
    updateSettings,
    recordCardResult,
    activeEntries,
    activeGroups,
    upcomingGroups,
    pickNextCard,
    comprehensionForWord,
    totalAttempts,
    totalAccuracy,
  };
};
