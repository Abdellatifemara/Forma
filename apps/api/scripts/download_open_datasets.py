"""
Download and merge open-source fitness datasets from Hugging Face
100% FREE and OPEN SOURCE

Datasets included:
- hammamwahab/fitness-qa
- its-myrto/fitness-question-answers
- chibbss/fitness-chat-prompt-completion-dataset
- PandurangMopgar/fitness__data

Usage:
pip install datasets
python scripts/download_open_datasets.py
"""

import json
import os

print("=" * 50)
print("  DOWNLOADING OPEN-SOURCE FITNESS DATASETS")
print("=" * 50)

try:
    from datasets import load_dataset
except ImportError:
    print("\nInstalling datasets library...")
    os.system("pip install datasets")
    from datasets import load_dataset

output_dir = os.path.join(os.path.dirname(__file__), "..", "training-data")
os.makedirs(output_dir, exist_ok=True)

all_conversations = []

# ============================================
# Dataset 1: hammamwahab/fitness-qa
# ============================================
print("\n1. Downloading hammamwahab/fitness-qa...")
try:
    ds = load_dataset("hammamwahab/fitness-qa", split="train")
    count = 0
    for item in ds:
        # Convert to ShareGPT format
        if "question" in item and "answer" in item:
            all_conversations.append({
                "conversations": [
                    {"from": "human", "value": item["question"]},
                    {"from": "gpt", "value": item["answer"]}
                ]
            })
            count += 1
    print(f"   Added {count} conversations")
except Exception as e:
    print(f"   Skipped (error): {e}")

# ============================================
# Dataset 2: its-myrto/fitness-question-answers
# ============================================
print("\n2. Downloading its-myrto/fitness-question-answers...")
try:
    ds = load_dataset("its-myrto/fitness-question-answers", split="train")
    count = 0
    for item in ds:
        q_key = "question" if "question" in item else "Question" if "Question" in item else None
        a_key = "answer" if "answer" in item else "Answer" if "Answer" in item else None
        if q_key and a_key and item[q_key] and item[a_key]:
            all_conversations.append({
                "conversations": [
                    {"from": "human", "value": str(item[q_key])},
                    {"from": "gpt", "value": str(item[a_key])}
                ]
            })
            count += 1
    print(f"   Added {count} conversations")
except Exception as e:
    print(f"   Skipped (error): {e}")

# ============================================
# Dataset 3: chibbss/fitness-chat-prompt-completion-dataset
# ============================================
print("\n3. Downloading chibbss/fitness-chat-prompt-completion-dataset...")
try:
    ds = load_dataset("chibbss/fitness-chat-prompt-completion-dataset", split="train")
    count = 0
    for item in ds:
        prompt_key = "prompt" if "prompt" in item else "input" if "input" in item else None
        completion_key = "completion" if "completion" in item else "output" if "output" in item else None
        if prompt_key and completion_key and item[prompt_key] and item[completion_key]:
            all_conversations.append({
                "conversations": [
                    {"from": "human", "value": str(item[prompt_key])},
                    {"from": "gpt", "value": str(item[completion_key])}
                ]
            })
            count += 1
    print(f"   Added {count} conversations")
except Exception as e:
    print(f"   Skipped (error): {e}")

# ============================================
# Dataset 4: PandurangMopgar/fitness__data
# ============================================
print("\n4. Downloading PandurangMopgar/fitness__data...")
try:
    ds = load_dataset("PandurangMopgar/fitness__data", split="train")
    count = 0
    for item in ds:
        # Check various possible column names
        for q_col in ["question", "Question", "input", "prompt", "instruction"]:
            for a_col in ["answer", "Answer", "output", "response", "completion"]:
                if q_col in item and a_col in item and item[q_col] and item[a_col]:
                    all_conversations.append({
                        "conversations": [
                            {"from": "human", "value": str(item[q_col])},
                            {"from": "gpt", "value": str(item[a_col])}
                        ]
                    })
                    count += 1
                    break
            else:
                continue
            break
    print(f"   Added {count} conversations")
except Exception as e:
    print(f"   Skipped (error): {e}")

# ============================================
# Dataset 5: onurSakar/GYM-Exercise
# ============================================
print("\n5. Downloading onurSakar/GYM-Exercise...")
try:
    ds = load_dataset("onurSakar/GYM-Exercise", split="train")
    count = 0
    for item in ds:
        # This might be exercise data, convert to Q&A
        if "Exercise" in item or "exercise" in item or "name" in item:
            ex_name = item.get("Exercise") or item.get("exercise") or item.get("name", "")
            description = item.get("Description") or item.get("description") or item.get("instructions", "")
            muscles = item.get("Muscle") or item.get("muscle") or item.get("target", "")

            if ex_name and (description or muscles):
                answer = ""
                if description:
                    answer += f"{description}\n\n"
                if muscles:
                    answer += f"Target muscles: {muscles}"

                all_conversations.append({
                    "conversations": [
                        {"from": "human", "value": f"How do I do {ex_name}?"},
                        {"from": "gpt", "value": answer.strip()}
                    ]
                })
                count += 1
    print(f"   Added {count} conversations")
except Exception as e:
    print(f"   Skipped (error): {e}")

# ============================================
# Load existing Forma data and merge
# ============================================
print("\n6. Loading existing Forma training data...")
forma_path = os.path.join(output_dir, "fitness-sharegpt.json")
if os.path.exists(forma_path):
    with open(forma_path, "r", encoding="utf-8") as f:
        forma_data = json.load(f)
    print(f"   Found {len(forma_data)} existing conversations")
    all_conversations.extend(forma_data)
else:
    print("   No existing data found")

# ============================================
# Remove duplicates and save
# ============================================
print("\n7. Removing duplicates...")
seen = set()
unique_conversations = []
for conv in all_conversations:
    # Create a key from the first message
    if conv["conversations"]:
        key = conv["conversations"][0]["value"][:100]  # First 100 chars
        if key not in seen:
            seen.add(key)
            unique_conversations.append(conv)

print(f"   Removed {len(all_conversations) - len(unique_conversations)} duplicates")

# Save merged dataset
merged_path = os.path.join(output_dir, "fitness-merged.json")
with open(merged_path, "w", encoding="utf-8") as f:
    json.dump(unique_conversations, f, indent=2, ensure_ascii=False)

# Also update the main training file
with open(forma_path, "w", encoding="utf-8") as f:
    json.dump(unique_conversations, f, indent=2, ensure_ascii=False)

print("\n" + "=" * 50)
print("  DOWNLOAD COMPLETE!")
print("=" * 50)
print(f"\n  Total conversations: {len(unique_conversations)}")
print(f"  Saved to: {merged_path}")
print(f"  Updated: {forma_path}")
print("\n  Now run: python scripts/train_local.py")
print("=" * 50)
