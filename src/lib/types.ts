export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'idiom'
  | 'phrasal verb'
  | 'other';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type VocabStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';

export type ReviewGrade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export type TestQuestionCategory =
  | 'MEANING'
  | 'WORD_FORM'
  | 'GRAMMAR_TENSE'
  | 'COLLOCATION'
  | 'PREPOSITION_PHRASAL'
  | 'IDIOM';

export interface DefinitionItem {
  definition: string;
  vietnameseMeaning?: string;
  example: string;
  synonyms?: string[];
}

export interface WordItem {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  level?: CEFRLevel;
  audioUrl?: string;
  definitions: DefinitionItem[];
  collocations?: string[];
  topic?: string;
}

export interface UserVocabItem {
  id: string; // word id or uuid
  wordId: string;
  word: string;
  ipa: string;
  pos: string;
  level?: CEFRLevel;
  audioUrl?: string;
  definition: string;
  vietnameseMeaning?: string;
  example: string;
  collocations?: string[];
  topic?: string;

  // SRS & Quiz Mastery properties (Listening, Reading, 50-Q Test ONLY)
  status: VocabStatus;
  easeFactor: number; // default: 2.5
  intervalDays: number; // default: 0
  repetitions: number; // default: 0
  nextReviewAt: string; // ISO string
  lastReviewedAt?: string;
  createdAt: string;

  // Quiz history & stats (strictly excludes writing practice)
  timesCorrect: number;
  timesIncorrect: number;

  // Separate Writing Mastery tracking
  writingCorrectCount?: number;
  writingMastered?: boolean;
}

export interface DailyStats {
  streak: number;
  lastActiveDate: string;
  wordsLearnedToday: number;
  reviewsCompletedToday: number;
}

export interface OnboardingState {
  completed: boolean;
  selectedTopics: string[];
  customTopic?: string;
  createdAt?: string;
}

export interface TestQuestion {
  id: string;
  wordId: string;
  word: string;
  category: TestQuestionCategory;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sentenceTranslation: string;
  isFromMastered?: boolean;
}

export interface TestCategoryScore {
  category: TestQuestionCategory;
  correct: number;
  total: number;
}

export interface TestHistoryRecord {
  id: string;
  date: string;
  score: number;
  total: number;
  categoryScores: TestCategoryScore[];
  demotedWords: string[];
  retainedWords: string[];
}

export interface WritingPrompt {
  id: string;
  topicId: string;
  topicName: string;
  title: string;
  scenario: string;
  minWords: number;
  maxWords: number;
  connectingWordsHint: string[];
}

export interface WritingAttempt {
  id: string;
  promptId: string;
  promptTitle: string;
  topicName: string;
  content: string;
  wordCount: number;
  score: number; // 0 - 100
  targetWords: string[];
  usedTargetWords: string[];
  breakdown: {
    vocabScore: number;      // max 40
    structureScore: number;  // max 20
    grammarScore: number;    // max 20
    cohesionScore: number;   // max 20
  };
  feedback: string[];
  createdAt: string;
}

export type StudyModePreference = 'LISTEN_ONLY' | 'READ_ONLY' | 'WRITE_ONLY' | 'COMBO';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  targetLevel: CEFRLevel;
  dailyGoalReviews: number;
  preferredStudyMode: StudyModePreference;
  favoriteTopics: string[];
  avatarColor: string;
  createdAt: string;
}
