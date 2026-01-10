import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
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
import { Calendar, Wind } from 'lucide-react';

interface AQIData {
    date: string;
    aqi_hist?: number | null;
    aqi_forecast?: number | null;
}

export function AQITrends() {
    const [data, setData] = useState<AQIData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [histRes, fcRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/aqi/history`),
                fetch(`${API_BASE_URL}/api/aqi/forecast`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ days: 180 }) // 6 months forecast
                })
            ]);

            const histData = await histRes.json();
            const fcData = await fcRes.json();

            if (histData.status === 'success') {
                const fullHistory = histData.data.map((d: any) => ({
                    date: d.date,
                    aqi_hist: d.aqi,
                    aqi_forecast: null
                }));

                // Show only last 2 months (approx 60 days) of history as requested
                const history = fullHistory.slice(-60);

                let combined = [...history];

                if (fcData.status === 'success' && fcData.data.forecast) {
                    const forecast = fcData.data.forecast.map((d: any) => ({
                        date: d.date,
                        aqi_hist: null,
                        aqi_forecast: d.aqi
                    }));

                    // Connect the lines: use last historical point as first forecast point if possible
                    if (history.length > 0) {
                        const last = history[history.length - 1];
                        // Add a connection point to forecast array
                        forecast.unshift({
                            date: last.date,
                            aqi_hist: null,
                            aqi_forecast: last.aqi_hist
                        });
                    }

                    combined = [...history, ...forecast];
                }

                setData(combined);
            }
        } catch (e) {
            console.error("AQI Data error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg mt-6 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-blue-400 font-medium animate-pulse">Computing Forecast...</div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wind className="w-5 h-5 text-blue-400" /> AQI Trends & AI Forecast
                </h3>
                
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                            }}
                            minTickGap={30}
                        />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="aqi_hist"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 0 }}
                            activeDot={{ r: 4 }}
                            name="Historical AQI"
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="aqi_forecast"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 0 }}
                            activeDot={{ r: 4 }}
                            name="Predicted AQI"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
                Historical monthly averages
            </p>
        </div>
    );
}
