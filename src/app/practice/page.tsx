'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Headphones,
  Layers,
  PenTool,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import DictationExercise from '../../components/DictationExercise';
import ClozeExercise from '../../components/ClozeExercise';
import WritingExercise from '../../components/WritingExercise';
import AudioPlayerButton from '../../components/AudioPlayerButton';
import { ReviewGrade, UserVocabItem } from '../../lib/types';
import { getDueReviewWords, getStoredUserVocab, recordWordReview } from '../../lib/storage';
import { getActiveUserProfile } from '../../lib/auth';
import { evaluateQuizMastery, MIN_ATTEMPTS_FOR_MASTERY } from '../../lib/srs';
import { shuffleArray } from '../../data/curatedDictionary';

type StudyMode = 'LISTEN_ONLY' | 'READ_ONLY' | 'WRITE_ONLY' | 'COMBO';
type WordFilter = 'ALL' | 'UNMASTERED' | 'DUE';
type Phase =
  | 'SETUP'
  | 'SECTION_LISTEN'
  | 'INTERLUDE_1'
  | 'SECTION_READ'
  | 'INTERLUDE_2'
  | 'SECTION_WRITE'
  | 'COMPLETED';

const MODE_OPTIONS: {
  id: StudyMode;
  title: string;
  subtitle: string;
  badge: string;
  quizNote: string;
  icon: typeof Headphones;
  activeClass: string;
}[] = [
  {
    id: 'LISTEN_ONLY',
    title: '1. Luyện Nghe & Chép chính tả',
    subtitle: 'Nghe audio & gõ lại chính xác từng từ trong cụm.',
    badge: 'Tính % Đã thuộc',
    quizNote: 'Cộng vào lịch sử trắc nghiệm tích lũy',
    icon: Headphones,
    activeClass: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30',
  },
  {
    id: 'READ_ONLY',
    title: '2. Luyện Đọc theo Ngữ cảnh',
    subtitle: 'Chọn từ điền chỗ trống + xem dịch câu & nghĩa 4 đáp án.',
    badge: 'Tính % Đã thuộc',
    quizNote: 'Cộng vào lịch sử trắc nghiệm tích lũy',
    icon: BookOpen,
    activeClass: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30',
  },
  {
    id: 'WRITE_ONLY',
    title: '3. Luyện Viết & Đặt câu',
    subtitle: 'Tự đặt câu vận dụng từng từ & xếp lịch ôn SRS.',
    badge: 'Không tính điểm trắc nghiệm',
    quizNote: 'Không cộng vào % trắc nghiệm (tách riêng bài viết đoạn)',
    icon: PenTool,
    activeClass: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30',
  },
  {
    id: 'COMBO',
    title: 'Tổng hợp cả 3 kỹ năng',
    subtitle: 'Nghe cả cụm -> Đọc cả cụm -> Đặt câu với cả cụm.',
    badge: 'Toàn diện',
    quizNote: 'Nghe + Đọc tính % trắc nghiệm; Viết chỉ tính SRS',
    icon: Layers,
    activeClass: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30',
  },
];

function buildCluster(
  words: UserVocabItem[],
  filter: WordFilter,
  size: number,
  shuffle: boolean
): UserVocabItem[] {
  let pool = words;
  if (filter === 'UNMASTERED') {
    const unmastered = words.filter((w) => w.status !== 'MASTERED');
    if (unmastered.length > 0) pool = unmastered;
  } else if (filter === 'DUE') {
    const now = Date.now();
    const due = words.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
    if (due.length > 0) pool = due;
  }

  const ordered = shuffle
    ? shuffleArray(pool)
    : [...pool].sort(
        (a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
      );

  return ordered.slice(0, Math.min(size, ordered.length));
}

export default function PracticePage() {
  const [allStoredWords, setAllStoredWords] = useState<UserVocabItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [batchSize, setBatchSize] = useState<number>(5);
  const [wordFilter, setWordFilter] = useState<WordFilter>('ALL');
  const [studyMode, setStudyMode] = useState<StudyMode>('COMBO');
  const [batch, setBatch] = useState<UserVocabItem[]>([]);
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [itemIndex, setItemIndex] = useState<number>(0);
  const [sessionReviews, setSessionReviews] = useState<{ wordId: string; grade: ReviewGrade }[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadWords = () => {
    const all = getStoredUserVocab();
    const due = getDueReviewWords();
    setAllStoredWords(all);
    setDueCount(due.length);
    return all;
  };

  useEffect(() => {
    setMounted(true);
    const syncAccountAndWords = () => {
      const profile = getActiveUserProfile();
      if (profile?.preferredStudyMode) {
        setStudyMode(profile.preferredStudyMode);
      }
      const all = loadWords();
      setBatch(buildCluster(all, 'ALL', 5, false));
      setPhase('SETUP');
      setItemIndex(0);
    };

    syncAccountAndWords();
    window.addEventListener('vocabflow_account_changed', syncAccountAndWords);
    return () => {
      window.removeEventListener('vocabflow_account_changed', syncAccountAndWords);
    };
  }, []);

  const refreshBatchWith = (filter: WordFilter, size: number, shuffle: boolean) => {
    const latest = loadWords();
    setBatch(buildCluster(latest, filter, size, shuffle));
  };

  const handleSelectBatchSize = (size: number) => {
    setBatchSize(size);
    refreshBatchWith(wordFilter, size, false);
  };

  const handleSelectFilter = (filter: WordFilter) => {
    setWordFilter(filter);
    refreshBatchWith(filter, batchSize, false);
  };

  const handleStartSession = () => {
    if (batch.length === 0) return;
    setItemIndex(0);
    setSessionReviews([]);

    if (studyMode === 'READ_ONLY') {
      setPhase('SECTION_READ');
    } else if (studyMode === 'WRITE_ONLY') {
      setPhase('SECTION_WRITE');
    } else {
      setPhase('SECTION_LISTEN');
    }
  };

  const completeOrAdvance = (nextPhaseWhenSectionDone: Phase) => {
    if (itemIndex + 1 < batch.length) {
      setItemIndex((prev) => prev + 1);
      return;
    }

    if (nextPhaseWhenSectionDone === 'COMPLETED') {
      const latestMap = new Map(getStoredUserVocab().map((w) => [w.id, w]));
      setBatch((prev) => prev.map((w) => latestMap.get(w.id) || w));
    }
    setItemIndex(0);
    setPhase(nextPhaseWhenSectionDone);
  };

  const handleListenDone = () => {
    completeOrAdvance(studyMode === 'LISTEN_ONLY' ? 'COMPLETED' : 'INTERLUDE_1');
  };

  const handleReadDone = () => {
    completeOrAdvance(studyMode === 'READ_ONLY' ? 'COMPLETED' : 'INTERLUDE_2');
  };

  const handleFinishWrite = (grade: ReviewGrade) => {
    const currentWord = batch[itemIndex];
    if (currentWord) {
      recordWordReview(currentWord.id, grade);
      setSessionReviews((prev) => [...prev, { wordId: currentWord.id, grade }]);
    }
    completeOrAdvance('COMPLETED');
  };

  const handleRestartNewBatch = () => {
    refreshBatchWith(wordFilter, batchSize, true);
    setSessionReviews([]);
    setItemIndex(0);
    setPhase('SETUP');
  };

  const activeStepCount = studyMode === 'COMBO' ? 3 : 1;
  const currentStepLabel = useMemo(() => {
    if (studyMode === 'LISTEN_ONLY') return 'Chế độ Nghe (1 phần)';
    if (studyMode === 'READ_ONLY') return 'Chế độ Đọc ngữ cảnh (1 phần)';
    if (studyMode === 'WRITE_ONLY') return 'Chế độ Viết câu (1 phần)';
    if (phase === 'SECTION_LISTEN') return 'Phần 1 / 3: Luyện Nghe';
    if (phase === 'SECTION_READ') return 'Phần 2 / 3: Luyện Đọc';
    return 'Phần 3 / 3: Luyện Viết';
  }, [studyMode, phase]);

  if (!mounted) return null;

  if (allStoredWords.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5 animate-in fade-in">
        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-3xl flex items-center justify-center">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kho từ vựng đang trống
        </h2>
        <p className="text-sm text-slate-500">
          Hãy về trang chủ để khởi tạo bộ 50 từ theo chủ đề hoặc thêm từ mới trước khi luyện tập.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25"
        >
          <ArrowLeft size={18} />
          <span>Về trang chủ khởi tạo kho từ</span>
        </Link>
      </div>
    );
  }

  // ----------------------------------------------------
  // Phase 0: SETUP (Chọn cụm từ & chọn kỹ năng muốn học)
  // ----------------------------------------------------
  if (phase === 'SETUP') {
    const unmasteredCount = allStoredWords.filter((w) => w.status !== 'MASTERED').length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold tracking-wide uppercase">
            <Layers size={14} /> Tự chọn phương pháp học cụm từ
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Luyện tập theo cụm 5–10 từ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Chọn cụm từ muốn học và chọn riêng từng kỹ năng (<b>Nghe</b>, <b>Đọc</b>, <b>Viết</b>) hoặc học <b>Tổng hợp cả 3</b>.
            Nghe &amp; Đọc được tính vào lịch sử tích lũy từ đầu (<b>&ge;{MIN_ATTEMPTS_FOR_MASTERY} lượt &amp; &gt;65%</b> để Đã thuộc).
          </p>
        </div>

        {/* Step 1: Study Mode Selection (Split 3 skills + Combo) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>Bước 1: Chọn cách bạn muốn học cụm từ này</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = studyMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setStudyMode(opt.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? `${opt.activeClass} shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-slate-700 dark:text-slate-200" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {opt.title}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {opt.badge}
                    </span>
                    <span className="text-slate-400">{opt.quizNote}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Cluster Filter & Size + Preview */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleSelectFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  wordFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Tất cả ({allStoredWords.length})
              </button>
              <button
                onClick={() => handleSelectFilter('UNMASTERED')}
                disabled={unmasteredCount === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-40 ${
                  wordFilter === 'UNMASTERED'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Chưa thuộc ({unmasteredCount})
              </button>
              <button
                onClick={() => handleSelectFilter('DUE')}
                disabled={dueCount === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-40 ${
                  wordFilter === 'DUE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Đến hạn SRS ({dueCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {[5, 7, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelectBatchSize(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    batchSize === num
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {num} từ
                </button>
              ))}
              <button
                onClick={() => refreshBatchWith(wordFilter, batchSize, true)}
                title="Trộn chọn cụm từ khác"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Shuffle size={15} />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Bước 2: Xem trước {batch.length} từ trong cụm này</span>
              <span>{activeStepCount} phần luyện</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {batch.map((word, idx) => {
                const stats = evaluateQuizMastery(word.timesCorrect, word.timesIncorrect);
                return (
                  <div
                    key={word.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
                            {word.word}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              stats.isMastered
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {stats.totalAttempts > 0
                              ? `${stats.accuracyPercent}% (${word.timesCorrect}/${stats.totalAttempts})`
                              : 'Mới'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {word.vietnameseMeaning || word.definition}
                        </p>
                      </div>
                    </div>

                    <AudioPlayerButton
                      audioUrl={word.audioUrl}
                      word={word.word}
                      size={16}
                      className="w-7 h-7 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartSession}
          disabled={batch.length === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition"
        >
          <span>
            Bắt đầu {MODE_OPTIONS.find((m) => m.id === studyMode)?.title} ({batch.length} từ)
          </span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // INTERLUDE 1 & 2 (Chỉ hiện ở chế độ Tổng hợp COMBO)
  // ----------------------------------------------------
  if (phase === 'INTERLUDE_1') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Chặng 1 / 3 Hoàn tất
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hoàn thành Phần 1: Luyện Nghe!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Kết quả nghe chép chính tả đã được lưu vào lịch sử tích lũy. Chuyển sang <b>Phần 2: Luyện Đọc ngữ cảnh</b>.
          </p>
        </div>
        <button
          onClick={() => {
            setItemIndex(0);
            setPhase('SECTION_READ');
          }}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
        >
          <span>Chuyển sang Phần 2: Luyện Đọc ({batch.length} câu)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (phase === 'INTERLUDE_2') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
          <BookOpen size={36} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Chặng 2 / 3 Hoàn tất
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hoàn thành Phần 2: Luyện Đọc!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Điểm trắc nghiệm đã được cập nhật. Chặng cuối: <b>Phần 3: Tự đặt câu</b> (lên lịch SRS, không ảnh hưởng % trắc nghiệm).
          </p>
        </div>
        <button
          onClick={() => {
            setItemIndex(0);
            setPhase('SECTION_WRITE');
          }}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition"
        >
          <span>Chuyển sang Phần 3: Luyện Viết ({batch.length} từ)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // COMPLETED
  // ----------------------------------------------------
  if (phase === 'COMPLETED') {
    const masteredInBatch = batch.filter((w) => w.status === 'MASTERED').length;

    return (
      <div className="max-w-2xl mx-auto text-center py-8 space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30">
          <Trophy size={40} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hoàn thành phiên học {batch.length} từ!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Chế độ đã chọn: <b>{MODE_OPTIONS.find((m) => m.id === studyMode)?.title}</b> •{' '}
            {masteredInBatch}/{batch.length} từ trong cụm hiện đạt chuẩn <b>Đã thuộc</b>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trạng thái tích lũy từ đầu (&ge;{MIN_ATTEMPTS_FOR_MASTERY} lượt trắc nghiệm/nghe &amp; &gt;65%):
          </h3>

          <div className="space-y-2">
            {batch.map((word) => {
              const stats = evaluateQuizMastery(word.timesCorrect, word.timesIncorrect);
              const srsDone = sessionReviews.some((r) => r.wordId === word.id);
              return (
                <div
                  key={word.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {word.word}
                      </span>
                      <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                        {word.ipa}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        ({word.timesCorrect}/{stats.totalAttempts} lượt = {stats.accuracyPercent}%)
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      {word.vietnameseMeaning || word.definition}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {stats.isMastered ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <Check size={12} /> Đã thuộc
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        {srsDone ? 'Đã lên lịch SRS' : 'Đang học'}
                      </span>
                    )}
                    <AudioPlayerButton
                      audioUrl={word.audioUrl}
                      word={word.word}
                      size={16}
                      className="w-7 h-7"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleRestartNewBatch}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-sm"
          >
            <RotateCcw size={17} />
            <span>Học cụm tiếp theo</span>
          </button>

          <Link
            href="/test"
            className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition text-sm"
          >
            <ClipboardCheck size={17} />
            <span>Làm Test 50 câu</span>
          </Link>

          <Link
            href="/writing"
            className="py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition text-sm"
          >
            <FileText size={17} />
            <span>Test Viết đoạn</span>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Active Exercise Header & Card
  // ----------------------------------------------------
  const currentWord = batch[itemIndex];
  const isLastInBatch = itemIndex + 1 >= batch.length;
  const progressPercent = Math.round(((itemIndex + 1) / Math.max(batch.length, 1)) * 100);

  const listenNextLabel = isLastInBatch
    ? studyMode === 'LISTEN_ONLY'
      ? 'Xem tổng kết buổi học'
      : 'Hoàn tất Nghe -> Sang Luyện Đọc'
    : 'Nghe từ tiếp theo';

  const readNextLabel = isLastInBatch
    ? studyMode === 'READ_ONLY'
      ? 'Xem tổng kết buổi học'
      : 'Hoàn tất Đọc -> Sang Luyện Viết'
    : 'Đọc câu tiếp theo';

  const writeNextLabel = isLastInBatch
    ? 'Hoàn tất & xem tổng kết'
    : 'Lưu & chuyển từ tiếp theo';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <button
            onClick={() => setPhase('SETUP')}
            className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition"
          >
            <ArrowLeft size={16} /> Chọn lại kỹ năng
          </button>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {currentStepLabel} • {itemIndex + 1}/{batch.length}
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {currentWord && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {phase === 'SECTION_LISTEN' && (
            <DictationExercise
              key={`listen-${currentWord.id}-${itemIndex}`}
              vocab={currentWord}
              onSuccess={handleListenDone}
              onFail={handleListenDone}
              currentIndex={itemIndex}
              total={batch.length}
              nextLabel={listenNextLabel}
            />
          )}

          {phase === 'SECTION_READ' && (
            <ClozeExercise
              key={`read-${currentWord.id}-${itemIndex}`}
              vocab={currentWord}
              onSuccess={handleReadDone}
              onFail={handleReadDone}
              clusterWords={batch}
              currentIndex={itemIndex}
              total={batch.length}
              nextLabel={readNextLabel}
            />
          )}

          {phase === 'SECTION_WRITE' && (
            <WritingExercise
              key={`write-${currentWord.id}-${itemIndex}`}
              vocab={currentWord}
              onFinishReview={handleFinishWrite}
              currentIndex={itemIndex}
              total={batch.length}
              nextLabel={writeNextLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}
