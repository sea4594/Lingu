import { useMemo, useState } from 'react';
import { JAPANESE_VOCAB_BY_ID, JAPANESE_VOCAB_SIZE } from './data/japaneseVocabulary';
import { useJapaneseTrainer } from './hooks/useJapaneseTrainer';

type AppView = 'flashcards' | 'vocab-list' | 'settings';

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
    activeEntries,
    activeGroups,
    upcomingGroups,
    pickNextCard,
    comprehensionForWord,
    totalAttempts,
    totalAccuracy,
  } = useJapaneseTrainer();

  const [view, setView] = useState<AppView>('flashcards');
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, boolean>>({});

  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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
      if (direction === 'prev') {
        return;
      }
    }

    if (direction === 'prev') {
      if (historyIndex > 0) {
        setHistoryIndex((prev) => prev - 1);
        setFlipped(false);
      }
      return;
    }

    if (historyIndex < historyIds.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setFlipped(false);
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

  if (!state.placementDone) {
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
              <p>{question.romaji}</p>
              <p className="placement-hint">Meaning: {question.english}</p>
            </section>
          ) : null}

          <div className="placement-actions">
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
            {currentCard ? (
              <>
                <div className="flashcard-meta">
                  <span>{currentCard.groupName}</span>
                  <span>Comprehension: {comprehensionForWord(currentCard.id)}%</span>
                </div>

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
                          <p>Tap to reveal Japanese</p>
                        </>
                      ) : (
                        <>
                          <h2>{currentCard.japanese}</h2>
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
                          {state.settings.showRomajiOnBack && <p>{currentCard.romaji}</p>}
                          {state.settings.showContextOnBack && <p className="context-line">{currentCard.context}</p>}
                          <p className="muted">Meaning: {currentCard.english}</p>
                        </>
                      ) : (
                        <>
                          <h2>{currentCard.english}</h2>
                          <p>{currentCard.japanese}</p>
                          {state.settings.showContextOnBack && <p className="context-line">{currentCard.context}</p>}
                        </>
                      )}
                    </div>
                  )}
                </article>

                <div className="flashcard-controls">
                  <button type="button" className="button button-soft" onClick={() => moveCard('prev')}>Previous</button>
                  <button type="button" className="button button-soft" onClick={() => moveCard('next')}>Next</button>
                </div>

                {flipped && (
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

            <section className="settings-summary">
              <h3>Progress Snapshot</h3>
              <p>Estimated placement rank: {state.estimatedRank.toLocaleString()}</p>
              <p>Total active words: {state.activeWordIds.length.toLocaleString()}</p>
              <p>Total review attempts: {totalAttempts.toLocaleString()}</p>
              <p>Accuracy: {totalAccuracy}%</p>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
