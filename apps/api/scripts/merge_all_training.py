#!/usr/bin/env python3
"""
Merge ALL training data into final comprehensive dataset
Preserves original train_final.json and adds new unique samples
"""

import json
import os

# Base directory for training data
TRAINING_DIR = "C:/Users/pc/Desktop/G/FitApp/apps/api/training-data"

# Load the base dataset first (keep all of it)
base_file = os.path.join(TRAINING_DIR, "train_final.json")
with open(base_file, 'r', encoding='utf-8') as f:
    all_data = json.load(f)

print(f"Base dataset: {len(all_data):,} samples from train_final.json")

# Collect existing instructions to avoid adding duplicates
existing_instructions = set()
for item in all_data:
    instruction = item.get('instruction', item.get('input', ''))
    if instruction:
        existing_instructions.add(instruction.strip().lower())

# New files to add
new_files = [
    "forma_identity_training.json",  # App integration, identity
    "combat_egyptian_training.json", # Egyptian combat sports
    "exercises_faq_training.json",   # Exercise FAQs
    "science_based_training.json",   # WHO, research, goals
    "combat_sports_training.json",   # Boxing, BJJ, Muay Thai
    "advanced_training.json",        # Calisthenics, mixed training
]

new_samples_added = 0
file_counts = {}

for filename in new_files:
    filepath = os.path.join(TRAINING_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        added_from_file = 0
        for item in data:
            instruction = item.get('instruction', item.get('input', ''))
            if instruction:
                key = instruction.strip().lower()
                if key not in existing_instructions:
                    existing_instructions.add(key)
                    all_data.append(item)
                    added_from_file += 1
                    new_samples_added += 1

        file_counts[filename] = added_from_file
        print(f"Added {added_from_file} new samples from {filename}")
    else:
        print(f"WARNING: File not found: {filename}")

print(f"\n{'='*60}")
print(f"Original base: 9,356 samples")
print(f"New samples added: {new_samples_added}")
print(f"Final total: {len(all_data):,} samples")
print(f"{'='*60}")

# Save the comprehensive dataset
output_file = os.path.join(TRAINING_DIR, "train_comprehensive.json")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\nSaved to: {output_file}")

# Category breakdown for new samples
categories = {}
for item in all_data:
    cat = item.get("category", "fitness")
    categories[cat] = categories.get(cat, 0) + 1

print(f"\nTop 30 categories:")
for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:30]:
    print(f"  {cat}: {count}")

# Show data is ready for upload
print(f"\n{'='*60}")
print("NEXT STEPS:")
print("1. Push train_comprehensive.json to GitHub")
print("2. Update Colab notebook to use train_comprehensive.json")
print("3. Run training on L4 GPU")
print(f"{'='*60}")
