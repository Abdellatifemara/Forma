"""
EXTENDED TRAINING SCRIPT - RUNS FOR HOURS
Uses full GPU resources for maximum quality

This will train for 1000+ steps (~2-4 hours on RTX 5060)
"""

import os
import json
import torch
import time
from datetime import datetime, timedelta

print("=" * 70)
print("  FORMA FITNESS - EXTENDED MODEL TRAINING")
print("  This will run for several hours - feel free to leave!")
print("=" * 70)

start_time = time.time()

# Check GPU
if not torch.cuda.is_available():
    print("\nERROR: No CUDA GPU detected!")
    exit(1)

gpu_name = torch.cuda.get_device_name(0)
gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
print(f"\nGPU: {gpu_name}")
print(f"VRAM: {gpu_memory:.1f} GB")
print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# ============================================
# CONFIGURATION - EXTENDED TRAINING
# ============================================

# Model - Qwen 2.5 3B (supports Arabic!)
MODEL_NAME = "unsloth/Qwen2.5-3B-Instruct-bnb-4bit"

# Training settings for LONG training
BATCH_SIZE = 1
GRADIENT_ACCUMULATION = 8  # Effective batch = 8
LORA_R = 32  # Higher rank = more capacity
LORA_ALPHA = 32
MAX_STEPS = 1500  # ~2-4 hours
LEARNING_RATE = 1e-4  # Lower LR for longer training
WARMUP_STEPS = 50
SAVE_STEPS = 500  # Save checkpoint every 500 steps

# Calculate estimated time
estimated_minutes = MAX_STEPS * 0.15  # ~9 seconds per step
estimated_hours = estimated_minutes / 60
print(f"\nTraining config:")
print(f"  - Steps: {MAX_STEPS}")
print(f"  - Estimated time: {estimated_hours:.1f} hours")
print(f"  - Checkpoints saved every {SAVE_STEPS} steps")

# ============================================
# INSTALL DEPENDENCIES IF NEEDED
# ============================================

try:
    from unsloth import FastLanguageModel
    from datasets import Dataset
    from trl import SFTTrainer
    from transformers import TrainingArguments
except ImportError:
    print("\nInstalling required packages...")
    os.system("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121")
    os.system('pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"')
    os.system("pip install --no-deps trl peft accelerate bitsandbytes")
    from unsloth import FastLanguageModel
    from datasets import Dataset
    from trl import SFTTrainer
    from transformers import TrainingArguments

# ============================================
# LOAD MODEL
# ============================================

print("\n[1/5] Loading base model...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=2048,
    dtype=None,
    load_in_4bit=True,
)

print("[2/5] Adding LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                   "gate_proj", "up_proj", "down_proj"],
    lora_alpha=LORA_ALPHA,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# ============================================
# LOAD DATA
# ============================================

print("[3/5] Loading training data...")

# Find data files
base_dir = os.path.dirname(os.path.dirname(__file__))
data_paths = [
    os.path.join(base_dir, "training-data", "fitness-final.json"),
    os.path.join(base_dir, "training-data", "fitness-sharegpt.json"),
    os.path.join(base_dir, "training-data", "fitness-massive.json"),
    os.path.join(base_dir, "training-data", "fitness-merged.json"),
]

all_data = []
for path in data_paths:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            all_data.extend(data)
            print(f"   Loaded {len(data)} from {os.path.basename(path)}")

# Remove duplicates
seen = set()
unique_data = []
for conv in all_data:
    if conv.get("conversations"):
        key = conv["conversations"][0]["value"][:100]
        if key not in seen:
            seen.add(key)
            unique_data.append(conv)

print(f"   Total unique conversations: {len(unique_data)}")

# Format for training
SYSTEM_PROMPT = """You are Forma AI, a bilingual fitness assistant for Egypt. You provide accurate, science-based advice on exercise, nutrition, and health. You understand Arabic (Egyptian dialect), Franco Arabic (3aml eh, ezayak), and English. You know Egyptian foods, gyms, and fitness culture. You always prioritize user safety."""

def format_conversation(example):
    text = f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n"
    for msg in example.get("conversations", []):
        role = "user" if msg["from"] == "human" else "assistant"
        text += f"<|im_start|>{role}\n{msg['value']}<|im_end|>\n"
    return {"text": text}

dataset = Dataset.from_list(unique_data)
dataset = dataset.map(format_conversation)

# ============================================
# TRAIN
# ============================================

print(f"\n[4/5] Starting extended training...")
print(f"   {len(dataset)} conversations")
print(f"   {MAX_STEPS} steps")
print(f"   This will take ~{estimated_hours:.1f} hours")
print("\n" + "=" * 70)
print("   TRAINING IN PROGRESS - You can leave now!")
print("   Check back in a few hours...")
print("=" * 70 + "\n")

OUTPUT_DIR = os.path.join(base_dir, "models", "forma-fitness-extended")
os.makedirs(OUTPUT_DIR, exist_ok=True)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    dataset_num_proc=2,
    args=TrainingArguments(
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION,
        warmup_steps=WARMUP_STEPS,
        max_steps=MAX_STEPS,
        learning_rate=LEARNING_RATE,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        save_steps=SAVE_STEPS,
        save_total_limit=3,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=3407,
        output_dir=OUTPUT_DIR,
        report_to="none",
    ),
)

# Train!
trainer_stats = trainer.train()

# ============================================
# SAVE FINAL MODEL
# ============================================

print("\n[5/5] Saving final model...")

# Save LoRA
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

# Save GGUF for llama.cpp (multiple quantizations)
print("   Converting to GGUF (q4_k_m - smaller, faster)...")
model.save_pretrained_gguf(
    os.path.join(OUTPUT_DIR, "gguf-q4"),
    tokenizer,
    quantization_method="q4_k_m"
)

print("   Converting to GGUF (q8_0 - higher quality)...")
model.save_pretrained_gguf(
    os.path.join(OUTPUT_DIR, "gguf-q8"),
    tokenizer,
    quantization_method="q8_0"
)

# ============================================
# SUMMARY
# ============================================

end_time = time.time()
total_time = end_time - start_time
hours = int(total_time // 3600)
minutes = int((total_time % 3600) // 60)

print("\n" + "=" * 70)
print("  TRAINING COMPLETE!")
print("=" * 70)
print(f"\n  Duration: {hours}h {minutes}m")
print(f"  Final loss: {trainer_stats.training_loss:.4f}")
print(f"\n  Model saved to: {OUTPUT_DIR}")
print(f"\n  GGUF files:")
print(f"    - {OUTPUT_DIR}/gguf-q4/ (smaller, ~2GB)")
print(f"    - {OUTPUT_DIR}/gguf-q8/ (better quality, ~4GB)")
print(f"\n  Next steps:")
print(f"    1. Copy .gguf file to Ollama")
print(f"    2. ollama create forma-fitness -f Modelfile")
print(f"    3. ollama run forma-fitness")
print("=" * 70)

# Write completion log
log_path = os.path.join(OUTPUT_DIR, "training_complete.txt")
with open(log_path, "w") as f:
    f.write(f"Training completed at: {datetime.now()}\n")
    f.write(f"Duration: {hours}h {minutes}m\n")
    f.write(f"Final loss: {trainer_stats.training_loss:.4f}\n")
    f.write(f"Steps: {MAX_STEPS}\n")
    f.write(f"Conversations: {len(unique_data)}\n")
