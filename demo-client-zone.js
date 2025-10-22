/**
 * Client Zone Demo Script
 * Demonstrates the Client Zone functionality
 */

const API_BASE_URL = 'http://localhost:3001/api/client';

console.log('🎮 LightDom Client Zone Demo\n');

async function runDemo() {
  try {
    // 1. Get Mining Statistics
    console.log('1️⃣  Fetching Mining Statistics...');
    const statsResponse = await fetch(`${API_BASE_URL}/mining-stats`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      const stats = statsData.data;
      console.log(`   ✅ Total Coins: ${stats.totalCoins.toFixed(2)} DSH`);
      console.log(`   ⚡ Mining Rate: ${stats.miningRate.toFixed(2)} DSH/hour`);
      console.log(`   💾 Space Saved: ${formatBytes(stats.spaceSaved)}`);
      console.log(`   🔧 Optimizations: ${stats.optimizationsCount}`);
      console.log(`   ⏱️  Session Time: ${formatTime(stats.currentSession.timeElapsed)}`);
      console.log(`   💰 Session Earnings: ${stats.currentSession.coinsEarned.toFixed(2)} DSH\n`);
    }

    // 2. Get Marketplace Items
    console.log('2️⃣  Fetching Marketplace Items...');
    const itemsResponse = await fetch(`${API_BASE_URL}/marketplace-items`);
    const itemsData = await itemsResponse.json();
    
    if (itemsData.success) {
      console.log(`   ✅ Found ${itemsData.data.length} items in marketplace`);
      itemsData.data.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (${item.category})`);
        console.log(`      💰 Price: ${item.price} DSH | 🌟 Rarity: ${item.rarity}`);
        console.log(`      📝 ${item.description}`);
      });
      console.log('');
    }

    // 3. Simulate Mining
    console.log('3️⃣  Simulating Mining Activity...');
    const miningResponse = await fetch(`${API_BASE_URL}/simulate-mining`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins: 50, spaceSaved: 10000 })
    });
    const miningData = await miningResponse.json();
    
    if (miningData.success) {
      console.log(`   ✅ Mining simulated! New balance: ${miningData.data.totalCoins.toFixed(2)} DSH\n`);
    }

    // 4. Purchase an Item
    console.log('4️⃣  Purchasing a Metaverse Item...');
    const purchaseResponse = await fetch(`${API_BASE_URL}/purchase-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'item-001' })
    });
    const purchaseData = await purchaseResponse.json();
    
    if (purchaseData.success) {
      const item = purchaseData.data.item.item;
      console.log(`   ✅ Successfully purchased: ${item.name}`);
      console.log(`   💰 Remaining balance: ${purchaseData.data.remainingCoins.toFixed(2)} DSH\n`);
    }

    // 5. View Inventory
    console.log('5️⃣  Viewing Inventory...');
    const inventoryResponse = await fetch(`${API_BASE_URL}/inventory`);
    const inventoryData = await inventoryResponse.json();
    
    if (inventoryData.success) {
      console.log(`   ✅ You own ${inventoryData.data.length} item(s)`);
      inventoryData.data.forEach((purchase, index) => {
        console.log(`   ${index + 1}. ${purchase.item.name} (${purchase.item.category})`);
        console.log(`      📅 Purchased: ${new Date(purchase.purchasedAt).toLocaleString()}`);
      });
      console.log('');
    }

    // 6. Final Statistics
    console.log('6️⃣  Final Mining Statistics...');
    const finalStatsResponse = await fetch(`${API_BASE_URL}/mining-stats`);
    const finalStatsData = await finalStatsResponse.json();
    
    if (finalStatsData.success) {
      const stats = finalStatsData.data;
      console.log(`   💰 Total Coins: ${stats.totalCoins.toFixed(2)} DSH`);
      console.log(`   📈 Today's Earnings: ${stats.history.daily.toFixed(2)} DSH`);
      console.log(`   📊 This Week: ${stats.history.weekly.toFixed(2)} DSH`);
      console.log(`   📊 This Month: ${stats.history.monthly.toFixed(2)} DSH\n`);
    }

    console.log('✅ Demo completed successfully!');
    console.log('\n🌟 Client Zone Features:');
    console.log('   • Real-time mining statistics');
    console.log('   • Metaverse item marketplace');
    console.log('   • Quick item purchase');
    console.log('   • Inventory management');
    console.log('   • Chrome extension integration');
    console.log('   • Chat room item placement');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n💡 Make sure the server is running at http://localhost:3001');
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' bytes';
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

// Check if running in Node.js
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
}

// Run the demo
runDemo().catch(console.error);
