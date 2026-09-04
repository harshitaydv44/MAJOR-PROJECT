"""
AI Classification Engine for Delhi Societal Innovation Portal
Categorizes problem statements across 12 civic categories using scikit-learn TF-IDF and keyword semantics.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

CATEGORIES = [
    "Education",
    "Healthcare",
    "Agriculture",
    "Water Management",
    "Sanitation",
    "Environment",
    "Energy",
    "Urban Infrastructure",
    "Accessibility",
    "Public Services",
    "Rural Livelihoods",
    "Other"
]

SUBCATEGORIES: Dict[str, List[str]] = {
    "Education": ["digital_classrooms", "stem_labs", "special_education", "vocational_training", "school_infrastructure"],
    "Healthcare": ["primary_health_centers", "maternal_care", "disease_surveillance", "telemedicine", "medical_waste"],
    "Agriculture": ["peri_urban_farming", "hydroponics", "cold_storage", "soil_testing", "farmers_markets"],
    "Water Management": ["groundwater_recharge", "water_quality_monitoring", "drain_treatment", "drinking_water_supply", "rainwater_harvesting"],
    "Sanitation": ["solid_waste_management", "biomethanation", "leachate_control", "public_toilets", "automated_drain_cleaning"],
    "Environment": ["air_pollution_pm25", "industrial_emissions", "noise_pollution", "yamuna_rejuvenation", "urban_forestry"],
    "Energy": ["rooftop_solar", "ev_charging_infrastructure", "smart_grid_monitoring", "street_lighting_efficiency", "battery_storage"],
    "Urban Infrastructure": ["traffic_congestion", "pedestrian_subways", "pothole_detection", "smart_parking", "bridge_integrity"],
    "Accessibility": ["tactile_paving", "auditory_metro_navigation", "wheelchair_ramps", "inclusive_public_transport", "assistive_tech"],
    "Public Services": ["ration_distribution", "citizen_grievance_portal", "emergency_response", "digitized_certificates", "community_safety"],
    "Rural Livelihoods": ["artisan_handicrafts", "self_help_groups", "peri_urban_dairy", "micro_enterprises", "market_linkages"],
    "Other": ["general_civic_issue", "miscellaneous_innovation", "unclassified_problem"]
}

# Domain seed corpora representing core vocabulary for each category
CATEGORY_CORPORA: Dict[str, str] = {
    "Sanitation": "waste garbage trash solid refuse biomethanation leachate compost dump landfill sewage septic toilet drain sewer cleanliness bio-waste Ghazipur Okhla Bhalswa",
    "Water Management": "water drainage drain Najafgarh groundwater contamination effluent wastewater sewage borewell pipe leakage water supply drinking water TDS toxic chromium water table",
    "Environment": "air quality pollution smog PM2.5 PM10 particulate dust emission factory smoke industrial clean air haze Anand Vihar tree green forest Yamuna river riverbed ecological",
    "Urban Infrastructure": "traffic road subway underpass pothole pavement street pedestrian signal flyover bridge highway bus stop parking transit congestion crossing lights Ring Road",
    "Accessibility": "differently abled disability wheelchair blind vision visually impaired tactile braille auditory navigation ramp barrier free elevator escalator senior citizen",
    "Healthcare": "hospital clinic health medicine medical doctor disease patient ambulance clinic dispensaries maternal vaccine infection health center healthcare clinic fever",
    "Energy": "solar power electricity grid voltage blackout streetlight EV electric vehicle charger battery renewable rooftop generator LED energy efficiency",
    "Education": "school student teacher classroom college university education books laboratory stem library children learning primary higher study",
    "Agriculture": "farming crop soil fertilizer seed vegetable harvest irrigation peri-urban farm nursery Mandi farmer agriculture cultivation dairy",
    "Public Services": "ration card civil supplies government office certificate birth police community safety municipal MCD public service grievance portal verification",
    "Rural Livelihoods": "artisan handloom pottery craft village rural livelihood self help group micro enterprise income generation stall weaving",
    "Other": "general miscellaneous civic complaint municipal repair issue administrative problem citizen proposal"
}

class ChallengeClassifier:
    def __init__(self):
        self.categories = list(CATEGORY_CORPORA.keys())
        self.corpus_docs = [CATEGORY_CORPORA[cat] for cat in self.categories]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', min_df=1)
        self.corpus_matrix = self.vectorizer.fit_transform(self.corpus_docs)

    def classify(self, title: str, description: str) -> Dict[str, Any]:
        text = f"{title} {description}".strip()
        if not text:
            return {
                "category": "Other",
                "subcategory": "general_civic_issue",
                "confidence": 0.1,
                "requiresHumanReview": True,
                "explanation": "Insufficient input text provided."
            }

        # Transform input text using vectorizer
        query_vec = self.vectorizer.transform([text])
        similarities = cosine_similarity(query_vec, self.corpus_matrix)[0]

        top_indices = np.argsort(similarities)[::-1]
        best_idx = top_indices[0]
        second_idx = top_indices[1]

        best_category = self.categories[best_idx]
        best_score = float(similarities[best_idx])
        second_score = float(similarities[second_idx])

        # Normalize score into calibrated confidence
        if best_score <= 0.05:
            confidence = 0.30
            category = "Other"
        else:
            # Scale similarity into a realistic confidence
            confidence = min(0.95, max(0.40, best_score * 1.8))
            category = best_category

        # Select matching subcategory
        subcategories = SUBCATEGORIES.get(category, ["general_civic_issue"])
        subcategory = subcategories[0]
        for sub in subcategories:
            sub_words = sub.replace("_", " ")
            if any(w in text.lower() for w in sub_words.split()):
                subcategory = sub
                break

        # Human review threshold (< 0.65)
        requires_human_review = bool(confidence < 0.65 or (best_score - second_score < 0.04 and confidence < 0.75))

        # Explanation
        matched_feature_indices = query_vec.nonzero()[1]
        feature_names = self.vectorizer.get_feature_names_out()
        extracted_keywords = [feature_names[idx] for idx in matched_feature_indices[:5]]

        explanation = (
            f"Assigned based on semantic similarity to {category} domain vectors. "
            f"Matched tokens: {', '.join(extracted_keywords) if extracted_keywords else 'text patterns'}."
        )

        return {
            "category": category,
            "subcategory": subcategory,
            "confidence": round(float(confidence), 3),
            "requiresHumanReview": requires_human_review,
            "explanation": explanation
        }

classifier_service = ChallengeClassifier()
