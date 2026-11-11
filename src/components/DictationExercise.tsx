'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Award } from 'lucide-react';
import { UserVocabItem } from '../lib/types';
import AudioPlayerButton from './AudioPlayerButton';
import { sounds } from '../lib/soundEffects';
import { recordQuizAttempt } from '../lib/storage';

interface Props {
  vocab: UserVocabItem;
  onSuccess: () => void;
  onFail: () => void;
  currentIndex?: number;
  total?: number;
  nextLabel?: string;
}

export default function DictationExercise({
  vocab,
  onSuccess,
  onFail,
  currentIndex,
  total,
  nextLabel = 'Tiếp tục',
}: Props) {
  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [masteryNotice, setMasteryNotice] = useState<{
    accuracyPercent: number;
    totalAttempts: number;
    justMastered: boolean;
  } | null>(null);

  const checkAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || status !== 'IDLE') return;

    const normalizedUser = inputVal.trim().toLowerCase();
    const normalizedTarget = vocab.word.trim().toLowerCase();
    const isCorrect = normalizedUser === normalizedTarget;

    const res = recordQuizAttempt(vocab.id, isCorrect);
    setMasteryNotice({
      accuracyPercent: res.accuracyPercent,
      totalAttempts: res.totalAttempts,
      justMastered: res.previousStatus !== 'MASTERED' && res.newStatus === 'MASTERED',
    });

    if (isCorrect) {
      sounds.playCorrect();
      setStatus('CORRECT');
    } else {
      sounds.playIncorrect();
      setStatus('WRONG');
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold tracking-wide uppercase">
          Phần Nghe & Chép chính tả {total ? `• Câu ${typeof currentIndex === 'number' ? currentIndex + 1 : 1} / ${total}` : ''}
        </span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Nghe phát âm và gõ lại từ chính xác
        </h3>
        <p className="text-xs text-slate-500">
          Luyện đôi tai nhận diện ngữ âm và phản xạ nhớ cách viết của từ.
        </p>
      </div>

      {/* Big Audio Player trigger */}
      <div className="py-4 flex flex-col items-center justify-center">
        <div className="relative group">
          <AudioPlayerButton
            audioUrl={vocab.audioUrl}
            word={vocab.word}
            size={36}
            className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30"
          />
        </div>
        <span className="text-xs font-medium text-slate-500 mt-3">
          (Bấm vào loa để nghe lại)
        </span>
      </div>

      {/* Optional IPA Hint */}
      {showHint && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-mono text-purple-700 dark:text-purple-300 animate-in fade-in">
          Gợi ý phiên âm: <span className="font-bold">{vocab.ipa}</span> ({vocab.pos})
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={checkAnswer} className="max-w-xs mx-auto space-y-3">
        <input
          type="text"
          placeholder="Gõ từ bạn nghe được..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={status !== 'IDLE'}
          className={`w-full text-center px-4 py-3.5 rounded-2xl border-2 text-lg font-semibold tracking-wide outline-none transition ${
            status === 'CORRECT'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : status === 'WRONG'
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:bg-slate-800 dark:text-white'
          }`}
          autoFocus
        />

        {status === 'IDLE' ? (
          <div className="flex gap-2">
            {!showHint && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                title="Xem gợi ý phiên âm"
              >
                <HelpCircle size={16} />
                Gợi ý
              </button>
            )}
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-in zoom-in-95">
            {status === 'CORRECT' ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={20} />
                <span>Chính xác tuyệt đối!</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                  <XCircle size={20} />
                  <span>Chưa chính xác!</span>
                </div>
                <p className="text-xs text-slate-500">
                  Đáp án đúng: <b className="text-slate-900 dark:text-white text-sm">{vocab.word}</b>
                </p>
              </div>
            )}

            {/* Mastery Accuracy Badge */}
            {masteryNotice && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Tỉ lệ chính xác từ này: <b>{masteryNotice.accuracyPercent}%</b> ({masteryNotice.totalAttempts} lượt)
                </div>
                {masteryNotice.justMastered && (
                  <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Award size={14} /> Từ đã đạt &ge;4 lượt & &gt;65% &rarr; Đã thuộc!
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={status === 'CORRECT' ? onSuccess : onFail}
              className={`w-full py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg ${
                status === 'CORRECT'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <span>{nextLabel}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
