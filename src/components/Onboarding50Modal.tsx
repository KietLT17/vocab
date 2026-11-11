'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Loader2, BookOpen, PenTool, Rocket } from 'lucide-react';
import { TOPIC_CATEGORIES } from '../data/topicsVocabulary';
import { buildInitial50WordDeck } from '../lib/topicDeckBuilder';
import { completeOnboardingWithDeck } from '../lib/storage';
import { updateActiveUserProfile } from '../lib/auth';

interface Props {
  isOpen: boolean;
  onCompleted: () => void;
}

export default function Onboarding50Modal({ isOpen, onCompleted }: Props) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['business', 'daily_life']);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 50, text: '' });

  if (!isOpen) return null;

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate50Words = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopics.length === 0 && !customTopic.trim()) return;

    setIsGenerating(true);
    setProgress({ current: 5, total: 50, text: 'Đang khởi tạo bộ từ vựng...' });

    try {
      const deck = await buildInitial50WordDeck(
        selectedTopics,
        customTopic,
        (current, total, text) => {
          setProgress({ current, total, text });
        }
      );

      completeOnboardingWithDeck(deck, selectedTopics, customTopic.trim() || undefined);
      updateActiveUserProfile({ favoriteTopics: selectedTopics });
      setIsGenerating(false);
      onCompleted();
    } catch (err) {
      console.error('Failed to build 50 word deck', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Hero Header */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Khởi tạo lần đầu • Kho 50 từ chuẩn
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xây dựng kho 50 từ vựng đầu tiên của bạn!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed">
            Chọn các chủ đề bạn quan tâm hoặc tự nhập bất kỳ chủ đề nào. Hệ thống sẽ chuẩn bị sẵn <b>50 từ vựng</b> đầy đủ phát âm IPA, audio, nghĩa và ngữ cảnh để bạn bắt đầu ngay.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate50Words} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Option 1: Select built-in topics */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen size={16} className="text-blue-600" />
                1. Chọn chủ đề gợi ý (có thể chọn nhiều):
              </label>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Đã chọn {selectedTopics.length} chủ đề
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TOPIC_CATEGORIES.map((cat) => {
                const isSelected = selectedTopics.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => toggleTopic(cat.id)}
                    className={`p-3 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check size={12} className="stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 2: Type custom topic */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PenTool size={16} className="text-purple-600" />
              2. Hoặc tự nhập chủ đề riêng bạn muốn (tùy chọn):
            </label>
            <input
              type="text"
              disabled={isGenerating}
              placeholder="Ví dụ: Du lịch, Y tế, Lập trình, Marketing, Thể thao, Finance..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 outline-none text-sm font-medium transition"
            />
            <p className="text-[11px] text-slate-500">
              * Nếu nhập chủ đề riêng, app sẽ tự động tìm kiếm và bóc tách các từ tiếng Anh chuyên ngành thuộc chủ đề đó cho đủ kho 50 từ.
            </p>
          </div>

          {/* Progress indicator when generating */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  {progress.text}
                </span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200/60 dark:bg-blue-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isGenerating || (selectedTopics.length === 0 && !customTopic.trim())}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Đang xây dựng kho 50 từ...</span>
              </>
            ) : (
              <>
                <Rocket size={20} />
                <span>Tạo ngay Kho 50 Từ Vựng & Bắt đầu Học</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

