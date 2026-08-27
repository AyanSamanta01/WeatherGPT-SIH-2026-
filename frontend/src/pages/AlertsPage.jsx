import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Waves, 
  Wind, 
  Volume2, 
  Sparkles,
  AlertTriangle,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';

const SEVERITY_CONFIG = {
  extreme: {
    bg: 'linear-gradient(135deg, rgba(35, 5, 5, 0.95) 0%, rgba(5, 12, 28, 0.97) 100%)',
    border: 'rgba(239, 68, 68, 0.35)',
    badgeBg: '#ef4444',
    badgeText: '#fff',
    glowColor: 'rgba(239, 68, 68, 0.08)',
    icon: AlertTriangle
  },
  severe: {
    bg: 'linear-gradient(135deg, rgba(35, 15, 5, 0.95) 0%, rgba(5, 12, 28, 0.97) 100%)',
    border: 'rgba(249, 115, 22, 0.3)',
    badgeBg: '#f97316',
    badgeText: '#fff',
    glowColor: 'rgba(249, 115, 22, 0.06)',
    icon: AlertTriangle
  },
  moderate: {
    bg: 'linear-gradient(135deg, rgba(35, 28, 5, 0.95) 0%, rgba(5, 12, 28, 0.97) 100%)',
    border: 'rgba(234, 179, 8, 0.3)',
    badgeBg: '#eab308',
    badgeText: '#0f172a',
    glowColor: 'rgba(234, 179, 8, 0.05)',
    icon: AlertTriangle
  }
};

const AlertsPage = () => {
  const { alertsList, triggerSimulatedAlert, speakText, setActiveScreen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedAlert, setExpandedAlert] = useState(null);

  const filteredAlerts = (alertsList || []).filter(alert => {
    if (selectedCategory === 'all') return true;
    return alert.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = ['all', 'cyclone', 'thunderstorm', 'heatwave', 'flood'];
  const catCounts = {};
  (alertsList || []).forEach(a => {
    const c = a.category?.toLowerCase() || 'other';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              National Warning Bulletins
            </h1>
            <span className="badge-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>CAP 1.2</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official early warnings verified by IMD, NDMA, and State Disaster Management Authorities (SDMA)
          </p>
        </div>

        <button
          onClick={() => triggerSimulatedAlert()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black text-white flex-shrink-0 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.35)'}
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Simulate Emergency Siren</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const count = cat === 'all' ? (alertsList || []).length : (catCounts[cat] || 0);
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize flex-shrink-0 flex items-center space-x-2 transition-all duration-200"
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#67e8f9',
                boxShadow: '0 2px 12px rgba(6, 182, 212, 0.15)'
              } : {
                background: 'rgba(10, 20, 40, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#64748b'
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.8)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)'; } }}
            >
              <span>{cat === 'all' ? 'All Bulletins' : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                style={isActive ? {
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                } : {
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#475569'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bulletins Column */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div
              className="rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4"
              style={{
                background: 'rgba(5, 12, 28, 0.8)',
                border: '1px solid rgba(30, 41, 59, 0.8)',
                borderStyle: 'dashed'
              }}
            >
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <ShieldAlert className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">No Active Warnings</div>
                <div className="text-xs text-slate-500 mt-1">No {selectedCategory !== 'all' ? selectedCategory : ''} bulletins at this time.</div>
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const sev = alert.severity?.toLowerCase() || 'moderate';
              const config = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.moderate;
              const isExpanded = expandedAlert === alert.id;

              return (
                <div
                  key={alert.id}
                  className="rounded-3xl p-6 space-y-4 transition-all duration-300"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.border}`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 30px ${config.glowColor}`
                  }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          background: config.badgeBg,
                          color: config.badgeText,
                          animation: sev === 'extreme' ? 'pulse 2s infinite' : 'none'
                        }}
                      >
                        {alert.severity} Alert
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-medium">Ref: {alert.id}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{alert.issuedAt || 'Just now'}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h2 className="text-base font-black text-white leading-snug">{alert.title}</h2>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{alert.summary || alert.description}</p>
                  </div>

                  {/* Affected Regions */}
                  {alert.affectedRegions?.length > 0 && (
                    <div className="flex items-start space-x-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 font-semibold">Target Zones: </span>
                        <span className="text-slate-200 font-medium">{alert.affectedRegions.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {/* Advisories (expandable) */}
                  {alert.advisories?.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                        className="text-[11px] font-bold flex items-center space-x-1.5 transition-colors"
                        style={{ color: isExpanded ? '#67e8f9' : '#64748b' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Standard Operating Procedures ({alert.advisories.length})</span>
                        <ArrowRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div
                          className="mt-3 p-4 rounded-2xl space-y-2.5 animate-fade-in-up"
                          style={{
                            background: 'rgba(4, 10, 24, 0.7)',
                            border: '1px solid rgba(30, 41, 59, 0.8)'
                          }}
                        >
                          {alert.advisories.map((adv, i) => (
                            <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(30, 41, 59, 0.8)' }}
                  >
                    <div className="text-[11px] text-slate-500">
                      By: <span className="text-slate-300 font-semibold">{alert.issuedBy || 'IMD Emergency Centre'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => speakText(`Warning: ${alert.title}. ${alert.summary || ''}`)}
                        className="p-2 rounded-xl transition-all duration-200"
                        style={{
                          background: 'rgba(10, 20, 40, 0.8)',
                          border: '1px solid rgba(51, 65, 85, 0.6)',
                          color: '#67e8f9'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)'}
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setActiveScreen('map')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-1.5"
                        style={{
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          color: '#67e8f9'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.12)'}
                      >
                        <span>View GIS Map</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Protocol Column */}
        <div className="space-y-4">
          <div
            className="rounded-3xl p-6 space-y-5"
            style={{
              background: 'rgba(5, 12, 28, 0.95)',
              border: '1px solid rgba(30, 41, 59, 0.8)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex items-center space-x-2.5">
              <div
                className="p-2 rounded-xl"
                style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Disaster Response Checklist</div>
                <div className="text-[10px] text-slate-500">National DM Authority Protocols</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Waves, color: '#38bdf8', title: 'Cyclone & Floods', text: 'Disconnect electrical mains. Move supplies and livestock to elevated RCC shelters.' },
                { icon: Wind, color: '#fbbf24', title: 'Squalls & Lightning', text: 'Avoid isolated trees and metal sheds. Suspend open field tractor operations.' },
                { icon: Flame, color: '#fb7185', title: 'Heatwave Action', text: 'Consume ORS electrolyte solutions. Mulch farm soil to prevent root temperature spikes.' }
              ].map(({ icon: Icon, color, title, text }) => (
                <div
                  key={title}
                  className="p-4 rounded-2xl space-y-2 cursor-default"
                  style={{
                    background: 'rgba(10, 22, 42, 0.7)',
                    border: '1px solid rgba(30, 41, 59, 0.8)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)'; }}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span>{title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveScreen('chat')}
              className="w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all duration-200"
              style={{
                background: 'rgba(10, 22, 42, 0.8)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                color: '#67e8f9'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10, 22, 42, 0.8)'; e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)'; }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI for Custom Safety Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
