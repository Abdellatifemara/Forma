@echo off
echo ======================================================================
echo   FORMA FITNESS - FULL TRAINING PIPELINE
echo   This will run for several hours - you can leave!
echo ======================================================================
echo.

cd /d C:\Users\pc\Desktop\G\FitApp\apps\api

echo [1/4] Generating massive dataset (Arabic, Franco, Egyptian, etc.)...
python scripts/generate_massive_dataset.py
if errorlevel 1 (
    echo ERROR: Dataset generation failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Merging all training data...
python scripts/merge_final_dataset.py
if errorlevel 1 (
    echo ERROR: Merge failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Installing training dependencies...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 -q
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" -q
pip install --no-deps trl peft accelerate bitsandbytes -q

echo.
echo [4/4] Starting extended training (2-4 hours)...
echo ======================================================================
echo   TRAINING STARTED! You can leave now.
echo   Check C:\Users\pc\Desktop\G\FitApp\apps\api\models\forma-fitness-extended\
echo   for the finished model.
echo ======================================================================
echo.

python scripts/train_extended.py

echo.
echo ======================================================================
echo   TRAINING COMPLETE!
echo ======================================================================
echo.
echo Your model is ready at:
echo   C:\Users\pc\Desktop\G\FitApp\apps\api\models\forma-fitness-extended\
echo.
echo Next: Copy the .gguf file and use with Ollama or llama.cpp
echo.
pause
