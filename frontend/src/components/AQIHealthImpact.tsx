"use client";

import { useState } from "react";
import { aqiCategories, type AQICategory } from "../data/aqiHealthData";

function AQISelector({
  categories,
  selected,
  onSelect,
}: {
  categories: AQICategory[];
  selected: AQICategory;
  onSelect: (category: AQICategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => {
        const isSelected = selected.id === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${
              isSelected
                ? "scale-105 shadow-xl ring-2 ring-white/30"
                : "hover:scale-102 hover:shadow-lg opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: isSelected ? category.color : `${category.color}33`,
              borderColor: category.color,
              color: isSelected ? "white" : category.color,
            }}
          >
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
  const icons: Record<string, string> = {
    "Newborns & Children": "👶",
    "Children": "🧒",
    "Infants": "👶",
    "Infants & Children": "👶",
    "Pregnant Women": "🤰",
    "Elderly": "👴",
    "Pre-existing Conditions": "🏥",
    "General Population": "👥",
  };

  return (
    <div
      className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all duration-300"
      style={{ borderLeftColor: accentColor, borderLeftWidth: "4px" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icons[group] || "👤"}</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
                  <span>⚠️</span>
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
            <span className="text-2xl">🫁</span>
            <h3 className="text-xl font-bold text-white">Physiological Impact</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            {selectedCategory.physiologicalImpact}
          </p>
        </div>

        {/* Vulnerable Groups Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">👥</span>
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
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛡️</span>
            <h3 className="text-xl font-bold text-white">Recommended Safeguards</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedCategory.safeguards.map((safeguard, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-3"
              >
                <span className="text-blue-400">✓</span>
                <span className="text-slate-300">{safeguard}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
