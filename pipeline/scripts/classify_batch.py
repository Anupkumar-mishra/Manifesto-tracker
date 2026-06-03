import sys
import os
import time
import re
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.promise_repo import get_all_promises, update_promise_status
from database.evidence_repo import insert_evidence
from extractors.news_scraper import get_articles_for_promise
from ai.status_classifier import classify_promise_status

def parse_retry_delay(error_message):
    """Extract wait time from Groq 429 error message"""
    match = re.search(r'try again in ([\d.]+)s', str(error_message))
    return float(match.group(1)) + 1.0 if match else 15.0

def classify_with_retry(promise_text, articles, max_retries=3):
    """Classify with automatic retry on rate limit errors"""
    for attempt in range(max_retries):
        try:
            result = classify_promise_status(promise_text, articles)
            # Reject results that are just error messages stored as reason
            if 'Error code: 429' in str(result.get('reason', '')):
                raise Exception("Rate limit error leaked into result")
            return result
        except Exception as e:
            error_str = str(e)
            if '429' in error_str and attempt < max_retries - 1:
                wait = parse_retry_delay(error_str)
                print(f"  ⏳ Rate limited — waiting {wait:.1f}s (attempt {attempt+1}/{max_retries})")
                time.sleep(wait)
            else:
                raise  # Re-raise on last attempt or non-429 errors

def classify_batch(limit=20, skip_not_started=False):
    """Classify a batch of promises using news + AI"""
    print(f"\n🔍 Starting batch classification (limit: {limit})")
    print("=" * 50)

    promises = get_all_promises(limit=limit, offset=0)

    if not promises:
        print("❌ No promises found in database")
        return

    updated = 0
    skipped = 0
    failed = 0

    for i, promise in enumerate(promises):
        print(f"\n[{i+1}/{len(promises)}] Processing promise...")
        print(f"  📋 {promise['text'][:80]}...")
        print(f"  Current status: {promise['status']}")

        if skip_not_started and promise['status'] != 'NOT_STARTED':
            print(f"  ⏭️ Skipping — already classified as {promise['status']}")
            skipped += 1
            continue

        # Get news articles
        print(f"  📰 Searching for news...")
        articles = get_articles_for_promise(promise['text'])
        print(f"  Found {len(articles)} articles")

        # Classify using AI (with retry)
        print(f"  🤖 Classifying with Groq AI...")
        try:
            result = classify_with_retry(promise['text'], articles)
        except Exception as e:
            print(f"  ❌ Failed after retries: {e}")
            print(f"  ⏭️ Skipping this promise — keeping status: {promise['status']}")
            failed += 1
            time.sleep(15)  # Cool down before next promise
            continue  # Don't update DB with bad data

        print(f"  ✅ Result: {result['status']} ({result['confidence']:.0%} confident)")
        print(f"  💬 Reason: {result['reason']}")

        # Update database
        update_promise_status(
            promise_id=promise['id'],
            status=result['status'],
            confidence=result['confidence'],
            reason=result['reason'],
            old_status=promise['status']
        )

        # Save evidence articles
        for article in articles[:3]:
            if article.get('url') and article.get('title'):
                insert_evidence(
                    promise_id=promise['id'],
                    url=article['url'],
                    title=article['title'],
                    source=article['source'],
                    snippet=article.get('snippet'),
                    published_at=None
                )

        updated += 1

        # Rate limit — 20s between calls keeps you well under 6000 TPM
        time.sleep(20)

    print(f"\n🎉 Batch complete!")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {skipped}")
    print(f"   Failed (kept original status): {failed}")
    print(f"   Check results: http://localhost:3001/api/promises/stats")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    classify_batch(limit=limit)
    