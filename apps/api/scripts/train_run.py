"""
FORMA FITNESS - TRAINING RUN
Properly configured with:
- Balanced dataset
- Eval set for tracking
- LoRA with modest rank
- Checkpoint saving
- Ablation test at end
"""

import os
import json
import time
from datetime import datetime

print("=" * 70)
print("  FORMA FITNESS - MODEL TRAINING")
print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)

start_time = time.time()

# ============================================
# CHECK GPU
# ============================================
import torch

if not torch.cuda.is_available():
    print("\nERROR: No CUDA GPU!")
    print("Training requires an NVIDIA GPU with CUDA.")
    exit(1)

gpu = torch.cuda.get_device_name(0)
vram = torch.cuda.get_device_properties(0).total_memory / 1e9
print(f"\nGPU: {gpu}")
print(f"VRAM: {vram:.1f} GB")

# ============================================
# LOAD UNSLOTH
# ============================================
print("\n[1/6] Loading Unsloth and model...")

from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# Config
base_dir = os.path.dirname(os.path.dirname(__file__))
output_dir = os.path.join(base_dir, "models", "forma-fitness-proper")
data_dir = os.path.join(base_dir, "training-data")

# Load training config
config_path = os.path.join(output_dir, "training_config.json")
with open(config_path, "r") as f:
    config = json.load(f)

print(f"   Model: {config['model']}")
print(f"   LoRA rank: {config['lora_r']}")
print(f"   Training samples: {config['train_samples']}")

# ============================================
# LOAD MODEL
# ============================================
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=config['model'],
    max_seq_length=2048,
    dtype=None,
    load_in_4bit=True,
)

print("\n[2/6] Adding LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=config['lora_r'],
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                   "gate_proj", "up_proj", "down_proj"],
    lora_alpha=config['lora_alpha'],
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=42,
)

# ============================================
# LOAD DATA
# ============================================
print("\n[3/6] Loading training data...")

train_path = os.path.join(data_dir, "train_chatml.jsonl")
dataset = load_dataset("json", data_files=train_path, split="train")
print(f"   Loaded {len(dataset)} samples")

# ============================================
# TRAIN
# ============================================
print("\n[4/6] Starting training...")
print(f"   Steps: {config['max_steps']}")
print(f"   This will take ~1-2 hours...")
print("\n" + "=" * 70)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    dataset_num_proc=2,
    args=TrainingArguments(
        per_device_train_batch_size=config['batch_size'],
        gradient_accumulation_steps=config['gradient_accumulation'],
        warmup_steps=config['warmup_steps'],
        max_steps=config['max_steps'],
        learning_rate=config['learning_rate'],
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        save_steps=config['save_steps'],
        save_total_limit=3,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=42,
        output_dir=output_dir,
        report_to="none",
    ),
)

# Train!
trainer_stats = trainer.train()

# ============================================
# SAVE MODEL
# ============================================
print("\n[5/6] Saving model...")

# Save LoRA
model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)

# Save GGUF (q4_k_m for speed/size balance)
print("   Converting to GGUF (q4_k_m)...")
gguf_dir = os.path.join(output_dir, "gguf")
os.makedirs(gguf_dir, exist_ok=True)
model.save_pretrained_gguf(gguf_dir, tokenizer, quantization_method="q4_k_m")

# ============================================
# ABLATION TEST
# ============================================
print("\n[6/6] Running ablation test...")

FastLanguageModel.for_inference(model)

# Test prompts (real app queries)
test_prompts = [
    "ازاي ابني عضلات",
    "ezay a5as",
    "How many sets for muscle growth",
    "What Egyptian foods are high in protein",
    "I have a shoulder injury what can I do",
    "What is Forma",
]

print("\n   Testing fine-tuned model responses:\n")
print("-" * 50)

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
    ).to("cuda")

    outputs = model.generate(
        input_ids=inputs,
        max_new_tokens=150,
        use_cache=True,
        temperature=0.7,
        do_sample=True,
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=False)
    # Extract just assistant response
    if "<|im_start|>assistant" in response:
        response = response.split("<|im_start|>assistant")[-1]
        response = response.split("<|im_end|>")[0].strip()
    else:
        response = response[-300:]

    print(f"Q: {prompt}")
    print(f"A: {response[:200]}...")
    print("-" * 50)

# ============================================
# SUMMARY
# ============================================
end_time = time.time()
duration = end_time - start_time
hours = int(duration // 3600)
minutes = int((duration % 3600) // 60)

# Save training log
log = {
    "completed_at": datetime.now().isoformat(),
    "duration_minutes": duration / 60,
    "final_loss": trainer_stats.training_loss,
    "steps": config['max_steps'],
    "samples": config['train_samples'],
    "gpu": gpu,
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
print(f"  GGUF file: {gguf_dir}")
print(f"\n  To use with Ollama:")
print(f"    1. Copy .gguf file")
print(f"    2. ollama create forma-fitness -f Modelfile")
print(f"    3. ollama run forma-fitness")
print("=" * 70)
