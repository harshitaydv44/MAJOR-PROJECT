"""
AI Problem Summarizer Engine for Delhi Societal Innovation Portal
Generates a crisp 4-part structured executive summary:
- Problem
- Affected group
- Location
- Expected outcome
"""

from typing import Dict, Any, Optional
import re

def summarize_challenge(
    title: str,
    description: str,
    location: Optional[str] = None,
    district: Optional[str] = None
) -> Dict[str, Any]:
    full_text = f"{title}. {description}".strip()

    # 1. Problem formulation
    # Extract first sentence or title synthesis
    first_sent = full_text.split(".")[0].strip()
    if len(first_sent) > 160:
        problem = title.strip()
    else:
        problem = first_sent

    # 2. Extract Location
    loc_parts = []
    if location:
        loc_parts.append(location.strip())
    if district and district not in (location or ""):
        loc_parts.append(district.strip())

    if not loc_parts:
        # Search text for Delhi landmarks
        delhi_indicators = re.findall(
            r"(?:near|at|opposite|adjacent to|in)\s+([A-Z][a-zA-Z\s]+(?:Mandi|Hub|Drain|Metro|Terminal|Road|Colony|Nagar|Vihar|Gate))",
            full_text
        )
        if delhi_indicators:
            loc_parts.append(delhi_indicators[0].strip())
        else:
            loc_parts.append("NCT of Delhi (Specific sector pending GPS verification)")

    final_location = ", ".join(loc_parts)

    # 3. Extract Affected Group
    affected_group = "Local citizens, commuters, and area residents"
    if re.search(r"pedestrian|walk|female|women|senior citizen", full_text, re.IGNORECASE):
        affected_group = "Pedestrians, commuters, women, and senior citizens"
    elif re.search(r"commuter|transit|bus|passenger|metro", full_text, re.IGNORECASE):
        affected_group = "Daily transit commuters and public transportation passengers"
    elif re.search(r"student|child|school", full_text, re.IGNORECASE):
        affected_group = "School students, youth, and educators"
    elif re.search(r"market|vendor|wholesale|trader|mandi", full_text, re.IGNORECASE):
        affected_group = "Local vendors, mandi workers, and wholesale shoppers"
    elif re.search(r"differently abled|wheelchair|blind|accessibility", full_text, re.IGNORECASE):
        affected_group = "Differently-abled citizens and accessibility-seeking commuters"

    # 4. Extract Expected Outcome
    outcome_match = re.search(
        r"(?:requires|demanding|requesting|need for|solutions? include|target)\s+([^.]+)",
        full_text,
        re.IGNORECASE
    )
    if outcome_match:
        expected_outcome = f"Deployment of {outcome_match.group(1).strip()}"
    elif "biomethan" in full_text.lower():
        expected_outcome = "Decentralized biomethanation reactor pilot for clean fuel generation"
    elif "sensor" in full_text.lower() or "telemetry" in full_text.lower():
        expected_outcome = "Automated IoT telemetry node network for continuous environmental surveillance"
    elif "solar" in full_text.lower() or "light" in full_text.lower():
        expected_outcome = "Vandal-resistant solar-powered illumination and public safety infrastructure"
    elif "air" in full_text.lower() or "pm2.5" in full_text.lower():
        expected_outcome = "Low-power air filtration or electrostatic precipitation unit deployment"
    else:
        expected_outcome = "Deployable, low-cost engineering prototype developed by accredited university research labs"

    summary_dict = {
        "problem": problem,
        "affectedGroup": affected_group,
        "location": final_location,
        "expectedOutcome": expected_outcome
    }

    raw_summary = (
        f"Problem: {problem}. "
        f"Location: {final_location}. "
        f"Affected Group: {affected_group}. "
        f"Target Outcome: {expected_outcome}."
    )

    return {
        "summary": summary_dict,
        "rawSummary": raw_summary
    }
