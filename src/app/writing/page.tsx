'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookMarked,
  CheckCircle2,
  FileText,
  History,
  PenTool,
  RotateCcw,
  Send,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { TOPIC_CATEGORIES } from '../../data/topicsVocabulary';
import {
  getOnboardingState,
  getStoredUserVocab,
  getWritingHistory,
  recordWritingParagraphAttempt,
} from '../../lib/storage';
import { UserVocabItem, WritingAttempt, WritingPrompt } from '../../lib/types';
import { sounds } from '../../lib/soundEffects';

const CONNECTORS_BANK = [
  'however',
  'moreover',
  'furthermore',
  'therefore',
  'consequently',
  'in addition',
  'for example',
  'for instance',
  'although',
  'nevertheless',
  'meanwhile',
  'because',
  'since',
  'while',
  'despite',
  'firstly',
  'secondly',
  'finally',
  'overall',
  'in conclusion',
];

const TOPIC_PROMPTS_MAP: Record<string, Omit<WritingPrompt, 'id' | 'topicId' | 'topicName'>> = {
  business: {
    title: 'Đổi mới & Vượt khó trong Doanh nghiệp',
    scenario:
      'Viết một đoạn văn ngắn (80–160 từ) chia sẻ cách một doanh nghiệp hoặc đội nhóm thích nghi, giữ vững chiến lược thực tế và vượt qua thử thách kinh doanh.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['However', 'Moreover', 'Consequently', 'For example', 'Therefore'],
  },
  technology: {
    title: 'Tác động của Công nghệ & AI đến Công việc',
    scenario:
      'Viết một đoạn văn (80–160 từ) phân tích cách công nghệ số hoặc AI thay đổi cách con người học tập và làm việc hàng ngày.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['Furthermore', 'In addition', 'Although', 'For instance', 'Overall'],
  },
  academic: {
    title: 'Giải quyết Vấn đề bằng Tư duy Học thuật',
    scenario:
      'Viết một đoạn văn nghị luận ngắn (80–160 từ) trình bày quan điểm về tầm quan trọng của nghiên cứu, lập luận rõ ràng và tinh thần kiên trì.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['Firstly', 'Secondly', 'Nevertheless', 'Consequently', 'In conclusion'],
  },
  daily_life: {
    title: 'Giao tiếp & Thói quen Sống Tích cực',
    scenario:
      'Viết một đoạn văn (80–160 từ) kể về một trải nghiệm giao tiếp hoặc thói quen tích cực giúp cải thiện chất lượng cuộc sống hàng ngày của bạn.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['Meanwhile', 'Because', 'For example', 'However', 'Finally'],
  },
  psychology: {
    title: 'Bản lĩnh Tâm lý & Thấu cảm',
    scenario:
      'Viết một đoạn văn (80–160 từ) nói về vai trò của sự kiên cường tinh thần và khả năng thấu cảm trong việc xây dựng các mối quan hệ bền vững.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['Although', 'Moreover', 'Because', 'Therefore', 'Overall'],
  },
  environment: {
    title: 'Bảo vệ Môi trường & Phát triển Bền vững',
    scenario:
      'Viết một đoạn văn (80–160 từ) đề xuất những hành động thiết thực để giảm tác động môi trường và bảo vệ hệ sinh thái tự nhiên.',
    minWords: 80,
    maxWords: 160,
    connectingWordsHint: ['Firstly', 'In addition', 'Despite', 'Consequently', 'Finally'],
  },
};

function matchesWordInText(textLower: string, rawWord: string): boolean {
  const clean = rawWord.toLowerCase().trim();
  if (!clean) return false;

  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const variants = [
    escaped,
    `${escaped}s`,
    `${escaped}es`,
    `${escaped}ed`,
    `${escaped}d`,
    `${escaped}ing`,
    `${escaped}ly`,
  ];

  if (clean.endsWith('e') && clean.length > 3) {
    const stem = clean.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    variants.push(`${stem}ing`, `${stem}ed`);
  }
  if (clean.endsWith('y') && clean.length > 3) {
    const stem = clean.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    variants.push(`${stem}ies`, `${stem}ied`);
  }

  const pattern = new RegExp(`\\b(${variants.join('|')})\\b`, 'i');
  return pattern.test(textLower);
}

function selectTargetWordsForTopic(
  allVocab: UserVocabItem[],
  topicId: string,
  topicName: string,
  count: number = 6
): UserVocabItem[] {
  const topicWords = allVocab.filter((w) => {
    const wt = (w.topic || '').toLowerCase();
    return (
      wt === topicId.toLowerCase() ||
      wt.includes(topicName.toLowerCase()) ||
      wt.includes(topicId.toLowerCase())
    );
  });

  const pool = topicWords.length >= 4 ? topicWords : allVocab;
  const prioritized = [...pool].sort((a, b) => {
    const aMastered = a.writingMastered ? 1 : 0;
    const bMastered = b.writingMastered ? 1 : 0;
    if (aMastered !== bMastered) return aMastered - bMastered;
    return Math.random() - 0.5;
  });

  return prioritized.slice(0, Math.min(count, prioritized.length));
}

function evaluateParagraph(
  content: string,
  prompt: WritingPrompt,
  targetItems: UserVocabItem[]
): WritingAttempt {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();

  const targetWords = targetItems.map((i) => i.word);
  const usedTargetWords = targetWords.filter((w) => matchesWordInText(lower, w));

  // 1. Vocab score (max 40)
  const vocabRatio = targetWords.length > 0 ? usedTargetWords.length / targetWords.length : 0;
  const vocabScore = Math.round(Math.min(1, vocabRatio) * 40);

  // 2. Structure & Word count score (max 20)
  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);

  let structureScore = 0;
  if (wordCount >= prompt.minWords && wordCount <= prompt.maxWords + 40) {
    structureScore += 12;
  } else if (wordCount >= Math.round(prompt.minWords * 0.65)) {
    structureScore += 8;
  } else if (wordCount >= 30) {
    structureScore += 4;
  }

  if (sentences.length >= 4) {
    structureScore += 8;
  } else if (sentences.length >= 2) {
    structureScore += 4;
  }

  // 3. Basic Grammar & Mechanics score (max 20)
  let grammarScore = 0;
  const capitalizedSentences = sentences.filter((s) => /^[A-Z]/.test(s)).length;
  if (sentences.length > 0 && capitalizedSentences / sentences.length >= 0.75) {
    grammarScore += 7;
  } else if (capitalizedSentences > 0) {
    grammarScore += 3;
  }

  if (/[.!?]$/.test(trimmed)) {
    grammarScore += 5;
  }

  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 30) {
    grammarScore += 8;
  } else if (avgWordsPerSentence >= 5) {
    grammarScore += 4;
  }

  // 4. Cohesion & Collocations score (max 20)
  const usedConnectors = CONNECTORS_BANK.filter((conn) =>
    new RegExp(`\\b${conn.replace(/\s+/g, '\\s+')}\\b`, 'i').test(lower)
  );
  let cohesionScore = Math.min(14, usedConnectors.length * 5);

  const collocationsUsed = targetItems.some((item) =>
    (item.collocations || []).some((col) => lower.includes(col.toLowerCase()))
  );
  if (collocationsUsed) {
    cohesionScore = Math.min(20, cohesionScore + 6);
  } else if (usedConnectors.length >= 3) {
    cohesionScore = Math.min(20, cohesionScore + 4);
  }

  const totalScore = Math.min(100, vocabScore + structureScore + grammarScore + cohesionScore);

  // Feedback
  const feedback: string[] = [];
  if (usedTargetWords.length === targetWords.length && targetWords.length > 0) {
    feedback.push(`Xuất sắc! Bạn đã vận dụng đủ ${usedTargetWords.length}/${targetWords.length} từ vựng mục tiêu.`);
  } else {
    const missing = targetWords.filter((w) => !usedTargetWords.includes(w));
    feedback.push(
      `Đã dùng ${usedTargetWords.length}/${targetWords.length} từ mục tiêu.${
        missing.length > 0 ? ` Còn thiếu: ${missing.join(', ')}.` : ''
      }`
    );
  }

  if (wordCount < prompt.minWords) {
    feedback.push(`Độ dài hiện tại ${wordCount} từ (nên viết tối thiểu ${prompt.minWords} từ để đủ ý phát triển đoạn).`);
  } else {
    feedback.push(`Độ dài đạt chuẩn (${wordCount} từ, ${sentences.length} câu).`);
  }

  if (usedConnectors.length >= 2) {
    feedback.push(`Liên kết mạch lạc tốt (đã dùng từ nối: ${usedConnectors.slice(0, 4).join(', ')}).`);
  } else {
    feedback.push('Nên thêm các từ nối (ví dụ: However, Moreover, Consequently) để tăng điểm liên kết đoạn.');
  }

  if (totalScore >= 60 && usedTargetWords.length > 0) {
    feedback.push('Các từ mục tiêu đã dùng được đánh dấu "Đã viết đoạn" (tách biệt với % trắc nghiệm).');
  } else if (totalScore < 60) {
    feedback.push('Cần đạt tối thiểu 60/100 điểm và sử dụng từ mục tiêu để xác nhận thuộc phần Viết đoạn.');
  }

  return {
    id: `writing-${Date.now()}`,
    promptId: prompt.id,
    promptTitle: prompt.title,
    topicName: prompt.topicName,
    content: trimmed,
    wordCount,
    score: totalScore,
    targetWords,
    usedTargetWords,
    breakdown: {
      vocabScore,
      structureScore,
      grammarScore,
      cohesionScore,
    },
    feedback,
    createdAt: new Date().toISOString(),
  };
}

export default function WritingTestPage() {
  const [mounted, setMounted] = useState(false);
  const [allVocab, setAllVocab] = useState<UserVocabItem[]>([]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('business');
  const [targetItems, setTargetItems] = useState<UserVocabItem[]>([]);
  const [draftText, setDraftText] = useState('');
  const [latestAttempt, setLatestAttempt] = useState<WritingAttempt | null>(null);
  const [history, setHistory] = useState<WritingAttempt[]>([]);

  const prompts: WritingPrompt[] = useMemo(() => {
    const base = TOPIC_CATEGORIES.map((cat) => {
      const detail = TOPIC_PROMPTS_MAP[cat.id] || TOPIC_PROMPTS_MAP.daily_life;
      return {
        id: `prompt-${cat.id}`,
        topicId: cat.id,
        topicName: cat.name,
        ...detail,
      };
    });

    if (customTopic.trim()) {
      base.unshift({
        id: 'prompt-custom',
        topicId: 'custom',
        topicName: `Chủ đề riêng: ${customTopic}`,
        title: `Viết đoạn về chủ đề "${customTopic}"`,
        scenario: `Viết một đoạn văn ngắn (80–160 từ) xoay quanh chủ đề "${customTopic}", lồng ghép tự nhiên các từ vựng mục tiêu bên dưới.`,
        minWords: 80,
        maxWords: 160,
        connectingWordsHint: ['However', 'Moreover', 'For example', 'Therefore', 'Overall'],
      });
    }

    return base;
  }, [customTopic]);

  const activePrompt = useMemo(
    () => prompts.find((p) => p.topicId === selectedTopicId) || prompts[0],
    [prompts, selectedTopicId]
  );

  const loadData = (preferredTopicId?: string) => {
    const vocab = getStoredUserVocab();
    const onboarding = getOnboardingState();
    setAllVocab(vocab);
    setHistory(getWritingHistory());

    const cTopic = onboarding.customTopic?.trim() || '';
    setCustomTopic(cTopic);

    const initialTopicId =
      preferredTopicId || (cTopic ? 'custom' : onboarding.selectedTopics?.[0] || 'business');
    setSelectedTopicId(initialTopicId);

    const topicName =
      initialTopicId === 'custom'
        ? cTopic
        : TOPIC_CATEGORIES.find((c) => c.id === initialTopicId)?.name || initialTopicId;

    setTargetItems(selectTargetWordsForTopic(vocab, initialTopicId, topicName, 6));
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const onAccountChange = () => {
      setLatestAttempt(null);
      setDraftText('');
      loadData();
    };
    window.addEventListener('vocabflow_account_changed', onAccountChange);
    return () => {
      window.removeEventListener('vocabflow_account_changed', onAccountChange);
    };
  }, []);

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setLatestAttempt(null);
    const topicName =
      topicId === 'custom'
        ? customTopic
        : TOPIC_CATEGORIES.find((c) => c.id === topicId)?.name || topicId;
    setTargetItems(selectTargetWordsForTopic(allVocab, topicId, topicName, 6));
  };

  const handleShuffleTargets = () => {
    if (!activePrompt) return;
    setTargetItems(
      selectTargetWordsForTopic(allVocab, activePrompt.topicId, activePrompt.topicName, 6)
    );
  };

  const liveWordCount = useMemo(() => {
    const trimmed = draftText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [draftText]);

  const liveUsedSet = useMemo(() => {
    const lower = draftText.toLowerCase();
    return new Set(
      targetItems
        .map((i) => i.word)
        .filter((word) => matchesWordInText(lower, word))
    );
  }, [draftText, targetItems]);

  const handleSubmitParagraph = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrompt || !draftText.trim()) return;

    const attempt = evaluateParagraph(draftText, activePrompt, targetItems);
    recordWritingParagraphAttempt(attempt);
    setLatestAttempt(attempt);
    setAllVocab(getStoredUserVocab());
    setHistory(getWritingHistory());

    if (attempt.score >= 65) {
      sounds.playCorrect();
    }
  };

  const handleResetEditor = () => {
    setDraftText('');
    setLatestAttempt(null);
    handleShuffleTargets();
  };

  if (!mounted) return null;

  const writingMasteredCount = allVocab.filter((w) => w.writingMastered).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wide">
          <FileText size={14} /> Bài Test Viết đoạn theo Chủ đề (Tính điểm riêng)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Kiểm tra Viết đoạn &amp; Vận dụng Từ vựng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          Luyện viết đoạn văn hoàn chỉnh theo chủ đề. Hệ thống chấm điểm riêng trên thang 100 và đánh dấu{' '}
          <b>Đã thuộc Viết đoạn ({writingMasteredCount}/{allVocab.length} từ)</b> — hoàn toàn không cộng hay trừ vào % bài trắc nghiệm.
        </p>
      </div>

      {allVocab.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <p className="text-sm text-slate-500">
            Kho từ vựng hiện đang trống. Hãy khởi tạo bộ 50 từ ở Trang chủ trước khi thi viết đoạn.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm"
          >
            Về trang chủ
          </Link>
        </div>
      ) : (
        <>
          {/* Topic Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Chọn chủ đề bài viết
            </div>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p.topicId}
                  onClick={() => handleSelectTopic(p.topicId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activePrompt?.topicId === p.topicId
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.topicName}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt + Target Words + Editor */}
          {activePrompt && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Prompt & Target Words */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <PenTool size={16} />
                    <span>{activePrompt.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activePrompt.scenario}
                  </p>
                  <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl">
                    Độ dài khuyến nghị: {activePrompt.minWords}–{activePrompt.maxWords} từ
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookMarked size={14} /> Từ mục tiêu ({liveUsedSet.size}/{targetItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleShuffleTargets}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                    >
                      <Shuffle size={13} /> Đổi từ
                    </button>
                  </div>

                  <div className="space-y-2">
                    {targetItems.map((item) => {
                      const isUsed = liveUsedSet.has(item.word);
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border transition text-xs ${
                            isUsed
                              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold capitalize text-slate-900 dark:text-white">
                              {item.word}{' '}
                              <span className="font-normal text-slate-400">({item.pos})</span>
                            </span>
                            {isUsed ? (
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                            ) : item.writingMastered ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold">
                                Đã viết
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {item.vietnameseMeaning || item.definition}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Gợi ý từ nối tăng điểm mạch lạc:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePrompt.connectingWordsHint.map((conn) => (
                        <button
                          key={conn}
                          type="button"
                          onClick={() =>
                            setDraftText((prev) =>
                              prev ? `${prev.trimEnd()} ${conn}, ` : `${conn}, `
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition"
                        >
                          + {conn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Writing Editor & Result */}
              <div className="lg:col-span-2 space-y-5">
                <form
                  onSubmit={handleSubmitParagraph}
                  className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Bài viết tiếng Anh của bạn
                    </span>
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full ${
                        liveWordCount >= activePrompt.minWords
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {liveWordCount} / {activePrompt.minWords}+ từ
                    </span>
                  </div>

                  <textarea
                    rows={10}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Bắt đầu viết đoạn văn tiếng Anh của bạn tại đây. Hãy cố gắng dùng tự nhiên toàn bộ các từ vựng mục tiêu ở cột bên trái..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 bg-slate-50/40 dark:bg-slate-800/70 text-slate-900 dark:text-white outline-none text-sm sm:text-base leading-relaxed resize-y transition"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResetEditor}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <RotateCcw size={15} /> Viết bài mới / Đổi từ
                    </button>

                    <button
                      type="submit"
                      disabled={liveWordCount < 10}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-40 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition"
                    >
                      <Send size={16} />
                      <span>Chấm điểm bài viết</span>
                    </button>
                  </div>
                </form>

                {/* Grading Result Card */}
                {latestAttempt && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-purple-300 dark:border-purple-800 shadow-sm space-y-5 animate-in zoom-in-95">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Award size={26} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
                            Điểm bài viết đoạn
                          </div>
                          <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {latestAttempt.score}{' '}
                            <span className="text-base font-normal text-slate-400">/ 100</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          latestAttempt.score >= 65
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : latestAttempt.score >= 60
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {latestAttempt.score >= 65
                          ? 'Đạt chuẩn Viết đoạn'
                          : latestAttempt.score >= 60
                          ? 'Khá — Đã ghi nhận từ đã viết'
                          : 'Cần bổ sung thêm từ & độ dài'}
                      </span>
                    </div>

                    {/* 4 Rubric Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[11px] text-slate-500">Từ mục tiêu</div>
                        <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                          {latestAttempt.breakdown.vocabScore}/40
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[11px] text-slate-500">Độ dài &amp; Bố cục</div>
                        <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                          {latestAttempt.breakdown.structureScore}/20
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[11px] text-slate-500">Ngữ pháp cơ bản</div>
                        <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                          {latestAttempt.breakdown.grammarScore}/20
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="text-[11px] text-slate-500">Từ nối &amp; Cụm từ</div>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          {latestAttempt.breakdown.cohesionScore}/20
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" /> Nhận xét chi tiết:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {latestAttempt.feedback.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Writing History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <History size={16} className="text-slate-400" />
                <span>Lịch sử các bài viết đoạn ({history.length})</span>
              </h3>
              <div className="space-y-2.5">
                {history.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.promptTitle}
                        </span>
                        <span className="ml-2 text-slate-400">({item.topicName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold">
                          {item.score}/100 điểm
                        </span>
                        <span className="text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                      "{item.content}"
                    </p>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Từ mục tiêu đã dùng ({item.usedTargetWords.length}/{item.targetWords.length}):{' '}
                      {item.usedTargetWords.join(', ') || 'Chưa có'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

