import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, ArrowRight, Radio, MapPin } from 'lucide-react';

const EmergencyBanner = () => {
  const { emergencyAlert, dismissEmergencyAlert, triggerSimulatedAlert, setActiveScreen } = useApp();

  if (!emergencyAlert) {
    return (
      <div
        className="px-4 py-2 flex items-center justify-between text-xs"
        style={{
          background: 'rgba(4, 10, 24, 0.9)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.08)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center space-x-3 text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-slate-400">National Early Warning System</span>
          </div>
          <span className="hidden sm:inline">IMD · NDMA CAP 1.2 Feeds Active · All India Weather Services Online</span>
        </div>

        <button
          onClick={() => triggerSimulatedAlert()}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all duration-200"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          title="Simulate Live Disaster Broadcast for Demo"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Simulate Siren</span>
        </button>
      </div>
    );
  }

  const isExtreme = ['extreme', 'Extreme'].includes(emergencyAlert.severity);

  return (
    <div
      className="relative z-50 px-4 py-3 sm:px-6 transition-all duration-500"
      style={{
        background: isExtreme
          ? 'linear-gradient(90deg, #1a0505 0%, #2d0808 50%, #1a0505 100%)'
          : 'linear-gradient(90deg, #1a1000 0%, #2d1a00 50%, #1a1000 100%)',
        borderBottom: isExtreme ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(249, 115, 22, 0.4)',
        boxShadow: isExtreme
          ? '0 4px 32px rgba(239, 68, 68, 0.2)'
          : '0 4px 32px rgba(249, 115, 22, 0.15)'
      }}
    >
      {/* Animated scan line */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: 0.3 }}
      >
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            background: isExtreme ? '#ef4444' : '#f97316',
            animation: 'scanLine 4s linear infinite'
          }}
        />
      </div>

      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
        {/* Left Content */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-xl flex-shrink-0 animate-bounce"
            style={{
              background: isExtreme ? '#ef4444' : '#f97316',
              boxShadow: isExtreme ? '0 4px 16px rgba(239, 68, 68, 0.5)' : '0 4px 16px rgba(249, 115, 22, 0.4)'
            }}
          >
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                style={{
                  background: isExtreme ? '#ef4444' : '#f97316',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                ⚠ Critical Warning
              </span>
              <span className="text-[11px] font-semibold" style={{ color: isExtreme ? '#fca5a5' : '#fed7aa' }}>
                {emergencyAlert.issuedBy || 'IMD Emergency Response'} · Ref: {emergencyAlert.id || 'NDMA-EMERGENCY'}
              </span>
            </div>

            <h2 className="text-sm font-black text-white leading-tight">{emergencyAlert.title}</h2>

            <p className="text-xs leading-snug line-clamp-2 md:line-clamp-none" style={{ color: isExtreme ? 'rgba(254, 202, 202, 0.85)' : 'rgba(254, 215, 170, 0.85)' }}>
              {emergencyAlert.summary || emergencyAlert.description}
            </p>

            {emergencyAlert.affectedRegions?.length > 0 && (
              <div className="flex items-center space-x-1.5 text-[11px]" style={{ color: isExtreme ? '#fca5a5' : '#fed7aa' }}>
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="font-semibold">Zones: </span>
                <span className="truncate">{emergencyAlert.affectedRegions.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setActiveScreen('map')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 transition-all duration-200"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          >
            <span>GIS Zones</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>

          <button
            onClick={() => setActiveScreen('alerts')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200"
            style={{
              background: isExtreme ? '#ef4444' : '#f97316',
              boxShadow: isExtreme ? '0 2px 12px rgba(239, 68, 68, 0.4)' : '0 2px 12px rgba(249, 115, 22, 0.35)'
            }}
          >
            Protocols
          </button>

          <button
            onClick={dismissEmergencyAlert}
            className="p-1.5 rounded-xl transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            title="Acknowledge and Dismiss"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
