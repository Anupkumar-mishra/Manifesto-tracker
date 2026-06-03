import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def load_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'extraction_prompt.txt')
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_promises_from_text(text_chunk, chunk_num=1):
    prompt = load_prompt()
    print(f"  🤖 Sending chunk {chunk_num} to Groq AI ({len(text_chunk)} chars)...")

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": f"Extract all promises from this manifesto text:\n\n{text_chunk}"
                }
            ],
            max_tokens=4000,
            temperature=0.1
        )

        response_text = response.choices[0].message.content.strip()

        # Clean markdown if present
        if '```' in response_text:
            parts = response_text.split('```')
            for part in parts:
                if part.startswith('json'):
                    response_text = part[4:].strip()
                    break
                elif part.strip().startswith('['):
                    response_text = part.strip()
                    break

        # Find JSON array in response
        start = response_text.find('[')
        end = response_text.rfind(']') + 1
        if start != -1 and end > start:
            response_text = response_text[start:end]

        promises = json.loads(response_text)
        print(f"  ✅ Extracted {len(promises)} promises from chunk {chunk_num}")
        return promises

    except json.JSONDecodeError as e:
        print(f"  ⚠️ JSON parse error in chunk {chunk_num}: {e}")
        return []
    except Exception as e:
        print(f"  ❌ Error in chunk {chunk_num}: {e}")
        return []

def extract_all_promises(full_text):
    chunk_size = 3000
    overlap = 200
    chunks = []

    for i in range(0, len(full_text), chunk_size - overlap):
        chunk = full_text[i:i + chunk_size]
        if len(chunk) > 200:
            chunks.append(chunk)

    print(f"📄 Split manifesto into {len(chunks)} chunks")

    all_promises = []
    for i, chunk in enumerate(chunks):
        promises = extract_promises_from_text(chunk, i + 1)
        all_promises.extend(promises)

    # Deduplicate
    seen = set()
    unique_promises = []
    for p in all_promises:
        key = p['text'][:80].lower().strip()
        if key not in seen:
            seen.add(key)
            unique_promises.append(p)

    print(f"✅ Total unique promises extracted: {len(unique_promises)}")
    return unique_promises
