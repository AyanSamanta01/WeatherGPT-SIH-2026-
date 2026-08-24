import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  SunMedium, 
  CalendarDays, 
  Map, 
  AlertTriangle, 
  LineChart, 
  Settings, 
  LogIn,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeScreen, setActiveScreen, user, logoutUser } = useApp();

  const navigationItems = [
    { id: 'chat', label: 'WeatherGPT Chat', icon: Bot, badge: 'AI Powered', highlight: true },
    { id: 'current', label: 'Current Weather', icon: SunMedium },
    { id: 'forecast', label: 'Forecast & Trends', icon: CalendarDays },
    { id: 'map', label: 'Interactive Map', icon: Map, badge: 'GIS' },
    { id: 'alerts', label: 'Severe Warnings', icon: AlertTriangle, alertBadge: '3 Active' },
    { id: 'analytics', label: 'Climate Analytics', icon: LineChart },
    { id: 'settings', label: 'App Settings', icon: Settings },
  ];

  const handleNavClick = (screenId) => {
    setActiveScreen(screenId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Overlay for mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Items */}
        <div className="space-y-6">
          {/* Header Mobile Only */}
          <div className="flex items-center justify-between pb-3 lg:hidden border-b border-slate-800">
            <span className="font-bold text-lg text-cyan-400">WeatherGPT Navigation</span>
            <button onClick={onCloseMobile} className="text-slate-400 hover:text-white text-xs">Close ✕</button>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Main Dashboard
            </p>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-cyan-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded">
                        {item.badge}
                      </span>
                    )}

                    {item.alertBadge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 rounded animate-pulse">
                        {item.alertBadge}
                      </span>
                    )}

                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info & Auth toggle */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          {/* SIH Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/20 text-left">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH26068 Edition</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Ministry of Earth Sciences / India Meteorological Dept
            </p>
          </div>

          {/* Auth Button */}
          {user.isLoggedIn ? (
            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout ({user.name.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
