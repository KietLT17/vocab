import { TestQuestion, TestQuestionCategory, UserVocabItem } from '../lib/types';
import { WORD_DEFINITIONS_MAP } from './wordDefinitionsMap';
import { CURATED_SENTENCE_TRANSLATIONS } from './sentenceTranslations';

export const CATEGORY_LABELS: Record<TestQuestionCategory, { name: string; color: string; short: string }> = {
  MEANING: { name: 'Ngữ nghĩa & Ngữ cảnh', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', short: 'Ngữ nghĩa' },
  WORD_FORM: { name: 'Từ loại (Word Form)', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', short: 'Từ loại' },
  GRAMMAR_TENSE: { name: 'Ngữ pháp & Các thì', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300', short: 'Ngữ pháp & Thì' },
  COLLOCATION: { name: 'Cụm từ đi kèm (Collocation)', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', short: 'Collocation' },
  PREPOSITION_PHRASAL: { name: 'Giới từ & Phrasal Verb', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', short: 'Giới từ / Cụm ĐT' },
  IDIOM: { name: 'Thành ngữ (Idiom)', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300', short: 'Idiom' },
};

interface QuestionTemplate {
  word: string;
  category: TestQuestionCategory;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sentenceTranslation: string;
}

/**
 * Rich, grammatically verified question bank covering Word Form, Tenses, Grammar,
 * Collocations, Prepositions / Phrasal Verbs, and Idioms mapped to core vocabulary.
 */
export const CURATED_QUESTION_BANK: QuestionTemplate[] = [
  // --- RESILIENT ---
  {
    word: 'resilient',
    category: 'WORD_FORM',
    question: 'Her remarkable _______ helped the team survive the economic downturn.',
    options: ['resilient', 'resilience', 'resiliently', 'resile'],
    correctAnswer: 'resilience',
    explanation: 'Sau tính từ "remarkable" cần một danh từ (Noun). "Resilience" là danh từ mang nghĩa "sự kiên cường, khả năng phục hồi".',
    sentenceTranslation: 'Sự kiên cường đáng kinh ngạc của cô ấy đã giúp cả đội vượt qua giai đoạn suy thoái kinh tế.'
  },
  {
    word: 'resilient',
    category: 'PREPOSITION_PHRASAL',
    question: 'Coastal infrastructure must be resilient _______ severe tropical storms.',
    options: ['to', 'with', 'about', 'for'],
    correctAnswer: 'to',
    explanation: 'Tính từ "resilient" đi với giới từ "to" (resilient to something: kiên cường/chống chọi tốt trước cái gì).',
    sentenceTranslation: 'Cơ sở hạ tầng ven biển phải đủ kiên cố để chống chọi với các cơn bão nhiệt đới dữ dội.'
  },
  {
    word: 'resilient',
    category: 'IDIOM',
    question: 'Despite losing their first contract, the founders remained resilient and managed to _______.',
    options: ['weather the storm', 'spill the beans', 'bite off more than they can chew', 'miss the boat'],
    correctAnswer: 'weather the storm',
    explanation: 'Idiom "weather the storm" có nghĩa là vượt qua giai đoạn khó khăn, sóng gió (đồng nghĩa với trạng thái resilient).',
    sentenceTranslation: 'Dù mất hợp đồng đầu tiên, các nhà sáng lập vẫn kiên cường và xoay sở vượt qua cơn sóng gió.'
  },

  // --- ELOQUENT ---
  {
    word: 'eloquent',
    category: 'WORD_FORM',
    question: 'The ambassador spoke _______ about international cooperation and peace.',
    options: ['eloquent', 'eloquence', 'eloquently', 'eloquences'],
    correctAnswer: 'eloquently',
    explanation: 'Bổ nghĩa cho động từ "spoke" cần một trạng từ (Adverb) -> "eloquently" (một cách hùng hồn, lưu loát).',
    sentenceTranslation: 'Đại sứ đã phát biểu một cách đầy hùng hồn về sự hợp tác quốc tế và hòa bình.'
  },
  {
    word: 'eloquent',
    category: 'GRAMMAR_TENSE',
    question: 'By the time the conference ended, she _______ the most eloquent speech of the event.',
    options: ['delivers', 'had delivered', 'has delivered', 'was delivering'],
    correctAnswer: 'had delivered',
    explanation: 'Cấu trúc "By the time + S + V2/ed (quá khứ đơn), S + had + V3/ed (quá khứ hoàn thành)" diễn tả hành động xảy ra trước một mốc trong quá khứ.',
    sentenceTranslation: 'Vào lúc hội nghị kết thúc, cô ấy đã có bài phát biểu hùng hồn nhất của sự kiện.'
  },

  // --- PRAGMATIC ---
  {
    word: 'pragmatic',
    category: 'COLLOCATION',
    question: 'Instead of debating abstract theories, let us _______ a pragmatic approach to fix the bug.',
    options: ['adopt', 'make', 'do', 'create'],
    correctAnswer: 'adopt',
    explanation: 'Collocation chuẩn: "adopt a pragmatic approach" (áp dụng một cách tiếp cận thực tế).',
    sentenceTranslation: 'Thay vì tranh luận lý thuyết suông, hãy áp dụng một cách tiếp cận thực tế để sửa lỗi này.'
  },
  {
    word: 'pragmatic',
    category: 'WORD_FORM',
    question: 'Business leaders often balance idealism with cold _______.',
    options: ['pragmatic', 'pragmatism', 'pragmatically', 'pragmatist'],
    correctAnswer: 'pragmatism',
    explanation: 'Sau tính từ "cold" và cấu trúc song song với danh từ "idealism" cần danh từ chỉ chủ nghĩa/tính chất -> "pragmatism" (chủ nghĩa thực dụng).',
    sentenceTranslation: 'Các nhà lãnh đạo doanh nghiệp thường cân bằng giữa chủ nghĩa lý tưởng và tính thực tế lạnh lùng.'
  },

  // --- METICULOUS ---
  {
    word: 'meticulous',
    category: 'COLLOCATION',
    question: 'Surgery requires _______ attention to detail so that no mistake is made.',
    options: ['meticulous', 'heavy', 'tall', 'loud'],
    correctAnswer: 'meticulous',
    explanation: 'Collocation chuẩn: "meticulous attention to detail" (sự chú ý tỉ mỉ đến từng chi tiết nhỏ).',
    sentenceTranslation: 'Phẫu thuật đòi hỏi sự chú ý tỉ mỉ đến từng chi tiết để không xảy ra bất kỳ sai sót nào.'
  },
  {
    word: 'meticulous',
    category: 'IDIOM',
    question: 'Unlike sloppy builders who _______, a meticulous craftsman checks every single joint.',
    options: ['cut corners', 'hit the sack', 'break a leg', 'call it a day'],
    correctAnswer: 'cut corners',
    explanation: 'Idiom "cut corners" nghĩa là làm ẩu, làm tắt để tiết kiệm thời gian/chi phí (trái nghĩa với meticulous).',
    sentenceTranslation: 'Không giống những người thợ cẩu thả hay làm ẩu bớt xén công đoạn, một người thợ tỉ mỉ kiểm tra từng mối nối một.'
  },

  // --- UBIQUITOUS ---
  {
    word: 'ubiquitous',
    category: 'GRAMMAR_TENSE',
    question: 'Over the past decade, contactless payments _______ ubiquitous in major cities.',
    options: ['became', 'have become', 'had become', 'are becoming'],
    correctAnswer: 'have become',
    explanation: 'Dấu hiệu "Over the past decade" (trong suốt thập kỷ qua, kéo dài từ quá khứ đến hiện tại) dùng thì Hiện tại hoàn thành (Present Perfect).',
    sentenceTranslation: 'Trong suốt thập kỷ qua, thanh toán không chạm đã trở nên phổ biến khắp mọi nơi tại các thành phố lớn.'
  },
  {
    word: 'ubiquitous',
    category: 'PREPOSITION_PHRASAL',
    question: 'Mobile apps have _______ so quickly that traditional paper tickets are disappearing.',
    options: ['caught on', 'given up', 'turned down', 'broken off'],
    correctAnswer: 'caught on',
    explanation: 'Phrasal verb "catch on" nghĩa là trở nên phổ biến, thịnh hành (gần nghĩa với become ubiquitous).',
    sentenceTranslation: 'Các ứng dụng di động đã trở nên phổ biến nhanh đến mức vé giấy truyền thống đang biến mất.'
  },

  // --- AMBIGUOUS ---
  {
    word: 'ambiguous',
    category: 'WORD_FORM',
    question: 'Legal contracts must be written clearly without any _______ that could cause disputes.',
    options: ['ambiguous', 'ambiguity', 'ambiguously', 'unambiguous'],
    correctAnswer: 'ambiguity',
    explanation: 'Sau lượng từ "any" cần một danh từ -> "ambiguity" (sự mơ hồ, sự mập mờ đa nghĩa).',
    sentenceTranslation: 'Hợp đồng pháp lý phải được viết rõ ràng không có bất kỳ sự mơ hồ nào có thể gây tranh chấp.'
  },
  {
    word: 'ambiguous',
    category: 'IDIOM',
    question: 'His answer was completely ambiguous; I wish he would stop _______ and tell the truth.',
    options: ['beating around the bush', 'pulling my leg', 'costing an arm and a leg', 'under the weather'],
    correctAnswer: 'beating around the bush',
    explanation: 'Idiom "beat around the bush" nghĩa là nói vòng vo tam quốc, không đi thẳng vào vấn đề (tạo sự ambiguous).',
    sentenceTranslation: 'Câu trả lời của anh ta hoàn toàn mơ hồ; ước gì anh ta ngừng nói vòng vo và nói ra sự thật.'
  },

  // --- COLLABORATE ---
  {
    word: 'collaborate',
    category: 'PREPOSITION_PHRASAL',
    question: 'Our research lab will collaborate _______ European universities _______ a green energy project.',
    options: ['with / on', 'to / for', 'at / with', 'by / in'],
    correctAnswer: 'with / on',
    explanation: 'Cấu trúc cố định: "collaborate WITH someone ON something" (hợp tác với ai về dự án/vấn đề gì).',
    sentenceTranslation: 'Phòng nghiên cứu của chúng tôi sẽ hợp tác với các trường đại học châu Âu trong một dự án năng lượng xanh.'
  },
  {
    word: 'collaborate',
    category: 'WORD_FORM',
    question: 'Cross-border _______ between scientists accelerated vaccine development.',
    options: ['collaborate', 'collaboration', 'collaborative', 'collaborator'],
    correctAnswer: 'collaboration',
    explanation: 'Sau tính từ ghép "Cross-border" làm chủ ngữ cần danh từ chỉ hoạt động -> "collaboration" (sự hợp tác).',
    sentenceTranslation: 'Sự hợp tác xuyên biên giới giữa các nhà khoa học đã đẩy nhanh quá trình phát triển vắc-xin.'
  },

  // --- SCRUTINIZE ---
  {
    word: 'scrutinize',
    category: 'PREPOSITION_PHRASAL',
    question: 'Auditors were hired to _______ the financial anomalies in the annual report.',
    options: ['look into', 'look after', 'look down on', 'look forward to'],
    correctAnswer: 'look into',
    explanation: 'Phrasal verb "look into" nghĩa là điều tra, xem xét kỹ lưỡng (đồng nghĩa với "scrutinize").',
    sentenceTranslation: 'Các kiểm toán viên đã được thuê để điều tra xem xét kỹ những bất thường tài chính trong báo cáo thường niên.'
  },
  {
    word: 'scrutinize',
    category: 'GRAMMAR_TENSE',
    question: 'Every transaction _______ carefully by compliance officers before approval is granted.',
    options: ['scrutinizes', 'is scrutinized', 'scrutinized', 'was scrutinizing'],
    correctAnswer: 'is scrutinized',
    explanation: 'Chủ ngữ "Every transaction" là vật bị tác động ("by compliance officers") và diễn tả quy trình hiện tại -> dùng Bị động Hiện tại đơn ("is scrutinized").',
    sentenceTranslation: 'Mọi giao dịch đều được kiểm tra kỹ lưỡng bởi nhân viên tuân thủ trước khi được phê duyệt.'
  },

  // --- EMPATHY ---
  {
    word: 'empathy',
    category: 'PREPOSITION_PHRASAL',
    question: 'Good counselors show genuine empathy _______ people struggling with grief.',
    options: ['for', 'at', 'from', 'against'],
    correctAnswer: 'for',
    explanation: 'Danh từ "empathy" đi với giới từ "for" hoặc "toward(s)" (empathy for somebody: sự thấu cảm dành cho ai).',
    sentenceTranslation: 'Những chuyên gia tư vấn giỏi thể hiện sự thấu cảm chân thành đối với những người đang vật lộn với nỗi đau mất mát.'
  },
  {
    word: 'empathy',
    category: 'IDIOM',
    question: 'To cultivate true empathy, try to _______ before judging their decisions.',
    options: ['put yourself in their shoes', 'throw in the towel', 'burn the midnight oil', 'let the cat out of the bag'],
    correctAnswer: 'put yourself in their shoes',
    explanation: 'Idiom "put yourself in someone\'s shoes" nghĩa là đặt mình vào vị trí, hoàn cảnh của người khác để thấu hiểu.',
    sentenceTranslation: 'Để nuôi dưỡng sự thấu cảm thực sự, hãy thử đặt mình vào hoàn cảnh của họ trước khi phán xét quyết định của họ.'
  },

  // --- DILIGENT ---
  {
    word: 'diligent',
    category: 'WORD_FORM',
    question: 'She worked _______ for six months to prepare for the medical board exam.',
    options: ['diligent', 'diligence', 'diligently', 'diligents'],
    correctAnswer: 'diligently',
    explanation: 'Sau nội động từ "worked" cần một trạng từ chỉ cách thức -> "diligently" (một cách chăm chỉ, cần cù).',
    sentenceTranslation: 'Cô ấy đã làm việc chăm chỉ suốt sáu tháng để chuẩn bị cho kỳ thi hội đồng y khoa.'
  },
  {
    word: 'diligent',
    category: 'IDIOM',
    question: 'A diligent engineer is always willing to _______ to ensure the product launches on time.',
    options: ['go the extra mile', 'sit on the fence', 'jump the gun', 'take it with a grain of salt'],
    correctAnswer: 'go the extra mile',
    explanation: 'Idiom "go the extra mile" nghĩa là nỗ lực hơn mức bình thường, làm việc tận tâm vượt mong đợi.',
    sentenceTranslation: 'Một kỹ sư tận tụy luôn sẵn sàng nỗ lực vượt bậc để đảm bảo sản phẩm ra mắt đúng hạn.'
  },

  // --- INEVITABLE ---
  {
    word: 'inevitable',
    category: 'GRAMMAR_TENSE',
    question: 'Had they invested in clean energy earlier, the energy shortage _______ inevitable.',
    options: ['would not have been', 'will not be', 'was not', 'had not been'],
    correctAnswer: 'would not have been',
    explanation: 'Đây là Câu điều kiện loại 3 đảo ngữ ("Had + S + V3/ed..."), mệnh đề chính dùng "would (not) have + V3/ed" diễn tả giả thiết trái với quá khứ.',
    sentenceTranslation: 'Nếu họ đầu tư vào năng lượng sạch sớm hơn, tình trạng thiếu hụt năng lượng đã không trở thành điều tất yếu.'
  },
  {
    word: 'inevitable',
    category: 'COLLOCATION',
    question: 'Higher living costs are an _______ consequence of prolonged inflation.',
    options: ['inevitable', 'accidental', 'fragile', 'optional'],
    correctAnswer: 'inevitable',
    explanation: 'Collocation chuẩn: "inevitable consequence" (hệ quả tất yếu không thể tránh khỏi).',
    sentenceTranslation: 'Chi phí sinh hoạt tăng cao là một hệ quả tất yếu của tình trạng lạm phát kéo dài.'
  },

  // --- PROCRASTINATE ---
  {
    word: 'procrastinate',
    category: 'PREPOSITION_PHRASAL',
    question: 'Stop _______ submitting your tax forms; the deadline is tomorrow!',
    options: ['putting off', 'putting on', 'putting up with', 'putting out'],
    correctAnswer: 'putting off',
    explanation: 'Phrasal verb "put off + V-ing" nghĩa là trì hoãn việc gì (đồng nghĩa với "procrastinate"). Lưu ý: put on (mặc), put up with (chịu đựng), put out (dập tắt).',
    sentenceTranslation: 'Hãy ngừng trì hoãn việc nộp tờ khai thuế; hạn chót là ngày mai rồi!'
  },
  {
    word: 'procrastinate',
    category: 'GRAMMAR_TENSE',
    question: 'If he _______ so much last week, he would not be panicking right now.',
    options: ['did not procrastinate', 'had not procrastinated', 'has not procrastinated', 'would not procrastinate'],
    correctAnswer: 'had not procrastinated',
    explanation: 'Câu điều kiện hỗn hợp (Mixed Conditional): Điều kiện trái với quá khứ ("last week" -> had not V3/ed) dẫn đến kết quả ở hiện tại ("right now" -> would not be V-ing).',
    sentenceTranslation: 'Nếu tuần trước anh ta không trì hoãn quá nhiều như vậy, thì ngay bây giờ anh ta đã không hoảng loạn.'
  },

  // --- CANDID ---
  {
    word: 'candid',
    category: 'PREPOSITION_PHRASAL',
    question: 'Thank you for being so candid _______ me about the project risks.',
    options: ['with', 'to', 'on', 'over'],
    correctAnswer: 'with',
    explanation: 'Cấu trúc: "be candid WITH someone about something" (thẳng thắn với ai về việc gì).',
    sentenceTranslation: 'Cảm ơn bạn đã rất thẳng thắn với tôi về những rủi ro của dự án.'
  },

  // --- INNOVATIVE ---
  {
    word: 'innovative',
    category: 'IDIOM',
    question: 'To build truly innovative products, designers must _______ rather than copying competitors.',
    options: ['think outside the box', 'get cold feet', 'face the music', 'add fuel to the fire'],
    correctAnswer: 'think outside the box',
    explanation: 'Idiom "think outside the box" nghĩa là suy nghĩ sáng tạo, đột phá khỏi lối mòn.',
    sentenceTranslation: 'Để tạo ra các sản phẩm thực sự đổi mới, các nhà thiết kế phải tư duy đột phá thay vì sao chép đối thủ.'
  },
  {
    word: 'innovative',
    category: 'WORD_FORM',
    question: 'Technological _______ drives long-term economic growth.',
    options: ['innovate', 'innovative', 'innovation', 'innovator'],
    correctAnswer: 'innovation',
    explanation: 'Sau tính từ "Technological" cần danh từ không đếm được/trừu tượng làm chủ ngữ -> "innovation" (sự đổi mới).',
    sentenceTranslation: 'Sự đổi mới công nghệ thúc đẩy tăng trưởng kinh tế dài hạn.'
  },

  // --- COHERENT ---
  {
    word: 'coherent',
    category: 'WORD_FORM',
    question: 'Without clear topic sentences, an academic essay lacks _______.',
    options: ['coherent', 'coherence', 'coherently', 'incoherent'],
    correctAnswer: 'coherence',
    explanation: 'Sau ngoại động từ "lacks" (thiếu cái gì) cần một danh từ -> "coherence" (tính mạch lạc, sự liên kết).',
    sentenceTranslation: 'Nếu không có câu chủ đề rõ ràng, một bài luận học thuật sẽ thiếu tính mạch lạc.'
  },

  // --- VULNERABLE ---
  {
    word: 'vulnerable',
    category: 'PREPOSITION_PHRASAL',
    question: 'Outdated servers are highly vulnerable _______ cyberattacks and data breaches.',
    options: ['to', 'for', 'with', 'from'],
    correctAnswer: 'to',
    explanation: 'Tính từ "vulnerable" luôn đi với giới từ "to" (vulnerable to something: dễ bị tổn thương/tấn công bởi cái gì).',
    sentenceTranslation: 'Các máy chủ lỗi thời rất dễ bị tổn thương trước các cuộc tấn công mạng và rò rỉ dữ liệu.'
  },

  // --- PERSEVERANCE ---
  {
    word: 'perseverance',
    category: 'COLLOCATION',
    question: 'It was only through _______ perseverance that the blind climber reached the summit.',
    options: ['sheer', 'loud', 'expensive', 'fragile'],
    correctAnswer: 'sheer',
    explanation: 'Collocation chuẩn: "through sheer perseverance" (nhờ sự kiên trì thuần túy/phi thường).',
    sentenceTranslation: 'Chỉ nhờ sự kiên trì phi thường, nhà leo núi khiếm thị mới chạm tới được đỉnh núi.'
  },
  {
    word: 'perseverance',
    category: 'IDIOM',
    question: 'Learning a foreign language requires perseverance; you cannot expect to master it overnight because _______.',
    options: ['Rome was not built in a day', 'the ball is in your court', 'actions speak louder than words', 'every cloud has a silver lining'],
    correctAnswer: 'Rome was not built in a day',
    explanation: 'Idiom/Thành ngữ "Rome wasn\'t built in a day" (Thành Rome không được xây trong một ngày) nhấn mạnh cần kiên trì tích lũy lâu dài.',
    sentenceTranslation: 'Học ngoại ngữ đòi hỏi sự kiên trì; bạn không thể mong thành thạo chỉ sau một đêm vì việc lớn cần thời gian.'
  },

  // --- ALLEVIATE ---
  {
    word: 'alleviate',
    category: 'COLLOCATION',
    question: 'The new subsidy program aims to _______ poverty in remote mountainous provinces.',
    options: ['alleviate', 'aggravate', 'create', 'invent'],
    correctAnswer: 'alleviate',
    explanation: 'Collocation chuẩn: "alleviate poverty / symptoms / pain" (làm giảm nhẹ đói nghèo / triệu chứng / nỗi đau).',
    sentenceTranslation: 'Chương trình trợ cấp mới nhằm giảm nhẹ tình trạng đói nghèo ở các tỉnh miền núi vùng sâu vùng xa.'
  },

  // --- EXACERBATE ---
  {
    word: 'exacerbate',
    category: 'GRAMMAR_TENSE',
    question: 'Not only _______ traffic congestion, but the construction work also caused loud noise.',
    options: ['did it exacerbate', 'it exacerbated', 'exacerbated it', 'has it exacerbated'],
    correctAnswer: 'did it exacerbate',
    explanation: 'Cấu trúc đảo ngữ với "Not only + trợ động từ (did) + S + V-nguyên thể" khi câu ở thì quá khứ đơn ("caused").',
    sentenceTranslation: 'Công trình thi công không những làm trầm trọng thêm tình trạng ùn tắc giao thông mà còn gây ra tiếng ồn lớn.'
  },

  // --- SKEPTICAL ---
  {
    word: 'skeptical',
    category: 'PREPOSITION_PHRASAL',
    question: 'Many economists remain skeptical _______ the accuracy of the optimistic forecast.',
    options: ['about', 'with', 'into', 'upon'],
    correctAnswer: 'about',
    explanation: 'Tính từ "skeptical" đi với giới từ "about" hoặc "of" (skeptical about/of something: hoài nghi về điều gì).',
    sentenceTranslation: 'Nhiều nhà kinh tế vẫn tỏ ra hoài nghi về độ chính xác của bản dự báo đầy lạc quan đó.'
  },

  // --- WARY ---
  {
    word: 'wary',
    category: 'PREPOSITION_PHRASAL',
    question: 'Consumers should be wary _______ phishing emails requesting bank passwords.',
    options: ['of', 'on', 'to', 'with'],
    correctAnswer: 'of',
    explanation: 'Tính từ "wary" đi với giới từ "of" (wary of something/somebody: cảnh giác, đề phòng với cái gì).',
    sentenceTranslation: 'Người tiêu dùng nên cảnh giác với những email lừa đảo yêu cầu mật khẩu ngân hàng.'
  },

  // --- INDIFFERENT ---
  {
    word: 'indifferent',
    category: 'PREPOSITION_PHRASAL',
    question: 'A responsible citizen cannot remain indifferent _______ local environmental issues.',
    options: ['to', 'with', 'about', 'for'],
    correctAnswer: 'to',
    explanation: 'Tính từ "indifferent" đi với giới từ "to" (indifferent to something: thờ ơ, dửng dưng trước điều gì).',
    sentenceTranslation: 'Một công dân có trách nhiệm không thể giữ thái độ thờ ơ trước các vấn đề môi trường tại địa phương.'
  },

  // --- OPTIMIZE ---
  {
    word: 'optimize',
    category: 'GRAMMAR_TENSE',
    question: 'Before the new app _______ tomorrow morning, the backend engineers will optimize all API routes.',
    options: ['launches', 'will launch', 'launched', 'is launching'],
    correctAnswer: 'launches',
    explanation: 'Trong mệnh đề trạng ngữ chỉ thời gian ("Before...", "When...", "As soon as...") ở tương lai, chia động từ ở thì Hiện tại đơn ("launches") thay vì "will launch".',
    sentenceTranslation: 'Trước khi ứng dụng mới ra mắt vào sáng mai, các kỹ sư backend sẽ tối ưu hóa toàn bộ đường dẫn API.'
  },

  // --- LUCRATIVE ---
  {
    word: 'lucrative',
    category: 'IDIOM',
    question: 'Though that venture seemed lucrative at first, the founders realized it was a _______ when regulations changed.',
    options: ['blessing in disguise', 'piece of cake', 'white elephant', 'dark horse'],
    correctAnswer: 'white elephant',
    explanation: 'Idiom "white elephant" chỉ một tài sản/dự án tốn kém nhưng vô dụng hoặc không mang lại lợi nhuận như kỳ vọng.',
    sentenceTranslation: 'Dù dự án đó ban đầu có vẻ sinh lợi cao, các nhà sáng lập nhận ra nó là một gánh nặng tốn kém vô ích khi quy định thay đổi.'
  },

  // --- NEGOTIATE ---
  {
    word: 'negotiate',
    category: 'GRAMMAR_TENSE',
    question: 'The union representatives _______ with management for five hours without reaching a deal yet.',
    options: ['have been negotiating', 'negotiate', 'negotiated', 'will negotiate'],
    correctAnswer: 'have been negotiating',
    explanation: 'Nhấn mạnh hành động kéo dài liên tục từ quá khứ đến hiện tại ("for five hours" + "yet") dùng thì Hiện tại hoàn thành tiếp diễn ("have been negotiating").',
    sentenceTranslation: 'Đại diện công đoàn đã và đang đàm phán liên tục với ban quản lý suốt năm tiếng đồng hồ mà vẫn chưa đạt được thỏa thuận.'
  },

  // --- DIVERSIFY ---
  {
    word: 'diversify',
    category: 'IDIOM',
    question: 'Smart investors always diversify their portfolios because it is unwise to _______.',
    options: ['put all your eggs in one basket', 'spill the beans', 'let sleeping dogs lie', 'hit the nail on the head'],
    correctAnswer: 'put all your eggs in one basket',
    explanation: 'Idiom "put all your eggs in one basket" nghĩa là dồn hết vốn liếng/hy vọng vào một chỗ duy nhất (trái ngược với diversify).',
    sentenceTranslation: 'Các nhà đầu tư thông minh luôn đa dạng hóa danh mục bởi vì thật khờ dại khi bỏ hết trứng vào một giỏ.'
  },

  // --- VIABLE ---
  {
    word: 'viable',
    category: 'COLLOCATION',
    question: 'Hydrogen fuel cells are increasingly seen as a _______ alternative to diesel engines.',
    options: ['viable', 'fragile', 'hostile', 'trivial'],
    correctAnswer: 'viable',
    explanation: 'Collocation chuẩn: "a viable alternative" (một giải pháp thay thế khả thi, bền vững).',
    sentenceTranslation: 'Pin nhiên liệu hydro ngày càng được coi là một giải pháp thay thế khả thi cho động cơ dầu diesel.'
  },

  // --- FOSTER ---
  {
    word: 'foster',
    category: 'COLLOCATION',
    question: 'Open communication helps _______ trust and teamwork inside a startup.',
    options: ['foster', 'damage', 'ignore', 'prevent'],
    correctAnswer: 'foster',
    explanation: 'Collocation chuẩn: "foster trust / innovation / cooperation" (nuôi dưỡng, thúc đẩy lòng tin / sáng tạo / hợp tác).',
    sentenceTranslation: 'Giao tiếp cởi mở giúp nuôi dưỡng lòng tin và tinh thần làm việc nhóm trong một công ty khởi nghiệp.'
  },

  // --- REMINISCENT ---
  {
    word: 'reminiscent',
    category: 'PREPOSITION_PHRASAL',
    question: 'The architecture of the old train station is strongly reminiscent _______ 19th-century Paris.',
    options: ['of', 'with', 'about', 'to'],
    correctAnswer: 'of',
    explanation: 'Tính từ "reminiscent" luôn đi với giới từ "of" (reminiscent of something: gợi nhớ đến điều gì).',
    sentenceTranslation: 'Kiến trúc của nhà ga xe lửa cũ gợi nhớ mạnh mẽ đến Paris thế kỷ 19.'
  },

  // --- AUTHENTIC ---
  {
    word: 'authentic',
    category: 'WORD_FORM',
    question: 'Museum curators used carbon dating to verify the _______ of the ancient manuscript.',
    options: ['authentic', 'authenticity', 'authentically', 'authenticate'],
    correctAnswer: 'authenticity',
    explanation: 'Sau mạo từ "the" và trước giới từ "of" cần một danh từ -> "authenticity" (tính xác thực, nguyên bản).',
    sentenceTranslation: 'Các chuyên gia bảo tàng đã dùng phương pháp xác định niên đại carbon để kiểm chứng tính xác thực của bản thảo cổ.'
  },

  // --- DISCREET ---
  {
    word: 'discreet',
    category: 'IDIOM',
    question: 'Because the merger talks were confidential, the director asked everyone to be discreet and _______.',
    options: ['keep it under wraps', 'break the ice', 'speak of the devil', 'cry over spilled milk'],
    correctAnswer: 'keep it under wraps',
    explanation: 'Idiom "keep something under wraps" nghĩa là giữ bí mật, kín đáo không tiết lộ ra ngoài (tương đồng với discreet).',
    sentenceTranslation: 'Vì cuộc đàm phán sáp nhập mang tính bảo mật, giám đốc yêu cầu mọi người thận trọng và giữ kín thông tin.'
  },

  // --- NOSTALGIA ---
  {
    word: 'nostalgia',
    category: 'IDIOM',
    question: 'Looking through her childhood photo album was a delightful _______.',
    options: ['trip down memory lane', 'shot in the dark', 'storm in a teacup', 'drop in the ocean'],
    correctAnswer: 'trip down memory lane',
    explanation: 'Idiom "a trip down memory lane" nghĩa là hành trình hồi tưởng lại những kỷ niệm đẹp trong quá khứ (nostalgia).',
    sentenceTranslation: 'Xem lại cuốn album ảnh thời thơ ấu là một chuyến du hành đầy thú vị về miền ký ức.'
  },

  // --- DETERIORATE ---
  {
    word: 'deteriorate',
    category: 'GRAMMAR_TENSE',
    question: 'Air quality in the industrial zone _______ steadily since the new factories opened.',
    options: ['deteriorates', 'has been deteriorating', 'deteriorated', 'will deteriorate'],
    correctAnswer: 'has been deteriorating',
    explanation: 'Dấu hiệu "since + mốc quá khứ" diễn tả xu hướng đang tiếp diễn từ quá khứ tới nay -> dùng Hiện tại hoàn thành tiếp diễn ("has been deteriorating").',
    sentenceTranslation: 'Chất lượng không khí tại khu công nghiệp đang suy giảm đều đặn kể từ khi các nhà máy mới mở cửa.'
  },

  // --- COINCIDE ---
  {
    word: 'coincide',
    category: 'PREPOSITION_PHRASAL',
    question: 'The release of the film was timed to coincide _______ the author\'s 100th birthday.',
    options: ['with', 'to', 'at', 'on'],
    correctAnswer: 'with',
    explanation: 'Động từ "coincide" đi với giới từ "with" (coincide with something: trùng khớp thời điểm với sự kiện nào đó).',
    sentenceTranslation: 'Thời điểm ra mắt bộ phim được sắp xếp để trùng khớp với lễ kỷ niệm sinh nhật lần thứ 100 của tác giả.'
  },

  // --- ADVOCATE ---
  {
    word: 'advocate',
    category: 'PREPOSITION_PHRASAL',
    question: 'Many doctors strongly _______ preventive healthcare instead of treating late-stage illnesses.',
    options: ['advocate for', 'put up with', 'give in to', 'look down on'],
    correctAnswer: 'advocate for',
    explanation: 'Cụm "advocate (for) something" nghĩa là công khai ủng hộ, kêu gọi thực hiện điều gì.',
    sentenceTranslation: 'Nhiều bác sĩ ủng hộ mạnh mẽ việc chăm sóc sức khỏe phòng ngừa thay vì chỉ điều trị bệnh ở giai đoạn muộn.'
  },

  // --- CONSPICUOUS ---
  {
    word: 'conspicuous',
    category: 'IDIOM',
    question: 'In a sea of black business suits, his bright neon jacket _______.',
    options: ['stood out like a sore thumb', 'vanished into thin air', 'cost a pretty penny', 'hung by a thread'],
    correctAnswer: 'stood out like a sore thumb',
    explanation: 'Idiom "stand out like a sore thumb" nghĩa là nổi bật lên một cách lộ liễu, khác biệt hẳn với xung quanh (rất conspicuous).',
    sentenceTranslation: 'Giữa một rừng vest công sở màu đen, chiếc áo khoác dạ quang rực rỡ của anh ta nổi bật lên rõ mồn một.'
  },

  // --- DISMANTLE ---
  {
    word: 'dismantle',
    category: 'PREPOSITION_PHRASAL',
    question: 'Technicians had to _______ the outdated machinery piece by piece before moving out.',
    options: ['take apart', 'take after', 'take over', 'take up'],
    correctAnswer: 'take apart',
    explanation: 'Phrasal verb "take apart" nghĩa là tháo rời từng bộ phận (đồng nghĩa với "dismantle"). Take after (giống ai), take over (tiếp quản), take up (bắt đầu sở thích).',
    sentenceTranslation: 'Các kỹ thuật viên phải tháo dỡ từng bộ phận của cỗ máy lỗi thời trước khi chuyển đi.'
  },

  // --- ENHANCE ---
  {
    word: 'enhance',
    category: 'GRAMMAR_TENSE',
    question: 'Regular sleep, _______ greatly enhances memory consolidation, is often neglected by students.',
    options: ['that', 'which', 'what', 'who'],
    correctAnswer: 'which',
    explanation: 'Mệnh đề quan hệ không xác định (có dấu phẩy) thay thế cho danh từ chỉ vật/khái niệm ("Regular sleep") phải dùng "which" (không được dùng "that").',
    sentenceTranslation: 'Giấc ngủ đều đặn, thứ giúp tăng cường đáng kể quá trình củng cố trí nhớ, thường bị học sinh bỏ bê.'
  },

  // --- TENACIOUS ---
  {
    word: 'tenacious',
    category: 'PREPOSITION_PHRASAL',
    question: 'Despite multiple rejections, the entrepreneur refused to _______ her dream of clean water access.',
    options: ['give up on', 'run out of', 'look forward to', 'get away with'],
    correctAnswer: 'give up on',
    explanation: 'Phrasal verb "give up on" nghĩa là từ bỏ hy vọng vào ai/điều gì (trái ngược với tính cách tenacious).',
    sentenceTranslation: 'Dù bị từ chối nhiều lần, nữ doanh nhân kiên cường từ chối từ bỏ giấc mơ mang lại nguồn nước sạch.'
  },

  // --- UNPRECEDENTED ---
  {
    word: 'unprecedented',
    category: 'GRAMMAR_TENSE',
    question: 'Never before _______ such an unprecedented surge in remote job applications.',
    options: ['the company saw', 'has the company seen', 'the company has seen', 'did the company saw'],
    correctAnswer: 'has the company seen',
    explanation: 'Đảo ngữ phủ định đầu câu "Never before + trợ động từ (has) + S + V3/ed" diễn tả trải nghiệm chưa từng có từ trước đến nay.',
    sentenceTranslation: 'Chưa bao giờ trước đây công ty chứng kiến sự gia tăng chưa từng có tiền lệ về số đơn xin việc từ xa như vậy.'
  },
];

/**
 * Dynamically builds a contextual Meaning question for ANY UserVocabItem
 */
function buildDynamicMeaningQuestion(
  target: UserVocabItem,
  allVocab: UserVocabItem[],
  indexSeed: number
): TestQuestion {
  const cleanWord = target.word.toLowerCase();
  const meaningVi =
    target.vietnameseMeaning ||
    WORD_DEFINITIONS_MAP[cleanWord]?.vietnameseMeaning ||
    target.definition;

  // Build distractors from user vocab or map
  const poolKeys = Object.keys(WORD_DEFINITIONS_MAP).filter((k) => k !== cleanWord);
  const userDistractors = allVocab
    .filter((v) => v.word.toLowerCase() !== cleanWord)
    .map((v) => v.word);

  const combinedPool = Array.from(new Set([...userDistractors, ...poolKeys]));
  const distractors = combinedPool
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = [target.word, ...distractors].sort(() => 0.5 - Math.random());

  // Mask target word in sentence
  const regex = new RegExp(`\\b${target.word}\\b|\\b${target.word}s\\b|\\b${target.word}ed\\b|\\b${target.word}ing\\b`, 'gi');
  const masked = regex.test(target.example)
    ? target.example.replace(regex, '_______')
    : `Choose the word that means "${meaningVi}": (${target.definition})`;

  const sentenceLower = target.example.trim().toLowerCase().replace(/["']/g, '');
  const viSentence =
    CURATED_SENTENCE_TRANSLATIONS[sentenceLower] ||
    `Ngữ cảnh câu tiếng Anh với từ "${target.word}" (${meaningVi}).`;

  return {
    id: `dyn-meaning-${target.id}-${indexSeed}`,
    wordId: target.id,
    word: target.word,
    category: 'MEANING',
    question: masked,
    options,
    correctAnswer: target.word,
    explanation: `"${target.word}" (${target.pos}) mang nghĩa là "${meaningVi}". ${target.definition}`,
    sentenceTranslation: viSentence,
    isFromMastered: target.status === 'MASTERED',
  };
}

/**
 * Dynamically builds a Vietnamese-to-English Synonym/Meaning test question
 */
function buildDynamicDefinitionQuestion(
  target: UserVocabItem,
  indexSeed: number
): TestQuestion {
  const cleanWord = target.word.toLowerCase();
  const correctVi =
    target.vietnameseMeaning ||
    WORD_DEFINITIONS_MAP[cleanWord]?.vietnameseMeaning ||
    target.definition;

  const wrongMeanings = Object.entries(WORD_DEFINITIONS_MAP)
    .filter(([k, val]) => k !== cleanWord && val.vietnameseMeaning !== correctVi)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(([, val]) => val.vietnameseMeaning);

  const options = [correctVi, ...wrongMeanings].sort(() => 0.5 - Math.random());

  return {
    id: `dyn-def-${target.id}-${indexSeed}`,
    wordId: target.id,
    word: target.word,
    category: 'MEANING',
    question: `Từ "${target.word}" (${target.pos} - ${target.ipa}) có nghĩa phù hợp nhất là gì?`,
    options,
    correctAnswer: correctVi,
    explanation: `Trong tiếng Anh, "${target.word}" nghĩa là: ${target.definition} (Tiếng Việt: ${correctVi}).`,
    sentenceTranslation: target.example,
    isFromMastered: target.status === 'MASTERED',
  };
}

/**
 * Dynamically builds a Collocation question when a MASTERED word carries collocations
 */
function buildDynamicCollocationQuestion(
  target: UserVocabItem,
  allVocab: UserVocabItem[],
  indexSeed: number
): TestQuestion | null {
  if (!target.collocations || target.collocations.length === 0) return null;

  const cleanWord = target.word.toLowerCase().trim();
  const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i');

  const matchingCol = target.collocations.find((col) => wordRegex.test(col));
  if (!matchingCol) return null;

  const maskedCol = matchingCol.replace(wordRegex, '_______');
  const meaningVi =
    target.vietnameseMeaning ||
    WORD_DEFINITIONS_MAP[cleanWord]?.vietnameseMeaning ||
    target.definition;

  const poolKeys = Object.keys(WORD_DEFINITIONS_MAP).filter((k) => k !== cleanWord);
  const userDistractors = allVocab
    .filter((v) => v.word.toLowerCase() !== cleanWord)
    .map((v) => v.word);

  const combinedPool = Array.from(new Set([...userDistractors, ...poolKeys]));
  const distractors = combinedPool.sort(() => 0.5 - Math.random()).slice(0, 3);
  if (distractors.length < 3) return null;

  const options = [target.word, ...distractors].sort(() => 0.5 - Math.random());

  return {
    id: `dyn-col-${target.id}-${indexSeed}`,
    wordId: target.id,
    word: target.word,
    category: 'COLLOCATION',
    question: `Chọn từ phù hợp để hoàn thành cụm Collocation tự nhiên: "${maskedCol}" (Gợi ý nghĩa từ cần điền: ${meaningVi})`,
    options,
    correctAnswer: target.word,
    explanation: `Cụm từ cố định (Collocation) tự nhiên là "${matchingCol}". Trong đó "${target.word}" mang nghĩa "${meaningVi}".`,
    sentenceTranslation: target.example || matchingCol,
    isFromMastered: target.status === 'MASTERED',
  };
}

const POS_LABELS_MAP: Record<string, string> = {
  noun: 'Danh từ (Noun)',
  verb: 'Động từ (Verb)',
  adjective: 'Tính từ (Adjective)',
  adverb: 'Trạng từ (Adverb)',
};

/**
 * Dynamically builds a Word Form / Part-of-Speech recognition question in sentence context
 */
function buildDynamicWordFormPosQuestion(
  target: UserVocabItem,
  indexSeed: number
): TestQuestion | null {
  if (!target.example || !target.pos) return null;
  const rawPos = target.pos.toLowerCase().trim();
  const matchedKey = Object.keys(POS_LABELS_MAP).find(
    (k) => rawPos === k || rawPos.split(/[\s,/]+/).includes(k)
  );
  if (!matchedKey) return null;

  const escaped = target.word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exampleContainsWord = new RegExp(`\\b${escaped}(s|es|ed|d|ing|ly)?\\b`, 'i').test(
    target.example
  );
  if (!exampleContainsWord) return null;

  const correctLabel = POS_LABELS_MAP[matchedKey];
  const allOptions = Object.values(POS_LABELS_MAP);
  const meaningVi =
    target.vietnameseMeaning ||
    WORD_DEFINITIONS_MAP[target.word.toLowerCase()]?.vietnameseMeaning ||
    target.definition;

  const sentenceLower = target.example.trim().toLowerCase().replace(/["']/g, '');
  const viSentence =
    CURATED_SENTENCE_TRANSLATIONS[sentenceLower] ||
    `Ngữ cảnh câu với từ "${target.word}" (${meaningVi}).`;

  return {
    id: `dyn-pos-${target.id}-${indexSeed}`,
    wordId: target.id,
    word: target.word,
    category: 'WORD_FORM',
    question: `Trong câu "${target.example}", từ "${target.word}" thuộc từ loại (Part of Speech) nào?`,
    options: [...allOptions],
    correctAnswer: correctLabel,
    explanation: `Trong ngữ cảnh câu trên, "${target.word}" là ${correctLabel}, mang nghĩa "${meaningVi}".`,
    sentenceTranslation: viSentence,
    isFromMastered: target.status === 'MASTERED',
  };
}

export const REQUIRED_TEST_QUESTIONS = 50;

export interface MasteredTestReadiness {
  requiredQuestions: number;
  availableQuestionsCount: number;
  masteredWordsCount: number;
  isEligible: boolean;
  categoryCounts: Record<TestQuestionCategory, number>;
}

/**
 * Builds ALL unique questions derived strictly from MASTERED words (zero fallback to unmastered words).
 */
function buildMasteredQuestionPool(userVocab: UserVocabItem[]): {
  curatedPool: TestQuestion[];
  dynamicPool: TestQuestion[];
  allUniquePool: TestQuestion[];
  masteredWordsCount: number;
} {
  const masteredVocab = userVocab.filter((v) => v.status === 'MASTERED');
  if (masteredVocab.length === 0) {
    return {
      curatedPool: [],
      dynamicPool: [],
      allUniquePool: [],
      masteredWordsCount: 0,
    };
  }

  const masteredSet = new Set(masteredVocab.map((v) => v.word.toLowerCase()));
  const userWordMap = new Map(userVocab.map((v) => [v.word.toLowerCase(), v]));

  const usedQuestionTexts = new Set<string>();
  const curatedPool: TestQuestion[] = [];
  const dynamicPool: TestQuestion[] = [];

  const pushTo = (bucket: TestQuestion[], q: TestQuestion | null) => {
    if (!q) return;
    if (!usedQuestionTexts.has(q.question)) {
      usedQuestionTexts.add(q.question);
      bucket.push(q);
    }
  };

  // STEP 1: Hand-crafted 6-domain questions for MASTERED words
  const masteredCurated = CURATED_QUESTION_BANK.filter((tpl) =>
    masteredSet.has(tpl.word.toLowerCase())
  ).sort(() => 0.5 - Math.random());

  masteredCurated.forEach((tpl, idx) => {
    const matchedVocab = userWordMap.get(tpl.word.toLowerCase());
    pushTo(curatedPool, {
      id: `curated-mastered-${tpl.word}-${idx}`,
      wordId: matchedVocab?.id || tpl.word,
      word: tpl.word,
      category: tpl.category,
      question: tpl.question,
      options: [...tpl.options].sort(() => 0.5 - Math.random()),
      correctAnswer: tpl.correctAnswer,
      explanation: tpl.explanation,
      sentenceTranslation: tpl.sentenceTranslation,
      isFromMastered: true,
    });
  });

  // STEP 2: Dynamic contextual, definition, collocation, and word-form questions strictly from MASTERED words
  const shuffledMastered = [...masteredVocab].sort(() => 0.5 - Math.random());
  shuffledMastered.forEach((v, idx) => {
    pushTo(dynamicPool, buildDynamicMeaningQuestion(v, userVocab, idx));
    pushTo(dynamicPool, buildDynamicDefinitionQuestion(v, idx));
    pushTo(dynamicPool, buildDynamicCollocationQuestion(v, userVocab, idx));
    pushTo(dynamicPool, buildDynamicWordFormPosQuestion(v, idx));
  });

  return {
    curatedPool,
    dynamicPool,
    allUniquePool: [...curatedPool, ...dynamicPool],
    masteredWordsCount: masteredVocab.length,
  };
}

/**
 * Inspects whether the user has enough MASTERED-word questions (50/50) to unlock the comprehensive test.
 */
export function getMasteredTestReadiness(userVocab: UserVocabItem[]): MasteredTestReadiness {
  const { allUniquePool, masteredWordsCount } = buildMasteredQuestionPool(userVocab);

  const categoryCounts: Record<TestQuestionCategory, number> = {
    MEANING: 0,
    WORD_FORM: 0,
    GRAMMAR_TENSE: 0,
    COLLOCATION: 0,
    PREPOSITION_PHRASAL: 0,
    IDIOM: 0,
  };

  allUniquePool.forEach((q) => {
    categoryCounts[q.category] += 1;
  });

  return {
    requiredQuestions: REQUIRED_TEST_QUESTIONS,
    availableQuestionsCount: allUniquePool.length,
    masteredWordsCount,
    isEligible: allUniquePool.length >= REQUIRED_TEST_QUESTIONS,
    categoryCounts,
  };
}

/**
 * Generates an exact 50-question comprehensive test built STRICTLY from MASTERED words.
 * Returns empty questions with `isEligible: false` when fewer than 50 mastered-word questions exist.
 */
export function generate50QuestionTest(userVocab: UserVocabItem[]): {
  questions: TestQuestion[];
  masteredWordsCount: number;
  availableQuestionsCount: number;
  usedMasteredCount: number;
  requiredQuestions: number;
  isEligible: boolean;
} {
  const { curatedPool, dynamicPool, allUniquePool, masteredWordsCount } =
    buildMasteredQuestionPool(userVocab);

  const availableQuestionsCount = allUniquePool.length;
  const isEligible = availableQuestionsCount >= REQUIRED_TEST_QUESTIONS;

  if (!isEligible) {
    return {
      questions: [],
      masteredWordsCount,
      availableQuestionsCount,
      usedMasteredCount: 0,
      requiredQuestions: REQUIRED_TEST_QUESTIONS,
      isEligible: false,
    };
  }

  // Prioritize curated 6-domain questions first, then top up to 50 from shuffled dynamic mastered questions
  const prioritizedCurated = [...curatedPool].slice(0, REQUIRED_TEST_QUESTIONS);
  const remainingNeeded = REQUIRED_TEST_QUESTIONS - prioritizedCurated.length;
  const selectedDynamic = [...dynamicPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, remainingNeeded);

  const finalQuestions = [...prioritizedCurated, ...selectedDynamic].sort(
    () => 0.5 - Math.random()
  );

  return {
    questions: finalQuestions,
    masteredWordsCount,
    availableQuestionsCount,
    usedMasteredCount: finalQuestions.length,
    requiredQuestions: REQUIRED_TEST_QUESTIONS,
    isEligible: true,
  };
}

