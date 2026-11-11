'use client';

import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/speech';

interface Props {
  sentence: string;
  className?: string;
  size?: number;
}

export default function SentenceAudioButton({ sentence, className = '', size = 16 }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlaySentence = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(sentence, {
      lang: 'en-US',
      rate: 0.95,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  return (
    <button
      onClick={handlePlaySentence}
      title={isPlaying ? "Dừng phát câu" : "Nghe đọc toàn bộ câu ngữ cảnh"}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
        isPlaying
          ? 'bg-indigo-600 text-white animate-pulse shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
      } ${className}`}
    >
      {isPlaying ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        <Volume2 size={size} />
      )}
      <span>{isPlaying ? 'Đang đọc...' : 'Nghe câu'}</span>
    </button>
  );
}

