const { HuggingFaceInference } = require('@langchain/community/llms/hf');

async function testHuggingFaceConnection() {
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ HUGGING_FACE_API_KEY not set');
    console.log('   Set it with: export HUGGING_FACE_API_KEY=your_key_here');
    return;
  }

  try {
    console.log('🔍 Testing Hugging Face connection...');
    
    const hf = new HuggingFaceInference({
      model: 'microsoft/DialoGPT-medium',
      apiKey: apiKey,
      temperature: 0.1,
      maxTokens: 50
    });

    const response = await hf.invoke('Hello, how are you?');
    console.log('✅ Hugging Face connection successful!');
    console.log('📝 Response:', response);
    
  } catch (error) {
    console.log('❌ Hugging Face connection failed:');
    console.log('   Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your API key is correct');
    console.log('   2. Ensure you have access to the model');
    console.log('   3. Check your internet connection');
  }
}

testHuggingFaceConnection(); 