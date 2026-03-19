import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import { Settings, Volume2, X } from 'lucide-react';
import {
  JAPANESE_VOCAB_BY_ID,
  JAPANESE_VOCAB_GROUPS,
  JAPANESE_VOCAB_SIZE,
} from './data/japaneseVocabulary';
import { useJapaneseTrainer } from './hooks/useJapaneseTrainer';
import { useJapaneseTTS } from './hooks/useJapaneseTTS';
import { useSpeech } from './hooks/useSpeech';
import { levenshtein, stripAccents } from './utils/fuzzyMatch';

type AppView = 'flashcards' | 'my-vocab' | 'entire-cache' | 'settings';
type ListView = 'my-vocab' | 'entire-cache';
type FlashcardMode = 'flip' | 'speak-japanese';
type StudyMode = 'all' | 'group';

type SpeechResult = {
  transcript: string;
  correct: boolean;
  confidence: number;
  canOverride: boolean;
  overridden?: boolean;
};

const SWIPE_THRESHOLD_PX = 90;
const SWIPE_COMMIT_DURATION_MS = 210;
const MAX_DRAG_OFFSET_PX = 180;
const MIC_AUTO_START_KEY = 'lingu-japanese-mic-primed-v1';

const normalizeSpeechInput = (value: string): string =>
  stripAccents(value)
    .toLowerCase()
    .replace(/[\s.,!?;:'"()[\]{}<>@#$%^&*+=|~`\\/_-]/g, '')
    .trim();

const similarity = (left: string, right: string): number => {
  const a = normalizeSpeechInput(left);
  const b = normalizeSpeechInput(right);
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
};

const shuffleIds = (ids: string[]): string[] => {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const isIOSLikeDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const touchPoints = navigator.maxTouchPoints || 0;

  return /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1);
};

function App() {
  const {
    state,
    placementQuestions,
    finishPlacement,
    addNextGroup,
    addGroups,
    addWords,
    removeGroup,
    removeWord,
    updateSettings,
    recordCardResult,
    overrideLastIncorrectAsCorrect,
    activeEntries,
    activeGroups,
    upcomingGroups,
    pickNextCard,
    comprehensionForWord,
    totalAttempts,
    totalAccuracy,
  } = useJapaneseTrainer();
  const { speak, isSpeaking, providerLabel, hasPremiumVoice } = useJapaneseTTS();
  const { recognize, stopRecognition, isRecognitionSupported } = useSpeech();

  const [view, setView] = useState<AppView>('my-vocab');
  const [lastListView, setLastListView] = useState<ListView>('my-vocab');
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [, setStudyGroupId] = useState<string | null>(null);
  const [groupSessionWordIds, setGroupSessionWordIds] = useState<string[]>([]);
  const [groupRoundRemainingIds, setGroupRoundRemainingIds] = useState<string[]>([]);
  const [expandedMyVocabGroupId, setExpandedMyVocabGroupId] = useState<string | null>(null);
  const [expandedCacheGroupId, setExpandedCacheGroupId] = useState<string | null>(null);

  const [isTakingPlacementQuiz, setIsTakingPlacementQuiz] = useState(false);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, boolean>>({});
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>('flip');
  const [flipped, setFlipped] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isSwipeSettling, setIsSwipeSettling] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isMicArmed, setIsMicArmed] = useState(true);
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null);
  const [hasMicPrimed, setHasMicPrimed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(MIC_AUTO_START_KEY) === '1';
    } catch {
      return false;
    }
  });
  const autoListenedCardIdRef = useRef<string | null>(null);
  const recognitionAttemptInFlightRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const isAnimatingSwipeRef = useRef(false);

  const [showPicker, setShowPicker] = useState(false);
  const [checkedGroupIds, setCheckedGroupIds] = useState<Record<string, boolean>>({});
  const [checkedWordIds, setCheckedWordIds] = useState<Record<string, boolean>>({});
  const isIOSMicMode = useMemo(() => isIOSLikeDevice(), []);

  const studyPoolEntries = useMemo(() => {
    if (studyMode !== 'group') {
      return activeEntries;
    }

    return groupSessionWordIds
      .map((wordId) => JAPANESE_VOCAB_BY_ID[wordId])
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [activeEntries, groupSessionWordIds, studyMode]);

  const fallbackCard = studyPoolEntries[0] ?? null;

  const currentCard = useMemo(() => {
    if (historyIds.length === 0) {
      return fallbackCard;
    }
    const wordId = historyIds[historyIndex];
    return JAPANESE_VOCAB_BY_ID[wordId] ?? fallbackCard;
  }, [fallbackCard, historyIds, historyIndex]);

  const speakJapanese = (text: string) => {
    void speak(text, {
      rate: state.settings.ttsRate,
      style: state.settings.ttsStyle,
    });
  };

  const beginFlashcards = useCallback((nextMode: StudyMode, wordIds: string[], groupId: string | null = null) => {
    if (wordIds.length === 0) {
      return;
    }

    setStudyMode(nextMode);
    setStudyGroupId(groupId);

    if (nextMode === 'group') {
      const shuffled = shuffleIds(wordIds);
      const firstId = shuffled[0];
      setGroupSessionWordIds(wordIds);
      setGroupRoundRemainingIds(shuffled.slice(1));
      setHistoryIds(firstId ? [firstId] : []);
    } else {
      setGroupSessionWordIds([]);
      setGroupRoundRemainingIds([]);
      const first = pickNextCard() ?? activeEntries[0] ?? null;
      setHistoryIds(first ? [first.id] : []);
    }

    setHistoryIndex(0);
    setFlipped(false);
    setSpeechResult(null);
    setIsMicArmed(true);
    autoListenedCardIdRef.current = null;
    setView('flashcards');
  }, [activeEntries, pickNextCard]);

  const startStudyAll = useCallback(() => {
    beginFlashcards('all', activeEntries.map((entry) => entry.id));
  }, [activeEntries, beginFlashcards]);

  const startStudyGroup = useCallback((groupId: string) => {
    const group = activeGroups.find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    const groupWordIds = group.wordIds.filter((wordId) => state.activeWordIds.includes(wordId));
    beginFlashcards('group', groupWordIds, groupId);
  }, [activeGroups, beginFlashcards, state.activeWordIds]);

  const startSpeechCheck = useCallback(async () => {
    if (
      !currentCard ||
      !isRecognitionSupported ||
      isRecognizing ||
      isAnimatingSwipeRef.current ||
      recognitionAttemptInFlightRef.current
    ) {
      return;
    }

    recognitionAttemptInFlightRef.current = true;
    setSpeechResult(null);
    setIsRecognizing(true);

    try {
      const transcript = await recognize('ja-JP', 10000);
      const normalizedTranscript = normalizeSpeechInput(transcript);
      if (!normalizedTranscript) {
        setSpeechResult(null);
        return;
      }

      const japaneseScore = similarity(transcript, currentCard.japanese);
      const romajiScore = similarity(transcript, currentCard.romaji);
      const bestScore = Math.max(japaneseScore, romajiScore);
      const correct = bestScore >= 0.72;

      setSpeechResult({
        transcript,
        correct,
        confidence: Math.round(bestScore * 100),
        canOverride: !correct,
      });

      recordCardResult(currentCard.id, correct);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      const manuallyStopped = message.includes('manually stopped');
      if (manuallyStopped) {
        return;
      }

      const noSpeech = message.includes('timed out') || message.includes('no-speech');
      if (noSpeech) {
        setSpeechResult(null);
        return;
      }

      setSpeechResult(null);
    } finally {
      recognitionAttemptInFlightRef.current = false;
      setIsRecognizing(false);
    }
  }, [currentCard, isRecognitionSupported, isRecognizing, recognize, recordCardResult]);

  useEffect(() => {
    if (
      view !== 'flashcards' ||
      flashcardMode !== 'speak-japanese' ||
      isIOSMicMode ||
      !isMicArmed ||
      !currentCard ||
      !isRecognitionSupported ||
      isRecognizing ||
      flipped ||
      !hasMicPrimed
    ) {
      return;
    }

    if (autoListenedCardIdRef.current === currentCard.id) {
      return;
    }

    autoListenedCardIdRef.current = currentCard.id;
    const timer = window.setTimeout(() => {
      void startSpeechCheck();
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    currentCard,
    flashcardMode,
    isIOSMicMode,
    isMicArmed,
    isRecognitionSupported,
    isRecognizing,
    flipped,
    hasMicPrimed,
    startSpeechCheck,
    view,
  ]);

  const handlePlacementAnswer = (known: boolean) => {
    const question = placementQuestions[placementIndex];
    if (!question) {
      return;
    }

    const nextAnswers = {
      ...placementAnswers,
      [question.wordId]: known,
    };

    if (placementIndex === placementQuestions.length - 1) {
      finishPlacement(nextAnswers);
      setPlacementAnswers({});
      setPlacementIndex(0);
      setIsTakingPlacementQuiz(false);
      return;
    }

    setPlacementAnswers(nextAnswers);
    setPlacementIndex((prev) => prev + 1);
  };

  const moveCard = (direction: 'next' | 'prev') => {
    isAnimatingSwipeRef.current = false;
    setIsSwipeSettling(false);
    setDragOffsetX(0);

    if (isRecognizing) {
      stopRecognition();
      recognitionAttemptInFlightRef.current = false;
      setIsRecognizing(false);
    }

    if (historyIds.length === 0 && fallbackCard) {
      setHistoryIds([fallbackCard.id]);
      setHistoryIndex(0);
      setFlipped(false);
      setSpeechResult(null);
      autoListenedCardIdRef.current = null;
      if (direction === 'prev') {
        return;
      }
    }

    if (direction === 'prev') {
      if (historyIndex > 0) {
        setHistoryIndex((prev) => prev - 1);
        setFlipped(false);
        setSpeechResult(null);
        autoListenedCardIdRef.current = null;
      }
      return;
    }

    if (historyIndex < historyIds.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setFlipped(false);
      setSpeechResult(null);
      autoListenedCardIdRef.current = null;
      return;
    }

    let nextCard = null;

    if (studyMode === 'group') {
      if (groupSessionWordIds.length === 0) {
        return;
      }

      const pool = groupRoundRemainingIds.length > 0
        ? groupRoundRemainingIds
        : shuffleIds(groupSessionWordIds);
      const [nextId, ...rest] = pool;
      setGroupRoundRemainingIds(rest);
      if (nextId) {
        nextCard = JAPANESE_VOCAB_BY_ID[nextId] ?? null;
      }
    } else {
      const recent = new Set(historyIds.slice(Math.max(0, historyIds.length - 4)));
      nextCard = pickNextCard(recent) ?? pickNextCard();
    }

    if (!nextCard) {
      return;
    }

    setHistoryIds((prev) => [...prev, nextCard.id]);
    setHistoryIndex((prev) => prev + 1);
    setFlipped(false);
    setSpeechResult(null);
    autoListenedCardIdRef.current = null;
  };

  const triggerSwipeNavigation = useCallback((direction: 'next' | 'prev') => {
    if (isAnimatingSwipeRef.current) {
      return;
    }

    isAnimatingSwipeRef.current = true;
    setIsSwipeSettling(true);

    const targetOffset = direction === 'next' ? -window.innerWidth : window.innerWidth;
    setDragOffsetX(targetOffset);

    window.setTimeout(() => {
      moveCard(direction);
    }, SWIPE_COMMIT_DURATION_MS);
  }, [moveCard]);

  const removeCurrentCardFromGroupSession = () => {
    if (studyMode !== 'group' || !currentCard) {
      return;
    }

    const removeId = currentCard.id;
    const remainingWordIds = groupSessionWordIds.filter((wordId) => wordId !== removeId);
    const nextRound = groupRoundRemainingIds.filter((wordId) => wordId !== removeId);
    const nextHistory = historyIds.filter((wordId) => wordId !== removeId);

    setGroupSessionWordIds(remainingWordIds);
    setGroupRoundRemainingIds(nextRound);

    if (remainingWordIds.length === 0) {
      setHistoryIds([]);
      setHistoryIndex(0);
      return;
    }

    if (nextHistory.length > 0) {
      setHistoryIds(nextHistory);
      setHistoryIndex((prev) => Math.min(prev, nextHistory.length - 1));
      return;
    }

    const refill = nextRound.length > 0 ? nextRound : shuffleIds(remainingWordIds);
    const [nextId, ...rest] = refill;
    setGroupRoundRemainingIds(rest);
    setHistoryIds(nextId ? [nextId] : []);
    setHistoryIndex(0);
  };

  const clampDragOffset = (value: number) => {
    return Math.max(-MAX_DRAG_OFFSET_PX, Math.min(MAX_DRAG_OFFSET_PX, value));
  };

  const handleSwipeStart = (clientX: number) => {
    if (isAnimatingSwipeRef.current) {
      return;
    }

    dragStartXRef.current = clientX;
    setIsDraggingCard(true);
    setIsSwipeSettling(false);
  };

  const handleSwipeMove = (clientX: number) => {
    if (dragStartXRef.current === null || isAnimatingSwipeRef.current) {
      return;
    }

    const delta = clientX - dragStartXRef.current;
    setDragOffsetX(clampDragOffset(delta));
  };

  const handleSwipeEnd = () => {
    if (dragStartXRef.current === null) {
      return;
    }

    const finalOffset = dragOffsetX;
    dragStartXRef.current = null;
    setIsDraggingCard(false);

    if (finalOffset > SWIPE_THRESHOLD_PX) {
      triggerSwipeNavigation('prev');
      return;
    }

    if (finalOffset < -SWIPE_THRESHOLD_PX) {
      triggerSwipeNavigation('next');
      return;
    }

    setIsSwipeSettling(true);
    setDragOffsetX(0);
    window.setTimeout(() => {
      setIsSwipeSettling(false);
    }, SWIPE_COMMIT_DURATION_MS);
  };

  const attachSwipeHandlers = {
    onTouchStart: (event: TouchEvent<HTMLElement>) => handleSwipeStart(event.touches[0].clientX),
    onTouchMove: (event: TouchEvent<HTMLElement>) => handleSwipeMove(event.touches[0].clientX),
    onTouchEnd: () => handleSwipeEnd(),
    onTouchCancel: () => handleSwipeEnd(),
    onMouseDown: (event: MouseEvent<HTMLElement>) => handleSwipeStart(event.clientX),
    onMouseMove: (event: MouseEvent<HTMLElement>) => {
      if (!isDraggingCard) {
        return;
      }
      handleSwipeMove(event.clientX);
    },
    onMouseUp: () => handleSwipeEnd(),
    onMouseLeave: () => {
      if (isDraggingCard) {
        handleSwipeEnd();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (flashcardMode === 'flip' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        setFlipped((prev) => !prev);
      }
      if (event.key === 'ArrowLeft') {
        triggerSwipeNavigation('prev');
      }
      if (event.key === 'ArrowRight') {
        triggerSwipeNavigation('next');
      }
    },
  };

  const applyCheckedSelections = () => {
    const selectedGroups = Object.entries(checkedGroupIds)
      .filter(([, checked]) => checked)
      .map(([groupId]) => groupId);
    const selectedWords = Object.entries(checkedWordIds)
      .filter(([, checked]) => checked)
      .map(([wordId]) => wordId);

    if (selectedGroups.length > 0) {
      addGroups(selectedGroups);
    }
    if (selectedWords.length > 0) {
      addWords(selectedWords);
    }

    setCheckedGroupIds({});
    setCheckedWordIds({});
    setShowPicker(false);
  };

  const groupedActiveWords = useMemo(() => {
    return activeGroups.map((group) => {
      const words = group.wordIds
        .filter((id) => state.activeWordIds.includes(id))
        .map((id) => JAPANESE_VOCAB_BY_ID[id])
        .filter(Boolean)
        .sort((a, b) => a.rank - b.rank);

      return {
        group,
        words,
      };
    });
  }, [activeGroups, state.activeWordIds]);

  const pieStyleForPercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    const hue = Math.round((clamped / 100) * 120);
    const color = `hsl(${hue} 72% 45%)`;
    const degrees = clamped * 3.6;
    return {
      background: `conic-gradient(${color} 0deg ${degrees}deg, #ece4d6 ${degrees}deg 360deg)`,
    };
  };

  if (isTakingPlacementQuiz) {
    const question = placementQuestions[placementIndex];
    const progressPercent = Math.round(((placementIndex + 1) / placementQuestions.length) * 100);
    return (
      <div className="app-shell">
        <main className="panel placement-panel">
          <h1>Japanese Vocabulary Trainer</h1>
          <p>
            Quick placement check: tell the app if you recognize each card. This determines the starting point.
          </p>
          <div className="progress-track">
            <div className="progress-value" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="placement-count">Question {placementIndex + 1} / {placementQuestions.length}</div>
          {question ? (
            <section className="placement-card">
              <h2>{question.prompt}</h2>
              <button
                type="button"
                className="tts-button"
                onClick={() => {
                  speakJapanese(question.prompt);
                }}
                disabled={isSpeaking}
              >
                Speak
              </button>
              <p>{question.romaji}</p>
              <p className="placement-hint">Meaning: {question.english}</p>
            </section>
          ) : null}

          <div className="placement-actions">
            <button className="button button-soft" type="button" onClick={() => {
              setIsTakingPlacementQuiz(false);
              setPlacementAnswers({});
              setPlacementIndex(0);
            }}>
              Cancel
            </button>
            <button className="button button-soft" type="button" onClick={() => handlePlacementAnswer(false)}>
              I do not know this
            </button>
            <button className="button" type="button" onClick={() => handlePlacementAnswer(true)}>
              I know this
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {view !== 'settings' && (
        <button
          type="button"
          className="icon-button floating-settings"
          onClick={() => setView('settings')}
          aria-label="Open settings"
        >
          <Settings size={20} />
        </button>
      )}

      {view !== 'settings' && (
        <header className="topbar app-header">
          <h1>Lingu</h1>
        </header>
      )}

      {(view === 'my-vocab' || view === 'entire-cache') && (
        <div className="page-tabs">
          <button
            type="button"
            className={view === 'my-vocab' ? 'tab-button nav-active' : 'tab-button button-soft'}
            onClick={() => {
              setView('my-vocab');
              setLastListView('my-vocab');
            }}
          >
            My Vocab
          </button>
          <button
            type="button"
            className={view === 'entire-cache' ? 'tab-button nav-active' : 'tab-button button-soft'}
            onClick={() => {
              setView('entire-cache');
              setLastListView('entire-cache');
            }}
          >
            Entire Cache
          </button>
        </div>
      )}

      <main className="panel">
        {view === 'flashcards' && (
          <section>
            <div className="flashcard-top-actions">
              <button
                type="button"
                className="button button-soft"
                onClick={() => {
                  setView('my-vocab');
                  setLastListView('my-vocab');
                }}
              >
                Back to My Vocab
              </button>
            </div>

            <div className="flashcard-controls">
              <button
                type="button"
                className={`button button-soft ${flashcardMode === 'flip' ? 'nav-active' : ''}`}
                onClick={() => {
                  setFlashcardMode('flip');
                  setSpeechResult(null);
                  setIsMicArmed(false);
                  if (isRecognizing) {
                    stopRecognition();
                    setIsRecognizing(false);
                  }
                }}
              >
                Flip cards
              </button>
              <button
                type="button"
                className={`button button-soft ${flashcardMode === 'speak-japanese' ? 'nav-active' : ''}`}
                onClick={() => {
                  setFlashcardMode('speak-japanese');
                  setFlipped(false);
                  setSpeechResult(null);
                  setIsMicArmed(true);
                }}
              >
                Speak Japanese
              </button>
            </div>

            {currentCard ? (
              <>
                {flashcardMode === 'flip' ? (
                  <article
                    className={`flashcard ${flipped ? 'is-flipped' : ''} ${isDraggingCard ? 'is-dragging' : ''} ${isSwipeSettling ? 'is-swipe-settling' : ''}`}
                    style={{
                      transform: `translateX(${dragOffsetX}px) rotate(${dragOffsetX / 30}deg)`,
                      transition: isDraggingCard ? 'none' : `transform ${SWIPE_COMMIT_DURATION_MS}ms ease`,
                    }}
                    onClick={() => setFlipped((prev) => !prev)}
                    role="button"
                    tabIndex={0}
                    {...attachSwipeHandlers}
                  >
                    {!flipped ? (
                      <div className="flashcard-face">
                        {state.settings.direction === 'en-to-ja' ? (
                          <>
                            <h2>{currentCard.english}</h2>
                          </>
                        ) : (
                          <>
                            <h2>{currentCard.japanese}</h2>
                            <button
                              type="button"
                              className="tts-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                speakJapanese(currentCard.japanese);
                              }}
                              disabled={isSpeaking}
                            >
                              Speak
                            </button>
                            <p>{currentCard.romaji}</p>
                            <p>Tap to reveal English</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flashcard-face answer">
                        {state.settings.direction === 'en-to-ja' ? (
                          <>
                            {state.settings.showJapaneseOnBack && <h2>{currentCard.japanese}</h2>}
                            <button
                              type="button"
                              className="tts-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                speakJapanese(currentCard.japanese);
                              }}
                              disabled={isSpeaking}
                            >
                              Speak
                            </button>
                            {state.settings.showRomajiOnBack && <p>{currentCard.romaji}</p>}
                            {state.settings.showContextOnBack && <p className="context-line">{currentCard.context}</p>}
                            <p className="muted">Meaning: {currentCard.english}</p>
                          </>
                        ) : (
                          <>
                            <h2>{currentCard.english}</h2>
                            <p>{currentCard.japanese}</p>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                ) : (
                  <article
                    className={`flashcard ${flipped ? 'is-flipped' : ''} ${isDraggingCard ? 'is-dragging' : ''} ${isSwipeSettling ? 'is-swipe-settling' : ''}`}
                    style={{
                      transform: `translateX(${dragOffsetX}px) rotate(${dragOffsetX / 30}deg)`,
                      transition: isDraggingCard ? 'none' : `transform ${SWIPE_COMMIT_DURATION_MS}ms ease`,
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setFlipped((prev) => !prev)}
                    {...attachSwipeHandlers}
                  >
                    <div className="flashcard-face">
                      {!flipped ? (
                        <>
                          <h2>{currentCard.english}</h2>
                          <div className="speech-actions">
                            <button
                              type="button"
                              className={`mic-button ${isRecognizing ? 'is-active' : 'is-idle'}`}
                              aria-label={isRecognizing ? 'Stop microphone' : 'Start microphone'}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (isRecognizing) {
                                  stopRecognition();
                                  recognitionAttemptInFlightRef.current = false;
                                  setIsRecognizing(false);
                                  setIsMicArmed(false);
                                  return;
                                }

                                setIsMicArmed(true);
                                autoListenedCardIdRef.current = currentCard.id;
                                if (!hasMicPrimed) {
                                  setHasMicPrimed(true);
                                  try {
                                    window.localStorage.setItem(MIC_AUTO_START_KEY, '1');
                                  } catch {
                                    // Ignore storage errors; mic still works for this session.
                                  }
                                }
                                void startSpeechCheck();
                              }}
                              disabled={!isRecognitionSupported}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="mic-icon">
                                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.08A7 7 0 0 1 5 12a1 1 0 1 1 2 0 5 5 0 1 0 10 0Z" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flashcard-face answer">
                          <h2>{currentCard.japanese}</h2>
                          <p>{currentCard.romaji}</p>
                        </div>
                      )}

                      {!isRecognitionSupported && (
                        <p className="muted">Speech recognition is not available in this browser.</p>
                      )}

                      {speechResult && (
                        <div className={`speech-feedback ${speechResult.correct ? 'is-correct' : 'is-wrong'}`}>
                          <h2>{currentCard.japanese}</h2>
                          <p>{currentCard.romaji}</p>
                          <button
                            type="button"
                            className="word-speak-icon"
                            aria-label={`Play ${currentCard.japanese} out loud`}
                            onClick={() => {
                              speakJapanese(currentCard.japanese);
                            }}
                            disabled={isSpeaking}
                          >
                            <Volume2 size={16} />
                          </button>
                          {!speechResult.correct && speechResult.canOverride && !speechResult.overridden && (
                            <button
                              type="button"
                              className="button"
                              onClick={() => {
                                overrideLastIncorrectAsCorrect(currentCard.id);
                                setSpeechResult((prev) => {
                                  if (!prev) {
                                    return prev;
                                  }
                                  return {
                                    ...prev,
                                    correct: true,
                                    canOverride: false,
                                    overridden: true,
                                  };
                                });
                              }}
                            >
                              I got this right
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )}

                {flipped && flashcardMode === 'flip' && (
                  <div className="score-controls">
                    <button
                      type="button"
                      className="button button-soft"
                      onClick={() => {
                        recordCardResult(currentCard.id, false);
                        moveCard('next');
                      }}
                    >
                      I missed this
                    </button>
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        recordCardResult(currentCard.id, true);
                        moveCard('next');
                      }}
                    >
                      I got this right
                    </button>
                  </div>
                )}

                {studyMode === 'group' && (
                  <div className="score-controls">
                    <button
                      type="button"
                      className="button button-soft"
                      onClick={removeCurrentCardFromGroupSession}
                    >
                      Remove card
                    </button>
                  </div>
                )}
              </>
            ) : (
              <section className="empty-state">
                <h2>No flashcards in this session</h2>
                {studyMode === 'group'
                  ? <p>All cards were removed for this group session. Return to My Vocab to start again.</p>
                  : <p>Add your first group and then press Study all.</p>}
              </section>
            )}
          </section>
        )}

        {view === 'my-vocab' && (
          <section>
            <div className="list-header list-header-with-action">
              <div>
                <h2>My Vocab</h2>
                <p>
                  {JAPANESE_VOCAB_SIZE.toLocaleString()} cached words and phrases • Active: {state.activeWordIds.length} • Accuracy: {totalAccuracy}%
                </p>
              </div>
              <button
                type="button"
                className="button"
                onClick={startStudyAll}
                disabled={activeEntries.length === 0}
              >
                Study all
              </button>
            </div>

            <div className="group-list">
              {groupedActiveWords.map(({ group, words }) => {
                const isOpen = expandedMyVocabGroupId === group.id;
                return (
                  <section key={group.id} className="group-card">
                    <header className="group-card-header">
                      <button
                        type="button"
                        className="group-card-toggle"
                        onClick={() => {
                          setExpandedMyVocabGroupId((prev) => (prev === group.id ? null : group.id));
                        }}
                      >
                        <div>
                          <h3>{group.name}</h3>
                          <p>{words.length} active words</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="group-remove-x"
                        aria-label={`Remove ${group.name}`}
                        onClick={() => {
                          const isConfirmed = window.confirm(`Are you sure you want to remove this group: ${group.name}?`);
                          if (isConfirmed) {
                            removeGroup(group.id);
                            setExpandedMyVocabGroupId((prev) => (prev === group.id ? null : prev));
                          }
                        }}
                      >
                        <X size={16} />
                      </button>
                    </header>

                    {isOpen && (
                      <>
                        <div className="group-actions">
                          <button
                            type="button"
                            className="button button-soft"
                            onClick={() => startStudyGroup(group.id)}
                            disabled={words.length === 0}
                          >
                            Study Group
                          </button>
                        </div>

                        <div className="word-table">
                          {words.map((word) => {
                            const percentKnown = comprehensionForWord(word.id);
                            return (
                              <article key={word.id} className="word-row">
                                <button
                                  type="button"
                                  className="word-remove-x"
                                  aria-label={`Remove ${word.english}`}
                                  onClick={() => removeWord(word.id)}
                                >
                                  <X size={14} />
                                </button>

                                <div className="word-primary">
                                  <strong>{word.english}</strong>
                                  <p className="word-japanese">{word.japanese}</p>
                                  <p className="word-romaji">{word.romaji}</p>
                                  <button
                                    type="button"
                                    className="word-speak-icon"
                                    aria-label={`Play ${word.japanese} out loud`}
                                    onClick={() => {
                                      speakJapanese(word.japanese);
                                    }}
                                    disabled={isSpeaking}
                                  >
                                    <Volume2 size={16} />
                                  </button>
                                </div>

                                <div className="word-indicator" aria-label={`${percentKnown}% known`} title={`${percentKnown}% known`}>
                                  <span className="progress-pie" style={pieStyleForPercent(percentKnown)} />
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </section>
                );
              })}
            </div>

            <footer className="list-footer">
              <button type="button" className="button" onClick={() => addNextGroup()}>
                I am ready for more
              </button>
              <button type="button" className="button button-soft" onClick={() => setShowPicker((prev) => !prev)}>
                Add specific
              </button>
            </footer>

            {showPicker && (
              <section className="picker-panel">
                <h3>Add specific groups or words</h3>
                <p>Choose upcoming groups, or open a group and choose specific words.</p>
                <div className="picker-groups">
                  {upcomingGroups.slice(0, 12).map((group) => (
                    <article key={group.id} className="picker-group-card">
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(checkedGroupIds[group.id])}
                          onChange={(event) => {
                            setCheckedGroupIds((prev) => ({
                              ...prev,
                              [group.id]: event.target.checked,
                            }));
                          }}
                        />
                        {group.name} ({group.wordIds.length} words)
                      </label>

                      <div className="picker-words">
                        {group.wordIds.slice(0, 8).map((wordId) => {
                          const word = JAPANESE_VOCAB_BY_ID[wordId];
                          if (!word) {
                            return null;
                          }

                          return (
                            <label key={wordId}>
                              <input
                                type="checkbox"
                                checked={Boolean(checkedWordIds[wordId])}
                                onChange={(event) => {
                                  setCheckedWordIds((prev) => ({
                                    ...prev,
                                    [wordId]: event.target.checked,
                                  }));
                                }}
                              />
                              {word.english} / {word.japanese}
                            </label>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="picker-actions">
                  <button type="button" className="button button-soft" onClick={() => setShowPicker(false)}>
                    Cancel
                  </button>
                  <button type="button" className="button" onClick={applyCheckedSelections}>
                    Add selected
                  </button>
                </div>
              </section>
            )}
          </section>
        )}

        {view === 'entire-cache' && (
          <section>
            <div className="list-header">
              <h2>Entire Cache</h2>
              <p>Tap a group to show all words. Opening one group closes any other open group.</p>
            </div>

            <div className="cache-group-list">
              {JAPANESE_VOCAB_GROUPS.map((group) => {
                const isOpen = expandedCacheGroupId === group.id;
                return (
                  <section key={group.id} className="cache-group-card">
                    <button
                      type="button"
                      className="cache-group-toggle"
                      onClick={() => {
                        setExpandedCacheGroupId((prev) => (prev === group.id ? null : group.id));
                      }}
                    >
                      <span>{group.name}</span>
                      <span>{group.wordIds.length} words</span>
                    </button>
                    {isOpen && (
                      <div className="cache-word-list">
                        {group.wordIds.map((wordId) => {
                          const word = JAPANESE_VOCAB_BY_ID[wordId];
                          if (!word) {
                            return null;
                          }

                          const percentKnown = comprehensionForWord(word.id);

                          return (
                            <article key={wordId} className="cache-word-row word-row is-readonly">
                              <div className="word-primary">
                                <strong>{word.english}</strong>
                                <p className="word-japanese">{word.japanese}</p>
                                <p className="word-romaji">{word.romaji}</p>
                                <button
                                  type="button"
                                  className="word-speak-icon"
                                  aria-label={`Play ${word.japanese} out loud`}
                                  onClick={() => {
                                    speakJapanese(word.japanese);
                                  }}
                                  disabled={isSpeaking}
                                >
                                  <Volume2 size={16} />
                                </button>
                              </div>

                              <div className="word-indicator" aria-label={`${percentKnown}% known`} title={`${percentKnown}% known`}>
                                <span className="progress-pie" style={pieStyleForPercent(percentKnown)} />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </section>
        )}

        {view === 'settings' && (
          <section className="settings-panel">
            <div className="settings-header">
              <button
                type="button"
                className="icon-button settings-close"
                onClick={() => setView(lastListView)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
              <h2>Settings</h2>
            </div>
            <p>Customize what appears on the Japanese side of each card.</p>

            <label>
              Card direction
              <select
                value={state.settings.direction}
                onChange={(event) => {
                  updateSettings({
                    direction: event.target.value as 'en-to-ja' | 'ja-to-en',
                  });
                }}
              >
                <option value="en-to-ja">English to Japanese</option>
                <option value="ja-to-en">Japanese to English</option>
              </select>
            </label>

            <label>
              <input
                type="checkbox"
                checked={state.settings.showJapaneseOnBack}
                onChange={(event) => updateSettings({ showJapaneseOnBack: event.target.checked })}
                disabled={state.settings.direction === 'ja-to-en'}
              />
              Show Japanese characters on back
            </label>

            <label>
              <input
                type="checkbox"
                checked={state.settings.showRomajiOnBack}
                onChange={(event) => updateSettings({ showRomajiOnBack: event.target.checked })}
              />
              Show romaji on back
            </label>

            <label>
              <input
                type="checkbox"
                checked={state.settings.showContextOnBack}
                onChange={(event) => updateSettings({ showContextOnBack: event.target.checked })}
              />
              Show usage context on back
            </label>

            <section className="settings-summary">
              <h3>Progress Snapshot</h3>
              <p>Estimated placement rank: {state.estimatedRank.toLocaleString()}</p>
              <p>Total active words: {state.activeWordIds.length.toLocaleString()}</p>
              <p>Total review attempts: {totalAttempts.toLocaleString()}</p>
              <p>Accuracy: {totalAccuracy}%</p>
            </section>

            <section className="settings-summary">
              <h3>Placement Quiz</h3>
              <p>
                Default start is beginner mode. Take the quiz if you want to jump ahead.
              </p>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setPlacementAnswers({});
                  setPlacementIndex(0);
                  setIsTakingPlacementQuiz(true);
                }}
              >
                Take placement quiz
              </button>
            </section>

            <section className="settings-summary">
              <h3>Japanese Text-to-Speech</h3>
              <p>Current provider: {providerLabel}</p>
              <p>
                {hasPremiumVoice
                  ? 'Premium Japanese AI voice is active.'
                  : 'Set VITE_ELEVENLABS_API_KEY and VITE_ELEVENLABS_JA_VOICE_ID for a native-like AI voice.'}
              </p>

              <label>
                TTS speaking rate ({state.settings.ttsRate.toFixed(2)}x)
                <input
                  type="range"
                  min="0.8"
                  max="1.25"
                  step="0.05"
                  value={state.settings.ttsRate}
                  onChange={(event) => {
                    updateSettings({ ttsRate: Number(event.target.value) });
                  }}
                />
              </label>

              <label>
                Voice expressiveness ({Math.round(state.settings.ttsStyle * 100)}%)
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.settings.ttsStyle}
                  onChange={(event) => {
                    updateSettings({ ttsStyle: Number(event.target.value) });
                  }}
                />
              </label>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
