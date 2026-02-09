"""
Forma Fitness - Local Training Script
RTX 5060 8GB optimized

Requirements (run in PowerShell):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps trl peft accelerate bitsandbytes

Usage:
cd C:\\Users\\pc\\Desktop\\G\\FitApp\\apps\\api
python scripts/train_local.py
"""

import os
import json
import torch

print("=" * 50)
print("  FORMA FITNESS - MODEL TRAINING")
print("=" * 50)

# Check GPU
if not torch.cuda.is_available():
    print("\nERROR: No CUDA GPU detected!")
    print("Make sure you have NVIDIA drivers installed.")
    print("Download from: https://www.nvidia.com/drivers")
    exit(1)

gpu_name = torch.cuda.get_device_name(0)
gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
print(f"\nGPU: {gpu_name}")
print(f"VRAM: {gpu_memory:.1f} GB")

# RTX 5060 with 8GB - use Qwen 3B with conservative settings
MODEL_NAME = "unsloth/Qwen2.5-3B-Instruct-bnb-4bit"
BATCH_SIZE = 1
LORA_R = 16
MAX_STEPS = 300  # ~20-30 minutes training

print(f"\nModel: {MODEL_NAME}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Training steps: {MAX_STEPS}")

# ============================================
# IMPORTS
# ============================================

from unsloth import FastLanguageModel
from datasets import Dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# ============================================
# CONFIGURATION
# ============================================

MAX_SEQ_LENGTH = 2048
OUTPUT_DIR = "forma-fitness-model"

# ============================================
# LOAD MODEL
# ============================================

print("\nLoading model...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=None,
    load_in_4bit=True,
)

# Add LoRA
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                   "gate_proj", "up_proj", "down_proj"],
    lora_alpha=LORA_R,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# ============================================
# LOAD DATA
# ============================================

print("Loading training data...")

# Try multiple paths
possible_paths = [
    "training-data/fitness-sharegpt.json",
    "apps/api/training-data/fitness-sharegpt.json",
    os.path.join(os.path.dirname(__file__), "..", "training-data", "fitness-sharegpt.json"),
]

data_path = None
for p in possible_paths:
    if os.path.exists(p):
        data_path = p
        break

if not data_path:
    print(f"ERROR: Training data not found!")
    print("Run: npx ts-node scripts/generate-advanced-chatbot-dataset.ts")
    exit(1)

print(f"Using data: {data_path}")

with open(data_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

SYSTEM_PROMPT = """You are Forma AI, a knowledgeable fitness assistant. You provide accurate, science-based advice on exercise, nutrition, and health."""

def format_conversation(example):
    text = f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n"
    for msg in example["conversations"]:
        role = "user" if msg["from"] == "human" else "assistant"
        text += f"<|im_start|>{role}\n{msg['value']}<|im_end|>\n"
    return {"text": text}

dataset = Dataset.from_list(raw_data)
dataset = dataset.map(format_conversation)
print(f"Training on {len(dataset)} conversations")

# ============================================
# TRAIN
# ============================================

print("\nStarting training...")

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    args=TrainingArguments(
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=200,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        optim="adamw_8bit",
        output_dir=OUTPUT_DIR,
        report_to="none",
    ),
)

trainer.train()

# ============================================
# SAVE
# ============================================

print("\nSaving model...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

# Save GGUF for llama.cpp
print("Converting to GGUF...")
model.save_pretrained_gguf(OUTPUT_DIR, tokenizer, quantization_method="q4_k_m")

print("\n" + "=" * 50)
print("DONE!")
print("=" * 50)
print(f"GGUF model saved to: {OUTPUT_DIR}/")
print("\nNext steps:")
print("1. Copy the .gguf file to llama.cpp folder")
print("2. Run: ./llama-cli -m forma-fitness-model.gguf -p 'How do I build muscle?'")
print("   OR")
print("   ollama create forma-fitness -f Modelfile")
