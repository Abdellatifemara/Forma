# Offline Fitness Chatbot - Advanced Guide

## Overview

This guide covers fine-tuning a small language model for an offline fitness chatbot that works for non-premium users without API costs.

## Recommended Approach: Fine-tune with Unsloth + Deploy with llama.cpp

### Why This Stack?

1. **Unsloth** - 2x faster training, 70% less VRAM, works with consumer GPUs
2. **QLoRA** - Train 7B models on 8GB VRAM GPUs
3. **llama.cpp** - Efficient CPU/GPU inference, GGUF format, works everywhere
4. **Ollama** - Easy deployment wrapper around llama.cpp

---

## Step 1: Choose Your Base Model

| Model | Size | VRAM (Training) | VRAM (Inference) | Best For |
|-------|------|-----------------|------------------|----------|
| **Qwen2.5-3B-Instruct** | 3B | 6GB | 4GB | Best balance, fast |
| **Phi-4-mini** | 3.8B | 8GB | 5GB | Reasoning, logic |
| **Llama-3.2-3B-Instruct** | 3B | 6GB | 4GB | General purpose |
| **Mistral-7B-Instruct** | 7B | 12GB | 8GB | Higher quality |
| **Qwen2.5-7B-Instruct** | 7B | 12GB | 6GB | Multilingual (Arabic!) |

**Recommendation for Forma:** Use **Qwen2.5-3B-Instruct** for fast inference, or **Qwen2.5-7B-Instruct** if you need Arabic support.

---

## Step 2: Prepare Training Data

### Data Format: ShareGPT/ChatML

```json
{
  "conversations": [
    {"from": "human", "value": "How many sets should I do for muscle growth?"},
    {"from": "gpt", "value": "For muscle hypertrophy (growth), research shows 10-20 sets per muscle group per week is optimal. Per workout, aim for 3-4 sets per exercise with 8-12 reps. Rest 60-90 seconds between sets to maximize metabolic stress and muscle tension."}
  ]
}
```

### Multi-turn Conversations

```json
{
  "conversations": [
    {"from": "human", "value": "I want to build muscle but I'm a beginner"},
    {"from": "gpt", "value": "Great goal! As a beginner, you'll see fast results with a full-body routine 3x per week. Focus on compound movements: squats, deadlifts, bench press, rows, and overhead press. Start with 3 sets of 8-12 reps per exercise."},
    {"from": "human", "value": "How much protein do I need?"},
    {"from": "gpt", "value": "For muscle building, consume 1.6-2.2g of protein per kg of bodyweight daily. If you weigh 70kg, that's 112-154g protein per day. Spread it across 4-5 meals for optimal absorption. Good sources: chicken, fish, eggs, Greek yogurt, legumes."}
  ]
}
```

---

## Step 3: Generate Training Dataset

Run the enhanced dataset generator:

```bash
cd apps/api
npx ts-node scripts/generate-advanced-chatbot-dataset.ts
```

This creates:
- `training-data/fitness-sharegpt.json` - For Unsloth training
- `training-data/fitness-alpaca.json` - Alternative format

---

## Step 4: Fine-tune with Unsloth (Google Colab)

### Requirements
- Google Colab Pro ($10/month) for T4/A100 GPU
- Or local GPU with 8GB+ VRAM (RTX 3070, 4070, etc.)

### Training Notebook

See `apps/api/scripts/train_fitness_model.py` or use this Colab:

```python
# Install Unsloth
%%capture
!pip install unsloth
!pip install --no-deps trl peft accelerate bitsandbytes

# Import
from unsloth import FastLanguageModel
import torch

# Load base model with 4-bit quantization
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-3B-Instruct-bnb-4bit",
    max_seq_length=2048,
    dtype=None,  # Auto-detect
    load_in_4bit=True,
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,  # Rank - higher = more capacity, more VRAM
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                   "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",  # 30% less VRAM
    random_state=3407,
)

# Load training data
from datasets import load_dataset
dataset = load_dataset("json", data_files="fitness-sharegpt.json", split="train")

# Training arguments
from trl import SFTTrainer
from transformers import TrainingArguments

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=100,  # Increase for better results
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        output_dir="outputs",
    ),
)

# Train!
trainer_stats = trainer.train()

# Save to GGUF for llama.cpp
model.save_pretrained_gguf("forma-fitness-model", tokenizer, quantization_method="q4_k_m")
```

---

## Step 5: Deploy with Ollama

### Create Modelfile

```dockerfile
# Modelfile
FROM ./forma-fitness-model-q4_k_m.gguf

TEMPLATE """{{ if .System }}<|im_start|>system
{{ .System }}<|im_end|>
{{ end }}{{ if .Prompt }}<|im_start|>user
{{ .Prompt }}<|im_end|>
{{ end }}<|im_start|>assistant
{{ .Response }}<|im_end|>
"""

SYSTEM """You are Forma AI, a knowledgeable fitness assistant. You provide accurate, science-based advice on exercise, nutrition, and health. You are friendly, supportive, and always prioritize user safety. If asked about medical conditions, you recommend consulting a healthcare professional."""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER stop "<|im_end|>"
```

### Create and Run

```bash
# Create the model
ollama create forma-fitness -f Modelfile

# Run it
ollama run forma-fitness

# Or use API
curl http://localhost:11434/api/generate -d '{
  "model": "forma-fitness",
  "prompt": "How do I build muscle?"
}'
```

---

## Step 6: Integrate with Next.js Frontend

### API Route (apps/web/app/api/chat-offline/route.ts)

```typescript
import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(req: Request) {
  const { message, history } = await req.json();

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'forma-fitness',
      messages: [
        ...history,
        { role: 'user', content: message }
      ],
      stream: false,
    }),
  });

  const data = await response.json();
  return NextResponse.json({ response: data.message.content });
}
```

---

## Training Data Categories

Your dataset should cover:

### 1. Exercise Technique (30%)
- How to perform exercises correctly
- Common mistakes to avoid
- Progressions and regressions
- Equipment alternatives

### 2. Programming & Periodization (20%)
- Sets, reps, rest periods
- Training splits (PPL, Upper/Lower, Full Body)
- Progressive overload
- Deload weeks

### 3. Nutrition (25%)
- Macros for different goals
- Meal timing
- Supplements (evidence-based)
- Hydration

### 4. Recovery (10%)
- Sleep optimization
- Active recovery
- Dealing with soreness
- Injury prevention

### 5. Motivation & Mindset (10%)
- Staying consistent
- Dealing with plateaus
- Goal setting
- Habit formation

### 6. Special Populations (5%)
- Beginners
- Older adults
- Women-specific
- Post-injury return

---

## Estimated Costs

| Component | Cost |
|-----------|------|
| Google Colab Pro (training) | $10/month |
| Training time (100 steps) | ~15 minutes |
| Inference (Ollama on VPS) | $5-20/month |
| **Total** | **$15-30 one-time + hosting** |

---

## Resources

- [Unsloth Documentation](https://unsloth.ai/docs/get-started/fine-tuning-llms-guide)
- [Unsloth GitHub](https://github.com/unslothai/unsloth)
- [Fine-tune Llama 3.1 with Unsloth](https://huggingface.co/blog/mlabonne/sft-llama3)
- [QLoRA Fine-Tuning Guide](https://medium.com/@matteo28/qlora-fine-tuning-with-unsloth-a-complete-guide-8652c9c7edb3)
- [Best Small LLMs 2025](https://www.kolosal.ai/blog-detail/top-5-best-llm-models-to-run-locally-in-cpu-2025-edition)
- [Open Source LLMs Guide](https://huggingface.co/blog/daya-shankar/open-source-llms)
- [Best SLMs 2025](https://www.intuz.com/blog/best-small-language-models)
