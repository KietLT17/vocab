'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Onboarding50Modal from '../components/Onboarding50Modal';
import { getActiveUserProfile } from '../lib/auth';
import { getMasteredTestReadiness } from '../data/questionBank';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Play,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Headphones,
  Layers,
  ClipboardCheck,
  FileText,
  Lock,
  UserCircle2,
} from 'lucide-react';
import { WordItem, UserVocabItem, DailyStats, UserProfile } from '../lib/types';
import {
  getOnboardingState,
  getStoredUserVocab,
  getStoredStats,
  getDueReviewWords,
  addWordToBank,
  addBatchWordsToBank,
} from '../lib/storage';
import { fetchRandomWordExcluding } from '../lib/dictionaryApi';
import { TOPIC_CATEGORIES, getRandomTopicWords } from '../data/topicsVocabulary';
import AudioPlayerButton from '../components/AudioPlayerButton';
import SentenceAudioButton from '../components/SentenceAudioButton';
import VocabCard from '../components/VocabCard';

function LandingIntroPage() {
  // const sampleAccounts = listSampleAccountsOverview();
  const openLogin = () => {
    window.dispatchEvent(new Event('vocabflow_open_account_modal'));
  };

  return (
    <div className="space-y-10 py-2">
      {/* Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 border border-slate-800 shadow-sm">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <Sparkles size={14} />
            <span>VocabFlow • Hệ thống học từ vựng tiếng Anh cá nhân hóa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Học sâu theo ngữ cảnh, luyện đủ 3 kỹ năng & kiểm tra chuẩn xác
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Thay vì học vẹt từng từ rời rạc, VocabFlow tổ chức lộ trình từ kho 50 từ theo chủ đề,
            tách riêng luyện <strong className="text-white">Nghe • Đọc ngữ cảnh • Viết</strong> và đánh giá mức độ
            <strong className="text-white"> Đã thuộc (&gt; 65% qua tối thiểu 4 lượt)</strong> trước khi mở khóa đề thi 50 câu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={openLogin}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition"
            >
              <UserCircle2 size={18} />
              <span>Đăng nhập để bắt đầu học</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Core Learning Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Phương pháp & tính năng nổi bật
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">1. Kho 50 từ theo chủ đề</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Chọn hoặc nhập chủ đề yêu thích khi bắt đầu; bổ sung linh hoạt cụm 5–10 từ kèm phiên âm IPA và ví dụ thực tế.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">2. Luyện tách 3 kỹ năng</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Chủ động chọn Luyện Nghe, Đọc hiểu câu (kèm dịch câu & giải thích đáp án) hoặc Viết từ chính tả và Nghe rảnh tay.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">3. Test tổng hợp 50 câu</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Chỉ mở khóa khi đủ 50 câu từ kho từ <strong className="text-slate-700 dark:text-slate-300">Đã thuộc</strong>; kiểm tra ngữ nghĩa, từ loại, các thì, collocation, giới từ & idiom.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">4. Kiểm tra Viết đoạn</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Bài test viết đoạn văn theo chủ đề với bộ từ khóa gợi ý và chấm điểm độc lập với trắc nghiệm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const sync = () => setActiveUser(getActiveUserProfile());
    setMounted(true);
    sync();
    window.addEventListener('vocabflow_account_changed', sync);
    return () => window.removeEventListener('vocabflow_account_changed', sync);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-400">
        Đang tải VocabFlow...
      </div>
    );
  }

  if (!activeUser) {
    return <LandingIntroPage />;
  }

  return <AuthenticatedDashboard key={activeUser.id} />;
}

function AuthenticatedDashboard() {
  const [stats, setStats] = useState<DailyStats>({
    streak: 1,
    lastActiveDate: '',
    wordsLearnedToday: 0,
    reviewsCompletedToday: 0,
  });
  const [userVocab, setUserVocab] = useState<UserVocabItem[]>([]);
  const [dueWords, setDueWords] = useState<UserVocabItem[]>([]);

  // Random Word Card State
  const [randomWord, setRandomWord] = useState<WordItem | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  // Topic Batch State
  const [selectedHomeTopic, setSelectedHomeTopic] = useState<string>('business');
  const [homeBatchCount, setHomeBatchCount] = useState<number>(5);
  const [homeTopicWords, setHomeTopicWords] = useState<WordItem[]>([]);
  const [homeBatchFeedback, setHomeBatchFeedback] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  const loadData = () => {
    const v = getStoredUserVocab();
    setUserVocab(v);
    setStats(getStoredStats());
    setDueWords(getDueReviewWords());
    setActiveUser(getActiveUserProfile());
    return v;
  };

  const generateHomeBatch = (topicId: string = selectedHomeTopic, count: number = homeBatchCount) => {
    setHomeBatchFeedback(null);
    const v = getStoredUserVocab();
    const excluded = new Set(v.map((item) => item.word.toLowerCase()));
    const words = getRandomTopicWords(topicId, count, excluded);
    setHomeTopicWords(words);
  };

  const loadNewRandomWord = async () => {
    setIsLoadingRandom(true);
    setAddFeedback(null);

    const v = getStoredUserVocab();
    const excluded = new Set(v.map((item) => item.word.toLowerCase()));

    const word = await fetchRandomWordExcluding(excluded);
    setRandomWord(word);
    setIsLoadingRandom(false);
  };

  useEffect(() => {
    const syncAccountAndOnboarding = () => {
      const currentWords = loadData();
      const onboarding = getOnboardingState();
      setShowOnboarding(!onboarding.completed && currentWords.length === 0);
    };

    syncAccountAndOnboarding();
    loadNewRandomWord();
    generateHomeBatch('business', 5);

    const handleStorageChange = () => loadData();
    const handleAccountChange = () => {
      syncAccountAndOnboarding();
      loadNewRandomWord();
      generateHomeBatch(selectedHomeTopic, homeBatchCount);
    };

    window.addEventListener('vocabflow_storage_updated', handleStorageChange);
    window.addEventListener('vocabflow_stats_updated', handleStorageChange);
    window.addEventListener('vocabflow_onboarding_updated', syncAccountAndOnboarding);
    window.addEventListener('vocabflow_account_changed', handleAccountChange);
    return () => {
      window.removeEventListener('vocabflow_storage_updated', handleStorageChange);
      window.removeEventListener('vocabflow_stats_updated', handleStorageChange);
      window.removeEventListener('vocabflow_onboarding_updated', syncAccountAndOnboarding);
      window.removeEventListener('vocabflow_account_changed', handleAccountChange);
    };
  }, []);

  const handleSaveHomeBatch = () => {
    if (homeTopicWords.length === 0) return;
    const res = addBatchWordsToBank(homeTopicWords);
    setHomeBatchFeedback(res.message);
    if (res.success) {
      loadData();
      setTimeout(() => {
        generateHomeBatch(selectedHomeTopic, homeBatchCount);
        setHomeBatchFeedback(null);
      }, 1500);
    }
  };

  const handleSaveRandomWord = () => {
    if (!randomWord) return;
    const res = addWordToBank(randomWord);
    setAddFeedback(res.message);
    if (res.success) {
      loadData();
      // Load next random word after a short delay
      setTimeout(() => {
        loadNewRandomWord();
        setAddFeedback(null);
      }, 1500);
    }
  };

  const masteredCount = useMemo(
    () => userVocab.filter((w) => w.status === 'MASTERED').length,
    [userVocab]
  );
  const testReadiness = useMemo(() => getMasteredTestReadiness(userVocab), [userVocab]);
  const dailyGoalTarget = activeUser?.dailyGoalReviews || 20;
  const dailyGoalPct = Math.min(100, Math.round((stats.reviewsCompletedToday / dailyGoalTarget) * 100));

  return (
    <div className="space-y-8">
      {/* 1. Header & Hero Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeUser
                ? `Chào ${activeUser.displayName}! Mục tiêu ${activeUser.targetLevel} hôm nay 🚀`
                : 'Chào ngày mới! Sẵn sàng nâng cấp vốn từ? 🚀'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Học sâu qua ngữ cảnh, luyện đủ Nghe - Đọc - Viết và ghi nhớ bền vững với SRS.
            </p>
          </div>

          {activeUser ? (
            <div className="sm:w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Mục tiêu hôm nay</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {stats.reviewsCompletedToday}/{dailyGoalTarget} lượt ({dailyGoalPct}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new Event('vocabflow_open_account_modal'))}
              className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 shadow-sm transition shrink-0"
            >
              <UserCircle2 size={16} />
              <span>Đăng nhập / Lưu hồ sơ cá nhân</span>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Flame size={20} className="fill-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Chuỗi Streak</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {stats.streak} <span className="text-sm font-semibold text-slate-500">ngày</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/60 dark:border-blue-800/40">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <BookOpen size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Kho từ vựng</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {userVocab.length} <span className="text-sm font-semibold text-slate-500">từ</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-200/60 dark:border-rose-800/40">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Clock size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Cần ôn hôm nay</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {dueWords.length} <span className="text-sm font-semibold text-slate-500">từ</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Đã làm chủ</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              {masteredCount} <span className="text-sm font-semibold text-slate-500">từ</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Banner: Ready to Review SRS */}
      {dueWords.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Clock size={14} /> SRS Hàng đợi ôn tập
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Bạn có {dueWords.length} từ đến lịch ôn tập hôm nay
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Ôn đúng thời điểm theo chu kỳ quên giúp bạn nhớ từ vựng sâu hơn 80% so với cách học thông thường.
            </p>
          </div>

          <Link
            href="/practice"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-600 hover:bg-blue-50 active:scale-95 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Play size={18} className="fill-blue-600" />
            <span>Bắt đầu ôn ngay</span>
          </Link>
        </div>
      )}

      {/* Quick Hands-free Audio Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Headphones size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">Chế độ Nghe Thụ Động (Hands-free 🎧)</h3>
            <p className="text-xs text-indigo-200">
              Cắm tai nghe nghe tự động: Từ vựng &rarr; Nghĩa tiếng Việt &rarr; Câu ngữ cảnh khi đang di chuyển.
            </p>
          </div>
        </div>

        <Link
          href="/handsfree"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-md shadow-indigo-600/30"
        >
          Bật nghe
        </Link>
      </div>

      {/* 2.5. Section: Nạp Cụm 5-10 Từ Ngẫu Nhiên Theo Chủ Đề */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Nạp cụm từ ngẫu nhiên theo chủ đề
              </h2>
              <p className="text-xs text-slate-500">
                Chọn chủ đề và nạp nhanh 5–10 từ mới vào kho để bắt đầu chu trình luyện tập.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-500">Số lượng:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setHomeBatchCount(5);
                  generateHomeBatch(selectedHomeTopic, 5);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${homeBatchCount === 5 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
              >
                5 từ
              </button>
              <button
                onClick={() => {
                  setHomeBatchCount(10);
                  generateHomeBatch(selectedHomeTopic, 10);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${homeBatchCount === 10 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
              >
                10 từ
              </button>
            </div>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TOPIC_CATEGORIES.map((cat) => {
            const isSelected = selectedHomeTopic === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedHomeTopic(cat.id);
                  generateHomeBatch(cat.id, homeBatchCount);
                }}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition active:scale-95 ${isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-bold truncate">{cat.name.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Generated Words List */}
        {homeTopicWords.length > 0 ? (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Cụm {homeTopicWords.length} từ ngẫu nhiên được chọn:</span>
              <button
                onClick={() => generateHomeBatch(selectedHomeTopic, homeBatchCount)}
                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold normal-case"
              >
                <RefreshCw size={12} /> Đổi cụm khác
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {homeTopicWords.map((w, idx) => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-40 font-bold">{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize truncate">
                        {w.word}
                      </span>
                      <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 shrink-0">
                        {w.ipa}
                      </span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 font-medium truncate mt-0.5">
                      {w.definitions[0]?.vietnameseMeaning}
                    </p>
                  </div>

                  <AudioPlayerButton
                    audioUrl={w.audioUrl}
                    word={w.word}
                    size={14}
                    className="w-7 h-7 shrink-0"
                  />
                </div>
              ))}
            </div>

            {homeBatchFeedback && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {homeBatchFeedback}
              </p>
            )}

            <button
              onClick={handleSaveHomeBatch}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
            >
              <Plus size={18} className="stroke-[3]" />
              <span>Lưu cả cụm {homeTopicWords.length} từ này vào kho học ngay</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Bạn đã nạp hết các từ thuộc chủ đề này vào kho! Hãy chọn chủ đề khác nhé.
          </p>
        )}
      </section>

      {/* 3. Section: Từ Ngẫu Nhiên Mỗi Ngày / Mỗi Lần Thêm (Không Trùng Lặp) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Từ vựng ngẫu nhiên hôm nay
              </h2>
              <p className="text-xs text-slate-500">
                Lọc tự động từ nguồn từ điển chuẩn Oxford/Cambridge, đảm bảo không trùng lặp kho đã lưu.
              </p>
            </div>
          </div>

          <button
            onClick={loadNewRandomWord}
            disabled={isLoadingRandom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            title="Đổi một từ ngẫu nhiên khác"
          >
            <RefreshCw size={14} className={isLoadingRandom ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Đổi từ khác</span>
          </button>
        </div>

        {/* Random Card Display */}
        {randomWord ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {randomWord.word}
                  </h3>
                  {randomWord.level && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {randomWord.level}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {randomWord.pos}
                  </span>
                  <span className="text-sm font-mono text-purple-600 dark:text-purple-400 font-medium">
                    {randomWord.ipa}
                  </span>
                </div>
              </div>

              {/* Native Audio button */}
              <div className="flex items-center gap-3">
                <AudioPlayerButton
                  audioUrl={randomWord.audioUrl}
                  word={randomWord.word}
                  size={24}
                  className="w-12 h-12"
                />
              </div>
            </div>

            {/* Meaning & Definition */}
            <div className="space-y-1">
              {randomWord.definitions[0]?.vietnameseMeaning && (
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {randomWord.definitions[0].vietnameseMeaning}
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {randomWord.definitions[0]?.definition}
              </p>
            </div>

            {/* Contextual Sentence */}
            {randomWord.definitions[0]?.example && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ngữ cảnh ứng dụng:
                  </span>
                  <SentenceAudioButton sentence={randomWord.definitions[0].example} size={14} />
                </div>
                <p className="text-sm italic text-slate-700 dark:text-slate-300 font-serif">
                  "{randomWord.definitions[0].example}"
                </p>
              </div>
            )}

            {/* Collocations */}
            {randomWord.collocations && randomWord.collocations.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-medium">Cụm từ hay gặp:</span>
                {randomWord.collocations.map((col, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {col}
                  </span>
                ))}
              </div>
            )}

            {/* Feedback & Action */}
            {addFeedback && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {addFeedback}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveRandomWord}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
              >
                <Plus size={18} className="stroke-[3]" />
                <span>Lưu từ này vào kho học</span>
              </button>

              <button
                onClick={loadNewRandomWord}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition"
              >
                Bỏ qua, tìm từ khác
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center">
            <p className="text-slate-500 font-medium text-sm">
              Bạn đã lưu hết tất cả các từ trong kho từ điển ban đầu! Hãy nhập thêm từ mới bằng ô tìm kiếm.
            </p>
          </div>
        )}
      </section>

      {/* 3.5 Section: Trung tâm Học tách kỹ năng & Đánh giá năng lực */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/practice"
          className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm transition flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              Học tách riêng Nghe / Đọc / Viết
            </h3>
            <p className="text-xs text-slate-500">
              Tự chọn học cụm 5–10 từ theo đúng kỹ năng bạn muốn rèn hôm nay.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
            Vào luyện tập <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/test"
          className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm transition flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ClipboardCheck size={20} />
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${testReadiness.isEligible
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
              >
                {!testReadiness.isEligible && <Lock size={11} />}
                {testReadiness.availableQuestionsCount}/{testReadiness.requiredQuestions} câu thuộc
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              Test Tổng hợp 50 Câu ({masteredCount} từ thuộc)
            </h3>
            <p className="text-xs text-slate-500">
              Chỉ mở khóa khi đủ 50 câu từ các từ Đã thuộc (&ge;4 lượt &amp; &gt;65%) gồm Ngữ nghĩa, Từ loại, Thì, Collocation, Giới từ &amp; Idiom.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
            {testReadiness.isEligible ? 'Làm bài kiểm tra 50 câu' : 'Xem tiến độ mở khóa bài Test'} <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/writing"
          className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm transition flex flex-col justify-between gap-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
              Test Viết đoạn theo Chủ đề
            </h3>
            <p className="text-xs text-slate-500">
              Chấm điểm bài viết đoạn trên thang 100 riêng biệt, không ảnh hưởng điểm trắc nghiệm.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1">
            Mở phòng thi Viết đoạn <ArrowRight size={14} />
          </span>
        </Link>
      </section>

      {/* 4. Section: Từ vựng gần đây trong kho */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Từ vựng gần đây trong kho ({userVocab.length})
            </h2>
            <p className="text-xs text-slate-500">
              Nhấp vào biểu tượng loa để nghe phát âm bất kỳ lúc nào.
            </p>
          </div>

          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {userVocab.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <GraduationCap size={40} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Kho từ của bạn đang trống. Hãy khởi tạo ngay bộ 50 từ theo chủ đề hoặc lưu từ ngẫu nhiên ở trên!
            </p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md"
            >
              <Sparkles size={16} />
              <span>Khởi tạo kho 50 từ theo chủ đề</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVocab.slice(0, 6).map((item) => (
              <VocabCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <Onboarding50Modal
        isOpen={showOnboarding}
        onCompleted={() => {
          setShowOnboarding(false);
          loadData();
        }}
      />
    </div>
  );
}

