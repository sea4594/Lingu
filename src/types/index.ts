// Language types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
  speechCode?: string; // BCP 47 language tag for Speech API
}

// Vocabulary types
export type WordCategory =
  | 'greetings'
  | 'numbers'
  | 'colors'
  | 'food'
  | 'travel'
  | 'family'
  | 'time'
  | 'weather'
  | 'body'
  | 'clothing'
  | 'verbs'
  | 'adjectives'
  | 'phrases'
  | 'questions'
  | 'directions'
  | 'shopping'
  | 'health'
  | 'nature'
  | 'education'
  | 'work';

export interface VocabEntry {
  id: string;
  english: string;
  translation: string;
  romanization?: string; // For non-Latin scripts
  pronunciation?: string; // IPA or phonetic guide
  category: WordCategory;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=beginner, 5=advanced
  exampleSentence?: string; // Example in target language
  exampleTranslation?: string; // Example translation
  tags?: string[];
}

// SRS (Spaced Repetition System) types
export interface SRSCard {
  vocabId: string;
  interval: number; // Days until next review
  easeFactor: number; // SM-2 ease factor (starts at 2.5)
  repetitions: number; // Number of successful repetitions
  nextReview: number; // Timestamp of next review
  lastReview: number; // Timestamp of last review
  stage: 'new' | 'learning' | 'review' | 'mastered';
}

// Activity types
export type ActivityType =
  | 'vocabulary'
  | 'sentence-builder'
  | 'listening'
  | 'story'
  | 'srs-review'
  | 'grammar';

export type QuizMode =
  | 'flashcard'
  | 'multiple-choice-en'   // English to target language
  | 'multiple-choice-tl'   // Target language to English
  | 'type-translation-en'  // English, type in target language
  | 'type-translation-tl'  // Target language, type in English
  | 'pronunciation'
  | 'listening';

// Progress types
export interface LanguageProgress {
  languageCode: string;
  unlockedVocab: string[]; // IDs of unlocked vocabulary items
  srsCards: Record<string, SRSCard>; // vocabId -> SRSCard
  totalXP: number;
  streak: number;
  lastStudiedDate: string; // ISO date string
  completedActivities: number;
  level: number; // 1-10
  wordsLearned: number;
  wordsInReview: number;
  wordsMastered: number;
  totalAnswers: number;
  correctAnswers: number;
  averageResponseMs: number;
  bestStreak: number;
}

export interface UserProgress {
  languages: Record<string, LanguageProgress>;
  selectedLanguage: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion?: number;
}

// Quiz state types
export interface QuizQuestion {
  vocabId: string;
  mode: QuizMode;
  prompt: string;
  promptLanguage: 'english' | 'target';
  answer: string;
  options?: string[]; // For multiple choice
  entry: VocabEntry;
}

export interface QuizResult {
  vocabId: string;
  correct: boolean;
  timeTaken: number; // milliseconds
  userAnswer?: string;
  mode: QuizMode;
}

// Sentence types
export interface Sentence {
  id: string;
  english: string;
  translation: string;
  words: string[]; // Individual words in target language
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: WordCategory;
}

// Story types
export interface Story {
  id: string;
  title: string;
  titleTranslation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  paragraphs: StoryParagraph[];
  vocabulary: string[]; // VocabEntry IDs featured in the story
}

export interface StoryParagraph {
  target: string;
  english: string;
}
