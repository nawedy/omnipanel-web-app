// test-manual-sync.js
// Manual test to trigger sync functionality

async function testManualSync() {
  try {
    console.log('🔄 Testing manual sync via API...');
    
    const response = await fetch('http://localhost:3003/api/models/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Manual sync successful!');
    console.log('📊 Models found:', data.models.length);
    
    data.models.forEach(model => {
      console.log(`  - ${model.name} (${model.details?.parameter_size || 'unknown size'})`);
    });
    
    // Now test if the app can access this
    console.log('\n🔄 Testing app homepage...');
    const appResponse = await fetch('http://localhost:3003');
    const html = await appResponse.text();
    
    // Check what the app shows
    const hasNoModelsMessage = html.includes('No models available');
    const hasLocalModelsTab = html.includes('Local Models');
    
    console.log('📊 App Status:');
    console.log(`  - No models message: ${hasNoModelsMessage ? '❌ Still showing' : '✅ Not showing'}`);
    console.log(`  - Local models tab: ${hasLocalModelsTab ? '✅ Present' : '❌ Missing'}`);
    
    return {
      syncWorking: data.success,
      modelsFound: data.models.length,
      appShowingNoModels: hasNoModelsMessage
    };
    
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    return {
      syncWorking: false,
      modelsFound: 0,
      appShowingNoModels: true
    };
  }
}

// Run the test
testManualSync().then(result => {
  console.log('\n📋 Test Results:');
  console.log('================');
  console.log(`Sync API: ${result.syncWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`Models Found: ${result.modelsFound}`);
  console.log(`App Integration: ${result.appShowingNoModels ? '❌ Not working' : '✅ Working'}`);
  
  if (result.syncWorking && result.modelsFound > 0 && result.appShowingNoModels) {
    console.log('\n🔧 Issue: API works but app integration is broken');
    console.log('💡 Likely causes:');
    console.log('  - LocalModelSyncProvider not calling sync on startup');
    console.log('  - Store state not updating UI components');
    console.log('  - Client-side hydration issues');
  }
}).catch(console.error); 