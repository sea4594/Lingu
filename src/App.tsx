import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JAPANESE_VOCAB_BY_ID, JAPANESE_VOCAB_SIZE } from './data/japaneseVocabulary';
import { useJapaneseTrainer } from './hooks/useJapaneseTrainer';
import { useJapaneseTTS } from './hooks/useJapaneseTTS';
import { useSpeech } from './hooks/useSpeech';
import { levenshtein, stripAccents } from './utils/fuzzyMatch';

type AppView = 'flashcards' | 'vocab-list' | 'settings';
type FlashcardMode = 'flip' | 'speak-japanese';

type SpeechResult = {
  transcript: string;
  correct: boolean;
  confidence: number;
  canOverride: boolean;
  overridden?: boolean;
};

const normalizeSpeechInput = (value: string): string =>
  stripAccents(value)
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]/gu, '')
    .trim();

const similarity = (left: string, right: string): number => {
  const a = normalizeSpeechInput(left);
  const b = normalizeSpeechInput(right);
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
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

  const [view, setView] = useState<AppView>('flashcards');
  const [isTakingPlacementQuiz, setIsTakingPlacementQuiz] = useState(false);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, boolean>>({});

  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>('flip');
  const [flipped, setFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isMicArmed, setIsMicArmed] = useState(true);
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null);
  const autoListenedCardIdRef = useRef<string | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [checkedGroupIds, setCheckedGroupIds] = useState<Record<string, boolean>>({});
  const [checkedWordIds, setCheckedWordIds] = useState<Record<string, boolean>>({});

  const fallbackCard = activeEntries[0] ?? null;

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

  const startSpeechCheck = useCallback(async () => {
    if (!currentCard || !isRecognitionSupported || isRecognizing) {
      return;
    }

    setSpeechResult(null);
    setIsRecognizing(true);

    try {
      const transcript = await recognize('ja-JP', 10000);
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
      const noSpeech = message.includes('timed out') || message.includes('no-speech') || message.includes('aborted');

      setSpeechResult({
        transcript: noSpeech ? 'No speech detected after 10 seconds. Listening stopped.' : 'Could not capture speech. Please try again.',
        correct: false,
        confidence: 0,
        canOverride: false,
      });
    } finally {
      setIsRecognizing(false);
    }
  }, [currentCard, isRecognitionSupported, isRecognizing, recognize, recordCardResult]);

  useEffect(() => {
    if (
      view !== 'flashcards' ||
      flashcardMode !== 'speak-japanese' ||
      !state.settings.autoListenOnCard ||
      !isMicArmed ||
      !currentCard ||
      !isRecognitionSupported ||
      isRecognizing
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
    isMicArmed,
    isRecognitionSupported,
    isRecognizing,
    startSpeechCheck,
    state.settings.autoListenOnCard,
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

    const recent = new Set(historyIds.slice(Math.max(0, historyIds.length - 4)));
    const nextCard = pickNextCard(recent) ?? pickNextCard();
    if (!nextCard) {
      return;
    }

    setHistoryIds((prev) => [...prev, nextCard.id]);
    setHistoryIndex((prev) => prev + 1);
    setFlipped(false);
    setSpeechResult(null);
    autoListenedCardIdRef.current = null;
  };

  const handleSwipeStart = (clientX: number) => {
    setTouchStartX(clientX);
  };

  const handleSwipeEnd = (clientX: number) => {
    if (touchStartX === null) {
      return;
    }

    const delta = clientX - touchStartX;
    if (delta > 55) {
      moveCard('prev');
    }
    if (delta < -55) {
      moveCard('next');
    }
    setTouchStartX(null);
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
      <header className="topbar">
        <div>
          <h1>Lingu: Japanese Vocabulary</h1>
          <p>
            {JAPANESE_VOCAB_SIZE.toLocaleString()} cached words and phrases • Active: {state.activeWordIds.length} • Accuracy: {totalAccuracy}%
          </p>
        </div>
        <nav>
          <button type="button" className={view === 'flashcards' ? 'nav-active' : ''} onClick={() => setView('flashcards')}>Flashcards</button>
          <button type="button" className={view === 'vocab-list' ? 'nav-active' : ''} onClick={() => setView('vocab-list')}>Vocab List</button>
          <button type="button" className={view === 'settings' ? 'nav-active' : ''} onClick={() => setView('settings')}>Settings</button>
        </nav>
      </header>

      <main className="panel">
        {view === 'flashcards' && (
          <section>
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
                <div className="flashcard-meta">
                  <span>{currentCard.groupName}</span>
                  <span>Comprehension: {comprehensionForWord(currentCard.id)}%</span>
                </div>

                {flashcardMode === 'flip' ? (
                  <article
                    className={`flashcard ${flipped ? 'is-flipped' : ''}`}
                    onClick={() => setFlipped((prev) => !prev)}
                    onTouchStart={(event) => handleSwipeStart(event.touches[0].clientX)}
                    onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX)}
                    onMouseDown={(event) => handleSwipeStart(event.clientX)}
                    onMouseUp={(event) => handleSwipeEnd(event.clientX)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setFlipped((prev) => !prev);
                      }
                      if (event.key === 'ArrowLeft') {
                        moveCard('prev');
                      }
                      if (event.key === 'ArrowRight') {
                        moveCard('next');
                      }
                    }}
                  >
                    {!flipped ? (
                      <div className="flashcard-face">
                        {state.settings.direction === 'en-to-ja' ? (
                          <>
                            <h2>{currentCard.english}</h2>
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
                            <p>Tap to reveal Japanese</p>
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
                            <button
                              type="button"
                              className="tts-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                speakJapanese(currentCard.japanese);
                              }}
                              disabled={isSpeaking}
                            >
                              Speak Japanese
                            </button>
                            {state.settings.showContextOnBack && <p className="context-line">{currentCard.context}</p>}
                          </>
                        )}
                      </div>
                    )}
                  </article>
                ) : (
                  <article className="flashcard">
                    <div className="flashcard-face">
                      <p className="muted">Speak the Japanese for:</p>
                      <h2>{currentCard.english}</h2>
                      <p>{currentCard.context}</p>
                      <div className="score-controls">
                        <button
                          type="button"
                          className="button button-soft"
                          onClick={() => speakJapanese(currentCard.japanese)}
                          disabled={isSpeaking}
                        >
                          Hear answer
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            if (isRecognizing) {
                              stopRecognition();
                              setIsRecognizing(false);
                              setIsMicArmed(false);
                              return;
                            }

                            setIsMicArmed(true);
                            void startSpeechCheck();
                          }}
                          disabled={!isRecognitionSupported}
                        >
                          {isRecognizing ? 'Stop mic' : 'Start mic'}
                        </button>
                      </div>

                      {!isRecognitionSupported && (
                        <p className="muted">Speech recognition is not available in this browser.</p>
                      )}

                      {speechResult && (
                        <div className={`speech-feedback ${speechResult.correct ? 'is-correct' : 'is-wrong'}`}>
                          <p>{speechResult.correct ? 'Correct pronunciation' : 'Not quite right'}</p>
                          <p>Heard: {speechResult.transcript}</p>
                          <p>Match score: {speechResult.confidence}%</p>
                          <p>Target: {currentCard.japanese} ({currentCard.romaji})</p>
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

                <div className="flashcard-controls">
                  <button type="button" className="button button-soft" onClick={() => moveCard('prev')}>Previous</button>
                  <button type="button" className="button button-soft" onClick={() => moveCard('next')}>Next</button>
                </div>

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
              </>
            ) : (
              <section className="empty-state">
                <h2>No active flashcards yet</h2>
                <p>Add your first bite-size group to start.</p>
                <button type="button" className="button" onClick={() => addNextGroup()}>Add first group</button>
              </section>
            )}
          </section>
        )}

        {view === 'vocab-list' && (
          <section>
            <div className="list-header">
              <h2>Introduced Vocabulary</h2>
              <p>Each score decays over time and drops after misses.</p>
            </div>

            <div className="group-list">
              {groupedActiveWords.map(({ group, words }) => (
                <section key={group.id} className="group-card">
                  <header>
                    <div>
                      <h3>{group.name}</h3>
                      <p>{words.length} active words</p>
                    </div>
                    <button type="button" className="button button-soft" onClick={() => removeGroup(group.id)}>
                      Remove group
                    </button>
                  </header>

                  <div className="word-table">
                    {words.map((word) => (
                      <article key={word.id} className="word-row">
                        <div>
                          <strong>{word.english}</strong>
                          <p>{word.japanese} • {word.romaji}</p>
                        </div>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="button button-soft"
                            onClick={() => {
                              speakJapanese(word.japanese);
                            }}
                            disabled={isSpeaking}
                          >
                            Speak
                          </button>
                          <span>{comprehensionForWord(word.id)}%</span>
                          <button type="button" className="button button-soft" onClick={() => removeWord(word.id)}>Remove</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <footer className="list-footer">
              <button type="button" className="button" onClick={() => addNextGroup()}>
                I am ready for more
              </button>
              <button type="button" className="button button-soft" onClick={() => setShowPicker((prev) => !prev)}>
                ⋯
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

        {view === 'settings' && (
          <section className="settings-panel">
            <h2>Flashcard Settings</h2>
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

            <label>
              <input
                type="checkbox"
                checked={state.settings.autoListenOnCard}
                onChange={(event) => updateSettings({ autoListenOnCard: event.target.checked })}
              />
              Auto-listen in Speak Japanese mode when a new card appears
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
