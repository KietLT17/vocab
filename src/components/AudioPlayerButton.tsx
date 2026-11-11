'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface Props {
  audioUrl?: string;
  word: string;
  className?: string;
  size?: number;
}

export default function AudioPlayerButton({
  audioUrl,
  word,
  className = '',
  size = 20,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const playSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    setHasError(false);

    // 1. Try audioUrl first if available
    if (audioUrl) {
      const audio = new Audio(audioUrl);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fallback to Web Speech API if URL fails
        fallbackWebSpeech();
      };

      audio.play().catch(() => {
        fallbackWebSpeech();
      });
    } else {
      fallbackWebSpeech();
    }
  };

  const fallbackWebSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clear learning
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setHasError(true);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      setHasError(true);
    }
  };

  return (
    <button
      onClick={playSound}
      disabled={isPlaying}
      title={hasError ? "Không thể phát âm thanh" : "Nghe phát âm chuẩn"}
      aria-label={`Nghe phát âm ${word}`}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
        isPlaying
          ? 'bg-blue-600 text-white shadow-md scale-105 animate-pulse'
          : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-blue-400'
      } ${className}`}
    >
      {isPlaying ? (
        <Loader2 size={size} className="animate-spin" />
      ) : hasError ? (
        <VolumeX size={size} className="text-gray-400" />
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  );
}

