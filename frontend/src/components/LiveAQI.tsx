import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { HealthImpact } from './HealthImpact';
import { CloudFog, RefreshCcw } from 'lucide-react';

interface AQIData {
  aqi: number;  // 0-500 scale from Ambee
  aqi_category: string;
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  city?: string;
  source?: string;
}

export function LiveAQI({ onAqiUpdate }: { onAqiUpdate?: (aqi: number) => void }) {
  const [aqi, setAqi] = useState<AQIData | null>(null);



  const fetchAQI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/aqi?lat=28.7041&lon=77.1025`);
      if (!response.ok) {
        console.error(`API error: ${response.status}. Using mock data for development.`);
        // Fallback mock data for development
        const mockData = {
          aqi: 50,
          aqi_category: 'Good',
          pm2_5: 12.5,
          pm10: 25.0,
          o3: 45.2,
          no2: 28.5,
          so2: 8.1,
          co: 0.5
        };
        setAqi(mockData);
        if (onAqiUpdate) onAqiUpdate(mockData.aqi);
        return;
      }
      const data = await response.json();
      setAqi(data);
      if (onAqiUpdate) onAqiUpdate(data.aqi);
    } catch (error) {
      console.error('Failed to fetch AQI data:', error);
      console.log('Backend not running? Make sure to run: cd backend && python app.py');
      // Fallback mock data for development
      const mockData = {
        aqi: 50,
        aqi_category: 'Good',
        pm2_5: 12.5,
        pm10: 25.0,
        o3: 45.2,
        no2: 28.5,
        so2: 8.1,
        co: 0.5
      };
      setAqi(mockData);
      if (onAqiUpdate) onAqiUpdate(mockData.aqi);
    }
  };

  useEffect(() => {
    const initializeAQI = async () => {
      await fetchAQI();
    };

    initializeAQI();
    const interval = setInterval(fetchAQI, 600000); // Refresh every 10 min
    return () => {
      clearInterval(interval);
    };
  }, []);

  const getAQIColor = (aqi: number) => {
    // Standard AQI Scale (India/global mix adaptation)
    if (aqi <= 50) return '#22c55e';      // Good
    if (aqi <= 100) return '#eab308';     // Satisfactory
    if (aqi <= 200) return '#f97316';     // Moderate
    if (aqi <= 300) return '#ef4444';     // Poor
    if (aqi <= 400) return '#a855f7';     // Very Poor
    return '#991b1b';                     // Severe
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  };

  if (!aqi) return <div className="text-slate-400">Loading AQI...</div>;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CloudFog className="w-5 h-5" />
          Live AQI
        </h3>
        <button
          onClick={fetchAQI}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white flex items-center gap-1"
        >
          <RefreshCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Main AQI Index */}
      <div
        className="rounded-lg p-4 mb-4 text-white"
        style={{ backgroundColor: getAQIColor(aqi.aqi) }}
      >
        <div className="text-3xl font-bold">{getAQILabel(aqi.aqi)}</div>
        <div className="text-sm opacity-90">AQI: {Math.round(aqi.aqi)}/500</div>
      </div>

      {/* Pollutants Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-950 p-2 rounded">
          <div className="text-slate-400">PM2.5</div>
          <div className="text-white font-bold">{aqi.pm2_5.toFixed(1)}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded">
          <div className="text-slate-400">PM10</div>
          <div className="text-white font-bold">{aqi.pm10.toFixed(1)}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded">
          <div className="text-slate-400">NO₂</div>
          <div className="text-white font-bold">{aqi.no2.toFixed(1)}</div>
        </div>
        <div className="bg-slate-950 p-2 rounded">
          <div className="text-slate-400">O₃</div>
          <div className="text-white font-bold">{aqi.o3.toFixed(1)}</div>
        </div>
      </div>

      {/* AI Health Analysis */}
      <HealthImpact aqiData={aqi} />
    </div>
  );
}