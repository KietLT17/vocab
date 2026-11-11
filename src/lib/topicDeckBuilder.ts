import { WordItem } from './types';
import { TOPIC_WORDS, TOPIC_CATEGORIES } from '../data/topicsVocabulary';
import { CURATED_VOCABULARY, EXTENDED_WORD_POOL } from '../data/curatedDictionary';
import { WORD_DEFINITIONS_MAP } from '../data/wordDefinitionsMap';
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
 * Build a guaranteed 50-word deck from selected built-in topics and/or a custom user topic.
 */
export async function buildInitial50WordDeck(
  selectedTopicIds: string[],
  customTopic?: string,
  onProgress?: (current: number, total: number, statusText: string) => void
): Promise<WordItem[]> {
  const TARGET_COUNT = 50;
  const resultMap = new Map<string, WordItem>();

  const addIfUnique = (item: WordItem, topicLabel?: string) => {
    const key = item.word.trim().toLowerCase();
    if (!resultMap.has(key) && resultMap.size < TARGET_COUNT) {
      resultMap.set(key, {
        ...item,
        topic: item.topic || topicLabel || 'general',
      });
    }
  };

  if (onProgress) onProgress(5, TARGET_COUNT, 'Đang chuẩn bị từ vựng theo chủ đề...');

  // 1. If user typed a custom topic, try Datamuse + Dictionary API first so the 50 words match their exact topic
  const trimmedCustom = customTopic?.trim() || '';
  if (trimmedCustom) {
    // Check if custom topic matches any built-in category keyword
    const matchedBuiltIn = TOPIC_CATEGORIES.find(
      (cat) =>
        cat.name.toLowerCase().includes(trimmedCustom.toLowerCase()) ||
        cat.id.toLowerCase() === mapTopicToEnglishKeyword(trimmedCustom)
    );
    if (matchedBuiltIn && TOPIC_WORDS[matchedBuiltIn.id]) {
      for (const w of TOPIC_WORDS[matchedBuiltIn.id]) {
        addIfUnique(w, trimmedCustom);
      }
    }

    if (onProgress) {
      onProgress(resultMap.size, TARGET_COUNT, `Đang tìm từ vựng chủ đề "${trimmedCustom}"...`);
    }

    const remoteWords = await fetchDatamuseWordsForTopic(trimmedCustom, 65);
    const candidates = remoteWords.filter((w) => !resultMap.has(w)).slice(0, 45);

    // Fetch details in batches of 6 for speed
    const BATCH_SIZE = 6;
    for (let i = 0; i < candidates.length && resultMap.size < TARGET_COUNT; i += BATCH_SIZE) {
      const chunk = candidates.slice(i, i + BATCH_SIZE);
      const settled = await Promise.all(
        chunk.map(async (w) => {
          const dict = await lookupDictionaryWord(w);
          if (!dict) return null;
          // Fetch short Vietnamese meaning for the word if missing
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

  // 2. Pull from user's selected built-in topics
  for (const topicId of selectedTopicIds) {
    const words = TOPIC_WORDS[topicId] || [];
    const topicName = TOPIC_CATEGORIES.find((c) => c.id === topicId)?.name || topicId;
    for (const w of words) {
      addIfUnique(w, topicName);
    }
  }

  if (onProgress) {
    onProgress(resultMap.size, TARGET_COUNT, `Đang hoàn thiện kho ${TARGET_COUNT} từ chuẩn...`);
  }

  // 3. If still < 50 words (e.g. selected only 1 built-in topic which has 10 words, or offline),
  // top up from remaining curated topics & extended Oxford pool
  const allTopicEntries = Object.entries(TOPIC_WORDS);
  for (const [tId, words] of allTopicEntries) {
    if (resultMap.size >= TARGET_COUNT) break;
    const topicName = TOPIC_CATEGORIES.find((c) => c.id === tId)?.name || tId;
    for (const w of words) {
      addIfUnique(w, topicName);
    }
  }

  for (const w of CURATED_VOCABULARY) {
    if (resultMap.size >= TARGET_COUNT) break;
    addIfUnique(w, 'Oxford Core');
  }

  for (const extWord of EXTENDED_WORD_POOL) {
    if (resultMap.size >= TARGET_COUNT) break;
    const clean = extWord.toLowerCase();
    if (!resultMap.has(clean)) {
      const meta = WORD_DEFINITIONS_MAP[clean];
      addIfUnique(
        {
          id: clean,
          word: clean,
          ipa: `/${clean}/`,
          pos: meta?.pos || 'adjective',
          level: 'B2',
          audioUrl: `https://api.dictionaryapi.dev/media/pronunciations/en/${clean}-us.mp3`,
          definitions: [
            {
              definition: meta?.definition || `An essential academic word: ${clean}.`,
              vietnameseMeaning: meta?.vietnameseMeaning || clean,
              example: `Understanding how to use "${clean}" accurately improves your English fluency.`,
            },
          ],
        },
        'Oxford Extended'
      );
    }
  }

  if (onProgress) onProgress(TARGET_COUNT, TARGET_COUNT, 'Hoàn tất khởi tạo kho 50 từ!');
  return Array.from(resultMap.values()).slice(0, TARGET_COUNT);
}

