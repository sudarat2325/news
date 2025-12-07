import os
import requests
from dotenv import load_dotenv

# โหลดค่าจากไฟล์ .env เข้าสู่ environment variables
load_dotenv()

def get_top_headlines():
    """
    ดึงหัวข้อข่าวเด่นจาก NewsAPI
    """
    # ดึง API Key จาก environment variable
    api_key = os.getenv("NEWS_API_KEY")

    if not api_key:
        print("Error: ไม่พบ NEWS_API_KEY ในไฟล์ .env")
        print("กรุณาสร้างไฟล์ .env และใส่ NEWS_API_KEY=YOUR_KEY_HERE")
        return

    # กำหนด URL ของ API (ตัวอย่าง: ดึงข่าวเด่นจากสหรัฐอเมริกา)
    url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"

    try:
        # ส่ง request ไปยัง API
        response = requests.get(url)
        response.raise_for_status()  # ตรวจสอบว่า request สำเร็จหรือไม่ (status code 200)

        # แปลงข้อมูล JSON ที่ได้กลับมาเป็น Python dictionary
        data = response.json()
        articles = data.get("articles", [])

        if not articles:
            print("ไม่พบข้อมูลข่าวสาร")
        else:
            print("--- Top 10 Headlines from NewsAPI ---")
            for i, article in enumerate(articles[:10]):
                print(f"{i + 1}. {article['title']}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching news: {e}")

if __name__ == "__main__":
    get_top_headlines()