import re
from typing import List, Dict, Any

def tokenize(text: str) -> set:
    if not text:
        return set()
    words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', text.lower())
    stopwords = {
        'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been',
        'delhi', 'project', 'system', 'innovation', 'portal', 'solution',
        'require', 'required', 'needs', 'about', 'across', 'using'
    }
    return {w for w in words if w not in stopwords}

def match_universities(challenge_data: Dict[str, Any], universities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks universities based on domain expertise, faculty specializations, lab facilities,
    and incubation capabilities for a validated challenge.
    """
    ch_title = challenge_data.get('title', '')
    ch_desc = challenge_data.get('description', '')
    ch_cat = (challenge_data.get('category') or '').lower()
    ch_techs = [t.lower() for t in challenge_data.get('required_technologies', [])]
    ch_keywords = [k.lower() for k in challenge_data.get('keywords', [])]

    ch_tokens = tokenize(f"{ch_title} {ch_desc} {' '.join(ch_techs)} {' '.join(ch_keywords)}")

    ranked = []

    for uni in universities:
        uni_id = str(uni.get('id') or uni.get('_id') or '')
        uni_name = uni.get('name', 'University')
        
        expertise = [e.lower() for e in uni.get('expertise', [])]
        research_areas = [r.lower() for r in uni.get('researchAreas', [])]
        labs = uni.get('labsAndFacilities', [])
        innov_centre = uni.get('innovationCentre', '')
        incubation = uni.get('incubationFacilities', '')
        faculty = uni.get('facultySpecializations', [])

        reasons = []
        score = 0.50  # Base institutional baseline score

        # 1. Category & Domain Alignment (up to +0.20)
        domain_tokens = set()
        for e in expertise + research_areas:
            domain_tokens.update(tokenize(e))

        domain_overlap = ch_tokens.intersection(domain_tokens)
        if ch_cat in ' '.join(expertise + research_areas) or ch_cat in domain_tokens:
            score += 0.15
            reasons.append(f"University has active academic specialization in {challenge_data.get('category')}.")
        elif domain_overlap:
            score += 0.10
            sample_overlap = list(domain_overlap)[:3]
            reasons.append(f"Domain alignment in {', '.join(sample_overlap).title()}.")

        # 2. Technology & Research Overlap (up to +0.15)
        all_matched_skills = []
        for tech in ch_techs:
            if tech in domain_tokens or any(tech in e for e in expertise):
                all_matched_skills.append(tech.upper())
        for exp in expertise:
            if any(t in exp for t in ch_tokens):
                all_matched_skills.append(exp.title())

        unique_skills = []
        for s in all_matched_skills:
            if s not in unique_skills:
                unique_skills.append(s)

        if len(unique_skills) >= 2:
            score += 0.15
            joined_skills = ", ".join(unique_skills[:2])
            if len(unique_skills) > 2:
                joined_skills += f" and {unique_skills[2]}"
            reasons.append(f"Strong match because the university has expertise in {joined_skills}.")
        elif unique_skills:
            score += 0.10
            reasons.append(f"Strong match because the university has expertise in {unique_skills[0]}.")
        elif expertise:
            sample_exp = [e.title() for e in expertise[:3]]
            reasons.append(f"Core departmental expertise covers {', '.join(sample_exp)}.")
            score += 0.05

        # 3. Faculty Specialization (up to +0.10)
        matched_faculty = []
        for f in faculty:
            f_spec = (f.get('specialization') or '').lower()
            f_tokens = tokenize(f_spec)
            if ch_tokens.intersection(f_tokens) or (ch_cat and ch_cat in f_spec):
                f_name = f.get('facultyName', 'Faculty Researcher')
                matched_faculty.append(f"{f_name} ({f.get('specialization', '')})")

        if matched_faculty:
            score += 0.10
            reasons.append(f"Dedicated faculty mentorship available: {matched_faculty[0]}.")
        elif faculty:
            score += 0.03

        # 4. Lab & Incubation Facilities (up to +0.10)
        if labs:
            score += 0.06
            reasons.append(f"Advanced laboratory facilities available: {labs[0]}.")
        if innov_centre or incubation:
            score += 0.05
            reasons.append("Active innovation centre & technology business incubator for rapid prototyping.")

        # 5. Previous Project Areas (up to +0.08)
        prev_projects = uni.get('previousProjectAreas', [])
        matched_prev = []
        for p in prev_projects:
            p_tokens = tokenize(p)
            if ch_tokens.intersection(p_tokens) or (ch_cat and ch_cat in p.lower()):
                matched_prev.append(p)

        if matched_prev:
            score += 0.08
            reasons.append(f"Demonstrated institutional track record with prior municipal projects in {matched_prev[0]}.")

        # Clamp score between 0.60 and 0.96
        final_score = min(0.96, max(0.60, round(score, 2)))
        percentage = int(round(final_score * 100))

        if not reasons:
            reasons.append("Baseline municipal innovation partnership capability in NCT of Delhi.")

        ranked.append({
            "universityId": uni_id,
            "universityName": uni_name,
            "score": final_score,
            "percentage": percentage,
            "matchingReasons": reasons,
            "explainableSummary": "Recommended based on expertise, facilities and project requirements."
        })

    # Sort descending by score
    ranked.sort(key=lambda x: x['score'], reverse=True)
    return ranked

def match_industries(project_data: Dict[str, Any], industries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks corporate/industry partners based on technological synergy, CSR budget capability,
    mentorship availability, and prototyping/field-testing infrastructure for a university project.
    """
    proj_title = project_data.get('title', '')
    proj_desc = project_data.get('description', '')
    proj_techs = [t.lower() for t in project_data.get('technologies', [])]
    proj_budget = float(project_data.get('budget') or 1000000)

    proj_tokens = tokenize(f"{proj_title} {proj_desc} {' '.join(proj_techs)}")

    ranked = []

    for ind in industries:
        ind_id = str(ind.get('id') or ind.get('_id') or '')
        ind_name = ind.get('name', 'Corporate Partner')
        ind_type = ind.get('organizationType', 'Industry')
        sector = ind.get('industrySector', '')
        
        expertise = [e.lower() for e in ind.get('expertise', [])]
        technologies = [t.lower() for t in ind.get('technologies', [])]
        
        funding = ind.get('fundingCapability') or {}
        max_grant = float(funding.get('maxGrantAmount') or 0)
        csr_budget = float(funding.get('csrBudgetAllocated') or 0)
        
        mentorship = ind.get('mentorshipCapability') or {}
        m_domains = [d.lower() for d in mentorship.get('domains', [])]
        
        impl = ind.get('implementationCapability') or {}
        trial_sites = impl.get('fieldTrialSites', [])
        pilot_locs = impl.get('pilotSupportLocations', [])
        mfg = impl.get('manufacturingCapacity', '')

        score = 0.52
        reasons = []

        # 1. Sector & Technology Overlap (up to +0.20)
        sector_tokens = tokenize(f"{sector} {' '.join(expertise)} {' '.join(technologies)}")
        overlap = proj_tokens.intersection(sector_tokens)
        
        matched_techs = [t for t in proj_techs if t in sector_tokens]
        if matched_techs:
            score += 0.15
            reasons.append(f"Technological co-development capability in {', '.join(matched_techs).upper()}.")
        elif overlap:
            score += 0.10
            sample_overlap = list(overlap)[:2]
            reasons.append(f"High synergy in {', '.join(sample_overlap).title()} domain.")
        
        if sector:
            reasons.append(f"Operating sector directly aligns with project domain: {sector}.")

        # 2. Funding / CSR Budget Match (up to +0.15)
        if max_grant >= proj_budget or csr_budget >= proj_budget:
            score += 0.15
            formatted_grant = f"₹ {int(max_grant):,}" if max_grant > 0 else "CSR Grant"
            reasons.append(f"Pledge capability up to {formatted_grant} covers estimated project requirements.")
        elif max_grant > 0:
            score += 0.08
            reasons.append(f"Available seed support up to ₹ {int(max_grant):,}.")

        # 3. Required Resources Match (up to +0.08)
        proj_resources = [r.lower() for r in project_data.get('required_resources', [])]
        ind_resources = [r.lower() for r in ind.get('resources', [])]
        matched_resources = [r for r in proj_resources if any(r in ir for ir in ind_resources) or r in ' '.join(ind_resources)]
        if matched_resources:
            score += 0.08
            reasons.append(f"Required co-development resources available: {', '.join(matched_resources).title()}.")
        elif ind_resources:
            reasons.append(f"Corporate resources available: {', '.join([r.title() for r in ind_resources[:2]])}.")

        # 4. Mentorship & Advisory Capability (up to +0.08)
        matched_mentors = [d for d in m_domains if d in proj_tokens or any(d in t for t in proj_techs)]
        if matched_mentors:
            score += 0.08
            reasons.append(f"Senior corporate mentorship available in {matched_mentors[0].title()}.")
        elif mentorship.get('availableMentorsCount', 0) > 0:
            score += 0.04
            reasons.append(f"Industry mentorship cohort ready ({mentorship.get('availableMentorsCount')} mentors).")

        # 4. Field Trial & Pilot Deployment Support (up to +0.08)
        if trial_sites or pilot_locs:
            score += 0.08
            site_desc = trial_sites[0] if trial_sites else pilot_locs[0]
            reasons.append(f"Field trial infrastructure available: {site_desc}.")
        if mfg:
            score += 0.04
            reasons.append(f"Prototyping & testing capability: {mfg}.")

        final_score = min(0.95, max(0.62, round(score, 2)))
        percentage = int(round(final_score * 100))

        if not reasons:
            reasons.append("Registered GNCTD industry innovation and pilot collaboration partner.")

        ranked.append({
            "industryId": ind_id,
            "organizationName": ind_name,
            "organizationType": ind_type,
            "industrySector": sector,
            "score": final_score,
            "percentage": percentage,
            "matchingReasons": reasons,
            "explainableSummary": "Recommended based on technical capability, CSR alignment and pilot testing infrastructure."
        })

    ranked.sort(key=lambda x: x['score'], reverse=True)
    return ranked
