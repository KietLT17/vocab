import { WordItem } from './types';
import {
  buildExtendedWordItem,
  CURATED_VOCABULARY,
  EXTENDED_WORD_POOL,
} from '../data/curatedDictionary';
import { TOPIC_WORDS } from '../data/topicsVocabulary';

export interface FreeDictResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
  }>;
}

async function fetchWithTimeout(url: string, timeoutMs: number = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: 'force-cache', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch word details from Free Dictionary API or fallback to curated list
 */
export async function lookupDictionaryWord(word: string): Promise<WordItem | null> {
  const cleanWord = word.trim().toLowerCase();

  // 1. Check local curated vocabulary first
  const localMatch = CURATED_VOCABULARY.find(
    (w) => w.word.toLowerCase() === cleanWord
  );
  if (localMatch) {
    return localMatch;
  }

  // 2. Fetch from Free Dictionary API (bounded timeout to keep UI responsive)
  try {
    const res = await fetchWithTimeout(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );

    if (res.ok) {
      const data: FreeDictResponse[] = await res.json();
      const entry = data[0];

      if (entry) {
        // Find best audio (preferably .mp3 with content)
        const audioItem = entry.phonetics?.find(
          (p) => p.audio && p.audio.trim().length > 0 && p.audio.endsWith('.mp3')
        ) || entry.phonetics?.find((p) => p.audio && p.audio.trim().length > 0);

        const ipa =
          entry.phonetic ||
          audioItem?.text ||
          entry.phonetics?.find((p) => p.text)?.text ||
          `/${cleanWord}/`;

        const audioUrl = audioItem?.audio || undefined;

        // Parse definitions & examples
        const definitions = (entry.meanings || []).flatMap((m) =>
          m.definitions.map((d) => ({
            definition: d.definition,
            example:
              d.example ||
              `The context often requires careful consideration when using "${cleanWord}".`,
            synonyms: d.synonyms?.slice(0, 4) || m.synonyms?.slice(0, 4) || [],
          }))
        );

        const firstMeaning = entry.meanings?.[0];
        const pos = firstMeaning?.partOfSpeech || 'noun';

        return {
          id: cleanWord,
          word: cleanWord,
          ipa,
          pos,
          audioUrl,
          definitions: definitions.length > 0 ? definitions.slice(0, 3) : [
            {
              definition: `Meaning of ${cleanWord}`,
              example: `This is an example sentence with ${cleanWord}.`
            }
          ],
          collocations: definitions[0]?.synonyms?.length
            ? [`Related: ${definitions[0].synonyms.join(', ')}`]
            : undefined
        };
      }
    }
  } catch (err) {
    console.warn(`Could not fetch online details for "${cleanWord}", fallback to standard generation.`, err);
  }

  // Fallback generation for unknown words
  return {
    id: cleanWord,
    word: cleanWord,
    ipa: `/${cleanWord}/`,
    pos: 'general',
    definitions: [
      {
        definition: `A term used in modern English contexts: "${cleanWord}".`,
        example: `Learning how to properly apply "${cleanWord}" in daily communication.`
      }
    ]
  };
}

/**
 * Get a random word across all curated/topic/extended pools, excluding words already in the active account.
 */
export async function fetchRandomWordExcluding(
  excludedWordIds: Set<string>
): Promise<WordItem | null> {
  const excludedLower = new Set(Array.from(excludedWordIds, (w) => w.toLowerCase()));
  const candidatesByWord = new Map<string, WordItem>();

  const registerCandidate = (item: WordItem) => {
    const clean = item.word.trim().toLowerCase();
    if (!excludedLower.has(clean) && !excludedLower.has(item.id.toLowerCase()) && !candidatesByWord.has(clean)) {
      candidatesByWord.set(clean, item);
    }
  };

  for (const w of CURATED_VOCABULARY) registerCandidate(w);
  for (const w of Object.values(TOPIC_WORDS).flat()) registerCandidate(w);
  for (const ext of EXTENDED_WORD_POOL) registerCandidate(buildExtendedWordItem(ext));

  const pool = Array.from(candidatesByWord.values());
  if (pool.length === 0) return null;

  const selected = pool[Math.floor(Math.random() * pool.length)];
  // If synthesized fallback lacks curated rich definition in map, try online dictionary lookup
  if (selected.topic === 'Oxford Extended' && selected.definitions[0]?.vietnameseMeaning === selected.word) {
    const online = await lookupDictionaryWord(selected.word);
    if (online) return online;
  }
  return selected;
}

