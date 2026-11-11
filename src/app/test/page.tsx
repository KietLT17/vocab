'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Flag,
  History,
  Lock,
  RotateCcw,
  Sparkles,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  generate50QuestionTest,
  getMasteredTestReadiness,
  MasteredTestReadiness,
  REQUIRED_TEST_QUESTIONS,
} from '../../data/questionBank';
import { evaluateQuizMastery, MIN_ATTEMPTS_FOR_MASTERY } from '../../lib/srs';
import {
  getStoredUserVocab,
  getTestHistory,
  recordQuizAttemptsBatch,
  saveTestHistoryRecord,
} from '../../lib/storage';
import {
  TestCategoryScore,
  TestHistoryRecord,
  TestQuestion,
  TestQuestionCategory,
} from '../../lib/types';
import { sounds } from '../../lib/soundEffects';

type TestPhase = 'INTRO' | 'TAKING' | 'RESULTS';
type ReviewFilter = 'ALL' | 'WRONG' | 'CORRECT';

const ALL_CATEGORIES: TestQuestionCategory[] = [
  'MEANING',
  'WORD_FORM',
  'GRAMMAR_TENSE',
  'COLLOCATION',
  'PREPOSITION_PHRASAL',
  'IDIOM',
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Test50Page() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<TestPhase>('INTRO');
  const [totalVocabCount, setTotalVocabCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [readiness, setReadiness] = useState<MasteredTestReadiness | null>(null);
  const [history, setHistory] = useState<TestHistoryRecord[]>([]);

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [usedMasteredCount, setUsedMasteredCount] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const [latestRecord, setLatestRecord] = useState<TestHistoryRecord | null>(null);
  const [promotedWords, setPromotedWords] = useState<string[]>([]);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('ALL');

  const refreshOverview = () => {
    const vocab = getStoredUserVocab();
    setTotalVocabCount(vocab.length);
    setMasteredCount(vocab.filter((w) => w.status === 'MASTERED').length);
    setReadiness(getMasteredTestReadiness(vocab));
    setHistory(getTestHistory());
  };

  useEffect(() => {
    setMounted(true);
    refreshOverview();
    const handleAccountSwitch = () => {
      setPhase('INTRO');
      refreshOverview();
    };
    window.addEventListener('vocabflow_storage_updated', refreshOverview);
    window.addEventListener('vocabflow_account_changed', handleAccountSwitch);
    return () => {
      window.removeEventListener('vocabflow_storage_updated', refreshOverview);
      window.removeEventListener('vocabflow_account_changed', handleAccountSwitch);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'TAKING') return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const handleStartTest = () => {
    const vocab = getStoredUserVocab();
    const generated = generate50QuestionTest(vocab);
    if (!generated.isEligible || generated.questions.length < REQUIRED_TEST_QUESTIONS) {
      refreshOverview();
      return;
    }
    setQuestions(generated.questions);
    setUsedMasteredCount(generated.usedMasteredCount);
    setAnswers({});
    setCurrentIdx(0);
    setElapsedSeconds(0);
    setConfirmSubmit(false);
    setPromotedWords([]);
    setLatestRecord(null);
    setPhase('TAKING');
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitTest = () => {
    const beforeVocab = getStoredUserVocab();
    const beforeMasteredSet = new Set(
      beforeVocab.filter((w) => w.status === 'MASTERED').map((w) => w.id)
    );
    const beforeNonMasteredSet = new Set(
      beforeVocab.filter((w) => w.status !== 'MASTERED').map((w) => w.id)
    );

    const catStats: Record<TestQuestionCategory, { correct: number; total: number }> = {
      MEANING: { correct: 0, total: 0 },
      WORD_FORM: { correct: 0, total: 0 },
      GRAMMAR_TENSE: { correct: 0, total: 0 },
      COLLOCATION: { correct: 0, total: 0 },
      PREPOSITION_PHRASAL: { correct: 0, total: 0 },
      IDIOM: { correct: 0, total: 0 },
    };

    let score = 0;
    const testedWordIds = new Set<string>();
    const attemptsBatch: Array<{ wordId: string; isCorrect: boolean }> = [];

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score += 1;

      catStats[q.category].total += 1;
      if (isCorrect) catStats[q.category].correct += 1;

      if (q.wordId) {
        testedWordIds.add(q.wordId);
        attemptsBatch.push({ wordId: q.wordId, isCorrect });
      }
    });

    recordQuizAttemptsBatch(attemptsBatch);

    const afterVocab = getStoredUserVocab();
    const demotedWords: string[] = [];
    const retainedWords: string[] = [];
    const newlyPromoted: string[] = [];

    afterVocab.forEach((w) => {
      if (!testedWordIds.has(w.id)) return;
      const evalStats = evaluateQuizMastery(w.timesCorrect, w.timesIncorrect);

      if (beforeMasteredSet.has(w.id)) {
        if (evalStats.isMastered) {
          retainedWords.push(w.word);
        } else {
          demotedWords.push(w.word);
        }
      } else if (beforeNonMasteredSet.has(w.id) && evalStats.isMastered) {
        newlyPromoted.push(w.word);
      }
    });

    const categoryScores: TestCategoryScore[] = ALL_CATEGORIES.filter(
      (cat) => catStats[cat].total > 0
    ).map((cat) => ({
      category: cat,
      correct: catStats[cat].correct,
      total: catStats[cat].total,
    }));

    const record: TestHistoryRecord = {
      id: `test-${Date.now()}`,
      date: new Date().toISOString(),
      score,
      total: questions.length,
      categoryScores,
      demotedWords,
      retainedWords,
    };

    saveTestHistoryRecord(record);
    setLatestRecord(record);
    setPromotedWords(newlyPromoted);
    setReviewFilter('ALL');
    setConfirmSubmit(false);
    setPhase('RESULTS');
    refreshOverview();

    if (score >= Math.ceil(questions.length * 0.65)) {
      sounds.playCorrect();
    }
  };

  const answeredCount = useMemo(
    () => questions.filter((q) => Boolean(answers[q.id])).length,
    [questions, answers]
  );

  const filteredReviewQuestions = useMemo(() => {
    if (reviewFilter === 'CORRECT') {
      return questions.filter((q) => answers[q.id] === q.correctAnswer);
    }
    if (reviewFilter === 'WRONG') {
      return questions.filter((q) => answers[q.id] !== q.correctAnswer);
    }
    return questions;
  }, [questions, answers, reviewFilter]);

  if (!mounted) return null;

  // ----------------------------------------------------
  // INTRO VIEW
  // ----------------------------------------------------
  if (phase === 'INTRO') {
    const availableCount = readiness?.availableQuestionsCount ?? 0;
    const requiredCount = readiness?.requiredQuestions ?? REQUIRED_TEST_QUESTIONS;
    const isEligible = readiness?.isEligible ?? false;
    const unlockPercent = Math.min(100, Math.round((availableCount / requiredCount) * 100));

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide">
            <ClipboardCheck size={14} /> Kiểm tra Tổng hợp 50 Câu
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Đề thi Trắc nghiệm Toàn diện 50 Câu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Bài kiểm tra chỉ sử dụng các từ vựng được đánh dấu{' '}
            <b>Đã thuộc (&ge;{MIN_ATTEMPTS_FOR_MASTERY} lượt &amp; &gt;65%)</b> trong kho và chỉ mở khóa khi đủ{' '}
            <b>{requiredCount} câu hỏi đã thuộc</b>.
          </p>
        </div>

        {/* Readiness Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Từ đã thuộc trong kho</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {masteredCount} <span className="text-xs font-normal text-slate-400">/ {totalVocabCount} từ</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-xs text-slate-500 font-medium">Số câu đã thuộc hiện có</div>
            <div
              className={`text-2xl font-extrabold ${
                isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {availableCount} <span className="text-xs font-normal text-slate-400">/ {requiredCount} câu</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isEligible ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${unlockPercent}%` }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Chuẩn giữ hạng</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              &gt;65% <span className="text-xs font-normal text-slate-400">tích lũy</span>
            </div>
          </div>
        </div>

        {/* 6 Domains */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>6 dạng câu hỏi trong đề thi</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${CATEGORY_LABELS[cat].color}`}
              >
                <span>{CATEGORY_LABELS[cat].name}</span>
                {readiness && readiness.categoryCounts[cat] > 0 && (
                  <span className="text-[11px] opacity-80">({readiness.categoryCounts[cat]})</span>
                )}
              </div>
            ))}
          </div>

          {!isEligible ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Chưa đủ {requiredCount} câu đã thuộc để mở khóa bài Test ({availableCount}/{requiredCount} câu)
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                    Hiện kho mới có <b>{masteredCount} từ Đã thuộc</b> (tạo được <b>{availableCount}/{requiredCount} câu</b>).
                    Hãy luyện tập <b>Nghe</b> hoặc <b>Đọc ngữ cảnh</b> đạt tối thiểu <b>{MIN_ATTEMPTS_FOR_MASTERY} lượt</b> với tỉ lệ đúng <b>&gt;65%</b> cho mỗi từ để tích lũy đủ {requiredCount} câu hỏi trước khi làm bài thi nhé!
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
              >
                <span>Đi Luyện Nghe &amp; Đọc ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Đã đủ điều kiện mở khóa! Toàn bộ <b>50/50 câu</b> trong đề sẽ được trích xuất 100% từ{' '}
                <b>{masteredCount} từ Đã thuộc</b> (hiện có {availableCount} câu khả dụng).
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleStartTest}
          disabled={!isEligible}
          className={`w-full py-4 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition ${
            isEligible
              ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-95 active:scale-[0.99] text-white shadow-xl shadow-indigo-500/25'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          }`}
        >
          {isEligible ? (
            <>
              <span>Bắt đầu làm Đề 50 Câu Ngay</span>
              <ArrowRight size={20} />
            </>
          ) : (
            <>
              <Lock size={18} />
              <span>
                Khóa bài thi — Cần đủ {requiredCount} câu đã thuộc ({availableCount}/{requiredCount})
              </span>
            </>
          )}
        </button>

        {/* Recent Test History */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <span>Lịch sử làm bài gần đây</span>
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((rec) => {
                const pct = rec.total > 0 ? Math.round((rec.score / rec.total) * 100) : 0;
                return (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {rec.score}/{rec.total} câu ({pct}%)
                      </span>
                      <span className="ml-2 text-slate-400">
                        {new Date(rec.date).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec.retainedWords.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                          Giữ vững: {rec.retainedWords.length} từ
                        </span>
                      )}
                      {rec.demotedWords.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold">
                          Tụt hạng: {rec.demotedWords.length} từ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // RESULTS VIEW
  // ----------------------------------------------------
  if (phase === 'RESULTS' && latestRecord) {
    const percent = latestRecord.total > 0
      ? Math.round((latestRecord.score / latestRecord.total) * 100)
      : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95">
        {/* Top Score Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-3xl flex items-center justify-center shadow-lg">
            <Award size={32} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Kết quả Kiểm tra 50 Câu
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              {latestRecord.score} / {latestRecord.total}{' '}
              <span className="text-xl text-indigo-600 dark:text-indigo-400">({percent}%)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thời gian làm bài: {formatDuration(elapsedSeconds)} • Toàn bộ kết quả đã được cập nhật vào lịch sử tích lũy từ đầu.
            </p>
          </div>

          {/* Mastery Status Impact */}
          {(latestRecord.retainedWords.length > 0 ||
            latestRecord.demotedWords.length > 0 ||
            promotedWords.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {latestRecord.retainedWords.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Từ Đã thuộc giữ vững (&gt;65%)
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">
                    {latestRecord.retainedWords.join(', ')}
                  </p>
                </div>
              )}

              {latestRecord.demotedWords.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <TrendingDown size={14} /> Từ bị tụt xuống &le;65% (cần ôn lại)
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-200 font-semibold">
                    {latestRecord.demotedWords.join(', ')}
                  </p>
                </div>
              )}

              {promotedWords.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1 sm:col-span-2">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles size={14} /> Từ mới đạt chuẩn Đã thuộc sau bài Test
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-200 font-semibold">
                    {promotedWords.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Phân tích điểm theo 6 mảng kiến thức
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {latestRecord.categoryScores.map((cs) => {
              const catPct = cs.total > 0 ? Math.round((cs.correct / cs.total) * 100) : 0;
              return (
                <div
                  key={cs.category}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-lg font-bold ${CATEGORY_LABELS[cs.category].color}`}>
                      {CATEGORY_LABELS[cs.category].name}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {cs.correct}/{cs.total} ({catPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${catPct > 65 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {readiness?.isEligible ? (
            <button
              onClick={handleStartTest}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <RotateCcw size={18} />
              <span>Làm đề 50 câu mới</span>
            </button>
          ) : (
            <button
              onClick={() => setPhase('INTRO')}
              className="flex-1 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <Lock size={17} />
              <span>
                Đang khóa đề mới ({readiness?.availableQuestionsCount ?? 0}/{REQUIRED_TEST_QUESTIONS} câu)
              </span>
            </button>
          )}
          <Link
            href="/practice"
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <span>Luyện lại từ yếu</span>
          </Link>
          <Link
            href="/"
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Giải thích chi tiết từng câu ({filteredReviewQuestions.length} câu)
            </h3>
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setReviewFilter('ALL')}
                className={`px-3 py-1 rounded-xl font-bold ${
                  reviewFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Tất cả ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter('WRONG')}
                className={`px-3 py-1 rounded-xl font-bold ${
                  reviewFilter === 'WRONG'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Làm sai ({questions.length - latestRecord.score})
              </button>
              <button
                onClick={() => setReviewFilter('CORRECT')}
                className={`px-3 py-1 rounded-xl font-bold ${
                  reviewFilter === 'CORRECT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Làm đúng ({latestRecord.score})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReviewQuestions.map((q) => {
              const userChoice = answers[q.id];
              const isCorrect = userChoice === q.correctAnswer;
              const qNumber = questions.findIndex((item) => item.id === q.id) + 1;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        Câu {qNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${CATEGORY_LABELS[q.category].color}`}>
                        {CATEGORY_LABELS[q.category].short}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold capitalize">
                        Từ: {q.word}
                      </span>
                    </div>
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Đúng
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <XCircle size={14} /> Sai
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.question}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                      Bạn chọn: {userChoice || '(Bỏ trống)'}
                    </span>
                    {!isCorrect && (
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                        Đáp án đúng: {q.correctAnswer}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl space-y-1">
                    <p><b>Giải thích:</b> {q.explanation}</p>
                    {q.sentenceTranslation && (
                      <p className="text-blue-700 dark:text-blue-300">
                        <b>Dịch câu:</b> {q.sentenceTranslation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TAKING VIEW
  // ----------------------------------------------------
  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
            Câu {currentIdx + 1} / {questions.length}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Đã chọn: <b>{answeredCount}/{questions.length}</b>
          </span>
          {usedMasteredCount > 0 && (
            <span className="hidden sm:inline-block text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ({usedMasteredCount} câu từ mục Đã thuộc)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
            <Clock size={14} />
            {formatDuration(elapsedSeconds)}
          </span>
          <button
            onClick={() => {
              if (answeredCount < questions.length) {
                setConfirmSubmit(true);
              } else {
                handleSubmitTest();
              }
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Flag size={14} />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* Confirm Early Submit Warning */}
      {confirmSubmit && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            Bạn mới trả lời {answeredCount}/{questions.length} câu. Các câu bỏ trống sẽ tính là sai và giảm tỉ lệ % từ vựng. Vẫn nộp bài?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmSubmit(false)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              Làm tiếp
            </button>
            <button
              onClick={handleSubmitTest}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold"
            >
              Xác nhận nộp bài
            </button>
          </div>
        </div>
      )}

      {currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Question Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_LABELS[currentQ.category].color}`}>
                {CATEGORY_LABELS[currentQ.category].name}
              </span>
              {currentQ.isFromMastered && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Từ Đã thuộc
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const selected = answers[currentQ.id] === opt;
                const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                return (
                  <button
                    key={`${currentQ.id}-opt-${idx}`}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-xs sm:text-sm font-bold flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Câu trước
              </button>

              {currentIdx + 1 < questions.length ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  Câu tiếp theo <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (answeredCount < questions.length) {
                      setConfirmSubmit(true);
                    } else {
                      handleSubmitTest();
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  Hoàn tất &amp; Nộp bài <Flag size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 50-Question Navigator Palette */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 h-fit">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bảng điều hướng 1–{questions.length}
            </div>
            <div className="grid grid-cols-10 lg:grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = Boolean(answers[q.id]);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-8 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

