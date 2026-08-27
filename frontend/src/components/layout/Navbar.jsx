import React, { useState, useRef, useEffect } from 'react';
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
  Thermometer,
  Navigation,
  Loader
} from 'lucide-react';

import { openMeteoService } from '../../services/openMeteoService';

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
    setActiveScreen,
    alertsList,
    detectCurrentLocation,
    isLocating
  } = useApp();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const cityRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  // Live Open-Meteo Geocoding Search
  useEffect(() => {
    if (!searchFilter || searchFilter.trim().length < 2) {
      setLiveResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await openMeteoService.searchCity(searchFilter);
        setLiveResults(results || []);
      } catch (_) {
        setLiveResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  const filteredCities = (availableCities || []).filter(c => 
    c.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityDropdownOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const alertCount = alertsList?.length || 0;

  return (
    <header
      className="sticky top-0 z-40 px-4 lg:px-6 py-3 transition-all duration-300"
      style={{
        background: 'rgba(4, 10, 24, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.08)',
        boxShadow: '0 1px 40px rgba(0,0,0,0.4)'
      }}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu + Brand */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl transition-all duration-200"
              style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.15)' }}
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          )}

          <div
            onClick={() => setActiveScreen('current')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 60%, #6366f1 100%)',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
              }}
            >
              <CloudSun className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
                  Weather<span className="text-cyan-400">GPT</span>
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-md font-black tracking-widest text-cyan-300 hidden sm:block"
                  style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
                >
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block">
                MoES · IMD Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: City Selector & GPS Geolocation */}
        <div className="flex items-center space-x-1.5" ref={cityRef}>
          <div className="relative">
            <button
              onClick={() => { setCityDropdownOpen(!cityDropdownOpen); setLangDropdownOpen(false); setProfileDropdownOpen(false); }}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 transition-all duration-200"
              style={{
                background: 'rgba(10, 20, 40, 0.8)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="max-w-[100px] sm:max-w-none truncate">{selectedCity}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

          {cityDropdownOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl p-2 z-50 animate-fade-in-up"
              style={{
                background: 'rgba(5, 12, 28, 0.98)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(6,182,212,0.05)',
                backdropFilter: 'blur(24px)'
              }}
            >
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Indian cities..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(10, 20, 40, 0.9)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                  }}
                  autoFocus
                />
              </div>
              <div className="max-h-52 overflow-y-auto space-y-0.5 no-scrollbar">
                {isSearching && (
                  <div className="flex items-center justify-center py-4 text-slate-400 space-x-2 text-xs">
                    <Loader className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>Searching locations...</span>
                  </div>
                )}

                {/* Live Geocoded City Results from Open-Meteo */}
                {!isSearching && liveResults.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">Live Search Results</div>
                    {liveResults.map((r, idx) => (
                      <button
                        key={`${r.name}-${r.lat}-${idx}`}
                        onClick={() => {
                          changeCity({ lat: r.lat, lon: r.lon, cityName: r.name, stateName: r.state });
                          setCityDropdownOpen(false);
                          setSearchFilter('');
                          setLiveResults([]);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <div>
                            <span className="font-semibold text-white">{r.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">{r.state ? `${r.state}, ` : ''}{r.country}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Standard Regional Indian Cities */}
                {!isSearching && liveResults.length === 0 && filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      changeCity(city);
                      setCityDropdownOpen(false);
                      setSearchFilter('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-150"
                    style={city === selectedCity ? {
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      color: '#67e8f9'
                    } : {
                      color: '#94a3b8'
                    }}
                    onMouseEnter={e => { if (city !== selectedCity) e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { if (city !== selectedCity) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#94a3b8'; } }}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-cyan-500 opacity-60" />
                      <span>{city}</span>
                    </div>
                    {city === selectedCity && <span className="text-[9px] font-bold text-cyan-400 tracking-wider">ACTIVE</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={detectCurrentLocation}
            disabled={isLocating}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 transition-all duration-200"
            style={{
              background: 'rgba(10, 20, 40, 0.8)',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              backdropFilter: 'blur(12px)'
            }}
            title="Auto-Detect My GPS Location"
          >
            {isLocating ? (
              <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Temp Toggle */}
          <div
            className="hidden sm:flex items-center p-0.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(10, 20, 40, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)' }}
          >
            {['C', 'F'].map(u => (
              <button
                key={u}
                onClick={() => setTempUnit(u)}
                className="px-2.5 py-1.5 rounded-[10px] transition-all duration-200"
                style={tempUnit === u ? {
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.4)'
                } : { color: '#64748b' }}
              >
                °{u}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangDropdownOpen(!langDropdownOpen); setCityDropdownOpen(false); setProfileDropdownOpen(false); }}
              className="flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs transition-all duration-200"
              style={{
                background: 'rgba(10, 20, 40, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#94a3b8'
              }}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold hidden sm:inline text-slate-300">{language.slice(0, 3)}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl p-1.5 z-50 animate-fade-in-up"
                style={{
                  background: 'rgba(5, 12, 28, 0.98)',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(24px)'
                }}
              >
                <div className="text-[9px] font-bold text-slate-500 px-2 py-1.5 uppercase tracking-widest">Regional Languages</div>
                {supportedLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.name); setLangDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all duration-150"
                    style={language === l.name ? {
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#67e8f9'
                    } : { color: '#64748b' }}
                  >
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-[10px] opacity-60">{l.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all duration-200 group"
            style={{
              background: 'rgba(10, 20, 40, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark'
              ? <Moon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              : <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
            }
          </button>

          {/* Alert Bell */}
          <button
            onClick={() => setActiveScreen('alerts')}
            className="relative p-2 rounded-xl transition-all duration-200"
            style={{
              background: alertCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(10, 20, 40, 0.8)',
              border: alertCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(51, 65, 85, 0.6)'
            }}
          >
            <Bell className={`w-4 h-4 ${alertCount > 0 ? 'text-red-400' : 'text-slate-400'}`} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setCityDropdownOpen(false); setLangDropdownOpen(false); }}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(10, 20, 40, 0.8)',
                border: '1px solid rgba(6, 182, 212, 0.12)'
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-[11px] font-bold text-white truncate max-w-[90px]">{user?.name || 'Officer'}</div>
                <div className="text-[9px] text-cyan-400 font-semibold">{user?.role || 'Met Lead'}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 animate-fade-in-up"
                style={{
                  background: 'rgba(5, 12, 28, 0.98)',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(24px)'
                }}
              >
                <div
                  className="px-3 py-3 rounded-xl mb-1"
                  style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.1)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white mb-2"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="text-xs font-bold text-white">{user?.name || 'Ayan Samanta'}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'user@weathergpt.gov.in'}</div>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md"
                    style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#67e8f9' }}
                  >
                    {user?.role || 'Meteorology Lead'}
                  </span>
                </div>

                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => { setActiveScreen('settings'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white flex items-center space-x-2.5 transition-all duration-150"
                    style={{ hover: { background: 'rgba(30, 41, 59, 0.6)' } }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => { logout(); setActiveScreen('login'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 flex items-center space-x-2.5 transition-all duration-150"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
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
