import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

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
    is_historical?: boolean;
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
                const history = result.history || [];
                const forecasts = result.forecasts || [];

                // Process data for two-color line
                // History points have emission_hist
                // Forecast points have emission_pred
                // The connection point (last history) needs to be start of forecast line

                const lastHistory = history.length > 0 ? history[history.length - 1] : null;

                const processedHistory = history.map((d: any) => ({
                    ...d,
                    emission_hist: d.emission,
                    emission_pred: null
                }));

                const processedForecast = forecasts.map((d: any) => ({
                    ...d,
                    emission_hist: null,
                    emission_pred: d.emission
                }));

                // Add connection point to forecast if exists
                if (lastHistory) {
                    processedForecast.unshift({
                        ...lastHistory,
                        emission_hist: null,
                        emission_pred: lastHistory.emission,
                        is_connection: true // Flag to potentially hide dot
                    });
                }

                setData([...processedHistory, ...processedForecast]);
            }
        } catch (e) {
            console.error("Forecast error:", e);
        } finally {
            setLoading(false);
        }
    };

    const getTicks = () => {
        if (data.length === 0) return [];
        const emissions = data.map(d => d.emission);
        const min = Math.floor(Math.min(...emissions) / 10) * 10;
        const max = Math.ceil(Math.max(...emissions) / 10) * 10;

        const ticks = [];
        for (let i = min; i <= max; i += 10) {
            ticks.push(i);
        }
        return ticks;
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg mt-6 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-blue-400 font-medium animate-pulse">Loading Forecast...</div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Emission Forecast (AI Prediction)
                </h3>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-slate-800 text-white text-sm border border-slate-600 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value={30}>Next 30 Days</option>
                    <option value={60}>Next 60 Days</option>
                    <option value={90}>Next 90 Days</option>
                </select>
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
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            domain={['auto', 'auto']}
                            ticks={getTicks()}
                            interval={0}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="emission_hist"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            name="Historical CO₂"
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="emission_pred"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={(props: any) => {
                                if (props.payload.is_connection) return <></>;
                                if (props.payload.emission_pred === null || props.payload.emission_pred === undefined) return <></>;
                                return <circle cx={props.cx} cy={props.cy} r={4} stroke={props.stroke} strokeWidth={2} fill="#fff" />
                            }}
                            activeDot={{ r: 6 }}
                            name="Predicted CO₂"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 text-center">
                {data.length > 0 && Object.keys(data[0].sectors).map((sector) => (
                    <div key={sector} className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase">{sector.replace('_', ' ')}</div>
                        <div className="text-sm font-bold text-slate-300">
                            {Math.round(data[data.length - 1].sectors[sector as keyof ForecastData['sectors']])} kt
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
