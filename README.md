# Fake News Credibility Analyzer

Paste a WhatsApp forward or news text (English, Hindi or Hinglish) and get
credibility signals: the claims made (with exact quotes), red flags, and a
plain-language explanation. It does not declare anything "true" or "false".

## How it works
- **Gemma 4** (`gemma-4-26b-a4b-it`, with `gemma-4-31b-it` as fallback) via the
  Gemini API extracts claims with source quotes, finds red flags and writes the explanation.
- **FastAPI** backend exposes `POST /analyze`.
- **HTML/CSS/JS** frontend shows the result.

## Run locally
1. `python -m venv venv` and activate it
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and add your Gemini API key
4. `cd backend` then `uvicorn main:app --reload`
5. Open http://127.0.0.1:8000/app/

## Limits
This tool gives credibility signals only. It can be wrong. Always verify
important claims with trusted sources.

## Team
- OSHIKA JAT: backend, Gemma integration
- HARSH MUKATI: frontend

## AI tools used (disclosure)
- Claude (Anthropic) was used for guidance and helped draft the initial backend code
  (FastAPI endpoint, Gemma prompt and helper). We ran, tested and modified it ourselves.
- Gemma 4 is part of the product itself (see above).
- [Add anything else you use tomorrow.]

## License
MIT