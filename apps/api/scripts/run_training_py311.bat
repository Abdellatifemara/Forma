@echo off
echo ======================================================================
echo   FORMA FITNESS - FULL TRAINING PIPELINE (Python 3.11)
echo   This will run for 2-4 HOURS - You can leave!
echo   Started at: %date% %time%
echo ======================================================================
echo.

set PYTHON="C:\Users\pc\AppData\Local\Programs\Python\Python311\python.exe"
set PIP="C:\Users\pc\AppData\Local\Programs\Python\Python311\Scripts\pip.exe"

cd /d C:\Users\pc\Desktop\G\FitApp\apps\api

echo [1/5] Checking Python version...
%PYTHON% --version

echo.
echo [2/5] Installing PyTorch with CUDA...
%PIP% install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo.
echo [3/5] Installing Unsloth and training libraries...
%PIP% install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
%PIP% install --no-deps trl peft accelerate bitsandbytes triton

echo.
echo [4/5] Installing other dependencies...
%PIP% install datasets transformers

echo.
echo ======================================================================
echo [5/5] STARTING TRAINING - 2-4 HOURS - YOU CAN LEAVE!
echo ======================================================================
echo.

%PYTHON% scripts/train_extended.py

echo.
echo ======================================================================
echo   TRAINING COMPLETE!
echo ======================================================================
echo   Model saved to: models\forma-fitness-extended
echo.
pause
