"""
FORMA FITNESS - SIMPLE TRAINING (No Unsloth)
Uses standard HuggingFace transformers + peft + trl
More compatible with newer PyTorch versions
"""

import os
import json
import time
from datetime import datetime

import sys
import os

# Force CPU mode for RTX 50 series (Blackwell not yet supported by PyTorch)
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"

# Also disable via torch before import
import torch
torch.cuda.is_available = lambda: False

sys.stdout.reconfigure(line_buffering=True)

print("=" * 70, flush=True)
print("  FORMA FITNESS - MODEL TRAINING (Simple Mode)", flush=True)
print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
print("=" * 70, flush=True)

start_time = time.time()

# ============================================
# CHECK GPU
# ============================================
import torch

# RTX 5060 (Blackwell sm_120) not yet supported by PyTorch
# Force CPU training until PyTorch adds support
gpu_name = None
if torch.cuda.is_available():
    try:
        gpu_name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"\nGPU detected: {gpu_name}")
        print(f"VRAM: {vram:.1f} GB")

        # Check if GPU is RTX 50 series (Blackwell - not supported yet)
        if "5060" in gpu_name or "5070" in gpu_name or "5080" in gpu_name or "5090" in gpu_name:
            print("\nWARNING: RTX 50 series (Blackwell) not yet supported by PyTorch!")
            print("Falling back to CPU training (slower but works)...")
            device = "cpu"
        else:
            device = "cuda"
    except Exception as e:
        print(f"\nGPU error: {e}")
        print("Falling back to CPU...")
        device = "cpu"
else:
    print("\nNo CUDA GPU detected.")
    device = "cpu"

if device == "cpu":
    print("\nTraining on CPU - this will take longer but will complete successfully.")
    print("Consider using Google Colab or Kaggle for faster GPU training.")

# ============================================
# LOAD LIBRARIES
# ============================================
print("\n[1/6] Loading libraries...")

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

# Config paths
base_dir = os.path.dirname(os.path.dirname(__file__))
output_dir = os.path.join(base_dir, "models", "forma-fitness-simple")
data_dir = os.path.join(base_dir, "training-data")
os.makedirs(output_dir, exist_ok=True)

# Load config
config_path = os.path.join(base_dir, "models", "forma-fitness-proper", "training_config.json")
with open(config_path, "r") as f:
    config = json.load(f)

# Reduce steps for CPU training
max_steps = config['max_steps']
if device == "cpu":
    max_steps = min(500, max_steps)  # Cap at 500 for CPU
    print(f"   Training samples: {config['train_samples']}")
    print(f"   Max steps: {max_steps} (reduced for CPU)")
else:
    print(f"   Training samples: {config['train_samples']}")
    print(f"   Max steps: {max_steps}")

# ============================================
# LOAD MODEL
# ============================================
print("\n[2/6] Loading model (this may take a few minutes)...")

# Using TinyLlama for faster download and training
# Can upgrade to Qwen2.5-3B-Instruct later if you have better network
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# For CPU training, load in float32 without quantization
if device == "cpu":
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )
else:
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )

print(f"   Model loaded: {model_name}")

# ============================================
# ADD LORA
# ============================================
print("\n[3/6] Adding LoRA adapters...")

lora_config = LoraConfig(
    r=config['lora_r'],
    lora_alpha=config['lora_alpha'],
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"   Trainable: {trainable:,} / {total:,} ({100*trainable/total:.2f}%)")

# ============================================
# LOAD DATA
# ============================================
print("\n[4/6] Loading training data...")

train_path = os.path.join(data_dir, "train_chatml.jsonl")
dataset = load_dataset("json", data_files=train_path, split="train")
print(f"   Loaded {len(dataset)} samples")

# ============================================
# TRAIN
# ============================================
print("\n[5/6] Starting training...")
print(f"   Steps: {config['max_steps']}")
print(f"   This will take several hours...")
print("\n" + "=" * 70)

sft_config = SFTConfig(
    output_dir=output_dir,
    per_device_train_batch_size=1 if device == "cpu" else config['batch_size'],
    gradient_accumulation_steps=config['gradient_accumulation'],
    warmup_steps=min(50, config['warmup_steps']) if device == "cpu" else config['warmup_steps'],
    max_steps=max_steps,
    learning_rate=config['learning_rate'],
    fp16=False,  # CPU doesn't support fp16 training well
    bf16=False,
    logging_steps=10,
    save_steps=config['save_steps'],
    save_total_limit=3,
    optim="adamw_torch",
    weight_decay=0.01,
    lr_scheduler_type="cosine",
    seed=42,
    report_to="none",
    gradient_checkpointing=True,
)

trainer = SFTTrainer(
    model=model,
    processing_class=tokenizer,
    train_dataset=dataset,
    args=sft_config,
)

# Train!
trainer_stats = trainer.train()

# ============================================
# SAVE MODEL
# ============================================
print("\n[6/6] Saving model...")

model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)

# ============================================
# QUICK TEST
# ============================================
print("\n   Testing model with sample prompts...")

test_prompts = [
    "ازاي ابني عضلات",
    "ezay a5as",
    "How many sets for muscle growth",
]

for prompt in test_prompts:
    messages = [
        {"role": "system", "content": config['system_prompt']},
        {"role": "user", "content": prompt},
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt",
    ).to(device)

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs,
            max_new_tokens=100,
            temperature=0.7,
            do_sample=True,
        )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"\nQ: {prompt}")
    print(f"A: {response[-200:]}")

# ============================================
# SUMMARY
# ============================================
end_time = time.time()
duration = end_time - start_time
hours = int(duration // 3600)
minutes = int((duration % 3600) // 60)

# Save log
log = {
    "completed_at": datetime.now().isoformat(),
    "duration_minutes": duration / 60,
    "final_loss": trainer_stats.training_loss,
    "steps": config['max_steps'],
    "samples": config['train_samples'],
    "gpu": gpu if device == "cuda" else "CPU",
}
log_path = os.path.join(output_dir, "training_log.json")
with open(log_path, "w") as f:
    json.dump(log, f, indent=2)

print("\n" + "=" * 70)
print("  TRAINING COMPLETE!")
print("=" * 70)
print(f"\n  Duration: {hours}h {minutes}m")
print(f"  Final loss: {trainer_stats.training_loss:.4f}")
print(f"\n  Model saved to: {output_dir}")
print("=" * 70)
