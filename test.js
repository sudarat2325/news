const CryptoNewsTracker = require('./index.js');

async function runTests() {
  const tracker = new CryptoNewsTracker();

  console.log('='.repeat(70));
  console.log('🧪 CRYPTOCURRENCY TRACKER - TEST SUITE');
  console.log('='.repeat(70) + '\n');

  // Test 1: ทดสอบ Top 10 Cryptocurrencies
  console.log('📊 TEST 1: Fetching Top 5 Cryptocurrencies...');
  console.log('-'.repeat(70));
  const coins = await tracker.fetchTopCoins(5);
  console.log(coins.map(c => `  - ${c.name}: $${(c.current_price || 0).toLocaleString()}`).join('\n'));
  console.log('\n');

  // Test 2: ทดสอบ Ethereum Details
  console.log('📊 TEST 2: Fetching Ethereum Details...');
  console.log('-'.repeat(70));
  const eth = await tracker.fetchCoinDetails('ethereum');
  const ethPrice = eth?.market_data?.current_price?.usd;
  console.log(`  - Name: ${eth.name}, Price: ${ethPrice ? `$${ethPrice.toLocaleString()}` : 'N/A'}`);
  console.log('\n');

  // Test 3: ทดสอบ Solana Details
  console.log('📊 TEST 3: Fetching Solana Details...');
  console.log('-'.repeat(70));
  const sol = await tracker.fetchCoinDetails('solana');
  const solPrice = sol?.market_data?.current_price?.usd;
  console.log(`  - Name: ${sol.name}, Price: ${solPrice ? `$${solPrice.toLocaleString()}` : 'N/A'}`);
  console.log('\n');

  // Test 4: ทดสอบข่าว Ethereum
  console.log('📰 TEST 4: Fetching Ethereum News (run on server for results)...');
  console.log('-'.repeat(70));
  try {
    const ethNews = await tracker.fetchCryptoNews('ethereum', 3);
    if (ethNews.length > 0) {
      console.log(ethNews.map(a => `  - ${a.title}`).join('\n'));
    } else {
      console.log('  - No news fetched (as expected on localhost).');
    }
  } catch (e) {
    console.log(`  - Failed to fetch news (as expected on localhost): ${e.message}`);
  }
  console.log('\n');

  // Test 5: ทดสอบข่าว NFT
  console.log('📰 TEST 5: Fetching NFT News (run on server for results)...');
  console.log('-'.repeat(70));
  try {
    const nftNews = await tracker.fetchCryptoNews('NFT OR "non-fungible token"', 3);
    if (nftNews.length > 0) {
      console.log(nftNews.map(a => `  - ${a.title}`).join('\n'));
    } else {
      console.log('  - No news fetched (as expected on localhost).');
    }
  } catch (e) {
    console.log(`  - Failed to fetch news (as expected on localhost): ${e.message}`);
  }
  console.log('\n');

  console.log('='.repeat(70));
  console.log('✅ ALL TESTS COMPLETED!');
  console.log('='.repeat(70));
}

// Run all tests
runTests().catch(err => console.error("🔥 A test failed:", err));
