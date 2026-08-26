import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CloudSun, 
  MapPin, 
  Globe, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Bell, 
  ChevronDown, 
  Search,
  Sparkles,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { 
    selectedCity, 
    changeCity, 
    availableCities, 
    tempUnit, 
    setTempUnit, 
    language, 
    setLanguage, 
    supportedLanguages, 
    theme, 
    toggleTheme, 
    user, 
    logout,
    emergencyAlert,
    setActiveScreen
  } = useApp();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCities = (availableCities || []).filter(c => 
    c.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => setActiveScreen('current')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition transform">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-cyan-400 transition">
                  Weather<span className="text-cyan-400">GPT</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                MoES • IMD Intelligent Forecasting Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: City Selector with Search Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition shadow-sm text-sm"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">{selectedCity}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Indian Cities..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      changeCity(city);
                      setCityDropdownOpen(false);
                      setSearchFilter('');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      city === selectedCity
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{city}</span>
                    {city === selectedCity && <span className="text-[10px] text-cyan-400">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Temp Switch, Language Picker, Theme, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Temperature Unit Toggle (°C / °F) */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2 py-0.5 rounded-lg transition ${
                tempUnit === 'C' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2 py-0.5 rounded-lg transition ${
                tempUnit === 'F' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold hidden sm:inline">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Regional Languages
                </div>
                {supportedLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.name);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      language === l.name
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{l.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white truncate max-w-[100px]">
                  {user?.name || 'Ayan Samanta'}
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  {user?.role || 'Lead Officer'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white">{user?.name || 'Ayan Samanta'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'user@weathergpt.gov.in'}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {user?.role || 'Meteorology Lead'}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setActiveScreen('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2 transition"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setActiveScreen('login');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
