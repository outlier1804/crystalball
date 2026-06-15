import os
from PIL import Image

def find_bands():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 15, 2026, 02_16_32 AM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    img = Image.open(img_path)
    width, height = img.size
    print(f"New image size: {width}x{height}")
    
    # Horiz scan
    dark_rows = []
    for y in range(height):
        dark_pixels = 0
        for x in range(0, width, 5):
            r, g, b = img.getpixel((x, y))[:3]
            if r + g + b < 60:
                dark_pixels += 1
        ratio = dark_pixels / (width / 5)
        if ratio > 0.95:
            dark_rows.append(y)
            
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
    find_bands()
