from database.connection import get_connection
from datetime import datetime, timezone
import uuid

def insert_evidence(promise_id, url, title, source, snippet=None, published_at=None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        evidence_id = 'c' + str(uuid.uuid4()).replace('-', '')[:24]
        cur.execute("""
            INSERT INTO "Evidence" (id, "promiseId", url, title, source, snippet, "publishedAt", "addedBy", verified, "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            evidence_id, promise_id, url, title, source,
            snippet, published_at, 'AI_SCRAPER', False,
            datetime.now(timezone.utc)
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error inserting evidence: {e}")
    finally:
        cur.close()
        conn.close()