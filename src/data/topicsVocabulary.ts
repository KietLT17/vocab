import { WordItem } from '../lib/types';
import {
  buildExtendedWordItem,
  CURATED_VOCABULARY,
  EXTENDED_WORD_POOL,
  shuffleArray,
} from './curatedDictionary';

export interface TopicCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'business',
    name: 'Kinh doanh & Công sở',
    icon: '💼',
    description: 'Từ vựng đàm phán, quản trị, đầu tư và công sở chuyên nghiệp',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'technology',
    name: 'Công nghệ & AI',
    icon: '💻',
    description: 'Xu hướng công nghệ số, phần mềm, trí tuệ nhân tạo và đổi mới',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'academic',
    name: 'Học thuật & IELTS',
    icon: '🎓',
    description: 'Từ vựng band 7.0+, bài luận phân tích, nghiên cứu học thuật',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'daily_life',
    name: 'Giao tiếp & Đời sống',
    icon: '🗣️',
    description: 'Hội thoại thường ngày, diễn đạt tự nhiên như người bản xứ',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'psychology',
    name: 'Tâm lý & Tư duy',
    icon: '🧠',
    description: 'Cảm xúc, tính cách, động lực nội tại và phát triển bản thân',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'environment',
    name: 'Môi trường & Tự nhiên',
    icon: '🌿',
    description: 'Biến đổi khí hậu, năng lượng xanh, sinh thái học',
    color: 'from-green-600 to-emerald-700',
  },
];

export const TOPIC_WORDS: Record<string, WordItem[]> = {
  // 1. KINH DOANH & CÔNG SỞ
  business: [
    {
      id: 'pragmatic',
      word: 'pragmatic',
      ipa: '/præɡˈmæt.ɪk/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/pragmatic-us.mp3',
      definitions: [
        {
          definition: 'Solving problems in a sensible way that suits real conditions rather than theories.',
          vietnameseMeaning: 'Thực tế, thực dụng, trọng tính khả thi',
          example: 'We need to adopt a pragmatic approach to meet our quarterly revenue targets.',
        },
      ],
      collocations: ['pragmatic approach', 'pragmatic solution'],
    },
    {
      id: 'collaborate',
      word: 'collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/collaborate-us.mp3',
      definitions: [
        {
          definition: 'To work together with someone to achieve a common business goal.',
          vietnameseMeaning: 'Hợp tác, cộng tác làm việc',
          example: 'Our marketing team collaborated with designers to launch the brand campaign.',
        },
      ],
      collocations: ['collaborate closely', 'collaborate with clients'],
    },
    {
      id: 'lucrative',
      word: 'lucrative',
      ipa: '/ˈluː.krə.tɪv/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/lucrative-us.mp3',
      definitions: [
        {
          definition: 'Producing a great deal of profit; commercially viable and rewarding.',
          vietnameseMeaning: 'Sinh lợi cao, béo bở, đem lại nhiều tiền',
          example: 'The merger proved to be a highly lucrative opportunity for both companies.',
        },
      ],
      collocations: ['lucrative contract', 'lucrative market'],
    },
    {
      id: 'leverage',
      word: 'leverage',
      ipa: '/ˈlev.ər.ɪdʒ/',
      pos: 'verb',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/leverage-us.mp3',
      definitions: [
        {
          definition: 'To use something that you already have in order to achieve something new or better.',
          vietnameseMeaning: 'Tận dụng, phát huy tối đa đòn bẩy lợi thế',
          example: 'The firm leveraged its international brand reputation to expand into Asia.',
        },
      ],
      collocations: ['leverage resources', 'leverage technology'],
    },
    {
      id: 'consolidate',
      word: 'consolidate',
      ipa: '/kənˈsɒl.ɪ.deɪt/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/consolidate-us.mp3',
      definitions: [
        {
          definition: 'To combine several things, especially businesses, into a single more effective whole.',
          vietnameseMeaning: 'Củng cố, hợp nhất, làm cho vững chắc',
          example: 'The corporation plans to consolidate its regional offices into a central hub.',
        },
      ],
      collocations: ['consolidate market position', 'consolidate debt'],
    },
    {
      id: 'benchmark',
      word: 'benchmark',
      ipa: '/ˈbentʃ.mɑːk/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/benchmark-us.mp3',
      definitions: [
        {
          definition: 'A standard or point of reference against which things may be compared or assessed.',
          vietnameseMeaning: 'Tiêu chuẩn đối sánh, mốc chuẩn mực',
          example: 'Their customer service standards set a benchmark for the entire industry.',
        },
      ],
      collocations: ['industry benchmark', 'set a benchmark'],
    },
    {
      id: 'resilient',
      word: 'resilient',
      ipa: '/rɪˈzɪl.jənt/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/resilient-us.mp3',
      definitions: [
        {
          definition: 'Able to withstand or recover quickly from difficult financial conditions.',
          vietnameseMeaning: 'Kiên cường, mau hồi phục sau biến động',
          example: 'The local economy proved remarkably resilient despite the global crisis.',
        },
      ],
      collocations: ['resilient supply chain', 'resilient organization'],
    },
    {
      id: 'negotiate',
      word: 'negotiate',
      ipa: '/nəˈɡəʊ.ʃi.eɪt/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/negotiate-us.mp3',
      definitions: [
        {
          definition: 'To have formal discussions with someone in order to reach an agreement.',
          vietnameseMeaning: 'Đàm phán, thương lượng hợp đồng',
          example: 'The CEO negotiated a favorable settlement with key commercial partners.',
        },
      ],
      collocations: ['negotiate terms', 'negotiate successfully'],
    },
    {
      id: 'diversify',
      word: 'diversify',
      ipa: '/daɪˈvɜː.sɪ.faɪ/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/diversify-us.mp3',
      definitions: [
        {
          definition: 'To develop a wider range of products, interests, or skills.',
          vietnameseMeaning: 'Đa dạng hóa danh mục đầu tư/sản phẩm',
          example: 'Investors are advised to diversify their portfolio to minimize market risk.',
        },
      ],
      collocations: ['diversify investments', 'diversify products'],
    },
    {
      id: 'meticulous',
      word: 'meticulous',
      ipa: '/məˈtɪk.jə.ləs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/meticulous-us.mp3',
      definitions: [
        {
          definition: 'Showing great attention to detail; very careful and precise.',
          vietnameseMeaning: 'Tỉ mỉ, cẩn thận từng chi tiết trong sổ sách',
          example: 'He maintained meticulous financial records that satisfied all external auditors.',
        },
      ],
      collocations: ['meticulous attention', 'meticulous accounting'],
    },
  ],

  // 2. CÔNG NGHỆ & AI
  technology: [
    {
      id: 'ubiquitous',
      word: 'ubiquitous',
      ipa: '/juːˈbɪk.wɪ.təs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/ubiquitous-us.mp3',
      definitions: [
        {
          definition: 'Present, appearing, or found everywhere; universal.',
          vietnameseMeaning: 'Phổ biến khắp mọi nơi trong kỷ nguyên số',
          example: 'High-speed internet and connected devices have become ubiquitous worldwide.',
        },
      ],
      collocations: ['ubiquitous computing', 'ubiquitous technology'],
    },
    {
      id: 'innovative',
      word: 'innovative',
      ipa: '/ˈɪn.ə.veɪ.tɪv/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/innovative-us.mp3',
      definitions: [
        {
          definition: 'Featuring new methods; advanced and original in technological design.',
          vietnameseMeaning: 'Đổi mới, sáng tạo đột phá',
          example: 'The startup introduced an innovative machine learning architecture.',
        },
      ],
      collocations: ['innovative algorithm', 'innovative software'],
    },
    {
      id: 'algorithm',
      word: 'algorithm',
      ipa: '/ˈæl.ɡə.rɪ.ðəm/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/algorithm-us.mp3',
      definitions: [
        {
          definition: 'A process or set of rules to be followed in calculations or problem-solving operations by a computer.',
          vietnameseMeaning: 'Thuật toán máy tính',
          example: 'Search engines use sophisticated algorithms to index web content dynamically.',
        },
      ],
      collocations: ['genetic algorithm', 'ranking algorithm'],
    },
    {
      id: 'seamless',
      word: 'seamless',
      ipa: '/ˈsiːm.ləs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/seamless-us.mp3',
      definitions: [
        {
          definition: 'Smooth and continuous, with no apparent gaps, errors, or spaces between parts.',
          vietnameseMeaning: 'Liền mạch, mượt mà không có độ trễ',
          example: 'The software update provides a seamless user experience across all devices.',
        },
      ],
      collocations: ['seamless integration', 'seamless experience'],
    },
    {
      id: 'disruptive',
      word: 'disruptive',
      ipa: '/dɪsˈrʌp.tɪv/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/disruptive-us.mp3',
      definitions: [
        {
          definition: 'Innovatively altering an existing industry or market through technological revolution.',
          vietnameseMeaning: 'Có tính đột phá làm thay đổi cả ngành',
          example: 'Artificial intelligence is proving to be a disruptive force in digital banking.',
        },
      ],
      collocations: ['disruptive innovation', 'disruptive technology'],
    },
    {
      id: 'optimize',
      word: 'optimize',
      ipa: '/ˈɒp.tɪ.maɪz/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/optimize-us.mp3',
      definitions: [
        {
          definition: 'To make the best or most effective use of a software or hardware resource.',
          vietnameseMeaning: 'Tối ưu hóa hiệu năng hệ thống',
          example: 'Engineers optimized the database queries to reduce network latency.',
        },
      ],
      collocations: ['optimize performance', 'optimize code'],
    },
    {
      id: 'latency',
      word: 'latency',
      ipa: '/ˈleɪ.tən.si/',
      pos: 'noun',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/latency-us.mp3',
      definitions: [
        {
          definition: 'The delay before a transfer of data begins following an instruction for its transfer.',
          vietnameseMeaning: 'Độ trễ truyền dữ liệu mạng',
          example: '5G networks significantly reduce latency for real-time multiplayer gaming.',
        },
      ],
      collocations: ['low latency', 'network latency'],
    },
    {
      id: 'prototype',
      word: 'prototype',
      ipa: '/ˈprəʊ.tə.taɪp/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/prototype-us.mp3',
      definitions: [
        {
          definition: 'A first, typical or preliminary model of something from which other forms are developed.',
          vietnameseMeaning: 'Bản mẫu đầu tiên, nguyên mẫu thử nghiệm',
          example: 'The team spent three weeks building an interactive prototype for user testing.',
        },
      ],
      collocations: ['working prototype', 'build a prototype'],
    },
    {
      id: 'automation',
      word: 'automation',
      ipa: '/ˌɔː.təˈmeɪ.ʃən/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/automation-us.mp3',
      definitions: [
        {
          definition: 'The use of largely automatic equipment in a system of operation.',
          vietnameseMeaning: 'Sự tự động hóa quy trình',
          example: 'Workflow automation saves hundreds of repetitive manual labor hours every month.',
        },
      ],
      collocations: ['test automation', 'industrial automation'],
    },
    {
      id: 'obsolete',
      word: 'obsolete',
      ipa: '/ˌɒb.səˈliːt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/obsolete-us.mp3',
      definitions: [
        {
          definition: 'No longer produced or used; out of date due to newer technology.',
          vietnameseMeaning: 'Lỗi thời, bị công nghệ mới thay thế',
          example: 'Floppy disks became completely obsolete after the introduction of USB drives.',
        },
      ],
      collocations: ['render obsolete', 'technologically obsolete'],
    },
  ],

  // 3. HỌC THUẬT & IELTS
  academic: [
    {
      id: 'eloquent',
      word: 'eloquent',
      ipa: '/ˈel.ə.kwənt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/eloquent-us.mp3',
      definitions: [
        {
          definition: 'Fluent or persuasive in speaking or writing academically.',
          vietnameseMeaning: 'Hùng biện, lưu loát, giàu sức thuyết phục',
          example: 'She delivered an eloquent defense of human rights in her dissertation.',
        },
      ],
      collocations: ['eloquent speaker', 'eloquent essay'],
    },
    {
      id: 'scrutinize',
      word: 'scrutinize',
      ipa: '/ˈskruː.tɪ.naɪz/',
      pos: 'verb',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/scrutinize-us.mp3',
      definitions: [
        {
          definition: 'To examine or inspect closely and thoroughly in scientific research.',
          vietnameseMeaning: 'Xem xét kỹ lưỡng, khảo sát cẩn trọng',
          example: 'The research methodologies were scrutinized by the peer review committee.',
        },
      ],
      collocations: ['scrutinize evidence', 'scrutinize data'],
    },
    {
      id: 'coherent',
      word: 'coherent',
      ipa: '/kəʊˈhɪə.rənt/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/coherent-us.mp3',
      definitions: [
        {
          definition: 'Logical and consistent; having parts that connect naturally and clearly.',
          vietnameseMeaning: 'Mạch lạc, gắn kết chặt chẽ',
          example: 'The paper presents a coherent argument supported by empirical evidence.',
        },
      ],
      collocations: ['coherent argument', 'coherent structure'],
    },
    {
      id: 'plausible',
      word: 'plausible',
      ipa: '/ˈplɔː.zə.bəl/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/plausible-us.mp3',
      definitions: [
        {
          definition: 'Seeming reasonable, credible, or probable in academic debates.',
          vietnameseMeaning: 'Hợp lý, đáng tin cậy, có cơ sở',
          example: 'The scientists proposed a plausible explanation for the sudden atmospheric shift.',
        },
      ],
      collocations: ['plausible explanation', 'plausible hypothesis'],
    },
    {
      id: 'lucid',
      word: 'lucid',
      ipa: '/ˈluː.sɪd/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/lucid-us.mp3',
      definitions: [
        {
          definition: 'Expressed clearly; easy to understand in scholarly writing.',
          vietnameseMeaning: 'Rõ ràng, minh bạch, dễ hiểu',
          example: 'The professor gave a remarkably lucid lecture on quantum mechanics.',
        },
      ],
      collocations: ['lucid explanation', 'lucid style'],
    },
    {
      id: 'tangible',
      word: 'tangible',
      ipa: '/ˈtæn.dʒə.bəl/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/tangible-us.mp3',
      definitions: [
        {
          definition: 'Perceptible by touch; clear, definite, and real rather than imaginary.',
          vietnameseMeaning: 'Hữu hình, cụ thể, có thể đo lường được',
          example: 'The research produced tangible benefits for local agricultural communities.',
        },
      ],
      collocations: ['tangible results', 'tangible evidence'],
    },
    {
      id: 'paradox',
      word: 'paradox',
      ipa: '/ˈpær.ə.dɒks/',
      pos: 'noun',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/paradox-us.mp3',
      definitions: [
        {
          definition: 'A seemingly absurd or self-contradictory statement that may prove to be well founded or true.',
          vietnameseMeaning: 'Nghịch lý triết học/học thuật',
          example: 'It is a curious paradox that drinking hot tea can actually cool you down in summer.',
        },
      ],
      collocations: ['apparent paradox', 'central paradox'],
    },
    {
      id: 'unprecedented',
      word: 'unprecedented',
      ipa: '/ʌnˈpres.ɪ.den.tɪd/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/unprecedented-us.mp3',
      definitions: [
        {
          definition: 'Never done or known before in recorded history.',
          vietnameseMeaning: 'Chưa từng có tiền lệ trong lịch sử',
          example: 'The global lockdown caused an unprecedented disruption to academic exchange.',
        },
      ],
      collocations: ['unprecedented scale', 'unprecedented event'],
    },
    {
      id: 'comprehend',
      word: 'comprehend',
      ipa: '/ˌkɒm.prɪˈhend/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/comprehend-us.mp3',
      definitions: [
        {
          definition: 'To grasp mentally; understand fully.',
          vietnameseMeaning: 'Lĩnh hội, hiểu thấu đáo một khái niệm',
          example: 'It took several days for scholars to comprehend the full magnitude of the ancient discovery.',
        },
      ],
      collocations: ['fully comprehend', 'comprehend the meaning'],
    },
    {
      id: 'subtle',
      word: 'subtle',
      ipa: '/ˈsʌt.əl/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/subtle-us.mp3',
      definitions: [
        {
          definition: 'So delicate or precise as to be difficult to analyze or describe.',
          vietnameseMeaning: 'Tinh tế, vi tế, khác biệt nhỏ khó nhận thấy',
          example: 'There are subtle differences between the two linguistic theories.',
        },
      ],
      collocations: ['subtle nuance', 'subtle distinction'],
    },
  ],

  // 4. GIAO TIẾP & ĐỜI SỐNG
  daily_life: [
    {
      id: 'empathy',
      word: 'empathy',
      ipa: '/ˈem.pə.θi/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/empathy-us.mp3',
      definitions: [
        {
          definition: 'The ability to understand and share the feelings of another person.',
          vietnameseMeaning: 'Sự thấu cảm, khả năng đồng cảm',
          example: 'Great leaders possess deep empathy for the challenges their teams face.',
        },
      ],
      collocations: ['feel empathy', 'show empathy'],
    },
    {
      id: 'candid',
      word: 'candid',
      ipa: '/ˈkæn.dɪd/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/candid-us.mp3',
      definitions: [
        {
          definition: 'Truthful and straightforward; frank and honest.',
          vietnameseMeaning: 'Thẳng thắn, chân thành, không giấu giếm',
          example: 'We had a candid discussion about the financial challenges ahead.',
        },
      ],
      collocations: ['candid conversation', 'candid feedback'],
    },
    {
      id: 'spontaneous',
      word: 'spontaneous',
      ipa: '/spɒnˈteɪ.ni.əs/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/spontaneous-us.mp3',
      definitions: [
        {
          definition: 'Performed or occurring as a result of a sudden impulse without premeditation.',
          vietnameseMeaning: 'Tự phát, ngẫu hứng, tự nhiên',
          example: 'We made a spontaneous decision to take a weekend road trip to the coast.',
        },
      ],
      collocations: ['spontaneous decision', 'spontaneous reaction'],
    },
    {
      id: 'procrastinate',
      word: 'procrastinate',
      ipa: '/prəˈkræs.tɪ.neɪt/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/procrastinate-us.mp3',
      definitions: [
        {
          definition: 'To delay or postpone action; put off doing something.',
          vietnameseMeaning: 'Trì hoãn, chần chừ việc cần làm',
          example: 'Most students tend to procrastinate until the night before the final exam.',
        },
      ],
      collocations: ['tend to procrastinate', 'stop procrastinating'],
    },
    {
      id: 'benevolent',
      word: 'benevolent',
      ipa: '/bəˈnev.əl.ənt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/benevolent-us.mp3',
      definitions: [
        {
          definition: 'Well meaning and kindly; serving a charitable rather than a profit-making purpose.',
          vietnameseMeaning: 'Nhân từ, tốt bụng, hay giúp đỡ người khác',
          example: 'A benevolent donor provided funds to rebuild the community playground.',
        },
      ],
      collocations: ['benevolent smile', 'benevolent organization'],
    },
    {
      id: 'diligent',
      word: 'diligent',
      ipa: '/ˈdɪl.ɪ.dʒənt/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/diligent-us.mp3',
      definitions: [
        {
          definition: 'Having or showing care and conscientiousness in one\'s work or duties.',
          vietnameseMeaning: 'Chăm chỉ, siêng năng, chu đáo',
          example: 'Through diligent effort and practice, she mastered fluent English in two years.',
        },
      ],
      collocations: ['diligent student', 'diligent work'],
    },
    {
      id: 'authentic',
      word: 'authentic',
      ipa: '/ɔːˈθen.tɪk/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/authentic-us.mp3',
      definitions: [
        {
          definition: 'Of undisputed origin; genuine and true to one\'s own personality.',
          vietnameseMeaning: 'Chân thực, chân thật, nguyên bản',
          example: 'People respect leaders who are authentic and honest about their weaknesses.',
        },
      ],
      collocations: ['authentic self', 'authentic food'],
    },
    {
      id: 'nostalgia',
      word: 'nostalgia',
      ipa: '/nɒsˈtæl.dʒə/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/nostalgia-us.mp3',
      definitions: [
        {
          definition: 'A sentimental longing or wistful affection for the past.',
          vietnameseMeaning: 'Nỗi hoài niệm, nhớ về kỷ niệm xưa',
          example: 'Hearing that old song filled him with warm nostalgia for his college years.',
        },
      ],
      collocations: ['feel nostalgia', 'sense of nostalgia'],
    },
    {
      id: 'discreet',
      word: 'discreet',
      ipa: '/dɪˈskriːt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/discreet-us.mp3',
      definitions: [
        {
          definition: 'Careful and prudent in speech or actions, especially to avoid causing offense or gain privacy.',
          vietnameseMeaning: 'Thận trọng, kín đáo, tế nhị',
          example: 'The assistant was very discreet and never revealed personal matters to reporters.',
        },
      ],
      collocations: ['discreet manner', 'remain discreet'],
    },
    {
      id: 'wary',
      word: 'wary',
      ipa: '/ˈweə.ri/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/wary-us.mp3',
      definitions: [
        {
          definition: 'Feeling or showing caution about possible dangers or problems.',
          vietnameseMeaning: 'Cảnh giác, đề phòng, cẩn trọng',
          example: 'Shoppers should be wary of suspiciously cheap online offers.',
        },
      ],
      collocations: ['wary of strangers', 'remain wary'],
    },
  ],

  // 5. TÂM LÝ & TƯ DUY
  psychology: [
    {
      id: 'perseverance',
      word: 'perseverance',
      ipa: '/ˌpɜː.sɪˈvɪə.rəns/',
      pos: 'noun',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/perseverance-us.mp3',
      definitions: [
        {
          definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
          vietnameseMeaning: 'Sự kiên trì, bền chí, quyết tâm',
          example: 'Through sheer perseverance, the scientist finally discovered the vaccine.',
        },
      ],
      collocations: ['sheer perseverance', 'rewarded for perseverance'],
    },
    {
      id: 'vulnerable',
      word: 'vulnerable',
      ipa: '/ˈvʌl.nər.ə.bəl/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/vulnerable-us.mp3',
      definitions: [
        {
          definition: 'Susceptible to emotional or physical harm, attack, or damage.',
          vietnameseMeaning: 'Dễ bị tổn thương, yếu mềm trước nghịch cảnh',
          example: 'Being honest about your feelings makes you vulnerable, but builds deep trust.',
        },
      ],
      collocations: ['emotionally vulnerable', 'feel vulnerable'],
    },
    {
      id: 'tenacious',
      word: 'tenacious',
      ipa: '/təˈneɪ.ʃəs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/tenacious-us.mp3',
      definitions: [
        {
          definition: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent.',
          vietnameseMeaning: 'Kiên trì, dai dẳng, bám sát mục tiêu',
          example: 'Her tenacious spirit helped her overcome years of chronic illness.',
        },
      ],
      collocations: ['tenacious grip', 'tenacious advocate'],
    },
    {
      id: 'skeptical',
      word: 'skeptical',
      ipa: '/ˈskep.tɪ.kəl/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/skeptical-us.mp3',
      definitions: [
        {
          definition: 'Not easily convinced; having reservations or doubts.',
          vietnameseMeaning: 'Hoài nghi, có tinh thần phản biện',
          example: 'Psychologists remain skeptical about unsubstantiated personality test claims.',
        },
      ],
      collocations: ['deeply skeptical', 'skeptical of claims'],
    },
    {
      id: 'ambiguous',
      word: 'ambiguous',
      ipa: '/æmˈbɪɡ.ju.əs/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/ambiguous-us.mp3',
      definitions: [
        {
          definition: 'Open to more than one interpretation; having a double meaning.',
          vietnameseMeaning: 'Mơ hồ, nước đôi, không dứt khoát',
          example: 'The therapist addressed the ambiguous feelings the patient held toward his parents.',
        },
      ],
      collocations: ['ambiguous relationship', 'morally ambiguous'],
    },
    {
      id: 'zealous',
      word: 'zealous',
      ipa: '/ˈzel.əs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/zealous-us.mp3',
      definitions: [
        {
          definition: 'Having or showing great energy or enthusiasm in pursuit of a cause or objective.',
          vietnameseMeaning: 'Nhiệt huyết, hăng say, sốt sắng',
          example: 'He was a zealous advocate for mental health awareness in universities.',
        },
      ],
      collocations: ['zealous supporter', 'zealous effort'],
    },
    {
      id: 'indifferent',
      word: 'indifferent',
      ipa: '/ɪnˈdɪf.ər.ənt/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/indifferent-us.mp3',
      definitions: [
        {
          definition: 'Having no particular interest or sympathy; unconcerned.',
          vietnameseMeaning: 'Thờ ơ, dửng dưng, vô cảm',
          example: 'It is painful to care deeply about someone who remains totally indifferent.',
        },
      ],
      collocations: ['indifferent attitude', 'remain indifferent'],
    },
    {
      id: 'judicious',
      word: 'judicious',
      ipa: '/dʒuːˈdɪʃ.əs/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/judicious-us.mp3',
      definitions: [
        {
          definition: 'Having, showing, or done with good judgment or sense.',
          vietnameseMeaning: 'Sáng suốt, khôn ngoan, đắn đo kỹ',
          example: 'Emotional balance requires a judicious use of both logic and intuition.',
        },
      ],
      collocations: ['judicious decision', 'judicious balance'],
    },
    {
      id: 'inquisitive',
      word: 'inquisitive',
      ipa: '/ɪnˈkwɪz.ə.tɪv/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/inquisitive-us.mp3',
      definitions: [
        {
          definition: 'Curious or inquiring; eager for knowledge and exploration.',
          vietnameseMeaning: 'Tò mò, ham học hỏi, thích tìm tòi',
          example: 'Children are naturally inquisitive about how the world around them works.',
        },
      ],
      collocations: ['inquisitive mind', 'inquisitive child'],
    },
    {
      id: 'imperative',
      word: 'imperative',
      ipa: '/ɪmˈper.ə.tɪv/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/imperative-us.mp3',
      definitions: [
        {
          definition: 'Of vital importance; crucial.',
          vietnameseMeaning: 'Cấp bách, mang tính mệnh lệnh thiết yếu',
          example: 'It is imperative to maintain self-compassion during times of personal failure.',
        },
      ],
      collocations: ['morally imperative', 'absolutely imperative'],
    },
  ],

  // 6. MÔI TRƯỜNG & TỰ NHIÊN
  environment: [
    {
      id: 'inevitable',
      word: 'inevitable',
      ipa: '/ɪnˈev.ɪ.tə.bəl/',
      pos: 'adjective',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/inevitable-us.mp3',
      definitions: [
        {
          definition: 'Certain to happen; unavoidable.',
          vietnameseMeaning: 'Không thể tránh khỏi, chắc chắn sẽ xảy ra',
          example: 'With climate change accelerating, radical changes in energy policy are inevitable.',
        },
      ],
      collocations: ['inevitable consequence', 'inevitable outcome'],
    },
    {
      id: 'alleviate',
      word: 'alleviate',
      ipa: '/əˈliː.vi.eɪt/',
      pos: 'verb',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/alleviate-us.mp3',
      definitions: [
        {
          definition: 'To make suffering, deficiency, or a problem less severe.',
          vietnameseMeaning: 'Làm dịu bớt, giảm thiểu tác hại ô nhiễm',
          example: 'Planting urban trees helps alleviate severe air pollution in metropolitan areas.',
        },
      ],
      collocations: ['alleviate pollution', 'alleviate symptoms'],
    },
    {
      id: 'deteriorate',
      word: 'deteriorate',
      ipa: '/dɪˈtɪə.ri.ə.reɪt/',
      pos: 'verb',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/deteriorate-us.mp3',
      definitions: [
        {
          definition: 'To become progressively worse in condition.',
          vietnameseMeaning: 'Xuống cấp, suy thoái môi trường',
          example: 'Soil quality continues to deteriorate rapidly due to excessive pesticide use.',
        },
      ],
      collocations: ['conditions deteriorate', 'rapidly deteriorate'],
    },
    {
      id: 'foster',
      word: 'foster',
      ipa: '/ˈfɒs.tər/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/foster-us.mp3',
      definitions: [
        {
          definition: 'To encourage or promote the development of something desirable.',
          vietnameseMeaning: 'Nuôi dưỡng, thúc đẩy nhận thức bảo vệ môi trường',
          example: 'Community gardens foster ecological awareness and reduce carbon footprints.',
        },
      ],
      collocations: ['foster biodiversity', 'foster sustainability'],
    },
    {
      id: 'viable',
      word: 'viable',
      ipa: '/ˈvaɪ.ə.bəl/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/viable-us.mp3',
      definitions: [
        {
          definition: 'Capable of working successfully; feasible; ecologically sustainable.',
          vietnameseMeaning: 'Khả thi, có khả năng tồn tại và phát triển bền vững',
          example: 'Solar and wind energy have now become commercially viable alternatives to coal.',
        },
      ],
      collocations: ['viable alternative', 'economically viable'],
    },
    {
      id: 'exacerbate',
      word: 'exacerbate',
      ipa: '/ɪɡˈzæs.ə.beɪt/',
      pos: 'verb',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/exacerbate-us.mp3',
      definitions: [
        {
          definition: 'To make a problem, bad situation, or negative feeling worse.',
          vietnameseMeaning: 'Làm trầm trọng thêm tình trạng ô nhiễm',
          example: 'Deforestation severely exacerbates the devastating impact of seasonal floods.',
        },
      ],
      collocations: ['exacerbate the crisis', 'exacerbate global warming'],
    },
    {
      id: 'imminent',
      word: 'imminent',
      ipa: '/ˈɪm.ɪ.nənt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/imminent-us.mp3',
      definitions: [
        {
          definition: 'About to happen very soon; impending.',
          vietnameseMeaning: 'Sắp xảy ra, cận kề trước mắt',
          example: 'Scientists warned that coastal flooding is an imminent danger for island nations.',
        },
      ],
      collocations: ['imminent danger', 'imminent threat'],
    },
    {
      id: 'prevalent',
      word: 'prevalent',
      ipa: '/ˈprev.əl.ənt/',
      pos: 'adjective',
      level: 'C1',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/prevalent-us.mp3',
      definitions: [
        {
          definition: 'Widespread in a particular area or at a particular time.',
          vietnameseMeaning: 'Thịnh hành, phổ biến rộng rãi',
          example: 'Plastic pollution is prevalent in marine ecosystems across the globe.',
        },
      ],
      collocations: ['widely prevalent', 'prevalent disease'],
    },
    {
      id: 'dismantle',
      word: 'dismantle',
      ipa: '/dɪsˈmæn.təl/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/dismantle-us.mp3',
      definitions: [
        {
          definition: 'To take a machine or structure to pieces; deconstruct obsolete facilities.',
          vietnameseMeaning: 'Tháo dỡ các nhà máy cũ, giải thể',
          example: 'The government ordered the utility company to safely dismantle the aging coal plant.',
        },
      ],
      collocations: ['dismantle a facility', 'dismantle barriers'],
    },
    {
      id: 'enhance',
      word: 'enhance',
      ipa: '/ɪnˈhɑːns/',
      pos: 'verb',
      level: 'B2',
      audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/enhance-us.mp3',
      definitions: [
        {
          definition: 'Intensify, increase, or further improve the quality, value, or extent of.',
          vietnameseMeaning: 'Tăng cường, nâng cao độ màu mỡ của đất',
          example: 'Crop rotation techniques enhance soil fertility naturally without chemicals.',
        },
      ],
      collocations: ['enhance biodiversity', 'enhance conservation'],
    },
  ],
};

/**
 * Get N random words from a specific topic that are NOT in the active account's excluded set.
 */
export function getRandomTopicWords(
  topicId: string,
  count: number = 5,
  excludedWordIds: Set<string>
): WordItem[] {
  const isAllowed = (w: WordItem, seen: Set<string>) => {
    const clean = w.word.trim().toLowerCase();
    return (
      !excludedWordIds.has(w.id.toLowerCase()) &&
      !excludedWordIds.has(clean) &&
      !seen.has(clean)
    );
  };

  const picked: WordItem[] = [];
  const seen = new Set<string>();

  for (const w of shuffleArray(TOPIC_WORDS[topicId] || [])) {
    if (picked.length >= count) break;
    if (isAllowed(w, seen)) {
      seen.add(w.word.trim().toLowerCase());
      picked.push(w);
    }
  }

  if (picked.length >= count) return picked;

  // Fill any shortfall randomly from other topics + curated + extended words
  const remainingPool: WordItem[] = [
    ...Object.entries(TOPIC_WORDS)
      .filter(([tId]) => tId !== topicId)
      .flatMap(([, words]) => words),
    ...CURATED_VOCABULARY,
    ...EXTENDED_WORD_POOL.map((w) => buildExtendedWordItem(w)),
  ];

  for (const w of shuffleArray(remainingPool)) {
    if (picked.length >= count) break;
    if (isAllowed(w, seen)) {
      seen.add(w.word.trim().toLowerCase());
      picked.push(w);
    }
  }

  return picked;
}

