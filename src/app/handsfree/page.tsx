'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  ArrowLeft,
  Sparkles,
  Repeat,
  Gauge
} from 'lucide-react';
import { UserVocabItem } from '../../lib/types';
import { getDueReviewWords, getStoredUserVocab } from '../../lib/storage';
import { speakText, stopSpeaking } from '../../lib/speech';

export default function HandsFreeAudioPage() {
  const [playlist, setPlaylist] = useState<UserVocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeatWord, setIsRepeatWord] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [currentStepText, setCurrentStepText] = useState<string>('Sẵn sàng');

  const isPlayingRef = useRef(false);
  const isRepeatRef = useRef(false);
  const currentIndexRef = useRef(0);
  const playlistRef = useRef<UserVocabItem[]>([]);
  const speechRateRef = useRef(0.95);

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

  useEffect(() => {
    const refreshPlaylist = () => {
      const due = getDueReviewWords();
      const all = getStoredUserVocab();
      setPlaylist(due.length > 0 ? due : all);
      setCurrentIndex(0);
    };

    refreshPlaylist();
    window.addEventListener('vocabflow_account_changed', refreshPlaylist);

    return () => {
      window.removeEventListener('vocabflow_account_changed', refreshPlaylist);
      stopSpeaking();
      isPlayingRef.current = false;
    };
  }, []);

  const currentItem = playlist[currentIndex];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Play audio url (native mp3) or fallback to speech
  const playNativeOrSpeechWord = (wordItem: UserVocabItem): Promise<void> => {
    return new Promise((resolve) => {
      if (wordItem.audioUrl) {
        const audio = new Audio(wordItem.audioUrl);
        audio.playbackRate = speechRateRef.current;
        audio.onended = () => resolve();
        audio.onerror = () => {
          speakText(wordItem.word, {
            lang: 'en-US',
            rate: speechRateRef.current,
            onEnd: () => resolve(),
            onError: () => resolve(),
          });
        };
        audio.play().catch(() => {
          speakText(wordItem.word, {
            lang: 'en-US',
            rate: speechRateRef.current,
            onEnd: () => resolve(),
            onError: () => resolve(),
          });
        });
      } else {
        speakText(wordItem.word, {
          lang: 'en-US',
          rate: speechRateRef.current,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      }
    });
  };

  // Automated sequence loop for 1 word
  const playWordSequence = async (idx: number) => {
    if (!isPlayingRef.current) return;
    const item = playlistRef.current[idx];
    if (!item) return;

    // Step 1: Speak English Word
    setCurrentStepText(`1. Đang đọc từ: "${item.word}"`);
    await playNativeOrSpeechWord(item);
    if (!isPlayingRef.current) return;
    await sleep(900);

    // Step 2: Speak Vietnamese meaning if present
    if (item.vietnameseMeaning && isPlayingRef.current) {
      setCurrentStepText(`2. Nghĩa tiếng Việt: "${item.vietnameseMeaning}"`);
      await new Promise<void>((resolve) => {
        speakText(item.vietnameseMeaning!, {
          lang: 'vi-VN',
          rate: 1.0,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      });
      if (!isPlayingRef.current) return;
      await sleep(900);
    }

    // Step 3: Speak Example Sentence
    if (item.example && isPlayingRef.current) {
      setCurrentStepText(`3. Đọc câu ví dụ ngữ cảnh...`);
      await new Promise<void>((resolve) => {
        speakText(item.example, {
          lang: 'en-US',
          rate: speechRateRef.current * 0.95,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      });
      if (!isPlayingRef.current) return;
      await sleep(1500);
    }

    // Next step
    if (!isPlayingRef.current) return;

    if (isRepeatRef.current) {
      // Repeat same word
      playWordSequence(idx);
    } else {
      // Advance to next word
      const nextIndex = (idx + 1) % playlistRef.current.length;
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      playWordSequence(nextIndex);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopSpeaking();
      setCurrentStepText('Tạm dừng');
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playWordSequence(currentIndex);
    }
  };

  const handleSkipNext = () => {
    stopSpeaking();
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    if (isPlayingRef.current) {
      playWordSequence(nextIndex);
    }
  };

  const handleSkipPrev = () => {
    stopSpeaking();
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    currentIndexRef.current = prevIndex;
    if (isPlayingRef.current) {
      playWordSequence(prevIndex);
    }
  };

  if (playlist.length === 0) {
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
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Thoát chế độ rảnh tay
        </Link>

        <span className="text-xs font-bold text-slate-400">
          Từ {currentIndex + 1} / {playlist.length}
        </span>
      </div>

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

        {/* Example Sentence */}
        {currentItem.example && (
          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-sm italic font-serif text-slate-200 max-w-md mx-auto">
            "{currentItem.example}"
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
              onClick={() => {
                stopSpeaking();
                setCurrentIndex(idx);
                currentIndexRef.current = idx;
                if (isPlayingRef.current) {
                  playWordSequence(idx);
                }
              }}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition ${
                currentIndex === idx
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
    </div>
  );
}

