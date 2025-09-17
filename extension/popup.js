// LightDom Extension Popup Script
let isMining = false;

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleMining');
  const statusDiv = document.getElementById('status');
  
  toggleBtn.addEventListener('click', function() {
    if (isMining) {
      stopMining();
    } else {
      startMining();
    }
  });
  
  // Load initial state
  loadStats();
});

function startMining() {
  isMining = true;
  updateUI();
  
  chrome.runtime.sendMessage({ type: 'START_MINING' });
  
  // Simulate mining activity
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

function stopMining() {
  isMining = false;
  updateUI();
  
  chrome.runtime.sendMessage({ type: 'STOP_MINING' });
}

function updateUI() {
  const toggleBtn = document.getElementById('toggleMining');
  const statusDiv = document.getElementById('status');
  
  if (isMining) {
    toggleBtn.textContent = 'Stop Mining';
    toggleBtn.className = 'button stop-btn';
    statusDiv.textContent = '⚡ Mining Active';
    statusDiv.className = 'status mining';
  } else {
    toggleBtn.textContent = 'Start Mining';
    toggleBtn.className = 'button start-btn';
    statusDiv.textContent = '⏹️ Mining Stopped';
    statusDiv.className = 'status stopped';
  }
}

function loadStats() {
  // Load stats from storage
  chrome.storage.local.get(['totalMined', 'spaceSaved', 'sessions'], function(result) {
    document.getElementById('totalMined').textContent = `${result.totalMined || 0} DSH`;
    document.getElementById('spaceSaved').textContent = `${result.spaceSaved || 0} bytes`;
    document.getElementById('sessions').textContent = result.sessions || 0;
  });
}

function loadStats() {
  // Load stats from storage
  chrome.storage.local.get(['totalMined', 'spaceSaved', 'sessions'], function(result) {
    document.getElementById('totalMined').textContent = `${result.totalMined || 0} DSH`;
    document.getElementById('spaceSaved').textContent = `${result.spaceSaved || 0} bytes`;
    document.getElementById('sessions').textContent = result.sessions || 0;
  });
}
