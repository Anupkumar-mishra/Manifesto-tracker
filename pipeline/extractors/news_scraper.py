import feedparser
import requests
from bs4 import BeautifulSoup
import time

def search_google_news(query, max_results=5):
    """Search Google News RSS for articles about a promise"""
    try:
        # Clean query for URL
        clean_query = query[:100].replace(' ', '+').replace('&', 'and')
        url = f"https://news.google.com/rss/search?q={clean_query}+India&hl=en-IN&gl=IN&ceid=IN:en"
        
        feed = feedparser.parse(url)
        articles = []
        
        for entry in feed.entries[:max_results]:
            articles.append({
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'snippet': entry.get('summary', '')[:300],
                'source': entry.get('source', {}).get('title', 'Google News'),
                'published': entry.get('published', '')
            })
        
        return articles
    except Exception as e:
        print(f"    News search error: {e}")
        return []

def search_pib(query, max_results=3):
    """Search PIB (Press Information Bureau) for government announcements"""
    try:
        url = f"https://pib.gov.in/allRel.aspx"
        articles = []
        # PIB search via Google News
        pib_query = f"{query} site:pib.gov.in"
        clean_query = pib_query[:100].replace(' ', '+')
        feed_url = f"https://news.google.com/rss/search?q={clean_query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:max_results]:
            articles.append({
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'snippet': entry.get('summary', '')[:300],
                'source': 'PIB',
                'published': entry.get('published', '')
            })
        return articles
    except Exception as e:
        print(f"    PIB search error: {e}")
        return []

def get_articles_for_promise(promise_text, max_results=5):
    """Get news articles relevant to a promise"""
    # Extract key terms from promise
    words = promise_text.split()
    # Use first 8 words as search query
    short_query = ' '.join(words[:8])
    
    articles = search_google_news(short_query, max_results)
    
    # If no results, try shorter query
    if not articles:
        short_query = ' '.join(words[:5])
        articles = search_google_news(short_query, max_results)
    
    return articles