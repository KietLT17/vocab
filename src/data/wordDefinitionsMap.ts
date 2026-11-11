export interface WordMeaningDetail {
  pos: string;
  vietnameseMeaning: string;
  definition: string;
}

export const WORD_DEFINITIONS_MAP: Record<string, WordMeaningDetail> = {
  // Curated words
  resilient: {
    pos: "adjective",
    vietnameseMeaning: "Kiên cường, có khả năng phục hồi nhanh chóng",
    definition: "Able to recover quickly from difficult conditions, shock, or illness."
  },
  eloquent: {
    pos: "adjective",
    vietnameseMeaning: "Hùng biện, lưu loát, truyền cảm",
    definition: "Expressing thoughts and feelings persuasively and clearly in speech or writing."
  },
  pragmatic: {
    pos: "adjective",
    vietnameseMeaning: "Thực tế, thực dụng, trọng tính khả thi",
    definition: "Solving problems in a sensible, realistic way rather than following theoretical ideas."
  },
  meticulous: {
    pos: "adjective",
    vietnameseMeaning: "Tỉ mỉ, cẩn thận từng chi tiết nhỏ",
    definition: "Very careful and with great attention to every small detail."
  },
  ubiquitous: {
    pos: "adjective",
    vietnameseMeaning: "Phổ biến ở khắp mọi nơi",
    definition: "Seeming to be everywhere at the same time; extremely common."
  },
  ambiguous: {
    pos: "adjective",
    vietnameseMeaning: "Mơ hồ, nước đôi, khó hiểu rõ",
    definition: "Having or expressing more than one possible meaning; unclear."
  },
  collaborate: {
    pos: "verb",
    vietnameseMeaning: "Hợp tác, cộng tác cùng làm việc",
    definition: "To work together with someone else to produce or achieve something."
  },
  scrutinize: {
    pos: "verb",
    vietnameseMeaning: "Xem xét kỹ lưỡng, soi xét cẩn trọng",
    definition: "To examine something or someone very carefully and thoroughly."
  },
  lucid: {
    pos: "adjective",
    vietnameseMeaning: "Rõ ràng, mạch lạc, dễ hiểu",
    definition: "Clearly expressed and easy to understand; rational and clear-headed."
  },
  empathy: {
    pos: "noun",
    vietnameseMeaning: "Sự thấu cảm, khả năng đồng cảm",
    definition: "The ability to understand and share the feelings and emotions of another."
  },
  diligent: {
    pos: "adjective",
    vietnameseMeaning: "Chăm chỉ, siêng năng, cần cù",
    definition: "Working hard and showing care and effort in what you do."
  },
  inevitable: {
    pos: "adjective",
    vietnameseMeaning: "Không thể tránh khỏi, chắc chắn sẽ xảy ra",
    definition: "Certain to happen and unable to be avoided or prevented."
  },
  procrastinate: {
    pos: "verb",
    vietnameseMeaning: "Trì hoãn, chần chừ việc cần làm",
    definition: "To delay or postpone doing something that must be done."
  },
  candid: {
    pos: "adjective",
    vietnameseMeaning: "Thẳng thắn, bộc trực, chân thật",
    definition: "Honest and telling the truth, especially about difficult subjects."
  },
  innovative: {
    pos: "adjective",
    vietnameseMeaning: "Đổi mới, sáng tạo, tiên phong",
    definition: "Introducing new ideas, methods, or advanced original solutions."
  },
  coherent: {
    pos: "adjective",
    vietnameseMeaning: "Mạch lạc, gắn kết chặt chẽ",
    definition: "Clear, logical, and well-organized so that all parts connect smoothly."
  },
  spontaneous: {
    pos: "adjective",
    vietnameseMeaning: "Tự phát, ngẫu hứng, tự nhiên",
    definition: "Happening naturally without being planned or forced in advance."
  },
  vulnerable: {
    pos: "adjective",
    vietnameseMeaning: "Dễ bị tổn thương, yếu thế",
    definition: "Easily physically or emotionally hurt, influenced, or attacked."
  },
  perseverance: {
    pos: "noun",
    vietnameseMeaning: "Sự kiên trì, bền chí vượt khó",
    definition: "Continued effort and determination to achieve a goal despite obstacles."
  },
  comprehend: {
    pos: "verb",
    vietnameseMeaning: "Lĩnh hội, hiểu thấu đáo",
    definition: "To understand something fully, especially something complex."
  },

  // Extended pool words
  advocate: {
    pos: "verb / noun",
    vietnameseMeaning: "Ủng hộ, người chủ trương",
    definition: "To publicly recommend or support a policy, cause, or idea."
  },
  alleviate: {
    pos: "verb",
    vietnameseMeaning: "Làm dịu bớt, giảm nhẹ nỗi đau",
    definition: "To make suffering, pain, or difficulty less severe."
  },
  authentic: {
    pos: "adjective",
    vietnameseMeaning: "Đích thực, chân thực, nguyên bản",
    definition: "Known to be real and genuine, not copied or false."
  },
  benevolent: {
    pos: "adjective",
    vietnameseMeaning: "Nhân từ, hảo tâm, vị tha",
    definition: "Kind, generous, and caring about other people's well-being."
  },
  coincide: {
    pos: "verb",
    vietnameseMeaning: "Trùng hợp, xảy ra cùng một lúc",
    definition: "To happen at the same time or to be identical in opinion or nature."
  },
  concur: {
    pos: "verb",
    vietnameseMeaning: "Đồng tình, nhất trí quan điểm",
    definition: "To agree with someone or with an opinion."
  },
  conspicuous: {
    pos: "adjective",
    vietnameseMeaning: "Dễ thấy, nổi bật, đáng chú ý",
    definition: "Very noticeable or attracting special attention."
  },
  deteriorate: {
    pos: "verb",
    vietnameseMeaning: "Xấu đi, xuống cấp, giảm chất lượng",
    definition: "To become progressively worse in condition or quality."
  },
  discreet: {
    pos: "adjective",
    vietnameseMeaning: "Thận trọng, kín đáo, biết giữ kẽ",
    definition: "Careful in speech or action to avoid causing offense or revealing secrets."
  },
  dismantle: {
    pos: "verb",
    vietnameseMeaning: "Tháo dỡ, phân tách, giải thể",
    definition: "To take something apart piece by piece."
  },
  eccentric: {
    pos: "adjective",
    vietnameseMeaning: "Kỳ quặc, lập dị, khác thường",
    definition: "Unconventional and slightly strange in behavior or appearance."
  },
  enhance: {
    pos: "verb",
    vietnameseMeaning: "Nâng cao, củng cố, làm tăng giá trị",
    definition: "To improve the quality, value, or strength of something."
  },
  equivocal: {
    pos: "adjective",
    vietnameseMeaning: "Mập mờ, đa nghĩa, khó đoán",
    definition: "Open to more than one interpretation; ambiguous or doubtful."
  },
  exacerbate: {
    pos: "verb",
    vietnameseMeaning: "Làm trầm trọng thêm, làm tệ hơn",
    definition: "To make a bad situation, illness, or problem even worse."
  },
  exemplary: {
    pos: "adjective",
    vietnameseMeaning: "Gương mẫu, mẫu mực, đáng noi theo",
    definition: "Serving as a desirable model; representing the best of its kind."
  },
  feasible: {
    pos: "adjective",
    vietnameseMeaning: "Khả thi, có thể thực hiện được",
    definition: "Possible to do easily or conveniently; workable."
  },
  fluctuate: {
    pos: "verb",
    vietnameseMeaning: "Biến động, dao động lên xuống",
    definition: "To change continuously, rising and falling irregularly."
  },
  foster: {
    pos: "verb",
    vietnameseMeaning: "Nuôi dưỡng, thúc đẩy sự phát triển",
    definition: "To encourage the growth, development, or idea of something."
  },
  impartial: {
    pos: "adjective",
    vietnameseMeaning: "Công tâm, vô tư, không thiên vị",
    definition: "Treating all rivals or disputants equally; fair and just."
  },
  imminent: {
    pos: "adjective",
    vietnameseMeaning: "Sắp xảy ra, cận kề trước mắt",
    definition: "About to happen very soon; impending."
  },
  imperative: {
    pos: "adjective",
    vietnameseMeaning: "Cực kỳ cấp bách, bắt buộc",
    definition: "Of vital importance; crucial and requiring immediate attention."
  },
  indifferent: {
    pos: "adjective",
    vietnameseMeaning: "Thờ ơ, lãnh đạm, dửng dưng",
    definition: "Having no particular interest or sympathy; unconcerned."
  },
  ingenious: {
    pos: "adjective",
    vietnameseMeaning: "Tài tình, khéo léo, sáng dạ",
    definition: "Clever, original, and inventive in finding solutions."
  },
  inherent: {
    pos: "adjective",
    vietnameseMeaning: "Vốn có, cố hữu, bản chất",
    definition: "Existing in something as a permanent, essential, or characteristic attribute."
  },
  inquisitive: {
    pos: "adjective",
    vietnameseMeaning: "Tò mò, ham học hỏi, thích khám phá",
    definition: "Curious and eager to investigate or learn new things."
  },
  intricate: {
    pos: "adjective",
    vietnameseMeaning: "Phức tạp, tinh xảo, nhiều chi tiết",
    definition: "Very complicated or detailed in design or composition."
  },
  judicious: {
    pos: "adjective",
    vietnameseMeaning: "Sáng suốt, khôn ngoan, đắn đo kỹ",
    definition: "Having or showing good judgment and common sense."
  },
  lucrative: {
    pos: "adjective",
    vietnameseMeaning: "Sinh lợi nhiều, kiếm được món hời",
    definition: "Producing a great deal of profit; financially rewarding."
  },
  monotonous: {
    pos: "adjective",
    vietnameseMeaning: "Đơn điệu, tẻ nhạt, đều đều",
    definition: "Dull, tedious, and repetitious; lacking in variety and interest."
  },
  negligible: {
    pos: "adjective",
    vietnameseMeaning: "Không đáng kể, quá nhỏ nhặt",
    definition: "So small or unimportant as to be not worth considering."
  },
  nostalgia: {
    pos: "noun",
    vietnameseMeaning: "Nỗi hoài niệm, nhớ về quá khứ",
    definition: "A sentimental longing or affection for the past."
  },
  nuance: {
    pos: "noun",
    vietnameseMeaning: "Sắc thái tinh tế, khác biệt nhỏ",
    definition: "A subtle difference in or shade of meaning, expression, or sound."
  },
  obsolete: {
    pos: "adjective",
    vietnameseMeaning: "Lỗi thời, cổ hủ, không còn dùng",
    definition: "No longer produced or used; out of date."
  },
  opaque: {
    pos: "adjective",
    vietnameseMeaning: "Mờ đục, khó hiểu, không rõ ràng",
    definition: "Not able to be seen through; not transparent; hard to understand."
  },
  paradox: {
    pos: "noun",
    vietnameseMeaning: "Nghịch lý, điều có vẻ mâu thuẫn",
    definition: "A statement that seems self-contradictory but may be true."
  },
  plausible: {
    pos: "adjective",
    vietnameseMeaning: "Hợp lý, đáng tin cậy, có vẻ đúng",
    definition: "Seeming reasonable, probable, or worthy of belief."
  },
  prevalent: {
    pos: "adjective",
    vietnameseMeaning: "Thịnh hành, phổ biến rộng rãi",
    definition: "Widespread in a particular area or at a particular time."
  },
  prolific: {
    pos: "adjective",
    vietnameseMeaning: "Năng suất cao, sáng tác nhiều",
    definition: "Producing much fruit, foliage, or many artistic or academic works."
  },
  redundant: {
    pos: "adjective",
    vietnameseMeaning: "Dư thừa, thừa thãi, không cần thiết",
    definition: "Not or no longer needed or useful; superfluous."
  },
  reminiscent: {
    pos: "adjective",
    vietnameseMeaning: "Gợi nhớ, làm nhớ lại điều gì",
    definition: "Tending to remind one of something; suggestive of the past."
  },
  skeptical: {
    pos: "adjective",
    vietnameseMeaning: "Hoài nghi, ngờ vực, đa nghi",
    definition: "Not easily convinced; having doubts or reservations."
  },
  subtle: {
    pos: "adjective",
    vietnameseMeaning: "Tinh tế, tế nhị, khó nhận ra",
    definition: "So delicate or precise as to be difficult to analyze or describe."
  },
  tangible: {
    pos: "adjective",
    vietnameseMeaning: "Hữu hình, có thể sờ thấy, rõ ràng",
    definition: "Perceptible by touch; clear, definite, and real."
  },
  tenacious: {
    pos: "adjective",
    vietnameseMeaning: "Kiên trì, bền bỉ, không bỏ cuộc",
    definition: "Holding firmly to something; persistent and determined."
  },
  unprecedented: {
    pos: "adjective",
    vietnameseMeaning: "Chưa từng có tiền lệ trong lịch sử",
    definition: "Never done or known before; without previous example."
  },
  viable: {
    pos: "adjective",
    vietnameseMeaning: "Khả thi, có khả năng tồn tại/phát triển",
    definition: "Capable of working successfully; feasible and practical."
  },
  vindicate: {
    pos: "verb",
    vietnameseMeaning: "Minh oan, chứng minh là đúng đắn",
    definition: "To clear someone of blame or suspicion; prove to be right."
  },
  wary: {
    pos: "adjective",
    vietnameseMeaning: "Cảnh giác, thận trọng, đề phòng",
    definition: "Feeling or showing caution about possible dangers or problems."
  },
  zealous: {
    pos: "adjective",
    vietnameseMeaning: "Nhiệt huyết, hăng hái, sốt sắng",
    definition: "Having or showing great energy and enthusiasm in pursuit of a cause."
  }
};

export function getWordMeaning(word: string, fallbackVocab?: { definition: string; vietnameseMeaning?: string; pos?: string }): WordMeaningDetail {
  const clean = word.trim().toLowerCase();
  if (fallbackVocab && fallbackVocab.vietnameseMeaning && clean === word.toLowerCase()) {
    return {
      pos: fallbackVocab.pos || 'vocabulary',
      vietnameseMeaning: fallbackVocab.vietnameseMeaning,
      definition: fallbackVocab.definition,
    };
  }

  const found = WORD_DEFINITIONS_MAP[clean];
  if (found) return found;

  return {
    pos: 'term',
    vietnameseMeaning: `Từ vựng tiếng Anh: ${word}`,
    definition: `A term related to ${word} in modern English.`
  };
}

