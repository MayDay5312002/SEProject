import os, requests, openai
from dotenv import load_dotenv
load_dotenv()#loading the .env file

API_KEY = os.getenv("OPENAI_API_KEY")
BUSINESS_NEWS = os.getenv("buss_news_api")
client = openai.OpenAI(api_key=API_KEY)
def get_news_today():
    # print(BUSINESS_NEWS)
    response = requests.get(f"https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey={BUSINESS_NEWS}")
    print(response.status_code)
    if response.status_code == 200:
        news_data = response.json()
        articles = news_data['articles']
        # print(len(articles))
        headlines = [article['description'] for article in articles if article['description']]
        headlines = headlines[:10] if len(headlines) > 10 else headlines
        counter = 1
        result = "Here is the news for today:\n"
        for headline in headlines:
            result += f"News{counter}: {headline}\n"
            counter += 1
        # print(result)
        return result
    else:
        return "Error fetching news"
