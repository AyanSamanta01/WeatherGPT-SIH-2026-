import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Sun, 
  Sunrise, 
  Sunset, 
  Compass,
  CloudRain,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Sparkles,
  ArrowRight,
  Zap,
  CloudLightning,
  CloudSun,
  Navigation,
  CheckCircle2,
  TrendingUp,
  Waves,
  Radio
} from 'lucide-react';

const CurrentWeatherPage = () => {
  const { 
    weatherData, 
    selectedCity, 
    setSelectedCity,
    formatTemp, 
    fetchWeatherData, 
    weatherLoading,
    setActiveScreen,
    INDIAN_CITIES,
    tempUnit
  } = useApp();

  // 3D Parallax Tilt State for Hero Card
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const heroCardRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setHeroTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Popular quick city hubs
  const QUICK_CITIES = ['Mumbai', 'Delhi', 'Kolkata', 'Bengaluru', 'Shimla', 'Chennai', 'Pune', 'Srinagar'];

  // AQI Color and Category Helper
  const getAqiTheme = (aqi) => {
    const score = aqi || 65;
    if (score <= 50) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', stroke: '#10b981', label: 'Good' };
    if (score <= 100) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', stroke: '#f59e0b', label: 'Satisfactory' };
    if (score <= 200) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', stroke: '#f97316', label: 'Moderate' };
    if (score <= 300) return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', stroke: '#ef4444', label: 'Poor' };
    return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', stroke: '#a855f7', label: 'Severe' };
  };

  const aqiTheme = getAqiTheme(weatherData?.aqi);

  // Calculate Wind Direction Degrees
  const getWindDegree = (dir) => {
    const map = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
    return map[dir] ?? 225;
  };

  const windDeg = getWindDegree(weatherData?.windDirection || 'SW');

  return (
    <div className="space-y-6 select-none perspective-[1200px] pb-10">
      
      {/* ========================================================================= */}
      {/* 1. QUICK METEOROLOGICAL STATIONS CHIPS BAR                                */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs font-bold text-slate-300 flex-shrink-0">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Regional Hubs:</span>
        </div>
        {QUICK_CITIES.map((cName) => (
          <button
            key={cName}
            onClick={() => setSelectedCity(cName)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all duration-200 flex-shrink-0 flex items-center space-x-1.5 ${
              selectedCity.toLowerCase() === cName.toLowerCase()
                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-cyan-500/40'
            }`}
          >
            <span>{cName}</span>
            {selectedCity.toLowerCase() === cName.toLowerCase() && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D LIQUID HERO TELEMETRY CARD WITH SPECULAR GLARE & PARALLAX           */}
      {/* ========================================================================= */}
      <div 
        ref={heroCardRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="liquid-sidebar rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-transform duration-300 ease-out transform-gpu group"
        style={{
          transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Dynamic Specular Liquid Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${heroTilt.glareX}% ${heroTilt.glareY}%, rgba(255, 255, 255, 0.18) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* Ambient Morphing Liquid Glow Blobs inside Hero Card */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/25 via-sky-600/15 to-blue-600/20 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-amber-500/15 to-rose-600/15 rounded-full blur-3xl animate-liquid-2 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Station Metadata & Atmospheric State */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold backdrop-blur-md shadow-sm">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>IMD Ground Station Telemetry Grid</span>
              </div>

              <button
                onClick={() => fetchWeatherData(selectedCity)}
                disabled={weatherLoading}
                className="p-1.5 rounded-full bg-slate-900/90 border border-white/15 text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition cursor-pointer active:scale-90"
                title="Refresh Live Sensor Telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-baseline gap-2">
                <span>{weatherData?.city || selectedCity}</span>
                <span className="text-lg sm:text-xl text-slate-400 font-semibold">{weatherData?.country || 'India'}</span>
              </h1>

              <div className="flex items-center space-x-3 text-sm font-extrabold text-cyan-300 pt-1">
                <CloudRain className="w-5 h-5 text-cyan-400 animate-bounce" />
                <span>{weatherData?.condition || 'Thunderstorm & Convective Precipitation'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">
                  {weatherData?.coordinates?.lat || 19.07}°N, {weatherData?.coordinates?.lon || 72.87}°E
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Telemetry Sync: {weatherData?.lastUpdated || 'Just now'}</span>
            </div>
          </div>

          {/* Temperature 3D Metric Display */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <div className="text-left sm:text-right">
              <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tighter drop-shadow-lg">
                {formatTemp(weatherData?.temp || 29)}
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1">
                Apparent Feels Like <span className="text-cyan-300 font-extrabold">{formatTemp(weatherData?.feelsLike || 33)}</span>
              </p>
            </div>

            <div className="h-20 w-[1.5px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent hidden sm:block" />

            <div className="space-y-2 text-xs text-slate-300 min-w-[130px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-400 font-medium">Diurnal High:</span>
                <span className="font-extrabold text-rose-400">{formatTemp(weatherData?.tempMax || 31)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-400 font-medium">Diurnal Low:</span>
                <span className="font-extrabold text-cyan-400">{formatTemp(weatherData?.tempMin || 26)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-400 font-medium">Dew Point:</span>
                <span className="font-bold text-slate-100">{weatherData?.dewPoint || 25}°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Shortcuts Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-medium">NWP Numerical GFS Ensemble & WRF Simulation Live Grounding</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setActiveScreen('map')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>View GIS Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveScreen('chat')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
            >
              Query WeatherGPT AI
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 3D DYNAMIC ATMOSPHERIC PARAMETER CARDS GRID                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 💧 1. Relative Humidity & Moisture */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Atmospheric Humidity</span>
              <h3 className="text-base font-bold text-white">Relative Moisture</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5 text-sky-400" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white tracking-tight">{weatherData?.humidity || 84}%</span>
            <span className="text-xs text-sky-300 font-bold">Vapor Saturation</span>
          </div>

          {/* Liquid Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-900/90 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${weatherData?.humidity || 84}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Dry (20%)</span>
              <span>Optimal (55%)</span>
              <span>Saturated (90%+)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            High boundary layer moisture content conducive to convective cloud and thunderstorm formation.
          </p>
        </div>

        {/* 💨 2. Dynamic Wind Vector & Compass Heading */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Anemometer Telemetry</span>
              <h3 className="text-base font-bold text-white">Wind Velocity & Gusts</h3>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Wind className="w-5 h-5 text-cyan-300" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white tracking-tight">{weatherData?.windSpeed || 24}</span>
                <span className="text-xs font-extrabold text-cyan-300">km/h</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                Heading: <strong className="text-white">{weatherData?.windDirection || 'SW'}</strong> ({windDeg}°)
              </p>
            </div>

            {/* 3D Rotating Wind Compass Rose */}
            <div className="relative w-16 h-16 rounded-full bg-slate-900/90 border-2 border-cyan-500/40 flex items-center justify-center shadow-inner">
              <span className="absolute top-0.5 text-[8px] font-bold text-slate-400">N</span>
              <span className="absolute right-0.5 text-[8px] font-bold text-slate-400">E</span>
              <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-400">S</span>
              <span className="absolute left-0.5 text-[8px] font-bold text-slate-400">W</span>
              <Navigation 
                className="w-7 h-7 text-cyan-400 transition-transform duration-700 drop-shadow" 
                style={{ transform: `rotate(${windDeg}deg)` }} 
              />
            </div>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            South-Westerly monsoon circulation. Moderate squally gusts active over coastal & rural grids.
          </p>
        </div>

        {/* ⏲️ 3. Barometric Pressure & Isobaric Delta */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Barometer Telemetry</span>
              <h3 className="text-base font-bold text-white">Atmospheric Pressure</h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5 text-purple-300" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white tracking-tight">{weatherData?.pressure || 1008}</span>
            <span className="text-xs font-bold text-purple-300">hPa (mbar)</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-900/90 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-sm" 
                style={{ width: '68%' }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Low (980 hPa)</span>
              <span>Standard (1013 hPa)</span>
              <span>High (1035 hPa)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            Steady surface isobar calibrated against standard sea level pressure. No rapid cyclonic drop detected.
          </p>
        </div>

        {/* 🍃 4. Air Quality Index (AQI) Radial Capsule */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Pollution Sensor</span>
              <h3 className="text-base font-bold text-white">Air Quality Index (AQI)</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${aqiTheme.bg} ${aqiTheme.text} ${aqiTheme.border} border shadow-sm`}>
              {weatherData?.aqiStatus || aqiTheme.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white tracking-tight">{weatherData?.aqi || 68}</span>
                <span className="text-xs text-slate-400 font-bold">AQI Score</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                Dominant Pollutant: <strong className="text-cyan-300">PM2.5 / PM10</strong>
              </p>
            </div>

            {/* SVG Circular Radial Progress */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${Math.min(((weatherData?.aqi || 68) / 300) * 100, 100)}, 100`}
                  stroke={aqiTheme.stroke}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">{weatherData?.aqi || 68}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            Air quality within acceptable National Ambient Air Quality Standards. Ideal for rural agricultural activity.
          </p>
        </div>

        {/* 👁️ 5. Optical Visibility & Horizon Range */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Optical Telemetry</span>
              <h3 className="text-base font-bold text-white">Surface Visibility</h3>
            </div>
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5 text-teal-300" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white tracking-tight">{weatherData?.visibility || 4.5}</span>
            <span className="text-xs font-bold text-teal-300">Kilometers</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-900/90 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 shadow-sm" 
                style={{ width: `${Math.min(((weatherData?.visibility || 4.5) / 10) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Fog (0-2 km)</span>
              <span>Moderate (5 km)</span>
              <span>Clear (10+ km)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            {(weatherData?.visibility || 4.5) < 5 
              ? 'Moderate optical restriction due to active rain curtains and misting.' 
              : 'Clear horizontal horizon suitable for aviation, highway transit, and navigation.'}
          </p>
        </div>

        {/* ☀️ 6. Solar Ephemeris & UV Radiation */}
        <div className="liquid-sidebar rounded-3xl p-5 space-y-4 hover:border-cyan-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Solar Telemetry</span>
              <h3 className="text-base font-bold text-white">Sun Cycle & UV Index</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5 text-amber-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center space-x-3">
              <Sunrise className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Sunrise</p>
                <p className="font-bold text-xs text-white">{weatherData?.sunrise || '06:14 AM'}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center space-x-3">
              <Sunset className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Sunset</p>
                <p className="font-bold text-xs text-white">{weatherData?.sunset || '07:05 PM'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-medium">UV Radiation:</span>
            <span className="font-black text-amber-300">{weatherData?.uvIndex || 4} / 12 (Moderate)</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CurrentWeatherPage;
