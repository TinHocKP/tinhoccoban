/**
 * Hệ thống thi trắc nghiệm Đại học Bách Khoa (BK-CCE)
 * Mô phỏng chuẩn xác giao diện thi trắc nghiệm Bách Khoa
 * 300 câu hỏi chia 6 module, bóc 5 câu/module -> 30 câu / 30 phút
 */

(function () {
  'use strict';

  // Cấu hình hằng số
  const EXAM_DURATION_SECONDS = 30 * 60; // 30 phút = 1800 giây
  const QUESTIONS_PER_MODULE = 5;
  const TOTAL_MODULES = 6;
  const TOTAL_EXAM_QUESTIONS = QUESTIONS_PER_MODULE * TOTAL_MODULES; // 30 câu
  const STORAGE_KEY_EXAM = 'BK_EXAM_STATE_V1';
  const STORAGE_KEY_CUSTOM_BANK = 'BK_CUSTOM_QUESTION_BANK';

  // Trạng thái ứng dụng
  let appState = {
    view: 'start', // 'start', 'exam', 'result_summary', 'review'
    examCode: '20261004',
    studentId: 'DTBK001',
    studentName: 'Điện toán Bách Khoa 001',
    certType: 'CƠ BẢN',
    fontSize: 15,
    questions: [], // 30 câu hỏi của đợt thi hiện tại
    userAnswers: {}, // { questionIndex: optionIndex (0..3) }
    flaggedQuestions: {}, // { questionIndex: true/false }
    remainingSeconds: EXAM_DURATION_SECONDS,
    timerInterval: null,
    submitTimeStr: '',
    currentQuestionIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0
  };

  // Lấy ngân hàng câu hỏi (từ custom localStorage nếu có, hoặc mặc định 300 câu)
  function getQuestionBank() {
    try {
      const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_BANK);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Không thể đọc ngân hàng câu hỏi tùy chỉnh:', e);
    }
    return window.DEFAULT_QUESTION_BANK || [];
  }

  // Thuật toán bóc ngẫu nhiên 5 câu từ mỗi module trong 6 module
  function generateExamQuestions() {
    const bank = getQuestionBank();
    const modules = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    // Phân loại câu hỏi theo 6 module
    bank.forEach(q => {
      const mod = q.module || 1;
      if (modules[mod]) {
        modules[mod].push(q);
      } else {
        modules[1].push(q);
      }
    });

    const selectedQuestions = [];

    for (let m = 1; m <= TOTAL_MODULES; m++) {
      const pool = modules[m] || [];
      if (pool.length < QUESTIONS_PER_MODULE) {
        console.warn(`Module ${m} chỉ có ${pool.length} câu, lấy toàn bộ.`);
        selectedQuestions.push(...pool);
      } else {
        // Trộn ngẫu nhiên (Fisher-Yates shuffle) và bóc đúng 5 câu
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        selectedQuestions.push(...shuffled.slice(0, QUESTIONS_PER_MODULE));
      }
    }

    // Sau khi bóc đủ 5 câu/module (tổng 30 câu bao phủ cả 6 module),
    // tiến hành đảo ngẫu nhiên toàn bộ 30 câu (Fisher-Yates) để câu hỏi phân bổ đan xen, không theo cụm module
    for (let i = selectedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
    }

    // Đánh số lại thứ tự từ 1 đến 30 cho đề thi
    return selectedQuestions.map((q, idx) => ({
      ...q,
      examIndex: idx + 1
    }));
  }

  // Khởi động bài thi mới
  function startNewExam(studentId, studentName, examCode) {
    if (appState.timerInterval) {
      clearInterval(appState.timerInterval);
    }

    appState.studentId = studentId || 'DTBK001';
    appState.studentName = studentName || 'Điện toán Bách Khoa 001';
    appState.examCode = examCode || '20261004';
    appState.questions = generateExamQuestions();
    appState.userAnswers = {};
    appState.flaggedQuestions = {};
    appState.remainingSeconds = EXAM_DURATION_SECONDS;
    appState.currentQuestionIndex = 0;
    appState.view = 'exam';
    appState.submitTimeStr = '';
    appState.score = 0;
    appState.correctCount = 0;

    startTimer();
    saveExamState();
    renderApp();
  }

  // Bắt đầu đếm ngược thời gian
  function startTimer() {
    if (appState.timerInterval) clearInterval(appState.timerInterval);

    appState.timerInterval = setInterval(() => {
      if (appState.remainingSeconds > 0) {
        appState.remainingSeconds--;
        updateTimerDisplay();
        if (appState.remainingSeconds % 5 === 0) {
          saveExamState();
        }
      } else {
        clearInterval(appState.timerInterval);
        alert('Đã hết thời gian làm bài 30 phút! Hệ thống đang tự động nộp bài thi của bạn.');
        finishAndSubmitExam();
      }
    }, 1000);
  }

  // Định dạng thời gian hh : mm : ss (như trong ảnh 00 : 29 : 42)
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }

  function updateTimerDisplay() {
    const formatted = formatTime(appState.remainingSeconds);
    const isDanger = appState.remainingSeconds <= 300;
    const timerEls = document.querySelectorAll('.timer-display, #timer-text, #mobile-timer-badge');
    timerEls.forEach(timerEl => {
      timerEl.textContent = formatted;
      if (isDanger) {
        timerEl.classList.add('timer-danger');
      } else {
        timerEl.classList.remove('timer-danger');
      }
    });
  }

  // Nộp bài thi và chấm điểm
  function finishAndSubmitExam() {
    if (appState.timerInterval) {
      clearInterval(appState.timerInterval);
    }

    let correct = 0;
    appState.questions.forEach((q, idx) => {
      const userPick = appState.userAnswers[idx];
      if (userPick !== undefined && userPick === q.answer) {
        correct++;
      }
    });

    appState.correctCount = correct;
    appState.wrongCount = appState.questions.length - correct;
    // Thang điểm 10 (Ví dụ: 7/30 câu đúng = 2.33 điểm)
    appState.score = Number(((correct / appState.questions.length) * 10).toFixed(2));

    const now = new Date();
    const dStr = String(now.getDate()).padStart(2, '0') + '/' +
                 String(now.getMonth() + 1).padStart(2, '0') + '/' +
                 now.getFullYear();
    const tStr = now.toLocaleTimeString('en-US', { hour12: true });
    appState.submitTimeStr = `${dStr} ${tStr}`;

    appState.view = 'result_summary';
    saveExamState();
    renderApp();
  }

  // Lưu trạng thái vào localStorage để chống mất bài thi khi F5
  function saveExamState() {
    try {
      const dataToSave = {
        view: appState.view,
        examCode: appState.examCode,
        studentId: appState.studentId,
        studentName: appState.studentName,
        fontSize: appState.fontSize,
        questions: appState.questions,
        userAnswers: appState.userAnswers,
        flaggedQuestions: appState.flaggedQuestions,
        remainingSeconds: appState.remainingSeconds,
        submitTimeStr: appState.submitTimeStr,
        currentQuestionIndex: appState.currentQuestionIndex,
        score: appState.score,
        correctCount: appState.correctCount,
        wrongCount: appState.wrongCount
      };
      localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Lỗi lưu trạng thái:', e);
    }
  }

  // Khôi phục trạng thái bài thi khi tải lại trang
  function restoreExamState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.questions && data.questions.length === TOTAL_EXAM_QUESTIONS) {
          Object.assign(appState, data);
          
          // Đồng bộ lại imageUrl chuẩn cục bộ từ ngân hàng câu hỏi mới nhất
          const currentBank = getQuestionBank();
          appState.questions.forEach((q) => {
            const freshQ = currentBank.find(b => b.id === q.id);
            if (freshQ && freshQ.imageUrl) {
              q.imageUrl = freshQ.imageUrl;
            }
          });

          if (appState.view === 'exam') {
            if (appState.remainingSeconds > 0) {
              startTimer();
            } else {
              finishAndSubmitExam();
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Lỗi khôi phục trạng thái:', e);
    }
    return false;
  }

  // Điều hướng câu hỏi
  function goToQuestion(idx) {
    if (idx >= 0 && idx < appState.questions.length) {
      appState.currentQuestionIndex = idx;
      if (appState.view === 'result_summary') {
        appState.view = 'review';
      }
      renderApp();

      // Trên điện thoại di động, tự động cuộn lên đầu câu hỏi khi bấm chọn câu từ bảng bên dưới
      if (window.innerWidth <= 768) {
        const qBox = document.getElementById('question-box');
        if (qBox) {
          qBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }

  // Chọn đáp án
  function selectOption(optIndex) {
    if (appState.view !== 'exam') return;
    appState.userAnswers[appState.currentQuestionIndex] = optIndex;
    saveExamState();
    renderQuestionGrid();
    renderOptionsBox();
  }

  // Bật/tắt cờ đánh dấu
  function toggleFlag() {
    const curr = appState.currentQuestionIndex;
    appState.flaggedQuestions[curr] = !appState.flaggedQuestions[curr];
    saveExamState();
    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
  }

  // Thay đổi cỡ chữ
  function changeFontSize(newSize) {
    const sz = Math.min(28, Math.max(12, parseInt(newSize, 10) || 15));
    appState.fontSize = sz;
    document.documentElement.style.setProperty('--font-base', sz + 'px');
    const input = document.getElementById('font-size-input');
    if (input) input.value = sz;
    saveExamState();
  }

  // ==========================================================================
  // RENDER GIAO DIỆN CHÍNH
  // ==========================================================================
  function renderApp() {
    document.documentElement.style.setProperty('--font-base', appState.fontSize + 'px');

    if (appState.view === 'start') {
      renderStartModal(true);
      return;
    }

    renderStartModal(false);
    renderHeaderInfo();
    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
    renderFooterButtons();
    updateTimerDisplay();
  }

  // Render thông tin trên Header
  function renderHeaderInfo() {
    const examCodeEl = document.getElementById('header-exam-code');
    const studentInfoEl = document.getElementById('header-student-info');
    if (examCodeEl) examCodeEl.textContent = `Mã đợt thi: ${appState.examCode}`;
    if (studentInfoEl) studentInfoEl.textContent = `Thí sinh: ${appState.studentId} - ${appState.studentName}`;
  }

  // Render cụm điều khiển trên Header: Câu x, Đặt cờ, Kích thước chữ
  function renderHeaderControls() {
    const controlsContainer = document.getElementById('header-controls-container');
    if (!controlsContainer) return;

    if (appState.view === 'result_summary') {
      controlsContainer.innerHTML = `
        <div class="left-ctrls">
          <div class="font-size-control">
            <span>Kích thước chữ:</span>
            <input type="number" id="font-size-input" class="font-size-input" min="12" max="28" value="${appState.fontSize}">
          </div>
        </div>
      `;
      const input = document.getElementById('font-size-input');
      if (input) input.addEventListener('change', (e) => changeFontSize(e.target.value));
      return;
    }

    const currIdx = appState.currentQuestionIndex;
    const isFlagged = !!appState.flaggedQuestions[currIdx];

    controlsContainer.innerHTML = `
      <div class="left-ctrls">
        <span class="current-q-label">Câu ${currIdx + 1}</span>
        <button id="btn-toggle-flag" class="btn-flag ${isFlagged ? 'active' : ''}">
          <span>🚩</span>
          <span>${isFlagged ? 'Bỏ cờ' : 'Đặt cờ'}</span>
        </button>
        <div class="font-size-control">
          <span>Kích thước chữ:</span>
          <input type="number" id="font-size-input" class="font-size-input" min="12" max="28" value="${appState.fontSize}">
        </div>
      </div>
    `;

    const flagBtn = document.getElementById('btn-toggle-flag');
    if (flagBtn) flagBtn.addEventListener('click', toggleFlag);

    const input = document.getElementById('font-size-input');
    if (input) input.addEventListener('change', (e) => changeFontSize(e.target.value));
  }

  // Render lưới 30 câu hỏi bên cột trái
  function renderQuestionGrid() {
    const gridEl = document.getElementById('questions-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const isReview = (appState.view === 'result_summary' || appState.view === 'review');

    appState.questions.forEach((q, idx) => {
      const cell = document.createElement('button');
      cell.className = 'q-cell';
      cell.textContent = idx + 1;

      if (!isReview) {
        // Trong khi thi
        if (idx === appState.currentQuestionIndex) {
          cell.classList.add('current');
        }
        if (appState.userAnswers[idx] !== undefined) {
          cell.classList.add('answered');
        }
        if (appState.flaggedQuestions[idx]) {
          cell.classList.add('flagged');
        }
      } else {
        // Xem lại sau khi nộp bài (Screenshot 2: Đúng màu xanh lá, Sai màu đỏ)
        const userPick = appState.userAnswers[idx];
        const isCorrect = (userPick !== undefined && userPick === q.answer);

        if (isCorrect) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('wrong');
        }

        if (appState.view === 'review' && idx === appState.currentQuestionIndex) {
          cell.classList.add('current');
        }
      }

      cell.addEventListener('click', () => goToQuestion(idx));
      gridEl.appendChild(cell);
    });
  }

  // Render nội dung chính: Khung câu hỏi & Khung đáp án
  function renderMainWorkspace() {
    const qBox = document.getElementById('question-box');
    const optBox = document.getElementById('options-box');
    if (!qBox || !optBox) return;

    // Trường hợp hiển thị bảng tổng kết kết quả
    if (appState.view === 'result_summary') {
      const totalQ = appState.questions.length || 30;
      const correct = appState.correctCount || 0;
      const wrong = appState.wrongCount !== undefined ? appState.wrongCount : (totalQ - correct);

      qBox.innerHTML = `
        <div class="result-summary-pane">
          <div><strong>Số câu đúng:</strong> <span style="font-weight:700; color:#2e7d32;">${correct}/${totalQ}</span></div>
          <div><strong>Số câu sai:</strong> <span style="font-weight:700; color:#d32f2f;">${wrong}/${totalQ}</span></div>
          <div class="result-highlight-score" style="margin: 4px 0;">Tổng số điểm: ${appState.score}</div>
          <div class="result-line-divider">---------</div>
          <div><strong>Mã thí sinh:</strong> ${appState.studentId}</div>
          <div><strong>Tên thí sinh:</strong> ${appState.studentName}</div>
          <div><strong>Giờ nộp bài:</strong> ${appState.submitTimeStr}</div>
        </div>
      `;
      optBox.innerHTML = `
        <div style="color: #607d8b; font-style: italic; padding: 20px 0;">
          💡 Bạn có thể bấm vào từng số câu bên trái (màu xanh là đúng, màu đỏ là sai) để xem chi tiết câu hỏi và đáp án đúng.
        </div>
      `;
      return;
    }

    // Trường hợp đang thi (exam) hoặc đang xem lại câu hỏi (review)
    const currentQ = appState.questions[appState.currentQuestionIndex];
    if (!currentQ) return;

    // Render nội dung câu hỏi
    const isFlagged = !!appState.flaggedQuestions[appState.currentQuestionIndex];
    let qHtml = `<div>
      ${isFlagged ? '<span class="q-flag-tag">🚩 ĐÃ ĐẶT CỜ</span>' : ''}
      <strong>Câu ${appState.currentQuestionIndex + 1}:</strong> ${escapeHtml(currentQ.question)}
    </div>`;
    if (currentQ.imageUrl) {
      qHtml += `
        <div style="margin-top: 12px; text-align: center;">
          <img src="${currentQ.imageUrl}" alt="Hình minh họa" style="max-width: 95%; max-height: 250px; border: 1px solid #b0bec5; border-radius: 4px; background: #ffffff; padding: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" onerror="this.parentElement.style.display='none'">
        </div>
      `;
    }
    qBox.innerHTML = qHtml;

    // Render danh sách lựa chọn
    renderOptionsBox();
  }

  // Render 4 đáp án A, B, C, D
  function renderOptionsBox() {
    const optBox = document.getElementById('options-box');
    if (!optBox) return;

    const currentQ = appState.questions[appState.currentQuestionIndex];
    if (!currentQ) return;

    const isReview = (appState.view === 'review');
    const userPick = appState.userAnswers[appState.currentQuestionIndex];
    const isCorrect = (userPick !== undefined && userPick === currentQ.answer);

    let html = '';

    currentQ.options.forEach((optText, optIdx) => {
      const isChecked = (userPick === optIdx);
      let itemClass = 'option-item';

      if (isReview) {
        if (optIdx === currentQ.answer) {
          itemClass += ' correct-answer-item'; // Luôn tô xanh đáp án đúng
        } else if (isChecked && !isCorrect) {
          itemClass += ' user-selected-wrong'; // Tô đỏ nếu thí sinh chọn sai
        }
      }

      html += `
        <label class="${itemClass}">
          <input type="radio" name="exam_option" class="option-radio" value="${optIdx}" 
            ${isChecked ? 'checked' : ''} 
            ${isReview ? 'disabled' : ''}>
          <span class="option-label">${escapeHtml(optText)}</span>
          ${isReview && isChecked && !isCorrect ? '<span style="color:#d32f2f; font-weight:bold; margin-left:8px;">(Bạn đã chọn)</span>' : ''}
          ${isReview && optIdx === currentQ.answer ? '<span style="color:#2e7d32; font-weight:bold; margin-left:8px;">✔ (Đáp án đúng)</span>' : ''}
        </label>
      `;
    });

    // Khi làm sai: Hiển thị câu trả lời đúng phía dưới như hình người dùng yêu cầu!
    if (isReview && !isCorrect) {
      const correctOptText = currentQ.options[currentQ.answer] || '';
      html += `
        <div class="correct-answer-banner">
          <div>✔ Câu trả lời đúng: ${escapeHtml(correctOptText)}</div>
          ${currentQ.explanation ? `<div class="explanation-text">${escapeHtml(currentQ.explanation)}</div>` : ''}
        </div>
      `;
    }

    optBox.innerHTML = html;

    // Gắn sự kiện chọn đáp án khi đang thi
    if (!isReview) {
      const radios = optBox.querySelectorAll('.option-radio');
      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          selectOption(parseInt(e.target.value, 10));
        });
      });
    }
  }

  // Render các nút hành động ở cột trái và thanh điều hướng dưới
  function renderFooterButtons() {
    const submitBtn = document.getElementById('btn-submit-exam');
    const exitBtn = document.getElementById('btn-exit-app');
    const navBar = document.getElementById('bottom-nav-bar');
    if (!navBar) return;

    const isExam = (appState.view === 'exam');
    const isReview = (appState.view === 'review' || appState.view === 'result_summary');

    // Nút bên cột trái
    if (submitBtn) {
      submitBtn.style.display = isExam ? 'block' : 'none';
    }
    if (exitBtn) {
      exitBtn.style.display = isReview ? 'block' : 'none';
    }

    // Nút điều hướng dưới cùng
    const currIdx = appState.currentQuestionIndex;
    const isFirst = (currIdx === 0);
    const isLast = (currIdx === appState.questions.length - 1);

    if (isExam) {
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>Câu trước</button>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu tiếp theo</button>
      `;
    } else {
      // Chế độ xem lại (Screenshot 2: Dừng xem lại, Làm lại bài, Câu trước, Câu tiếp theo)
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>Câu trước</button>
        <div class="nav-center-buttons">
          <button id="btn-stop-review" class="btn-action-center btn-stop-review">Dừng xem lại</button>
          <button id="btn-retake-exam" class="btn-action-center btn-retake">Làm lại bài</button>
        </div>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu tiếp theo</button>
      `;

      const stopBtn = document.getElementById('btn-stop-review');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          appState.view = 'result_summary';
          renderApp();
        });
      }

      const retakeBtn = document.getElementById('btn-retake-exam');
      if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
          if (confirm('Bạn có muốn tạo đề thi mới gồm 30 câu ngẫu nhiên khác để làm lại không?')) {
            startNewExam(appState.studentId, appState.studentName, appState.examCode);
          }
        });
      }
    }

    const prevBtn = document.getElementById('btn-prev-q');
    const nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.addEventListener('click', () => goToQuestion(currIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToQuestion(currIdx + 1));
  }

  // Modal Đăng nhập / Bắt đầu làm bài
  function renderStartModal(show) {
    let modal = document.getElementById('start-exam-modal');
    if (!show) {
      if (modal) modal.style.display = 'none';
      return;
    }

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'start-exam-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    // Tự động tạo mã đợt thi theo ngày hôm nay (YYYYMMDD) và mã ngẫu nhiên cho thí sinh
    const today = new Date();
    const todayExamCode = today.getFullYear().toString() + 
      String(today.getMonth() + 1).padStart(2, '0') + 
      String(today.getDate()).padStart(2, '0');
    const randomId = 'DTBK' + String(Math.floor(100 + Math.random() * 900));

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 380px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); background: #ffffff;">
        <div class="modal-header" style="background: linear-gradient(135deg, #0288d1, #01579b); color: #fff; padding: 12px 16px; text-align: center; justify-content: center;">
          <h4 style="margin: 0; font-size: 15px; font-weight: 800; text-transform: uppercase;">
            KỲ THI ỨNG DỤNG CNTT - ĐH BÁCH KHOA
          </h4>
        </div>
        
        <div class="modal-body" style="padding: 16px 18px;">
          <!-- User và Password điền sẵn mặc định -->
          <div style="margin-bottom: 10px;">
            <label style="font-weight: 600; font-size: 13px; color: #37474f; display: block; margin-bottom: 4px;">Tên đăng nhập / Thí sinh:</label>
            <input type="text" id="input-username" value="sinhvien" style="width: 100%; padding: 8px 12px; border: 1.5px solid #90caf9; border-radius: 6px; font-size: 14px; font-weight: 600; color: #01579b; background: #f0f7ff;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="font-weight: 600; font-size: 13px; color: #37474f; display: block; margin-bottom: 4px;">Mật khẩu:</label>
            <input type="text" id="input-password" value="123456" style="width: 100%; padding: 8px 12px; border: 1.5px solid #90caf9; border-radius: 6px; font-size: 14px; font-weight: 600; color: #01579b; background: #f0f7ff;">
          </div>

          <!-- 2 Nút chính: Bắt đầu thi & Ôn thi -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="btn-start-now" style="background: linear-gradient(180deg, #29b6f6 0%, #0288d1 100%); color: #ffffff; border: none; padding: 12px; border-radius: 6px; font-weight: 800; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(2, 136, 209, 0.3); touch-action: manipulation;">
              <span>🎯</span>
              <span>BẮT ĐẦU THI (30 PHÚT)</span>
            </button>

            <a href="practice.html" style="background: #e8f5e9; color: #1b5e20; border: 1.5px solid #81c784; padding: 11px; border-radius: 6px; font-weight: 800; font-size: 14.5px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; touch-action: manipulation;">
              <span>📚</span>
              <span>ÔN THI TỪNG MODULE (50 CÂU)</span>
            </a>
          </div>
        </div>

        <div class="modal-footer" style="padding: 8px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; justify-content: center;">
          <a href="admin.html" style="font-size: 12px; color: #64748b; text-decoration: none;">🔒 Dành cho Giảng viên quản trị (Admin)</a>
        </div>
      </div>
    `;

    document.getElementById('btn-start-now').addEventListener('click', () => {
      const uInput = document.getElementById('input-username');
      const username = (uInput && uInput.value.trim()) ? uInput.value.trim() : 'sinhvien';
      startNewExam(username, `Thí sinh ${username}`, todayExamCode);
    });
  }

  // Tiện ích escape ký tự HTML để bảo mật an toàn XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Khởi tạo các sự kiện toàn cục khi trang nạp xong
  function initApp() {
    // Gắn sự kiện nút Nộp bài
    const submitBtn = document.getElementById('btn-submit-exam');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const answeredCount = Object.keys(appState.userAnswers).length;
        const total = appState.questions.length;
        const unAnswered = total - answeredCount;
        let msg = `Bạn đã làm được ${answeredCount}/${total} câu hỏi.`;
        if (unAnswered > 0) {
          msg += `\nCòn lại ${unAnswered} câu chưa trả lời.`;
        }
        msg += '\n\nBạn có chắc chắn muốn KẾT THÚC VÀ NỘP BÀI ngay bây giờ không?';
        if (confirm(msg)) {
          finishAndSubmitExam();
        }
      });
    }

    // Gắn sự kiện nút Thoát chương trình
    const exitBtn = document.getElementById('btn-exit-app');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (confirm('Bạn có muốn thoát khỏi bài thi này và quay về màn hình chính?')) {
          localStorage.removeItem(STORAGE_KEY_EXAM);
          appState.view = 'start';
          renderApp();
        }
      });
    }

    // Khôi phục bài thi nếu đang làm dở
    const hasRestored = restoreExamState();
    if (!hasRestored) {
      appState.view = 'start';
    }
    renderApp();
  }

  // Chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Expose API cho Admin/Helper
  window.BK_EXAM = {
    getState: () => appState,
    startNewExam: startNewExam,
    finishAndSubmitExam: finishAndSubmitExam,
    setQuestions: (qList) => {
      appState.questions = qList;
      saveExamState();
      renderApp();
    }
  };

})();
