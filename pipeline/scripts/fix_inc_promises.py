import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import get_connection

def fix_inc_promises():
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Update all INC promises to use INC government
        cur.execute("""
            UPDATE "Promise"
            SET "governmentId" = 'govt_inc_opposition'
            WHERE "manifestoId" = 'manifesto_inc_2024'
        """)
        updated = cur.rowcount
        conn.commit()
        print(f"✅ Updated {updated} INC promises to INC government")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    fix_inc_promises()