import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.classify_batch import classify_batch

def run_daily_classification():
    """Run every day at 7 AM"""
    print("⏰ Running daily classification job...")
    classify_batch(limit=50)
    print("✅ Daily classification complete")

def run_health_check():
    """Check all scrapers are working"""
    print("🏥 Running health check...")
    try:
        from extractors.news_scraper import search_google_news
        results = search_google_news("India government", max_results=1)
        if results:
            print("✅ News scraper: OK")
        else:
            print("⚠️ News scraper: No results")
    except Exception as e:
        print(f"❌ News scraper: FAILED — {e}")