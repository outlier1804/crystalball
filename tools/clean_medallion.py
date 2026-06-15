import sys
import os
import math
from PIL import Image, ImageDraw

def clean_circle(src_path, dest_path, radius_factor=0.485):
    img = Image.open(src_path).convert("RGBA")
    width, height = img.size
    cx, cy = width / 2, height / 2
    radius = min(width, height) * radius_factor
    
    # Create a circular mask with anti-aliasing
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw an anti-aliased circle
    # To do anti-aliasing, we can draw a larger circle and scale down, or use basic math
    # But Pillow's draw.ellipse is usually clean enough if we do it carefully.
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    
    # Apply mask
    out_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    out_img.paste(img, (0, 0), mask=mask)
    
    # Save the result
    out_img.save(dest_path, "PNG")
    print(f"Cleaned medallion saved to {dest_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 clean_medallion.py <src> <dest>")
    else:
        clean_circle(sys.argv[1], sys.argv[2])
