'use client';

import React, { useEffect, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { translateSentenceToVietnamese } from '../data/sentenceTranslations';

interface Props {
  sentence: string;
  meaningHint?: string;
  className?: string;
}

export default function TranslateSentenceButton({ sentence, meaningHint, className = '' }: Props) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTranslation(null);
    setIsOpen(false);
    setIsLoading(false);
  }, [sentence]);

  const handleToggleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (translation) {
      setIsOpen((prev) => !prev);
      return;
    }

    setIsLoading(true);
    const result = await translateSentenceToVietnamese(sentence, meaningHint);
    setTranslation(result);
    setIsOpen(true);
    setIsLoading(false);
  };

  return (
    <div className={`space-y-1.5 not-italic ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggleTranslate}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Languages size={13} className="text-blue-600 dark:text-blue-400" />}
        <span>{isLoading ? 'Đang dịch...' : isOpen ? 'Ẩn dịch câu' : 'Dịch câu'}</span>
      </button>

      {isOpen && translation && (
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
          {translation}
        </p>
      )}
    </div>
  );
}

