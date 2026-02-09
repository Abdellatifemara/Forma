# Training Data - Editable

## Folder Structure

```
editable/
├── exercises/     # Exercise Q&A (auto-sorted from downloads)
├── nutrition/     # Food & nutrition Q&A (auto-sorted)
├── general/       # General fitness Q&A
├── arabic/        # Arabic content (ADD YOUR OWN!)
├── egyptian/      # Egyptian-specific (ADD YOUR OWN!)
├── forma/         # Forma app specific (ADD YOUR OWN!)
└── excluded/      # Move files here to EXCLUDE from training
```

## How to Edit

### Add New Content
1. Create a new JSON file in the appropriate folder
2. Use this format:
```json
[
  {
    "conversations": [
      {"from": "human", "value": "User question"},
      {"from": "gpt", "value": "AI answer"}
    ]
  }
]
```

### Exclude Content
- Move any file to `excluded/` folder
- Or delete the file

### Important Folders to Fill:
- **egyptian/** - Add Egyptian foods, gyms, local tips
- **forma/** - Add Forma app features, how-to guides
- **arabic/** - Add more Arabic Q&A

## After Editing

Run this to merge everything:
```bash
python scripts/merge_final_dataset.py
```

Then train:
```bash
python scripts/train_local.py
```
