import { ReviewGrade, UserVocabItem, VocabStatus } from './types';

export const MIN_ATTEMPTS_FOR_MASTERY = 4;
export const MASTERY_ACCURACY_THRESHOLD = 0.65; // > 65%

/**
 * Evaluate mastery purely from total cumulative quiz history (Listening + Reading + 50-Q Test).
 * Writing scores are NEVER included here.
 */
export function evaluateQuizMastery(
  timesCorrect: number,
  timesIncorrect: number
): {
  totalAttempts: number;
  accuracy: number;
  accuracyPercent: number;
  isMastered: boolean;
  status: VocabStatus;
} {
  const totalAttempts = timesCorrect + timesIncorrect;
  const accuracy = totalAttempts > 0 ? timesCorrect / totalAttempts : 0;
  const accuracyPercent = Math.round(accuracy * 100);
  const isMastered =
    totalAttempts >= MIN_ATTEMPTS_FOR_MASTERY && accuracy > MASTERY_ACCURACY_THRESHOLD;

  let status: VocabStatus = 'NEW';
  if (isMastered) {
    status = 'MASTERED';
  } else if (totalAttempts >= 2) {
    status = 'REVIEWING';
  } else if (totalAttempts >= 1) {
    status = 'LEARNING';
  }

  return {
    totalAttempts,
    accuracy,
    accuracyPercent,
    isMastered,
    status,
  };
}

/**
 * Calculate updated SRS interval & cumulative quiz stats from an actual quiz attempt (Listening/Reading/Test)
 */
export function calculateQuizAttemptUpdate(
  item: UserVocabItem,
  isCorrect: boolean
): {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  status: VocabStatus;
  timesCorrect: number;
  timesIncorrect: number;
} {
  let { easeFactor = 2.5, intervalDays = 0, repetitions = 0 } = item;
  let timesCorrect = item.timesCorrect || 0;
  let timesIncorrect = item.timesIncorrect || 0;

  if (isCorrect) {
    timesCorrect += 1;
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 4;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.min(3.0, easeFactor + 0.05);
  } else {
    timesIncorrect += 1;
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  }

  const mastery = evaluateQuizMastery(timesCorrect, timesIncorrect);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    repetitions,
    nextReviewAt: nextDate.toISOString(),
    status: mastery.status,
    timesCorrect,
    timesIncorrect,
  };
}

/**
 * SuperMemo 2 (SM-2) algorithm for manual SRS schedule rating
 * Keeps the mastery rule unified with total quiz accuracy (excludes Writing)
 */
export function calculateNextSRS(
  item: UserVocabItem,
  grade: ReviewGrade,
  countsTowardQuizAccuracy: boolean = false
): {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  status: VocabStatus;
  timesCorrect: number;
  timesIncorrect: number;
} {
  let { easeFactor = 2.5, intervalDays = 0, repetitions = 0 } = item;
  let timesCorrect = item.timesCorrect || 0;
  let timesIncorrect = item.timesIncorrect || 0;

  let quality = 4;
  if (grade === 'AGAIN') quality = 1;
  else if (grade === 'HARD') quality = 3;
  else if (grade === 'GOOD') quality = 4;
  else if (grade === 'EASY') quality = 5;

  if (quality >= 3) {
    if (countsTowardQuizAccuracy) timesCorrect += 1;
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = grade === 'HARD' ? 2 : 4;
    } else {
      const multiplier = grade === 'HARD' ? 1.2 : grade === 'EASY' ? easeFactor * 1.3 : easeFactor;
      intervalDays = Math.round(intervalDays * multiplier);
    }
    repetitions += 1;
  } else {
    if (countsTowardQuizAccuracy) timesIncorrect += 1;
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 3.0) easeFactor = 3.0;

  const mastery = evaluateQuizMastery(timesCorrect, timesIncorrect);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    repetitions,
    nextReviewAt: nextDate.toISOString(),
    status: mastery.status,
    timesCorrect,
    timesIncorrect,
  };
}
