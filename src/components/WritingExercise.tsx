'use client';

import React, { useState } from 'react';
import { PenTool, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { ReviewGrade, UserVocabItem } from '../lib/types';

interface Props {
  vocab: UserVocabItem;
  onFinishReview: (grade: ReviewGrade) => void;
  currentIndex?: number;
  total?: number;
  nextLabel?: string;
}

export default function WritingExercise({
  vocab,
  onFinishReview,
  currentIndex,
  total,
  nextLabel,
}: Props) {
  const [userSentence, setUserSentence] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasWritten, setHasWritten] = useState(false);

  const handleValidateSentence = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userSentence.trim()) return;

    const lowerSentence = userSentence.toLowerCase();
    const target = vocab.word.toLowerCase();

    // Check if the target word is inside the user's sentence
    const containsWord =
      lowerSentence.includes(target) ||
      lowerSentence.includes(target + 's') ||
      lowerSentence.includes(target + 'ed') ||
      lowerSentence.includes(target + 'ing');

    if (!containsWord) {
      setFeedback(`Câu của bạn cần chứa từ mục tiêu "${vocab.word}".`);
      return;
    }

    if (userSentence.trim().split(/\s+/).length < 4) {
      setFeedback('Hãy viết một câu dài hơn (tối thiểu 4 từ) để thể hiện rõ ngữ cảnh.');
      return;
    }

    setFeedback(null);
    setHasWritten(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold tracking-wide uppercase">
          Kỹ năng 3: Luyện Viết & Đặt câu {total ? `• Từ ${typeof currentIndex === 'number' ? currentIndex + 1 : 1} / ${total}` : ''}
        </span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Tự viết một câu sử dụng từ "{vocab.word}"
        </h3>
        <p className="text-xs text-slate-500">
          Chuyển hóa từ vựng thụ động thành từ vựng chủ động bạn có thể tự sử dụng.
        </p>
      </div>

      {/* Target Word Overview Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-bold text-base text-slate-900 dark:text-white capitalize">
            {vocab.word}
          </span>
          <span className="ml-2 text-xs italic text-slate-400">({vocab.pos})</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Nghĩa: <b>{vocab.vietnameseMeaning || vocab.definition}</b>
        </div>
      </div>

      {/* Writing Box */}
      {!hasWritten ? (
        <form onSubmit={handleValidateSentence} className="space-y-3">
          <textarea
            rows={3}
            value={userSentence}
            onChange={(e) => {
              setUserSentence(e.target.value);
              setFeedback(null);
            }}
            placeholder={`Ví dụ: She is very ${vocab.word} when facing difficult problems...`}
            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-medium text-sm sm:text-base resize-none transition"
            autoFocus
          />

          {feedback && (
            <p className="text-xs text-rose-500 font-medium px-1">{feedback}</p>
          )}

          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUserSentence(`It is important to remember the word "${vocab.word}".`);
                setHasWritten(true);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Bỏ qua bước đặt câu
            </button>

            <button
              type="submit"
              disabled={!userSentence.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-purple-600/20 transition"
            >
              <Send size={16} />
              <span>Gửi câu</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in zoom-in-95">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 size={18} />
            <span>Câu của bạn đã được ghi nhận!</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 italic font-medium text-sm">
            "{userSentence}"
          </p>
        </div>
      )}

      {/* SRS Rating Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
            <Sparkles size={14} className="text-amber-500" />
            <span>{nextLabel ? `${nextLabel} — ` : ''}Lên lịch ôn tập SRS (không tính vào tỉ lệ % trắc nghiệm):</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Điểm phần viết được tính riêng ở mục Viết đoạn theo chủ đề, không ảnh hưởng mốc &gt;65% trắc nghiệm.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onFinishReview('AGAIN')}
            className="p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition active:scale-95"
          >
            <span>🔄 Quên</span>
            <span className="text-[10px] font-normal opacity-75">Ôn lại ngay</span>
          </button>

          <button
            onClick={() => onFinishReview('HARD')}
            className="p-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition active:scale-95"
          >
            <span>😓 Khó</span>
            <span className="text-[10px] font-normal opacity-75">Sau 1-2 ngày</span>
          </button>

          <button
            onClick={() => onFinishReview('GOOD')}
            className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition active:scale-95"
          >
            <span>👍 Tốt</span>
            <span className="text-[10px] font-normal opacity-75">Sau 3-4 ngày</span>
          </button>

          <button
            onClick={() => onFinishReview('EASY')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition active:scale-95"
          >
            <span>⚡ Rất dễ</span>
            <span className="text-[10px] font-normal opacity-75">Sau 7+ ngày</span>
          </button>
        </div>
      </div>
    </div>
  );
}

