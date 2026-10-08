/**
 * Google Apps Script: Trích xuất 300 câu hỏi từ Google Form hoặc Google Sheets
 * 
 * CÁCH DÙNG TRONG GOOGLE FORM:
 * 1. Mở Google Form của bạn chứa 300 câu hỏi
 * 2. Bấm vào biểu tượng 3 chấm ở góc trên phải -> chọn "Trình chỉnh sửa tập lệnh" (Apps Script)
 * 3. Dán toàn bộ mã này vào và bấm Lưu (Ctrl + S)
 * 4. Chạy hàm: exportFormQuestionsToJson()
 * 5. Mở tab Xem -> Nhật ký thực thi (Execution Log) và copy chuỗi JSON, hoặc tải file questions.json
 *
 * CÁCH DÙNG TRONG GOOGLE SHEETS:
 * Nếu các câu hỏi nằm trên Google Sheets gồm các cột:
 * Cột A: Module (1-6) | Cột B: Câu hỏi | Cột C: Lựa chọn A | Cột D: Lựa chọn B | Cột E: Lựa chọn C | Cột F: Lựa chọn D | Cột G: Đáp án đúng (A/B/C/D hoặc 1/2/3/4) | Cột H: Giải thích (tùy chọn)
 * 1. Mở Google Sheet -> Tiện ích mở rộng -> Apps Script
 * 2. Dán mã này và chạy hàm: exportSheetQuestionsToJson()
 */

function exportFormQuestionsToJson() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  var questions = [];
  var idCounter = 1;

  var currentModule = 1;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    
    // Nếu là tiêu đề phân đoạn (Section Header / PageBreak)
    if (item.getType() == FormApp.ItemType.PAGE_BREAK || item.getType() == FormApp.ItemType.SECTION_HEADER) {
      var title = item.getTitle();
      var match = title.match(/module\s*([1-6])/i);
      if (match) {
        currentModule = parseInt(match[1]);
      }
      continue;
    }

    // Nếu là câu hỏi trắc nghiệm (Multiple Choice)
    if (item.getType() == FormApp.ItemType.MULTIPLE_CHOICE) {
      var mc = item.asMultipleChoiceItem();
      var choices = mc.getChoices();
      var options = [];
      var correctAnswerIndex = 0;

      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];
        options.push(choice.getValue());
        if (choice.isCorrectAnswer && choice.isCorrectAnswer()) {
          correctAnswerIndex = c;
        }
      }

      questions.append ? questions.append : questions.push({
        id: idCounter++,
        module: currentModule,
        moduleName: "Module " + currentModule,
        question: mc.getTitle(),
        options: options,
        answer: correctAnswerIndex,
        explanation: mc.getHelpText() || ""
      });
    }
  }

  var jsonOutput = JSON.stringify(questions, null, 2);
  Logger.log("=== KẾT QUẢ JSON CHO WEB TRẮC NGHIỆM ===");
  Logger.log(jsonOutput);
  return jsonOutput;
}

function exportSheetQuestionsToJson() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var questions = [];
  var idCounter = 1;

  // Giả sử dòng 1 là tiêu đề cột, bắt đầu từ dòng 2 (index 1)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1] || row[1].toString().trim() === "") continue;

    var moduleNum = parseInt(row[0]) || 1;
    var questionText = row[1].toString().trim();
    var optA = row[2] ? row[2].toString().trim() : "";
    var optB = row[3] ? row[3].toString().trim() : "";
    var optC = row[4] ? row[4].toString().trim() : "";
    var optD = row[5] ? row[5].toString().trim() : "";

    var options = [optA, optB, optC, optD].filter(function(o) { return o !== ""; });

    var ansRaw = row[6] ? row[6].toString().trim().toUpperCase() : "A";
    var ansIndex = 0;
    if (ansRaw === "B" || ansRaw === "2") ansIndex = 1;
    else if (ansRaw === "C" || ansRaw === "3") ansIndex = 2;
    else if (ansRaw === "D" || ansRaw === "4") ansIndex = 3;

    var explanation = row[7] ? row[7].toString().trim() : "";

    questions.push({
      id: idCounter++,
      module: moduleNum,
      moduleName: "Module " + moduleNum,
      question: questionText,
      options: options,
      answer: ansIndex,
      explanation: explanation
    });
  }

  var jsonOutput = JSON.stringify(questions, null, 2);
  Logger.log(jsonOutput);
  return jsonOutput;
}
