import os
import shutil
from PIL import Image

def main():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    new_sheet_path = os.path.join(downloads_dir, "ChatGPT Image Jun 15, 2026, 02_16_32 AM.png")
    flowchart_path = os.path.join(downloads_dir, "1779628319298-d919865c-df87-427f-826a-909ccedcb7dc__community_file.png")
    
    if not os.path.exists(new_sheet_path):
        print("New contact sheet image not found")
        return
        
    img = Image.open(new_sheet_path)
    base_art_dir = "/Users/wealtharchitect/.gemini/antigravity/scratch/crystalball/public/art"
    
    # Ensure directories exist
    for sub in ["characters", "bread", "concepts", "ui", "badges"]:
        os.makedirs(os.path.join(base_art_dir, sub), exist_ok=True)
        
    # Copy B.R.E.A.D Flowchart if it exists
    if os.path.exists(flowchart_path):
        dest_flowchart = os.path.join(base_art_dir, "bread/flowchart.png")
        shutil.copy(flowchart_path, dest_flowchart)
        print(f"Copied flowchart to {dest_flowchart}")
    else:
        print("Dedicated flowchart file not found in Downloads")
        
    # Crop mapping from the new high-res contact sheet (1536x1024)
    crops = {
        # Concepts Row 1 (y = 22 to 218)
        "concepts/price-goal.png": (10, 22, 246, 218),
        "concepts/dem-gap.png": (266, 22, 502, 218),
        "concepts/gas-close.png": (522, 22, 758, 218),
        "concepts/bounce-reject.png": (778, 22, 1014, 218),
        "concepts/break-retest.png": (1034, 22, 1270, 218),
        "concepts/sweep.png": (1290, 22, 1526, 218),
        
        # Concepts Row 2 (y = 265 to 471)
        "concepts/candle-battle.png": (9, 265, 255, 471),
        "concepts/trend.png": (264, 265, 471, 471), # Uptrend is used for trend
        "concepts/stop-loss.png": (666, 265, 860, 471),
        "concepts/fomo.png": (869, 265, 1082, 471),
        "concepts/hype-demon.png": (1090, 265, 1282, 471),
        "concepts/volatility-dragon.png": (1289, 265, 1528, 471),
        
        # Characters (y = 515 to 772)
        "characters/kai.png": (9, 515, 324, 772),
        "characters/hana.png": (331, 515, 584, 772),
        "characters/sensei.png": (597, 515, 862, 772),
        "characters/kitsu.png": (869, 515, 1169, 772),
        
        # UI Row 1 (y = 784 to 986)
        "ui/hero.png": (9, 784, 293, 986),
        "ui/map-bg.png": (303, 784, 603, 986),
    }
    
    for filename, bbox in crops.items():
        cropped = img.crop(bbox)
        cropped.save(os.path.join(base_art_dir, filename))
        print(f"Placed {filename} (size={cropped.size})")
        
    # UI Outcomes (y = 784 to 986, x = 981 to 1525)
    # 4 columns side by side: WIN, LOSE, LEVEL UP, NEW QUEST
    outcomes_img = img.crop((981, 784, 1525, 986))
    ow, oh = outcomes_img.size
    col_w = ow // 4
    
    outcomes_mapping = {
        "ui/win.png": 0,
        "ui/lose.png": 1,
        "ui/levelup.png": 2,
        "ui/new-quest.png": 3
    }
    
    for filename, col_idx in outcomes_mapping.items():
        col_start = col_idx * col_w
        col_end = col_start + col_w if col_idx < 3 else ow
        cropped = outcomes_img.crop((col_start, 0, col_end, oh))
        cropped.save(os.path.join(base_art_dir, filename))
        print(f"Placed {filename} (size={cropped.size})")

    # Medallions (y = 784 to 986, x = 613 to 962)
    # 2x5 grid
    med_img = img.crop((613, 784, 962, 986))
    mw, mh = med_img.size
    cols = 5
    rows = 2
    cell_w = mw // cols
    cell_h = mh // rows
    
    # Ranks 1 to 5 are already high-res custom versions we generated earlier!
    # Let's save the remaining ones (rank-6 to rank-8) from the sheet:
    # 6: Elite Trader (Row 2, Col 1)
    # 7: Market Ninja (Row 2, Col 2)
    # 8: Chart Master / Playbook Grandmaster (Row 2, Col 5)
    
    # Elite Trader (rank-6): row=1, col=0
    rank6 = med_img.crop((0, cell_h, cell_w, mh))
    rank6.save(os.path.join(base_art_dir, "badges/rank-6.png"))
    print(f"Placed badges/rank-6.png (size={rank6.size})")
    
    # Market Ninja (rank-7): row=1, col=1
    rank7 = med_img.crop((cell_w, cell_h, 2 * cell_w, mh))
    rank7.save(os.path.join(base_art_dir, "badges/rank-7.png"))
    print(f"Placed badges/rank-7.png (size={rank7.size})")
    
    # Playbook Grandmaster (rank-8): row=1, col=4
    rank8 = med_img.crop((4 * cell_w, cell_h, mw, mh))
    rank8.save(os.path.join(base_art_dir, "badges/rank-8.png"))
    print(f"Placed badges/rank-8.png (size={rank8.size})")

    # Let's also place some high quality badges if they match
    # Flame (Row 2 Col 1): badge-first-trade
    # Shield (Row 2 Col 2): badge-shield
    # Sun (Row 2 Col 3): badge-green-day
    # Bread (Row 2 Col 5): badge-playbook
    # Let's map these:
    # We will copy from the medallion sheet for the badge grid
    # Let's save them as the actual badges!
    badges_mapping = {
        "badges/badge-first-trade.png": (0, cell_h, cell_w, mh),
        "badges/badge-shield.png": (cell_w, cell_h, 2 * cell_w, mh),
        "badges/badge-green-day.png": (2 * cell_w, cell_h, 3 * cell_w, mh),
        "badges/badge-playbook.png": (4 * cell_w, cell_h, mw, mh),
    }
    
    for filename, bbox in badges_mapping.items():
        cropped = med_img.crop(bbox)
        cropped.save(os.path.join(base_art_dir, filename))
        print(f"Placed {filename} (size={cropped.size})")

if __name__ == "__main__":
    main()
