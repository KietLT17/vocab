/**
 * Pre-compiled, natural Vietnamese translations for curated sentences.
 * Ensures zero latency and high-quality idiomatic Vietnamese.
 */
export const CURATED_SENTENCE_TRANSLATIONS: Record<string, string> = {
  "the local economy proved remarkably resilient despite the global crisis.":
    "Nền kinh tế địa phương đã tỏ ra kiên cường đáng kể bất chấp cuộc khủng hoảng toàn cầu.",

  "she made an eloquent speech in defense of human rights and dignity.":
    "Bà đã có một bài phát biểu hùng hồn, truyền cảm để bảo vệ nhân quyền và phẩm giá con người.",

  "we need to adopt a pragmatic approach to solve this technical bottleneck.":
    "Chúng ta cần áp dụng một cách tiếp cận thực tế để giải quyết điểm nghẽn kỹ thuật này.",

  "he maintained meticulous records of all financial transactions.":
    "Anh ấy duy trì hồ sơ ghi chép tỉ mỉ về mọi giao dịch tài chính.",

  "smartphones have become ubiquitous in modern urban life.":
    "Điện thoại thông minh đã trở nên phổ biến ở khắp mọi nơi trong đời sống đô thị hiện đại.",

  "the government gave an ambiguous statement regarding the new tax policy.":
    "Chính phủ đã đưa ra một tuyên bố mơ hồ, nước đôi liên quan đến chính sách thuế mới.",

  "engineers and designers collaborated closely to build the new mobile interface.":
    "Các kỹ sư và nhà thiết kế đã hợp tác chặt chẽ để xây dựng giao diện di động mới.",

  "her performance was scrutinized under the sharp eyes of the committee.":
    "Màn trình diễn của cô ấy đã bị xem xét kỹ lưỡng dưới con mắt sắc bén của hội đồng đánh giá.",

  "the professor provided a remarkably lucid explanation of quantum physics.":
    "Giáo sư đã đưa ra một lời giải thích vô cùng rõ ràng, mạch lạc và dễ hiểu về vật lý lượng tử.",

  "great leaders possess deep empathy for the challenges their teams face.":
    "Những nhà lãnh đạo vĩ đại luôn có sự thấu cảm sâu sắc trước những thử thách mà đội ngũ của họ gặp phải.",

  "through diligent effort and practice, she mastered fluent english in two years.":
    "Nhờ sự nỗ lực chăm chỉ và rèn luyện không ngừng, cô ấy đã thành thạo tiếng Anh lưu loát trong hai năm.",

  "with climate change accelerating, radical changes in energy policy are inevitable.":
    "Với tình trạng biến đổi khí hậu đang gia tăng, những thay đổi căn bản trong chính sách năng lượng là điều không thể tránh khỏi.",

  "most students tend to procrastinate until the night before the final exam.":
    "Hầu hết sinh viên đều có xu hướng trì hoãn công việc cho đến tận đêm trước kỳ thi cuối kỳ.",

  "we had a candid discussion about the financial challenges ahead.":
    "Chúng tôi đã có một cuộc thảo luận thẳng thắn và cởi mở về những thách thức tài chính phía trước.",

  "the startup introduced an innovative solution for renewable energy storage.":
    "Công ty khởi nghiệp đã giới thiệu một giải pháp đổi mới sáng tạo cho việc lưu trữ năng lượng tái tạo.",

  "the essay presented a coherent argument supported by statistical evidence.":
    "Bài luận đã trình bày một lập luận mạch lạc, chặt chẽ được củng cố bằng các bằng chứng thống kê.",

  "the audience burst into spontaneous applause at the end of the concert.":
    "Khán giả đã bất ngờ vỗ tay nồng nhiệt một cách tự phát khi buổi hòa nhạc kết thúc.",

  "old people are particularly vulnerable to cold weather and respiratory infections.":
    "Người cao tuổi đặc biệt dễ bị tổn thương trước thời tiết lạnh và các bệnh nhiễm trùng đường hô hấp.",

  "through sheer perseverance, the scientist finally discovered the vaccine.":
    "Nhờ sự kiên trì bền bỉ phi thường, nhà khoa học cuối cùng đã tìm ra loại vắc-xin.",

  "it took him several days to fully comprehend the magnitude of the discovery.":
    "Anh ấy phải mất nhiều ngày mới có thể lĩnh hội thấu đáo tầm quan trọng to lớn của phát hiện này.",
};

/**
 * Get sentence translation with instant local cache or dynamic fallback
 */
export async function translateSentenceToVietnamese(sentence: string, targetWordMeaning?: string): Promise<string> {
  const cleanKey = sentence.trim().toLowerCase().replace(/["']/g, '');
  if (!cleanKey) return '';

  // 1. Direct match in curated dictionary
  if (CURATED_SENTENCE_TRANSLATIONS[cleanKey]) {
    return CURATED_SENTENCE_TRANSLATIONS[cleanKey];
  }

  // Partial match in curated dictionary for substantial sentences only
  if (cleanKey.length >= 12) {
    for (const [key, val] of Object.entries(CURATED_SENTENCE_TRANSLATIONS)) {
      if (cleanKey.includes(key) || key.includes(cleanKey)) {
        return val;
      }
    }
  }

  // 2. Fetch from Google Translate public client API with bounded timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
      sentence
    )}`;
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const fullTranslation = data[0].map((item: unknown[]) => item[0]).join('');
        if (fullTranslation) {
          // Cache in memory for subsequent renders
          CURATED_SENTENCE_TRANSLATIONS[cleanKey] = fullTranslation;
          return fullTranslation;
        }
      }
    }
  } catch (err) {
    console.warn('Could not auto-translate sentence, using contextual fallback', err);
  } finally {
    clearTimeout(timer);
  }

  // 3. Meaningful fallback
  if (targetWordMeaning) {
    return `Câu diễn đạt ngữ cảnh thực tế của từ: "${targetWordMeaning}".`;
  }

  return `Bản dịch ngữ cảnh: "${sentence}"`;
}

