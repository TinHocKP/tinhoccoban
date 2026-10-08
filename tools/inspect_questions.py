# -*- coding: utf-8 -*-
import json

with open("tools/raw_forms_extracted.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for m in range(1, 7):
    m_data = data[str(m)]
    print(f"=== MODULE {m}: {m_data['name']} (Total: {len(m_data['questions'])}) ===")
    for i, q in enumerate(m_data['questions'][:5]):
        print(f"[{i+1}] {q['question']}")
        for j, opt in enumerate(q['options']):
            print(f"    {chr(65+j)}. {opt}")
    print("-" * 50)
