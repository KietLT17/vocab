'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import AudioPlayerButton from '../../components/AudioPlayerButton';
import SentenceAudioButton from '../../components/SentenceAudioButton';
import { calculateNextSRS, evaluateQuizMastery } from '../../lib/srs';
import { speakText, stopSpeaking } from '../../lib/speech';
import { getDueReviewWords, getStoredUserVocab, recordWordReview } from '../../lib/storage';
import { ReviewGrade, UserVocabItem } from '../../lib/types';

type CardFilter = 'DUE' | 'UNMASTERED' | 'ALL';
type CardDirection = 'EN_TO_VI' | 'VI_TO_EN';

const GRADE_CONFIG: Array<{
  grade: ReviewGrade;
  label: string;
  keyHint: string;
  classes: string;
}> = [
  {
    grade: 'AGAIN',
    label: 'Quên',
    keyHint: '1',
    classes:
      'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
  {
    grade: 'HARD',
    label: 'Khó',
    keyHint: '2',
    classes:
      'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  },
  {
    grade: 'GOOD',
    label: 'Nhớ',
    keyHint: '3',
    classes:
      'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  },
  {
    grade: 'EASY',
    label: 'Quá dễ',
    keyHint: '4',
    classes:
      'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  },
];

function selectDeck(
  words: UserVocabItem[],
  filter: CardFilter,
  limit: number,
  shuffle: boolean
): UserVocabItem[] {
  const now = Date.now();
  let pool = words;

  if (filter === 'DUE') {
    const due = words.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
    pool = due.length > 0 ? due : words;
  } else if (filter === 'UNMASTERED') {
    const unmastered = words.filter((w) => w.status !== 'MASTERED');
    pool = unmastered.length > 0 ? unmastered : words;
  }

  const ordered = shuffle
    ? [...pool].sort(() => 0.5 - Math.random())
    : [...pool].sort(
        (a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
      );

  return limit > 0 ? ordered.slice(0, Math.min(limit, ordered.length)) : ordered;
}

export default function FlashcardPage() {
  const [mounted, setMounted] = useState(false);
  const [allWords, setAllWords] = useState<UserVocabItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [filter, setFilter] = useState<CardFilter>('DUE');
  const [limit, setLimit] = useState<number>(10);
  const [direction, setDirection] = useState<CardDirection>('EN_TO_VI');
  const [autoSpeak, setAutoSpeak] = useState(false);

  const [deck, setDeck] = useState<UserVocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Array<{ word: UserVocabItem; grade: ReviewGrade }>>([]);
  const [completed, setCompleted] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const buildSession = useCallback(
    (nextFilter: CardFilter, nextLimit: number, shuffle: boolean) => {
      const words = getStoredUserVocab();
      const due = getDueReviewWords();
      setAllWords(words);
      setDueCount(due.length);
      setDeck(selectDeck(words, nextFilter, nextLimit, shuffle));
      setIndex(0);
      setIsFlipped(false);
      setResults([]);
      setCompleted(false);
    },
    []
  );

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const due = getDueReviewWords();
      const initialFilter: CardFilter = due.length > 0 ? 'DUE' : 'ALL';
      setFilter(initialFilter);
      buildSession(initialFilter, 10, false);
    };
    sync();
    const onStorage = () => {
      setAllWords(getStoredUserVocab());
      setDueCount(getDueReviewWords().length);
    };
    window.addEventListener('vocabflow_account_changed', sync);
    window.addEventListener('vocabflow_storage_updated', onStorage);
    return () => {
      stopSpeaking();
      window.removeEventListener('vocabflow_account_changed', sync);
      window.removeEventListener('vocabflow_storage_updated', onStorage);
    };
  }, [buildSession]);

  const currentCard = deck[index];

  const speakWordIfEnabled = useCallback(
    (item: UserVocabItem | undefined) => {
      if (autoSpeak && item) {
        speakText(item.word, { rate: 0.9 });
      }
    },
    [autoSpeak]
  );

  const goToIndex = useCallback(
    (nextIdx: number) => {
      if (nextIdx < 0 || nextIdx >= deck.length) return;
      stopSpeaking();
      setIsFlipped(false);
      setIndex(nextIdx);
      speakWordIfEnabled(deck[nextIdx]);
    },
    [deck, speakWordIfEnabled]
  );

  const handleRate = useCallback(
    (grade: ReviewGrade) => {
      if (!currentCard) return;
      stopSpeaking();
      recordWordReview(currentCard.id, grade);

      const nextResults = [...results, { word: currentCard, grade }];
      setResults(nextResults);

      if (index + 1 < deck.length) {
        const nextIdx = index + 1;
        setIsFlipped(false);
        setIndex(nextIdx);
        speakWordIfEnabled(deck[nextIdx]);
      } else {
        setCompleted(true);
      }
    },
    [currentCard, deck, index, results, speakWordIfEnabled]
  );

  // Desktop keyboard shortcuts (Space: flip, Arrows: nav, 1-4: rate when flipped)
  useEffect(() => {
    if (!mounted || completed || !currentCard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        goToIndex(index + 1);
      } else if (e.key === 'ArrowLeft') {
        goToIndex(index - 1);
      } else if (isFlipped) {
        const keyMap: Record<string, ReviewGrade> = {
          '1': 'AGAIN',
          '2': 'HARD',
          '3': 'GOOD',
          '4': 'EASY',
        };
        if (keyMap[e.key]) {
          handleRate(keyMap[e.key]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, completed, currentCard, index, isFlipped, goToIndex, handleRate]);

  const unmasteredCount = useMemo(
    () => allWords.filter((w) => w.status !== 'MASTERED').length,
    [allWords]
  );

  const retryHardWords = () => {
    const tough = results
      .filter((r) => r.grade === 'AGAIN' || r.grade === 'HARD')
      .map((r) => r.word);
    if (tough.length === 0) return;
    setDeck(tough);
    setIndex(0);
    setIsFlipped(false);
    setResults([]);
    setCompleted(false);
  };

  if (!mounted) return null;

  if (allWords.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 space-y-5">
        <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center">
          <Layers size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Chưa có thẻ Flashcard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Kho từ của bạn đang trống. Hãy về Tổng quan để khởi tạo 50 từ theo chủ đề hoặc thêm từ mới trước khi lật thẻ nhé.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition"
        >
          <ArrowLeft size={18} />
          <span>Về Tổng quan thêm từ</span>
        </Link>
      </div>
    );
  }

  const gradeCounts = results.reduce(
    (acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    },
    {} as Record<ReviewGrade, number>
  );
  const hardCount = (gradeCounts.AGAIN || 0) + (gradeCounts.HARD || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
      {/* Header & Compact Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="text-amber-500" size={22} />
              <span>Học Flashcard SRS</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chạm thẻ để lật • Vuốt trái/phải đổi thẻ • Tự lên lịch ôn tập
            </p>
          </div>

          <button
            onClick={() => setAutoSpeak((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shrink-0 ${
              autoSpeak
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Tự đọc</span>
          </button>
        </div>

        {/* Filter & Size Strip (scrollable cleanly on small phones) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-0.5 overflow-x-auto no-scrollbar max-w-full">
            {(
              [
                { id: 'DUE', label: `Đến hạn (${dueCount})` },
                { id: 'UNMASTERED', label: `Chưa thuộc (${unmasteredCount})` },
                { id: 'ALL', label: `Tất cả (${allWords.length})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setFilter(opt.id);
                  buildSession(opt.id, limit, false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  filter === opt.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-0.5">
            {[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 0, label: 'Hết' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setLimit(s.value);
                  buildSession(filter, s.value, false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  limit === s.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDirection((d) => (d === 'EN_TO_VI' ? 'VI_TO_EN' : 'EN_TO_VI'))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeftRight size={13} className="text-indigo-500" />
            <span>{direction === 'EN_TO_VI' ? 'Anh → Việt' : 'Việt → Anh'}</span>
          </button>

          <button
            onClick={() => buildSession(filter, limit, true)}
            title="Xáo trộn lại thẻ"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Shuffle size={13} className="text-amber-500" />
            <span>Trộn</span>
          </button>
        </div>
      </div>

      {/* Main Stage: Completed vs Active Card */}
      {completed ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={34} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Hoàn thành {results.length} thẻ Flashcard!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Lịch ôn tập SRS đã được cập nhật cho từng từ trong bộ thẻ.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            {GRADE_CONFIG.map((g) => (
              <div
                key={g.grade}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800"
              >
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {gradeCounts[g.grade] || 0}
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {g.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            {hardCount > 0 && (
              <button
                onClick={retryHardWords}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-sm transition"
              >
                <RotateCcw size={16} />
                <span>Ôn lại {hardCount} thẻ Quên / Khó</span>
              </button>
            )}
            <button
              onClick={() => buildSession(filter, limit, true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-sm transition"
            >
              <Sparkles size={16} />
              <span>Học lượt thẻ mới</span>
            </button>
            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-sm transition"
            >
              <GraduationCap size={16} />
              <span>Luyện trắc nghiệm</span>
            </Link>
          </div>
        </div>
      ) : currentCard ? (
        <div className="space-y-4">
          {/* Progress + Status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">
                Thẻ {index + 1} / {deck.length}
              </span>
              <div className="flex items-center gap-2">
                {(() => {
                  const evalRes = evaluateQuizMastery(
                    currentCard.timesCorrect,
                    currentCard.timesIncorrect
                  );
                  return evalRes.totalAttempts > 0 ? (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Trắc nghiệm: {evalRes.accuracyPercent}% ({evalRes.totalAttempts} lượt)
                    </span>
                  ) : null;
                })()}
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    currentCard.status === 'MASTERED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {currentCard.status === 'MASTERED' ? 'Đã thuộc' : 'Đang học'}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-600 transition-all duration-300"
                style={{ width: `${Math.round(((index + 1) / deck.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3D Flip Card */}
          <div
            className="flashcard-perspective cursor-pointer select-none touch-pan-y"
            onClick={() => setIsFlipped((prev) => !prev)}
            onTouchStart={(e) => {
              const t = e.changedTouches[0];
              touchStartRef.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              if (!touchStartRef.current) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - touchStartRef.current.x;
              const dy = t.clientY - touchStartRef.current.y;
              touchStartRef.current = null;
              if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
                if (dx < 0) goToIndex(index + 1);
                else goToIndex(index - 1);
              }
            }}
          >
            <div className={`flashcard-inner min-h-[350px] sm:min-h-[380px] ${isFlipped ? 'flashcard-flipped' : ''}`}>
              {/* Front Face */}
              <div className="flashcard-face absolute inset-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    {currentCard.pos}
                    {currentCard.level ? ` • ${currentCard.level}` : ''}
                  </span>
                  <span>Mặt trước</span>
                </div>

                {direction === 'EN_TO_VI' ? (
                  <div className="flex flex-col items-center text-center space-y-3 my-auto py-4">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white break-words max-w-full">
                      {currentCard.word}
                    </h2>
                    {currentCard.ipa && (
                      <p className="text-base sm:text-lg font-mono text-purple-600 dark:text-purple-400">
                        {currentCard.ipa}
                      </p>
                    )}
                    <div className="pt-1">
                      <AudioPlayerButton
                        audioUrl={currentCard.audioUrl}
                        word={currentCard.word}
                        size={22}
                        className="w-11 h-11"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-3 my-auto py-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Nghĩa tiếng Việt
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                      {currentCard.vietnameseMeaning || currentCard.definition}
                    </h2>
                    {currentCard.definition && currentCard.vietnameseMeaning && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md line-clamp-3">
                        {currentCard.definition}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Chạm vào thẻ để lật xem đáp án • Vuốt trái/phải đổi thẻ
                </p>
              </div>

              {/* Back Face */}
              <div className="flashcard-face flashcard-back absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-800/70 shadow-lg p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white capitalize">
                        {currentCard.word}
                      </h3>
                      <span className="text-sm font-mono text-purple-600 dark:text-purple-400">
                        {currentCard.ipa}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      {currentCard.pos}
                    </span>
                  </div>

                  <AudioPlayerButton
                    audioUrl={currentCard.audioUrl}
                    word={currentCard.word}
                    size={20}
                    className="w-10 h-10 shrink-0"
                  />
                </div>

                <div className="space-y-3 my-auto py-3">
                  <div>
                    <p className="text-lg sm:text-xl font-extrabold text-blue-700 dark:text-blue-300">
                      {currentCard.vietnameseMeaning || 'Chưa có nghĩa tiếng Việt'}
                    </p>
                    {currentCard.definition && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {currentCard.definition}
                      </p>
                    )}
                  </div>

                  {currentCard.example && (
                    <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 space-y-2">
                      <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-200">
                        &ldquo;{currentCard.example}&rdquo;
                      </p>
                      <SentenceAudioButton sentence={currentCard.example} size={14} />
                    </div>
                  )}

                  {currentCard.collocations && currentCard.collocations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.collocations.slice(0, 4).map((col) => (
                        <span
                          key={col}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                  Chạm lại để úp thẻ • Chọn mức độ nhớ bên dưới để xếp lịch SRS
                </p>
              </div>
            </div>
          </div>

          {/* Action / SRS Rating Dock */}
          {!isFlipped ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => goToIndex(index - 1)}
                disabled={index === 0}
                aria-label="Thẻ trước"
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-35 transition"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                onClick={() => setIsFlipped(true)}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/20 transition"
              >
                Lật thẻ xem đáp án
              </button>

              <button
                onClick={() => goToIndex(index + 1)}
                disabled={index + 1 >= deck.length}
                aria-label="Thẻ tiếp theo"
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-35 transition"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GRADE_CONFIG.map((cfg) => {
                const previewDays = calculateNextSRS(currentCard, cfg.grade, false).intervalDays;
                return (
                  <button
                    key={cfg.grade}
                    onClick={() => handleRate(cfg.grade)}
                    className={`p-3 rounded-2xl border font-bold text-center active:scale-95 transition flex flex-col items-center gap-0.5 ${cfg.classes}`}
                  >
                    <span className="text-sm">{cfg.label}</span>
                    <span className="text-[11px] opacity-80">
                      {previewDays} ngày <span className="hidden sm:inline">[{cfg.keyHint}]</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
            Flashcard giúp ghi nhớ nhanh và lên lịch ôn SRS; điểm chuẩn <strong>Đã thuộc (&gt;65%)</strong> vẫn tính từ Nghe, Đọc &amp; Test 50 câu.
          </p>
        </div>
      ) : null}
    </div>
  );
}
