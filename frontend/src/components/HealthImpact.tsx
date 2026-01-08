import React, { useEffect, useState } from 'react';
import { HealthChat } from './HealthChat';
import { Stethoscope, Shield, Zap, Sparkles } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

interface HealthImpactProps {
  aqiData: any;
}

export function HealthImpact({ aqiData }: HealthImpactProps) {
  const { healthAnalysis, isAnalyzing, generateHealthAnalysis } = useGlobalState();

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-lg mt-4 flex flex-col items-center justify-center text-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <Stethoscope className="absolute inset-0 m-auto text-blue-400 w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Health Impact...</h3>
        <p className="text-slate-400 max-w-md">
          Our AI is processing the current air quality data to provide personalized health recommendations.
        </p>
      </div>
    );
  }

  if (!healthAnalysis) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-lg mt-4 text-center">
        <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Health Impact Analysis</h3>
        <p className="text-slate-400 max-w-lg mx-auto mb-6">
          Generate a comprehensive AI-powered analysis of the current air quality's impact on health, including age-specific risks and immediate safeguards.
        </p>
        <button
          onClick={generateHealthAnalysis}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-cyan-500/20"
        >
          <Sparkles className="w-5 h-5" />
          Generate AI Analysis
        </button>
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-500 animate-pulse';
      default: return 'text-slate-200';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg mt-4">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          Health Impact Analysis
        </h3>
        <span className={`font-bold text-sm uppercase tracking-wider ${getUrgencyColor(healthAnalysis.urgency_level)}`}>
          {healthAnalysis.urgency_level} Risk
        </span>
      </div>

      <div className="mb-6">
        <p className="text-slate-300 text-sm leading-relaxed italic border-l-4 border-blue-500 pl-3">
          "{healthAnalysis.risk_summary}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Age Specific Risks */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Age-Specific Vulnerability
          </h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Newborns</span>
              <span className="text-slate-300">{healthAnalysis.age_specific_impacts.newborns}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Children</span>
              <span className="text-slate-300">{healthAnalysis.age_specific_impacts.children}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Adults</span>
              <span className="text-slate-300">{healthAnalysis.age_specific_impacts.adults_36_65}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Elderly</span>
              <span className="text-slate-300">{healthAnalysis.age_specific_impacts.elderly}</span>
            </div>
          </div>
        </div>

        {/* Protection & Actions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Required Safeguards
          </h4>
          <ul className="space-y-2">
            {healthAnalysis.safeguard_protocols.map((protocol, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <Shield className="w-4 h-4 text-green-400" />
                {protocol}
              </li>
            ))}
          </ul>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Immediate Actions
          </h4>
          <ul className="space-y-2">
            {healthAnalysis.immediate_actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Long Term & Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Long Term Impact
          </h4>
          <p className="text-red-400 font-bold text-sm">
            Life Expectancy Loss: <span className="text-white">{healthAnalysis.long_term_risk.life_expectancy_loss}</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {healthAnalysis.long_term_risk.chronic_conditions}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            At-Risk Groups
          </h4>
          <div className="space-y-2 mt-1">
            <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
              <span className="font-bold text-blue-400">Asthma:</span> {healthAnalysis.pre_existing_conditions.asthma}
            </div>
            {healthAnalysis.pregnancy_risks && healthAnalysis.pregnancy_risks.length > 5 && (
              <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
                <span className="font-bold text-blue-400">Pregnancy:</span> {healthAnalysis.pregnancy_risks}
              </div>
            )}
            <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
              <span className="font-bold text-blue-400">Conditions:</span> {healthAnalysis.pre_existing_conditions.cardiovascular} / {healthAnalysis.pre_existing_conditions.diabetes}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Health Chat */}
      <HealthChat aqiContext={{ ...aqiData, risk_summary: healthAnalysis.risk_summary }} />
    </div>
  );
}
