import React from 'react';
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
  AlertTriangle
} from 'lucide-react';

const CurrentWeatherPage = () => {
  const { weatherData, selectedCity, formatTemp } = useApp();

  // AQI Color helper
  const getAqiColor = (aqi) => {
    if (aqi <= 50) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (aqi <= 100) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
    if (aqi <= 200) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  };

  const aqiTheme = getAqiColor(weatherData.aqi);

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Main Temperature Gauge */}
      <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* City & Status */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Meteorological Station</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {weatherData.city}, <span className="text-slate-400 font-normal">{weatherData.country}</span>
            </h1>
            <p className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              {weatherData.condition}
            </p>
            <p className="text-xs text-slate-400">
              Station Sync: {weatherData.lastUpdated} • Coordinates: {weatherData.coordinates.lat}°N, {weatherData.coordinates.lon}°E
            </p>
          </div>

          {/* Temperature Hero */}
          <div className="flex items-center space-x-6">
            <div className="text-left sm:text-right">
              <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tighter">
                {formatTemp(weatherData.temp)}
              </span>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                Feels like <span className="text-cyan-400">{formatTemp(weatherData.feelsLike)}</span>
              </p>
            </div>
            <div className="h-16 w-px bg-slate-800 hidden sm:block" />
            <div className="space-y-1 text-xs text-slate-300">
              <p className="flex items-center gap-1.5">
                <span className="text-slate-400">High:</span>
                <span className="font-bold text-red-400">{formatTemp(weatherData.tempMax)}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-slate-400">Low:</span>
                <span className="font-bold text-cyan-400">{formatTemp(weatherData.tempMin)}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-slate-400">Dew Point:</span>
                <span className="font-bold text-slate-200">{weatherData.dewPoint}°C</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 5 Requested Parameters + AQI & Sun Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Humidity Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Relative Humidity</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{weatherData.humidity}%</span>
            <span className="text-xs text-slate-400">Moisture Index</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${weatherData.humidity}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">High moisture content favorable for thunderstorm development.</p>
        </div>

        {/* 2. Wind Speed & Direction Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wind Velocity & Gusts</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{weatherData.windSpeed} km/h</span>
            <span className="text-xs font-semibold text-cyan-400">Vector: {weatherData.windDirection}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>South-Westerly Monsoon Flow</span>
          </div>
          <p className="text-[11px] text-slate-400">Fresh breeze. Marine advisory issued for offshore craft.</p>
        </div>

        {/* 3. Barometric Pressure Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Atmospheric Pressure</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{weatherData.pressure} hPa</span>
            <span className="text-xs text-emerald-400 font-semibold">Steady</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Standard sea-level barometer reading.</p>
        </div>

        {/* 4. Visibility Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Visibility Distance</span>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{weatherData.visibility} km</span>
            <span className="text-xs text-slate-400">Optical Range</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {weatherData.visibility < 5 ? 'Moderate fog/precipitation haze affecting runway visual range.' : 'Clear horizon view for urban and road travel.'}
          </p>
        </div>

        {/* 5. Air Quality Index (AQI) Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Air Quality Index (AQI)</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${aqiTheme.bg} ${aqiTheme.text} ${aqiTheme.border} border`}>
              {weatherData.aqiStatus}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{weatherData.aqi}</span>
            <span className="text-xs text-slate-400">PM2.5 / PM10 Index</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {weatherData.aqi > 150 ? 'Unhealthy air. Sensitive groups should wear N95 masks outdoor.' : 'Air quality is acceptable for outdoor activity.'}
          </p>
        </div>

        {/* 6. Sun Cycle & UV Index Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Solar Cycle & UV</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400">Sunrise</p>
                <p className="font-bold text-white">{weatherData.sunrise}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sunset className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-[10px] text-slate-400">Sunset</p>
                <p className="font-bold text-white">{weatherData.sunset}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">UV Index Rating:</span>
            <span className="font-bold text-amber-400">{weatherData.uvIndex} / 12 (Moderate)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CurrentWeatherPage;
