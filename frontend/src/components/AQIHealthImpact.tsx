"use client";

import { useState } from "react";
import { aqiCategories, type AQICategory } from "../data/aqiHealthData";
import {
  Baby,
  Smile,
  Users,
  PersonStanding,
  User,
  Hospital,
  AlertTriangle,
  Activity,
  Shield,
  Check
} from "lucide-react";
import { LiveAQI } from "./LiveAQI";

function AQISelector({
  categories,
  selected,
  onSelect,
  currentAQI
}: {
  categories: AQICategory[];
  selected: AQICategory;
  onSelect: (category: AQICategory) => void;
  currentAQI: number | null;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => {
        const isSelected = selected.id === category.id;

        // Parsing ranges like "0-50", "401-500+"
        const rangeParts = category.range.split('-');
        const min = parseInt(rangeParts[0]);
        const max = rangeParts[1].includes('+') ? Infinity : parseInt(rangeParts[1]);

        const isCurrent = currentAQI !== null && currentAQI >= min && currentAQI <= max;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`relative px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${isSelected
              ? "scale-105 shadow-xl ring-2 ring-white/30"
              : "hover:scale-102 hover:shadow-lg opacity-80 hover:opacity-100"
              }`}
            style={{
              backgroundColor: isSelected ? category.color : `${category.color}33`,
              borderColor: category.color,
              color: isSelected ? "white" : category.color,
            }}
          >
            {isCurrent && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900"></span>
              </span>
            )}
            <div className="text-sm font-semibold">{category.name}</div>
            <div className="text-xs opacity-80">AQI {category.range}</div>
          </button>
        );
      })}
    </div>
  );
}

function VulnerableGroupCard({
  group,
  effects,
  accentColor,
}: {
  group: string;
  effects: string[];
  accentColor: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    "Newborns & Children": <Baby className="w-6 h-6" />,
    "Children": <Smile className="w-6 h-6" />,
    "Infants": <Baby className="w-6 h-6" />,
    "Infants & Children": <Baby className="w-6 h-6" />,
    "Pregnant Women": <PersonStanding className="w-6 h-6" />,
    "Elderly": <User className="w-6 h-6" />,
    "Pre-existing Conditions": <Hospital className="w-6 h-6" />,
    "General Population": <Users className="w-6 h-6" />,
  };

  return (
    <div
      className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
      style={{ borderLeftColor: accentColor, borderLeftWidth: "4px" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icons[group] || <User className="w-6 h-6" />}</span>
        <h4 className="font-bold text-white">{group}</h4>
      </div>
      <ul className="space-y-2">
        {effects.map((effect, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-slate-500 mt-1">•</span>
            <span>{effect}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AQIHealthImpact() {
  const [selectedCategory, setSelectedCategory] = useState<AQICategory>(
    aqiCategories[0]
  );
  const [currentAqiValue, setCurrentAqiValue] = useState<number | null>(null);

  const handleAqiUpdate = (aqi: number) => {
    setCurrentAqiValue(aqi);

    // Find category that matches the AQI range
    // Mappings: 0-50, 51-100, 101-200, 201-300, 301-400, 401+
    const categoryId =
      aqi <= 50 ? "good" :
        aqi <= 100 ? "satisfactory" :
          aqi <= 200 ? "moderate" :
            aqi <= 300 ? "poor" :
              aqi <= 400 ? "very-poor" :
                "severe";

    const matchedCategory = aqiCategories.find(c => c.id === categoryId);
    if (matchedCategory && matchedCategory.id !== selectedCategory.id) {
      setSelectedCategory(matchedCategory);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">

      {/* Fixed Live AQI Indicator */}
      {currentAqiValue !== null && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style={{backgroundColor: currentAqiValue <= 100 ? "#22c55e" : "#ef4444"}}></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" style={{backgroundColor: currentAqiValue <= 100 ? "#22c55e" : "#ef4444"}}></span>
          </div>
          <div className="text-sm font-bold text-white">
            <span className="opacity-70 mr-2">Live AQI:</span>
            {Math.round(currentAqiValue)}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div
        className={`bg-gradient-to-br ${selectedCategory.bgColor} border-b ${selectedCategory.borderColor} transition-all duration-500`}
      >
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              AQI Health Impact Guide
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Select an AQI level to understand its health implications for different population groups
            </p>
          </div>

          {/* AQI Selector */}
          <AQISelector
            categories={aqiCategories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            currentAQI={currentAqiValue}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Category Header */}
        <div
          className={`bg-gradient-to-br ${selectedCategory.bgColor} border ${selectedCategory.borderColor} rounded-2xl p-6 mb-8 transition-all duration-500`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <h3 className="text-2xl font-bold text-white">
                  {selectedCategory.name}
                </h3>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${selectedCategory.color}33`,
                    color: selectedCategory.color,
                  }}
                >
                  AQI {selectedCategory.range}
                </span>
              </div>
              <p className="text-slate-400">
                PM2.5 Concentration: <span className="text-white font-semibold">{selectedCategory.pm25Range}</span>
              </p>
            </div>
            {selectedCategory.lifeExpectancyImpact && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 max-w-md">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Life Expectancy Impact</span>
                </div>
                <p className="text-red-300 text-sm">{selectedCategory.lifeExpectancyImpact}</p>
              </div>
            )}
          </div>
        </div>

        {/* Physiological Impact */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Physiological Impact</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            {selectedCategory.physiologicalImpact}
          </p>
        </div>

        {/* Vulnerable Groups Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Vulnerable Groups</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCategory.vulnerableGroups.map((vg, idx) => (
              <VulnerableGroupCard
                key={idx}
                group={vg.group}
                effects={vg.effects}
                accentColor={selectedCategory.color}
              />
            ))}
          </div>
        </div>

        {/* Safeguards */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-2xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Recommended Safeguards</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedCategory.safeguards.map((safeguard, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-3"
              >
                <Check className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">{safeguard}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Data Section (Moved to Bottom) */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-slate-400 mb-4">Live Data Source</h3>
          <LiveAQI onAqiUpdate={handleAqiUpdate} />
        </div>
      </div>
    </div>
  );
}
