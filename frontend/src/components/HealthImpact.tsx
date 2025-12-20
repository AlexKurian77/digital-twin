import React, { useEffect, useState } from 'react';
import { HealthChat } from './HealthChat';

interface HealthImpactData {
  aqi_level: number;
  category: string;
  risk_summary: string;
  age_specific_impacts: {
    newborns: string;
    children: string;
    teenagers_young_adults: string;
    adults_36_65: string;
    elderly: string;
  };
  pregnancy_risks: string;
  pre_existing_conditions: {
    asthma: string;
    diabetes: string;
    cardiovascular: string;
  };
  immediate_actions: string[];
  long_term_risk: {
    life_expectancy_loss: string;
    chronic_conditions: string;
  };
  safeguard_protocols: string[];
  urgency_level: "Low" | "Medium" | "High" | "Critical";
}

interface HealthImpactProps {
  aqiData: any;
}

export function HealthImpact({ aqiData }: HealthImpactProps) {
  const [healthData, setHealthData] = useState<HealthImpactData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthImpact = async () => {
      if (!aqiData) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/analyze-aqi-health', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ aqi_data: aqiData }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch health analysis');
        }
        
        const data = await response.json();
        if (data.health_impact) {
            setHealthData(data.health_impact);
        } else {
             // Handle case where health_impact might be directly in root or different structure
             // Based on backend: return jsonify({'health_impact': ..., 'status': ...})
             console.error("Unexpected response format", data);
             setError("Invalid response format");
        }

      } catch (err) {
        console.error("Error fetching health impact:", err);
        setError("Could not load health impact analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthImpact();
  }, [aqiData]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg mt-4 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
         <div className="h-4 bg-slate-800 rounded w-5/6 mb-2"></div>
      </div>
    );
  }

  if (error) {
     return (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-5 shadow-lg mt-4 text-red-200 text-sm">
            {error}
        </div>
     );
  }

  if (!healthData) return null;

  const getUrgencyColor = (level: string) => {
      switch(level.toLowerCase()) {
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
          <span>🩺</span>
          Health Impact Analysis
        </h3>
        <span className={`font-bold text-sm uppercase tracking-wider ${getUrgencyColor(healthData.urgency_level)}`}>
          {healthData.urgency_level} Risk
        </span>
      </div>

      <div className="mb-6">
        <p className="text-slate-300 text-sm leading-relaxed italic border-l-4 border-blue-500 pl-3">
          "{healthData.risk_summary}"
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
              <span className="text-slate-300">{healthData.age_specific_impacts.newborns}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Children</span>
              <span className="text-slate-300">{healthData.age_specific_impacts.children}</span>
            </div>
             <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Adults</span>
              <span className="text-slate-300">{healthData.age_specific_impacts.adults_36_65}</span>
            </div>
             <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="text-blue-300">Elderly</span>
              <span className="text-slate-300">{healthData.age_specific_impacts.elderly}</span>
            </div>
          </div>
        </div>

        {/* Protection & Actions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Required Safeguards
          </h4>
          <ul className="space-y-2">
            {healthData.safeguard_protocols.map((protocol, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-400">🛡️</span>
                {protocol}
              </li>
            ))}
          </ul>
           <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Immediate Actions
          </h4>
          <ul className="space-y-2">
            {healthData.immediate_actions.map((action, idx) => (
               <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-yellow-400">⚡</span>
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
                 Life Expectancy Loss: <span className="text-white">{healthData.long_term_risk.life_expectancy_loss}</span>
               </p>
               <p className="text-slate-400 text-xs mt-1">
                   {healthData.long_term_risk.chronic_conditions}
               </p>
          </div>
           <div>
               <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                 At-Risk Groups
               </h4>
                <div className="space-y-2 mt-1">
                    <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="font-bold text-blue-400">Asthma:</span> {healthData.pre_existing_conditions.asthma}
                    </div>
                    {healthData.pregnancy_risks && healthData.pregnancy_risks.length > 5 && (
                        <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
                            <span className="font-bold text-blue-400">Pregnancy:</span> {healthData.pregnancy_risks}
                        </div>
                    )}
                    <div className="text-xs text-blue-200 bg-slate-800/50 p-2 rounded border border-slate-700">
                        <span className="font-bold text-blue-400">Conditions:</span> {healthData.pre_existing_conditions.cardiovascular} / {healthData.pre_existing_conditions.diabetes}
                    </div>
                </div>
           </div>
       </div>

       {/* Interactive Health Chat */}
       <HealthChat aqiContext={{...aqiData, risk_summary: healthData.risk_summary}} />
    </div>
  );
}
