# Website Thi Trắc Nghiệm CNTT Căn Bản (Đại Học Bách Khoa)

Hệ thống thi trắc nghiệm trực tuyến dành cho kỳ thi Ứng dụng CNTT Căn bản (6 Module chuẩn Bộ TT&TT / TT Kỹ thuật Điện toán Bách Khoa), hoạt động nhẹ, ổn định và hoàn toàn miễn phí trên GitHub Pages cho 150 sinh viên thi đồng thời.

## 🌟 Tính Năng Nổi Bật

- **Chịu tải 150+ sinh viên đồng thời**: Ứng dụng xây dựng trên kiến trúc web tĩnh thuần (HTML5, CSS3, Vanilla ES6 JavaScript), không dùng máy chủ trung gian, nạp tức thì qua GitHub Pages CDN.
- **Ngân hàng 300 câu hỏi chính thức**: Tích hợp đầy đủ 300 câu hỏi chuẩn từ 6 Google Forms theo từng chuyên đề:
  1. *Module 1:* Kiến thức CNTT Cơ bản (IU01) - 50 câu
  2. *Module 2:* Sử dụng máy tính cơ bản (IU02) - 50 câu
  3. *Module 3:* Sử dụng Internet cơ bản (IU06) - 50 câu
  4. *Module 4:* Xử lý văn bản cơ bản Word (IU03) - 50 câu
  5. *Module 5:* Sử dụng bảng tính cơ bản Excel (IU04) - 50 câu
  6. *Module 6:* Trình chiếu cơ bản PowerPoint (IU05) - 50 câu
- **Tạo đề thi tự động & độc lập**: Mỗi sinh viên làm một đề gồm 30 câu được bốc ngẫu nhiên đúng 5 câu từ mỗi module trong 6 module.
- **Thời gian làm bài 30 phút**: Đồng hồ đếm ngược kỹ thuật số `00:30:00`, tự động cảnh báo và nộp bài khi hết giờ.
- **Giao diện chuẩn xác Bách Khoa**:
  - Lưới 30 câu hỏi 5x6 trực quan với tính năng đặt cờ 🚩, đổi kích thước chữ linh hoạt.
  - Sau khi nộp bài: **Câu đúng hiển thị màu XANH LÁ**, **Câu sai hiển thị màu ĐỎ NHẠT**.
  - Xem lại chi tiết từng câu: **Hiển thị câu trả lời đúng và giải thích rõ ràng bên dưới** khi sinh viên làm sai.
- **Chống mất bài khi tải lại trang**: Tự động lưu tiến trình làm bài vào LocalStorage.

## 📁 Cấu Trúc Thư Mục

```
WebsiteTracNghiem/
├── index.html                 # Giao diện thi trắc nghiệm (30 câu / 30 phút đếm ngược)
├── practice.html              # Giao diện ÔN TẬP TỪNG MODULE (đủ 50 câu / không đếm giờ)
├── admin.html                 # Trang quản lý câu hỏi RIÊNG BIỆT cho GIẢNG VIÊN (adin / admin123)
├── css/
│   └── style.css              # Giao diện chuẩn Bách Khoa (Responsive PC, iPad, Phone)
├── js/
│   ├── app.js                 # Bộ máy thi thử, bốc ngẫu nhiên, đếm giờ & chấm điểm
│   ├── practice.js            # Bộ máy ôn tập 50 câu/module tự do, xem đáp án tức thì
│   ├── questions.js           # 300 câu hỏi chính thức từ 6 Google Forms
│   └── google-form-helper.js  # Công cụ quản lý ngân hàng câu hỏi
├── assets/
│   ├── logo-bk.png            # Logo Đại học Bách Khoa CCE
│   └── images/                # 17 hình minh họa bài thi tải về cục bộ
├── tools/
│   ├── fetch_google_forms.py  # Script tự động trích xuất Google Form
│   ├── build_exact_bank.py    # Script lắp ráp ngân hàng đề thi
│   └── GoogleFormExporter.gs  # Google Apps Script cho Google Forms / Sheets
└── HUONG_DAN_GITHUB.md        # Hướng dẫn chi tiết cách đưa lên GitHub Pages
```

## 🚀 Hướng Dẫn Nhanh

Xem chi tiết từng bước tại tệp [HUONG_DAN_GITHUB.md](HUONG_DAN_GITHUB.md).
1. Tạo kho lưu trữ trên GitHub.
2. Tải toàn bộ thư mục này lên GitHub.
3. Bật **Settings -> Pages -> Branch: main -> Save**.
4. Chia sẻ đường dẫn cho 150 sinh viên cùng tham gia thi.
