# -*- coding: utf-8 -*-
import json
import os
import shutil

uploaded_img = r"C:/Users/Home/.gemini/antigravity/brain/ffd06f4c-4481-41b6-a6a6-f81e2f0a8f06/.user_uploaded/media_1792884475941_f07e9e33.jpg"
if os.path.exists(uploaded_img):
    shutil.copyfile(uploaded_img, "assets/images/m5_img5.jpg")
    print("Copied uploaded image to assets/images/m5_img5.jpg")

uploaded_img4 = r"C:/Users/Home/.gemini/antigravity/brain/ffd06f4c-4481-41b6-a6a6-f81e2f0a8f06/.user_uploaded/media_1792884625309_91d98f1c.jpg"
if os.path.exists(uploaded_img4):
    shutil.copyfile(uploaded_img4, "assets/images/m5_img4.jpg")
    print("Copied uploaded image to assets/images/m5_img4.jpg")

# Load raw extracted forms
with open("tools/raw_forms_extracted.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Module names mapping
module_titles = {
    1: "Module 1: Kiến thức CNTT Cơ bản (IU01)",
    2: "Module 2: Sử dụng máy tính cơ bản (IU02)",
    3: "Module 3: Sử dụng Internet cơ bản (IU06)",
    4: "Module 4: Xử lý văn bản cơ bản - MS Word (IU03)",
    5: "Module 5: Sử dụng bảng tính cơ bản - MS Excel (IU04)",
    6: "Module 6: Sử dụng trình chiếu cơ bản - MS PowerPoint (IU05)"
}

# Answers for Module 1
ans_m1 = [
    2, 2, 0, 2, 3, 1, 2, 1, 0, 3,
    1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    0, 3, 2, 2, 1, 0, 2, 3, 0, 3,
    3, 0, 3, 1, 1, 1, 2, 2, 3, 2,
    3, 0, 3, 1, 3, 0, 3, 2, 0, 2
]

# Answers for Module 2
ans_m2 = [
    2, 3, 2, 0, 3, 2, 1, 2, 3, 1,
    0, 2, 1, 2, 2, 0, 0, 0, 3, 2,
    1, 0, 2, 0, 1, 2, 1, 2, 3, 0,
    2, 1, 3, 2, 0, 1, 3, 0, 0, 0,
    3, 1, 1, 1, 3, 1, 2, 1, 2, 1
]

# Answers for Module 3 (Internet)
ans_m3 = [
    1, 2, 0, 0, 0, 2, 3, 2, 0, 0,
    0, 1, 0, 0, 3, 0, 0, 3, 1, 1,
    1, 3, 1, 3, 1, 1, 2, 1, 2, 3,
    2, 1, 3, 0, 2, 1, 1, 2, 1, 1,
    0, 0, 2, 2, 0, 1, 0, 2, 0, 2
]

# Answers for Module 4 (Word)
ans_m4 = [
    2, 0, 2, 1, 2, 2, 3, 0, 0, 2,
    1, 0, 1, 1, 2, 0, 1, 0, 3, 1,
    1, 3, 1, 3, 2, 1, 0, 2, 3, 1,
    0, 3, 3, 0, 2, 1, 3, 0, 3, 1,
    0, 2, 2, 2, 3, 1, 3, 1, 1, 1
]

# Answers for Module 5 (Excel)
ans_m5 = [
    3, 1, 1, 2, 0, 3, 2, 2, 3, 2,
    1, 2, 1, 0, 0, 1, 3, 1, 3, 2,
    1, 2, 3, 0, 3, 2, 0, 3, 2, 0,
    1, 0, 0, 2, 2, 1, 3, 3, 0, 2,
    3, 0, 2, 2, 2, 3, 1, 1, 1, 2
]

# Answers for Module 6 (PowerPoint)
ans_m6 = [
    0, 1, 2, 3, 3, 3, 0, 1, 2, 2,
    3, 1, 3, 3, 1, 1, 1, 3, 0, 2,
    3, 3, 3, 3, 2, 3, 2, 3, 3, 1,
    3, 2, 3, 1, 1, 0, 0, 1, 1, 2,
    0, 2, 3, 2, 0, 1, 3, 2, 2, 1
]

all_ans = {
    1: ans_m1,
    2: ans_m2,
    3: ans_m3,
    4: ans_m4,
    5: ans_m5,
    6: ans_m6
}

# Local Image Map pointing directly to downloaded assets/images/ files!
local_image_map = {
    # Module 2
    (2, 5): "assets/images/m2_img1.jpg",
    (2, 21): "assets/images/m2_img5.jpg",
    (2, 22): "assets/images/m2_img3.jpg",
    (2, 23): "assets/images/m2_img2.jpg",
    (2, 39): "assets/images/m2_img4.jpg",
    (2, 42): "assets/images/m2_img6.jpg",

    # Module 4
    (4, 43): "assets/images/m4_img1.jpg",
    (4, 44): "assets/images/m4_img2.jpg", # The exact question in user's screenshot!
    (4, 45): "assets/images/m4_img3.jpg",

    # Module 5
    (5, 11): "assets/images/m5_img1.jpg",
    (5, 15): "assets/images/m5_img3.jpg",
    (5, 16): "assets/images/m5_img5.jpg",
    (5, 17): "assets/images/m5_img4.jpg",
    (5, 28): "assets/images/m5_img2.jpg",
    (5, 46): "assets/images/m5_img6.jpg",

    # Module 6
    (6, 22): "assets/images/m6_img2.jpg",
    (6, 29): "assets/images/m6_img1.jpg"
}

# Verify each file exists
for key, rel_path in local_image_map.items():
    if not os.path.exists(rel_path):
        print(f"WARNING: File not found: {rel_path} for {key}")
    else:
        print(f"Verified image: {rel_path} ({os.path.getsize(rel_path)} bytes) for Mod {key[0]} Q{key[1]}")

# Custom overrides for questions with typos/missing options in the original Google Forms
question_overrides = {
    (5, 47): {
        "question": "Trong Microsoft Excel, công thức nào sau đây sẽ cho lỗi #VALUE!",
        "options": [
            '=COUNTA("A",13,4)',
            '=MAX("A",13,4)',
            '=COUNTIF(D7:D18,"A")',
            '=COUNTA("A",13,4)'
        ],
        "answer": 1,
        "explanation": "Đáp án đúng là lựa chọn: B. =MAX(\"A\",13,4). Khi truyền trực tiếp một chuỗi văn bản không thể chuyển thành số (\"A\") vào các đối số của hàm MAX, Excel sẽ trả về lỗi #VALUE!."
    }
}

final_questions = []
global_id = 1

for m in range(1, 7):
    m_raw = raw_data[str(m)]
    q_list = m_raw["questions"]
    ans_list = all_ans[m]

    for idx, q_obj in enumerate(q_list):
        q_num = idx + 1
        img_url = local_image_map.get((m, q_num), None)

        ans_idx = ans_list[idx] if idx < len(ans_list) else 0

        q_text = q_obj["question"]
        q_opts = list(q_obj["options"])

        # Construct explanation
        correct_opt_text = q_opts[ans_idx] if ans_idx < len(q_opts) else ""
        explanation = f"Đáp án đúng là lựa chọn: {chr(65+ans_idx)}. {correct_opt_text}"

        if (m, q_num) in question_overrides:
            override = question_overrides[(m, q_num)]
            q_text = override.get("question", q_text)
            q_opts = override.get("options", q_opts)
            if "answer" in override:
                ans_idx = override["answer"]
            if "explanation" in override:
                explanation = override["explanation"]

        final_questions.append({
            "id": global_id,
            "module": m,
            "moduleName": module_titles[m],
            "question": q_text,
            "options": q_opts,
            "answer": ans_idx,
            "imageUrl": img_url,
            "explanation": explanation
        })
        global_id += 1

print(f"\nTotal questions processed: {len(final_questions)}")

# Write to js/questions.js atomically
tmp_file = "js/questions.js.tmp"
with open(tmp_file, "w", encoding="utf-8") as f:
    f.write("// Ngân hàng 300 câu hỏi chính thức từ 6 Google Forms của giảng viên\n")
    f.write("// Hình ảnh minh họa được lưu trữ cục bộ tại assets/images/ đảm bảo không bao giờ bị lỗi\n")
    f.write("// Đề thi mỗi lượt rút ngẫu nhiên đúng 5 câu từ mỗi module -> 30 câu / 30 phút\n\n")
    f.write("window.DEFAULT_QUESTION_BANK = ")
    json.dump(final_questions, f, ensure_ascii=False, indent=2)
    f.write(";\n")

os.replace(tmp_file, "js/questions.js")

print("Successfully written updated js/questions.js with LOCAL images!")
