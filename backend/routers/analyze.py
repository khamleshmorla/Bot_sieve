from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.analyzer import run_full_analysis

router = APIRouter()


class AnalyzeRequest(BaseModel):
    hashtag: str


@router.post("/analyze")
def analyze_hashtag(request: AnalyzeRequest):
    hashtag = request.hashtag.strip()
    if not hashtag:
        raise HTTPException(status_code=400, detail="hashtag cannot be empty")

    # Normalize: ensure it starts with #
    if not hashtag.startswith("#"):
        hashtag = f"#{hashtag}"

    try:
        result = run_full_analysis(hashtag)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
