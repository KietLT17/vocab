'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Repeat,
  Gauge,
  Shuffle,
  RotateCcw,
  Rewind,
} from 'lucide-react';
import { UserVocabItem, VocabStatus } from '../../lib/types';
import { getDueReviewWords, getStoredUserVocab } from '../../lib/storage';
import { shuffleArray } from '../../data/curatedDictionary';
import { playAudioUrlWithFallback, speakText, stopSpeaking, unlockSpeechAudio } from '../../lib/speech';
import { translateSentenceToVietnamese } from '../../data/sentenceTranslations';

type HandsfreeFilter = 'DUE' | 'UNMASTERED' | VocabStatus | 'ALL';

const WORD_LIMIT_PRESETS: Array<{ value: number; label: string }> = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 0, label: 'Tất cả' },
];

export default function HandsFreeAudioPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [baseWords, setBaseWords] = useState<UserVocabItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<HandsfreeFilter>('DUE');
  const [wordLimit, setWordLimit] = useState<number>(0);
  const [customLimitText, setCustomLimitText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeatWord, setIsRepeatWord] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [currentStepText, setCurrentStepText] = useState<string>('Sẵn sàng');
  const [exampleTranslation, setExampleTranslation] = useState<string>('');

  const isPlayingRef = useRef(false);
  const isRepeatRef = useRef(false);
  const currentIndexRef = useRef(0);
  const playlistRef = useRef<UserVocabItem[]>([]);
  const speechRateRef = useRef(0.95);
  const runIdRef = useRef(0);

  const statusSummary = useMemo(() => {
    const now = Date.now();
    let due = 0;
    let unmastered = 0;
    let newCount = 0;
    let learning = 0;
    let reviewing = 0;
    let mastered = 0;

    for (const w of baseWords) {
      if (new Date(w.nextReviewAt).getTime() <= now) due += 1;
      if (w.status !== 'MASTERED') unmastered += 1;
      if (w.status === 'NEW') newCount += 1;
      else if (w.status === 'LEARNING') learning += 1;
      else if (w.status === 'REVIEWING') reviewing += 1;
      else if (w.status === 'MASTERED') mastered += 1;
    }

    return {
      due,
      unmastered,
      NEW: newCount,
      LEARNING: learning,
      REVIEWING: reviewing,
      MASTERED: mastered,
      total: baseWords.length,
    };
  }, [baseWords]);

  const filteredPool = useMemo(() => {
    const now = Date.now();
    if (statusFilter === 'ALL') return baseWords;
    if (statusFilter === 'DUE') {
      return baseWords.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
    }
    if (statusFilter === 'UNMASTERED') {
      return baseWords.filter((w) => w.status !== 'MASTERED');
    }
    return baseWords.filter((w) => w.status === statusFilter);
  }, [baseWords, statusFilter]);

  const playlist = useMemo(() => {
    if (wordLimit > 0) {
      return filteredPool.slice(0, Math.min(wordLimit, filteredPool.length));
    }
    return filteredPool;
  }, [filteredPool, wordLimit]);

  const safeIndex = playlist.length > 0 ? Math.min(currentIndex, playlist.length - 1) : 0;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isRepeatRef.current = isRepeatWord;
  }, [isRepeatWord]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  const stopAndResetPlayback = () => {
    runIdRef.current += 1;
    stopSpeaking();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setCurrentStepText('Sẵn sàng');
  };

  useEffect(() => {
    const loadWords = (resetFilter: boolean) => {
      const due = getDueReviewWords();
      const all = getStoredUserVocab();
      setBaseWords(all);
      if (resetFilter) {
        setStatusFilter(due.length > 0 ? 'DUE' : 'ALL');
      }
      stopAndResetPlayback();
      setHasLoaded(true);
    };

    const handleAccountChanged = () => loadWords(true);
    const handleStorageUpdated = () => loadWords(false);

    loadWords(true);
    window.addEventListener('vocabflow_account_changed', handleAccountChanged);
    window.addEventListener('vocabflow_storage_updated', handleStorageUpdated);

    return () => {
      window.removeEventListener('vocabflow_account_changed', handleAccountChanged);
      window.removeEventListener('vocabflow_storage_updated', handleStorageUpdated);
      stopSpeaking();
      isPlayingRef.current = false;
    };
  }, []);

  const currentItem = playlist[safeIndex];

  useEffect(() => {
    let active = true;
    if (!currentItem?.example) {
      setExampleTranslation('');
      return;
    }
    setExampleTranslation('');
    translateSentenceToVietnamese(currentItem.example, currentItem.vietnameseMeaning).then((vi) => {
      if (active) setExampleTranslation(vi);
    });
    return () => {
      active = false;
    };
  }, [currentItem?.id, currentItem?.example, currentItem?.vietnameseMeaning]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Play audio url (native mp3) or fallback to speech
  const playNativeOrSpeechWord = (wordItem: UserVocabItem): Promise<void> => {
    return new Promise((resolve) => {
      playAudioUrlWithFallback(wordItem.audioUrl, wordItem.word, {
        lang: 'en-US',
        rate: speechRateRef.current,
        onEnd: () => resolve(),
        onError: () => resolve(),
      });
    });
  };

  const speakVietnamese = (text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      speakText(text, {
        lang: 'vi-VN',
        rate: Math.max(0.9, Math.min(1.1, speechRateRef.current)),
        onEnd: () => resolve(),
        onError: () => resolve(),
      });
    });
  };

  // Automated sequence loop for 1 word
  const playWordSequence = async (idx: number) => {
    const myRunId = ++runIdRef.current;
    if (!isPlayingRef.current) return;
    const item = playlistRef.current[idx];
    if (!item) return;

    const aborted = () => !isPlayingRef.current || runIdRef.current !== myRunId;
    const exampleViPromise = item.example
      ? translateSentenceToVietnamese(item.example, item.vietnameseMeaning)
      : Promise.resolve('');

    // Step 1: Speak English Word
    setCurrentStepText(`1. Đang đọc từ: "${item.word}"`);
    await playNativeOrSpeechWord(item);
    if (aborted()) return;
    await sleep(900);
    if (aborted()) return;

    // Step 2: Speak Vietnamese meaning with natural Vietnamese voice
    if (item.vietnameseMeaning) {
      setCurrentStepText(`2. Nghĩa tiếng Việt: "${item.vietnameseMeaning}"`);
      await speakVietnamese(item.vietnameseMeaning);
      if (aborted()) return;
      await sleep(900);
      if (aborted()) return;
    }

    // Step 3: Speak English Example Sentence
    if (item.example) {
      setCurrentStepText(`3. Đọc câu ví dụ ngữ cảnh...`);
      await new Promise<void>((resolve) => {
        speakText(item.example, {
          lang: 'en-US',
          rate: speechRateRef.current * 0.95,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      });
      if (aborted()) return;
      await sleep(700);
      if (aborted()) return;

      // Step 4: Speak Vietnamese translation of the example sentence
      const exampleVi = (await exampleViPromise).trim();
      if (aborted()) return;
      if (exampleVi && !exampleVi.startsWith('Bản dịch ngữ cảnh:')) {
        setExampleTranslation((prev) => prev || exampleVi);
        setCurrentStepText('4. Đọc dịch câu ví dụ...');
        await speakVietnamese(exampleVi);
        if (aborted()) return;
        await sleep(1400);
        if (aborted()) return;
      } else {
        await sleep(800);
        if (aborted()) return;
      }
    }

    if (isRepeatRef.current) {
      playWordSequence(idx);
    } else {
      const nextIndex = (idx + 1) % playlistRef.current.length;
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      playWordSequence(nextIndex);
    }
  };

  const startPlayingAt = (idx: number, forcePlay: boolean) => {
    if (playlist.length === 0) return;
    runIdRef.current += 1;
    stopSpeaking();
    unlockSpeechAudio();
    setCurrentIndex(idx);
    currentIndexRef.current = idx;
    if (forcePlay) {
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
    if (forcePlay || isPlayingRef.current) {
      playWordSequence(idx);
    }
  };

  const handleTogglePlay = () => {
    if (playlist.length === 0) return;
    if (isPlaying) {
      runIdRef.current += 1;
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopSpeaking();
      setCurrentStepText('Tạm dừng');
    } else {
      startPlayingAt(safeIndex, true);
    }
  };

  const handleSkipNext = () => {
    if (playlist.length === 0) return;
    startPlayingAt((safeIndex + 1) % playlist.length, false);
  };

  const handleSkipPrev = () => {
    if (playlist.length === 0) return;
    startPlayingAt((safeIndex - 1 + playlist.length) % playlist.length, false);
  };

  const handleReplayCurrent = () => {
    startPlayingAt(safeIndex, true);
  };

  const handleRestartPlaylist = () => {
    startPlayingAt(0, true);
  };

  const handleStatusChange = (nextStatus: HandsfreeFilter) => {
    setStatusFilter(nextStatus);
    stopAndResetPlayback();
  };

  const handlePresetLimitChange = (nextLimit: number) => {
    setWordLimit(nextLimit);
    setCustomLimitText('');
    stopAndResetPlayback();
  };

  const handleCustomLimitChange = (raw: string) => {
    const cleanDigits = raw.replace(/\D/g, '').replace(/^0+/, '');
    if (!cleanDigits) {
      setCustomLimitText('');
      setWordLimit(0);
      stopAndResetPlayback();
      return;
    }

    const parsed = Math.min(9999, parseInt(cleanDigits, 10));
    setCustomLimitText(String(parsed));
    setWordLimit(parsed);
    stopAndResetPlayback();
  };

  const handleShuffle = () => {
    setBaseWords((prev) => shuffleArray(prev));
    stopAndResetPlayback();
  };

  const statusOptions: Array<{ id: HandsfreeFilter; label: string; count: number }> = [
    { id: 'DUE', label: 'Cần ôn', count: statusSummary.due },
    { id: 'UNMASTERED', label: 'Chưa thuộc', count: statusSummary.unmastered },
    { id: 'NEW', label: 'Từ mới', count: statusSummary.NEW },
    { id: 'LEARNING', label: 'Đang học', count: statusSummary.LEARNING },
    { id: 'REVIEWING', label: 'Đang ôn', count: statusSummary.REVIEWING },
    { id: 'MASTERED', label: 'Đã thuộc', count: statusSummary.MASTERED },
    { id: 'ALL', label: 'Tất cả', count: statusSummary.total },
  ];

  if (!hasLoaded) return null;

  if (baseWords.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Headphones size={40} className="mx-auto text-slate-300" />
        <h2 className="text-xl font-bold">Chưa có từ nào trong kho để phát</h2>
        <Link href="/" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">
          Về trang chủ thêm từ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Thoát chế độ rảnh tay
        </Link>

        <span className="text-xs font-bold text-slate-400">
          {playlist.length > 0 ? `Từ ${safeIndex + 1} / ${playlist.length}` : '0 từ'}
        </span>
      </div>

      {/* Bộ lọc trạng thái & lượng từ */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái từ
            </span>
            <button
              type="button"
              onClick={handleShuffle}
              disabled={filteredPool.length < 2}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition"
              title="Xáo trộn thứ tự phát"
            >
              <Shuffle size={12} className="text-indigo-500" />
              <span>Trộn</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStatusChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  statusFilter === opt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Lượng từ muốn nghe ({playlist.length}/{filteredPool.length} từ)
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {WORD_LIMIT_PRESETS.map((preset) => {
              const isSelected = customLimitText === '' && wordLimit === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetLimitChange(preset.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={Math.max(1, filteredPool.length)}
                value={customLimitText}
                onChange={(e) => handleCustomLimitChange(e.target.value)}
                placeholder="Nhập SL..."
                aria-label="Nhập số lượng từ muốn nghe"
                className={`w-24 px-2.5 py-1.5 rounded-xl text-xs font-bold border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  customLimitText !== ''
                    ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {customLimitText !== '' && (
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  từ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {!currentItem ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Headphones size={34} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Không có từ nào thuộc trạng thái này để phát.
          </p>
          <button
            type="button"
            onClick={() => handleStatusChange('ALL')}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
          >
            Nghe tất cả ({statusSummary.total} từ)
          </button>
        </div>
      ) : (
        <>
          {/* Main Player Display Box */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-900 to-slate-900 text-white shadow-2xl overflow-hidden space-y-6 text-center">
        {/* Glow ambient background circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
          <Headphones size={14} className={isPlaying ? 'animate-bounce text-indigo-300' : ''} />
          <span>Chế độ Nghe Thụ Động • Hands-free</span>
        </div>

        {/* Word Title & IPA */}
        <div className="space-y-2 py-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold capitalize tracking-tight">
            {currentItem.word}
          </h2>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-indigo-300 uppercase text-xs font-bold tracking-wider">
              {currentItem.pos}
            </span>
            <span className="font-mono text-purple-300">
              {currentItem.ipa}
            </span>
          </div>
        </div>

        {/* Meaning Banner */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1 max-w-md mx-auto">
          {currentItem.vietnameseMeaning && (
            <p className="text-lg font-bold text-amber-300">
              {currentItem.vietnameseMeaning}
            </p>
          )}
          <p className="text-xs text-indigo-100 line-clamp-2">
            {currentItem.definition}
          </p>
        </div>

        {/* Example Sentence + Vietnamese translation */}
        {currentItem.example && (
          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 max-w-md mx-auto space-y-1.5">
            <p className="text-sm italic font-serif text-slate-200">
              &ldquo;{currentItem.example}&rdquo;
            </p>
            <p className="text-xs text-indigo-200 font-medium">
              {exampleTranslation ? exampleTranslation : 'Đang dịch câu ví dụ...'}
            </p>
          </div>
        )}

        {/* Real-time speech status pill */}
        <div className="text-xs font-semibold text-indigo-300 py-1">
          {currentStepText}
        </div>

        {/* Player Controls */}
        <div className="pt-2 flex items-center justify-center gap-4 sm:gap-6">
          {/* Repeat single word button */}
          <button
            onClick={() => setIsRepeatWord(!isRepeatWord)}
            className={`p-3 rounded-full transition ${
              isRepeatWord ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={isRepeatWord ? 'Lặp lại từ này: Bật' : 'Lặp lại từ này: Tắt'}
          >
            <Repeat size={20} />
          </button>

          {/* Previous */}
          <button
            onClick={handleSkipPrev}
            className="p-3 text-slate-300 hover:text-white active:scale-95 transition"
            title="Từ trước"
          >
            <SkipBack size={26} />
          </button>

          {/* Big Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
            title={isPlaying ? 'Tạm dừng' : 'Bắt đầu phát tự động'}
          >
            {isPlaying ? <Pause size={28} className="fill-slate-900" /> : <Play size={28} className="fill-slate-900 ml-1" />}
          </button>

          {/* Next */}
          <button
            onClick={handleSkipNext}
            className="p-3 text-slate-300 hover:text-white active:scale-95 transition"
            title="Từ tiếp theo"
          >
            <SkipForward size={26} />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => {
              const rates = [0.8, 0.95, 1.2];
              const nextRate = rates[(rates.indexOf(speechRate) + 1) % rates.length];
              setSpeechRate(nextRate);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
            title="Tốc độ đọc"
          >
            <Gauge size={14} />
            <span>{speechRate}x</span>
          </button>
        </div>

        {/* Replay & Restart Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleReplayCurrent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-indigo-100 active:scale-95 transition"
            title="Phát lại từ đang nghe từ bước 1"
          >
            <RotateCcw size={14} />
            <span>Phát lại từ này</span>
          </button>

          <button
            type="button"
            onClick={handleRestartPlaylist}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-indigo-100 active:scale-95 transition"
            title="Quay về từ số 1 và phát lại từ đầu danh sách"
          >
            <Rewind size={14} />
            <span>Phát lại từ đầu</span>
          </button>
        </div>
      </div>

      {/* Playlist Preview */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Danh sách phát ({playlist.length} từ)
        </h3>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {playlist.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => startPlayingAt(idx, false)}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition ${
                safeIndex === idx
                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-50">{idx + 1}.</span>
                <span className="capitalize">{w.word}</span>
                <span className="opacity-60 font-normal">({w.pos})</span>
              </div>
              <span className="line-clamp-1 max-w-[150px] text-right">
                {w.vietnameseMeaning || w.definition}
              </span>
            </button>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

