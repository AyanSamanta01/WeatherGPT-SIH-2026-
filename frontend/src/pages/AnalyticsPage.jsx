import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_CLIMATE_TRENDS } from '../data/mockData';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Download, 
  Calendar, 
  Sparkles, 
  AlertTriangle,
  Flame,
  Droplets,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const AnalyticsPage = () => {
  const { weatherData, setActiveScreen } = useApp();

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(MOCK_CLIMATE_TRENDS, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `WeatherGPT_Climate_Trends_${weatherData.city}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Decadal Climate & Extreme Weather Trends
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              2015 – 2026 Historical Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Long-term temperature deviations, precipitation variance, and extreme convective storm frequencies for climate researchers.
          </p>
        </div>

        {/* Researcher Data Export */}
        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center space-x-2 transition shadow-lg"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Research Dataset (.JSON)</span>
        </button>
      </div>

      {/* Highlights Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Decadal Temp Rise</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">+2.1°C</div>
          <p className="text-[10px] text-slate-400">Baseline relative to 1980-2010 normal</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Extreme Event Spikes</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">4.5x</div>
          <p className="text-[10px] text-slate-400">Cyclones & Cloudburst frequency index</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Monsoon Erraticity Index</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">High (0.78)</div>
          <p className="text-[10px] text-slate-400">Higher dry-spell to deluge ratio</p>
        </div>
      </div>

      {/* Main Climate Chart: Temperature vs Extreme Events */}
      <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Annual Mean Temperature & Extreme Disaster Event Count</h2>
            <p className="text-[11px] text-slate-400">Comparative trend of rising land surface temperature against IMD recorded disaster events</p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={MOCK_CLIMATE_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} domain={[26, 31]} unit="°C" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="right" dataKey="extremeEvents" name="Extreme Weather Events" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.7} />
              <Line yAxisId="left" type="monotone" dataKey="avgTemp" name="Avg Temperature (°C)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Research Insights Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">AI Climate Resilience Assessment</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Historical training of WeatherGPT’s local XGBoost / LightGBM models demonstrates an accelerating trend in localized flash droughts followed by short-duration torrential cloudbursts. Crop zoning recommendations should pivot toward drought-tolerant short-duration cultivars.
          </p>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 flex-shrink-0 transition shadow-lg shadow-cyan-500/25"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Climate Model</span>
        </button>
      </div>

    </div>
  );
};

export default AnalyticsPage;
