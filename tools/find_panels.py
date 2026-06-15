import os
from PIL import Image

def find_panels():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_39_51 PM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
    
    img = Image.open(img_path)
    width, height = img.size
    
    # Let's inspect rows by finding horizontal lines that are mostly dark/black
    # We'll sample rows and count how many pixels are dark (e.g. RGB sum < 50)
    dark_rows = []
    for y in range(height):
        dark_pixels = 0
        for x in range(0, width, 5): # sample every 5 pixels
            r, g, b = img.getpixel((x, y))[:3]
            if r + g + b < 60:
                dark_pixels += 1
        ratio = dark_pixels / (width / 5)
        if ratio > 0.95:
            dark_rows.append(y)
            
    print(f"Total dark rows found: {len(dark_rows)}")
    # Group continuous dark rows
    ranges = []
    if dark_rows:
        start = dark_rows[0]
        prev = dark_rows[0]
        for y in dark_rows[1:]:
            if y - prev > 1:
                ranges.append((start, prev))
                start = y
            prev = y
        ranges.append((start, prev))
        
    print("Horizontal dark bands:")
    for r in ranges:
        print(f"  y = {r[0]} to {r[1]} (height={r[1]-r[0]+1})")

if __name__ == "__main__":
    find_panels()
