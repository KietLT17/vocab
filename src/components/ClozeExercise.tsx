'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Sparkles, Volume2, Award } from 'lucide-react';
import { UserVocabItem } from '../lib/types';
import { EXTENDED_WORD_POOL } from '../data/curatedDictionary';
import { getWordMeaning } from '../data/wordDefinitionsMap';
import { translateSentenceToVietnamese } from '../data/sentenceTranslations';
import { sounds } from '../lib/soundEffects';
import { recordQuizAttempt } from '../lib/storage';
import { MIN_ATTEMPTS_FOR_MASTERY } from '../lib/srs';
import AudioPlayerButton from './AudioPlayerButton';

interface Props {
  vocab: UserVocabItem;
  onSuccess: () => void;
  onFail: () => void;
  clusterWords?: UserVocabItem[];
  currentIndex?: number;
  total?: number;
  nextLabel?: string;
}

export default function ClozeExercise({
  vocab,
  onSuccess,
  onFail,
  clusterWords,
  currentIndex,
  total,
  nextLabel,
}: Props) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [translatedSentence, setTranslatedSentence] = useState<string>('');
  const [quizResult, setQuizResult] = useState<{
    accuracyPercent: number;
    totalAttempts: number;
    promotedToMastered: boolean;
    demotedFromMastered: boolean;
  } | null>(null);

  useEffect(() => {
    setSelectedWord(null);
    setStatus('IDLE');
    setQuizResult(null);
  }, [vocab.id]);

  // Pre-load Vietnamese sentence translation
  useEffect(() => {
    let isMounted = true;
    translateSentenceToVietnamese(vocab.example, vocab.vietnameseMeaning).then((res) => {
      if (isMounted) setTranslatedSentence(res);
    });
    return () => {
      isMounted = false;
    };
  }, [vocab.example, vocab.vietnameseMeaning]);

  // Generate 4 randomized choices: prefer words from the current 5-10 batch!
  const choices = useMemo(() => {
    let distractors: string[] = [];

    if (clusterWords && clusterWords.length > 1) {
      distractors = clusterWords
        .map((w) => w.word)
        .filter((w) => w.toLowerCase() !== vocab.word.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    }

    if (distractors.length < 3) {
      const moreDistractors = EXTENDED_WORD_POOL.filter(
        (w) =>
          w.toLowerCase() !== vocab.word.toLowerCase() &&
          !distractors.map((d) => d.toLowerCase()).includes(w.toLowerCase())
      )
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - distractors.length);

      distractors = [...distractors, ...moreDistractors];
    }

    const all = [vocab.word, ...distractors];
    return all.sort(() => 0.5 - Math.random());
  }, [vocab.word, clusterWords]);

  // Map each choice with its definition & Vietnamese meaning
  const choiceDetails = useMemo(() => {
    return choices.map((w) => {
      const isTarget = w.toLowerCase() === vocab.word.toLowerCase();
      const meaning = isTarget && vocab.vietnameseMeaning
        ? {
            pos: vocab.pos,
            vietnameseMeaning: vocab.vietnameseMeaning,
            definition: vocab.definition,
          }
        : getWordMeaning(w);

      return {
        word: w,
        isCorrect: isTarget,
        ...meaning,
      };
    });
  }, [choices, vocab]);

  // Mask the word inside the example sentence when IDLE
  const maskedSentence = useMemo(() => {
    const regex = new RegExp(`\\b${vocab.word}\\b|\\b${vocab.word}s\\b|\\b${vocab.word}ed\\b|\\b${vocab.word}ing\\b`, 'gi');
    if (regex.test(vocab.example)) {
      return vocab.example.replace(regex, '_______');
    }
    return vocab.example;
  }, [vocab.example, vocab.word]);

  // Highlighted sentence when answered
  const completedSentence = useMemo(() => {
    const regex = new RegExp(`\\b${vocab.word}\\b|\\b${vocab.word}s\\b|\\b${vocab.word}ed\\b|\\b${vocab.word}ing\\b`, 'gi');
    return vocab.example.replace(regex, `**${vocab.word}**`);
  }, [vocab.example, vocab.word]);

  const handleSelectChoice = (word: string) => {
    if (status !== 'IDLE') return;
    setSelectedWord(word);

    const isCorrect = word.toLowerCase() === vocab.word.toLowerCase();
    if (isCorrect) {
      sounds.playCorrect();
      setStatus('CORRECT');
    } else {
      sounds.playIncorrect();
      setStatus('WRONG');
    }

    const res = recordQuizAttempt(vocab.id, isCorrect);
    setQuizResult({
      accuracyPercent: res.accuracyPercent,
      totalAttempts: res.totalAttempts,
      promotedToMastered: res.previousStatus !== 'MASTERED' && res.newStatus === 'MASTERED',
      demotedFromMastered: res.previousStatus === 'MASTERED' && res.newStatus !== 'MASTERED',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold tracking-wide uppercase">
          Kỹ năng 2: Luyện Đọc Ngữ cảnh {total ? `• Câu ${typeof currentIndex === 'number' ? currentIndex + 1 : 1} / ${total}` : ''}
        </span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chọn từ phù hợp nhất vào chỗ trống
        </h3>
      </div>

      {/* Context sentence box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <BookOpen size={16} /> Ngữ cảnh thực tế:
          </span>
          {status !== 'IDLE' && (
            <div className="flex items-center gap-2">
              <AudioPlayerButton
                audioUrl={vocab.audioUrl}
                word={vocab.word}
                size={16}
                className="w-7 h-7"
              />
            </div>
          )}
        </div>

        {/* Before answering: Show sentence with masked blank (NO definition/meaning) */}
        {status === 'IDLE' ? (
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-serif py-1">
            "{maskedSentence}"
          </p>
        ) : (
          /* After answering: Reveal completed sentence with highlighted target word & Vietnamese translation */
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed font-serif py-1">
              "
              {vocab.example.split(new RegExp(`(${vocab.word})`, 'gi')).map((part, i) =>
                part.toLowerCase() === vocab.word.toLowerCase() ? (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold font-sans underline decoration-emerald-500"
                  >
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
              "
            </p>

            {/* Dịch toàn bộ câu ngữ cảnh sang tiếng Việt */}
            {translatedSentence && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 rounded-xl text-xs sm:text-sm text-amber-950 dark:text-amber-200 flex items-start gap-2 shadow-sm animate-in fade-in">
                <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">🇻🇳 Dịch câu:</span>
                <span className="font-medium italic">"{translatedSentence}"</span>
              </div>
            )}

            {/* Explanation Section revealed ONLY after selection */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                <Sparkles size={14} />
                <span>Giải thích ngữ cảnh:</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Đáp án đúng là <b className="text-emerald-600 dark:text-emerald-400 capitalize">{vocab.word}</b>{' '}
                <span className="text-slate-400 font-mono text-xs">({vocab.ipa})</span>: {vocab.vietnameseMeaning}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs italic">
                {vocab.definition}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Choices Grid */}
      <div className="space-y-2">
        {status !== 'IDLE' && (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Nghĩa & Giải thích của tất cả 4 đáp án:
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {choiceDetails.map((item) => {
            // Before choosing: simple buttons
            if (status === 'IDLE') {
              return (
                <button
                  key={item.word}
                  onClick={() => handleSelectChoice(item.word)}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-base font-semibold text-center transition-all shadow-sm active:scale-[0.98]"
                >
                  {item.word}
                </button>
              );
            }

            // After choosing: Detailed Card showing meanings for ALL answers
            const isSelected = selectedWord === item.word;
            let cardBorder = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 opacity-80';

            if (item.isCorrect) {
              cardBorder = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-md ring-1 ring-emerald-500 opacity-100';
            } else if (isSelected && !item.isCorrect) {
              cardBorder = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 shadow-md ring-1 ring-rose-500 opacity-100';
            }

            return (
              <div
                key={item.word}
                className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1.5 animate-in fade-in duration-300 ${cardBorder}`}
              >
                {/* Header of choice */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold capitalize text-slate-900 dark:text-white">
                      {item.word}
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      ({item.pos})
                    </span>
                  </div>

                  {item.isCorrect && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <CheckCircle2 size={12} /> Đáp án đúng
                    </span>
                  )}

                  {!item.isCorrect && isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                      <XCircle size={12} /> Bạn đã chọn
                    </span>
                  )}
                </div>

                {/* Vietnamese meaning */}
                <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                  {item.vietnameseMeaning}
                </p>

                {/* English definition */}
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                  {item.definition}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cumulative Quiz Accuracy Telemetry */}
      {status !== 'IDLE' && quizResult && (
        <div className="space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span>
              Tỉ lệ đúng tích lũy từ đầu:{' '}
              <b className={quizResult.accuracyPercent > 65 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {quizResult.accuracyPercent}%
              </b>{' '}
              ({quizResult.totalAttempts} lượt trắc nghiệm/nghe)
            </span>
            {quizResult.totalAttempts < MIN_ATTEMPTS_FOR_MASTERY && (
              <span className="text-[11px] text-slate-400">
                • Cần tối thiểu {MIN_ATTEMPTS_FOR_MASTERY} lượt để xét Đã thuộc
              </span>
            )}
          </div>

          {quizResult.promotedToMastered && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 py-2 px-3 rounded-xl">
              <Award size={16} />
              <span>Chúc mừng! Từ "{vocab.word}" đã đạt &gt;65% (&ge;{MIN_ATTEMPTS_FOR_MASTERY} lượt) và được đánh dấu Đã thuộc!</span>
            </div>
          )}

          {quizResult.demotedFromMastered && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 py-2 px-3 rounded-xl">
              <span>Từ "{vocab.word}" tụt xuống &le;65% nên tạm chuyển về trạng thái Đang ôn tập.</span>
            </div>
          )}
        </div>
      )}

      {/* Result feedback banner & Next Action */}
      {status === 'CORRECT' && (
        <div className="text-center space-y-3 animate-in zoom-in-95">
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 size={20} />
            <span>Hiểu ngữ cảnh rất chuẩn!</span>
          </div>
          <button
            onClick={onSuccess}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition"
          >
            <span>{nextLabel || 'Tiếp tục'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {status === 'WRONG' && (
        <div className="text-center space-y-3 animate-in zoom-in-95">
          <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
            <XCircle size={20} />
            <span>Chưa chính xác! Xem kỹ nghĩa các đáp án ở trên để rút kinh nghiệm nhé.</span>
          </div>
          <button
            onClick={onFail}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-[0.99] transition"
          >
            <span>{nextLabel || 'Tiếp tục'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
