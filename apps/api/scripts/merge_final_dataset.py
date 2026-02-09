"""
Merge Final Dataset for Training

This script merges all edited data from editable/ folders
(excluding the 'excluded' folder) into a final training dataset.

Usage: python scripts/merge_final_dataset.py
"""

import json
import os
import glob

print("=" * 60)
print("  MERGING FINAL DATASET")
print("=" * 60)

base_dir = os.path.dirname(os.path.dirname(__file__))
edit_dir = os.path.join(base_dir, "training-data", "editable")
output_dir = os.path.join(base_dir, "training-data")

all_conversations = []
stats = {}

# Process each folder (except 'excluded')
folders = ["exercises", "nutrition", "general", "arabic", "egyptian", "forma"]

for folder in folders:
    folder_path = os.path.join(edit_dir, folder)
    if not os.path.exists(folder_path):
        continue

    folder_count = 0
    for json_file in glob.glob(os.path.join(folder_path, "*.json")):
        # Skip template files
        if "_TEMPLATE" in json_file:
            continue

        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Handle both list and dict with 'example' key
            if isinstance(data, dict) and "example" in data:
                data = data["example"]

            if isinstance(data, list):
                all_conversations.extend(data)
                folder_count += len(data)
        except Exception as e:
            print(f"  Warning: Could not load {json_file}: {e}")

    stats[folder] = folder_count
    print(f"  {folder}: {folder_count} conversations")

# Remove duplicates
print(f"\nRemoving duplicates...")
seen = set()
unique = []
for conv in all_conversations:
    if conv.get("conversations"):
        key = conv["conversations"][0]["value"][:100]
        if key not in seen:
            seen.add(key)
            unique.append(conv)

removed = len(all_conversations) - len(unique)
print(f"  Removed {removed} duplicates")

# Save final dataset
final_path = os.path.join(output_dir, "fitness-final.json")
with open(final_path, "w", encoding="utf-8") as f:
    json.dump(unique, f, indent=2, ensure_ascii=False)

# Also save as the main training file
main_path = os.path.join(output_dir, "fitness-sharegpt.json")
with open(main_path, "w", encoding="utf-8") as f:
    json.dump(unique, f, indent=2, ensure_ascii=False)

# Save ChatML format for training
chatml_path = os.path.join(output_dir, "fitness-chatml.jsonl")
SYSTEM = "You are Forma AI, a bilingual (Arabic/English) fitness assistant for Egypt. You provide accurate, science-based advice on exercise, nutrition, and health."

with open(chatml_path, "w", encoding="utf-8") as f:
    for conv in unique:
        text = f"<|im_start|>system\n{SYSTEM}<|im_end|>\n"
        for msg in conv.get("conversations", []):
            role = "user" if msg["from"] == "human" else "assistant"
            text += f"<|im_start|>{role}\n{msg['value']}<|im_end|>\n"
        f.write(json.dumps({"text": text}, ensure_ascii=False) + "\n")

print(f"\n" + "=" * 60)
print("  FINAL DATASET READY!")
print("=" * 60)
print(f"\n  Total: {len(unique)} conversations")
print(f"\n  Breakdown:")
for folder, count in stats.items():
    print(f"    - {folder}: {count}")
print(f"\n  Files saved:")
print(f"    - {final_path}")
print(f"    - {main_path}")
print(f"    - {chatml_path}")
print(f"\n  Ready to train! Run:")
print(f"    python scripts/train_local.py")
print("=" * 60)
