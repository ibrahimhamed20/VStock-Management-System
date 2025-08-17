#!/bin/bash

# Dual Provider LLM Setup Script
# This script sets up both Ollama and Hugging Face providers

echo "🚀 Setting up Dual Provider LLM System..."

# Check if required packages are installed
echo "📦 Checking dependencies..."
if ! npm list @langchain/community > /dev/null 2>&1; then
    echo "Installing @langchain/community..."
    npm install @langchain/community
fi

# Check if Ollama is running
echo "🔍 Checking Ollama status..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running. Starting..."
    docker-compose up -d ollama
    sleep 10
fi

# Install CPU-optimized models for Ollama
echo "📦 Installing CPU-optimized Ollama models..."
ollama pull qwen2.5:0.5b
ollama pull phi3:mini
ollama pull gemma:2b

# Check Hugging Face API key
echo "🔑 Checking Hugging Face configuration..."
if [ -z "$HUGGING_FACE_API_KEY" ]; then
    echo "⚠️  HUGGING_FACE_API_KEY not set"
    echo "   To use Hugging Face, set your API key:"
    echo "   export HUGGING_FACE_API_KEY=your_key_here"
    echo "   Get your key from: https://huggingface.co/settings/tokens"
else
    echo "✅ Hugging Face API key is set"
fi

# Create environment file template
echo "📝 Creating environment template..."
cat > .env.template << EOF
# LLM Provider Configuration
LLM_PROVIDER=ollama  # or 'huggingface'

# Ollama Configuration (Local)
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:0.5b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Hugging Face Configuration (Cloud)
HUGGING_FACE_API_KEY=your_api_key_here
HUGGING_FACE_MODEL=microsoft/DialoGPT-medium
EOF

echo ""
echo "🎯 Dual Provider Setup Complete!"
echo ""
echo "📊 Available Providers:"
echo "   • Ollama (Local) - Fast, free, private"
echo "   • Hugging Face (Cloud) - High quality, managed"
echo ""
echo "🔧 Configuration:"
echo "   • Copy .env.template to .env"
echo "   • Set your Hugging Face API key"
echo "   • Choose your default provider"
echo ""
echo "🚀 Test Commands:"
echo "   # Test Ollama"
echo "   curl -X POST http://localhost:3000/ai-agent/conversations/test/chat \\"
echo "     -H \"Authorization: Bearer token\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"message\": \"Hello\", \"provider\": \"ollama\"}'"
echo ""
echo "   # Test Hugging Face (if API key is set)"
echo "   curl -X POST http://localhost:3000/ai-agent/conversations/test/chat \\"
echo "     -H \"Authorization: Bearer token\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"message\": \"Hello\", \"provider\": \"huggingface\"}'"
echo ""
echo "   # Switch providers"
echo "   curl -X POST http://localhost:3000/ai-agent/provider/switch \\"
echo "     -H \"Authorization: Bearer token\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"provider\": \"huggingface\"}'"
echo ""
echo "🎉 Your dual provider LLM system is ready!" 