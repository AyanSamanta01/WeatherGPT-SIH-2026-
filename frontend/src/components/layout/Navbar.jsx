import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  CloudRain, 
  Globe, 
  Thermometer, 
  ChevronDown, 
  Check, 
  Bell, 
  LogOut, 
  Settings, 
  Sun, 
  Menu, 
  Wind, 
  Droplets,
  MapPin,
  Sliders
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { 
    selectedCity, 
    tempUnit, 
    setTempUnit, 
    formatTemp,
    weatherData,
    user, 
    logoutUser,
    SUPPORTED_LANGUAGES,
    language,
    setLanguage,
    activeAlertsList
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const langContainerRef = useRef(null);
  const profileContainerRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl relative select-none">
      {/* Top Animated Liquid Aura Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-pulse pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. VERY LEFT: HAMBURGER TOGGLE BUTTON & BRAND LOGO                        */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* 🍔 Very Left Hamburger Icon to Toggle Left Navbar / Sidebar */}
        <button 
          onClick={onToggleSidebar}
          type="button"
          title="Toggle Navigation Menu"
          className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 hover:bg-cyan-500/20 border border-slate-700/80 hover:border-cyan-400/80 focus:outline-none transition-all duration-200 shadow-sm cursor-pointer active:scale-95 flex items-center justify-center group"
        >
          <Menu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Brand Logo */}
        <NavLink 
          to="/chat"
          className="flex items-center space-x-2.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 border border-white/20">
            <CloudRain className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                Weather<span className="text-cyan-400">GPT</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full shadow-sm">
                SIH 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Conversational AI & GIS Warning</p>
          </div>
        </NavLink>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER: LIVE TELEMETRY HUD CAPSULE (Aligned to Nav Middle)             */}
      {/* ========================================================================= */}
      {weatherData && (
        <NavLink 
          to="/current"
          className="hidden md:flex items-center space-x-3 px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-white/15 hover:border-cyan-500/50 transition-all duration-300 group shadow-lg shadow-cyan-950/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
            <span>{selectedCity}</span>
          </div>
          
          <div className="h-3 w-[1px] bg-slate-700" />
          
          <div className="flex items-center space-x-1 text-xs font-extrabold text-cyan-300">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTemp(weatherData.current?.temp ?? 28)}</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-700" />

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>{weatherData.current?.humidity ?? 78}%</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-700" />

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-300">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>{weatherData.current?.windSpeed ?? 14} km/h</span>
          </div>
        </NavLink>
      )}

      {/* ========================================================================= */}
      {/* 3. RIGHT: MULTILINGUAL, TEMP SWITCHER, SIREN ALERTS & USER PROFILE         */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* 🌐 Multilingual Dropdown */}
        <div ref={langContainerRef} className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/70 hover:border-cyan-400/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition shadow-sm"
            title="Switch Regional Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-medium">{language}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                8 Regional Indian Languages
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.name);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs transition ${
                    language === lang.name 
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold leading-tight">{lang.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{lang.native}</p>
                  </div>
                  {language === lang.name && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🌡️ Dynamic Temperature Switcher Pill */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/70 p-0.5 rounded-xl">
          <button
            onClick={() => setTempUnit('C')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
              tempUnit === 'C'
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setTempUnit('F')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
              tempUnit === 'F'
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            °F
          </button>
        </div>

        {/* 🚨 Severe Alert Shortcut Link */}
        <NavLink
          to="/alerts"
          className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-200 hover:text-red-400 hover:border-red-500/60 transition group shadow-sm"
          title={`${activeAlertsList.length} Active Weather Alerts`}
        >
          <Bell className="w-4 h-4 group-hover:animate-bounce" />
          {activeAlertsList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse shadow-md shadow-red-500/50">
              {activeAlertsList.length}
            </span>
          )}
        </NavLink>

        {/* 👤 User Profile Capsule with Interactive Dropdown (Settings & Locations inside) */}
        {user?.isLoggedIn ? (
          <div ref={profileContainerRef} className="relative">
            <div 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/70 hover:border-cyan-400/80 rounded-xl p-1 sm:pr-3 cursor-pointer transition shadow-sm select-none"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">{user.name}</p>
                <p className="text-[9px] text-cyan-400 font-semibold leading-none">{user.role || 'Scientist'}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </div>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="p-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                    {user.role || 'Meteorologist'}
                  </span>
                </div>

                {/* ⚙️ Settings & Preferences */}
                <NavLink
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full px-2.5 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition group"
                >
                  <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white">Settings & Preferences</p>
                    <p className="text-[10px] text-slate-400 font-normal">Language, Voice STT/TTS</p>
                  </div>
                </NavLink>


                {/* ☀️ Atmospheric Telemetry */}
                <NavLink
                  to="/current"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full px-2.5 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition group"
                >
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white">Atmospheric Telemetry</p>
                    <p className="text-[10px] text-slate-400 font-normal">Live sensor diagnostics</p>
                  </div>
                </NavLink>

                {/* 🌓 Dark / Light Theme Mode Toggle Button */}
                <div className="px-2.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                    {theme === 'light' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>Theme Mode</span>
                  </div>
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`px-2 py-0.5 rounded-md transition flex items-center space-x-1 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-2.5 h-2.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`px-2 py-0.5 rounded-md transition flex items-center space-x-1 cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-2.5 h-2.5" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                {/* 🚪 Sign Out */}
                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logoutUser();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to="/login"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:brightness-110 transition"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Navbar;
