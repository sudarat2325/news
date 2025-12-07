const axios = require('axios');
const express = require('express');
const path = require('path');
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
      // NewsAPI ไม่อนุญาตให้ใช้ Key บน localhost สำหรับ Free plan
      // เราจะใช้ Key ต่อเมื่อไม่ได้อยู่ในโหมด development
      const apiKey = process.env.NODE_ENV === 'production' ? process.env.NEWS_API_KEY : undefined;

      const response = await axios.get(this.newsApiUrl, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: limit,
          // Axios จะไม่ส่ง parameter ที่มีค่าเป็น undefined
          // ทำให้ request นี้ทำงานได้บน localhost
          apiKey: apiKey
        }
      });

      return response.data.articles || [];
    } catch (error) {
      console.error('❌ Error fetching news:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Fetch top cryptocurrencies by market cap
   * @param {number} limit - Number of coins to fetch
   */
  async fetchTopCoins(limit = 10) {
    try {
      const response = await axios.get(`${this.coinGeckoUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      });

      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching coins:', error.message);
      throw error;
    }
  }

  /**
   * Fetch specific coin details
   * @param {string} coinId - Coin ID (e.g., 'bitcoin', 'ethereum')
   */
  async fetchCoinDetails(coinId = 'bitcoin') {
    try {
      const response = await axios.get(`${this.coinGeckoUrl}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching coin details:', error.message);
      throw error;
    }
  }
}

// --- Web Server Setup ---
const app = express();
const PORT = process.env.PORT || 3000;

// ตั้งค่า EJS เป็น view engine
app.set('view engine', 'ejs');
// Express จะมองหาไฟล์ .ejs ในโฟลเดอร์ 'views' เป็นค่าเริ่มต้น
// แต่เนื่องจากไฟล์ .ejs ของเราอยู่ที่ root, เราจึงต้องตั้งค่าให้ถูกต้อง
app.set('views', __dirname);

// Route หลักสำหรับหน้า Home
app.get('/', async (req, res) => {
  const tracker = new CryptoNewsTracker();
  try {
    // ใช้ Promise.allSettled เพื่อให้แอปทำงานต่อได้แม้ API ตัวใดตัวหนึ่งจะล้มเหลว
    const results = await Promise.allSettled([
      tracker.fetchTopCoins(5),
      tracker.fetchCryptoNews('bitcoin OR ethereum', 5)
    ]);

    // ตรวจสอบผลลัพธ์ของแต่ละ Promise
    const coins = results[0].status === 'fulfilled' ? results[0].value : [];
    const news = results[1].status === 'fulfilled' ? results[1].value : [];

    // Log error ถ้ามี API ที่ล้มเหลว เพื่อให้เราทราบปัญหาใน console
    if (results[0].status === 'rejected') {
      console.error("⚠️  Warning: Failed to fetch coin data:", results[0].reason.message);
    }
    if (results[1].status === 'rejected') {
      console.error("⚠️  Warning: Failed to fetch news data:", results[1].reason.message);
    }

    // Render หน้าเว็บพร้อมข้อมูลเท่าที่มีได้เสมอ
    res.render('index', { coins, news });
  } catch (error) {
    // Catch นี้จะทำงานเฉพาะกรณีมีข้อผิดพลาดร้ายแรงที่ไม่เกี่ยวกับการ fetch API โดยตรง
    console.error("An unexpected error occurred on the home page:", error.message);
    res.status(500).send("An unexpected server error occurred.");
  }
});

// Route สำหรับหน้า Search
app.get('/search', async (req, res) => {
  const tracker = new CryptoNewsTracker();
  const { keyword } = req.query; // ดึง keyword จาก URL query string

  if (!keyword) {
    // ถ้ายังไม่มีการค้นหา ก็แสดงหน้าฟอร์มเปล่าๆ
    return res.render('search');
  }

  try {
    const articles = await tracker.fetchCryptoNews(keyword, 20); // ค้นหาและดึง 20 ข่าว
    res.render('search', { articles, keyword });
  } catch (error) {
    console.error(`Error searching for "${keyword}":`, error.message);
    res.status(500).send(`Error fetching news for keyword: ${keyword}`);
  }
});

// เริ่มการทำงานของ Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = CryptoNewsTracker;
