from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from services.nlp_engine import analyze_interview_response, detect_skill_gap, extract_skills

router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])


class MatchRequest(BaseModel):
    candidate_text: str = Field(min_length=1, max_length=100_000)
    job_description: str = Field(min_length=1, max_length=100_000)
    candidate_skills: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)


class ExtractSkillsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=100_000)


class InterviewEvalRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10_000)
    answer: str = Field(min_length=1, max_length=30_000)


@router.post("/match")
def match_candidate(request: MatchRequest):
    try:
        return detect_skill_gap(
            request.candidate_text,
            request.job_description,
            request.candidate_skills,
            request.required_skills,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI match failed: {exc}") from exc


@router.post("/extract-skills")
def extract_candidate_skills(request: ExtractSkillsRequest):
    try:
        return {"skills": extract_skills(request.text)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {exc}") from exc


@router.post("/interview-eval")
def evaluate_interview(request: InterviewEvalRequest):
    try:
        return analyze_interview_response(request.question, request.answer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Interview evaluation failed: {exc}") from exc
