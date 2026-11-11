# VocabFlow - Ứng dụng Học Từ Vựng Tiếng Anh theo Ngữ Cảnh & SRS

Ứng dụng web/PWA học từ vựng tiếng Anh tiện lợi, chất lượng cao, lấy dữ liệu từ các nguồn từ điển chuẩn (*Oxford, Cambridge, Free Dictionary API*), tích hợp đầy đủ phát âm audio người bản xứ, phiên âm IPA, câu ví dụ ngữ cảnh thực tế, và luyện tập đa kỹ năng (**Nghe - Đọc - Viết**).

---

## 🌟 Tính Năng Nổi Bật

1. **Cấp từ vựng ngẫu nhiên không trùng lặp:**
   - Mỗi ngày hoặc mỗi lần nhấn nút **"Đổi từ khác" / "Lưu từ này"**, app sẽ chọn ngẫu nhiên một từ mới mà bạn **chưa từng lưu** trong kho.
   - Đầy đủ: Phiên âm IPA chuẩn quốc tế, loại từ (Part of Speech), phát âm audio `.mp3`, nghĩa tiếng Việt, định nghĩa Anh - Anh và câu ví dụ ngữ cảnh.

2. **Tra cứu & Thêm từ tức thì:**
   - Tra bất kỳ từ tiếng Anh nào: Tự động bóc tách từ từ điển với phiên âm và audio gốc.
   - Thêm vào kho cá nhân với 1 chạm.

3. **Vòng lặp Luyện tập 3 Kỹ năng khép kín:**
   - **Kỹ năng 1 - Luyện Nghe (Dictation):** Nghe phát âm chuẩn và gõ lại từ (có gợi ý phiên âm IPA nếu gặp khó khăn).
   - **Kỹ năng 2 - Luyện Đọc (Cloze Context):** Đoán từ vào chỗ trống trong câu trích dẫn ngữ cảnh thực tế.
   - **Kỹ năng 3 - Luyện Viết (Writing):** Tự đặt câu với từ vựng mới để biến từ thụ động thành từ chủ động.

4. **Thuật toán Lặp lại Ngắt quãng (SRS - Spaced Repetition):**
   - Đánh giá theo 4 mức: *Quên (Again) - Khó (Hard) - Nhớ tốt (Good) - Rất dễ (Easy)*.
   - Tự động tính toán ngày ôn tiếp theo theo chu kỳ quên SuperMemo SM-2.

5. **Tiện lợi (PWA) & Không lo mất dữ liệu:**
   - Hoạt động mượt mà cả trên máy tính lẫn điện thoại (Android & iOS).
   - Cài đặt trực tiếp lên màn hình chính (Add to Home screen) có icon riêng như app Native.
   - Hỗ trợ xuất file (Export JSON) sao lưu và khôi phục (Import JSON) bất kỳ lúc nào.

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh

### 1. Khởi động ứng dụng (Localhost)
Trong thư mục `D:\Eng`, mở PowerShell hoặc Terminal và chạy:

```bash
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

### 2. Dùng trên điện thoại qua Wi-Fi nội bộ (Không cần deploy)
1. Đảm bảo điện thoại và máy tính kết nối **chung một mạng Wi-Fi**.
2. Kiểm tra địa chỉ IP máy tính bằng lệnh `ipconfig` (ví dụ `192.168.1.15`).
3. Chạy lệnh:
   ```bash
   npx next dev -H 0.0.0.0
   ```
4. Trên trình duyệt điện thoại (Safari hoặc Chrome), truy cập: `http://192.168.1.15:3000`.
5. Bấm vào menu chia sẻ của trình duyệt $\to$ Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** để dùng như app thực thụ!

### 3. Deploy lên mạng miễn phí (Tùy chọn)
Nếu muốn học mọi lúc mọi nơi ngoài đường:
1. Đẩy code lên GitHub.
2. Đăng nhập [Vercel.com](https://vercel.com) $\to$ Chọn **New Project** $\to$ Chọn repository này.
3. Bấm **Deploy**. Sau 1 phút bạn sẽ có link chạy online 24/7 (dạng `https://vocabflow-xyz.vercel.app`) hoàn toàn miễn phí.

