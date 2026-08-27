import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Globe, 
  MapPin, 
  Bell, 
  Volume2, 
  Thermometer, 
  Cpu, 
  Check, 
  Server, 
  Code2, 
  Sparkles 
} from 'lucide-react';

const SettingsPage = () => {
  const { 
    language, 
    setLanguage, 
    selectedCity, 
    setSelectedCity, 
    INDIAN_CITIES,
    notificationsEnabled, 
    setNotificationsEnabled,
    voiceEnabled, 
    setVoiceEnabled,
    voiceSpeed, 
    setVoiceSpeed,
    tempUnit, 
    setTempUnit 
  } = useApp();

  const supportedLanguages = [
    { name: 'English', native: 'English' },
    { name: 'Hindi', native: 'हिन्दी' },
    { name: 'Bengali', native: 'বাংলা' },
    { name: 'Tamil', native: 'தமிழ்' },
    { name: 'Telugu', native: 'తెలుగు' },
    { name: 'Marathi', native: 'मराठी' },
    { name: 'Gujarati', native: 'ગુજરાતી' },
    { name: 'Kannada', native: 'কন্নড' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <Settings className="w-4 h-4" />
            <span>System Configuration & Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            WeatherGPT Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure language, voice synthesis rate, notification thresholds, and API gateway routes
          </p>
        </div>
      </div>

      {/* 1. Language Settings Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 text-sm font-bold text-white">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Multilingual Indian Language Selection</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setLanguage(lang.name)}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                language === lang.name
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{lang.name}</p>
                <p className="text-[10px] text-slate-400">{lang.native}</p>
              </div>
              {language === lang.name && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Default Location & Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location picker */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>Default Meteorological Station</span>
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-3 rounded-xl glass-input text-xs text-white bg-slate-900 focus:outline-none focus:border-cyan-500"
          >
            {INDIAN_CITIES.map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Sets your primary location for instant chat context & alerts.</p>
        </div>

        {/* Temperature Unit */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 text-sm font-bold text-white">
            <Thermometer className="w-5 h-5 text-cyan-400" />
            <span>Temperature Units</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setTempUnit('C')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                tempUnit === 'C' ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                tempUnit === 'F' ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Voice & Speech Settings */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 text-sm font-bold text-white">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <span>Voice Synthesis & Rural Accessibility Controls</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <p className="text-xs font-bold text-white">Auto Text-to-Speech Output</p>
            <p className="text-[11px] text-slate-400">Read AI weather responses out loud</p>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              voiceEnabled ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {voiceEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {voiceEnabled && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Speech Rate:</span>
              <span className="font-bold text-cyan-400">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        )}
      </div>

      {/* 4. Tech Stack Overview */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 text-sm font-bold text-white">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Technology Architecture Overview</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] text-slate-400">Frontend</p>
            <p className="font-bold text-cyan-300">React + Vite + Tailwind</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] text-slate-400">Charts & Maps</p>
            <p className="font-bold text-cyan-300">Recharts & Leaflet</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] text-slate-400">API Client</p>
            <p className="font-bold text-cyan-300">Axios Gateway</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] text-slate-400">AI Model</p>
            <p className="font-bold text-cyan-300">Grounded LLM RAG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
