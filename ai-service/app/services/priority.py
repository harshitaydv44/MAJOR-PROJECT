"""
AI Priority Recommendation Engine for Delhi Societal Innovation Portal
Estimates civic priority (LOW, MEDIUM, HIGH, CRITICAL) using severity keywords, urgency signals, and demographic exposure.
Always labels output as a non-binding recommendation for administrative oversight.
"""

from typing import Dict, Any, Optional
import re

CRITICAL_KEYWORDS = [
    "fatal", "death", "toxic", "poisonous", "explosion", "leachate", "collapse",
    "electrocution", "epidemic", "outbreak", "hazard", "asphyxiation", "unconscious",
    "emergency", "urgent hospital", "groundwater contamination"
]

HIGH_SEVERITY_KEYWORDS = [
    "severe", "blackout", "overflow", "flooding", "chromium", "industrial effluent",
    "particulate", "pm2.5 peak", "untraceable", "dangerous", "dark spot", "women safety",
    "commuter risk", "health hazard", "choking"
]

MODERATE_KEYWORDS = [
    "odor", "stench", "pothole", "delay", "maintenance", "streetlight",
    "guidance", "signage", "accessibility", "queue", "broken"
]

def estimate_priority(
    title: str,
    description: str,
    urgency: Optional[str] = None,
    severity: Optional[str] = None,
    affected_population: Optional[str] = None
) -> Dict[str, Any]:
    text = f"{title} {description} {affected_population or ''}".lower()

    score = 0.35  # baseline medium
    reasoning_factors = []

    # 1. Check critical keyword triggers
    found_critical = [k for k in CRITICAL_KEYWORDS if k in text]
    if found_critical:
        score += 0.40
        reasoning_factors.append(f"High-risk indicators identified: ({', '.join(found_critical[:3])})")

    # 2. Check high severity triggers
    found_high = [k for k in HIGH_SEVERITY_KEYWORDS if k in text]
    if found_high:
        score += 0.25
        reasoning_factors.append(f"Public safety/environmental stress terms detected: ({', '.join(found_high[:3])})")

    # 3. Urgency parameter weighting
    if urgency:
        u = urgency.lower()
        if u == "immediate":
            score += 0.25
            reasoning_factors.append("Submitter flagged immediate operational urgency")
        elif u == "high":
            score += 0.15
            reasoning_factors.append("Submitter marked high priority timeframe")
        elif u == "low":
            score -= 0.15

    # 4. Severity parameter weighting
    if severity:
        s = severity.lower()
        if s == "critical":
            score += 0.25
            reasoning_factors.append("Severity classified as critical risk by reporter")
        elif s == "severe":
            score += 0.15
        elif s == "minor":
            score -= 0.15

    # 5. Numerical population extraction
    population_matches = re.findall(r"(\d+[\d,]*)\s*(?:residents|citizens|people|passengers|commuters)", text)
    if population_matches:
        raw_num = population_matches[0].replace(",", "")
        try:
            num = int(raw_num)
            if num >= 20000:
                score += 0.20
                reasoning_factors.append(f"High-density demographic exposure estimated ({num:,} citizens)")
            elif num >= 5000:
                score += 0.10
                reasoning_factors.append(f"Moderate population scale impacted ({num:,} citizens)")
        except ValueError:
            pass

    # Normalize score between 0.10 and 0.98
    final_score = max(0.10, min(0.98, score))

    if final_score >= 0.75:
        recommendation = "CRITICAL"
        confidence = 0.85
    elif final_score >= 0.50:
        recommendation = "HIGH"
        confidence = 0.80
    elif final_score >= 0.28:
        recommendation = "MEDIUM"
        confidence = 0.75
    else:
        recommendation = "LOW"
        confidence = 0.70

    reasoning = "; ".join(reasoning_factors) if reasoning_factors else "Standard civic maintenance profile detected."

    return {
        "recommendation": recommendation,
        "confidence": round(float(confidence), 2),
        "score": round(float(final_score), 2),
        "reasoning": reasoning,
        "isRecommendation": True,
        "disclaimer": "AI-generated recommendation for nodal decision support. Final operational priority remains under administrative clearance."
    }
