# FORMA FITNESS - FULL TRAINING PIPELINE (PowerShell)
# This will run for several hours - you can leave!

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  FORMA FITNESS - FULL TRAINING PIPELINE" -ForegroundColor Cyan
Write-Host "  Started at: $(Get-Date)" -ForegroundColor Cyan
Write-Host "  This will run for several hours - you can leave!" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\pc\Desktop\G\FitApp\apps\api"

# Step 1: Generate massive dataset
Write-Host "[1/4] Generating massive dataset..." -ForegroundColor Green
python scripts/generate_massive_dataset.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Dataset generation failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Merge data
Write-Host ""
Write-Host "[2/4] Merging all training data..." -ForegroundColor Green
python scripts/merge_final_dataset.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Merge failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Install dependencies
Write-Host ""
Write-Host "[3/4] Installing training dependencies..." -ForegroundColor Green
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 -q
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" -q
pip install --no-deps trl peft accelerate bitsandbytes -q

# Step 4: Train
Write-Host ""
Write-Host "[4/4] Starting extended training (2-4 hours)..." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   TRAINING STARTED!" -ForegroundColor Yellow
Write-Host "   You can close this window - training continues in background" -ForegroundColor Yellow
Write-Host "   Or leave it open to see progress" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

python scripts/train_extended.py

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  TRAINING COMPLETE!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Model saved to:" -ForegroundColor Cyan
Write-Host "  C:\Users\pc\Desktop\G\FitApp\apps\api\models\forma-fitness-extended\" -ForegroundColor White
Write-Host ""
Write-Host "GGUF files ready for Ollama/llama.cpp" -ForegroundColor Cyan
Write-Host ""
