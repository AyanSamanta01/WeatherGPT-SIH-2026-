import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  CloudSun, 
  CalendarDays, 
  Map, 
  ShieldAlert, 
  LineChart, 
  Bot, 
  Settings, 
  Activity, 
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/current', label: 'Live Telemetry', icon: CloudSun, badge: 'Live' },
  { path: '/forecast', label: '7-Day NWP Forecast', icon: CalendarDays, badge: 'WRF' },
  { path: '/map', label: 'GIS Disaster Map', icon: Map, badge: 'GeoJSON' },
  { path: '/alerts', label: 'Active Warnings', icon: ShieldAlert, badge: 'CAP 1.2' },
  { path: '/analytics', label: 'Climate Analytics', icon: LineChart, badge: 'Decadal' },
  { path: '/chat', label: 'WeatherGPT AI', icon: Bot, badge: 'Offline ML', highlight: true },
  { path: '/settings', label: 'Preferences & Farms', icon: Settings }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { emergencyAlert, alertsList } = useApp();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between pt-16 lg:pt-0 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top Header on Sidebar for Desktop */}
        <div className="p-5 border-b border-slate-800/80 hidden lg:flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-wide">
              WeatherGPT Hub
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Local ML Engine Ready</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Meteorology & Disaster Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/current' && location.pathname === '/');
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm font-bold'
                    : item.highlight
                    ? 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-tight ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.path === '/alerts' && alertsList?.length > 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {item.path === '/alerts' ? `${alertsList?.length || 0} Alerts` : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom System Status Widget */}
        <div className="p-4 m-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Inference Node</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Port 8000</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            XGBoost & LightGBM trained on IMD historical grids operating in offline edge mode.
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
