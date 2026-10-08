# -*- coding: utf-8 -*-
import urllib.request
import re
import os
import json
from fetch_google_forms import links

os.makedirs("assets/images", exist_ok=True)

# Map for downloaded images: (module, question_keyword) -> local_path
downloaded_images = {}

for mod, (name, url) in links.items():
    print(f"\nProcessing Module {mod}: {name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')

    # Split by listitem or question container
    # In Google Forms, each question is in a container with role="listitem" or class starting with "Qr7Oae"
    chunks = html.split('role="listitem"')
    if len(chunks) <= 1:
        chunks = html.split('jscontroller="sWGJ4b"')
    
    print(f"  Total chunks found: {len(chunks)}")
    
    img_count = 0
    for chunk in chunks:
        # Check if there is a forms-images-rt in this chunk
        img_match = re.search(r'https://docs\.google\.com/forms-images-rt/[^\s"\'<>]+', chunk)
        if img_match:
            img_url = img_match.group(0)
            
            # Find question text in this chunk
            q_text_match = re.search(r'role="heading"[^>]*>([^<]+)<', chunk)
            if not q_text_match:
                q_text_match = re.search(r'class="M4DNQ"[^>]*>([^<]+)<', chunk)
            if not q_text_match:
                # search in data-params or heading text
                q_text_match = re.search(r'>([^<]{10,200}\?)<', chunk)
                
            q_title = q_text_match.group(1).strip() if q_text_match else f"Mod_{mod}_img_{img_count+1}"
            img_count += 1
            
            filename = f"m{mod}_img{img_count}.jpg"
            filepath = os.path.join("assets", "images", filename)
            local_rel_path = f"assets/images/{filename}"
            
            # Download the image
            print(f"  Downloading image {img_count} for: {q_title[:45]}...")
            try:
                img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(img_req) as img_resp:
                    img_data = img_resp.read()
                with open(filepath, "wb") as f_out:
                    f_out.write(img_data)
                print(f"    -> Saved {len(img_data)} bytes to {filepath}")
                
                downloaded_images[(mod, q_title)] = local_rel_path
            except Exception as e:
                print(f"    -> ERROR downloading: {e}")

print("\nFinished downloading all images!")
with open("tools/downloaded_map.json", "w", encoding="utf-8") as f:
    json.dump({f"{k[0]}|{k[1]}": v for k, v in downloaded_images.items()}, f, ensure_ascii=False, indent=2)
