import { WordItem } from './types';
import { CURATED_VOCABULARY, EXTENDED_WORD_POOL } from '../data/curatedDictionary';
import { WORD_DEFINITIONS_MAP } from '../data/wordDefinitionsMap';

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
 * Get a random word not in the excluded list
 */
export async function fetchRandomWordExcluding(
  excludedWordIds: Set<string>
): Promise<WordItem | null> {
  // 1. Try first from curated vocabulary
  const availableCurated = CURATED_VOCABULARY.filter(
    (w) => !excludedWordIds.has(w.id.toLowerCase()) && !excludedWordIds.has(w.word.toLowerCase())
  );

  if (availableCurated.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCurated.length);
    return availableCurated[randomIndex];
  }

  // 2. Try from extended pool (instant local map first to avoid blocking mount on remote API)
  const availableExtended = EXTENDED_WORD_POOL.filter(
    (w) => !excludedWordIds.has(w.toLowerCase())
  );

  if (availableExtended.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableExtended.length);
    const selectedWord = availableExtended[randomIndex];
    const clean = selectedWord.toLowerCase();
    const localMeta = WORD_DEFINITIONS_MAP[clean];
    if (localMeta) {
      return {
        id: clean,
        word: clean,
        ipa: `/${clean}/`,
        pos: localMeta.pos,
        level: 'B2',
        audioUrl: `https://api.dictionaryapi.dev/media/pronunciations/en/${clean}-us.mp3`,
        definitions: [
          {
            definition: localMeta.definition,
            vietnameseMeaning: localMeta.vietnameseMeaning,
            example: `Understanding how to use "${clean}" accurately improves your English fluency.`,
          },
        ],
      };
    }
    const details = await lookupDictionaryWord(selectedWord);
    if (details) return details;
  }

  return null;
}

