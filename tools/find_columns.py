import os
from PIL import Image

def find_columns_in_row(img, y_start, y_end):
    width, height = img.size
    dark_cols = []
    # Sample every column between y_start and y_end
    for x in range(width):
        dark_pixels = 0
        for y in range(y_start, y_end + 1, 2): # sample vertical pixels
            r, g, b = img.getpixel((x, y))[:3]
            if r + g + b < 60:
                dark_pixels += 1
        ratio = dark_pixels / ((y_end - y_start) / 2 + 1)
        if ratio > 0.95:
            dark_cols.append(x)
            
    # Group continuous dark columns
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
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_39_51 PM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    img = Image.open(img_path)
    
    tiers = [
        ("Tier 1 (Style refs)", 16, 348),
        ("Tier 2 (B.R.E.A.D)", 392, 616),
        ("Tier 3 Row 1 (Concepts)", 631, 811),
        ("Tier 3 Row 2 (Concepts)", 813, 980),
        ("Tier 4 (UI/Medallions)", 989, 1159),
        ("Tier 4 (Stingers)", 1165, 1253)
    ]
    
    for name, y_start, y_end in tiers:
        cols = find_columns_in_row(img, y_start, y_end)
        print(f"{name} (y={y_start} to {y_end}):")
        # Print the non-dark segments (i.e. the panels)
        panels = []
        last_end = 0
        for start, end in cols:
            if start > last_end:
                panels.append((last_end, start - 1))
            last_end = end + 1
        if last_end < img.size[0]:
            panels.append((last_end, img.size[0] - 1))
            
        # Filter out very thin panels (e.g. < 10px width)
        panels = [p for p in panels if p[1] - p[0] > 10]
        for idx, (x_start, x_end) in enumerate(panels):
            print(f"  Panel {idx+1}: x={x_start} to {x_end} (width={x_end-x_start+1})")

if __name__ == "__main__":
    main()
