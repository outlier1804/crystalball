import os
from PIL import Image

def find_columns_in_row(img, y_start, y_end):
    width, height = img.size
    dark_cols = []
    for x in range(width):
        dark_pixels = 0
        for y in range(y_start, y_end + 1, 2):
            r, g, b = img.getpixel((x, y))[:3]
            if r + g + b < 60:
                dark_pixels += 1
        ratio = dark_pixels / ((y_end - y_start) / 2 + 1)
        if ratio > 0.95:
            dark_cols.append(x)
            
    ranges = []
    if dark_cols:
        start = dark_cols[0]
        prev = dark_cols[0]
        for x in dark_cols[1:]:
            if x - prev > 1:
                ranges.append((start, prev))
                start = x
            prev = x
        ranges.append((start, prev))
    return ranges

def main():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 15, 2026, 02_16_32 AM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    img = Image.open(img_path)
    
    tiers = [
        ("Row 1 (Concepts 1)", 22, 218),
        ("Row 2 (Concepts 2)", 265, 471),
        ("Row 3 (Characters)", 515, 772),
        ("Row 4 (UI/Medallions)", 784, 986)
    ]
    
    for name, y_start, y_end in tiers:
        cols = find_columns_in_row(img, y_start, y_end)
        print(f"{name} (y={y_start} to {y_end}):")
        panels = []
        last_end = 0
        for start, end in cols:
            if start > last_end:
                panels.append((last_end, start - 1))
            last_end = end + 1
        if last_end < img.size[0]:
            panels.append((last_end, img.size[0] - 1))
            
        panels = [p for p in panels if p[1] - p[0] > 10]
        for idx, (x_start, x_end) in enumerate(panels):
            print(f"  Panel {idx+1}: x={x_start} to {x_end} (width={x_end-x_start+1})")

if __name__ == "__main__":
    main()
