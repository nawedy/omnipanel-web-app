// test-local-model-sync.js
// Simple test to verify local model sync functionality

async function testOllamaConnection() {
  try {
    console.log('🔄 Testing Ollama connection...');
    
    // Test Ollama API
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Ollama connection successful!');
    console.log('📊 Available models:', data.models.length);
    
    data.models.forEach(model => {
      console.log(`  - ${model.name} (${model.details.parameter_size})`);
    });
    
    return {
      isConnected: true,
      models: data.models
    };
    
  } catch (error) {
    console.error('❌ Ollama connection failed:', error.message);
    return {
      isConnected: false,
      models: []
    };
  }
}

async function testWorkspaceStatus() {
  try {
    console.log('\n🔄 Testing workspace status...');
    
    const response = await fetch('http://localhost:3003');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Check for key indicators
    const hasNoModelsMessage = html.includes('No models available');
    const hasLocalModelsTab = html.includes('Local Models');
    
    console.log('📊 Workspace Status:');
    console.log(`  - No models message: ${hasNoModelsMessage ? '❌' : '✅'}`);
    console.log(`  - Local models tab: ${hasLocalModelsTab ? '✅' : '❌'}`);
    
    return {
      isOnline: true,
      hasNoModelsMessage,
      hasLocalModelsTab
    };
    
  } catch (error) {
    console.error('❌ Workspace connection failed:', error.message);
    return {
      isOnline: false,
      hasNoModelsMessage: true,
      hasLocalModelsTab: false
    };
  }
}

async function main() {
  console.log('🚀 OmniPanel Local Model Integration Test\n');
  
  const ollamaStatus = await testOllamaConnection();
  const workspaceStatus = await testWorkspaceStatus();
  
  console.log('\n📋 Summary:');
  console.log('============');
  
  if (ollamaStatus.isConnected && ollamaStatus.models.length > 0) {
    console.log('✅ Ollama is running with models available');
  } else {
    console.log('❌ Ollama issue detected');
  }
  
  if (workspaceStatus.isOnline && !workspaceStatus.hasNoModelsMessage) {
    console.log('✅ Workspace shows models are available');
  } else {
    console.log('❌ Workspace still shows no models available');
  }
  
  console.log('\n🔧 Diagnosis:');
  if (ollamaStatus.isConnected && ollamaStatus.models.length > 0 && workspaceStatus.hasNoModelsMessage) {
    console.log('❌ Local model sync is NOT working - models available but not detected');
    console.log('🔧 Need to fix: LocalModelSyncProvider integration');
  } else if (!ollamaStatus.isConnected) {
    console.log('❌ Ollama not running or no models available');
  } else {
    console.log('✅ Integration appears to be working');
  }
}

main().catch(console.error); 