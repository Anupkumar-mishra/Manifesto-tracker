import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

CLASSIFICATION_PROMPT = """You are an Indian government accountability analyst.

You will be given an election promise and news articles about it.
Your job is to classify the current status of this promise.

STATUS OPTIONS:
- DELIVERED: Promise has been fully completed with clear evidence
- IN_PROGRESS: Work has started, measurable progress is visible
- STALLED: Work started but stopped or delayed significantly  
- BROKEN: Promise explicitly reversed, cancelled, or contradicted
- NOT_STARTED: No evidence of any action taken

RULES:
- Base your answer ONLY on the provided articles
- If articles are not relevant, return NOT_STARTED
- Be strict: partial work = IN_PROGRESS, not DELIVERED
- Return ONLY valid JSON, no other text

Return this exact JSON format:
{
  "status": "DELIVERED|IN_PROGRESS|STALLED|BROKEN|NOT_STARTED",
  "confidence": 0.0 to 1.0,
  "reason": "one sentence explanation",
  "evidence_quote": "short relevant quote from articles or null"
}"""

def classify_promise_status(promise_text, articles):
    """Use Groq AI to classify promise status based on news articles"""
    if not articles:
        return {
            'status': 'NOT_STARTED',
            'confidence': 0.3,
            'reason': 'No news articles found',
            'evidence_quote': None
        }

    # Format articles for prompt
    articles_text = ""
    for i, article in enumerate(articles[:5]):
        articles_text += f"\nARTICLE {i+1}:\nTitle: {article['title']}\nSource: {article['source']}\nSnippet: {article['snippet']}\n"

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": CLASSIFICATION_PROMPT
                },
                {
                    "role": "user",
                    "content": f"PROMISE: {promise_text}\n\nNEWS ARTICLES:{articles_text}\n\nClassify this promise status:"
                }
            ],
            max_tokens=300,
            temperature=0.1
        )

        response_text = response.choices[0].message.content.strip()

        # Extract JSON
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        if start != -1 and end > start:
            response_text = response_text[start:end]

        result = json.loads(response_text)

        # Validate status
        valid_statuses = ['DELIVERED', 'IN_PROGRESS', 'STALLED', 'BROKEN', 'NOT_STARTED']
        if result.get('status') not in valid_statuses:
            result['status'] = 'NOT_STARTED'

        return result

    except json.JSONDecodeError:
        return {
            'status': 'NOT_STARTED',
            'confidence': 0.2,
            'reason': 'Could not parse AI response',
            'evidence_quote': None
        }
    except Exception as e:
        print(f"    Classification error: {e}")
        return {
            'status': 'NOT_STARTED',
            'confidence': 0.2,
            'reason': f'Error: {str(e)}',
            'evidence_quote': None
        }