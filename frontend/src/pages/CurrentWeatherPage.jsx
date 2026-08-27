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
  MapPin,
  Thermometer,
  Navigation,
  Loader
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, unit, sub, color = '#06b6d4' }) => (
  <div
    className="stat-card group cursor-default"
    style={{ '--hover-color': color }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      <div
        className="p-1.5 rounded-lg transition-all duration-300"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
    </div>
    <div className="text-xl font-black text-white">
      {value}
      {unit && <span className="text-xs text-slate-400 font-normal ml-1">{unit}</span>}
    </div>
    {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
  </div>
);

const CurrentWeatherPage = () => {
  const { 
    selectedCity, 
    weatherData, 
    tempUnit, 
    setActiveScreen, 
    startVoiceInput, 
    isListening, 
    speakText,
    detectCurrentLocation,
    isLocating
  } = useApp();

  const temp = tempUnit === 'F' ? Math.round((weatherData.temperature * 9/5) + 32) : weatherData.temperature;
  const feelsLike = tempUnit === 'F' ? Math.round(((weatherData.feelsLike || weatherData.temperature) * 9/5) + 32) : (weatherData.feelsLike || weatherData.temperature);
  const tempMin = tempUnit === 'F' ? Math.round(((weatherData.tempMin || weatherData.temperature - 3) * 9/5) + 32) : (weatherData.tempMin || weatherData.temperature - 3);
  const tempMax = tempUnit === 'F' ? Math.round(((weatherData.tempMax || weatherData.temperature + 3) * 9/5) + 32) : (weatherData.tempMax || weatherData.temperature + 3);

  const riskColor = {
    'Extreme': '#ef4444',
    'Moderate': '#f59e0b',
    'Low': '#10b981',
  }[weatherData.disasterRiskLevel] || '#10b981';

  return (
    <div className="space-y-6 pb-16 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              {weatherData.city}
              <span className="text-slate-500">,</span>{' '}
              <span className="text-cyan-400 font-semibold">{weatherData.state || 'India'}</span>
            </h1>
            <span className="badge-live">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AWS Live</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
            <MapPin className="w-3 h-3 text-cyan-600" />
            <span>{weatherData.lastUpdated || `${weatherData.coordinates?.lat || 19.07}°N, ${weatherData.coordinates?.lon || 72.87}°E`}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={detectCurrentLocation}
            disabled={isLocating}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-slate-300 hover:text-cyan-300"
            style={{
              background: 'rgba(10, 20, 40, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)'
            }}
            title="Detect GPS Geolocation"
          >
            {isLocating ? (
              <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-cyan-400" />
            )}
            <span>{isLocating ? 'Locating...' : 'GPS Auto-Detect'}</span>
          </button>

          <button
            onClick={() => startVoiceInput()}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={isListening ? {
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.2)'
            } : {
              background: 'rgba(10, 20, 40, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              color: '#94a3b8'
            }}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : 'text-cyan-400'}`} />
            <span>{isListening ? 'Listening...' : 'Voice Query'}</span>
          </button>

          <button
            onClick={() => setActiveScreen('chat')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask WeatherGPT</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hero Temperature Card */}
        <div
          className="lg:col-span-2 rounded-3xl p-7 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 14, 30, 0.97) 0%, rgba(10, 20, 40, 0.95) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.12)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
          }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)'
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-60 h-60 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 60%)'
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between space-y-6">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest"
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    color: '#67e8f9'
                  }}
                >
                  IMD Surface Telemetry
                </span>
                <h2 className="text-xl font-bold text-white mt-3">{weatherData.condition}</h2>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">{weatherData.description}</p>
              </div>

              <div
                className="p-4 rounded-2xl flex-shrink-0 animate-float"
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.15)'
                }}
              >
                <CloudSun className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            {/* Temperature Display */}
            <div className="flex flex-wrap items-baseline gap-4">
              <div
                className="text-7xl sm:text-8xl font-black tracking-tighter text-white"
                style={{ fontFamily: 'Outfit, Inter, sans-serif', textShadow: '0 0 40px rgba(6, 182, 212, 0.2)' }}
              >
                {temp}°
                <span className="text-3xl text-cyan-400 font-bold">{tempUnit}</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">
                  Feels like{' '}
                  <span className="font-bold text-slate-200">{feelsLike}°{tempUnit}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <span className="text-blue-400">↓</span>
                    <span>{tempMin}°</span>
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center space-x-1">
                    <span className="text-orange-400">↑</span>
                    <span>{tempMax}°{tempUnit}</span>
                  </span>
                </div>
                {weatherData.sunrise && (
                  <div className="text-[10px] text-slate-500">
                    🌅 {weatherData.sunrise} · 🌇 {weatherData.sunset}
                  </div>
                )}
              </div>
            </div>

            {/* Hourly Strip */}
            <div
              className="pt-5"
              style={{ borderTop: '1px solid rgba(30, 41, 59, 0.8)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">3-Hourly NWP Forecast (WRF High-Res)</span>
                <span className="text-[10px] text-cyan-500 font-semibold">Rain Prob %</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {(weatherData.hourly || []).slice(0, 7).map((h, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl text-center transition-all duration-200 cursor-default group"
                    style={{
                      background: idx === 0
                        ? 'rgba(6, 182, 212, 0.12)'
                        : 'rgba(10, 22, 42, 0.7)',
                      border: idx === 0
                        ? '1px solid rgba(6, 182, 212, 0.25)'
                        : '1px solid rgba(30, 41, 59, 0.8)'
                    }}
                  >
                    <div className="text-[10px] font-semibold text-slate-500">{h.time}</div>
                    <div className="text-sm font-black text-white my-1">{h.temp}°</div>
                    <div
                      className="text-[10px] font-bold"
                      style={{ color: h.rainProb > 50 ? '#60a5fa' : '#06b6d4' }}
                    >
                      {h.rainProb}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div className="space-y-5">
          {/* Risk Card */}
          <div
            className="rounded-3xl p-6 space-y-4"
            style={{
              background: 'rgba(6, 14, 30, 0.95)',
              border: `1px solid ${riskColor}22`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${riskColor}08`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4" style={{ color: riskColor }} />
                <span>Hazard Classification</span>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: `${riskColor}15`,
                  border: `1px solid ${riskColor}35`,
                  color: riskColor
                }}
              >
                {weatherData.disasterRiskLevel || 'Low'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Numerical models indicate {weatherData.disasterRiskLevel === 'Extreme' ? 'severe' : 'stable'} microclimate conditions. 
              {weatherData.disasterRiskLevel === 'Low' && ' No flash flood or squall warnings active.'}
            </p>

            <button
              onClick={() => setActiveScreen('alerts')}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-2"
              style={{
                background: 'rgba(10, 22, 42, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#94a3b8'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'; e.currentTarget.style.color = '#67e8f9'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <span>View IMD Bulletins</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Agricultural Advisory */}
          <div
            className="rounded-3xl p-6 space-y-4"
            style={{
              background: 'linear-gradient(135deg, rgba(5, 28, 18, 0.9) 0%, rgba(6, 14, 30, 0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.04)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl"
                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">Agricultural Advisory</h3>
                <span className="text-[10px] text-emerald-400 font-semibold">Kisan Decision Engine</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {weatherData.agriculturalAdvisory || 'Maintain proper irrigation timing before peak solar radiation.'}
            </p>

            <button
              onClick={() => speakText(weatherData.agriculturalAdvisory)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen in Regional Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Droplets} label="Humidity" value={`${weatherData.humidity}%`} sub={`Dew ${weatherData.dewPoint || 22}°C`} color="#38bdf8" />
        <StatCard icon={Wind} label="Wind Speed" value={weatherData.windSpeed} unit="km/h" sub={`Dir: ${weatherData.windDirection}`} color="#818cf8" />
        <StatCard icon={Gauge} label="Pressure" value={weatherData.pressure} unit="hPa" sub="Barometric MSL" color="#34d399" />
        <StatCard icon={Sun} label="UV Index" value={`${weatherData.uvIndex}/11`} sub="Peak Midday" color="#fbbf24" />
        <StatCard icon={Eye} label="AQI PM2.5" value={weatherData.airQualityIndex} sub={weatherData.airQualityStatus || 'Moderate'} color="#a78bfa" />
        <StatCard icon={Compass} label="Visibility" value={weatherData.visibility} unit="km" sub="Horizontal Runway" color="#fb7185" />
      </div>
    </div>
  );
};

export default CurrentWeatherPage;
