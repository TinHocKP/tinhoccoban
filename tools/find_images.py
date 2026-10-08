# -*- coding: utf-8 -*-
import json
import urllib.request
import sys
sys.path.append('.')
sys.path.append('tools')
from fetch_google_forms import extract_fb_data, links

all_images = {}

for mod, (name, url) in links.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    data = extract_fb_data(html)
    items = data[1][1]
    mod_imgs = []
    for idx, it in enumerate(items):
        if not (it[1] and it[4] and it[4][0] and it[4][0][1]):
            continue
        # Look for image ID in it[6] or anywhere
        img_id = None
        if len(it) > 6 and it[6] and isinstance(it[6], list) and len(it[6]) > 0:
            if isinstance(it[6][0], list) and len(it[6][0]) > 0 and isinstance(it[6][0][0], str):
                img_id = it[6][0][0]
        # Check sub-elements
        if not img_id:
            for el in it:
                if isinstance(el, list) and len(el) > 0 and isinstance(el[0], list):
                    if len(el[0]) > 0 and isinstance(el[0][0], str) and len(el[0][0]) > 20:
                        img_id = el[0][0]
                        break
        if img_id:
            mod_imgs.append({
                "q_idx": idx + 1,
                "q_title": it[1].strip(),
                "img_id": img_id
            })
    all_images[mod] = mod_imgs
    print(f"Module {mod}: {len(mod_imgs)} questions with images")

with open("tools/questions_images.json", "w", encoding="utf-8") as f:
    json.dump(all_images, f, ensure_ascii=False, indent=2)
