import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { LANGUAGES } from './data/languages';
import Dashboard from './components/Dashboard';
import LanguageSelector from './components/LanguageSelector';
import Header from './components/Header';
import VocabularyActivity from './activities/VocabularyActivity';
import SentenceBuilderActivity from './activities/SentenceBuilderActivity';
import ListeningActivity from './activities/ListeningActivity';
import StoryActivity from './activities/StoryActivity';
import SRSReviewActivity from './activities/SRSReviewActivity';
import type { ActivityType } from './types';

function App() {
  const { progress, selectLanguage, getLangProgress, recordAnswer, selectedLanguage } = useProgress();
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);

  const language = LANGUAGES.find((l) => l.code === selectedLanguage) ?? LANGUAGES[0];
  const langProgress = getLangProgress(selectedLanguage);

  const handleStartActivity = (activity: ActivityType) => {
    setCurrentActivity(activity);
  };

  const handleExitActivity = () => {
    setCurrentActivity(null);
  };

  const handleAnswerRecorded = (vocabId: string, correct: boolean, timeTaken: number) => {
    recordAnswer(selectedLanguage, vocabId, correct, timeTaken);
  };

  if (currentActivity === 'vocabulary') {
    return (
      <VocabularyActivity
        language={language}
        langProgress={langProgress}
        onAnswer={handleAnswerRecorded}
        onExit={handleExitActivity}
      />
    );
  }

  if (currentActivity === 'sentence-builder') {
    return (
      <SentenceBuilderActivity
        language={language}
        langProgress={langProgress}
        onExit={handleExitActivity}
      />
    );
  }

  if (currentActivity === 'listening') {
    return (
      <ListeningActivity
        language={language}
        langProgress={langProgress}
        onAnswer={handleAnswerRecorded}
        onExit={handleExitActivity}
      />
    );
  }

  if (currentActivity === 'story') {
    return (
      <StoryActivity
        language={language}
        langProgress={langProgress}
        onExit={handleExitActivity}
      />
    );
  }

  if (currentActivity === 'srs-review') {
    return (
      <SRSReviewActivity
        language={language}
        langProgress={langProgress}
        onAnswer={handleAnswerRecorded}
        onExit={handleExitActivity}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header
        progress={progress}
        selectedLanguage={selectedLanguage}
        langProgress={langProgress}
      />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <LanguageSelector
          languages={LANGUAGES}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={selectLanguage}
        />
        <Dashboard
          language={language}
          langProgress={langProgress}
          onStartActivity={handleStartActivity}
        />
      </main>
    </div>
  );
}

export default App;
