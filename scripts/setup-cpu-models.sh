#!/bin/bash

# CPU-Optimized Ollama Setup Script
# This script sets up the fastest models for CPU-only performance

echo "🚀 Setting up CPU-optimized Ollama models..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama is not running. Please start Ollama first:"
    echo "   docker-compose up -d ollama"
    exit 1
fi

echo "✅ Ollama is running"

# Set CPU-only environment variables
export OLLAMA_GPU_LAYERS=0
export OLLAMA_CPU_THREADS=4

echo "📦 Installing CPU-optimized models..."

# Install the fastest models for CPU
echo "Installing qwen2.5:0.5b (fastest)..."
ollama pull qwen2.5:0.5b

echo "Installing phi3:mini (good balance)..."
ollama pull phi3:mini

echo "Installing gemma:2b (reliable)..."
ollama pull gemma:2b

echo "Installing llama3.1:8b (quality)..."
ollama pull llama3.1:8b

echo "✅ All CPU-optimized models installed!"

# Test the fastest model
echo "🧪 Testing qwen2.5:0.5b performance..."
time ollama run qwen2.5:0.5b "Hello, this is a test message." > /dev/null

echo ""
echo "🎯 CPU-Optimized Setup Complete!"
echo ""
echo "📊 Recommended models for your CPU:"
echo "   • qwen2.5:0.5b  - Fastest (2-8 seconds)"
echo "   • phi3:mini     - Good balance (3-10 seconds)"
echo "   • gemma:2b      - Reliable (4-12 seconds)"
echo "   • llama3.1:8b   - Quality (5-15 seconds)"
echo ""
echo "🔧 To use a specific model, set:"
echo "   export OLLAMA_CHAT_MODEL=qwen2.5:0.5b"
echo ""
echo "📈 Monitor performance with:"
echo "   tail -f logs/app.log | grep 'Chat completed'"
echo ""
echo "🚀 Your CPU-optimized LLM service is ready!" 