import sys
import os

# Add pipeline root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from extractors.pdf_extractor import extract_text_from_pdf
from ai.promise_extractor import extract_all_promises
from database.promise_repo import insert_promise

# ── CONFIGURE THIS FOR EACH MANIFESTO ────────────────────────────
CONFIGS = {
    'bjp_2024': {
        'pdf_path': 'data/manifestos/bjp_2024.pdf',
        'manifesto_id': 'manifesto_bjp_2024',
        'government_id': 'govt_modi3',
        'region_id': None,
        'region_code': 'IND',
    },
    'inc_2024': {
        'pdf_path': 'data/manifestos/inc_2024.pdf',
        'manifesto_id': 'manifesto_inc_2024',
        'government_id': 'govt_inc_opposition',
        'region_id': None,
        'region_code': 'IND',
    },
    'inc_2004': {
        'pdf_path': 'data/manifestos/inc_2004.pdf',
        'manifesto_id': 'manifesto_inc_2004',
        'government_id': 'govt_upa1_manmohan',
        'region_id': None,
        'region_code': 'IND',
    },
    'inc_2009': {
        'pdf_path': 'data/manifestos/inc_2009.pdf',
        'manifesto_id': 'manifesto_inc_2009',
        'government_id': 'govt_upa2_manmohan',
        'region_id': None,
        'region_code': 'IND',
    },
    'bjp_2014': {
        'pdf_path': 'data/manifestos/bjp_2014.pdf',
        'manifesto_id': 'manifesto_bjp_2014',
        'government_id': 'govt_modi1',
        'region_id': None,
        'region_code': 'IND',
    },
    'bjp_2019': {
        'pdf_path': 'data/manifestos/bjp_2019.pdf',
        'manifesto_id': 'manifesto_bjp_2019',
        'government_id': 'govt_modi2',
        'region_id': None,
        'region_code': 'IND',
    },
    'bjp_mh_2024': {
    'pdf_path': 'data/manifestos/bjp_mh_2024.pdf',
    'manifesto_id': 'manifesto_bjp_mh_2024',
    'government_id': 'govt_bjp_mh_2024',
    'region_id': None,
    'region_code': 'MH',
},
}


def get_region_id(region_code):
    from database.connection import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id FROM "Region" WHERE code = %s', (region_code,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None

def ingest(config_key):
    config = CONFIGS[config_key]
    print(f"\n🚀 Starting ingestion: {config_key}")
    print("=" * 50)

    # Get region ID
    region_id = get_region_id(config['region_code'])
    if not region_id:
        print(f"❌ Region not found: {config['region_code']}")
        return

    # Extract text from PDF
    text = extract_text_from_pdf(config['pdf_path'])

    # Extract promises using AI
    promises = extract_all_promises(text)

    # Save to database
    print(f"\n💾 Saving {len(promises)} promises to database...")
    saved = 0
    for promise in promises:
        promise_data = {
            'manifesto_id': config['manifesto_id'],
            'government_id': config['government_id'],
            'region_id': region_id,
            'text': promise['text'],
            'category': promise.get('category', 'OTHER'),
            'target_group': promise.get('target_group'),
            'stated_deadline': promise.get('stated_deadline'),
        }
        result = insert_promise(promise_data)
        if result:
            saved += 1

    print(f"\n🎉 Done! Saved {saved}/{len(promises)} promises to database")
    print(f"   Manifesto: {config_key}")
    print(f"   Check your database: http://localhost:3001/api/promises")

if __name__ == '__main__':
    key = sys.argv[1] if len(sys.argv) > 1 else 'bjp_2024'
    ingest(key)