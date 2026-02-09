@echo off
title Forma Fitness - Model Training (2-4 hours)
color 0A

echo.
echo ========================================================================
echo   FORMA FITNESS - AI MODEL TRAINING
echo   Started: %date% %time%
echo ========================================================================
echo.
echo   This will run for 2-4 HOURS using your GPU.
echo   You can LEAVE - it will keep running!
echo.
echo   Dataset: 8,140 balanced samples
echo   - Arabic/Egyptian/Franco content
echo   - Exercise alternatives
echo   - Egyptian nutrition
echo   - Forma app features
echo.
echo ========================================================================
echo.

set PYTHON="C:\Users\pc\AppData\Local\Programs\Python\Python311\python.exe"
set PIP="C:\Users\pc\AppData\Local\Programs\Python\Python311\Scripts\pip.exe"

cd /d C:\Users\pc\Desktop\G\FitApp\apps\api

echo [Step 1/4] Checking Python...
%PYTHON% --version
if errorlevel 1 (
    echo ERROR: Python 3.11 not found!
    pause
    exit /b 1
)

echo.
echo [Step 2/4] Installing dependencies (if needed)...
%PIP% install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 --quiet
%PIP% install datasets transformers accelerate --quiet

echo.
echo [Step 3/4] Installing Unsloth (fast training)...
%PIP% install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" --quiet
%PIP% install --no-deps trl peft bitsandbytes --quiet

echo.
echo ========================================================================
echo [Step 4/4] STARTING TRAINING - 2-4 HOURS
echo ========================================================================
echo.
echo   Training log saved to: training.log
echo   You can close this window - training continues!
echo.
echo ========================================================================
echo.

%PYTHON% scripts/train_run.py 2>&1 | tee training.log

echo.
echo ========================================================================
echo   TRAINING COMPLETE!
echo ========================================================================
echo.
echo   Model saved to: models\forma-fitness-proper\
echo   GGUF files ready for Ollama/llama.cpp
echo.
pause
