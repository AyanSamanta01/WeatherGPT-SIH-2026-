import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_CLIMATE_TRENDS } from '../data/mockData';
import { 
  TrendingUp, 
  Download, 
  Sparkles, 
  Flame,
  Droplets,
  ArrowRight,
  Brain
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-2xl text-xs space-y-2"
        style={{
          background: 'rgba(5, 12, 28, 0.98)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div className="font-bold text-white text-sm">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-bold text-white">{p.value}{p.name?.includes('Temp') ? '°C' : ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ label, value, icon: Icon, color, sub }) => (
  <div
    className="rounded-3xl p-6 space-y-2 cursor-default transition-all duration-200"
    style={{
      background: 'rgba(5, 12, 28, 0.95)',
      border: `1px solid ${color}15`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${color}06`
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}15`; e.currentTarget.style.transform = ''; }}
  >
    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
      <span>{label}</span>
      <div
        className="p-1.5 rounded-lg"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <div className="text-2xl font-black" style={{ color: '#fff' }}>{value}</div>
    <p className="text-[10px] text-slate-500">{sub}</p>
  </div>
);

const AnalyticsPage = () => {
  const { weatherData, setActiveScreen } = useApp();

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(MOCK_CLIMATE_TRENDS, null, 2)
    )}`;
    const a = document.createElement('a');
    a.href = jsonString;
    a.download = `WeatherGPT_Climate_Trends_${weatherData.city}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              Climate Trend Analytics
            </h1>
            <span className="badge-info">2015–2026</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Decadal temperature deviations, precipitation variance, and extreme event frequencies
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="btn-ghost flex items-center space-x-2 flex-shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Dataset (.JSON)</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Decadal Temperature Rise"
          value="+2.1°C"
          icon={TrendingUp}
          color="#ef4444"
          sub="Relative to 1980–2010 normal baseline"
        />
        <MetricCard
          label="Extreme Event Frequency"
          value="4.5×"
          icon={Flame}
          color="#f59e0b"
          sub="Cyclones & cloudburst frequency index 2015→2026"
        />
        <MetricCard
          label="Monsoon Erraticity Index"
          value="High (0.78)"
          icon={Droplets}
          color="#06b6d4"
          sub="Higher dry-spell to deluge ratio across river basins"
        />
      </div>

      {/* Main Chart */}
      <div
        className="rounded-3xl p-6 space-y-4"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Annual Mean Temperature & Extreme Disaster Event Count</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rising land surface temperature correlated with IMD recorded disaster events
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm" style={{ background: '#f59e0b' }} />
              <span className="text-slate-400">Extreme Events</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-0.5 rounded" style={{ background: '#06b6d4' }} />
              <span className="text-slate-400">Avg Temp (°C)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={MOCK_CLIMATE_TRENDS} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.5)" />
              <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="left" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} domain={[26, 31]} unit="°C" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10, fill: '#78716c' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#64748b' }}
                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
              <Bar yAxisId="right" dataKey="extremeEvents" name="Extreme Weather Events" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line yAxisId="left" type="monotone" dataKey="avgTemp" name="Avg Temperature (°C)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3.5, fill: '#06b6d4', stroke: '#040a18', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Climate Insights */}
      <div
        className="rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, rgba(3, 20, 40, 0.95) 0%, rgba(5, 12, 28, 0.97) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(6, 182, 212, 0.04)'
        }}
      >
        <div className="flex items-start space-x-4">
          <div
            className="p-3 rounded-2xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          >
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">AI Climate Resilience Assessment</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
              Historical training of WeatherGPT's local XGBoost / LightGBM models demonstrates an accelerating trend in 
              localized flash droughts followed by short-duration torrential cloudbursts. Crop zoning recommendations 
              should pivot toward <span className="text-cyan-400 font-semibold">drought-tolerant short-duration cultivars</span> aligned with GFS ensemble consensus.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-black text-white flex-shrink-0 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(6, 182, 212, 0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.35)'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interrogate Climate Model</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnalyticsPage;
