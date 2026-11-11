'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Layers,
  RefreshCw,
  BookmarkPlus
} from 'lucide-react';
import { WordItem } from '../lib/types';
import { lookupDictionaryWord, fetchRandomWordExcluding } from '../lib/dictionaryApi';
import { addWordToBank, addBatchWordsToBank, getStoredUserVocab } from '../lib/storage';
import { TOPIC_CATEGORIES, getRandomTopicWords } from '../data/topicsVocabulary';
import AudioPlayerButton from './AudioPlayerButton';
import TranslateSentenceButton from './TranslateSentenceButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddedSuccess?: () => void;
}

export default function AddWordModal({ isOpen, onClose, onAddedSuccess }: Props) {
  const [tabMode, setTabMode] = useState<'SINGLE' | 'TOPIC'>('TOPIC');

  // Single word state
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewWord, setPreviewWord] = useState<WordItem | null>(null);

  // Topic batch state
  const [selectedTopicId, setSelectedTopicId] = useState<string>('business');
  const [batchCount, setBatchCount] = useState<number>(5);
  const [topicWords, setTopicWords] = useState<WordItem[]>([]);

  // Common feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Single search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setFeedback(null);
    setPreviewWord(null);

    const result = await lookupDictionaryWord(searchTerm.trim());
    setIsLoading(false);

    if (result) {
      setPreviewWord(result);
    } else {
      setFeedback({
        type: 'error',
        message: `Không tìm thấy từ "${searchTerm}". Vui lòng kiểm tra lại chính tả.`,
      });
    }
  };

  const handleSuggestRandom = async () => {
    setIsLoading(true);
    setFeedback(null);
    setPreviewWord(null);

    const currentVocab = getStoredUserVocab();
    const excluded = new Set(currentVocab.map((v) => v.word.toLowerCase()));

    const randomWord = await fetchRandomWordExcluding(excluded);
    setIsLoading(false);

    if (randomWord) {
      setSearchTerm(randomWord.word);
      setPreviewWord(randomWord);
    } else {
      setFeedback({
        type: 'error',
        message: 'Bạn đã lưu hết tất cả các từ trong kho gợi ý!',
      });
    }
  };

  const handleAddSingle = () => {
    if (!previewWord) return;

    const res = addWordToBank(previewWord);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onAddedSuccess) onAddedSuccess();
      setTimeout(() => {
        setPreviewWord(null);
        setSearchTerm('');
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Generate random batch by topic
  const handleGenerateTopicBatch = (topicId: string = selectedTopicId, count: number = batchCount) => {
    setFeedback(null);
    const currentVocab = getStoredUserVocab();
    const excluded = new Set(currentVocab.map((v) => v.word.toLowerCase()));

    const words = getRandomTopicWords(topicId, count, excluded);
    setTopicWords(words);

    if (words.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Bạn đã nạp hết tất cả từ trong chủ đề này!',
      });
    }
  };

  // Add all batch words
  const handleAddBatch = () => {
    if (topicWords.length === 0) return;

    const res = addBatchWordsToBank(topicWords);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onAddedSuccess) onAddedSuccess();
      setTimeout(() => {
        setTopicWords([]);
        setFeedback(null);
        onClose();
      }, 1400);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header with Close */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookmarkPlus size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Thêm từ vựng vào kho
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => {
              setTabMode('TOPIC');
              setFeedback(null);
              if (topicWords.length === 0) handleGenerateTopicBatch('business', batchCount);
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              tabMode === 'TOPIC'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={16} />
            <span>Nạp cụm 5-10 từ theo chủ đề</span>
          </button>

          <button
            onClick={() => {
              setTabMode('SINGLE');
              setFeedback(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              tabMode === 'SINGLE'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search size={16} />
            <span>Tra cứu 1 từ lẻ</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: NẠP CỤM THEO CHỦ ĐỀ */}
          {tabMode === 'TOPIC' && (
            <div className="space-y-4">
              {/* Topic Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  1. Chọn chủ đề bạn muốn học:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOPIC_CATEGORIES.map((cat) => {
                    const isSelected = selectedTopicId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedTopicId(cat.id);
                          handleGenerateTopicBatch(cat.id, batchCount);
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm ring-1 ring-blue-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{cat.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector & Randomize Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Số lượng:</span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        setBatchCount(5);
                        handleGenerateTopicBatch(selectedTopicId, 5);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        batchCount === 5 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      5 từ
                    </button>
                    <button
                      onClick={() => {
                        setBatchCount(10);
                        handleGenerateTopicBatch(selectedTopicId, 10);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        batchCount === 10 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      10 từ
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateTopicBatch(selectedTopicId, batchCount)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                >
                  <RefreshCw size={13} />
                  <span>Đổi cụm khác</span>
                </button>
              </div>

              {/* Preview List of words */}
              {topicWords.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Xem trước ({topicWords.length} từ):</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
                      đảm bảo chưa có trong kho
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {topicWords.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="opacity-40 font-bold">{idx + 1}.</span>
                            <span className="text-sm font-bold capitalize text-slate-900 dark:text-white">
                              {item.word}
                            </span>
                            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                              {item.ipa}
                            </span>
                            <span className="text-[10px] text-slate-400 italic">({item.pos})</span>
                          </div>
                          <p className="text-blue-700 dark:text-blue-300 font-medium mt-0.5 truncate">
                            {item.definitions[0]?.vietnameseMeaning || item.definitions[0]?.definition}
                          </p>
                        </div>

                        <AudioPlayerButton
                          audioUrl={item.audioUrl}
                          word={item.word}
                          size={14}
                          className="w-7 h-7 shrink-0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add All Button */}
                  <button
                    onClick={handleAddBatch}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Plus size={18} className="stroke-[3]" />
                    <span>Lưu cả cụm {topicWords.length} từ này vào kho</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRA CỨU 1 TỪ LẺ */}
          {tabMode === 'SINGLE' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Nhập từ tiếng Anh (ví dụ: resilient, eloquent...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchTerm.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 text-sm"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  <span>Tra</span>
                </button>
              </form>

              {/* Quick random generator suggestion */}
              <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                <span>Chưa biết học từ gì?</span>
                <button
                  type="button"
                  onClick={handleSuggestRandom}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  <Sparkles size={14} /> Gợi ý ngẫu nhiên 1 từ
                </button>
              </div>

              {/* Preview Single Card */}
              {previewWord && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                          {previewWord.word}
                        </h4>
                        {previewWord.level && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {previewWord.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {previewWord.pos}
                        </span>
                        <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-medium">
                          {previewWord.ipa}
                        </span>
                      </div>
                    </div>

                    <AudioPlayerButton
                      audioUrl={previewWord.audioUrl}
                      word={previewWord.word}
                      size={20}
                    />
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      {previewWord.definitions[0]?.vietnameseMeaning}
                    </p>
                    <p className="mt-0.5">{previewWord.definitions[0]?.definition}</p>
                  </div>

                  {previewWord.definitions[0]?.example && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-400 space-y-1.5">
                      <p>"{previewWord.definitions[0].example}"</p>
                      <TranslateSentenceButton
                        sentence={previewWord.definitions[0].example}
                        meaningHint={previewWord.definitions[0]?.vietnameseMeaning}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAddSingle}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98] text-xs sm:text-sm"
                  >
                    <Plus size={18} className="stroke-[3]" />
                    Lưu vào kho từ vựng cá nhân
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
