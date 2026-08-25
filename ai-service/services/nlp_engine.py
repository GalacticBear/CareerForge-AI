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


def _question_keywords(question: str) -> set[str]:
    stop_words = {
        "a", "an", "the", "and", "or", "to", "of", "for", "in", "on", "at", "is", "are",
        "was", "were", "be", "do", "did", "you", "your", "me", "my", "tell", "about", "how",
        "what", "why", "when", "where", "which", "can", "could", "would", "should", "have", "has",
    }
    return {
        token
        for token in re.findall(r"[a-z0-9+#.]+", _normalize(question))
        if len(token) > 2 and token not in stop_words
    }


def _topic_evidence(question: str, answer: str) -> int:
    q = _normalize(question)
    a = _normalize(answer)
    groups = [
        ({"project", "challenge", "difficult", "problem", "solved", "solution"}, {"project", "platform", "system", "solution", "built", "developed", "implemented", "created", "deployed", "designed", "solved", "challenge", "problem"}),
        ({"team", "teammate", "collaboration", "conflict", "leadership"}, {"team", "teammate", "collaborated", "collaboration", "stakeholder", "led", "leadership", "conflict"}),
        ({"hire", "strength", "strengths", "fit", "why"}, {"experience", "skills", "strength", "built", "delivered", "impact", "value", "fit"}),
        ({"failure", "mistake", "learn"}, {"failure", "mistake", "learned", "lesson", "improved", "changed"}),
        ({"goal", "achievement", "achieved", "success"}, {"achieved", "delivered", "result", "impact", "increased", "reduced", "saved", "success"}),
    ]
    score = 0
    for triggers, evidence_terms in groups:
        if triggers.intersection(set(q.split())) or any(term in q for term in triggers):
            score = max(score, min(100, 20 + sum(1 for term in evidence_terms if re.search(rf"\b{re.escape(term)}\b", a)) * 18))
    return score


def analyze_interview_response(question: str, answer: str) -> dict:
    normalized_question = _normalize(question)
    normalized = _normalize(answer)
    word_count = len(normalized.split())
    sentences = [s.strip() for s in re.split(r"[.!?]+", normalized) if s.strip()]
    sentence_count = max(1, len(sentences))
    first_person = len(re.findall(r"\b(i|we|my|our)\b", normalized))
    evidence_terms = len(re.findall(r"\b(because|for example|for instance|measured|result|improved|increased|reduced|achieved|learned|built|developed|implemented|deployed|designed)\b", normalized))
    filler_terms = len(re.findall(r"\b(um|uh|like|you know|basically|sort of|kind of)\b", normalized))
    negative_terms = len(re.findall(r"\b(hate|terrible|impossible|can't|cannot|never|angry|stupid)\b", normalized))

    # Relevance is anchored to the interview question. Use the existing embedding
    # model when available and combine it with lexical/topic evidence. This prevents
    # unrelated answers from receiving a misleadingly high score merely because they
    # are long, grammatical, or written in first person.
    semantic_relevance = compute_semantic_match_score(normalized_question, normalized)
    question_terms = _question_keywords(normalized_question)
    answer_terms = set(re.findall(r"[a-z0-9+#.]+", normalized))
    overlap = len(question_terms & answer_terms) / max(1, len(question_terms)) * 100
    topic_evidence = _topic_evidence(normalized_question, normalized)

    relevance = round(min(100, semantic_relevance * 0.55 + overlap * 0.2 + topic_evidence * 0.25), 2)

    # Hard floor for clearly unrelated answers. This is intentionally conservative:
    # an answer may use different vocabulary from the question while still being
    # relevant, but an answer with no semantic/topic/keyword evidence should not pass.
    if semantic_relevance < 25 and overlap == 0 and topic_evidence == 0:
        relevance = min(relevance, 15)
    elif semantic_relevance < 35 and topic_evidence < 25 and overlap < 10:
        relevance = min(relevance, 35)

    clarity = max(0, min(100, 100 - filler_terms * 12 - max(0, sentence_count - 10) * 2))
    professionalism = max(0, min(100, 82 + first_person * 1.5 + evidence_terms * 2 - negative_terms * 10))
    specificity = min(100, 25 + evidence_terms * 8 + (15 if re.search(r"\d", normalized) else 0) + min(20, max(0, word_count - 35) * 0.4))

    # Relevance is deliberately the largest weight because it is the main bug fixed.
    quality = round(relevance * 0.45 + clarity * 0.15 + professionalism * 0.15 + specificity * 0.25, 2)
    if relevance < 25:
        quality = min(25.0, quality)
    elif relevance < 40:
        quality = min(45.0, quality)

    if relevance < 25:
        tone = "off-topic or not responsive"
    elif quality >= 85:
        tone = "confident and professional"
    elif professionalism >= 72:
        tone = "professional with room to sharpen"
    else:
        tone = "uncertain or overly negative"

    suggestions = []
    if relevance < 35:
        suggestions.append("Your answer does not clearly address the question. Directly answer the prompt and explain the relevant situation or experience.")
    if relevance < 65 and not suggestions:
        suggestions.append("Connect your example more explicitly to the question and explain why it was relevant.")
    if evidence_terms < 2:
        suggestions.append("Add a concrete example with the actions you took and the measurable result.")
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
        "suggestions": suggestions[:3],
    }
