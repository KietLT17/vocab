'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  LogIn,
  LogOut,
  Save,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import {
  getActiveUserProfile,
  // listSampleAccountsOverview,
  loginAccount,
  logoutAccount,
  updateActiveUserProfile,
} from '../lib/auth';
import { CEFRLevel, StudyModePreference, UserProfile } from '../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_OPTIONS: CEFRLevel[] = ['A2', 'B1', 'B2', 'C1'];
const GOAL_OPTIONS = [10, 15, 20, 30, 50];
const MODE_CHOICES: Array<{ id: StudyModePreference; label: string }> = [
  { id: 'COMBO', label: 'Tổng hợp 3 kỹ năng' },
  { id: 'LISTEN_ONLY', label: 'Chỉ Luyện Nghe' },
  { id: 'READ_ONLY', label: 'Chỉ Luyện Đọc' },
  { id: 'WRITE_ONLY', label: 'Chỉ Luyện Viết' },
];

export default function AccountModal({ isOpen, onClose }: Props) {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Profile personalization fields when signed in
  const [displayName, setDisplayName] = useState('');
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>('B2');
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [preferredMode, setPreferredMode] = useState<StudyModePreference>('COMBO');

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //const sampleAccounts = listSampleAccountsOverview();

  const syncFromStorage = () => {
    const profile = getActiveUserProfile();
    setActiveUser(profile);
    setError(null);
    setNotice(null);

    if (profile) {
      setDisplayName(profile.displayName);
      setTargetLevel(profile.targetLevel);
      setDailyGoal(profile.dailyGoalReviews);
      setPreferredMode(profile.preferredStudyMode);
    }
  };

  useEffect(() => {
    if (isOpen) {
      syncFromStorage();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await loginAccount(username, password);
    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Đăng nhập thất bại.');
      return;
    }
    setPassword('');
    onClose();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateActiveUserProfile({
      displayName,
      targetLevel,
      dailyGoalReviews: dailyGoal,
      preferredStudyMode: preferredMode,
    });
    if (updated) {
      setActiveUser(updated);
      setNotice('Đã lưu hồ sơ cá nhân hóa!');
    }
  };

  const handleLogout = () => {
    logoutAccount();
    setActiveUser(null);
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {!activeUser ? <LogIn size={18} /> : <UserCheck size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {!activeUser ? 'Đăng nhập VocabFlow' : `Hồ sơ của ${activeUser.displayName}`}
              </h2>
              <p className="text-[11px] text-slate-500">
                {!activeUser
                  ? 'Đăng nhập để mở khóa kho từ, luyện tập & mục tiêu cá nhân'
                  : `@${activeUser.username} • Mục tiêu ${activeUser.targetLevel}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!activeUser ? (
            <>

              {error && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800">
                  {error}
                </p>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="demo hoặc hocvien"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${activeUser.avatarColor} text-white font-extrabold text-lg flex items-center justify-center shrink-0`}
                >
                  {activeUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {activeUser.displayName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    Kho từ &amp; điểm thi riêng cho @{activeUser.username}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Trình độ mục tiêu
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as CEFRLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Mục tiêu {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Mục tiêu mỗi ngày
                  </label>
                  <select
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    {GOAL_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} lượt / ngày
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Cách học ưu tiên ở mục Luyện tập
                </label>
                <select
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value as StudyModePreference)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                >
                  {MODE_CHOICES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {notice && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> {notice}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Save size={15} /> Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <LogOut size={15} /> Đăng xuất
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
