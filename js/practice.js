/**
 * Hệ thống Ôn tập từng Module (50 câu hỏi / Module - Không giới hạn thời gian)
 * - Màn hình tổng quát chọn chủ đề trước khi thi
 * - Khi đổi sang chủ đề khác: Bắt buộc kết thúc chủ đề hiện tại
 * Kế thừa chuẩn xác giao diện thi Đại học Bách Khoa
 */

(function () {
  'use strict';

  const STORAGE_KEY_CUSTOM_BANK = 'BK_CUSTOM_QUESTION_BANK';
  const STORAGE_KEY_PREFIX = 'BK_PRACTICE_STATE_MOD_';

  const MODULES_INFO = {
    1: {
      code: 'IU01',
      title: 'Module 1: Kiến thức CNTT Cơ bản',
      icon: '📘',
      desc: 'Hiểu biết căn bản về máy tính, phần cứng, phần mềm, mạng máy tính, an toàn thông tin và ứng dụng CNTT.'
    },
    2: {
      code: 'IU02',
      title: 'Module 2: Sử dụng máy tính cơ bản',
      icon: '💻',
      desc: 'Hệ điều hành Windows, quản lý tệp và thư mục, cài đặt phần mềm, phím tắt và các thiết lập cơ bản.'
    },
    3: {
      code: 'IU06',
      title: 'Module 3: Sử dụng Internet cơ bản',
      icon: '🌐',
      desc: 'Trình duyệt web, tìm kiếm thông tin, thư điện tử Email, an toàn mạng và dịch vụ đám mây.'
    },
    4: {
      code: 'IU03',
      title: 'Module 4: Xử lý văn bản (MS Word)',
      icon: '📝',
      desc: 'Định dạng văn bản, chèn bảng biểu, hình ảnh, trộn thư (Mail Merge), ngắt trang và in ấn trong Word.'
    },
    5: {
      code: 'IU04',
      title: 'Module 5: Bảng tính (MS Excel)',
      icon: '📊',
      desc: 'Thao tác bảng tính, các hàm tính toán SUM, AVERAGE, IF, VLOOKUP, HLOOKUP, biểu đồ và định dạng số.'
    },
    6: {
      code: 'IU05',
      title: 'Module 6: Trình chiếu (MS PowerPoint)',
      icon: '📽️',
      desc: 'Thiết kế slide, chèn âm thanh, hình ảnh, hiệu ứng Animation, hiệu ứng chuyển trang Transition.'
    }
  };

  // Trạng thái ôn tập
  let state = {
    activeScreen: 'overview', // 'overview' hoặc 'workspace'
    currentModule: null, // 1..6
    view: 'study', // 'study', 'result_summary', 'review'
    fontSize: 15,
    questions: [], // 50 câu của module
    userAnswers: {},
    flaggedQuestions: {},
    instantMode: false, // Xem đáp án ngay khi chọn
    currentQuestionIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0
  };

  // Lấy ngân hàng câu hỏi
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

  // Lấy 50 câu hỏi theo đúng Module
  function loadQuestionsForModule(modNumber) {
    const bank = getQuestionBank();
    const modQuestions = bank.filter(q => Number(q.module) === Number(modNumber));

    // Đánh số thứ tự từ 1 đến hết (50 câu)
    return modQuestions.map((q, idx) => ({
      ...q,
      examIndex: idx + 1
    }));
  }

  // Đọc trạng thái đã lưu của một module (để hiển thị trên Dashboard)
  function getModuleSavedData(modNumber) {
    try {
      const key = STORAGE_KEY_PREFIX + modNumber;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu module:', e);
    }
    return null;
  }

  // ==========================================================================
  // VIEW 1: RENDER TRANG TỔNG QUÁT CHỌN CHỦ ĐỀ
  // ==========================================================================
  function showOverviewScreen() {
    state.activeScreen = 'overview';
    const overviewEl = document.getElementById('practice-overview-view');
    const workspaceEl = document.getElementById('practice-workspace-view');

    if (overviewEl) overviewEl.style.display = 'flex';
    if (workspaceEl) workspaceEl.style.display = 'none';

    window.scrollTo(0, 0);
    renderOverviewCards();
  }

  function renderOverviewCards() {
    const container = document.getElementById('topics-grid-container');
    if (!container) return;
    container.innerHTML = '';

    for (let m = 1; m <= 6; m++) {
      const info = MODULES_INFO[m];
      const savedData = getModuleSavedData(m);

      const card = document.createElement('div');
      card.className = 'topic-card';

      let statusHtml = '';
      let actionsHtml = '';

      if (savedData && (savedData.view === 'result_summary' || savedData.view === 'review')) {
        // Đã hoàn thành và nộp bài
        card.classList.add('completed');
        const correct = savedData.correctCount || 0;
        const total = savedData.questions ? savedData.questions.length : 50;
        const score = savedData.score !== undefined ? savedData.score : 0;

        statusHtml = `
          <div class="topic-status-box" style="background:#e8f5e9; border-color:#c8e6c9;">
            <span style="color:#2e7d32; font-weight:700;">✔ Đã nộp bài: ${correct}/${total} câu đúng</span>
            <span style="color:#d32f2f; font-weight:800; font-size:14px;">Điểm: ${score}</span>
          </div>
        `;
        actionsHtml = `
          <div class="topic-actions">
            <button class="btn-review-topic" data-mod="${m}">👁️ Xem lại</button>
            <button class="btn-start-topic" data-mod="${m}" data-retake="true">🔄 Làm lại 50 câu</button>
          </div>
        `;
      } else if (savedData && savedData.userAnswers && Object.keys(savedData.userAnswers).length > 0) {
        // Đang làm dở
        const answered = Object.keys(savedData.userAnswers).length;
        const total = savedData.questions ? savedData.questions.length : 50;

        statusHtml = `
          <div class="topic-status-box" style="background:#fff8e1; border-color:#ffe082;">
            <span style="color:#f57f17; font-weight:700;">⏳ Đang làm dở: ${answered}/${total} câu</span>
            <span style="color:#616161;">Tự do giờ</span>
          </div>
        `;
        actionsHtml = `
          <div class="topic-actions">
            <button class="btn-review-topic" data-mod="${m}" data-retake="true" style="color:#b71c1c; background:#ffebee; border-color:#ffcdd2;">🔄 Làm lại</button>
            <button class="btn-start-topic" data-mod="${m}">▶ Tiếp tục làm</button>
          </div>
        `;
      } else {
        // Chưa làm
        statusHtml = `
          <div class="topic-status-box">
            <span style="color:#607d8b; font-weight:600;">Chưa làm bài</span>
            <span style="color:#0288d1; font-weight:700;">50 câu hỏi</span>
          </div>
        `;
        actionsHtml = `
          <div class="topic-actions">
            <button class="btn-start-topic" data-mod="${m}">▶ Bắt đầu học (50 câu)</button>
          </div>
        `;
      }

      card.innerHTML = `
        <div>
          <div class="topic-header">
            <div class="topic-icon">${info.icon}</div>
            <div class="topic-info">
              <h3>${info.title}</h3>
              <span class="topic-code">${info.code}</span>
            </div>
          </div>
          <div class="topic-desc">${info.desc}</div>
        </div>
        <div>
          ${statusHtml}
          ${actionsHtml}
        </div>
      `;

      container.appendChild(card);
    }

    // Gắn sự kiện cho các nút trên thẻ
    container.querySelectorAll('.btn-start-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mod = Number(btn.getAttribute('data-mod'));
        const isRetake = btn.getAttribute('data-retake') === 'true';
        startTopicWorkspace(mod, isRetake);
      });
    });

    container.querySelectorAll('.btn-review-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mod = Number(btn.getAttribute('data-mod'));
        const isRetake = btn.getAttribute('data-retake') === 'true';
        if (isRetake) {
          if (confirm(`Bạn có muốn làm lại từ đầu 50 câu của ${MODULES_INFO[mod].title}?`)) {
            startTopicWorkspace(mod, true);
          }
        } else {
          startTopicWorkspace(mod, false, true); // Chế độ xem lại
        }
      });
    });
  }

  // ==========================================================================
  // VIEW 2: KHỞI ĐỘNG VÀ LÀM BÀI 50 CÂU CỦA CHỦ ĐỀ ĐÃ CHỌN
  // ==========================================================================
  function startTopicWorkspace(modNumber, forceReset = false, openInReview = false) {
    state.activeScreen = 'workspace';
    state.currentModule = Number(modNumber);

    const overviewEl = document.getElementById('practice-overview-view');
    const workspaceEl = document.getElementById('practice-workspace-view');

    if (overviewEl) overviewEl.style.display = 'none';
    if (workspaceEl) workspaceEl.style.display = 'flex';

    let restored = false;
    if (!forceReset) {
      restored = restoreModuleState(state.currentModule);
    }

    if (!restored || forceReset) {
      state.questions = loadQuestionsForModule(state.currentModule);
      state.userAnswers = {};
      state.flaggedQuestions = {};
      state.view = 'study';
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.correctCount = 0;
      state.wrongCount = 0;
      saveModuleState();
    }

    if (openInReview) {
      state.view = 'result_summary';
    }

    // Cập nhật tiêu đề chủ đề trên header
    const titleEl = document.getElementById('workspace-module-title');
    if (titleEl) {
      const info = MODULES_INFO[state.currentModule];
      titleEl.innerHTML = `${info.icon} ${info.title}`;
    }

    // Cập nhật tiêu đề bảng câu hỏi bên sidebar
    const headingEl = document.getElementById('sidebar-heading-text');
    if (headingEl) {
      headingEl.textContent = `📋 Bảng ${state.questions.length} câu hỏi ${MODULES_INFO[state.currentModule].code}:`;
    }

    window.scrollTo(0, 0);
    renderWorkspace();
  }

  // Lưu trạng thái học của module vào localStorage
  function saveModuleState() {
    if (!state.currentModule) return;
    try {
      const key = STORAGE_KEY_PREFIX + state.currentModule;
      const data = {
        currentModule: state.currentModule,
        view: state.view,
        fontSize: state.fontSize,
        questions: state.questions,
        userAnswers: state.userAnswers,
        flaggedQuestions: state.flaggedQuestions,
        instantMode: state.instantMode,
        currentQuestionIndex: state.currentQuestionIndex,
        score: state.score,
        correctCount: state.correctCount,
        wrongCount: state.wrongCount
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Lỗi lưu trạng thái ôn tập:', e);
    }
  }

  // Khôi phục trạng thái học
  function restoreModuleState(modNumber) {
    try {
      const key = STORAGE_KEY_PREFIX + modNumber;
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.questions && data.questions.length > 0) {
          Object.assign(state, data);

          // Đồng bộ lại ảnh chuẩn từ ngân hàng mới nhất
          const bank = getQuestionBank();
          state.questions.forEach(q => {
            const fresh = bank.find(b => b.id === q.id);
            if (fresh && fresh.imageUrl) q.imageUrl = fresh.imageUrl;
          });
          return true;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc trạng thái ôn tập:', e);
    }
    return false;
  }

  // ==========================================================================
  // XỬ LÝ QUY TẮC: "KHI ĐỔI SANG CHỦ ĐỀ KHÁC THÌ PHẢI KẾT THÚC CHỦ ĐỀ ĐÓ"
  // ==========================================================================
  function requestExitCurrentTopic() {
    if (state.activeScreen !== 'workspace' || !state.currentModule) {
      showOverviewScreen();
      return;
    }

    const modInfo = MODULES_INFO[state.currentModule];
    const answeredCount = Object.keys(state.userAnswers).length;
    const total = state.questions.length;

    // Nếu đang ở màn hình kết quả / xem lại sau khi đã nộp bài: Cho phép quay về trực tiếp
    if (state.view === 'result_summary' || state.view === 'review') {
      saveModuleState();
      showOverviewScreen();
      return;
    }

    // Nếu đang làm bài dở dang: BẮT BUỘC KẾT THÚC CHỦ ĐỀ ĐÓ
    let confirmMsg = `⚠️ BẠN ĐANG LÀM CHỦ ĐỀ: ${modInfo.title}\n(Đã hoàn thành ${answeredCount}/${total} câu).\n\n`;
    confirmMsg += `Theo quy chế: Để đổi sang chủ đề khác, bạn cần KẾT THÚC chủ đề hiện tại.\n\n`;
    confirmMsg += `• Bấm [OK] để KẾT THÚC & NỘP BÀI chủ đề này, lưu kết quả và quay về chọn chủ đề mới.\n`;
    confirmMsg += `• Bấm [Cancel] để tiếp tục làm bài chủ đề này.`;

    if (confirm(confirmMsg)) {
      // Tự động kết thúc và chấm điểm chủ đề hiện tại
      finishAndSubmit(true); // true = sau khi nộp thì quay về overview
    }
  }

  // Nộp bài và chấm điểm
  function finishAndSubmit(returnToOverview = false) {
    let correct = 0;
    state.questions.forEach((q, idx) => {
      const userPick = state.userAnswers[idx];
      if (userPick !== undefined && userPick === q.answer) {
        correct++;
      }
    });

    state.correctCount = correct;
    state.wrongCount = state.questions.length - correct;
    state.score = Number(((correct / state.questions.length) * 10).toFixed(2));
    state.view = 'result_summary';
    saveModuleState();

    if (returnToOverview) {
      showOverviewScreen();
    } else {
      renderWorkspace();
    }
  }

  // Chuyển câu hỏi
  function goToQuestion(idx) {
    if (idx >= 0 && idx < state.questions.length) {
      state.currentQuestionIndex = idx;
      if (state.view === 'result_summary') {
        state.view = 'review';
      }
      renderWorkspace();

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
    if (state.view === 'result_summary') return;
    if (state.view === 'review' && !state.instantMode) return;

    state.userAnswers[state.currentQuestionIndex] = optIndex;
    saveModuleState();
    renderQuestionGrid();
    renderOptionsBox();
  }

  // Bật/tắt cờ
  function toggleFlag() {
    const curr = state.currentQuestionIndex;
    state.flaggedQuestions[curr] = !state.flaggedQuestions[curr];
    saveModuleState();
    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
  }

  // Thay đổi cỡ chữ
  function changeFontSize(newSize) {
    const sz = Math.min(28, Math.max(12, parseInt(newSize, 10) || 15));
    state.fontSize = sz;
    document.documentElement.style.setProperty('--font-base', sz + 'px');
    const input = document.getElementById('font-size-input');
    if (input) input.value = sz;
    saveModuleState();
  }

  // ==========================================================================
  // RENDER WORKSPACE LÀM BÀI 50 CÂU
  // ==========================================================================
  function renderWorkspace() {
    document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');

    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
    renderFooterButtons();

    // Checkbox chế độ xem ngay
    const instantChk = document.getElementById('chk-instant-mode');
    if (instantChk) {
      instantChk.checked = !!state.instantMode;
    }
  }

  // Render thanh điều khiển trên Header
  function renderHeaderControls() {
    const container = document.getElementById('header-controls-container');
    if (!container) return;

    if (state.view === 'result_summary') {
      container.innerHTML = '';
      return;
    }

    const currIdx = state.currentQuestionIndex;
    const isFlagged = !!state.flaggedQuestions[currIdx];

    container.innerHTML = `
      <span class="current-q-badge">Câu ${currIdx + 1}/${state.questions.length}</span>
      <button id="btn-toggle-flag" class="btn-flag ${isFlagged ? 'active' : ''}" title="${isFlagged ? 'Bỏ cờ đánh dấu câu này' : 'Đặt cờ đánh dấu câu này'}">
        <span>🚩</span>
        <span>${isFlagged ? 'Bỏ cờ' : 'Đặt cờ'}</span>
      </button>
    `;

    const flagBtn = document.getElementById('btn-toggle-flag');
    if (flagBtn) flagBtn.addEventListener('click', toggleFlag);
  }

  // Render lưới 50 câu hỏi bên trái
  function renderQuestionGrid() {
    const gridEl = document.getElementById('questions-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const isGraded = (state.view === 'result_summary' || state.view === 'review');

    state.questions.forEach((q, idx) => {
      const cell = document.createElement('button');
      cell.className = 'q-cell';
      cell.textContent = idx + 1;

      const userPick = state.userAnswers[idx];
      const hasAnswered = (userPick !== undefined);

      if (isGraded) {
        // Chế độ đã nộp bài: đúng xanh lá, sai đỏ
        const isCorrect = (hasAnswered && userPick === q.answer);
        if (isCorrect) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('wrong');
        }
      } else if (state.instantMode && hasAnswered) {
        // Chế độ xem đáp án ngay
        const isCorrect = (userPick === q.answer);
        if (isCorrect) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('wrong');
        }
      } else {
        // Chế độ làm bài thông thường
        if (hasAnswered) {
          cell.classList.add('answered');
        }
      }

      if (state.flaggedQuestions[idx]) {
        cell.classList.add('flagged');
      }

      if (idx === state.currentQuestionIndex) {
        cell.classList.add('current');
      }

      cell.addEventListener('click', () => goToQuestion(idx));
      gridEl.appendChild(cell);
    });
  }

  // Render nội dung chính
  function renderMainWorkspace() {
    const qBox = document.getElementById('question-box');
    const optBox = document.getElementById('options-box');
    if (!qBox || !optBox) return;

    // Trường hợp hiển thị bảng tổng kết kết quả
    if (state.view === 'result_summary') {
      const totalQ = state.questions.length;
      qBox.innerHTML = `
        <div class="result-summary-pane">
          <div><strong>Số câu đúng:</strong> <span style="font-weight:700; color:#2e7d32;">${state.correctCount}/${totalQ}</span></div>
          <div><strong>Số câu sai:</strong> <span style="font-weight:700; color:#d32f2f;">${state.wrongCount}/${totalQ}</span></div>
          <div class="result-highlight-score" style="margin: 4px 0;">Tổng số điểm: ${state.score}</div>
          <div class="result-line-divider">---------</div>
          <div><strong>Chuyên đề hoàn thành:</strong> ${MODULES_INFO[state.currentModule].title}</div>
          <div><strong>Chế độ:</strong> Tự do - Không giới hạn thời gian</div>
          <div><strong>Tổng số câu hỏi:</strong> ${totalQ} câu</div>
        </div>
      `;
      optBox.innerHTML = `
        <div style="color: #607d8b; font-style: italic; padding: 20px 0;">
          💡 Bạn có thể bấm vào từng số câu bên trái (màu xanh là đúng, màu đỏ là sai) để xem chi tiết câu hỏi và đáp án đúng.
        </div>
      `;
      return;
    }

    // Trường hợp đang học hoặc đang xem lại câu hỏi
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    const isFlagged = !!state.flaggedQuestions[state.currentQuestionIndex];
    let qHtml = `<div>
      ${isFlagged ? '<span class="q-flag-tag">🚩 ĐÃ ĐẶT CỜ</span>' : ''}
      <span style="background:#e0f2fe; color:#0288d1; font-weight:700; font-size:12px; padding:2px 8px; border-radius:4px; margin-right:6px;">${MODULES_INFO[state.currentModule].code}</span>
      <strong>Câu ${state.currentQuestionIndex + 1}:</strong> ${escapeHtml(currentQ.question)}
    </div>`;

    if (currentQ.imageUrl) {
      qHtml += `
        <div style="margin-top: 12px; text-align: center;">
          <img src="${currentQ.imageUrl}" alt="Hình minh họa" style="max-width: 95%; max-height: 250px; border: 1px solid #b0bec5; border-radius: 4px; background: #ffffff; padding: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" onerror="this.parentElement.style.display='none'">
        </div>
      `;
    }
    qBox.innerHTML = qHtml;

    renderOptionsBox();
  }

  // Render 4 đáp án A, B, C, D
  function renderOptionsBox() {
    const optBox = document.getElementById('options-box');
    if (!optBox) return;

    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    const userPick = state.userAnswers[state.currentQuestionIndex];
    const hasPicked = (userPick !== undefined);
    const isCorrect = (hasPicked && userPick === currentQ.answer);

    const isGradedReview = (state.view === 'review');
    const showInstantAnswer = (state.instantMode && hasPicked);

    let html = '';

    currentQ.options.forEach((optText, optIdx) => {
      const isChecked = (userPick === optIdx);
      let itemClass = 'option-item';

      if (isGradedReview || showInstantAnswer) {
        if (optIdx === currentQ.answer) {
          itemClass += ' correct-answer-item'; // Luôn tô xanh đáp án đúng
        } else if (isChecked && !isCorrect) {
          itemClass += ' user-selected-wrong'; // Tô đỏ nếu thí sinh chọn sai
        }
      }

      html += `
        <label class="${itemClass}">
          <input type="radio" name="practice_option" class="option-radio" value="${optIdx}" 
            ${isChecked ? 'checked' : ''} 
            ${isGradedReview ? 'disabled' : ''}>
          <span class="option-label">${escapeHtml(optText)}</span>
          ${(isGradedReview || showInstantAnswer) && isChecked && !isCorrect ? '<span style="color:#d32f2f; font-weight:bold; margin-left:8px;">(Bạn đã chọn)</span>' : ''}
          ${(isGradedReview || showInstantAnswer) && optIdx === currentQ.answer ? '<span style="color:#2e7d32; font-weight:bold; margin-left:8px;">✔ (Đáp án đúng)</span>' : ''}
        </label>
      `;
    });

    // Hiển thị câu trả lời đúng và giải thích khi làm sai hoặc xem lại (không lặp lại dòng thừa)
    const optLetters = ['A', 'B', 'C', 'D'];
    const correctLetter = optLetters[currentQ.answer] || '';
    const correctOptText = currentQ.options[currentQ.answer] || '';

    let extraExplanation = '';
    if (currentQ.explanation && !currentQ.explanation.trim().startsWith('Đáp án đúng là lựa chọn:')) {
      extraExplanation = `<div class="explanation-text">${escapeHtml(currentQ.explanation)}</div>`;
    }

    if ((isGradedReview && !isCorrect) || (showInstantAnswer && !isCorrect)) {
      html += `
        <div class="correct-answer-banner">
          <div>✔ Câu trả lời đúng: ${correctLetter ? correctLetter + '. ' : ''}${escapeHtml(correctOptText)}</div>
          ${extraExplanation}
        </div>
      `;
    } else if (showInstantAnswer && isCorrect) {
      html += `
        <div class="correct-answer-banner" style="background:#e8f5e9; border-color:#81c784; color:#1b5e20;">
          <div>🎉 Chính xác! Bạn đã chọn đúng đáp án: ${correctLetter ? correctLetter + '. ' : ''}${escapeHtml(correctOptText)}</div>
          ${extraExplanation}
        </div>
      `;
    }

    optBox.innerHTML = html;

    // Gắn sự kiện chọn đáp án
    const radios = optBox.querySelectorAll('.option-radio');
    radios.forEach(r => {
      r.addEventListener('change', (e) => {
        selectOption(parseInt(e.target.value, 10));
      });
    });
  }

  // Render các nút điều hướng và nút chức năng
  function renderFooterButtons() {
    const submitBtn = document.getElementById('btn-submit-exam');
    const retakeSidebarBtn = document.getElementById('btn-retake-sidebar');
    const navBar = document.getElementById('bottom-nav-bar');
    if (!navBar) return;

    const isStudy = (state.view === 'study');
    const isReview = (state.view === 'review' || state.view === 'result_summary');

    if (submitBtn) submitBtn.style.display = isStudy ? 'block' : 'none';
    if (retakeSidebarBtn) retakeSidebarBtn.style.display = isReview ? 'block' : 'none';

    const currIdx = state.currentQuestionIndex;
    const isFirst = (currIdx === 0);
    const isLast = (currIdx === state.questions.length - 1);

    if (isStudy) {
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>Câu trước</button>
        <div class="nav-center-buttons">
          <button id="btn-finish-quick" class="btn-action-center btn-next" style="background:#2e7d32; border-color:#1b5e20;">Kiểm tra điểm (${Object.keys(state.userAnswers).length}/${state.questions.length})</button>
        </div>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu tiếp theo</button>
      `;

      const quickBtn = document.getElementById('btn-finish-quick');
      if (quickBtn) quickBtn.addEventListener('click', () => confirmSubmit(false));
    } else {
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>Câu trước</button>
        <div class="nav-center-buttons">
          <button id="btn-back-overview" class="btn-action-center btn-stop-review" style="background:#0288d1;">📋 Danh sách chủ đề</button>
          <button id="btn-retake-exam" class="btn-action-center btn-retake">Làm lại 50 câu</button>
        </div>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu tiếp theo</button>
      `;

      const backOverviewBtn = document.getElementById('btn-back-overview');
      if (backOverviewBtn) {
        backOverviewBtn.addEventListener('click', showOverviewScreen);
      }

      const retakeBtn = document.getElementById('btn-retake-exam');
      if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
          if (confirm(`Bạn có muốn xóa kết quả và làm lại 50 câu hỏi của ${MODULES_INFO[state.currentModule].title} không?`)) {
            startTopicWorkspace(state.currentModule, true);
          }
        });
      }
    }

    const prevBtn = document.getElementById('btn-prev-q');
    const nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.addEventListener('click', () => goToQuestion(currIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToQuestion(currIdx + 1));
  }

  // Xác nhận nộp bài
  function confirmSubmit(returnToOverview = false) {
    const answeredCount = Object.keys(state.userAnswers).length;
    const total = state.questions.length;
    const unAnswered = total - answeredCount;

    let msg = `Bạn đã làm được ${answeredCount}/${total} câu hỏi của ${MODULES_INFO[state.currentModule].code}.`;
    if (unAnswered > 0) {
      msg += `\nCòn ${unAnswered} câu chưa trả lời.`;
    }
    msg += '\n\nBạn có muốn nộp bài và xem kết quả chấm điểm chi tiết ngay bây giờ không?';

    if (confirm(msg)) {
      finishAndSubmit(returnToOverview);
    }
  }

  // Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Khởi tạo sự kiện toàn cục
  function init() {
    // Checkbox xem đáp án ngay
    const instantChk = document.getElementById('chk-instant-mode');
    if (instantChk) {
      instantChk.addEventListener('change', (e) => {
        state.instantMode = e.target.checked;
        saveModuleState();
        renderQuestionGrid();
        renderOptionsBox();
      });
    }

    // Nút Nộp bài bên sidebar
    const submitBtn = document.getElementById('btn-submit-exam');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => confirmSubmit(false));
    }

    // Nút Làm lại bên sidebar
    const retakeSidebarBtn = document.getElementById('btn-retake-sidebar');
    if (retakeSidebarBtn) {
      retakeSidebarBtn.addEventListener('click', () => {
        if (confirm(`Bạn có muốn làm lại toàn bộ 50 câu hỏi của ${MODULES_INFO[state.currentModule].title}?`)) {
          startTopicWorkspace(state.currentModule, true);
        }
      });
    }

    // Nút Đổi chủ đề trên Header
    const headerExitBtn = document.getElementById('btn-header-exit-topic');
    if (headerExitBtn) {
      headerExitBtn.addEventListener('click', requestExitCurrentTopic);
    }

    // Nút Đổi chủ đề bên sidebar
    const sidebarExitBtn = document.getElementById('btn-sidebar-exit-topic');
    if (sidebarExitBtn) {
      sidebarExitBtn.addEventListener('click', requestExitCurrentTopic);
    }

    // Mặc định: Hiển thị Màn hình tổng quát chọn chủ đề trước!
    showOverviewScreen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
