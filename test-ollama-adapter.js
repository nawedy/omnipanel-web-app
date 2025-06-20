// test-ollama-adapter.js
// Test script to verify Ollama adapter integration

async function testOllamaAdapter() {
  try {
    console.log('🧪 Testing Ollama adapter...');
    
    // Import the adapter (assuming we're in the web directory)
    const { globalAdapterRegistry } = await import('./node_modules/@omnipanel/llm-adapters/dist/index.js');
    
    console.log('📦 Getting Ollama adapter...');
    const adapter = globalAdapterRegistry.get('ollama');
    
    if (!adapter) {
      console.error('❌ No Ollama adapter found');
      return;
    }
    
    console.log('✅ Ollama adapter found');
    
    // Test basic chat
    console.log('💬 Testing chat with llama3.2:1b...');
    const messages = [
      { role: 'user', content: 'Hello! Please respond with just "Hello back!" to test the connection.' }
    ];
    
    const response = await adapter.chat(messages, { 
      model: 'llama3.2:1b',
      temperature: 0.7,
      max_tokens: 50
    });
    
    console.log('📨 Response:', response);
    
    if (response && response.content) {
      console.log('✅ Chat test successful!');
      console.log('📝 Response content:', response.content);
    } else {
      console.error('❌ Chat test failed - no content in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testOllamaAdapter().then(() => {
  console.log('🏁 Test completed');
}).catch(error => {
  console.error('💥 Test crashed:', error);
}); 