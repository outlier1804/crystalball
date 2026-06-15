import os
from PIL import Image

downloads_dir = "/Users/wealtharchitect/Downloads"
img1_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_16_51 PM.png")
img2_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_39_51 PM.png")

for path in [img1_path, img2_path]:
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"{os.path.basename(path)}: size={img.size}, mode={img.mode}")
    else:
        print(f"{os.path.basename(path)} does not exist")
