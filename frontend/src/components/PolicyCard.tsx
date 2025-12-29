"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, BookOpen, RefreshCw, Library, Users, AlertTriangle, Link, Loader2 } from "lucide-react";

interface PolicyMutation {
  type: string;
  node_id?: string;
  source?: string;
  target?: string;
  new_weight?: number;
  reason: string;
}

interface Policy {
  policy_id: string;
  name: string;
  description?: string;
  mutations: PolicyMutation[];
  estimated_impacts: {
    co2_reduction_pct: number;
    aqi_improvement_pct: number;
    confidence: number;
  };
  trade_offs: Array<{
    sector: string;
    impact: string;
    magnitude: string;
    description: string;
  }>;
  source_research: {
    paper_ids: string[];
    key_quotes: string[];
    confidence: number;
  };
}

interface Explanation {
  policy_id: string;
  policy_name: string;
  narrative_intro: string;
  mutations: Array<{
    mutation: {
      type: string;
      target: string;
      reason: string;
    };
    narrative: string;
    supporting_research: string[];
    affected_stakeholders: Array<{
      group: string;
      impact: string;
    }>;
  }>;
  overall_narrative: string;
}

interface PolicyCardProps {
  policy: Policy;
  researchEvidence?: string[];
}

export function PolicyCard({ policy, researchEvidence = [] }: PolicyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const loadExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const response = await fetch("http://localhost:5000/api/explain-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy,
          research_evidence: researchEvidence,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanation(data.explanation);
      }
    } catch (error) {
      console.error("Error loading explanation:", error);
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Load explanation when card is expanded
  useEffect(() => {
    if (expanded && !explanation && !loadingExplanation) {
      loadExplanation();
    }
  }, [expanded, explanation, loadingExplanation, loadExplanation]);

  return (
    <div
      className={`rounded-lg border-l-4 border-blue-500 p-4 mb-4 transition-all ${expanded ? "bg-white shadow-lg" : "bg-gradient-to-r from-blue-50 to-emerald-50"
        }`}
    >
      {/* Header / Collapsed View */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{policy.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {policy.description}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-2xl ml-4 text-gray-500 hover:text-gray-700"
        >
          {expanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
      </div>

      {/* Quick Impact Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div
          className={`p-2 rounded ${policy.estimated_impacts.co2_reduction_pct > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          <div className="font-semibold">
            {policy.estimated_impacts.co2_reduction_pct.toFixed(1)}% CO₂
          </div>
          <div className="text-xs">reduction expected</div>
        </div>
        <div
          className={`p-2 rounded ${policy.estimated_impacts.aqi_improvement_pct > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          <div className="font-semibold">
            {policy.estimated_impacts.aqi_improvement_pct.toFixed(1)}% AQI
          </div>
          <div className="text-xs">improvement expected</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Explanation Intro */}
          {explanation && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Overview
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation.narrative_intro}
              </p>
            </div>
          )}

          {/* Per-Mutation Explanations */}
          {explanation && explanation.mutations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Policy Actions
              </h4>
              <div className="space-y-3">
                {explanation.mutations.map((mut, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded border-l-4 border-purple-400"
                  >
                    {/* Mutation Type Badge */}
                    <div className="font-mono text-xs bg-purple-100 text-purple-700 p-1 rounded mb-2 inline-block">
                      {mut.mutation.type}
                    </div>

                    {/* Target */}
                    <div className="text-xs text-gray-500 mb-2">
                      Target: <strong>{mut.mutation.target}</strong>
                    </div>

                    {/* Narrative */}
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                      {mut.narrative}
                    </p>

                    {/* Supporting Research */}
                    {mut.supporting_research.length > 0 && (
                      <div className="bg-yellow-50 p-2 rounded text-xs border-l-2 border-yellow-300 mb-2">
                        <strong className="flex items-center gap-1">
                          <Library className="w-3 h-3" /> Research Backing:
                        </strong>
                        <p className="mt-1 italic text-gray-700">
                          "{mut.supporting_research[0].substring(0, 120)}..."
                        </p>
                      </div>
                    )}

                    {/* Stakeholders */}
                    {mut.affected_stakeholders.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> Affects:
                        </strong>
                        <ul className="mt-1 space-y-1">
                          {mut.affected_stakeholders.slice(0, 3).map(
                            (stakeholder, sidx) => (
                              <li key={sidx} className="ml-4">
                                • {stakeholder.group}:{" "}
                                <span className="text-gray-700">
                                  {stakeholder.impact}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade-offs */}
          {policy.trade_offs.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Trade-offs
              </h4>
              <ul className="text-sm space-y-2">
                {policy.trade_offs.map((tradeoff, idx) => (
                  <li
                    key={idx}
                    className="p-2 bg-orange-50 rounded text-gray-700 border-l-2 border-orange-400"
                  >
                    <strong>{tradeoff.sector}</strong>
                    <span
                      className={`ml-2 text-xs font-semibold ${tradeoff.impact === "negative"
                          ? "text-red-600"
                          : "text-green-600"
                        }`}
                    >
                      ({tradeoff.impact})
                    </span>
                    <p className="mt-1 text-xs">{tradeoff.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Research Evidence */}
          {policy.source_research.key_quotes.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Link className="w-4 h-4" /> Research Evidence
              </h4>
              <div className="space-y-2">
                {policy.source_research.key_quotes.slice(0, 2).map(
                  (quote, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-50 p-2 rounded border-l-2 border-blue-400 text-xs text-gray-700"
                    >
                      <p className="italic">"{quote}"</p>
                    </div>
                  )
                )}
              </div>
              {policy.source_research.key_quotes.length > 2 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{policy.source_research.key_quotes.length - 2} more quotes
                </p>
              )}
            </div>
          )}

          {/* Confidence & Sources */}
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div>
              <strong>Confidence Level:</strong>{" "}
              {(policy.source_research.confidence * 100).toFixed(0)}%
            </div>
            {policy.source_research.paper_ids.length > 0 && (
              <div>
                <strong>Sources:</strong> {policy.source_research.paper_ids.join(", ")}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loadingExplanation && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading detailed explanations...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
