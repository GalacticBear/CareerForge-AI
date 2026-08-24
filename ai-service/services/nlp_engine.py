from __future__ import annotations

import re
from functools import lru_cache
from typing import Iterable

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

SKILL_ALIASES: dict[str, set[str]] = {
    "javascript": {"javascript", "js", "ecmascript"},
    "typescript": {"typescript", "ts"},
    "python": {"python", "py"},
    "java": {"java"},
    "c++": {"c++", "cpp"},
    "c#": {"c#", "csharp", ".net"},
    "react": {"react", "reactjs", "react.js"},
    "node.js": {"node", "nodejs", "node.js"},
    "express": {"express", "expressjs", "express.js"},
    "fastapi": {"fastapi"},
    "django": {"django"},
    "flask": {"flask"},
    "mongodb": {"mongodb", "mongo", "mongo db"},
    "sql": {"sql", "mysql", "postgresql", "postgres"},
    "postgresql": {"postgresql", "postgres"},
    "docker": {"docker", "containerization", "containers"},
    "kubernetes": {"kubernetes", "k8s"},
    "aws": {"aws", "amazon web services"},
    "azure": {"azure", "microsoft azure"},
    "gcp": {"gcp", "google cloud", "google cloud platform"},
    "git": {"git", "github", "gitlab", "bitbucket"},
    "rest api": {"rest api", "restful api", "rest"},
    "graphql": {"graphql"},
    "machine learning": {"machine learning", "ml"},
    "deep learning": {"deep learning", "neural networks"},
    "nlp": {"nlp", "natural language processing"},
    "pandas": {"pandas"},
    "numpy": {"numpy"},
    "scikit-learn": {"scikit-learn", "scikit learn", "sklearn"},
    "tensorflow": {"tensorflow", "tf"},
    "pytorch": {"pytorch", "torch"},
    "data analysis": {"data analysis", "data analytics"},
    "power bi": {"power bi", "powerbi", "power-bi", "microsoft power bi"},
    "communication": {"communication", "communicating", "stakeholder communication"},
    "leadership": {"leadership", "team leadership", "people management"},
    "problem solving": {"problem solving", "problem-solving"},
}


# Longer aliases are checked first to reduce accidental partial matches.
SKILL_TERMS = sorted(
    SKILL_ALIASES.keys(),
    key=lambda item: len(item),
    reverse=True,
)


def _normalize(text: str) -> str:
    """Lowercase, normalize punctuation/whitespace, and make skill matching forgiving."""
    value = (text or "").lower()
    value = value.replace("‐", "-").replace("–", "-").replace("—", "-")
    value = value.replace("_", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def _normalize_skill_name(skill: str) -> str:
    """Map a user/job skill label to the canonical skill key."""
    normalized = _normalize(skill)
    normalized = normalized.replace(" / ", "/")
    compact = re.sub(r"[^a-z0-9+#.]+", "", normalized)

    for canonical, aliases in SKILL_ALIASES.items():
        if normalized == canonical:
            return canonical
        for alias in aliases:
            alias_normalized = _normalize(alias)
            if normalized == alias_normalized:
                return canonical
            if compact and compact == re.sub(r"[^a-z0-9+#.]+", "", alias_normalized):
                return canonical
    return normalized


def _skill_regex(alias: str) -> re.Pattern[str]:
    """Create a tolerant whole-skill regex for punctuation/spacing variants."""
    normalized = _normalize(alias)
    escaped = re.escape(normalized)
    escaped = escaped.replace(r"\ ", r"\s+")
    escaped = escaped.replace(r"\-", r"[-\s]?")
    return re.compile(r"(?<![a-z0-9+#])" + escaped + r"(?![a-z0-9+#])", re.IGNORECASE)


def _text_contains_skill(skill: str, text: str) -> bool:
    """Return True when any known alias for the skill is present in text."""
    normalized = _normalize(text)
    canonical = _normalize_skill_name(skill)
    aliases = SKILL_ALIASES.get(canonical, {canonical})
    return any(_skill_regex(alias).search(normalized) for alias in aliases)


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def generate_dense_embeddings(texts: Iterable[str]) -> np.ndarray:
    clean = [text if text and text.strip() else "" for text in texts]
    if not clean:
        return np.empty((0, 384), dtype=np.float32)
    return get_model().encode(clean, normalize_embeddings=True, convert_to_numpy=True)


def compute_semantic_match_score(candidate_text: str, job_description: str) -> float:
    if not candidate_text.strip() or not job_description.strip():
        return 0.0
    vectors = generate_dense_embeddings([candidate_text, job_description])
    raw = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
    return round(max(0.0, min(1.0, raw)) * 100, 2)


def extract_skills(text: str) -> list[str]:
    """Extract canonical skills using exact/alias-aware matching."""
    normalized = _normalize(text)
    found: list[str] = []

    for canonical, aliases in SKILL_ALIASES.items():
        if any(_skill_regex(alias).search(normalized) for alias in aliases):
            found.append(canonical)

    return sorted(set(found))


def _skill_score(skill: str, candidate_text: str, job_text: str) -> float:
    """Semantic evidence score used only when an exact/alias skill match is absent."""
    vectors = generate_dense_embeddings([skill, candidate_text, job_text])
    candidate_sim = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
    job_sim = float(cosine_similarity(vectors[0:1], vectors[2:3])[0][0])
    return round(max(0.0, min(1.0, (candidate_sim * 0.55) + (job_sim * 0.45))) * 100, 2)


def detect_skill_gap(
    candidate_text: str,
    job_description: str,
    candidate_skills: list[str] | None = None,
    required_skills: list[str] | None = None,
) -> dict:
    """Return matched, weak, and missing skills with exact matches taking priority.

    Exact/alias matches are always considered matched. Semantic evidence is used only
    when the candidate does not explicitly show the required skill. This prevents an
    exact skill such as Python, AWS, Power BI, or Docker from being downgraded merely
    because the embedding similarity for that skill happens to be below a threshold.
    """
    candidate_skills = sorted(
        {
            _normalize_skill_name(skill)
            for skill in (candidate_skills or extract_skills(candidate_text))
            if skill and _normalize_skill_name(skill)
        }
    )

    explicit_job_skills = [
        _normalize_skill_name(skill)
        for skill in (required_skills or [])
        if skill and _normalize_skill_name(skill)
    ]
    job_skills = sorted(
        set(explicit_job_skills or extract_skills(job_description))
    )

    candidate_set = set(candidate_skills)
    matched: list[dict] = []
    weak: list[dict] = []
    missing: list[str] = []

    for skill in job_skills:
        exact_from_profile = skill in candidate_set
        exact_from_text = _text_contains_skill(skill, candidate_text)

        if exact_from_profile or exact_from_text:
            evidence = 100.0 if exact_from_profile else 95.0
            matched.append(
                {
                    "skill": skill,
                    "evidence_score": evidence,
                    "match_type": "exact" if exact_from_profile else "text",
                }
            )
            continue

        # Only calculate an embedding-based skill score for skills that are not
        # explicitly present in the candidate profile/text.
        evidence = _skill_score(skill, candidate_text, job_description)
        if evidence >= 62:
            weak.append({"skill": skill, "evidence_score": evidence, "match_type": "semantic"})
        else:
            missing.append(skill)

    total_required = max(1, len(job_skills))
    matched_score = len(matched) * 100 / total_required
    weighted_coverage = ((len(matched) * 1.0) + (len(weak) * 0.5)) / total_required * 100
    semantic = compute_semantic_match_score(candidate_text, job_description)

    # Skill coverage is the primary signal; semantic similarity provides broader
    # context without overriding obvious exact matches.
    overall = round(
        min(100.0, weighted_coverage * 0.65 + semantic * 0.35),
        2,
    )

    return {
        "score": overall,
        "semantic_score": semantic,
        "skill_coverage": round(matched_score, 2),
        "candidate_skills": candidate_skills,
        "required_skills": job_skills,
        "matched_skills": matched,
        "weak_skills": weak,
        "missing_skills": missing,
    }


def analyze_interview_response(question: str, answer: str) -> dict:
    normalized = _normalize(answer)
    word_count = len(normalized.split())
    sentences = [s.strip() for s in re.split(r"[.!?]+", normalized) if s.strip()]
    sentence_count = max(1, len(sentences))
    first_person = len(re.findall(r"\b(i|we|my|our)\b", normalized))
    evidence_terms = len(re.findall(r"\b(because|for example|for instance|measured|result|improved|increased|reduced|achieved|learned)\b", normalized))
    filler_terms = len(re.findall(r"\b(um|uh|like|you know|basically|sort of|kind of)\b", normalized))
    negative_terms = len(re.findall(r"\b(hate|terrible|impossible|can't|cannot|never|angry|stupid)\b", normalized))

    relevance = min(100, 35 + min(45, word_count * 0.55) + min(20, evidence_terms * 4))
    clarity = max(0, min(100, 100 - filler_terms * 12 - max(0, sentence_count - 10) * 2))
    professionalism = max(0, min(100, 82 + first_person * 1.5 + evidence_terms * 2 - negative_terms * 10))
    specificity = min(100, 35 + evidence_terms * 9 + (10 if re.search(r"\d", normalized) else 0))
    quality = round(relevance * 0.35 + clarity * 0.2 + professionalism * 0.2 + specificity * 0.25, 2)

    if quality >= 85:
        tone = "confident and professional"
    elif professionalism >= 72:
        tone = "professional with room to sharpen"
    else:
        tone = "uncertain or overly negative"

    suggestions = []
    if evidence_terms < 2:
        suggestions.append("Add a concrete example and measurable outcome.")
    if word_count < 55:
        suggestions.append("Expand the response with context, action, and result.")
    if filler_terms > 0:
        suggestions.append("Reduce filler phrases and use shorter, deliberate sentences.")
    if not suggestions:
        suggestions.append("Keep the structure and finish with a concise impact statement.")

    return {
        "score": quality,
        "tone": tone,
        "metrics": {
            "relevance": round(relevance, 2),
            "clarity": round(clarity, 2),
            "professionalism": round(professionalism, 2),
            "specificity": round(specificity, 2),
        },
        "word_count": word_count,
        "question": question,
        "suggestions": suggestions,
    }
