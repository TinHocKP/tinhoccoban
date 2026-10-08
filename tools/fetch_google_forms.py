# -*- coding: utf-8 -*-
import urllib.request
import json
import re

def extract_fb_data(html):
    idx = html.find('FB_PUBLIC_LOAD_DATA_')
    if idx == -1:
        return None
    start = html.find('[', idx)
    if start == -1:
        return None
    
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(html)):
        c = html[i]
        if escape:
            escape = False
            continue
        if c == '\\':
            escape = True
            continue
        if c == '"':
            in_str = not in_str
            continue
        if not in_str:
            if c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    return json.loads(html[start:i+1])
    return None

links = {
    1: ('Kiến thức CNTT Cơ bản', 'https://forms.gle/RTiUyPYJv7pfpUvn8'),
    2: ('Sử dụng máy tính cơ bản', 'https://forms.gle/X5Adiwh6DWzgWrsi8'),
    3: ('Sử dụng Internet cơ bản', 'https://forms.gle/mAQ5phuVJiUtP7Gy7'),
    4: ('Phần Word', 'https://forms.gle/AZ5FGm4m7R8rzebD8'),
    5: ('Phần Excel', 'https://forms.gle/mGGJ6mTfAFdASkBJA'),
    6: ('Phần PowerPoint', 'https://forms.gle/srEhht6r8ZCQUZbr6')
}

extracted_all = {}

for mod, (name, url) in links.items():
    print(f"Fetching Module {mod}: {name} from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    data = extract_fb_data(html)
    if data:
        items = data[1][1]
        valid_items = []
        for it in items:
            if it[1] and it[4] and it[4][0] and it[4][0][1]:
                q_text = it[1].strip()
                opts = [opt[0].strip() for opt in it[4][0][1] if opt[0]]
                valid_items.append({
                    "question": q_text,
                    "options": opts
                })
        print(f" -> Found {len(valid_items)} questions!")
        extracted_all[mod] = {
            "name": name,
            "questions": valid_items
        }
    else:
        print(f" -> Failed to extract Module {mod}")

with open("tools/raw_forms_extracted.json", "w", encoding="utf-8") as f:
    json.dump(extracted_all, f, ensure_ascii=False, indent=2)

print("\nSaved all extracted questions to tools/raw_forms_extracted.json")
