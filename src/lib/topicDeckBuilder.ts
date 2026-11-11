import { WordItem } from './types';
import { TOPIC_WORDS, TOPIC_CATEGORIES } from '../data/topicsVocabulary';
import {
  buildExtendedWordItem,
  CURATED_VOCABULARY,
  EXTENDED_WORD_POOL,
  shuffleArray,
} from '../data/curatedDictionary';
import { lookupDictionaryWord } from './dictionaryApi';

const VI_TOPIC_MAPPING: Record<string, string> = {
  'kinh doanh': 'business',
  'công việc': 'business',
  'công sở': 'business',
  'thương mại': 'business',
  'tài chính': 'finance',
  'ngân hàng': 'finance',
  'đầu tư': 'investment',
  'công nghệ': 'technology',
  'lập trình': 'programming',
  'phần mềm': 'software',
  'trí tuệ nhân tạo': 'artificial intelligence',
  'học thuật': 'academic',
  'du lịch': 'travel',
  'khách sạn': 'hospitality',
  'y tế': 'medicine',
  'sức khỏe': 'health',
  'bệnh viện': 'healthcare',
  'giáo dục': 'education',
  'trường học': 'school',
  'thể thao': 'sport',
  'bóng đá': 'football',
  'ẩm thực': 'cuisine',
  'nấu ăn': 'cooking',
  'món ăn': 'food',
  'môi trường': 'environment',
  'thiên nhiên': 'nature',
  'khoa học': 'science',
  'tâm lý': 'psychology',
  'cảm xúc': 'emotion',
  'giao tiếp': 'communication',
  'đời sống': 'daily life',
  'nghệ thuật': 'art',
  'âm nhạc': 'music',
  'phim ảnh': 'cinema',
  'thời trang': 'fashion',
  'lịch sử': 'history',
  'kiến trúc': 'architecture',
};

function mapTopicToEnglishKeyword(topic: string): string {
  const lower = topic.trim().toLowerCase();
  for (const [vi, en] of Object.entries(VI_TOPIC_MAPPING)) {
    if (lower.includes(vi)) return en;
  }
  return lower;
}

async function fetchWithTimeout(url: string, timeoutMs: number = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function quickTranslateVi(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
      text
    )}`;
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((chunk: unknown[]) => chunk[0]).join('');
      }
    }
  } catch {
    // ignore
  }
  return '';
}

async function fetchDatamuseWordsForTopic(topicKeyword: string, limit: number = 55): Promise<string[]> {
  try {
    const enTopic = mapTopicToEnglishKeyword(topicKeyword);
    const res = await fetchWithTimeout(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(enTopic)}&max=${limit}`
    );
    if (!res.ok) return [];
    const data: Array<{ word: string; score?: number }> = await res.json();

    return data
      .map((item) => item.word.toLowerCase().trim())
      .filter((w) => /^[a-z]{3,16}$/.test(w));
  } catch {
    return [];
  }
}

/**
 * Build a randomized 50-word deck from selected built-in topics and/or a custom user topic.
 * Deduplicates strictly against the active account's existing words and avoids 100% clone decks.
 */
export async function buildInitial50WordDeck(
  selectedTopicIds: string[],
  customTopic?: string,
  onProgress?: (current: number, total: number, statusText: string) => void,
  excludedWordIds?: Set<string>,
  otherAccountSets?: Set<string>[]
): Promise<WordItem[]> {
  const TARGET_COUNT = 50;
  const excluded = new Set(Array.from(excludedWordIds || [], (w) => w.trim().toLowerCase()));
  const resultMap = new Map<string, WordItem>();

  const addIfUnique = (item: WordItem, topicLabel?: string) => {
    const key = item.word.trim().toLowerCase();
    if (!excluded.has(key) && !excluded.has(item.id.toLowerCase()) && !resultMap.has(key) && resultMap.size < TARGET_COUNT) {
      resultMap.set(key, {
        ...item,
        topic: item.topic || topicLabel || 'general',
      });
    }
  };

  if (onProgress) onProgress(5, TARGET_COUNT, 'Đang chuẩn bị từ vựng ngẫu nhiên theo chủ đề...');

  // 1. If user typed a custom topic, try Datamuse (shuffled) + Dictionary API
  const trimmedCustom = customTopic?.trim() || '';
  if (trimmedCustom) {
    const matchedBuiltIn = TOPIC_CATEGORIES.find(
      (cat) =>
        cat.name.toLowerCase().includes(trimmedCustom.toLowerCase()) ||
        cat.id.toLowerCase() === mapTopicToEnglishKeyword(trimmedCustom)
    );
    if (matchedBuiltIn && TOPIC_WORDS[matchedBuiltIn.id]) {
      for (const w of shuffleArray(TOPIC_WORDS[matchedBuiltIn.id])) {
        addIfUnique(w, trimmedCustom);
      }
    }

    if (onProgress) {
      onProgress(resultMap.size, TARGET_COUNT, `Đang tìm từ vựng chủ đề "${trimmedCustom}"...`);
    }

    const remoteWords = shuffleArray(await fetchDatamuseWordsForTopic(trimmedCustom, 100));
    const candidates = remoteWords.filter((w) => !resultMap.has(w) && !excluded.has(w)).slice(0, 45);

    const BATCH_SIZE = 6;
    for (let i = 0; i < candidates.length && resultMap.size < TARGET_COUNT; i += BATCH_SIZE) {
      const chunk = candidates.slice(i, i + BATCH_SIZE);
      const settled = await Promise.all(
        chunk.map(async (w) => {
          const dict = await lookupDictionaryWord(w);
          if (!dict) return null;
          if (!dict.definitions[0]?.vietnameseMeaning) {
            const viWord = await quickTranslateVi(dict.word);
            if (viWord && dict.definitions[0]) {
              dict.definitions[0].vietnameseMeaning = viWord;
            }
          }
          return dict;
        })
      );

      for (const item of settled) {
        if (item && resultMap.size < TARGET_COUNT) {
          addIfUnique(item, trimmedCustom);
        }
      }

      if (onProgress) {
        onProgress(
          Math.min(resultMap.size, TARGET_COUNT),
          TARGET_COUNT,
          `Đã nạp ${resultMap.size}/${TARGET_COUNT} từ chủ đề "${trimmedCustom}"...`
        );
      }
    }
  }

  // 2. Pull randomly from user's selected built-in topics (cap priority to 35 so remaining slots diversify across full pool)
  const selectedPool: WordItem[] = [];
  for (const topicId of selectedTopicIds) {
    const topicName = TOPIC_CATEGORIES.find((c) => c.id === topicId)?.name || topicId;
    for (const w of TOPIC_WORDS[topicId] || []) {
      selectedPool.push({ ...w, topic: w.topic || topicName });
    }
  }
  const priorityLimit = Math.min(TARGET_COUNT, resultMap.size + Math.min(35, selectedPool.length));
  for (const w of shuffleArray(selectedPool)) {
    if (resultMap.size >= priorityLimit) break;
    addIfUnique(w);
  }

  if (onProgress) {
    onProgress(resultMap.size, TARGET_COUNT, `Đang chọn ngẫu nhiên kho ${TARGET_COUNT} từ...`);
  }

  // 3. Top up randomly from one unified shuffled pool (other topics + curated + extended Oxford)
  const fullPool: WordItem[] = [
    ...Object.entries(TOPIC_WORDS).flatMap(([tId, words]) => {
      const topicName = TOPIC_CATEGORIES.find((c) => c.id === tId)?.name || tId;
      return words.map((w) => ({ ...w, topic: w.topic || topicName }));
    }),
    ...CURATED_VOCABULARY.map((w) => ({ ...w, topic: w.topic || 'Oxford Core' })),
    ...EXTENDED_WORD_POOL.map((ext) => buildExtendedWordItem(ext, 'Oxford Extended')),
  ];

  const shuffledFullPool = shuffleArray(fullPool);
  for (const w of shuffledFullPool) {
    if (resultMap.size >= TARGET_COUNT) break;
    addIfUnique(w);
  }

  let deck = Array.from(resultMap.values()).slice(0, TARGET_COUNT);

  // 4. Prevent 100% identical full-deck match against another account on the same device
  if (otherAccountSets && otherAccountSets.length > 0 && deck.length > 0) {
    const isExactClone = otherAccountSets.some(
      (other) => other.size === deck.length && deck.every((w) => other.has(w.word.toLowerCase()))
    );
    if (isExactClone) {
      const replacements = shuffledFullPool.filter((w) => {
        const key = w.word.toLowerCase();
        return !resultMap.has(key) && !excluded.has(key);
      });
      const swapCount = Math.min(8, replacements.length, deck.length);
      for (let i = 0; i < swapCount; i++) {
        deck[i] = replacements[i];
      }
    }
  }

  if (onProgress) onProgress(TARGET_COUNT, TARGET_COUNT, 'Hoàn tất khởi tạo kho 50 từ ngẫu nhiên!');
  return shuffleArray(deck);
}

