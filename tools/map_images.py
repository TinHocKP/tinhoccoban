# -*- coding: utf-8 -*-
import urllib.request
import re
from fetch_google_forms import links

for mod, (name, url) in links.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')

    # Find occurrences of forms-images-rt
    imgs = re.findall(r'https://docs\.google\.com/forms-images-rt/[^\s"\'<>]+', html)
    print(f"Module {mod} ({name}): Found {len(imgs)} forms-images-rt URLs")
    for img_url in imgs:
        idx = html.find(img_url)
        # Look backwards to find the nearest question text
        before_snippet = html[max(0, idx - 1500): idx]
        # Look for question titles or i...
        q_matches = re.findall(r'role="heading"[^>]*>([^<]+)<', before_snippet)
        if not q_matches:
            q_matches = re.findall(r'class="M4DNQ"[^>]*>([^<]+)<', before_snippet)
        q_title = q_matches[-1] if q_matches else "Unknown Q"
        print(f"  -> Q: {q_title[:50]}... | URL length: {len(img_url)}")
