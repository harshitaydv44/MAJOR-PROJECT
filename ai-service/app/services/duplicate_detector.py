"""
Semantic Duplicate Detection Engine for Delhi Societal Innovation Portal
Compares incoming challenge against existing database using Sentence Transformers / TF-IDF embeddings.
"""

from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_model = None
_model_failed = False

def get_sentence_transformer_model():
    global _model, _model_failed
    if _model is not None:
        return _model
    if _model_failed:
        return None

    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        return _model
    except Exception as e:
        print(f"[DuplicateDetector Warning] SentenceTransformers could not be loaded: {e}. Falling back to TF-IDF semantic matching.")
        _model_failed = True
        return None

def check_duplicates(
    title: str,
    description: str,
    existing_challenges: List[Dict[str, Any]],
    threshold: float = 0.72
) -> Dict[str, Any]:
    query_text = f"{title} {description}".strip()

    if not existing_challenges or not query_text:
        return {
            "possibleDuplicate": False,
            "similarityScore": 0.0,
            "threshold": threshold,
            "matchingChallengeIds": [],
            "topMatches": []
        }

    candidate_texts = []
    candidate_meta = []
    for c in existing_challenges:
        text = f"{c.get('title', '')} {c.get('description', '')}".strip()
        candidate_texts.append(text)
        candidate_meta.append({
            "id": str(c.get("id") or c.get("_id", "")),
            "code": c.get("code", "DEL-REF"),
            "title": c.get("title", "")
        })

    model = get_sentence_transformer_model()

    if model is not None:
        # 1. Neural embedding similarity via Sentence Transformers
        try:
            embeddings = model.encode([query_text] + candidate_texts, normalize_embeddings=True)
            query_emb = embeddings[0:1]
            candidate_embs = embeddings[1:]
            similarities = np.dot(candidate_embs, query_emb.T).flatten()
        except Exception as e:
            print(f"[DuplicateDetector Error] Embedding failed: {e}. Using TF-IDF fallback.")
            similarities = _tfidf_similarity(query_text, candidate_texts)
    else:
        # 2. Resilient TF-IDF similarity fallback
        similarities = _tfidf_similarity(query_text, candidate_texts)

    # Compile match results
    top_matches = []
    matching_ids = []
    max_score = 0.0

    for idx, sim in enumerate(similarities):
        score = float(sim)
        if score > max_score:
            max_score = score

        if score >= threshold:
            matching_ids.append(candidate_meta[idx]["id"])

        if score >= 0.35:  # record top candidates for review
            top_matches.append({
                "id": candidate_meta[idx]["id"],
                "code": candidate_meta[idx]["code"],
                "title": candidate_meta[idx]["title"],
                "similarityScore": round(score, 3)
            })

    # Sort matches by similarity score descending
    top_matches.sort(key=lambda x: x["similarityScore"], reverse=True)

    return {
        "possibleDuplicate": bool(max_score >= threshold),
        "similarityScore": round(float(max_score), 3),
        "threshold": threshold,
        "matchingChallengeIds": matching_ids,
        "topMatches": top_matches[:5],
        "engine": "SentenceTransformer-MiniLM-L6" if model is not None else "TFIDF-CosineSimilarity"
    }

def _tfidf_similarity(query: str, candidates: List[str]) -> np.ndarray:
    all_texts = [query] + candidates
    vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
    matrix = vec.fit_transform(all_texts)
    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    return sims
