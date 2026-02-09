"""
Prepare Dataset for Manual Editing

This script organizes the training data into editable categories:
1. exercises/  - Exercise Q&A (English)
2. nutrition/  - Food & nutrition Q&A (English)
3. arabic/     - Arabic content (add your own)
4. egyptian/   - Egyptian-specific content (add your own)
5. forma/      - Forma app specific Q&A (add your own)
6. excluded/   - Stuff to exclude from training

After editing, run: python scripts/merge_final_dataset.py
"""

import json
import os
import re

print("=" * 60)
print("  PREPARING DATASET FOR MANUAL EDITING")
print("=" * 60)

# Paths
base_dir = os.path.dirname(os.path.dirname(__file__))
training_dir = os.path.join(base_dir, "training-data")
edit_dir = os.path.join(training_dir, "editable")

# Create folder structure
folders = ["exercises", "nutrition", "general", "arabic", "egyptian", "forma", "excluded"]
for folder in folders:
    os.makedirs(os.path.join(edit_dir, folder), exist_ok=True)

# Load merged data
merged_path = os.path.join(training_dir, "fitness-sharegpt.json")
with open(merged_path, "r", encoding="utf-8") as f:
    all_data = json.load(f)

print(f"\nTotal conversations: {len(all_data)}")

# Categorize data
categories = {
    "exercises": [],
    "nutrition": [],
    "general": [],
    "arabic": [],
}

# Arabic detection
arabic_pattern = re.compile(r'[\u0600-\u06FF]')

for conv in all_data:
    if not conv.get("conversations"):
        continue

    first_msg = conv["conversations"][0]["value"].lower()

    # Check if Arabic
    if arabic_pattern.search(conv["conversations"][0]["value"]):
        categories["arabic"].append(conv)
    # Exercise related
    elif any(word in first_msg for word in ["exercise", "workout", "squat", "deadlift", "bench", "press", "curl", "row", "pull", "push", "lift", "rep", "set", "muscle", "bicep", "tricep", "chest", "back", "leg", "shoulder", "abs", "core"]):
        categories["exercises"].append(conv)
    # Nutrition related
    elif any(word in first_msg for word in ["eat", "food", "calorie", "protein", "carb", "fat", "diet", "meal", "nutrition", "macro", "supplement", "vitamin", "creatine", "whey"]):
        categories["nutrition"].append(conv)
    else:
        categories["general"].append(conv)

# Save each category
for cat, data in categories.items():
    # Split into chunks of 1000 for easier editing
    chunk_size = 1000
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        chunk_num = i // chunk_size + 1
        filename = f"{cat}_{chunk_num}.json"
        filepath = os.path.join(edit_dir, cat, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(chunk, f, indent=2, ensure_ascii=False)
    print(f"  {cat}: {len(data)} conversations")

# Create empty template files for custom content
templates = {
    "egyptian": {
        "description": "Egyptian-specific fitness content - foods, gyms, culture",
        "example": [
            {
                "conversations": [
                    {"from": "human", "value": "ايه افضل اكل بعد التمرين في مصر؟"},
                    {"from": "gpt", "value": "بعد التمرين محتاج بروتين وكاربوهيدرات. اختيارات مصرية ممتازة:\n\n1. فول بالبيض - بروتين عالي\n2. كشري - كاربوهيدرات للطاقة\n3. فراخ مشوية مع رز\n4. زبادي يوناني مع موز\n\nالمهم تاكل خلال ساعتين من التمرين."}
                ]
            },
            {
                "conversations": [
                    {"from": "human", "value": "What Egyptian foods are good for muscle building?"},
                    {"from": "gpt", "value": "Egypt has excellent protein sources for muscle building:\n\n**High Protein Options:**\n- Foul (fava beans): 8g protein per cup\n- Eggs (cheap and available everywhere)\n- Grilled chicken (فراخ مشوية)\n- Liver (كبدة) - high in protein and iron\n- Greek yogurt (زبادي)\n\n**Carb Sources:**\n- Aish baladi (whole wheat bread)\n- Rice\n- Sweet potato (بطاطا)\n\n**Egyptian Protein Tip:** Foul + eggs is a classic, cheap, high-protein breakfast that bodybuilders use."}
                ]
            }
        ]
    },
    "forma": {
        "description": "Forma app specific - features, how to use, trainers, programs",
        "example": [
            {
                "conversations": [
                    {"from": "human", "value": "What is Forma Fitness?"},
                    {"from": "gpt", "value": "Forma Fitness is Egypt's premier fitness platform that connects you with certified trainers, personalized workout programs, and nutrition tracking.\n\n**Key Features:**\n- Find certified Egyptian trainers\n- Custom workout programs\n- Track your workouts and progress\n- Nutrition and meal planning\n- Video call sessions with trainers\n- Arabic and English support\n\nWhether you're a beginner or advanced, Forma helps you achieve your fitness goals with local expertise."}
                ]
            },
            {
                "conversations": [
                    {"from": "human", "value": "ازاي اختار مدرب على فورما؟"},
                    {"from": "gpt", "value": "اختيار المدرب المناسب على فورما:\n\n1. **حدد هدفك** - تخسيس، تضخيم، لياقة عامة\n2. **شوف التقييمات** - اقرأ آراء العملاء السابقين\n3. **اتصل بالمدرب** - اطلب استشارة مجانية\n4. **اختار الباقة** - شهرية أو ربع سنوية\n\nكل المدربين على فورما معتمدين ومتخصصين."}
                ]
            }
        ]
    },
    "arabic": {
        "description": "Arabic fitness content - general Arabic Q&A",
        "example": [
            {
                "conversations": [
                    {"from": "human", "value": "كم عدد المجموعات لبناء العضلات؟"},
                    {"from": "gpt", "value": "لبناء العضلات بشكل مثالي:\n\n**المجموعات الأسبوعية لكل عضلة:**\n- مبتدئ: 10-12 مجموعة\n- متوسط: 12-16 مجموعة\n- متقدم: 16-20 مجموعة\n\n**في كل تمرين:**\n- 3-4 مجموعات لكل تمرين\n- 8-12 تكرار للتضخيم\n- راحة 60-90 ثانية\n\nالمهم: زيادة الحمل تدريجياً كل أسبوع."}
                ]
            }
        ]
    }
}

for name, content in templates.items():
    template_path = os.path.join(edit_dir, name, "_TEMPLATE_ADD_YOUR_DATA.json")
    with open(template_path, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)

# Create README
readme = """# Training Data - Editable

## Folder Structure

```
editable/
├── exercises/     # Exercise Q&A (auto-sorted from downloads)
├── nutrition/     # Food & nutrition Q&A (auto-sorted)
├── general/       # General fitness Q&A
├── arabic/        # Arabic content (ADD YOUR OWN!)
├── egyptian/      # Egyptian-specific (ADD YOUR OWN!)
├── forma/         # Forma app specific (ADD YOUR OWN!)
└── excluded/      # Move files here to EXCLUDE from training
```

## How to Edit

### Add New Content
1. Create a new JSON file in the appropriate folder
2. Use this format:
```json
[
  {
    "conversations": [
      {"from": "human", "value": "User question"},
      {"from": "gpt", "value": "AI answer"}
    ]
  }
]
```

### Exclude Content
- Move any file to `excluded/` folder
- Or delete the file

### Important Folders to Fill:
- **egyptian/** - Add Egyptian foods, gyms, local tips
- **forma/** - Add Forma app features, how-to guides
- **arabic/** - Add more Arabic Q&A

## After Editing

Run this to merge everything:
```bash
python scripts/merge_final_dataset.py
```

Then train:
```bash
python scripts/train_local.py
```
"""

readme_path = os.path.join(edit_dir, "README.md")
with open(readme_path, "w", encoding="utf-8") as f:
    f.write(readme)

print(f"\n" + "=" * 60)
print("  DONE! Data organized for editing")
print("=" * 60)
print(f"\n  Edit folder: {edit_dir}")
print(f"\n  Folders to ADD your content:")
print(f"    - {os.path.join(edit_dir, 'egyptian')} (Egyptian-specific)")
print(f"    - {os.path.join(edit_dir, 'forma')} (Forma app)")
print(f"    - {os.path.join(edit_dir, 'arabic')} (More Arabic)")
print(f"\n  To EXCLUDE content:")
print(f"    - Move files to: {os.path.join(edit_dir, 'excluded')}")
print(f"\n  After editing, run:")
print(f"    python scripts/merge_final_dataset.py")
print("=" * 60)
