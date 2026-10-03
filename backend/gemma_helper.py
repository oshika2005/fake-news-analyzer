import json
import os
import re
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODELS = ["gemma-4-26b-a4b-it", "gemma-4-31b-it"]

PROMPT = """You are a misinformation analysis assistant. Analyze the MESSAGE below.

Rules:
- Use ONLY what is written in the message. Never invent facts or sources.
- Do not say a claim is definitely true or false. Give credibility signals only.
- Write "explanation" in the same language as the message (Hindi, Hinglish or English).
- Every claim must include a short exact quote from the message.
- Reply with ONLY valid JSON, no extra text, in this format:

{
  "score": <integer 0-100, higher means more credible>,
  "label": "<Likely reliable | Needs checking | Suspicious>",
  "claims": [{"claim": "<short claim>", "quote": "<exact quote from message>"}],
  "red_flags": ["<short red flag>"],
  "explanation": "<2-3 sentences on why>"
}

MESSAGE:
"""


def parse_json(raw):
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def analyze(text):
    for model in MODELS:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model, contents=PROMPT + text
                )
                data = parse_json(response.text)
                if data:
                    data["model_used"] = model
                    return data
            except Exception as e:
                print(f"{model} attempt {attempt + 1} failed: {str(e)[:80]}")
                time.sleep(2)
    return {
        "score": None,
        "label": "Unavailable",
        "claims": [],
        "red_flags": [],
        "explanation": "Analysis failed. Please try again.",
        "model_used": None,
    }


if __name__ == "__main__":
    samples = [
        "BREAKING: Doctors don't want you to know this! Drinking hot water cures all diseases. Forward to 10 people!",
        "ज़रूरी खबर: कल रात 12 बजे से सभी ATM बंद हो जाएंगे, अपना पैसा आज ही निकाल लो। सबको फॉरवर्ड करो!",
    ]
    for s in samples:
        print(json.dumps(analyze(s), indent=2, ensure_ascii=False))
        print("-" * 40)