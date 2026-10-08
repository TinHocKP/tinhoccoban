/**
 * Tiện ích hỗ trợ Quản lý & Nhập câu hỏi từ Google Form / Excel / JSON
 * Cho phép giảng viên linh hoạt cập nhật đề thi bất cứ lúc nào
 */

(function () {
  'use strict';

  const STORAGE_KEY_CUSTOM_BANK = 'BK_CUSTOM_QUESTION_BANK';

  // Hiển thị modal quản lý đề thi
  window.showImporterModal = function () {
    let modal = document.getElementById('admin-importer-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-importer-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const currentBank = (window.BK_EXAM && window.DEFAULT_QUESTION_BANK) ? 
      (JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_BANK) || 'null') || window.DEFAULT_QUESTION_BANK) : [];

    // Thống kê theo từng module
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    currentBank.forEach(q => {
      const m = q.module || 1;
      if (stats[m] !== undefined) stats[m]++;
    });

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <h4>⚙ QUẢN LÝ NGÂN HÀNG CÂU HỎI THI</h4>
          <button id="btn-close-importer" style="background:none; border:none; color:#fff; font-size:18px; cursor:pointer;">✖</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <div style="background:#e8f4fd; border:1px solid #90caf9; padding:10px 14px; border-radius:6px; font-size:13.5px; margin-bottom:14px;">
            <strong>📊 Hiện tại ngân hàng có tổng cộng ${currentBank.length} câu hỏi:</strong><br>
            • Module 1 (CNTT Cơ bản): <strong>${stats[1]} câu</strong> | Module 2 (Máy tính cơ bản): <strong>${stats[2]} câu</strong><br>
            • Module 3 (Internet cơ bản): <strong>${stats[3]} câu</strong> | Module 4 (Phần Word): <strong>${stats[4]} câu</strong><br>
            • Module 5 (Phần Excel): <strong>${stats[5]} câu</strong> | Module 6 (PowerPoint): <strong>${stats[6]} câu</strong>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; display: block; margin-bottom: 6px;">Dán danh sách câu hỏi (JSON hoặc định dạng văn bản sao chép):</label>
            <textarea id="import-textarea" rows="8" style="width: 100%; padding: 10px; font-family: monospace; font-size: 12.5px; border: 1px solid #b0bec5; border-radius: 4px;" placeholder='[ {"id": 1, "module": 1, "question": "...", "options": ["A","B","C","D"], "answer": 0} ] hoặc dán nội dung câu hỏi...'></textarea>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <button id="btn-parse-json" style="background:#0288d1; color:#fff; border:none; padding:8px 14px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;">Nhập từ JSON</button>
            <button id="btn-download-js" style="background:#43a047; color:#fff; border:none; padding:8px 14px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;">Tải file questions.js</button>
            <button id="btn-reset-default" style="background:#e53935; color:#fff; border:none; padding:8px 14px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;">Khôi phục 300 câu gốc</button>
          </div>

          <div style="background:#fff3e0; border:1px solid #ffe082; padding:10px 14px; border-radius:6px; font-size:13px; line-height: 1.5;">
            <strong>💡 Hướng dẫn sử dụng cho giảng viên:</strong><br>
            1. Ngân hàng đã có sẵn đầy đủ <strong>300 câu hỏi chính thức</strong> từ 6 Google Form của bạn.<br>
            2. Bạn có thể bấm <strong>"Tải file questions.js"</strong> để tải file đề về và commit lên GitHub bất cứ lúc nào.<br>
            3. Nếu muốn cập nhật câu hỏi mới, chỉ cần dán JSON và bấm "Nhập từ JSON", hệ thống sẽ lưu ngay vào trình duyệt.
          </div>
        </div>
        <div class="modal-footer">
          <button id="btn-finish-importer" style="background:#0288d1; color:#fff; border:none; padding:8px 18px; border-radius:4px; font-weight:bold; cursor:pointer;">Đóng</button>
        </div>
      </div>
    `;

    document.getElementById('btn-close-importer').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('btn-finish-importer').addEventListener('click', () => modal.style.display = 'none');

    // Nút Nhập từ JSON
    document.getElementById('btn-parse-json').addEventListener('click', () => {
      const txt = document.getElementById('import-textarea').value.trim();
      if (!txt) {
        alert('Vui lòng dán chuỗi JSON câu hỏi vào ô!');
        return;
      }
      try {
        const parsed = JSON.parse(txt);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(STORAGE_KEY_CUSTOM_BANK, JSON.stringify(parsed));
          alert(`Đã nhập thành công ${parsed.length} câu hỏi mới!`);
          modal.style.display = 'none';
          location.reload();
        } else {
          alert('Dữ liệu JSON phải là một mảng các câu hỏi!');
        }
      } catch (err) {
        alert('Lỗi định dạng JSON: ' + err.message);
      }
    });

    // Nút Tải file questions.js
    document.getElementById('btn-download-js').addEventListener('click', () => {
      const data = currentBank;
      const content = `// Ngân hàng câu hỏi trắc nghiệm CNTT Bách Khoa\nwindow.DEFAULT_QUESTION_BANK = ${JSON.stringify(data, null, 2)};\n`;
      const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'questions.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Nút Khôi phục 300 câu gốc
    document.getElementById('btn-reset-default').addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn khôi phục về 300 câu hỏi gốc từ 6 Google Forms không?')) {
        localStorage.removeItem(STORAGE_KEY_CUSTOM_BANK);
        alert('Đã khôi phục 300 câu hỏi gốc thành công!');
        modal.style.display = 'none';
        location.reload();
      }
    });
  };

})();
