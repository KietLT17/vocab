import {
  DailyStats,
  OnboardingState,
  ReviewGrade,
  TestHistoryRecord,
  UserVocabItem,
  VocabStatus,
  WordItem,
  WritingAttempt,
} from './types';
import {
  calculateNextSRS,
  calculateQuizAttemptUpdate,
  evaluateQuizMastery,
} from './srs';
import { DEMO_USER_ID, getActiveUserId } from './auth';
import {
  buildExtendedWordItem,
  CURATED_VOCABULARY,
  EXTENDED_WORD_POOL,
  shuffleArray,
} from '../data/curatedDictionary';
import { TOPIC_WORDS } from '../data/topicsVocabulary';

const STORAGE_KEY = 'vocabflow_user_words_v1';
const STATS_KEY = 'vocabflow_user_stats_v1';
const ONBOARDING_KEY = 'vocabflow_onboarding_v1';
const TEST_HISTORY_KEY = 'vocabflow_test_history_v1';
const WRITING_HISTORY_KEY = 'vocabflow_writing_history_v1';

// ponytail: in-memory cache per scoped key eliminates redundant JSON.parse on render/events;
// invalidated on account switch & cross-tab storage events.
const memoryCache = new Map<string, unknown>();

if (typeof window !== 'undefined') {
  window.addEventListener('vocabflow_account_changed', () => memoryCache.clear());
  window.addEventListener('storage', () => memoryCache.clear());
}

export function clearStorageCache(): void {
  memoryCache.clear();
}

function scopedKey(baseKey: string, userId: string | null = getActiveUserId()): string {
  const effectiveId = userId || 'anon';
  return `vocabflow_u_${effectiveId}_${baseKey}`;
}

function readJson<T>(fullKey: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  if (memoryCache.has(fullKey)) {
    return memoryCache.get(fullKey) as T;
  }
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(fullKey, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

function writeJson<T>(fullKey: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    memoryCache.set(fullKey, value);
    localStorage.setItem(fullKey, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write ${fullKey}`, err);
  }
}

function toUserVocabItem(w: WordItem, nowIso: string): UserVocabItem {
  const cleanWord = w.word.trim().toLowerCase();
  const firstDef = w.definitions[0];
  return {
    id: w.id || cleanWord,
    wordId: w.id || cleanWord,
    word: w.word,
    ipa: w.ipa,
    pos: w.pos,
    level: w.level,
    audioUrl: w.audioUrl,
    definition: firstDef?.definition || '',
    vietnameseMeaning: firstDef?.vietnameseMeaning || '',
    example: firstDef?.example || `Practice using "${w.word}" in real life.`,
    collocations: w.collocations,
    topic: w.topic,
    status: 'NEW',
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: nowIso,
    createdAt: nowIso,
    timesCorrect: 0,
    timesIncorrect: 0,
    writingCorrectCount: 0,
    writingMastered: false,
  };
}

/**
 * Seeds the built-in `demo` sample account once with 50 words (20 MASTERED)
 * by reusing existing CURATED_VOCABULARY and TOPIC_WORDS.
 */
function ensureDemoAccountData(): void {
  if (typeof window === 'undefined') return;
  if (getActiveUserId() !== DEMO_USER_ID) return;

  const onboardingKey = scopedKey(ONBOARDING_KEY, DEMO_USER_ID);
  if (localStorage.getItem(onboardingKey)) return;

  const uniqueByWord = new Map<string, WordItem>();
  const rawSources: WordItem[] = [
    ...CURATED_VOCABULARY,
    ...Object.values(TOPIC_WORDS).flat(),
    ...EXTENDED_WORD_POOL.map((w) => buildExtendedWordItem(w)),
  ];
  for (const w of rawSources) {
    const key = w.word.trim().toLowerCase();
    if (!uniqueByWord.has(key)) {
      uniqueByWord.set(key, w);
    }
  }
  const combinedSource = shuffleArray(Array.from(uniqueByWord.values())).slice(0, 50);

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const demoDeck: UserVocabItem[] = combinedSource.map((w, idx) => {
    const base = toUserVocabItem(w, nowIso);
    if (idx < 20) {
      return {
        ...base,
        status: 'MASTERED',
        repetitions: 5,
        intervalDays: 14,
        timesCorrect: 5,
        timesIncorrect: 1,
        nextReviewAt: new Date(now + 7 * 86400000).toISOString(),
        writingCorrectCount: idx < 6 ? 1 : 0,
        writingMastered: idx < 6,
      };
    }
    return base;
  });

  writeJson(scopedKey(STORAGE_KEY, DEMO_USER_ID), demoDeck);
  writeJson(onboardingKey, {
    completed: true,
    selectedTopics: ['business', 'technology'],
    createdAt: nowIso,
  } satisfies OnboardingState);

  const todayStr = new Date().toISOString().split('T')[0];
  writeJson(scopedKey(STATS_KEY, DEMO_USER_ID), {
    streak: 5,
    lastActiveDate: todayStr,
    wordsLearnedToday: 5,
    reviewsCompletedToday: 8,
  } satisfies DailyStats);
}

export function getOtherAccountWordSets(): Set<string>[] {
  if (typeof window === 'undefined') return [];
  const activeId = getActiveUserId();
  try {
    const rawAccounts = localStorage.getItem('vocabflow_accounts_v1');
    const accounts = rawAccounts ? (JSON.parse(rawAccounts) as Array<{ id?: string }>) : [];
    const sets: Set<string>[] = [];

    for (const acc of accounts) {
      if (!acc?.id || acc.id === activeId) continue;
      const words = readJson<UserVocabItem[]>(scopedKey(STORAGE_KEY, acc.id), []);
      if (words.length > 0) {
        sets.push(new Set(words.map((w) => w.word.trim().toLowerCase())));
      }
    }
    return sets;
  } catch {
    return [];
  }
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return { completed: true, selectedTopics: [] };
  }
  ensureDemoAccountData();
  const key = scopedKey(ONBOARDING_KEY);
  const existing = readJson<OnboardingState | null>(key, null);
  if (existing) return existing;

  const words = getStoredUserVocab();
  if (words.length >= 10) {
    const autoState: OnboardingState = {
      completed: true,
      selectedTopics: ['business'],
      createdAt: new Date().toISOString(),
    };
    writeJson(key, autoState);
    return autoState;
  }

  return { completed: false, selectedTopics: [] };
}

export function completeOnboardingWithDeck(
  words: WordItem[],
  selectedTopics: string[],
  customTopic?: string
): void {
  if (typeof window === 'undefined' || !getActiveUserId()) return;

  const existingList = getStoredUserVocab();
  const existingKeys = new Set(existingList.map((item) => item.word.toLowerCase()));
  const nowIso = new Date().toISOString();

  const mapped: UserVocabItem[] = [];
  for (const w of words) {
    const cleanWord = w.word.trim().toLowerCase();
    if (existingKeys.has(cleanWord)) continue;
    existingKeys.add(cleanWord);
    mapped.push(toUserVocabItem(w, nowIso));
  }

  saveStoredUserVocab([...mapped, ...existingList]);

  const state: OnboardingState = {
    completed: true,
    selectedTopics,
    customTopic,
    createdAt: nowIso,
  };
  writeJson(scopedKey(ONBOARDING_KEY), state);

  updateStoredStats((prev) => ({
    ...prev,
    wordsLearnedToday: prev.wordsLearnedToday + mapped.length,
  }));

  window.dispatchEvent(new Event('vocabflow_onboarding_updated'));
}

export function getStoredUserVocab(): UserVocabItem[] {
  if (!getActiveUserId()) return [];
  ensureDemoAccountData();
  return readJson<UserVocabItem[]>(scopedKey(STORAGE_KEY), []);
}

export function saveStoredUserVocab(items: UserVocabItem[]): void {
  if (typeof window === 'undefined' || !getActiveUserId()) return;
  writeJson(scopedKey(STORAGE_KEY), items);
  window.dispatchEvent(new Event('vocabflow_storage_updated'));
}

export function getStoredStats(): DailyStats {
  if (typeof window === 'undefined' || !getActiveUserId()) {
    return { streak: 1, lastActiveDate: '', wordsLearnedToday: 0, reviewsCompletedToday: 0 };
  }
  ensureDemoAccountData();
  const key = scopedKey(STATS_KEY);
  const todayStr = new Date().toISOString().split('T')[0];
  const stored = readJson<DailyStats | null>(key, null);

  if (!stored) {
    const initial: DailyStats = {
      streak: 1,
      lastActiveDate: todayStr,
      wordsLearnedToday: 0,
      reviewsCompletedToday: 0,
    };
    writeJson(key, initial);
    return initial;
  }

  if (stored.lastActiveDate !== todayStr) {
    const last = new Date(stored.lastActiveDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 3600 * 24));
    const rolled: DailyStats = {
      streak: diffDays === 1 ? stored.streak + 1 : diffDays > 1 ? 1 : stored.streak,
      lastActiveDate: todayStr,
      wordsLearnedToday: 0,
      reviewsCompletedToday: 0,
    };
    writeJson(key, rolled);
    return rolled;
  }

  return stored;
}

export function updateStoredStats(modifier: (prev: DailyStats) => DailyStats): DailyStats {
  const current = getStoredStats();
  const updated = modifier(current);
  if (typeof window !== 'undefined' && getActiveUserId()) {
    writeJson(scopedKey(STATS_KEY), updated);
    window.dispatchEvent(new Event('vocabflow_stats_updated'));
  }
  return updated;
}

export function addWordToBank(wordItem: WordItem): {
  success: boolean;
  item?: UserVocabItem;
  message: string;
} {
  const list = getStoredUserVocab();
  const cleanWord = wordItem.word.trim().toLowerCase();

  const exists = list.some(
    (item) =>
      item.word.toLowerCase() === cleanWord ||
      item.wordId.toLowerCase() === wordItem.id.toLowerCase()
  );

  if (exists) {
    return { success: false, message: `Từ "${wordItem.word}" đã có trong kho lưu trữ của bạn!` };
  }

  const newItem = toUserVocabItem(wordItem, new Date().toISOString());
  saveStoredUserVocab([newItem, ...list]);

  updateStoredStats((prev) => ({
    ...prev,
    wordsLearnedToday: prev.wordsLearnedToday + 1,
  }));

  return { success: true, item: newItem, message: `Đã thêm "${wordItem.word}" vào kho thành công!` };
}

export function addBatchWordsToBank(words: WordItem[]): {
  success: boolean;
  addedCount: number;
  skippedCount: number;
  message: string;
} {
  const list = getStoredUserVocab();
  const existingWords = new Set(list.map((item) => item.word.toLowerCase()));
  const nowIso = new Date().toISOString();

  const newItems: UserVocabItem[] = [];
  let skippedCount = 0;

  for (const wordItem of words) {
    const cleanWord = wordItem.word.trim().toLowerCase();
    if (existingWords.has(cleanWord) || existingWords.has(wordItem.id.toLowerCase())) {
      skippedCount++;
      continue;
    }
    newItems.push(toUserVocabItem(wordItem, nowIso));
    existingWords.add(cleanWord);
  }

  if (newItems.length === 0) {
    return {
      success: false,
      addedCount: 0,
      skippedCount,
      message: 'Tất cả các từ này đều đã có trong kho lưu trữ của bạn!',
    };
  }

  saveStoredUserVocab([...newItems, ...list]);

  updateStoredStats((prev) => ({
    ...prev,
    wordsLearnedToday: prev.wordsLearnedToday + newItems.length,
  }));

  return {
    success: true,
    addedCount: newItems.length,
    skippedCount,
    message: `Đã nạp thành công ${newItems.length} từ vựng mới vào kho!${
      skippedCount > 0 ? ` (Bỏ qua ${skippedCount} từ đã có)` : ''
    }`,
  };
}

function findWordIndex(list: UserVocabItem[], wordId: string): number {
  const needle = wordId.toLowerCase();
  return list.findIndex(
    (w) =>
      w.id.toLowerCase() === needle ||
      w.wordId.toLowerCase() === needle ||
      w.word.toLowerCase() === needle
  );
}

export function recordQuizAttempt(
  wordId: string,
  isCorrect: boolean
): {
  updatedItem: UserVocabItem | null;
  previousStatus: VocabStatus | null;
  newStatus: VocabStatus | null;
  accuracyPercent: number;
  totalAttempts: number;
} {
  const list = [...getStoredUserVocab()];
  const index = findWordIndex(list, wordId);

  if (index === -1) {
    return {
      updatedItem: null,
      previousStatus: null,
      newStatus: null,
      accuracyPercent: 0,
      totalAttempts: 0,
    };
  }

  const current = list[index];
  const previousStatus = current.status;
  const srsResult = calculateQuizAttemptUpdate(current, isCorrect);

  const updated: UserVocabItem = {
    ...current,
    ...srsResult,
    lastReviewedAt: new Date().toISOString(),
  };

  list[index] = updated;
  saveStoredUserVocab(list);

  updateStoredStats((prev) => ({
    ...prev,
    reviewsCompletedToday: prev.reviewsCompletedToday + 1,
  }));

  const evalRes = evaluateQuizMastery(updated.timesCorrect, updated.timesIncorrect);

  return {
    updatedItem: updated,
    previousStatus,
    newStatus: updated.status,
    accuracyPercent: evalRes.accuracyPercent,
    totalAttempts: evalRes.totalAttempts,
  };
}

/**
 * Applies many quiz results (e.g. 50-question test submit) in one write + one event dispatch.
 */
export function recordQuizAttemptsBatch(
  attempts: Array<{ wordId: string; isCorrect: boolean }>
): void {
  if (attempts.length === 0) return;

  const list = [...getStoredUserVocab()];
  const nowIso = new Date().toISOString();
  let modified = false;

  for (const { wordId, isCorrect } of attempts) {
    const index = findWordIndex(list, wordId);
    if (index === -1) continue;
    const current = list[index];
    const srsResult = calculateQuizAttemptUpdate(current, isCorrect);
    list[index] = {
      ...current,
      ...srsResult,
      lastReviewedAt: nowIso,
    };
    modified = true;
  }

  if (modified) {
    saveStoredUserVocab(list);
  }

  updateStoredStats((prev) => ({
    ...prev,
    reviewsCompletedToday: prev.reviewsCompletedToday + attempts.length,
  }));
}

/**
 * Update SRS schedule after writing practice (excludes quiz accuracy metrics).
 */
export function recordWordReview(wordId: string, grade: ReviewGrade): UserVocabItem | null {
  const list = [...getStoredUserVocab()];
  const index = findWordIndex(list, wordId);
  if (index === -1) return null;

  const current = list[index];
  const srsResult = calculateNextSRS(current, grade, false);
  const updated: UserVocabItem = {
    ...current,
    ...srsResult,
    lastReviewedAt: new Date().toISOString(),
  };

  list[index] = updated;
  saveStoredUserVocab(list);

  updateStoredStats((prev) => ({
    ...prev,
    reviewsCompletedToday: prev.reviewsCompletedToday + 1,
  }));

  return updated;
}

export function getDueReviewWords(): UserVocabItem[] {
  const list = getStoredUserVocab();
  const now = Date.now();
  return list.filter((item) => new Date(item.nextReviewAt).getTime() <= now);
}

export function deleteWordFromBank(wordId: string): void {
  const list = getStoredUserVocab();
  saveStoredUserVocab(list.filter((w) => w.id !== wordId && w.wordId !== wordId));
}

export function getTestHistory(): TestHistoryRecord[] {
  if (!getActiveUserId()) return [];
  return readJson<TestHistoryRecord[]>(scopedKey(TEST_HISTORY_KEY), []);
}

export function saveTestHistoryRecord(record: TestHistoryRecord): void {
  if (typeof window === 'undefined' || !getActiveUserId()) return;
  const updated = [record, ...getTestHistory()].slice(0, 20);
  writeJson(scopedKey(TEST_HISTORY_KEY), updated);
  window.dispatchEvent(new Event('vocabflow_test_updated'));
}

export function getWritingHistory(): WritingAttempt[] {
  if (!getActiveUserId()) return [];
  return readJson<WritingAttempt[]>(scopedKey(WRITING_HISTORY_KEY), []);
}

export function recordWritingParagraphAttempt(attempt: WritingAttempt): void {
  if (typeof window === 'undefined' || !getActiveUserId()) return;

  const updatedHistory = [attempt, ...getWritingHistory()].slice(0, 30);
  writeJson(scopedKey(WRITING_HISTORY_KEY), updatedHistory);

  if (attempt.usedTargetWords.length > 0 && attempt.score >= 60) {
    const vocabList = getStoredUserVocab();
    const usedSet = new Set(attempt.usedTargetWords.map((w) => w.toLowerCase()));

    const updatedList = vocabList.map((item) => {
      if (usedSet.has(item.word.toLowerCase())) {
        const nextWritingCount = (item.writingCorrectCount || 0) + 1;
        return {
          ...item,
          writingCorrectCount: nextWritingCount,
          writingMastered: attempt.score >= 65 || nextWritingCount >= 1,
        };
      }
      return item;
    });
    saveStoredUserVocab(updatedList);
  }

  window.dispatchEvent(new Event('vocabflow_writing_updated'));
}
