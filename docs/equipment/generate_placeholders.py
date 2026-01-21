import os
from PIL import Image, ImageDraw, ImageFont

# Configuration
ASSETS_DIR = "../apps/mobile/assets"

# Define the directory structure and files to generate
STRUCTURE = {
    "icons/muscles": [
        "chest.png", "back.png", "legs.png", "arms.png", 
        "shoulders.png", "abs.png", "cardio.png"
    ],
    "icons/food": [
        "protein.png", "carbs.png", "fat.png", "veggies.png", "fruits.png"
    ],
    "images/hero": [
        "onboarding-male.png", "onboarding-female.png", 
        "workout-header.png", "nutrition-header.png", "premium-bg.png"
    ],
    "images/empty": [
        "no-workouts.png", "no-meals.png", "no-favorites.png", "success-trophy.png"
    ]
}

# Colors
BG_COLOR = (26, 26, 26) # #1A1A1A
TEXT_COLOR = (0, 212, 170) # #00D4AA (Teal)
BORDER_COLOR = (100, 100, 100)

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def create_placeholder(path, text, size=(500, 500)):
    """Generates a placeholder image with text."""
    img = Image.new('RGB', size, color=BG_COLOR)
    d = ImageDraw.Draw(img)
    
    # Draw border
    d.rectangle([(0,0), (size[0]-1, size[1]-1)], outline=BORDER_COLOR, width=5)
    
    # Draw text (basic centering)
    # Note: Default font is used, might be small, but sufficient for placeholder
    try:
        # Try to load a font, fallback to default
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()

    # Calculate text position (rough estimation)
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) / 2
    y = (size[1] - text_height) / 2
    
    d.text((x, y), text, fill=TEXT_COLOR, font=font)
    
    # Save
    img.save(path)
    print(f"✅ Generated: {path}")

def main():
    base_path = os.path.join(os.path.dirname(__file__), ASSETS_DIR)
    
    print(f"🚀 Generating placeholders in {base_path}...")
    
    for folder, files in STRUCTURE.items():
        folder_path = os.path.join(base_path, folder)
        ensure_dir(folder_path)
        
        for filename in files:
            file_path = os.path.join(folder_path, filename)
            # Determine size based on type
            if "hero" in folder:
                size = (1080, 600) # Landscape
            elif "icons" in folder:
                size = (128, 128) # Square icon
            else:
                size = (600, 600) # Square illustration
                
            create_placeholder(file_path, filename, size)
            
    print("✨ All placeholders generated!")

if __name__ == "__main__":
    main()