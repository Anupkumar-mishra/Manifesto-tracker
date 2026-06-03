from database.connection import get_connection
from datetime import datetime, timezone
import uuid

VALID_CATEGORIES = [
    'HEALTH', 'EDUCATION', 'INFRASTRUCTURE', 'AGRICULTURE',
    'EMPLOYMENT', 'ECONOMY', 'WOMEN', 'YOUTH', 'ENVIRONMENT',
    'DEFENCE', 'GOVERNANCE', 'SOCIAL_WELFARE', 'OTHER'
]

CATEGORY_MAP = {
    'ENERGY': 'ENVIRONMENT',
    'CULTURE': 'GOVERNANCE',
    'SPORTS': 'YOUTH',
    'TECHNOLOGY': 'ECONOMY',
    'TOURISM': 'ECONOMY',
    'DIGITAL_INFRASTRUCTURE': 'INFRASTRUCTURE',
    'FISHERIES': 'AGRICULTURE',
    'DIPLOMACY': 'GOVERNANCE',
    'FOREIGN_AFFAIRS': 'GOVERNANCE',
    'URBAN DEVELOPMENT': 'INFRASTRUCTURE',
    'REGIONAL DEVELOPMENT': 'INFRASTRUCTURE',
    'JUSTICE': 'GOVERNANCE',
    'SPACE': 'ECONOMY',
}

def map_category(cat):
    if not cat:
        return 'OTHER'
    cat = cat.upper().strip()
    if cat in VALID_CATEGORIES:
        return cat
    return CATEGORY_MAP.get(cat, 'OTHER')

def insert_promise(promise):
    conn = get_connection()
    cur = conn.cursor()
    try:
        promise_id = 'c' + str(uuid.uuid4()).replace('-', '')[:24]
        cur.execute("""
            INSERT INTO "Promise" (
                id, "manifestoId", "governmentId", "regionId",
                text, category, "targetGroup", "statedDeadline",
                status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            promise_id,
            promise['manifesto_id'],
            promise['government_id'],
            promise['region_id'],
            promise['text'],
            map_category(promise.get('category', 'OTHER')),
            promise.get('target_group', None),
            promise.get('stated_deadline', None),
            'NOT_STARTED',
            datetime.now(timezone.utc),
            datetime.now(timezone.utc)
        ))
        conn.commit()
        return promise_id
    except Exception as e:
        conn.rollback()
        print(f"Error inserting promise: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def get_all_promises(limit=50, offset=0):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT p.id, p.text, p.status, p.category, p."confidenceScore",
                   p."regionId", p."governmentId", p."manifestoId"
            FROM "Promise" p
            ORDER BY p."createdAt" DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        rows = cur.fetchall()
        return [
            {
                'id': r[0], 'text': r[1], 'status': r[2],
                'category': r[3], 'confidence_score': r[4],
                'region_id': r[5], 'government_id': r[6], 'manifesto_id': r[7]
            }
            for r in rows
        ]
    except Exception as e:
        print(f"Error fetching promises: {e}")
        return []
    finally:
        cur.close()
        conn.close()

def update_promise_status(promise_id, status, confidence, reason, old_status):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Debug: verify the ID exists before updating
        cur.execute('SELECT id, status FROM "Promise" WHERE id = %s', (promise_id,))
        existing = cur.fetchone()
        if not existing:
            print(f"  ⚠️  WARNING: promise id={promise_id} not found in DB — skipping update")
            # Print sample IDs to help diagnose mismatch
            cur.execute('SELECT id FROM "Promise" LIMIT 3')
            samples = cur.fetchall()
            print(f"  Sample IDs in DB: {[r[0] for r in samples]}")
            return

        cur.execute("""
            UPDATE "Promise"
            SET status = %s, "confidenceScore" = %s, "updatedAt" = %s
            WHERE id = %s
        """, (status, confidence, datetime.now(timezone.utc), promise_id))

        rows_affected = cur.rowcount
        if rows_affected == 0:
            print(f"  ⚠️  WARNING: UPDATE matched 0 rows for id={promise_id}")
            conn.rollback()
            return

        # Insert status history
        history_id = 'c' + str(uuid.uuid4()).replace('-', '')[:24]
        cur.execute("""
            INSERT INTO "StatusHistory" (
                id, "promiseId", "oldStatus", "newStatus", reason, "changedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            history_id, promise_id, old_status, status,
            reason, datetime.now(timezone.utc)
        ))

        conn.commit()
        print(f"✅ Updated promise {promise_id[:8]}... → {status} ({confidence:.0%} confident)")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error updating promise {promise_id}: {e}")
    finally:
        cur.close()
        conn.close()

def get_promise_by_id(promise_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT id, text, status, category, "confidenceScore",
                   "regionId", "governmentId", "manifestoId"
            FROM "Promise"
            WHERE id = %s
        """, (promise_id,))
        r = cur.fetchone()
        if not r:
            return None
        return {
            'id': r[0], 'text': r[1], 'status': r[2],
            'category': r[3], 'confidence_score': r[4],
            'region_id': r[5], 'government_id': r[6], 'manifesto_id': r[7]
        }
    except Exception as e:
        print(f"Error fetching promise {promise_id}: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def get_promises_by_status(status, limit=50):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT id, text, status, category, "confidenceScore",
                   "regionId", "governmentId", "manifestoId"
            FROM "Promise"
            WHERE status = %s
            ORDER BY "createdAt" DESC
            LIMIT %s
        """, (status, limit))
        rows = cur.fetchall()
        return [
            {
                'id': r[0], 'text': r[1], 'status': r[2],
                'category': r[3], 'confidence_score': r[4],
                'region_id': r[5], 'government_id': r[6], 'manifesto_id': r[7]
            }
            for r in rows
        ]
    except Exception as e:
        print(f"Error fetching promises by status: {e}")
        return []
    finally:
        cur.close()
        conn.close()

def get_promise_stats():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT status, COUNT(*) as count
            FROM "Promise"
            GROUP BY status
        """)
        rows = cur.fetchall()
        stats = {r[0]: r[1] for r in rows}
        total = sum(stats.values())
        return {
            'total': total,
            'by_status': stats,
            'delivered': stats.get('DELIVERED', 0),
            'in_progress': stats.get('IN_PROGRESS', 0),
            'not_started': stats.get('NOT_STARTED', 0),
            'broken': stats.get('BROKEN', 0),
        }
    except Exception as e:
        print(f"Error fetching promise stats: {e}")
        return {}
    finally:
        cur.close()
        conn.close()