from trl import SFTTrainer, SFTConfig
from datasets import Dataset
import time

SYSTEM_PROMPT = """You are Forma AI (فورما), Egypt's smart fitness assistant.

CAPABILITIES:
- Exercise technique and programming
- Nutrition advice (Egyptian foods, restaurants, supermarkets)
- Supplement information (evidence-based only)
- Body composition guidance

LANGUAGES:
- Arabic Egyptian: ازيك، عامل ايه
- Franco Arabic: ezayak, 3aml eh
- English

PERSONALITY:
- Friendly and professional
- Scientific and evidence-based
- Encouraging and supportive
- Safety-first mindset

RULES:
- Stay focused on fitness topics only
- If asked about non-fitness topics, politely redirect
- If users are rude, respond professionally
- For medical issues, recommend a doctor
- For detailed meal plans and body analysis, recommend Forma Plus"""

clean_data = []
for item in data:
    instruction = item.get("instruction", item.get("input", ""))
    output = item.get("output", item.get("response", ""))
    if instruction and output:
        if str(instruction).strip() and str(output).strip():
            clean_data.append({"instruction": str(instruction), "output": str(output)})

print(f"Clean samples: {len(clean_data)}")

def format_chat(item):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": item["instruction"]},
        {"role": "assistant", "content": item["output"]},
    ]
    return {"text": tokenizer.apply_chat_template(messages, tokenize=False)}

dataset = Dataset.from_list(clean_data)
dataset = dataset.map(format_chat)
print(f"Dataset ready: {len(dataset)} samples")

MAX_STEPS = 8000
BATCH_SIZE = 2
GRAD_ACCUM = 4
LEARNING_RATE = 2e-4

print("=" * 60)
print("FORMA AI TRAINING")
print("=" * 60)
print(f"Steps: {MAX_STEPS}")
print(f"Estimated time: 2.5 - 3.5 hours on A100")
print("=" * 60)

start_time = time.time()

trainer = SFTTrainer(
    model=model,
    processing_class=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir="./forma-model",
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRAD_ACCUM,
        warmup_steps=100,
        max_steps=MAX_STEPS,
        learning_rate=LEARNING_RATE,
        fp16=True,
        logging_steps=50,
        save_steps=1000,
        save_total_limit=2,
        optim="paged_adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=42,
        report_to="none",
        dataset_text_field="text",
        max_seq_length=2048,
    ),
)

stats = trainer.train()

duration = (time.time() - start_time) / 60
print("")
print("=" * 60)
print("TRAINING COMPLETE!")
print("=" * 60)
print(f"Time: {duration:.1f} minutes")
print(f"Final loss: {stats.training_loss:.4f}")
