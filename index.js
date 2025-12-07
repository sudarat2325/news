const axios = require('axios');
require('dotenv').config();

class CryptoNewsTracker {
  constructor() {
    this.newsApiUrl = 'https://newsapi.org/v2/everything';
    this.coinGeckoUrl = 'https://api.coingecko.com/api/v3';
  }

  /**
   * Fetch latest cryptocurrency news
   * @param {string} query - Search query (default: 'cryptocurrency')
   * @param {number} limit - Number of articles to fetch
   */
  async fetchCryptoNews(query = 'cryptocurrency OR bitcoin OR ethereum', limit = 10) {
    try {
      console.log('🔍 Fetching cryptocurrency news...\n');

      const response = await axios.get(this.newsApiUrl, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: limit,
          apiKey: process.env.NEWS_API_KEY || 'demo'
        }
      });

      const articles = response.data.articles;

      if (articles && articles.length > 0) {
        console.log(`📰 Found ${articles.length} latest crypto news:\n`);
        articles.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Source: ${article.source.name}`);
          console.log(`   Published: ${new Date(article.publishedAt).toLocaleString()}`);
          console.log(`   URL: ${article.url}\n`);
        });
      } else {
        console.log('No news found.');
      }

      return articles;
    } catch (error) {
      console.error('❌ Error fetching news:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
      }
    }
  }

  /**
   * Fetch top cryptocurrencies by market cap
   * @param {number} limit - Number of coins to fetch
   */
  async fetchTopCoins(limit = 10) {
    try {
      console.log('💰 Fetching top cryptocurrencies...\n');

      const response = await axios.get(`${this.coinGeckoUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      });

      const coins = response.data;

      console.log('🏆 Top Cryptocurrencies:\n');
      coins.forEach((coin, index) => {
        const priceChange = coin.price_change_percentage_24h;
        const changeEmoji = priceChange >= 0 ? '📈' : '📉';

        console.log(`${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`);
        console.log(`   Price: $${coin.current_price.toLocaleString()}`);
        console.log(`   24h Change: ${changeEmoji} ${priceChange?.toFixed(2)}%`);
        console.log(`   Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n`);
      });

      return coins;
    } catch (error) {
      console.error('❌ Error fetching coins:', error.message);
    }
  }

  /**
   * Fetch specific coin details
   * @param {string} coinId - Coin ID (e.g., 'bitcoin', 'ethereum')
   */
  async fetchCoinDetails(coinId = 'bitcoin') {
    try {
      console.log(`🪙 Fetching ${coinId} details...\n`);

      const response = await axios.get(`${this.coinGeckoUrl}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        }
      });

      const coin = response.data;

      console.log(`📊 ${coin.name} (${coin.symbol.toUpperCase()}) Details:\n`);
      console.log(`Current Price: $${coin.market_data.current_price.usd.toLocaleString()}`);
      console.log(`Market Cap Rank: #${coin.market_cap_rank}`);
      console.log(`24h High: $${coin.market_data.high_24h.usd.toLocaleString()}`);
      console.log(`24h Low: $${coin.market_data.low_24h.usd.toLocaleString()}`);
      console.log(`All-Time High: $${coin.market_data.ath.usd.toLocaleString()}`);
      console.log(`\n${coin.description.en.substring(0, 200)}...\n`);

      return coin;
    } catch (error) {
      console.error('❌ Error fetching coin details:', error.message);
    }
  }
}

// Main execution
async function main() {
  const tracker = new CryptoNewsTracker();

  console.log('='.repeat(60));
  console.log('🚀 CRYPTOCURRENCY NEWS & TRACKER');
  console.log('='.repeat(60) + '\n');

  // Fetch top coins
  await tracker.fetchTopCoins(5);

  console.log('='.repeat(60) + '\n');

  // Fetch latest news
  await tracker.fetchCryptoNews('bitcoin OR ethereum', 5);

  console.log('='.repeat(60) + '\n');

  // Fetch Bitcoin details
  await tracker.fetchCoinDetails('bitcoin');

  console.log('='.repeat(60));
  console.log('✅ Done!');
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = CryptoNewsTracker;
