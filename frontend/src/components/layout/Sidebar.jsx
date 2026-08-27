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
  Cpu,
  Activity,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/current', label: 'Live Telemetry', icon: CloudSun, badge: 'AWS Live', color: 'cyan' },
  { path: '/forecast', label: '7-Day NWP Forecast', icon: CalendarDays, badge: 'WRF', color: 'blue' },
  { path: '/map', label: 'GIS Hazard Map', icon: Map, badge: 'GeoJSON', color: 'violet' },
  { path: '/alerts', label: 'Active Warnings', icon: ShieldAlert, badge: null, color: 'red', isAlert: true },
  { path: '/analytics', label: 'Climate Analytics', icon: LineChart, badge: 'Decadal', color: 'amber' },
  { path: '/chat', label: 'WeatherGPT AI', icon: Bot, badge: 'RAG+ML', color: 'cyan', highlight: true },
  { path: '/settings', label: 'Preferences', icon: Settings, color: 'slate' }
];

const COLOR_MAP = {
  cyan: { active: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#67e8f9', icon: '#06b6d4' },
  blue: { active: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#93c5fd', icon: '#3b82f6' },
  violet: { active: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', text: '#c4b5fd', icon: '#8b5cf6' },
  red: { active: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', text: '#fca5a5', icon: '#ef4444' },
  amber: { active: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', text: '#fcd34d', icon: '#f59e0b' },
  slate: { active: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', text: '#94a3b8', icon: '#64748b' }
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { alertsList } = useApp();
  const alertCount = alertsList?.length || 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(4, 10, 24, 0.85)', backdropFilter: 'blur(4px)' }}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col pt-16 lg:pt-0 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'rgba(4, 10, 24, 0.97)',
          borderRight: '1px solid rgba(6, 182, 212, 0.08)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)'
        }}
      >
        {/* Desktop Brand Header */}
        <div
          className="p-5 hidden lg:flex items-center space-x-3"
          style={{ borderBottom: '1px solid rgba(6, 182, 212, 0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wide" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
              WeatherGPT Hub
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ML Engine Online</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <div
            className="text-[9px] font-black uppercase tracking-widest px-3 pb-2"
            style={{ color: 'rgba(100, 116, 139, 0.7)' }}
          >
            Meteorology Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/current' && location.pathname === '/');
            const colors = COLOR_MAP[item.color] || COLOR_MAP.slate;
            const badgeText = item.isAlert ? (alertCount > 0 ? `${alertCount}` : '0') : item.badge;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative"
                style={isActive ? {
                  background: item.highlight
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : colors.active,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  boxShadow: `0 2px 12px ${colors.active}`
                } : {
                  color: '#64748b',
                  border: '1px solid transparent'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                    e.currentTarget.style.color = '#e2e8f0';
                    e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ color: isActive ? colors.icon : undefined }}
                  />
                  <span>{item.label}</span>
                </div>

                {badgeText && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-md font-black tracking-wider flex-shrink-0"
                    style={isActive ? {
                      background: `${colors.active}`,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    } : item.isAlert && alertCount > 0 ? {
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      animation: 'pulse 2s infinite'
                    } : {
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: '#475569',
                      border: '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    {item.isAlert ? (alertCount > 0 ? `${alertCount} Active` : 'None') : badgeText}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System Status Widget */}
        <div className="p-3">
          <div
            className="p-4 rounded-2xl space-y-3"
            style={{
              background: 'rgba(6, 182, 212, 0.04)',
              border: '1px solid rgba(6, 182, 212, 0.1)'
            }}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">ML Inference Node</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>:8000</span>
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '3px', background: 'rgba(30, 41, 59, 0.8)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '72%',
                  background: 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                }}
              />
            </div>
            <div className="text-[9px] text-slate-600 leading-relaxed">
              XGBoost + LightGBM — IMD historical grids — offline edge mode
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
