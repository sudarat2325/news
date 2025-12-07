const axios = require('axios');

// โหลดค่าจากไฟล์ .env เข้าสู่ process.env
require('dotenv').config();

/**
 * ค้นหาข่าวตาม keyword ที่ระบุจาก NewsAPI
 * @param {string} keyword - คำที่ใช้สำหรับค้นหาข่าว
 */
async function searchNews(keyword) {
  // ตรวจสอบว่ามีการระบุ keyword หรือไม่
  if (!keyword) {
    console.log('กรุณาระบุคำค้นหา (keyword) หลังชื่อไฟล์');
    console.log('ตัวอย่าง: node fetch_news.js "cryptocurrency"');
    return;
  }

  // ดึง API Key จาก environment variable
  const apiKey = process.env.NEWS_API_KEY;

  // ตรวจสอบว่ามี API Key หรือไม่
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    console.error('Error: ไม่พบ NEWS_API_KEY ในไฟล์ .env');
    console.error('กรุณาสร้างไฟล์ .env และใส่ NEWS_API_KEY ที่ถูกต้อง');
    return;
  }

  // กำหนด URL ของ API สำหรับการค้นหา (everything endpoint)
  const url = `https://newsapi.org/v2/everything`;

  try {
    console.log(`🔍 กำลังค้นหาข่าวเกี่ยวกับ "${keyword}"...`);
    // ส่ง request ไปยัง API ด้วย axios
    const response = await axios.get(url, {
      params: {
        q: keyword, // คำค้นหา
        sortBy: 'publishedAt', // เรียงตามวันที่เผยแพร่ล่าสุด
        language: 'en', // ค้นหาเฉพาะข่าวภาษาอังกฤษ
        apiKey: apiKey,
      },
    });

    // ดึงข้อมูลบทความออกมา (axios จะเก็บข้อมูลไว้ใน property ชื่อ data)
    const articles = response.data.articles || [];

    if (articles.length === 0) {
      console.log(`ไม่พบข่าวที่เกี่ยวกับ "${keyword}"`);
    } else {
      console.log(`--- พบ ${articles.length} ข่าว (แสดง 10 รายการล่าสุด) ---`);
      articles.slice(0, 10).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
      });
    }
  } catch (error) {
    console.error(`❌ Error fetching news: ${error.message}`);
  }
}

// เรียกใช้ฟังก์ชันหลัก
const keyword = process.argv[2]; // อ่าน argument ตัวแรกที่ส่งเข้ามา
searchNews(keyword);