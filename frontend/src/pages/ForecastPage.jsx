import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_HOURLY_FORECAST, MOCK_DAILY_FORECAST } from '../data/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  CloudRain, 
  CloudDrizzle, 
  Sun, 
  Cloud, 
  CalendarDays, 
  Clock, 
  Umbrella, 
  Droplets, 
  TrendingUp 
} from 'lucide-react';

const ForecastPage = () => {
  const { selectedCity, formatTemp } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>NWP Model Ensemble Forecast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Short-Range & 7-Day Outlook: <span className="text-cyan-400">{selectedCity}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded in Global Forecast System (GFS) & High-Resolution WRF Numerical Weather Models
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-xs">
          <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
            <Umbrella className="w-4 h-4 text-cyan-400" />
            <span>Peak Rain Prob: 90% (15:00)</span>
          </div>
        </div>
      </div>

      {/* 1. Hourly Forecast Timeline Horizontal Scroller */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>24-Hour Timeline Forecast</span>
          </div>
          <span className="text-[11px] text-slate-400">Scroll sideways ➔</span>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {MOCK_HOURLY_FORECAST.map((item, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-28 p-4 rounded-2xl border text-center space-y-2 transition-all ${
                idx === 4 
                  ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-105' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold text-slate-300">{item.time}</span>
              <div className="w-8 h-8 mx-auto flex items-center justify-center text-cyan-400">
                {item.pop > 70 ? <CloudRain className="w-6 h-6" /> : item.pop > 30 ? <CloudDrizzle className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </div>
              <p className="text-lg font-bold text-white">{formatTemp(item.temp)}</p>
              <div className="flex items-center justify-center space-x-1 text-[11px] text-sky-400 font-medium">
                <Droplets className="w-3 h-3" />
                <span>{item.pop}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recharts Rain Probability & Temp Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Precipitation Probability Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <Umbrella className="w-4 h-4 text-sky-400" />
              <span>Precipitation Probability (%)</span>
            </div>
            <span className="text-[10px] text-slate-400">Hourly Distribution</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HOURLY_FORECAST}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="pop" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#rainGrad)" name="Rain Prob %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Range Curve */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Diurnal Temperature Curve (°C)</span>
            </div>
            <span className="text-[10px] text-slate-400">Thermal Profile</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HOURLY_FORECAST}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#tempGrad)" name="Temperature °C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. 7-Day Extended Daily Forecast List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <CalendarDays className="w-4 h-4 text-cyan-400" />
            <span>7-Day Outlook Breakdown</span>
          </div>
          <span className="text-xs text-slate-400">Updated twice daily</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {MOCK_DAILY_FORECAST.map((day, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-900/40 px-2 rounded-xl transition">
              {/* Day & Date */}
              <div className="w-28">
                <p className="font-bold text-white">{day.day}</p>
                <p className="text-[10px] text-slate-400">{day.date}</p>
              </div>

              {/* Weather Condition */}
              <div className="flex items-center space-x-2 flex-1 max-w-xs">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  {day.pop > 70 ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="text-slate-200 font-medium">{day.condition}</span>
              </div>

              {/* Rain Chance */}
              <div className="w-24 text-center">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px]">
                  {day.pop}% Rain
                </span>
              </div>

              {/* High / Low Bar */}
              <div className="flex items-center space-x-3 w-36 justify-end">
                <span className="text-cyan-400 font-semibold">{formatTemp(day.tempMin)}</span>
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-red-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-red-400 font-bold">{formatTemp(day.tempMax)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
