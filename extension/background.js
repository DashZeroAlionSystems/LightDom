// LightDom Extension Background Script
console.log('LightDom Extension loaded');

let isMining = false;
let userAddress = null;

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LightDom Extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOM_OPTIMIZATION') {
    handleDOMOptimization(message.data);
  } else if (message.type === 'START_MINING') {
    startMining();
  } else if (message.type === 'STOP_MINING') {
    stopMining();
  }
  
  sendResponse({ success: true });
});

async function handleDOMOptimization(data) {
  try {
    const response = await fetch('http://localhost:3001/api/optimization/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show notification for successful optimization
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'LightDom Mining Success!',
        message: `Earned ${result.reward} DSH tokens for ${data.spaceSaved} bytes saved`
      });
    }
  } catch (error) {
    console.error('Failed to submit optimization:', error);
  }
}

function startMining() {
  isMining = true;
  console.log('Mining started');
}

function stopMining() {
  isMining = false;
  console.log('Mining stopped');
}
