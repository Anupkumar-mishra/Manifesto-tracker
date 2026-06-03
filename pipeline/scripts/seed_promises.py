import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.promise_repo import insert_promise
from database.connection import get_connection

def get_region_id(code):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT id FROM "Region" WHERE code = %s', (code,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None

BJP_PROMISES = [
    {"text": "Provide free ration to 80 crore poor people under PM Garib Kalyan Anna Yojana", "category": "SOCIAL_WELFARE", "target_group": "poor families"},
    {"text": "Build 3 crore new houses under PM Awas Yojana for rural and urban poor", "category": "INFRASTRUCTURE", "target_group": "homeless families"},
    {"text": "Provide piped drinking water to every household under Jal Jeevan Mission", "category": "INFRASTRUCTURE", "target_group": "all citizens"},
    {"text": "Double farmers income through MSP increases and direct benefit transfers", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Provide PM Kisan Samman Nidhi of Rs 6000 per year to all farmers", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Make India the third largest economy in the world by 2027", "category": "ECONOMY", "target_group": "all citizens", "stated_deadline": "2027"},
    {"text": "Create 1 crore jobs per year through MSME and startup promotion", "category": "EMPLOYMENT", "target_group": "youth"},
    {"text": "Provide free treatment up to Rs 5 lakh per family under Ayushman Bharat", "category": "HEALTH", "target_group": "poor families"},
    {"text": "Build medical colleges in every district of India", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Expand AIIMS network to all states", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Provide free education to girls up to Class 12 in government schools", "category": "EDUCATION", "target_group": "girls"},
    {"text": "Open 100 new Navodaya Vidyalayas across India", "category": "EDUCATION", "target_group": "students"},
    {"text": "Provide laptops to all students passing Class 10 in government schools", "category": "EDUCATION", "target_group": "students"},
    {"text": "Build national highway network of 2 lakh km by 2025", "category": "INFRASTRUCTURE", "target_group": "all citizens", "stated_deadline": "2025"},
    {"text": "Connect all villages with paved roads under PM Gram Sadak Yojana", "category": "INFRASTRUCTURE", "target_group": "rural citizens"},
    {"text": "Provide electricity to every household in India", "category": "INFRASTRUCTURE", "target_group": "all citizens"},
    {"text": "Install 500 GW of renewable energy capacity by 2030", "category": "ENVIRONMENT", "target_group": "all citizens", "stated_deadline": "2030"},
    {"text": "Plant 100 crore trees to combat climate change", "category": "ENVIRONMENT", "target_group": "all citizens"},
    {"text": "Provide LPG connections to 10 crore poor women under Ujjwala Yojana", "category": "WOMEN", "target_group": "women"},
    {"text": "Reserve 33% seats for women in Parliament and state legislatures", "category": "WOMEN", "target_group": "women"},
    {"text": "Provide maternity benefit of Rs 6000 to pregnant women", "category": "WOMEN", "target_group": "pregnant women"},
    {"text": "Launch National Apprenticeship Promotion Scheme for 50 lakh youth", "category": "YOUTH", "target_group": "youth"},
    {"text": "Provide startup loans up to Rs 10 lakh to youth without collateral", "category": "EMPLOYMENT", "target_group": "youth"},
    {"text": "Build 75 new industrial corridors across India", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Increase defence budget to 3% of GDP", "category": "DEFENCE", "target_group": "all citizens"},
    {"text": "Modernise Indian Army with indigenous weapons under Make in India", "category": "DEFENCE", "target_group": "all citizens"},
    {"text": "Provide pension of Rs 3000 per month to unorganised sector workers", "category": "SOCIAL_WELFARE", "target_group": "unorganised workers"},
    {"text": "Expand PM Jan Dhan Yojana to ensure every adult has a bank account", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Digitise all government services under Digital India by 2025", "category": "GOVERNANCE", "target_group": "all citizens", "stated_deadline": "2025"},
    {"text": "Set up 1 lakh common service centres in rural areas", "category": "GOVERNANCE", "target_group": "rural citizens"},
    {"text": "Reduce income tax burden on middle class families", "category": "ECONOMY", "target_group": "middle class"},
    {"text": "Build 100 smart cities with world class infrastructure", "category": "INFRASTRUCTURE", "target_group": "urban citizens"},
    {"text": "Provide health insurance to all ASHA and Anganwadi workers", "category": "HEALTH", "target_group": "health workers"},
    {"text": "Construct 5 crore toilets under Swachh Bharat Mission Phase 2", "category": "INFRASTRUCTURE", "target_group": "all citizens"},
    {"text": "Implement One Nation One Ration Card across all states", "category": "SOCIAL_WELFARE", "target_group": "migrant workers"},
    {"text": "Provide crop insurance to all farmers under PM Fasal Bima Yojana", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Set up PM KISAN call centres in all districts", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Launch National Education Policy full implementation by 2025", "category": "EDUCATION", "target_group": "students", "stated_deadline": "2025"},
    {"text": "Set up 1000 Atal Tinkering Labs in schools for innovation", "category": "EDUCATION", "target_group": "students"},
    {"text": "Provide scholarships to 50 lakh SC/ST students for higher education", "category": "EDUCATION", "target_group": "SC/ST students"},
    {"text": "Build 500 new Jan Aushadhi stores to provide cheap medicines", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Launch Mission Indradhanush to vaccinate all children by 2025", "category": "HEALTH", "target_group": "children", "stated_deadline": "2025"},
    {"text": "Achieve zero hunger goal by distributing surplus food grains", "category": "SOCIAL_WELFARE", "target_group": "poor families"},
    {"text": "Provide PM SVANidhi loans to 50 lakh street vendors", "category": "EMPLOYMENT", "target_group": "street vendors"},
    {"text": "Launch Agnipath scheme to recruit 1 lakh youth in armed forces", "category": "DEFENCE", "target_group": "youth"},
    {"text": "Complete Bullet Train project between Mumbai and Ahmedabad", "category": "INFRASTRUCTURE", "target_group": "all citizens"},
    {"text": "Expand metro rail network to 50 Indian cities", "category": "INFRASTRUCTURE", "target_group": "urban citizens"},
    {"text": "Achieve 100% financial inclusion through Jan Dhan Aadhaar Mobile trinity", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Build 100 new airports across India under UDAN scheme", "category": "INFRASTRUCTURE", "target_group": "all citizens"},
    {"text": "Provide free wifi in all gram panchayats under BharatNet", "category": "GOVERNANCE", "target_group": "rural citizens"},
    {"text": "Launch PM e-VIDYA for free online education to all students", "category": "EDUCATION", "target_group": "students"},
    {"text": "Establish National Logistics Policy to reduce logistics cost", "category": "ECONOMY", "target_group": "businesses"},
    {"text": "Revamp GST to simplify tax structure for small businesses", "category": "ECONOMY", "target_group": "small businesses"},
    {"text": "Increase MSP for all 23 crops by at least 50% above cost", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Set up 10000 Farmer Producer Organisations across India", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Provide Kisan Credit Card to all 7 crore farmers", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Achieve 5 trillion dollar economy by 2025", "category": "ECONOMY", "target_group": "all citizens", "stated_deadline": "2025"},
    {"text": "Create 1 crore self help groups for women empowerment", "category": "WOMEN", "target_group": "women"},
    {"text": "Launch Mission Shakti for womens safety in every district", "category": "WOMEN", "target_group": "women"},
    {"text": "Build 25000 km of new railway lines by 2030", "category": "INFRASTRUCTURE", "target_group": "all citizens", "stated_deadline": "2030"},
    {"text": "Electrify all railway lines by 2024", "category": "INFRASTRUCTURE", "target_group": "all citizens", "stated_deadline": "2024"},
    {"text": "Reduce air pollution in all metro cities by 40 percent", "category": "ENVIRONMENT", "target_group": "urban citizens"},
    {"text": "Clean Ganga river under Namami Gange Mission by 2025", "category": "ENVIRONMENT", "target_group": "all citizens", "stated_deadline": "2025"},
    {"text": "Provide Ayushman Bharat health ID to every Indian citizen", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Launch National Digital Health Mission for paperless healthcare", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Set up PM CARES fund for emergency relief to citizens", "category": "SOCIAL_WELFARE", "target_group": "all citizens"},
    {"text": "Provide Rs 2 lakh accident insurance to all Jan Dhan account holders", "category": "SOCIAL_WELFARE", "target_group": "all citizens"},
    {"text": "Build new Parliament building and Central Vista in Delhi", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Implement One Nation One Election to reduce election expenditure", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Provide direct benefit transfer for all government subsidies", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Abolish 1500 outdated laws and reduce compliance burden", "category": "GOVERNANCE", "target_group": "businesses"},
    {"text": "Launch Startup India to support 50000 new startups", "category": "EMPLOYMENT", "target_group": "entrepreneurs"},
    {"text": "Set up 5G network across India by 2025", "category": "GOVERNANCE", "target_group": "all citizens", "stated_deadline": "2025"},
]

INC_PROMISES = [
    {"text": "Conduct caste census to ensure fair representation of all communities", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Provide legal guarantee for MSP to all farmers", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Waive farm loans up to Rs 2 lakh for all small and marginal farmers", "category": "AGRICULTURE", "target_group": "small farmers"},
    {"text": "Provide Rs 1 lakh per year to every poor family under Nyay scheme", "category": "SOCIAL_WELFARE", "target_group": "poor families"},
    {"text": "Fill 30 lakh vacant government jobs within one year of taking power", "category": "EMPLOYMENT", "target_group": "youth", "stated_deadline": "1 year"},
    {"text": "Provide apprenticeship of Rs 1 lakh per year to every diploma and degree holder", "category": "EMPLOYMENT", "target_group": "youth"},
    {"text": "Restore Old Pension Scheme for all central government employees", "category": "GOVERNANCE", "target_group": "govt employees"},
    {"text": "Increase health budget to 3 percent of GDP", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Provide free medicines and diagnostics at all government hospitals", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Increase education budget to 6 percent of GDP", "category": "EDUCATION", "target_group": "students"},
    {"text": "Provide Rs 10000 scholarship to all students in Class 11 and 12", "category": "EDUCATION", "target_group": "students"},
    {"text": "Abolish National Testing Agency and reform exam process", "category": "EDUCATION", "target_group": "students"},
    {"text": "Reduce income tax for those earning below Rs 5 lakh to zero", "category": "ECONOMY", "target_group": "salaried class"},
    {"text": "Remove Agniveer scheme and restore permanent army recruitment", "category": "DEFENCE", "target_group": "youth"},
    {"text": "Repeal the three farm laws permanently through legislation", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Increase MGNREGA wages to Rs 400 per day and expand to urban areas", "category": "EMPLOYMENT", "target_group": "rural workers"},
    {"text": "Provide 50 percent reservation for women in government jobs", "category": "WOMEN", "target_group": "women"},
    {"text": "Pass Women Reservation Bill with sub-reservation for OBC women", "category": "WOMEN", "target_group": "women"},
    {"text": "Restore Article 370 debate and hold dialogue with all stakeholders in J&K", "category": "GOVERNANCE", "target_group": "J&K citizens"},
    {"text": "Establish independent enquiry into electoral bonds scheme", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Make RTI stronger by making PM Office fully accountable", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Provide 200 units free electricity to every household per month", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Nationalise key natural resources and stop privatisation of PSUs", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Increase corporate tax on super rich to fund social programmes", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Conduct delimitation only after caste census is completed", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Scrap National Monetisation Pipeline and protect public assets", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Provide Rs 3000 monthly pension to all workers above age 60", "category": "SOCIAL_WELFARE", "target_group": "senior citizens"},
    {"text": "Build 5 lakh km of rural roads under new Sadak Yojana", "category": "INFRASTRUCTURE", "target_group": "rural citizens"},
    {"text": "Set up debt relief commission for farmers within 100 days", "category": "AGRICULTURE", "target_group": "farmers", "stated_deadline": "100 days"},
    {"text": "Establish anti discrimination law to protect minorities and Dalits", "category": "SOCIAL_WELFARE", "target_group": "minorities"},
    {"text": "Restore autonomy of CBI and ED from government interference", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Appoint independent Lokpal within first 100 days of government", "category": "GOVERNANCE", "target_group": "all citizens", "stated_deadline": "100 days"},
    {"text": "Increase SC/ST/OBC reservation in private sector employment", "category": "SOCIAL_WELFARE", "target_group": "SC/ST/OBC"},
    {"text": "Provide housing to all urban poor under new housing scheme", "category": "INFRASTRUCTURE", "target_group": "urban poor"},
    {"text": "Make mid day meal scheme permanent and improve nutrition quality", "category": "EDUCATION", "target_group": "school children"},
    {"text": "Reduce GST on essential commodities to zero percent", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Increase fishermen welfare fund and provide modern boats", "category": "AGRICULTURE", "target_group": "fishermen"},
    {"text": "Expand AYUSH and traditional medicine network across India", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Provide free legal aid to all citizens in criminal cases", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Launch National Urban Employment Guarantee scheme for city workers", "category": "EMPLOYMENT", "target_group": "urban poor"},
    {"text": "Ensure media freedom and stop government interference in press", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Create new AIIMS hospitals in every state that does not have one", "category": "HEALTH", "target_group": "all citizens"},
    {"text": "Provide free sanitary napkins to all school girls and women", "category": "WOMEN", "target_group": "women"},
    {"text": "Launch Indira Gandhi Mahila Shakti scheme with Rs 1 lakh per SHG", "category": "WOMEN", "target_group": "women"},
    {"text": "Protect forest rights of tribal communities under Forest Rights Act", "category": "SOCIAL_WELFARE", "target_group": "tribal communities"},
    {"text": "Set up price stabilisation fund for vegetables and pulses", "category": "AGRICULTURE", "target_group": "farmers"},
    {"text": "Increase defence research budget and boost DRDO funding", "category": "DEFENCE", "target_group": "all citizens"},
    {"text": "Build 50 new universities in underserved districts", "category": "EDUCATION", "target_group": "students"},
    {"text": "Implement New Education Policy with full state consultation", "category": "EDUCATION", "target_group": "students"},
    {"text": "Provide free coaching for UPSC and state PSC exams to poor students", "category": "EDUCATION", "target_group": "poor students"},
    {"text": "Launch climate action plan with Rs 1 lakh crore green fund", "category": "ENVIRONMENT", "target_group": "all citizens"},
    {"text": "Ban single use plastic completely and promote green alternatives", "category": "ENVIRONMENT", "target_group": "all citizens"},
    {"text": "Provide disability pension of Rs 3000 per month to all disabled persons", "category": "SOCIAL_WELFARE", "target_group": "disabled persons"},
    {"text": "Increase budget for child nutrition under ICDS scheme by 50 percent", "category": "HEALTH", "target_group": "children"},
    {"text": "Set up fast track courts in every district for women safety cases", "category": "WOMEN", "target_group": "women"},
    {"text": "Regularise contract workers in government and PSU jobs", "category": "EMPLOYMENT", "target_group": "contract workers"},
    {"text": "Increase minimum wage to Rs 400 per day for all workers", "category": "EMPLOYMENT", "target_group": "workers"},
    {"text": "Create 20 lakh jobs in green energy sector by 2030", "category": "ENVIRONMENT", "target_group": "youth", "stated_deadline": "2030"},
    {"text": "Provide digital literacy training to 5 crore rural women", "category": "WOMEN", "target_group": "rural women"},
    {"text": "Set up PM Food Security Commission to monitor food prices", "category": "SOCIAL_WELFARE", "target_group": "all citizens"},
    {"text": "Decentralise power to panchayats with dedicated funds and functions", "category": "GOVERNANCE", "target_group": "rural citizens"},
    {"text": "Hold elections to all urban local bodies within one year", "category": "GOVERNANCE", "target_group": "urban citizens"},
    {"text": "Create special economic zones for handloom and handicraft workers", "category": "EMPLOYMENT", "target_group": "artisans"},
    {"text": "Provide Rs 2000 per month to all senior citizens above 60 years", "category": "SOCIAL_WELFARE", "target_group": "senior citizens"},
    {"text": "Make Aadhaar voluntary and not mandatory for government services", "category": "GOVERNANCE", "target_group": "all citizens"},
    {"text": "Increase ASHA and Anganwadi worker salaries to Rs 15000 per month", "category": "HEALTH", "target_group": "health workers"},
    {"text": "Build sports academies in every district to promote Olympic talent", "category": "YOUTH", "target_group": "youth"},
    {"text": "Provide Rs 5 lakh grant to every young entrepreneur below 30 years", "category": "YOUTH", "target_group": "youth"},
    {"text": "Reintroduce wealth tax on assets above Rs 5 crore", "category": "ECONOMY", "target_group": "all citizens"},
    {"text": "Provide free eye care and cataract surgery to all senior citizens", "category": "HEALTH", "target_group": "senior citizens"},
    {"text": "Mandate corporate CSR of 5 percent for rural education", "category": "EDUCATION", "target_group": "rural students"},
    {"text": "Increase allocation for SC/ST welfare to 20 percent of central budget", "category": "SOCIAL_WELFARE", "target_group": "SC/ST communities"},
    {"text": "Set up National Tribal University in every tribal region", "category": "EDUCATION", "target_group": "tribal students"},
    {"text": "Provide interest free loans to women self help groups up to Rs 5 lakh", "category": "WOMEN", "target_group": "women"},
    {"text": "Build 10000 sports grounds in villages under Khelo India expansion", "category": "YOUTH", "target_group": "youth"},
]

def seed_promises():
    print("🌱 Seeding promises from BJP and INC manifestos...")
    region_id = get_region_id('IND')
    if not region_id:
        print("❌ Region IND not found. Run backend seed first.")
        return

    saved = 0
    for p in BJP_PROMISES:
        result = insert_promise({
            'manifesto_id': 'manifesto_bjp_2024',
            'government_id': 'govt_modi3',
            'region_id': region_id,
            'text': p['text'],
            'category': p.get('category', 'OTHER'),
            'target_group': p.get('target_group'),
            'stated_deadline': p.get('stated_deadline'),
        })
        if result:
            saved += 1

    print(f"✅ BJP promises saved: {saved}/75")

    saved = 0
    for p in INC_PROMISES:
        result = insert_promise({
            'manifesto_id': 'manifesto_inc_2024',
            'government_id': 'govt_modi3',
            'region_id': region_id,
            'text': p['text'],
            'category': p.get('category', 'OTHER'),
            'target_group': p.get('target_group'),
            'stated_deadline': p.get('stated_deadline'),
        })
        if result:
            saved += 1

    print(f"✅ INC promises saved: {saved}/75")
    print(f"\n🎉 Done! Check: http://localhost:3001/api/promises")

if __name__ == '__main__':
    seed_promises()
