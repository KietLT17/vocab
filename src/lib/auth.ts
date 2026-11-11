import { CEFRLevel, StudyModePreference, UserProfile } from './types';

// ponytail: client-only local account registry for fixed/sample accounts (browser storage ceiling;
// upgrade path: replace with backend auth API + session cookie when deploying multi-device sync).

const ACCOUNTS_KEY = 'vocabflow_accounts_v1';
const ACTIVE_USER_KEY = 'vocabflow_active_user_v1';
export const DEMO_USER_ID = 'u_demo';
export const SAMPLE_STUDENT_USER_ID = 'u_hocvien';

interface StoredAccountRecord extends UserProfile {
  passwordHash: string;
}

const SAMPLE_DEFINITIONS: Array<{
  id: string;
  username: string;
  password: string;
  displayName: string;
  targetLevel: CEFRLevel;
  dailyGoalReviews: number;
  preferredStudyMode: StudyModePreference;
  favoriteTopics: string[];
  avatarColor: string;
}> = [
    {
      id: DEMO_USER_ID,
      username: 'demo',
      password: '123456',
      displayName: 'Minh Anh',
      targetLevel: 'C1',
      dailyGoalReviews: 20,
      preferredStudyMode: 'COMBO',
      favoriteTopics: ['business', 'technology'],
      avatarColor: 'from-blue-600 to-indigo-600',
    },
    {
      id: SAMPLE_STUDENT_USER_ID,
      username: 'hocvien',
      password: '123456',
      displayName: 'Học viên mới',
      targetLevel: 'B2',
      dailyGoalReviews: 15,
      preferredStudyMode: 'LISTEN_ONLY',
      favoriteTopics: ['daily_life'],
      avatarColor: 'from-emerald-600 to-teal-600',
    },
  ];

async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `${salt}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv-${(hash >>> 0).toString(16)}`;
}

function readAccountRecords(): StoredAccountRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccountRecords(records: StoredAccountRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(records));
}

async function ensureSampleAccountsSeeded(): Promise<StoredAccountRecord[]> {
  const existing = readAccountRecords();
  const byId = new Set(existing.map((a) => a.id));
  let changed = false;

  for (const sample of SAMPLE_DEFINITIONS) {
    if (byId.has(sample.id)) continue;
    const passwordHash = await hashPassword(sample.password, sample.id);
    existing.push({
      id: sample.id,
      username: sample.username,
      displayName: sample.displayName,
      targetLevel: sample.targetLevel,
      dailyGoalReviews: sample.dailyGoalReviews,
      preferredStudyMode: sample.preferredStudyMode,
      favoriteTopics: sample.favoriteTopics,
      avatarColor: sample.avatarColor,
      createdAt: new Date().toISOString(),
      passwordHash,
    });
    changed = true;
  }

  if (changed) {
    writeAccountRecords(existing);
  }
  return existing;
}

function toProfile(record: StoredAccountRecord): UserProfile {
  return {
    id: record.id,
    username: record.username,
    displayName: record.displayName,
    targetLevel: record.targetLevel,
    dailyGoalReviews: record.dailyGoalReviews,
    preferredStudyMode: record.preferredStudyMode,
    favoriteTopics: record.favoriteTopics,
    avatarColor: record.avatarColor,
    createdAt: record.createdAt,
  };
}

export function getActiveUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ACTIVE_USER_KEY);
  if (!raw || raw === 'guest') return null;
  return raw;
}

export function getActiveUserProfile(): UserProfile | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;

  const stored = readAccountRecords().find((acc) => acc.id === activeId);
  if (stored) return toProfile(stored);

  const sample = SAMPLE_DEFINITIONS.find((s) => s.id === activeId);
  if (sample) {
    return {
      id: sample.id,
      username: sample.username,
      displayName: sample.displayName,
      targetLevel: sample.targetLevel,
      dailyGoalReviews: sample.dailyGoalReviews,
      preferredStudyMode: sample.preferredStudyMode,
      favoriteTopics: sample.favoriteTopics,
      avatarColor: sample.avatarColor,
      createdAt: new Date().toISOString(),
    };
  }
  return null;
}



function notifyAccountChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('vocabflow_account_changed'));
  window.dispatchEvent(new Event('vocabflow_storage_updated'));
  window.dispatchEvent(new Event('vocabflow_stats_updated'));
  window.dispatchEvent(new Event('vocabflow_onboarding_updated'));
}

export async function loginAccount(
  usernameInput: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: UserProfile }> {
  const username = usernameInput.trim().toLowerCase();
  const records = await ensureSampleAccountsSeeded();
  const match = records.find((acc) => acc.username.toLowerCase() === username);

  if (!match) {
    return { ok: false, error: `Không tìm thấy tài khoản "${usernameInput}".` };
  }

  const expectedHash = await hashPassword(password, match.id);
  if (expectedHash !== match.passwordHash) {
    return { ok: false, error: 'Mật khẩu chưa chính xác.' };
  }

  localStorage.setItem(ACTIVE_USER_KEY, match.id);
  notifyAccountChanged();

  return { ok: true, user: toProfile(match) };
}

export function logoutAccount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_USER_KEY);
  notifyAccountChanged();
}

export function updateActiveUserProfile(
  patch: Partial<{
    displayName: string;
    targetLevel: CEFRLevel;
    dailyGoalReviews: number;
    preferredStudyMode: StudyModePreference;
    favoriteTopics: string[];
    avatarColor: string;
  }>
): UserProfile | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;

  const records = readAccountRecords();
  const index = records.findIndex((acc) => acc.id === activeId);
  if (index === -1) return null;

  const updated: StoredAccountRecord = {
    ...records[index],
    ...patch,
    displayName: patch.displayName?.trim() || records[index].displayName,
  };
  records[index] = updated;
  writeAccountRecords(records);
  notifyAccountChanged();

  return toProfile(updated);
}
