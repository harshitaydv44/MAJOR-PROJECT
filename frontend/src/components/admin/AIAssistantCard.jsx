import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Copy,
  TrendingUp,
  HelpCircle,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';

const AIAssistantCard = ({ challenge, onAnalyze, onOverridePriority, onOverrideCategory }) => {
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await onAnalyze();
    } finally {
      setAnalyzing(false);
    }
  };

  const {
    aiClassification = {},
    aiPriority = {},
    aiDuplicateScore = 0,
    aiDuplicates = [],
    aiSummary = {}
  } = challenge || {};

  const hasAI = Boolean(
    aiClassification?.category ||
    aiPriority?.recommendedPriority ||
    aiSummary?.problem
  );

  return (
    <Card accent="gold" className="border-amber-300 bg-amber-50/20">
      <div className="space-y-4 font-serif">
        {/* Header with AI Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xs bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gov-navy text-sm">
                  AI Problem Intelligence Recommendations
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-xs font-mono font-bold">
                  NLP-v1.0
                </span>
              </div>
              <p className="text-[11px] text-gov-text-muted">
                Probabilistic guidance based on Delhi NLP models. Administrator discretion takes precedence.
              </p>
            </div>
          </div>

          <Button
            variant="subtle"
            size="sm"
            onClick={handleRunAnalysis}
            disabled={analyzing}
            icon={RefreshCw}
            className="text-xs text-amber-900 hover:bg-amber-100 border border-amber-300"
          >
            {analyzing ? 'Analyzing with AI...' : 'Re-run AI Analysis'}
          </Button>
        </div>

        {!hasAI ? (
          <div className="py-6 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto opacity-70 animate-pulse" />
            <p className="text-xs text-gov-navy font-medium">
              No AI evaluation records attached to this submission.
            </p>
            <p className="text-[11px] text-gov-text-muted max-w-md mx-auto">
              Execute neural classification and semantic duplicate detection to evaluate civic category, priority, and structured summaries.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              icon={Sparkles}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {analyzing ? 'Evaluating Models...' : 'Execute AI Analysis'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* 1. Category & Priority Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Category Recommendation */}
              <div className="p-3 bg-white rounded-xs border border-gov-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gov-navy uppercase tracking-wider">
                    AI Category Recommendation
                  </span>
                  {aiClassification.confidence ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                        aiClassification.confidence >= 0.70
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {(aiClassification.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-base font-bold text-gov-navy">
                    {aiClassification.category || 'Unclassified'}
                  </span>
                  {aiClassification.subcategory && (
                    <span className="text-[11px] text-gov-text-muted">
                      ({aiClassification.subcategory.replace(/_/g, ' ')})
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gov-text-secondary leading-snug">
                  {aiClassification.explanation || 'Semantic domain similarity evaluated.'}
                </p>

                {aiClassification.requiresHumanReview && (
                  <div className="flex items-center text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-xs border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600 flex-shrink-0" />
                    <span>Low confidence: Committee human verification recommended.</span>
                  </div>
                )}
              </div>

              {/* Priority Recommendation */}
              <div className="p-3 bg-white rounded-xs border border-gov-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gov-navy uppercase tracking-wider">
                    AI Priority Recommendation
                  </span>
                  <Badge variant="gold">Non-Binding</Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-xs font-bold text-xs uppercase ${
                      aiPriority.recommendedPriority === 'CRITICAL'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : aiPriority.recommendedPriority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-stone-100 text-stone-800 border border-stone-300'
                    }`}
                  >
                    Recommended: {aiPriority.recommendedPriority || 'MEDIUM'}
                  </span>
                  <span className="text-[11px] text-gov-text-muted">
                    vs Assigned: <strong className="uppercase">{challenge.priority || 'medium'}</strong>
                  </span>
                </div>

                <p className="text-[11px] text-gov-text-secondary leading-snug">
                  {aiPriority.reasoning || 'Evaluated keyword severity and municipal population impact.'}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-gov-text-muted italic">
                    Admin remains responsible for final priority rating.
                  </span>
                  {onOverridePriority && (
                    <button
                      type="button"
                      onClick={onOverridePriority}
                      className="text-gov-maroon font-bold hover:underline"
                    >
                      Override Rating &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Structured AI Summary */}
            {aiSummary?.problem && (
              <div className="p-3 bg-white rounded-xs border border-gov-border space-y-2">
                <div className="font-bold text-gov-navy text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-gov-border pb-1">
                  <span>Structured Problem Summary (AI Extracted)</span>
                  <span className="text-[10px] text-gray-400 font-normal">NLP Parsing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-gov-navy uppercase block">
                      Core Problem
                    </span>
                    <span className="text-gov-text-secondary leading-snug">{aiSummary.problem}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gov-navy uppercase block">
                      Target Affected Group
                    </span>
                    <span className="text-gov-text-secondary leading-snug">
                      {aiSummary.affectedGroup}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gov-navy uppercase block">
                      Verified Location
                    </span>
                    <span className="text-gov-text-secondary leading-snug">
                      {aiSummary.location}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gov-navy uppercase block">
                      Expected Intervention Outcome
                    </span>
                    <span className="text-gov-text-secondary leading-snug">
                      {aiSummary.expectedOutcome}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Possible Duplicate Detections */}
            <div className="p-3 bg-white rounded-xs border border-gov-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-1.5">
                  <Copy className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Semantic Duplicate Detection (Sentence Transformers)</span>
                </span>
                <span className="text-[10px] text-gov-text-muted">
                  Max Similarity:{' '}
                  <strong>{((aiDuplicateScore || 0) * 100).toFixed(0)}%</strong>
                </span>
              </div>

              {aiDuplicates && aiDuplicates.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {aiDuplicates.map((dup, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-gov-sand-50 rounded-xs border border-gov-border flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-3">
                        <span className="font-mono font-bold text-gov-maroon mr-2">
                          {dup.code}
                        </span>
                        <span className="font-medium text-gov-navy">{dup.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                            dup.similarityScore >= 0.70
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {(dup.similarityScore * 100).toFixed(0)}% match
                        </span>
                        <a
                          href={`/admin/challenges/${dup.challengeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gov-maroon hover:underline flex items-center text-[10px]"
                        >
                          <span>Compare</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-gov-text-muted italic py-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>
                    No semantic duplicates found above similarity threshold (0.70). This appears to be a unique challenge statement.
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Disclaimer Banner */}
            <div className="p-2 bg-amber-100/60 rounded-xs border border-amber-200 text-[10px] text-amber-900 flex items-start space-x-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Administrative Safeguard:</strong> GNCTD policy strictly mandates that high-impact municipal decisions (such as rejection, validation, priority classification, or university grants) must not be made autonomously by machine learning models.
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIAssistantCard;
