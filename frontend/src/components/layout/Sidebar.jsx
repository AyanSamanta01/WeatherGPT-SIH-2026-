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
  Sparkles,
  X,
  Compass,
  Zap,
  Activity
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeScreen, setActiveScreen, user, logoutUser, activeAlertsList } = useApp();

  const navigationItems = [
    { id: 'current', label: 'Current Telemetry', icon: SunMedium, tagColor: 'amber' },
    { id: 'forecast', label: 'NWP 7-Day Outlook', icon: CalendarDays, tagColor: 'blue' },
    { id: 'map', label: 'GIS Disaster Map', icon: Map, badge: 'GeoJSON', tagColor: 'emerald' },
    { 
      id: 'alerts', 
      label: 'Severe Warnings', 
      icon: AlertTriangle, 
      alertBadge: activeAlertsList.length > 0 ? `${activeAlertsList.length} Active` : null,
      tagColor: 'rose'
    },
    { id: 'analytics', label: 'Climate Diagnostics', icon: LineChart, tagColor: 'purple' },
  ];

  const handleNavClick = (screenId) => {
    setActiveScreen(screenId);
    // Keep sidebar persistent across navigation
  };

  return (
    <>
      {/* Dim Frosted Backdrop when Open on Mobile/Tablet */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ========================================================================= */}
      {/* 🌊 3D DYNAMIC LIQUID SIDEBAR CONTAINER (Sticky below Navbar on Scroll)     */}
      {/* ========================================================================= */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-20 bottom-0 left-0 z-50 lg:z-30 w-72 h-auto max-h-[calc(100vh-5.5rem)] liquid-sidebar rounded-r-3xl lg:rounded-3xl flex flex-col justify-between p-4 sm:p-5 overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform select-none ${
          isOpen 
            ? 'translate-x-0 opacity-100 shadow-2xl' 
            : '-translate-x-full lg:w-0 lg:p-0 lg:border-0 lg:overflow-hidden lg:opacity-0 pointer-events-none'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 🌊 Background Ambient Liquid Morphing Blobs inside Sidebar */}
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-gradient-to-tr from-cyan-500/25 to-blue-600/20 rounded-full blur-2xl animate-liquid-1 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-gradient-to-br from-rose-500/20 to-purple-600/20 rounded-full blur-2xl animate-liquid-2 pointer-events-none" />

        {/* Specular Liquid Glare Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

        {/* Main Content Area */}
        <div className="relative z-10 space-y-5">
          
          {/* 1. Header with Title and Close Button (Top-to-Bottom Cascading Item 0) */}
          <div 
            className={`flex items-center justify-between pb-3.5 border-b border-white/10 ${
              isOpen ? 'animate-cascade-item' : ''
            }`}
            style={{ animationDelay: '50ms' }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 border border-white/20">
                <Compass className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white">Weather Hub</span>
                <p className="text-[10px] text-cyan-400 font-semibold leading-none">Intelligence Grid</p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition active:scale-90"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Intelligence Modules Category Header (Cascading Item 1) */}
          <div 
            className={`flex items-center justify-between px-2 ${
              isOpen ? 'animate-cascade-item' : ''
            }`}
            style={{ animationDelay: '100ms' }}
          >
            <p className="text-[10px] uppercase font-black tracking-widest text-cyan-400/90 flex items-center space-x-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Intelligence Modules</span>
            </p>
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-white/10 text-slate-300 rounded-md border border-white/10">
              5 Active
            </span>
          </div>

          {/* 3. Navigation Items List (Cascading Items 2 to 8 with Staggered Top-to-Bottom Delays) */}
          <div className="space-y-1.5">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              const delay = 130 + idx * 45; // Staggered top-to-bottom entrance delay

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{ animationDelay: `${delay}ms` }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 group ${
                    isOpen ? 'animate-cascade-item' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-blue-600/15 text-cyan-200 border border-cyan-400/60 shadow-[0_4px_20px_-2px_rgba(6,182,212,0.35)] scale-[1.02]'
                      : 'text-slate-300 hover:text-white bg-slate-900/40 hover:bg-white/10 border border-white/5 hover:border-white/20 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/40 border border-white/30' 
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 border border-white/5'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                        {item.badge}
                      </span>
                    )}

                    {item.alertBadge && (
                      <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-md shadow-rose-500/50">
                        {item.alertBadge}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Footer Section (Cascading Item 9) */}
        <div 
          className={`relative z-10 space-y-3 pt-4 border-t border-white/10 ${
            isOpen ? 'animate-cascade-item' : ''
          }`}
          style={{ animationDelay: '480ms' }}
        >
          {/* 3D Liquid SIH Badge Capsule */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/30 text-left shadow-lg shadow-cyan-950/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
              <span>SIH 2026 Problem #26068</span>
            </div>
            <p className="text-[10.5px] text-slate-300/80 leading-snug">
              Ministry of Earth Sciences / IMD
            </p>
          </div>

          {/* User Auth Action */}
          {user.isLoggedIn ? (
            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600/30 border border-rose-500/30 transition shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.name ? user.name.split(' ')[0] : 'User'})</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:brightness-110 shadow-lg shadow-cyan-500/25 transition active:scale-95"
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
