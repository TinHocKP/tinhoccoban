# -*- coding: utf-8 -*-
import urllib.request
import re

url = 'https://forms.gle/AZ5FGm4m7R8rzebD8'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Find all img tags in the entire page!
img_tags = re.findall(r'<img[^>]+>', html)
print(f"Total <img> tags in page: {len(img_tags)}")
for tag in img_tags:
    print("  TAG:", tag)
