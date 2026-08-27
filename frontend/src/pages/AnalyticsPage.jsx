import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_CLIMATE_TRENDS } from '../data/mockData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Flame, 
  CloudRain, 
  Calendar, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

const AnalyticsPage = () => {
  const { selectedCity } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <LineChartIcon className="w-4 h-4" />
            <span>Climate Intelligence & Historical Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Long-Term Climate Analytics: <span className="text-cyan-400">{selectedCity} Region</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-decadal historical trends, thermal anomaly profiling, and monsoon precipitation distribution
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 rounded-2xl text-cyan-300 text-xs font-bold">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>IMD 50-Year Baseline Grounding</span>
        </div>
      </div>

      {/* Derived Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Thermal Anomaly Index</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">+0.85°C</p>
          <p className="text-[11px] text-slate-400">Above 1971-2020 climatological mean.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Monsoon Precipitation Deviation</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">+14.2%</p>
          <p className="text-[11px] text-slate-400">Above normal seasonal rainfall in 2026.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Agricultural Drought Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">Low Risk</p>
          <p className="text-[11px] text-slate-400">Adequate soil moisture storage index.</p>
        </div>
      </div>

      {/* 1. Monthly Temperature Anomaly Line Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span>Monthly Mean Temperature vs. Historical Baseline (°C)</span>
          </div>
          <span className="text-[11px] text-slate-400">2026 vs 50-Yr Normal</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_CLIMATE_TRENDS.monthlyTemperature}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[20, 40]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="historicalAvg" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" name="50-Yr Historical Mean" />
              <Line type="monotone" dataKey="currentYear" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} name="2026 Actual Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Decadal Annual Rainfall Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span>10-Year Annual Rainfall Pattern (mm)</span>
          </div>
          <span className="text-[11px] text-slate-400">2016 - 2025 Trend</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CLIMATE_TRENDS.decadalRainfall}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="annualRainfall" fill="#0284c7" radius={[6, 6, 0, 0]} name="Annual Rainfall (mm)" />
              <Bar dataKey="normal" fill="#334155" radius={[6, 6, 0, 0]} name="Climatological Normal" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
