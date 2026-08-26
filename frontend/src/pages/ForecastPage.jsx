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
  ShieldAlert, 
  Sparkles,
  Sprout
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
    switch (iconName) {
      case 'cloud-lightning':
        return <CloudLightning className="w-6 h-6 text-amber-400" />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className="w-6 h-6 text-cyan-400" />;
      case 'cloud-sun':
        return <CloudSun className="w-6 h-6 text-sky-300" />;
      default:
        return <Sun className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              7-Day Numerical Weather Prediction
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              WRF & GFS Ensemble
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synoptic forecasting for <span className="text-white font-semibold">{weatherData.city}</span> powered by IMD numerical modeling & offline ML regressor.
          </p>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI Forecast Details</span>
        </button>
      </div>

      {/* Temperature & Rain Trend Chart */}
      <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Temperature Trajectory & Precipitation Probability</h2>
            <p className="text-[11px] text-slate-400">7-Day high/low thermal curve (°{tempUnit}) and rainfall probability (%)</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Max Temp</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span className="text-slate-400">Min Temp</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff'
                }} 
              />
              <Area type="monotone" dataKey="max" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
              <Area type="monotone" dataKey="min" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Day-by-Day Detailed List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Day-by-Day Forecast Breakdown</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyList.map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{item.day}</div>
                  <div className="text-[11px] text-slate-400">{item.date}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                  {getConditionIcon(item.icon)}
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-200">
                {item.condition}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-base">
                    {tempUnit === 'F' ? Math.round((item.max * 9/5) + 32) : item.max}°
                  </span>
                  <span className="text-slate-400 font-medium">
                    / {tempUnit === 'F' ? Math.round((item.min * 9/5) + 32) : item.min}°{tempUnit}
                  </span>
                </div>

                <div className="flex items-center space-x-1 font-bold text-cyan-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{item.rainProb}% Rain</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Weekly Guidance Strip */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kisan Weekly Action Advisory</h3>
            <p className="text-xs text-slate-300 mt-1">
              Mid-week precipitation will elevate relative soil moisture by 18%. Favorable window for nitrogen top-dressing is Thursday morning.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 flex-shrink-0 transition shadow-lg shadow-emerald-600/30"
        >
          <span>Ask Agronomist AI</span>
        </button>
      </div>

    </div>
  );
};

export default ForecastPage;
