import os
from PIL import Image

def main():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_39_51 PM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    img = Image.open(img_path)
    base_art_dir = "/Users/wealtharchitect/.gemini/antigravity/scratch/crystalball/public/art"
    
    # Ensure directories exist
    for sub in ["characters", "bread", "concepts", "ui", "badges"]:
        os.makedirs(os.path.join(base_art_dir, sub), exist_ok=True)
        
    # Crop mapping
    crops = {
        # Characters
        "characters/kai.png": (256, 16, 486, 348),
        "characters/hana.png": (499, 16, 725, 348),
        "characters/sensei.png": (742, 16, 964, 348),
        "characters/kitsu.png": (977, 16, 1233, 348),
        
        # B.R.E.A.D
        "bread/behavior.png": (18, 392, 238, 616),
        "bread/reaction.png": (240, 392, 418, 616),
        "bread/execution.png": (420, 392, 622, 616),
        "bread/alignment.png": (624, 392, 826, 616),
        "bread/discipline.png": (828, 392, 1030, 616),
        "bread/flowchart.png": (1032, 392, 1234, 616),
        
        # Concepts Row 1
        "concepts/price-goal.png": (21, 631, 220, 811),
        "concepts/dem-gap.png": (222, 631, 423, 811),
        "concepts/gas-close.png": (429, 631, 620, 811),
        "concepts/bounce-reject.png": (625, 631, 814, 811),
        "concepts/break-retest.png": (822, 631, 1018, 811),
        "concepts/sweep.png": (1020, 631, 1234, 811),
        
        # Concepts Row 2
        "concepts/candle-battle.png": (18, 813, 218, 980),
        "concepts/trend.png": (220, 813, 418, 980),
        "concepts/stop-loss.png": (420, 813, 620, 980),
        "concepts/fomo.png": (625, 813, 828, 980),
        "concepts/hype-demon.png": (830, 813, 1030, 980),
        "concepts/volatility-dragon.png": (1032, 813, 1234, 980),
        
        # UI Row 1
        "ui/hero.png": (16, 989, 467, 1159),
        "ui/map-bg.png": (474, 989, 784, 1159),
    }
    
    for filename, bbox in crops.items():
        cropped = img.crop(bbox)
        cropped.save(os.path.join(base_art_dir, filename))
        print(f"Placed {filename} (size={cropped.size})")
        
    # UI Stingers
    stinger_img = img.crop((1006, 989, 1234, 1159))
    sw, sh = stinger_img.size
    panel_w = sw // 3
    
    stinger_names = ["ui/win.png", "ui/lose.png", "ui/levelup.png"]
    for idx, filename in enumerate(stinger_names):
        col_start = idx * panel_w
        col_end = col_start + panel_w if idx < 2 else sw
        cropped = stinger_img.crop((col_start, 0, col_end, sh))
        cropped.save(os.path.join(base_art_dir, filename))
        print(f"Placed {filename} (size={cropped.size})")

    # Medallions and Badges (slice them from ui_medallions.png equivalent region)
    med_img = img.crop((786, 989, 1000, 1159))
    mw, mh = med_img.size
    cols = 6
    rows = 2
    cell_w = mw // cols
    cell_h = mh // rows
    
    # Let's slice the 6 rank medallions
    for idx in range(cols):
        # We need ranks 1 to 8. We only have 6 here. We'll map the 6 we have, and we can duplicate/scale or generate ranks.
        col_start = idx * cell_w
        col_end = col_start + cell_w if idx < cols - 1 else mw
        cropped = med_img.crop((col_start, 0, col_end, cell_h))
        # Save to rank-1 to rank-6
        cropped.save(os.path.join(base_art_dir, f"badges/rank-{idx+1}.png"))
        print(f"Placed badges/rank-{idx+1}.png (size={cropped.size})")
        
    # Save some fallback duplicates for rank-7 and rank-8
    med_img.crop((5 * cell_w, 0, mw, cell_h)).save(os.path.join(base_art_dir, "badges/rank-7.png"))
    med_img.crop((5 * cell_w, 0, mw, cell_h)).save(os.path.join(base_art_dir, "badges/rank-8.png"))
    print("Placed badges/rank-7.png and rank-8.png (copied rank-6)")
    
    # Slice the 6 badges from Row 2
    badge_files = [
        "badge-first-trade.png", # Flame
        "badge-shield.png",      # Shield
        "badge-green-day.png",   # Sun
        "badge-playbook.png",    # Bread
        "badge-pool-hunter.png", # Water
        "badge-scholar.png"      # Scholar
    ]
    for idx, name in enumerate(badge_files):
        col_start = idx * cell_w
        col_end = col_start + cell_w if idx < cols - 1 else mw
        cropped = med_img.crop((col_start, cell_h, col_end, mh))
        cropped.save(os.path.join(base_art_dir, f"badges/{name}"))
        print(f"Placed badges/{name} (size={cropped.size})")
        
    # Copy fallback badges for the remaining slots
    other_badges = [
        "badge-quiz-ace.png",
        "badge-patient.png",
        "badge-dragon.png",
        "badge-strategist.png",
        "badge-scientist.png",
        "badge-hype-slayer.png"
    ]
    # We will use some of the existing badges as temporary fallbacks
    for idx, name in enumerate(other_badges):
        cropped = med_img.crop((idx * cell_w, cell_h, (idx+1) * cell_w if idx < cols - 1 else mw, mh))
        cropped.save(os.path.join(base_art_dir, f"badges/{name}"))
        print(f"Placed fallback badges/{name}")

if __name__ == "__main__":
    main()
