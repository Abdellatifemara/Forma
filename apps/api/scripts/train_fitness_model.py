"""
Forma Fitness Chatbot - Fine-tuning Script for Unsloth

Run this in Google Colab with GPU runtime (T4 or A100)
Or locally with 8GB+ VRAM GPU

Usage:
1. Upload fitness-sharegpt.json to Colab
2. Run this script
3. Download the GGUF model
4. Deploy with Ollama
"""

# ============================================
# STEP 1: INSTALL DEPENDENCIES
# ============================================
# !pip install unsloth
# !pip install --no-deps trl peft accelerate bitsandbytes

# ============================================
# STEP 2: IMPORTS
# ============================================

from unsloth import FastLanguageModel
from datasets import load_dataset, Dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import torch
import json

# ============================================
# STEP 3: CONFIGURATION
# ============================================

# Model configuration
MODEL_NAME = "unsloth/Qwen2.5-3B-Instruct-bnb-4bit"  # Fast, supports Arabic
# Alternative models:
# "unsloth/Llama-3.2-3B-Instruct-bnb-4bit"  # Good general performance
# "unsloth/Qwen2.5-7B-Instruct-bnb-4bit"    # Higher quality, needs more VRAM
# "unsloth/Mistral-7B-Instruct-v0.3-bnb-4bit"  # Strong reasoning

MAX_SEQ_LENGTH = 2048
DTYPE = None  # Auto-detect (float16 or bfloat16)
LOAD_IN_4BIT = True

# LoRA configuration
LORA_R = 16  # Rank - higher = more capacity, more VRAM
LORA_ALPHA = 16
LORA_DROPOUT = 0

# Training configuration
BATCH_SIZE = 2
GRADIENT_ACCUMULATION = 4
LEARNING_RATE = 2e-4
MAX_STEPS = 200  # Increase for better results (500-1000)
WARMUP_STEPS = 10

# Output
OUTPUT_DIR = "forma-fitness-model"

# ============================================
# STEP 4: LOAD MODEL
# ============================================

print("Loading base model...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=DTYPE,
    load_in_4bit=LOAD_IN_4BIT,
)

# ============================================
# STEP 5: ADD LORA ADAPTERS
# ============================================

print("Adding LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    use_gradient_checkpointing="unsloth",  # 30% less VRAM
    random_state=3407,
    use_rslora=False,
    loftq_config=None,
)

# ============================================
# STEP 6: PREPARE DATASET
# ============================================

print("Loading training data...")

# Load the ShareGPT format data
with open("training-data/fitness-sharegpt.json", "r") as f:
    raw_data = json.load(f)

# System prompt
SYSTEM_PROMPT = """You are Forma AI, a knowledgeable fitness assistant created by Forma Fitness. You provide accurate, science-based advice on exercise, nutrition, and health based on guidelines from NSCA, ACSM, and NASM. You are friendly, supportive, and always prioritize user safety. If asked about medical conditions or injuries, you recommend consulting a healthcare professional. You can communicate in both English and Arabic."""

def format_conversation(example):
    """Format conversation to ChatML format for Qwen"""
    text = f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n"

    for msg in example["conversations"]:
        if msg["from"] == "human":
            text += f"<|im_start|>user\n{msg['value']}<|im_end|>\n"
        else:
            text += f"<|im_start|>assistant\n{msg['value']}<|im_end|>\n"

    return {"text": text}

# Convert to dataset
dataset = Dataset.from_list(raw_data)
dataset = dataset.map(format_conversation)

print(f"Training on {len(dataset)} conversations")

# ============================================
# STEP 7: TRAIN
# ============================================

print("Starting training...")

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION,
        warmup_steps=WARMUP_STEPS,
        max_steps=MAX_STEPS,
        learning_rate=LEARNING_RATE,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir=OUTPUT_DIR,
        report_to="none",  # Set to "wandb" for logging
    ),
)

# Train
trainer_stats = trainer.train()

print("\n" + "=" * 50)
print("TRAINING COMPLETE!")
print("=" * 50)
print(f"Training Loss: {trainer_stats.training_loss:.4f}")
print(f"Training Time: {trainer_stats.metrics['train_runtime']:.2f}s")

# ============================================
# STEP 8: SAVE MODEL
# ============================================

print("\nSaving model...")

# Save LoRA adapters
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

# Save to GGUF for llama.cpp/Ollama
# Q4_K_M is a good balance of size and quality
print("\nConverting to GGUF (q4_k_m)...")
model.save_pretrained_gguf(
    OUTPUT_DIR,
    tokenizer,
    quantization_method="q4_k_m"
)

# Also save q8_0 for higher quality (larger file)
print("Converting to GGUF (q8_0)...")
model.save_pretrained_gguf(
    f"{OUTPUT_DIR}-q8",
    tokenizer,
    quantization_method="q8_0"
)

print("\n" + "=" * 50)
print("MODEL SAVED!")
print("=" * 50)
print(f"Files created:")
print(f"  • {OUTPUT_DIR}/adapter_model.safetensors (LoRA adapters)")
print(f"  • {OUTPUT_DIR}-unsloth.Q4_K_M.gguf (for Ollama, smaller)")
print(f"  • {OUTPUT_DIR}-q8-unsloth.Q8_0.gguf (for Ollama, better quality)")
print()
print("Next steps:")
print("1. Download the GGUF file")
print("2. Create a Modelfile (see OFFLINE_CHATBOT_GUIDE.md)")
print("3. Run: ollama create forma-fitness -f Modelfile")
print("4. Test: ollama run forma-fitness")

# ============================================
# STEP 9: TEST THE MODEL
# ============================================

print("\n" + "=" * 50)
print("TESTING MODEL...")
print("=" * 50)

# Enable inference mode
FastLanguageModel.for_inference(model)

# Test prompts
test_prompts = [
    "How many sets should I do for muscle growth?",
    "What should I eat before a workout?",
    "Is creatine safe to take?",
]

for prompt in test_prompts:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
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
        max_new_tokens=256,
        use_cache=True,
        temperature=0.7,
        top_p=0.9,
    )

    response = tokenizer.batch_decode(outputs)[0]
    # Extract just the assistant response
    response = response.split("<|im_start|>assistant\n")[-1].split("<|im_end|>")[0]

    print(f"\nQ: {prompt}")
    print(f"A: {response[:500]}...")
    print("-" * 40)

print("\nDone! Your Forma Fitness model is ready.")
