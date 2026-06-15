import os
import sys
from PIL import Image

def remove_background(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    width, height = img.size
    
    # We will do a flood-fill or pixel-by-pixel check from the edges.
    # Since the checkerboard pattern consists of light grey (approx 200-210) and white (approx 255),
    # let's detect pixels that are grey or white and are connected to the edges.
    
    # A simple way is: if pixel is close to white (R,G,B > 240) or close to light grey (200 < R,G,B < 210 and R,G,B are very close to each other),
    # we make it transparent.
    pixels = img.load()
    
    # Let's perform a flood fill from the four corners to find the background pixels.
    # This prevents turning white pixels inside the character (like eyes or teeth) transparent!
    visited = set()
    queue = []
    
    # Add borders to queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    for p in queue:
        visited.add(p)
        
    while queue:
        x, y = queue.pop(0)
        r, g, b, a = pixels[x, y]
        
        # Check if it looks like checkerboard background
        # Grey: e.g. R,G,B are similar and around 200-210
        # White: R,G,B are > 240
        is_grey = (200 <= r <= 210) and (200 <= g <= 210) and (200 <= b <= 210) and (abs(r - g) < 5) and (abs(g - b) < 5)
        is_white = (r >= 235) and (g >= 235) and (b >= 235)
        
        # If it's a background pixel, make it transparent and add neighbors
        if is_grey or is_white:
            pixels[x, y] = (0, 0, 0, 0)
            
            # Check neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    img.save(dest_path, "PNG")
    print(f"Saved transparent image to {dest_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 remove_bg.py <src> <dest>")
    else:
        remove_background(sys.argv[1], sys.argv[2])
