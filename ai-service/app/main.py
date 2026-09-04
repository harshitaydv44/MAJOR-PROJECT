from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import logging

from app.services.classifier import classifier_service
from app.services.priority import estimate_priority
from app.services.duplicate_detector import check_duplicates
from app.services.summarizer import summarize_challenge
from app.services.matcher import match_universities, match_industries

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("delhi-ai-service")

app = FastAPI(
    title="Delhi Societal Innovation AI Service",
    description="Microservice providing AI challenge classification, duplicate detection, priority estimation, and summarization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Schemas
class ClassifyRequest(BaseModel):
    title: str = Field(..., description="Challenge title")
    description: str = Field(..., description="Detailed problem statement")

class ClassifyResponse(BaseModel):
    category: str
    subcategory: str
    confidence: float
    requiresHumanReview: bool
    explanation: str

class PriorityRequest(BaseModel):
    title: str
    description: str
    urgency: Optional[str] = None
    severity: Optional[str] = None
    affected_population: Optional[str] = None

class PriorityResponse(BaseModel):
    recommendation: str
    confidence: float
    score: float
    reasoning: str
    isRecommendation: bool
    disclaimer: str

class DuplicateCandidate(BaseModel):
    id: Optional[str] = None
    _id: Optional[str] = None
    code: Optional[str] = "DEL-REF"
    title: str
    description: str

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    existing_challenges: List[Dict[str, Any]] = []
    threshold: Optional[float] = 0.72

class DuplicateCheckResponse(BaseModel):
    possibleDuplicate: bool
    similarityScore: float
    threshold: float
    matchingChallengeIds: List[str]
    topMatches: List[Dict[str, Any]]
    engine: str

class SummarizeRequest(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    district: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: Dict[str, str]
    rawSummary: str

class MatchUniversitiesRequest(BaseModel):
    challenge: Dict[str, Any]
    universities: List[Dict[str, Any]]

class MatchIndustriesRequest(BaseModel):
    project: Dict[str, Any]
    industries: List[Dict[str, Any]]

# Middleware for request timing and audit logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming AI request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Completed {request.url.path} in {process_time:.1f}ms - Status {response.status_code}")
        return response
    except Exception as exc:
        logger.error(f"Error processing {request.url.path}: {exc}", exc_info=True)
        raise exc

@app.get("/", tags=["Info"])
def root():
    return {
        "service": "Delhi Societal Innovation AI Service",
        "status": "ready",
        "endpoints": [
            "/ai/classify",
            "/ai/priority",
            "/ai/duplicate-check",
            "/ai/summarize",
            "/health",
            "/docs"
        ]
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "delhi-societal-ai-service",
        "version": "1.0.0",
        "models": {
            "classifier": "scikit-learn TF-IDF + Cosine Similarity",
            "priority": "Multi-factor Heuristic + Lexical Risk Model",
            "duplicate_detector": "SentenceTransformers / TF-IDF Vectorizer",
            "summarizer": "Structured Extraction Model"
        }
    }

@app.post("/ai/classify", response_model=ClassifyResponse, tags=["AI Services"])
def classify_endpoint(payload: ClassifyRequest):
    try:
        result = classifier_service.classify(payload.title, payload.description)
        return ClassifyResponse(**result)
    except Exception as e:
        logger.error(f"Classification failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/ai/priority", response_model=PriorityResponse, tags=["AI Services"])
def priority_endpoint(payload: PriorityRequest):
    try:
        result = estimate_priority(
            title=payload.title,
            description=payload.description,
            urgency=payload.urgency,
            severity=payload.severity,
            affected_population=payload.affected_population
        )
        return PriorityResponse(**result)
    except Exception as e:
        logger.error(f"Priority estimation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Priority estimation failed: {str(e)}")

@app.post("/ai/duplicate-check", response_model=DuplicateCheckResponse, tags=["AI Services"])
def duplicate_check_endpoint(payload: DuplicateCheckRequest):
    try:
        result = check_duplicates(
            title=payload.title,
            description=payload.description,
            existing_challenges=payload.existing_challenges,
            threshold=payload.threshold or 0.72
        )
        return DuplicateCheckResponse(**result)
    except Exception as e:
        logger.error(f"Duplicate check failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Duplicate check failed: {str(e)}")

@app.post("/ai/summarize", response_model=SummarizeResponse, tags=["AI Services"])
def summarize_endpoint(payload: SummarizeRequest):
    try:
        result = summarize_challenge(
            title=payload.title,
            description=payload.description,
            location=payload.location,
            district=payload.district
        )
        return SummarizeResponse(**result)
    except Exception as e:
        logger.error(f"Summarization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@app.post("/ai/match-universities", tags=["AI Matching"])
def match_universities_endpoint(payload: MatchUniversitiesRequest):
    try:
        recommendations = match_universities(payload.challenge, payload.universities)
        return {
            "success": True,
            "count": len(recommendations),
            "recommendations": recommendations,
            "disclaimer": "AI recommendations assist users and do not replace formal administrative allocations."
        }
    except Exception as e:
        logger.error(f"University matching failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"University matching failed: {str(e)}")

@app.post("/ai/match-industries", tags=["AI Matching"])
def match_industries_endpoint(payload: MatchIndustriesRequest):
    try:
        recommendations = match_industries(payload.project, payload.industries)
        return {
            "success": True,
            "count": len(recommendations),
            "recommendations": recommendations,
            "disclaimer": "AI recommendations assist users and do not constitute binding partnership contracts."
        }
    except Exception as e:
        logger.error(f"Industry matching failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Industry matching failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
