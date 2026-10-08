# 🚀 HƯỚNG DẪN CHI TIẾT ĐƯA WEBSITE LÊN GITHUB PAGES MIỄN PHÍ

Hệ thống thi trắc nghiệm được xây dựng hoàn toàn dưới dạng **Trang web tĩnh (Static Web App: HTML5, CSS3, JavaScript thuần)**:
- **100% Miễn phí trọn đời** trên GitHub Pages.
- **Chịu tải không giới hạn**: 150 sinh viên (hoặc hàng nghìn sinh viên) cùng truy cập thi đồng thời cực kỳ mượt mà nhờ hạ tầng máy chủ CDN toàn cầu của GitHub, không lo bị sập hay quá tải.
- **Hỗ trợ mọi thiết bị**: Chạy tốt trên Điện thoại (iOS / Android), iPad / Máy tính bảng và Máy tính để bàn / Laptop.

---

## 🌟 CÁCH 1: TẢI TRỰC TIẾP LÊN WEB GITHUB (ĐƠN GIẢN NHẤT - KHÔNG CẦN CÀI GIT)

*(Thời gian thực hiện: khoảng 2 phút)*

### Bước 1: Tạo Repository (Kho chứa) trên GitHub
1. Mở trình duyệt, truy cập vào **[https://github.com](https://github.com)** và đăng nhập tài khoản của bạn.
2. Bấm vào nút **"New"** màu xanh (hoặc bấm vào dấu **`+`** ở góc trên bên phải -> chọn **"New repository"**).
3. Điền thông tin:
   - **Repository name**: `thitracnghiem` *(viết liền không dấu)*
   - Chọn chế độ: **Public** *(Bắt buộc chọn Public để dùng GitHub Pages miễn phí)*
   - Không cần tích chọn các mục Add README, .gitignore.
4. Bấm nút xanh **"Create repository"** ở dưới cùng.

### Bước 2: Tải các tệp tin lên GitHub
1. Trên màn hình repository vừa tạo, tìm và bấm vào dòng chữ xanh: **"uploading an existing file"** *(hoặc bấm "Add file" -> "Upload files")*.
2. Mở thư mục **`d:\WebsiteTracNghiem`** trên máy tính của bạn:
   - Hãy chọn và **kéo thả** các tệp & thư mục sau vào ô tải lên của trình duyệt:
     - 📄 `index.html` *(Trang thi cho sinh viên - 30 câu / 30 phút)*
     - 📄 `practice.html` *(Trang ôn tập từng Module đủ 50 câu - Không đếm giờ)*
     - 📄 `admin.html` *(Trang quản trị cho giảng viên)*
     - 📁 Thư mục `css` *(Chứa style.css)*
     - 📁 Thư mục `js` *(Chứa app.js, practice.js, questions.js)*
     - 📁 Thư mục `assets` *(Chứa logo-bk.png và thư mục images chứa 17 hình minh họa)*
3. Chờ thanh tải lên hoàn tất tất cả các file.
4. Kéo xuống dưới cùng trang và bấm nút xanh: **"Commit changes"**.

---

## ⚙️ BƯỚC 3: BẬT TÍNH NĂNG GITHUB PAGES (Chỉ mất 30 giây)

1. Trên thanh menu ngang của Repository trên GitHub, bấm vào mục **Settings** (biểu tượng bánh răng ⚙️).
2. Ở thanh menu dọc bên trái, tìm mục **Code and automation** -> chọn **Pages**.
3. Tại phần **Build and deployment**:
   - Mục **Source**: chọn **"Deploy from a branch"**.
   - Mục **Branch**: đổi từ `None` thành **`main`** (hoặc `master`).
   - Thư mục bên cạnh giữ nguyên là: **`/ (root)`**.
   - Bấm nút **"Save"**.
4. Chờ khoảng 1 - 2 phút để GitHub kích hoạt đường link.
5. Tải lại trang (F5), bạn sẽ thấy thông báo màu xanh kèm theo đường link website:
   👉 **`https://<ten-tai-khoan-cua-ban>.github.io/thitracnghiem/`**

---

## 🌟 CÁCH 2: DÙNG PHẦN MỀM GITHUB DESKTOP (Dễ cập nhật sau này)

Nếu bạn muốn sau này mỗi khi sửa câu hỏi thì chỉ cần 1 click là tự động cập nhật lên web:
1. Tải và cài đặt phần mềm **GitHub Desktop** miễn phí tại: [https://desktop.github.com](https://desktop.github.com).
2. Mở GitHub Desktop và đăng nhập tài khoản GitHub.
3. Chọn menu **File** -> **Add local repository...** -> Chọn thư mục `D:\WebsiteTracNghiem`.
4. Bấm **"Create a Repository"** nếu có thông báo -> rồi bấm **"Publish repository"** (nhớ bỏ tích ô "Keep this code private").
5. Lên web GitHub vào **Settings -> Pages -> Branch: main -> Save** như Bước 3 ở trên.

---

## 🎓 HƯỚNG DẪN SỬ DỤNG CHO BUỔI THI

### 1. Gửi link cho 150 sinh viên thi:
- Gửi đường link: **`https://<ten-tai-khoan-cua-ban>.github.io/thitracnghiem/`**
- Sinh viên có thể dùng bất kỳ thiết bị nào: **Điện thoại iPhone/Android, iPad, Laptop, PC**.
- Khi vào trang, sinh viên:
  - Nhập **Mã số sinh viên (MSSV)** và **Họ tên**.
  - Bấm **"BẮT ĐẦU LÀM BÀI"**.
  - Hệ thống tự động bốc **30 câu ngẫu nhiên** (5 câu từ mỗi Module trong 6 Module, đảo ngẫu nhiên toàn bộ bài thi). Mỗi sinh viên sẽ có một đề thi độc lập khác nhau.
  - Đồng hồ đếm ngược **30 phút** (`00 : 30 : 00`).
  - Khi nộp bài: Hệ thống chấm điểm tự động ngay lập tức, hiển thị:
    - **Số câu đúng** (màu xanh), **Số câu sai** (màu đỏ) và **Tổng điểm**.
    - Sinh viên bấm vào từng câu sai sẽ thấy đáp án đúng và lời giải thích chi tiết.

### 2. Trang quản trị dành riêng cho Giảng viên:
- Đường link: **`https://<ten-tai-khoan-cua-ban>.github.io/thitracnghiem/admin.html`**
- Tài khoản đăng nhập:
  - **Tên đăng nhập**: `adin` (hoặc `admin`)
  - **Mật khẩu**: `admin123`
- Giảng viên có thể:
  - Xem, tìm kiếm, sửa nội dung hoặc đáp án của từng câu trong 300 câu hỏi.
  - Thêm câu hỏi mới hoặc xóa bớt câu hỏi.
  - Bấm nút **"Tải questions.js"** để lưu file về máy khi có thay đổi.
