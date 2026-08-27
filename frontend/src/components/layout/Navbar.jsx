import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CloudRain, 
  Search, 
  MapPin, 
  Mic, 
  User, 
  Bell, 
  Menu, 
  X, 
  Sparkles,
  Globe,
  Thermometer
} from 'lucide-react';

const Navbar = ({ onOpenMobileMenu }) => {
  const { 
    selectedCity, 
    setSelectedCity, 
    tempUnit, 
    setTempUnit, 
    user, 
    setActiveScreen, 
    INDIAN_CITIES,
    language,
    setLanguage
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = INDIAN_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand & SIH Badge */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div 
          onClick={() => setActiveScreen('chat')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
            <CloudRain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                Weather<span className="text-cyan-400">GPT</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Conversational AI for Climate & Forecasts</p>
          </div>
        </div>
      </div>

      {/* Center: City Selector & Search Bar */}
      <div className="hidden md:flex items-center space-x-3 relative">
        <div className="relative">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all w-64">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search Indian city..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none w-full text-xs font-medium"
            />
            {searchQuery && (
              <X 
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" 
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }} 
              />
            )}
          </div>

          {/* City Dropdown Menu */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Location
              </div>
              {filteredCities.map((city) => (
                <div
                  key={city.name}
                  onClick={() => {
                    setSelectedCity(city.name);
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className={`px-3 py-2 flex items-center justify-between hover:bg-cyan-950/50 cursor-pointer text-xs transition-colors ${
                    selectedCity === city.name ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {city.name}
                  </span>
                  <span className="text-[10px] text-slate-500">{city.state}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Temp Unit, Language, Alerts & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Temp Unit Switcher */}
        <button
          onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
          className="flex items-center space-x-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition"
          title="Toggle Unit (°C / °F)"
        >
          <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          <span>°{tempUnit}</span>
        </button>

        {/* Quick Alerts Notification Icon */}
        <button
          onClick={() => setActiveScreen('alerts')}
          className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition"
          title="Severe Weather Warnings"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Account / Login */}
        {user.isLoggedIn ? (
          <div 
            onClick={() => setActiveScreen('settings')}
            className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-1.5 cursor-pointer hover:border-cyan-500/50 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 leading-none">IMD Analyst</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveScreen('auth')}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
