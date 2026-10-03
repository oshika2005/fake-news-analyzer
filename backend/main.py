from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from gemma_helper import analyze

app = FastAPI(title="Fake News Credibility Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze_text(req: AnalyzeRequest):
    text = req.text.strip()
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="Text is too short. Paste the full message.")
    if len(text) > 3000:
        raise HTTPException(status_code=400, detail="Text is too long. Keep it under 3000 characters.")
    return analyze(text)


# Partner ka frontend folder yahin se serve hoga: http://127.0.0.1:8000/app/
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")