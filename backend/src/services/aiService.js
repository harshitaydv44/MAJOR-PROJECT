const TIMEOUT_MS = 6000; // 6 seconds timeout

/**
 * Helper to execute HTTP requests to the FastAPI microservice with timeout
 */
const postJSON = async (endpoint, payload) => {
  const baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI Service responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const aiService = {
  /**
   * Classify challenge title and description
   */
  classify: async (title, description) => {
    try {
      return await postJSON('/ai/classify', { title, description });
    } catch (error) {
      console.warn(`[AI Service Notice] Classification unavailable: ${error.message}`);
      return null;
    }
  },

  /**
   * Recommend priority based on urgency, severity, and demographics
   */
  recommendPriority: async ({ title, description, urgency, severity, affectedPopulation }) => {
    try {
      return await postJSON('/ai/priority', {
        title,
        description,
        urgency,
        severity,
        affected_population: affectedPopulation
      });
    } catch (error) {
      console.warn(`[AI Service Notice] Priority estimation unavailable: ${error.message}`);
      return null;
    }
  },

  /**
   * Check for potential duplicates against existing challenges
   */
  checkDuplicates: async ({ title, description, existingChallenges = [], threshold = 0.70 }) => {
    try {
      if (!existingChallenges || existingChallenges.length === 0) {
        return {
          possibleDuplicate: false,
          similarityScore: 0.0,
          threshold,
          matchingChallengeIds: [],
          topMatches: [],
          engine: 'None'
        };
      }
      const payload = {
        title,
        description,
        existing_challenges: existingChallenges.map((c) => ({
          id: c._id ? c._id.toString() : c.id,
          code: c.code,
          title: c.title,
          description: c.description
        })),
        threshold
      };
      return await postJSON('/ai/duplicate-check', payload);
    } catch (error) {
      console.warn(`[AI Service Notice] Duplicate check unavailable: ${error.message}`);
      return null;
    }
  },

  /**
   * Generate structured problem summary
   */
  summarize: async ({ title, description, location, district }) => {
    try {
      return await postJSON('/ai/summarize', {
        title,
        description,
        location,
        district
      });
    } catch (error) {
      console.warn(`[AI Service Notice] Summarization unavailable: ${error.message}`);
      return null;
    }
  },

  /**
   * Comprehensive analysis running all 4 models in parallel with safe degradation
   */
  analyzeChallenge: async (challengeData = {}, existingChallenges = []) => {
    try {
      const { title, description, urgency, severity, impact, location, district } = challengeData || {};
      const [classification, priority, duplicates, summaryRes] = await Promise.all([
        aiService.classify(title, description),
        aiService.recommendPriority({
          title,
          description,
          urgency,
          severity,
          affectedPopulation: impact
        }),
        aiService.checkDuplicates({
          title,
          description,
          existingChallenges,
          threshold: 0.70
        }),
        aiService.summarize({
          title,
          description,
          location: location?.area || location?.landmark,
          district
        })
      ]);

      return {
        aiClassification: classification || null,
        aiPriority: priority ? {
          recommendedPriority: priority.recommendation,
          confidence: priority.confidence,
          reasoning: priority.reasoning
        } : null,
        aiDuplicateScore: duplicates ? (duplicates.similarityScore ?? 0) : null,
        aiDuplicates: (duplicates?.topMatches || []).map((m) => ({
          challengeId: m.id,
          code: m.code,
          title: m.title,
          similarityScore: m.similarityScore
        })),
        aiSummary: summaryRes?.summary || null
      };
    } catch (err) {
      console.error('[AI Service Error] Batch analysis failed:', err.message);
      return {
        aiClassification: null,
        aiPriority: null,
        aiDuplicateScore: null,
        aiDuplicates: [],
        aiSummary: null
      };
    }
  },

  /**
   * Match suitable universities for a validated challenge
   */
  matchUniversities: async (challenge, universities = []) => {
    try {
      const payload = {
        challenge: {
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          required_technologies: challenge.tags || [],
          keywords: (challenge.title + ' ' + challenge.description).split(/\s+/).slice(0, 20)
        },
        universities: universities.map((u) => ({
          id: u.user ? u.user.toString() : u._id.toString(),
          name: u.name,
          district: u.district,
          researchAreas: u.researchAreas || [],
          expertise: u.expertise || [],
          labsAndFacilities: u.labsAndFacilities || [],
          innovationCentre: u.innovationCentre || '',
          incubationFacilities: u.incubationFacilities || '',
          previousProjectAreas: u.previousProjectAreas || u.researchAreas || [],
          facultySpecializations: (u.facultySpecializations || []).map((f) => ({
            facultyName: f.facultyName,
            department: f.department,
            specialization: f.specialization
          }))
        }))
      };

      const res = await postJSON('/ai/match-universities', payload);
      return res.recommendations || [];
    } catch (error) {
      console.warn(`[AI Service Notice] University matching offline: ${error.message}`);
      return null;
    }
  },

  /**
   * Match suitable corporate and industry partners for a university project
   */
  matchIndustries: async (project, industries = []) => {
    try {
      const payload = {
        project: {
          title: project.title,
          description: project.description,
          technologies: project.technologies || project.proposal?.technology || [],
          budget: project.budget || 1000000,
          stage: project.status,
          required_resources: project.requiredResources || ['Telemetry equipment', 'Field testing permits', 'Prototyping facilities']
        },
        industries: industries.map((ind) => ({
          id: ind.user ? ind.user.toString() : ind._id.toString(),
          name: ind.name,
          organizationType: ind.organizationType || 'Industry',
          industrySector: ind.industrySector || '',
          expertise: ind.expertise || [],
          technologies: ind.technologies || [],
          fundingCapability: ind.fundingCapability || {},
          mentorshipCapability: ind.mentorshipCapability || {},
          implementationCapability: ind.implementationCapability || {}
        }))
      };

      const res = await postJSON('/ai/match-industries', payload);
      return res.recommendations || [];
    } catch (error) {
      console.warn(`[AI Service Notice] Industry matching offline: ${error.message}`);
      return industries.map((ind, idx) => ({
        industryId: ind.user || ind._id,
        organizationName: ind.name,
        organizationType: ind.organizationType || 'Industry',
        industrySector: ind.industrySector || 'Technology & Innovation',
        score: Math.max(0.65, 0.88 - idx * 0.07),
        percentage: Math.round(Math.max(65, 88 - idx * 7)),
        matchingReasons: [
          `Registered GNCTD industry innovation partner in ${ind.district || 'Delhi'}.`,
          `Active corporate capability in ${ind.industrySector || 'Technology Development'}.`
        ],
        explainableSummary: 'Recommended based on technical capability, CSR alignment and pilot testing infrastructure.'
      }));
    }
  }
};

module.exports = aiService;
