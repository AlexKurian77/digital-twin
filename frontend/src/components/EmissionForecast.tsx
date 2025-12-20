import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ForecastData {
  date: string;
  emission: number;
  sectors: {
    Aviation: number;
    Ground_Transport: number;
    Industry: number;
    Power: number;
    Residential: number;
  };
}

export function EmissionForecast() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchForecast(days);
  }, [days]);

  const fetchForecast = async (nDays: number) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/emission/forecast/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: nDays })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.forecasts);
      }
    } catch (e) {
      console.error("Forecast error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) return <div className="text-slate-400 p-4">Loading Forecast...</div>;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> Emission Forecast (AI Prediction)
        </h3>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-slate-800 text-white text-sm border border-slate-600 rounded px-2 py-1"
        >
          <option value={7}>Next 7 Days</option>
          <option value={30}>Next 30 Days</option>
          <option value={90}>Next 3 Months</option>
        </select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              tickFormatter={(str) => {
                const date = new Date(str);
                return `${date.getDate()}/${date.getMonth()+1}`;
              }}
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="emission" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorEmission)" 
              name="Total CO₂ (kt)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 text-center">
         {data.length > 0 && Object.keys(data[0].sectors).map((sector) => (
             <div key={sector} className="bg-slate-950 p-2 rounded border border-slate-800">
                 <div className="text-xs text-slate-500 uppercase">{sector.replace('_', ' ')}</div>
                 <div className="text-sm font-bold text-slate-300">
                    {Math.round(data[data.length-1].sectors[sector as keyof ForecastData['sectors']])} kt
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
}
