import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { climateService } from '../services/api';
import { MOCK_CLIMATE_TRENDS } from '../data/mockData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
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
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Zap,
  Radio,
  Layers,
  ArrowRight,
  Droplets,
  Thermometer,
  TreeDeciduous,
  Waves
} from 'lucide-react';

const AnalyticsPage = () => {
  const { selectedCity, weatherData, setActiveScreen } = useApp();

  const [climateData, setClimateData] = useState(MOCK_CLIMATE_TRENDS);
  const [loading, setLoading] = useState(false);
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState('temp'); // 'temp' | 'rain' | 'soil'

  // 3D Parallax Tilt for Header Card
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const heroCardRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setHeroTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const data = await climateService.getClimateTrends(
          weatherData?.coordinates?.lat, 
          weatherData?.coordinates?.lon
        );
        if (data) setClimateData(data);
      } catch (err) {
        console.warn('Failed to load climate analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedCity, weatherData]);

  return (
    <div className="space-y-6 select-none perspective-[1200px] pb-10">
      
      {/* ========================================================================= */}
      {/* 1. 3D LIQUID HERO CLIMATE DIAGNOSTICS HEADER                              */}
      {/* ========================================================================= */}
      <div 
        ref={heroCardRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="liquid-sidebar rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl transition-transform duration-300 ease-out transform-gpu group"
        style={{
          transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular Liquid Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${heroTilt.glareX}% ${heroTilt.glareY}%, rgba(255, 255, 255, 0.18) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* Ambient Morphing Liquid Blobs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-amber-500/15 to-rose-600/15 rounded-full blur-3xl animate-liquid-2 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold backdrop-blur-md shadow-sm">
                <LineChartIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Decadal Climate Intelligence & Anomaly Engine</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                1971-2025 Normal
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Long-Term Climate Diagnostics: <span className="text-cyan-400">{selectedCity}</span>
              </h1>
              <p className="text-xs text-slate-300/90 font-medium mt-1">
                Multi-decadal thermal anomaly profiling, monsoon precipitation distribution variances, and agricultural soil moisture storage capacities.
              </p>
            </div>
          </div>

          {/* Baseline Info Pill */}
          <div className="flex items-center space-x-3 bg-slate-900/90 border border-white/15 p-4 rounded-3xl text-xs shadow-2xl backdrop-blur-xl min-w-[220px]">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-white/20">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Climatological Reference</p>
              <p className="font-black text-white text-sm mt-0.5">50-Year IMD Baseline</p>
              <p className="text-[11px] text-cyan-300 font-semibold">1971 - 2020 Period Norms</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Mode Switcher Tabs */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center space-x-2 overflow-x-auto scrollbar-none relative z-10">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1 flex-shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnostic View:</span>
          </span>
          {[
            { id: 'temp', label: 'Thermal Profile Anomaly', icon: Thermometer, color: 'text-orange-400' },
            { id: 'rain', label: 'Decadal Monsoon Volume', icon: CloudRain, color: 'text-sky-400' },
            { id: 'soil', label: 'Agro-Climatic Soil Index', icon: TreeDeciduous, color: 'text-emerald-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDiagnosticTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDiagnosticTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D DERIVED CLIMATE KPI CARDS MATRIX                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Thermal Anomaly */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-3 hover:border-orange-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-orange-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">Thermal Anomaly</span>
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">+0.85°C</span>
            <span className="text-xs text-orange-300 font-bold">Above Normal</span>
          </div>
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed">
            Positive surface thermal departure relative to the 1971-2020 IMD climatological baseline.
          </p>
        </div>

        {/* 2. Monsoon Precipitation */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-3 hover:border-sky-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-sky-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Monsoon Deviation</span>
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 group-hover:scale-110 transition-transform">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-sky-300">+14.2%</span>
            <span className="text-xs text-emerald-400 font-bold">Surplus Inflow</span>
          </div>
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full" style={{ width: '84%' }} />
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed">
            Above normal cumulative seasonal rainfall distribution recorded across regional grids in 2026.
          </p>
        </div>

        {/* 3. Drought Vulnerability */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-3 hover:border-emerald-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-emerald-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Agro Drought Risk</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-300">Low Risk</span>
            <span className="text-xs text-slate-400 font-bold">Optimal</span>
          </div>
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" style={{ width: '92%' }} />
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed">
            High root-zone soil moisture storage capacity suitable for rainfed kharif crops.
          </p>
        </div>

        {/* 4. Extreme Convective Events */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-3 hover:border-purple-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-purple-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Extreme Events</span>
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-purple-300">+22%</span>
            <span className="text-xs text-rose-400 font-bold">Cloudburst Frequency</span>
          </div>
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-purple-600 to-rose-500 h-full rounded-full" style={{ width: '74%' }} />
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed">
            Heightened frequency of localized high-intensity rainfall bursts exceeding 65 mm/hr.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC RECHARTS VISUALIZATION PANELS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📈 1. Monthly Temperature Anomaly vs Baseline */}
        <div className="liquid-sidebar rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span>Monthly Mean Temperature vs. 50-Year Baseline (°C)</span>
            </div>
            <span className="text-[10px] text-orange-300 font-bold bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
              2026 vs Normal
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climateData.monthlyTemperature}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[20, 40]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(249, 115, 22, 0.4)', borderRadius: '1.25rem', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} 
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="historicalAvg" stroke="#64748b" strokeWidth={2.5} strokeDasharray="5 5" name="50-Yr Historical Mean (°C)" />
                <Line type="monotone" dataKey="currentYear" stroke="#f97316" strokeWidth={3.5} dot={{ r: 5, fill: '#f97316' }} name="2026 Observed Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📊 2. Decadal Annual Rainfall Bar Distribution */}
        <div className="liquid-sidebar rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <span>10-Year Decadal Rainfall Distribution Pattern (mm)</span>
            </div>
            <span className="text-[10px] text-sky-300 font-bold bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/30">
              2016 - 2025 Series
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={climateData.decadalRainfall}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(56, 189, 248, 0.4)', borderRadius: '1.25rem', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} 
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="annualRainfall" fill="#0284c7" radius={[8, 8, 0, 0]} name="Annual Observed Rainfall (mm)" />
                <Bar dataKey="normal" fill="#334155" radius={[8, 8, 0, 0]} name="Climatological Normal (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. AI AGRO-CLIMATE DECISION SUPPORT ADVISORY                               */}
      {/* ========================================================================= */}
      <div className="liquid-sidebar rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-2 border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              WeatherGPT Agro-Climatic Intelligence Advisory
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Based on the +14.2% monsoon surplus and stable root-zone soil saturation in <strong className="text-cyan-300">{selectedCity}</strong>, projected kharif crop yield potential is elevated by 8.5%. Recommend moisture conservation tillage.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveScreen('chat')}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition flex-shrink-0 flex items-center space-x-2 cursor-pointer active:scale-95"
        >
          <span>Ask AI Climate Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default AnalyticsPage;
