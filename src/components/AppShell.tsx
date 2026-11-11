'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import AddWordModal from './AddWordModal';
import AccountModal from './AccountModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookmarkCheck,
  Headphones,
  ClipboardCheck,
  FileText,
  Layers,
  Lock,
  LogIn,
} from 'lucide-react';

const MOBILE_TABS = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard, activeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
  { href: '/flashcard', label: 'Flashcard', icon: Layers, activeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
  { href: '/practice', label: 'Luyện tập', icon: GraduationCap, activeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
  { href: '/vocabulary', label: 'Kho từ', icon: BookmarkCheck, activeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
  { href: '/test', label: 'Test 50', icon: ClipboardCheck, activeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' },
  { href: '/writing', label: 'Viết đoạn', icon: FileText, activeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50' },
  { href: '/handsfree', label: 'Rảnh tay', icon: Headphones, activeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' },
] as const;
import { getActiveUserProfile } from '../lib/auth';
import { UserProfile } from '../lib/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const syncUser = () => {
      const user = getActiveUserProfile();
      setActiveUser(user);
      if (!user) setIsAddModalOpen(false);
    };
    setMounted(true);
    syncUser();

    const openAccount = () => setIsAccountModalOpen(true);
    window.addEventListener('vocabflow_open_account_modal', openAccount);
    window.addEventListener('vocabflow_account_changed', syncUser);
    return () => {
      window.removeEventListener('vocabflow_open_account_modal', openAccount);
      window.removeEventListener('vocabflow_account_changed', syncUser);
    };
  }, []);

  const canRenderAppRoute = mounted && (Boolean(activeUser) || pathname === '/');

  return (
    <>
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      <main
        className={
          mounted && activeUser
            ? 'flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 lg:pb-12'
            : 'flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-12'
        }
      >
        {!mounted ? (
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-400">
            Đang tải VocabFlow...
          </div>
        ) : !canRenderAppRoute ? (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock size={26} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Vui lòng đăng nhập để học
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kho từ vựng, tiến độ luyện tập SRS và bài thi được cá nhân hóa theo tài khoản đăng nhập.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
              >
                <LogIn size={16} />
                <span>Đăng nhập ngay</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition"
              >
                Về trang giới thiệu
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Mobile Bottom Tab Bar (hidden before login, scrollable on narrow screens + safe-area) */}
      {mounted && activeUser && (
      <nav
        aria-label="Điều hướng di động"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-start sm:justify-around gap-1 overflow-x-auto no-scrollbar snap-x"
      >
        {MOBILE_TABS.map(({ href, label, icon: Icon, activeColor }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 snap-start min-w-[66px] flex flex-col items-center justify-center gap-0.5 text-[11px] py-1.5 px-2 rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? `${activeColor} font-bold`
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      )}

      {mounted && activeUser && (
        <AddWordModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddedSuccess={() => {
            // trigger re-render on listeners
          }}
        />
      )}

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
}

