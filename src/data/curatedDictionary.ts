import { WordItem } from '../lib/types';
import { WORD_DEFINITIONS_MAP } from './wordDefinitionsMap';

/**
 * Curated base vocabulary dataset with verified IPA, Audio, Meaning, and Realistic Context.
 * Used for instant zero-latency random generation and offline readiness.
 */
export const CURATED_VOCABULARY: WordItem[] = [
  {
    id: "resilient",
    word: "resilient",
    ipa: "/rɪˈzɪl.jənt/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/resilient-us.mp3",
    definitions: [
      {
        definition: "Able to recover quickly from difficult conditions, shock, or illness.",
        vietnameseMeaning: "Kiên cường, có khả năng phục hồi nhanh chóng",
        example: "The local economy proved remarkably resilient despite the global crisis.",
        synonyms: ["tough", "durable", "tenacious"]
      }
    ],
    collocations: ["remarkably resilient", "resilient economy", "stay resilient"]
  },
  {
    id: "eloquent",
    word: "eloquent",
    ipa: "/ˈel.ə.kwənt/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/eloquent-us.mp3",
    definitions: [
      {
        definition: "Giving a clear, strong message, or expressing thoughts and feelings persuasively in speech or writing.",
        vietnameseMeaning: "Hùng biện, lưu loát, truyền cảm",
        example: "She made an eloquent speech in defense of human rights and dignity.",
        synonyms: ["fluent", "persuasive", "articulate"]
      }
    ],
    collocations: ["eloquent speech", "eloquent speaker", "eloquent testimony"]
  },
  {
    id: "pragmatic",
    word: "pragmatic",
    ipa: "/præɡˈmæt.ɪk/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/pragmatic-us.mp3",
    definitions: [
      {
        definition: "Solving problems in a sensible way that suits the conditions that really exist, rather than following theories.",
        vietnameseMeaning: "Thực tế, thực dụng, trọng tính khả thi",
        example: "We need to adopt a pragmatic approach to solve this technical bottleneck.",
        synonyms: ["practical", "realistic", "down-to-earth"]
      }
    ],
    collocations: ["pragmatic approach", "pragmatic solution", "remain pragmatic"]
  },
  {
    id: "meticulous",
    word: "meticulous",
    ipa: "/məˈtɪk.jə.ləs/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/meticulous-us.mp3",
    definitions: [
      {
        definition: "Very careful and with great attention to every detail.",
        vietnameseMeaning: "Tỉ mỉ, cẩn thận từng chi tiết nhỏ",
        example: "He maintained meticulous records of all financial transactions.",
        synonyms: ["diligent", "painstaking", "thorough"]
      }
    ],
    collocations: ["meticulous attention", "meticulous planning", "meticulous research"]
  },
  {
    id: "ubiquitous",
    word: "ubiquitous",
    ipa: "/juːˈbɪk.wɪ.təs/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/ubiquitous-us.mp3",
    definitions: [
      {
        definition: "Seeming to be everywhere at the same time; extremely common.",
        vietnameseMeaning: "Phổ biến ở khắp mọi nơi",
        example: "Smartphones have become ubiquitous in modern urban life.",
        synonyms: ["omnipresent", "pervasive", "widespread"]
      }
    ],
    collocations: ["ubiquitous presence", "become ubiquitous", "ubiquitous technology"]
  },
  {
    id: "ambiguous",
    word: "ambiguous",
    ipa: "/æmˈbɪɡ.ju.əs/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/ambiguous-us.mp3",
    definitions: [
      {
        definition: "Having or expressing more than one possible meaning, sometimes intentionally.",
        vietnameseMeaning: "Mơ hồ, nước đôi, khó hiểu rõ",
        example: "The government gave an ambiguous statement regarding the new tax policy.",
        synonyms: ["unclear", "equivocal", "vague"]
      }
    ],
    collocations: ["ambiguous statement", "remain ambiguous", "morally ambiguous"]
  },
  {
    id: "collaborate",
    word: "collaborate",
    ipa: "/kəˈlæb.ə.reɪt/",
    pos: "verb",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/collaborate-us.mp3",
    definitions: [
      {
        definition: "To work together with somebody or other people to achieve a single purpose.",
        vietnameseMeaning: "Hợp tác, cộng tác cùng làm việc",
        example: "Engineers and designers collaborated closely to build the new mobile interface.",
        synonyms: ["cooperate", "partner", "team up"]
      }
    ],
    collocations: ["collaborate closely", "collaborate with", "collaborate on a project"]
  },
  {
    id: "scrutinize",
    word: "scrutinize",
    ipa: "/ˈskruː.tɪ.naɪz/",
    pos: "verb",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/scrutinize-us.mp3",
    definitions: [
      {
        definition: "To examine something or someone very carefully and thoroughly.",
        vietnameseMeaning: "Xem xét kỹ lưỡng, soi xét cẩn trọng",
        example: "Her performance was scrutinized under the sharp eyes of the committee.",
        synonyms: ["inspect", "examine", "audit"]
      }
    ],
    collocations: ["scrutinize closely", "scrutinize the data", "subject to scrutiny"]
  },
  {
    id: "lucid",
    word: "lucid",
    ipa: "/ˈluː.sɪd/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/lucid-us.mp3",
    definitions: [
      {
        definition: "Clearly expressed and easy to understand, or thinking clearly.",
        vietnameseMeaning: "Rõ ràng, mạch lạc, sáng sủa",
        example: "The professor provided a remarkably lucid explanation of quantum physics.",
        synonyms: ["clear", "coherent", "transparent"]
      }
    ],
    collocations: ["lucid explanation", "lucid thinking", "remain lucid"]
  },
  {
    id: "empathy",
    word: "empathy",
    ipa: "/ˈem.pə.θi/",
    pos: "noun",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/empathy-us.mp3",
    definitions: [
      {
        definition: "The ability to share someone else's feelings or experiences by imagining what being in that person's situation is like.",
        vietnameseMeaning: "Sự thấu cảm, khả năng đồng cảm",
        example: "Great leaders possess deep empathy for the challenges their teams face.",
        synonyms: ["compassion", "understanding", "sensitivity"]
      }
    ],
    collocations: ["feel empathy", "deep empathy", "show empathy towards"]
  },
  {
    id: "diligent",
    word: "diligent",
    ipa: "/ˈdɪl.ɪ.dʒənt/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/diligent-us.mp3",
    definitions: [
      {
        definition: "Done in a careful and detailed way; working hard and carefully.",
        vietnameseMeaning: "Chăm chỉ, siêng năng, cần cù",
        example: "Through diligent effort and practice, she mastered fluent English in two years.",
        synonyms: ["hardworking", "assiduous", "industrious"]
      }
    ],
    collocations: ["diligent worker", "diligent effort", "diligent research"]
  },
  {
    id: "inevitable",
    word: "inevitable",
    ipa: "/ɪnˈev.ɪ.tə.bəl/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/inevitable-us.mp3",
    definitions: [
      {
        definition: "Certain to happen and unable to be avoided or prevented.",
        vietnameseMeaning: "Không thể tránh khỏi, chắc chắn sẽ xảy ra",
        example: "With climate change accelerating, radical changes in energy policy are inevitable.",
        synonyms: ["unavoidable", "inescapable", "certain"]
      }
    ],
    collocations: ["inevitable outcome", "inevitable consequence", "accept the inevitable"]
  },
  {
    id: "procrastinate",
    word: "procrastinate",
    ipa: "/prəˈkræs.tɪ.neɪt/",
    pos: "verb",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/procrastinate-us.mp3",
    definitions: [
      {
        definition: "To keep delaying something that must be done, often because it is unpleasant or boring.",
        vietnameseMeaning: "Trì hoãn, chần chừ việc cần làm",
        example: "Most students tend to procrastinate until the night before the final exam.",
        synonyms: ["delay", "postpone", "put off"]
      }
    ],
    collocations: ["tend to procrastinate", "stop procrastinating", "procrastinate on homework"]
  },
  {
    id: "candid",
    word: "candid",
    ipa: "/ˈkæn.dɪd/",
    pos: "adjective",
    level: "C1",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/candid-us.mp3",
    definitions: [
      {
        definition: "Honest and telling the truth, especially about something difficult or painful.",
        vietnameseMeaning: "Thẳng thắn, bộc trực, không giấu giếm",
        example: "We had a candid discussion about the financial challenges ahead.",
        synonyms: ["frank", "straightforward", "blunt"]
      }
    ],
    collocations: ["candid discussion", "candid interview", "be candid with someone"]
  },
  {
    id: "innovative",
    word: "innovative",
    ipa: "/ˈɪn.ə.veɪ.tɪv/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/innovative-us.mp3",
    definitions: [
      {
        definition: "Using new methods or ideas; advanced and original.",
        vietnameseMeaning: "Đổi mới, sáng tạo, tiên phong",
        example: "The startup introduced an innovative solution for renewable energy storage.",
        synonyms: ["creative", "inventive", "pioneering"]
      }
    ],
    collocations: ["innovative approach", "innovative product", "highly innovative"]
  },
  {
    id: "coherent",
    word: "coherent",
    ipa: "/kəʊˈhɪə.rənt/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/coherent-us.mp3",
    definitions: [
      {
        definition: "Clear and carefully considered, with each part connecting logically with the rest.",
        vietnameseMeaning: "Mạch lạc, gắn kết chặt chẽ",
        example: "The essay presented a coherent argument supported by statistical evidence.",
        synonyms: ["logical", "consistent", "organized"]
      }
    ],
    collocations: ["coherent argument", "coherent strategy", "make coherent sense"]
  },
  {
    id: "spontaneous",
    word: "spontaneous",
    ipa: "/spɒnˈteɪ.ni.əs/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/spontaneous-us.mp3",
    definitions: [
      {
        definition: "Happening naturally, without being planned or forced.",
        vietnameseMeaning: "Tự phát, ngẫu hứng, tự nhiên",
        example: "The audience burst into spontaneous applause at the end of the concert.",
        synonyms: ["unplanned", "impromptu", "instinctive"]
      }
    ],
    collocations: ["spontaneous reaction", "spontaneous applause", "spontaneous decision"]
  },
  {
    id: "vulnerable",
    word: "vulnerable",
    ipa: "/ˈvʌl.nər.ə.bəl/",
    pos: "adjective",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/vulnerable-us.mp3",
    definitions: [
      {
        definition: "Able to be easily physically or emotionally hurt, influenced, or attacked.",
        vietnameseMeaning: "Dễ bị tổn thương, dễ gặp nguy hiểm",
        example: "Old people are particularly vulnerable to cold weather and respiratory infections.",
        synonyms: ["susceptible", "fragile", "defenseless"]
      }
    ],
    collocations: ["vulnerable position", "highly vulnerable", "vulnerable to attacks"]
  },
  {
    id: "perseverance",
    word: "perseverance",
    ipa: "/ˌpɜː.sɪˈvɪə.rəns/",
    pos: "noun",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/perseverance-us.mp3",
    definitions: [
      {
        definition: "Continued effort and determination to do something despite difficulties or failure.",
        vietnameseMeaning: "Sự kiên trì, bền chí vượt khó",
        example: "Through sheer perseverance, the scientist finally discovered the vaccine.",
        synonyms: ["persistence", "determination", "grit"]
      }
    ],
    collocations: ["sheer perseverance", "rewarded for perseverance", "demonstrate perseverance"]
  },
  {
    id: "comprehend",
    word: "comprehend",
    ipa: "/ˌkɒm.prɪˈhend/",
    pos: "verb",
    level: "B2",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/comprehend-us.mp3",
    definitions: [
      {
        definition: "To understand something fully, especially something complex.",
        vietnameseMeaning: "Lĩnh hội, hiểu thấu đáo",
        example: "It took him several days to fully comprehend the magnitude of the discovery.",
        synonyms: ["grasp", "fathom", "understand"]
      }
    ],
    collocations: ["fully comprehend", "fail to comprehend", "comprehend the meaning"]
  }
];

// Additional Oxford pool words for expanding random selection
export const EXTENDED_WORD_POOL = [
  "advocate", "alleviate", "authentic", "benevolent", "coincide", "concur",
  "conspicuous", "deteriorate", "discreet", "dismantle", "eccentric", "enhance",
  "equivocal", "exacerbate", "exemplary", "feasible", "fluctuate", "foster",
  "impartial", "imminent", "imperative", "indifferent", "ingenious", "inherent",
  "inquisitive", "intricate", "judicious", "lucrative", "monotonous", "negligible",
  "nostalgia", "nuance", "obsolete", "opaque", "paradox", "plausible", "prevalent",
  "prolific", "redundant", "reminiscent", "resilient", "skeptical", "subtle",
  "tangible", "tenacious", "unprecedented", "viable", "vindicate", "wary", "zealous"
];

/**
 * Unbiased Fisher-Yates shuffle returning a new array.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Convert a word string from EXTENDED_WORD_POOL into a full WordItem using WORD_DEFINITIONS_MAP.
 */
export function buildExtendedWordItem(
  rawWord: string,
  topicLabel: string = 'Oxford Extended'
): WordItem {
  const clean = rawWord.trim().toLowerCase();
  const meta = WORD_DEFINITIONS_MAP[clean];
  return {
    id: clean,
    word: clean,
    ipa: `/${clean}/`,
    pos: meta?.pos || 'adjective',
    level: 'B2',
    audioUrl: `https://api.dictionaryapi.dev/media/pronunciations/en/${clean}-us.mp3`,
    topic: topicLabel,
    definitions: [
      {
        definition: meta?.definition || `An essential academic word: ${clean}.`,
        vietnameseMeaning: meta?.vietnameseMeaning || clean,
        example: `Understanding how to use "${clean}" accurately improves your English fluency.`,
      },
    ],
  };
}

