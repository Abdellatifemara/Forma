# Forma Fitness - ML Chatbot Training Guide

## Overview

This guide covers everything set up for training an offline fitness chatbot for Forma.

**Created:** 2026-02-09
**Status:** Ready to train

---

## Quick Start

### Start Training (runs 8-12 hours)

Double-click this file:
```
C:\Users\pc\Desktop\G\FitApp\apps\api\START_TRAINING.bat
```

Or run in PowerShell:
```powershell
cd C:\Users\pc\Desktop\G\FitApp\apps\api
& "C:\Users\pc\AppData\Local\Programs\Python\Python311\python.exe" scripts/train_run.py
```

---

## What Was Created

### Dataset Files

| File | Description |
|------|-------------|
| `training-data/train_balanced.json` | 8,140 balanced training samples |
| `training-data/eval_gold.json` | 36 eval prompts for testing |
| `training-data/train_chatml.jsonl` | ChatML formatted for training |
| `training-data/fitness-massive.json` | Generated Arabic/Egyptian content |

### Training Scripts

| Script | Purpose |
|--------|---------|
| `scripts/train_proper.py` | Prepare balanced dataset |
| `scripts/train_run.py` | Run the actual training |
| `scripts/generate_massive_dataset.py` | Generate Arabic/Egyptian content |
| `scripts/merge_final_dataset.py` | Merge all data sources |
| `scripts/download_open_datasets.py` | Download HuggingFace datasets |
| `START_TRAINING.bat` | One-click training launcher |

### Model Output

After training, files will be in:
```
models/forma-fitness-proper/
├── adapter_model.safetensors  (LoRA weights)
├── tokenizer.json
├── training_config.json
├── training_log.json
└── gguf/
    └── *.gguf  (For Ollama/llama.cpp)
```

---

## Training Configuration

```json
{
  "model": "unsloth/Qwen2.5-3B-Instruct-bnb-4bit",
  "lora_r": 32,
  "lora_alpha": 32,
  "learning_rate": 0.0001,
  "max_steps": 5000,
  "batch_size": 2,
  "gradient_accumulation": 4,
  "estimated_time": "8-12 hours"
}
```

---

## Dataset Composition

### Categories (Balanced)

| Category | Original | Final | Notes |
|----------|----------|-------|-------|
| Arabic | 95 | 100 | Augmented (priority) |
| Franco | 216 | 216 | Kept all (priority) |
| Egyptian | 8 | 100 | Augmented (priority) |
| Forma | 306 | 306 | Kept all (priority) |
| Alternatives | 286 | 286 | Exercise swaps |
| Exercises | 453 | 453 | Exercise Q&A |
| Nutrition | 1840 | 1840 | Food Q&A |
| General | 88,170 | 5,000 | **Capped to prevent domination** |
| **Total** | 91,374 | 8,140 | After dedup |

### Content Types

1. **Arabic (Egyptian Dialect)**
   - ازاي ابني عضلات
   - عايز اخس
   - اكل ايه قبل التمرين

2. **Franco Arabic**
   - ezay a5as
   - 3aml eh ya forma
   - ana 3ayez atmarren

3. **Exercise Alternatives**
   - Injury modifications
   - Home workout swaps
   - No equipment options

4. **Egyptian Nutrition**
   - Local foods (foul, koshary, etc.)
   - Egyptian supplements
   - Budget bulking/cutting

5. **Forma App**
   - What is Forma
   - How to find trainer
   - App features

---

## After Training

### Deploy with Ollama

1. Copy the `.gguf` file from `models/forma-fitness-proper/gguf/`

2. Create Modelfile:
```dockerfile
FROM ./forma-fitness-proper.gguf

SYSTEM """You are Forma AI, a bilingual fitness assistant for Egypt..."""

PARAMETER temperature 0.7
PARAMETER stop "<|im_end|>"
```

3. Create and run:
```bash
ollama create forma-fitness -f Modelfile
ollama run forma-fitness
```

### Test the Model

Test prompts to verify quality:
- "ازاي ابني عضلات"
- "ezay a5as"
- "How many sets for muscle growth"
- "Egyptian foods high in protein"
- "I have a shoulder injury"
- "What is Forma"

---

## Dependencies

### Required (Python 3.11)

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps trl peft accelerate bitsandbytes
pip install datasets transformers
```

### Why Python 3.11?

Python 3.14 is too new - PyTorch doesn't have builds for it yet.
Use: `C:\Users\pc\AppData\Local\Programs\Python\Python311\python.exe`

---

## Troubleshooting

### "No module named torch"
Run: `pip install torch --index-url https://download.pytorch.org/whl/cu121`

### "CUDA not available"
- Check NVIDIA drivers
- Ensure GPU is RTX 3060 or newer

### Training too slow
- Reduce `max_steps` to 2000
- Reduce `lora_r` to 16

### Out of memory
- Reduce `batch_size` to 1
- Enable gradient checkpointing (already on)

---

## Files Location Summary

```
C:\Users\pc\Desktop\G\FitApp\apps\api\
├── START_TRAINING.bat          # Double-click to start
├── training-data/
│   ├── train_balanced.json     # Training data
│   ├── eval_gold.json          # Eval set
│   └── train_chatml.jsonl      # ChatML format
├── scripts/
│   ├── train_run.py            # Main training
│   ├── train_proper.py         # Data preparation
│   └── generate_massive_dataset.py
└── models/
    └── forma-fitness-proper/   # Output here
```
