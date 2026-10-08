# -*- coding: utf-8 -*-
import json

with open("tools/raw_forms_extracted.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for m in range(1, 7):
    m_data = data[str(m)]
    with open(f"tools/mod_{m}.txt", "w", encoding="utf-8") as out:
        for i, q in enumerate(m_data["questions"]):
            out.write(f"Q{i+1}: {q['question']}\n")
            for j, opt in enumerate(q["options"]):
                out.write(f"  {chr(65+j)}. {opt}\n")
            out.write("\n")
print("Exported mod_1.txt to mod_6.txt")
