#!/bin/bash
# Setup llama.cpp with a fitness-capable model
# 100% FREE, 100% OFFLINE, 100% OPEN SOURCE

echo "=========================================="
echo "  llama.cpp Setup for Forma Fitness"
echo "=========================================="

# Clone llama.cpp
if [ ! -d "llama.cpp" ]; then
    echo "Cloning llama.cpp..."
    git clone https://github.com/ggml-org/llama.cpp
fi

cd llama.cpp

# Build (use CUDA if available)
echo "Building llama.cpp..."
if command -v nvcc &> /dev/null; then
    echo "CUDA detected, building with GPU support..."
    make GGML_CUDA=1
else
    echo "No CUDA, building for CPU..."
    make
fi

# Download a good base model (Qwen 2.5 3B - supports Arabic!)
echo ""
echo "Downloading Qwen2.5-3B-Instruct (2.1 GB)..."
echo "This model works great for fitness Q&A out of the box."
echo ""

# Using Hugging Face CLI or wget
MODEL_URL="https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf"
MODEL_FILE="models/qwen2.5-3b-instruct-q4_k_m.gguf"

mkdir -p models
if [ ! -f "$MODEL_FILE" ]; then
    wget -O "$MODEL_FILE" "$MODEL_URL"
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Test the model:"
echo "  ./llama-cli -m models/qwen2.5-3b-instruct-q4_k_m.gguf \\"
echo "    -p 'How many sets should I do for muscle growth?' \\"
echo "    -n 256"
echo ""
echo "Run as server (for API):"
echo "  ./llama-server -m models/qwen2.5-3b-instruct-q4_k_m.gguf --port 8080"
echo ""
echo "API endpoint: http://localhost:8080/v1/chat/completions"
