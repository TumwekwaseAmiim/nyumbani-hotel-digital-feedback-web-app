
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ai"))
from inference import analyze_text

app = FastAPI(title="Nyumbani Hotel Feedback AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/")
def health():
    return {"status":"ok","service":"Nyumbani Hotel Feedback AI"}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    return analyze_text(req.text)
