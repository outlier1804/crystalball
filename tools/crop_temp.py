import os
from PIL import Image

def main():
    downloads_dir = "/Users/wealtharchitect/Downloads"
    img_path = os.path.join(downloads_dir, "ChatGPT Image Jun 14, 2026, 06_39_51 PM.png")
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    img = Image.open(img_path)
    output_dir = "/Users/wealtharchitect/.gemini/antigravity/scratch/crystalball/public/art/temp_panels"
    os.makedirs(output_dir, exist_ok=True)
    
    # Let's crop based on coordinates we've worked out
    crops = {
        # Tier 1 - Characters
        "char_kai": (256, 16, 486, 348),
        "char_hana": (499, 16, 725, 348),
        "char_sensei": (742, 16, 964, 348),
        "char_kitsu": (977, 16, 1233, 348),
        
        # Tier 2 - B.R.E.A.D
        "bread_behavior": (18, 392, 238, 616),
        "bread_reaction": (240, 392, 418, 616),
        "bread_execution": (420, 392, 622, 616),
        "bread_alignment": (624, 392, 826, 616),
        "bread_discipline": (828, 392, 1030, 616),
        "bread_flowchart": (1032, 392, 1234, 616),
        
        # Tier 3 Row 1 - Concepts
        "concept_price_goal": (21, 631, 220, 811),
        "concept_dem_gap": (222, 631, 423, 811),
        "concept_gas_close": (429, 631, 620, 811),
        "concept_bounce_reject": (625, 631, 814, 811),
        "concept_break_retest": (822, 631, 1018, 811),
        "concept_sweep": (1020, 631, 1234, 811),
        
        # Tier 3 Row 2 - Concepts
        "concept_candle_battle": (18, 813, 218, 980),
        "concept_trend": (220, 813, 418, 980),
        "concept_stop_loss": (420, 813, 620, 980),
        "concept_fomo": (625, 813, 828, 980),
        "concept_hype_demon": (830, 813, 1030, 980),
        "concept_volatility_dragon": (1032, 813, 1234, 980),
        
        # Tier 4 - UI & Stingers
        "ui_hero": (16, 989, 467, 1159),
        "ui_map_bg": (474, 989, 784, 1159),
        "ui_medallions": (786, 989, 1000, 1159),
        "ui_stingers_all": (1006, 989, 1234, 1159),
    }
    
    for name, bbox in crops.items():
        cropped = img.crop(bbox)
        cropped.save(os.path.join(output_dir, f"{name}.png"))
        print(f"Cropped {name} at {bbox}, size={cropped.size}")

if __name__ == "__main__":
    main()
