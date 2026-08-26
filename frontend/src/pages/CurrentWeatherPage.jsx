import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Sun, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  Sprout, 
  Mic, 
  Volume2, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

const CurrentWeatherPage = () => {
  const { 
    selectedCity, 
    weatherData, 
    tempUnit, 
    setActiveScreen, 
    startVoiceInput, 
    isListening, 
    speakText 
  } = useApp();

  const temp = tempUnit === 'F' ? Math.round((weatherData.temperature * 9/5) + 32) : weatherData.temperature;
  const feelsLike = tempUnit === 'F' ? Math.round((weatherData.feelsLike * 9/5) + 32) : weatherData.feelsLike;
  const tempMin = tempUnit === 'F' ? Math.round((weatherData.tempMin * 9/5) + 32) : weatherData.tempMin;
  const tempMax = tempUnit === 'F' ? Math.round((weatherData.tempMax * 9/5) + 32) : weatherData.tempMax;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {weatherData.city}, <span className="text-cyan-400 font-semibold">{weatherData.state || 'India'}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              Live AWS Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {weatherData.lastUpdated || 'Coordinates: ' + (weatherData.coordinates?.lat || 19.07) + '°N, ' + (weatherData.coordinates?.lon || 72.87) + '°E'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startVoiceInput()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-lg ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : 'text-cyan-400'}`} />
            <span>{isListening ? 'Listening...' : 'Voice Query'}</span>
          </button>

          <button
            onClick={() => setActiveScreen('chat')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask WeatherGPT</span>
          </button>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hero Card: Primary Temperature & Condition */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  IMD Surface Telemetry
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
                  {weatherData.condition}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
                  {weatherData.description}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <CloudSun className="w-12 h-12" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-4 pt-2">
              <div className="text-6xl sm:text-7xl font-black tracking-tighter text-white">
                {temp}°<span className="text-3xl text-cyan-400 font-bold">{tempUnit}</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">
                  Feels like <span className="font-bold text-slate-200">{feelsLike}°{tempUnit}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center space-x-2">
                  <span>↓ {tempMin}°{tempUnit}</span>
                  <span>•</span>
                  <span>↑ {tempMax}°{tempUnit}</span>
                </div>
              </div>
            </div>

            {/* Hourly Telemetry Strip */}
            <div className="pt-4 border-t border-slate-700/60">
              <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                <span>3-Hourly NWP Forecast (WRF High-Res)</span>
                <span className="text-[10px] text-cyan-400">Rain Probability %</span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {(weatherData.hourly || []).map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center hover:bg-slate-700/60 transition">
                    <div className="text-[10px] font-semibold text-slate-400">{h.time}</div>
                    <div className="text-sm font-bold text-white my-1">{h.temp}°</div>
                    <div className="text-[10px] font-bold text-cyan-400">{h.rainProb}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Risk & Agricultural Decision Card */}
        <div className="space-y-6">
          {/* Disaster Risk Rating */}
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Hazard Classification</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                weatherData.disasterRiskLevel === 'Extreme'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : weatherData.disasterRiskLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {weatherData.disasterRiskLevel || 'Low Risk'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Numerical models indicate stable microclimate conditions across urban boundaries. No flash flood or squall warnings active.
            </p>

            <button
              onClick={() => setActiveScreen('alerts')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center space-x-2 transition"
            >
              <span>View IMD Bulletins</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          {/* Agricultural Crop Advisory Card */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Agricultural Advisory</h3>
                <span className="text-[10px] text-emerald-400 font-semibold">Kisan Decision Engine</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {weatherData.agriculturalAdvisory || 'Maintain proper irrigation timing before peak solar radiation.'}
            </p>

            <button
              onClick={() => speakText(weatherData.agriculturalAdvisory)}
              className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition pt-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen in Regional Audio</span>
            </button>
          </div>
        </div>

      </div>

      {/* Meteorological Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Humidity */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.humidity}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Dew Point {weatherData.dewPoint || 22}°C</div>
        </div>

        {/* Wind Speed */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Wind</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.windSpeed} <span className="text-xs text-slate-400 font-normal">km/h</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Direction: {weatherData.windDirection}</div>
        </div>

        {/* Pressure */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pressure</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.pressure} <span className="text-xs text-slate-400 font-normal">hPa</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Barometric MSL</div>
        </div>

        {/* UV Index */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.uvIndex} <span className="text-xs text-amber-400 font-normal">/ 11</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Peak Midday</div>
        </div>

        {/* Air Quality Index */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">AQI (PM2.5)</span>
            <Eye className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.airQualityIndex}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">{weatherData.airQualityStatus || 'Moderate'}</div>
        </div>

        {/* Visibility */}
        <div className="rounded-2xl p-4 bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Visibility</span>
            <Compass className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white">{weatherData.visibility} <span className="text-xs text-slate-400 font-normal">km</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Horizontal Runway</div>
        </div>

      </div>
    </div>
  );
};

export default CurrentWeatherPage;
