'use client';

import React from 'react';
import { UserVocabItem } from '../lib/types';
import AudioPlayerButton from './AudioPlayerButton';
import SentenceAudioButton from './SentenceAudioButton';
import { BookOpen, Calendar, CheckCircle2, Clock, PenTool, Trash2 } from 'lucide-react';
import { evaluateQuizMastery, MIN_ATTEMPTS_FOR_MASTERY } from '../lib/srs';

interface Props {
  item: UserVocabItem;
  onDelete?: (id: string) => void;
  onPractice?: (item: UserVocabItem) => void;
}

function VocabCard({ item, onDelete, onPractice }: Props) {
  const isDue = new Date(item.nextReviewAt).getTime() <= Date.now();
  const masteryStats = evaluateQuizMastery(item.timesCorrect, item.timesIncorrect);

  const getStatusBadge = () => {
    let mainBadge: React.ReactNode;
    switch (item.status) {
      case 'MASTERED':
        mainBadge = (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={12} /> Đã thuộc ({masteryStats.accuracyPercent}%)
          </span>
        );
        break;
      case 'REVIEWING':
        mainBadge = (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Đang ôn tập
          </span>
        );
        break;
      case 'LEARNING':
        mainBadge = (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Đang học
          </span>
        );
        break;
      default:
        mainBadge = (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            Từ mới
          </span>
        );
        break;
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {mainBadge}
        <span
          title={`Tích lũy trắc nghiệm & nghe từ đầu (tối thiểu ${MIN_ATTEMPTS_FOR_MASTERY} lượt và >65%)`}
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {masteryStats.totalAttempts > 0
            ? `${item.timesCorrect}/${masteryStats.totalAttempts} lượt (${masteryStats.accuracyPercent}%)`
            : `0/${MIN_ATTEMPTS_FOR_MASTERY} lượt`}
        </span>
        {item.writingMastered && (
          <span
            title="Đã vận dụng thành công trong bài Test Viết đoạn theo chủ đề"
            className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1"
          >
            <PenTool size={11} /> Đã viết đoạn
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Top Header: Word, Pos, Level & Audio */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {item.word}
              </h3>
              {item.level && (
                <span className="px-1.5 py-0.2 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.level}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.pos}
              </span>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-medium">
                {item.ipa}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AudioPlayerButton
              audioUrl={item.audioUrl}
              word={item.word}
              size={18}
            />
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                title="Xóa từ khỏi kho"
                className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Meaning */}
        <div>
          {item.vietnameseMeaning && (
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {item.vietnameseMeaning}
            </p>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
            {item.definition}
          </p>
        </div>

        {/* Example in Context */}
        {item.example && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs italic text-slate-700 dark:text-slate-300 flex items-start justify-between gap-2">
            <span className="font-serif">"{item.example}"</span>
            <SentenceAudioButton sentence={item.example} size={14} className="shrink-0 scale-90" />
          </div>
        )}

        {/* Collocations */}
        {item.collocations && item.collocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.collocations.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
              >
                {col}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {isDue && (
            <span className="text-rose-500 font-semibold flex items-center gap-0.5">
              <Clock size={12} /> Cần ôn
            </span>
          )}
        </div>

        {onPractice && (
          <button
            onClick={() => onPractice(item)}
            className="px-3 py-1 bg-slate-900 hover:bg-blue-600 dark:bg-slate-700 dark:hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            Luyện từ này
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(VocabCard);

