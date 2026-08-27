import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  CloudRain, 
  Sun, 
  CloudLightning, 
  CloudSun, 
  Droplets, 
  Wind, 
  Sparkles,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

const CustomTooltip = ({ active, payload, label, tempUnit }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: 'rgba(5, 12, 28, 0.98)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div className="font-bold text-white mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-bold text-white">{p.value}°{tempUnit}</span>
          </div>
        ))}
        {payload[0]?.payload?.rain != null && (
          <div className="flex items-center space-x-2 mt-0.5">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Rain:</span>
            <span className="font-bold text-blue-300">{payload[0].payload.rain}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const ForecastPage = () => {
  const { weatherData, tempUnit, setActiveScreen } = useApp();

  const dailyList = weatherData.dailyForecast || [];

  const chartData = dailyList.map(item => ({
    name: item.day,
    max: tempUnit === 'F' ? Math.round((item.max * 9/5) + 32) : item.max,
    min: tempUnit === 'F' ? Math.round((item.min * 9/5) + 32) : item.min,
    rain: item.rainProb
  }));

  const getConditionIcon = (iconName) => {
    const map = {
      'cloud-lightning': <CloudLightning className="w-5 h-5 text-amber-400" />,
      'cloud-rain': <CloudRain className="w-5 h-5 text-blue-400" />,
      'cloud-drizzle': <CloudRain className="w-5 h-5 text-cyan-400" />,
      'cloud-sun': <CloudSun className="w-5 h-5 text-sky-300" />,
      'cloud': <CloudSun className="w-5 h-5 text-slate-400" />,
    };
    return map[iconName] || <Sun className="w-5 h-5 text-amber-400" />;
  };

  const getRainColor = (prob) => {
    if (prob >= 75) return '#ef4444';
    if (prob >= 50) return '#f97316';
    if (prob >= 25) return '#f59e0b';
    return '#06b6d4';
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
              7-Day NWP Forecast
            </h1>
            <span className="badge-info">WRF · GFS Ensemble</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            High-resolution synoptic forecast for{' '}
            <span className="text-white font-semibold">{weatherData.city}</span>
          </p>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="btn-ghost flex items-center space-x-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI Forecast Details</span>
        </button>
      </div>

      {/* Temperature Chart */}
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
            <h2 className="text-sm font-bold text-white">Temperature Trajectory & Precipitation Probability</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              7-day high/low thermal curve (°{tempUnit}) with rainfall probability (%)
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 rounded-full" style={{ background: '#06b6d4' }} />
              <span className="text-slate-400">Max Temp</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className="w-3 h-1.5 rounded-full"
                style={{ background: 'transparent', border: '2px dashed #3b82f6', borderTop: 'none' }}
              />
              <span className="text-slate-400">Min Temp</span>
            </div>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.5)" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip tempUnit={tempUnit} />} />
              <Area type="monotone" dataKey="max" name="Max" stroke="#06b6d4" strokeWidth={2.5} fill="url(#maxGrad)" dot={{ r: 3, fill: '#06b6d4', stroke: '#040a18', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="min" name="Min" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 4" fill="url(#minGrad)" dot={{ r: 3, fill: '#3b82f6', stroke: '#040a18', strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Day-by-Day Forecast Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dailyList.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl space-y-3 cursor-default group transition-all duration-200"
              style={{
                background: idx === 0
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(5, 12, 28, 0.95) 100%)'
                  : 'rgba(5, 12, 28, 0.9)',
                border: idx === 0
                  ? '1px solid rgba(6, 182, 212, 0.25)'
                  : '1px solid rgba(30, 41, 59, 0.8)',
                boxShadow: idx === 0 ? '0 4px 20px rgba(6, 182, 212, 0.08)' : 'none'
              }}
              onMouseEnter={e => { if (idx !== 0) { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={e => { if (idx !== 0) { e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.transform = ''; } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white">{item.day}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.date}</div>
                </div>
                <div
                  className="p-2 rounded-xl"
                  style={{
                    background: idx === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.5)'
                  }}
                >
                  {getConditionIcon(item.icon)}
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-300">{item.condition}</div>

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(30, 41, 59, 0.8)' }}
              >
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-black text-white text-xl">
                    {tempUnit === 'F' ? Math.round((item.max * 9/5) + 32) : item.max}°
                  </span>
                  <span className="text-slate-500 text-xs">
                    {tempUnit === 'F' ? Math.round((item.min * 9/5) + 32) : item.min}°{tempUnit}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: getRainColor(item.rainProb) }}>
                  <Droplets className="w-3 h-3" />
                  <span>{item.rainProb}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kisan Advisory Strip */}
      <div
        className="rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 25, 15, 0.9) 0%, rgba(5, 12, 28, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 24px rgba(16, 185, 129, 0.04)'
        }}
      >
        <div className="flex items-start space-x-4">
          <div
            className="p-3 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
          >
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Kisan Weekly Action Advisory</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
              Mid-week precipitation will elevate relative soil moisture by 18%. 
              Favorable window for nitrogen top-dressing is Thursday morning (pre-rain window).
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black text-white flex-shrink-0 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
          }}
        >
          <span>Ask Agronomist AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ForecastPage;
