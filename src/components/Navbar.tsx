'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Flame,
  Plus,
  GraduationCap,
  LayoutDashboard,
  BookmarkCheck,
  Headphones,
  ClipboardCheck,
  FileText,
  UserCircle2,
} from 'lucide-react';
import { getStoredStats, getDueReviewWords } from '../lib/storage';
import { getActiveUserProfile } from '../lib/auth';
import { UserProfile } from '../lib/types';

interface Props {
  onOpenAddModal: () => void;
  onOpenAccountModal: () => void;
}

export default function Navbar({ onOpenAddModal, onOpenAccountModal }: Props) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(1);
  const [dueCount, setDueCount] = useState(0);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  const refreshCounters = () => {
    const user = getActiveUserProfile();
    setActiveUser(user);
    if (user) {
      const stats = getStoredStats();
      setStreak(stats.streak || 1);
      setDueCount(getDueReviewWords().length);
    } else {
      setStreak(0);
      setDueCount(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    refreshCounters();
    window.addEventListener('vocabflow_storage_updated', refreshCounters);
    window.addEventListener('vocabflow_stats_updated', refreshCounters);
    window.addEventListener('vocabflow_account_changed', refreshCounters);
    return () => {
      window.removeEventListener('vocabflow_storage_updated', refreshCounters);
      window.removeEventListener('vocabflow_stats_updated', refreshCounters);
      window.removeEventListener('vocabflow_account_changed', refreshCounters);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              VocabFlow
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
              PWA
            </span>
          </div>
        </Link>

        {/* Navigation links (hidden until logged in) */}
        {mounted && activeUser && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} />
            Tổng quan
          </Link>

          <Link
            href="/practice"
            className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/practice'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap size={16} />
            Luyện tập
            {dueCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">
                {dueCount}
              </span>
            )}
          </Link>

          <Link
            href="/test"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/test'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardCheck size={16} />
            Test 50 câu
          </Link>

          <Link
            href="/writing"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/writing'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={16} />
            Viết đoạn
          </Link>

          <Link
            href="/vocabulary"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/vocabulary'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookmarkCheck size={16} />
            Kho từ
          </Link>

          <Link
            href="/handsfree"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/handsfree'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Headphones size={16} />
            Nghe rảnh tay
          </Link>
        </nav>
        )}

        {/* Right action bar: Login button when logged out; Streak + Account + Quick Add when logged in */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {mounted && activeUser && (
            <div
              title={`Chuỗi học tập liên tiếp: ${streak} ngày`}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full text-amber-700 dark:text-amber-400 text-xs font-semibold"
            >
              <Flame size={15} className="text-amber-500 fill-amber-500" />
              <span>{streak} ngày</span>
            </div>
          )}

          {/* Account / Login Button */}
          <button
            onClick={onOpenAccountModal}
            title={mounted && activeUser ? `Tài khoản: ${activeUser.displayName}` : 'Đăng nhập tài khoản'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
          >
            {mounted && activeUser ? (
              <>
                <span
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr ${activeUser.avatarColor} text-white text-[11px] font-bold flex items-center justify-center`}
                >
                  {activeUser.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[90px] truncate">{activeUser.displayName}</span>
              </>
            ) : (
              <>
                <UserCircle2 size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          {mounted && activeUser && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus size={16} className="stroke-[3]" />
              <span className="hidden sm:inline">Thêm từ</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

