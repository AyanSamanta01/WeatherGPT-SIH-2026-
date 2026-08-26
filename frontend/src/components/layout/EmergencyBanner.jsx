import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowRight, 
  Radio, 
  MapPin, 
  Sparkles,
  AlertTriangle,
  Flame,
  Waves
} from 'lucide-react';

const EmergencyBanner = () => {
  const { 
    emergencyAlert, 
    dismissEmergencyAlert, 
    triggerSimulatedAlert, 
    setActiveScreen,
    voiceEnabled 
  } = useApp();

  const [soundMuted, setSoundMuted] = useState(false);

  if (!emergencyAlert) {
    return (
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-300">National Early Warning Broadcast System:</span>
          <span>IMD & NDMA CAP 1.2 Feeds Active</span>
        </div>
        <button
          onClick={() => triggerSimulatedAlert()}
          className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[11px] font-semibold transition"
          title="Simulate Live Disaster Broadcast for Jury Demo"
        >
          <Radio className="w-3 h-3 text-red-400 animate-pulse" />
          <span>Simulate Emergency Siren</span>
        </button>
      </div>
    );
  }

  const isExtreme = emergencyAlert.severity === 'extreme' || emergencyAlert.severity === 'Extreme';

  return (
    <div className={`relative z-50 border-b px-4 py-3 sm:px-6 transition-all duration-500 shadow-2xl ${
      isExtreme 
        ? 'bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-red-500 text-white' 
        : 'bg-gradient-to-r from-amber-950 via-orange-900 to-amber-950 border-amber-500 text-white'
    }`}>
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Siren Icon & Alert Headline */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-red-600 text-white animate-bounce shadow-lg shadow-red-600/50 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-red-500 text-white rounded-full animate-pulse">
                CRITICAL WARNING
              </span>
              <span className="text-xs font-bold text-red-200">
                CAP 1.2 Official Bulletin • {emergencyAlert.issuedBy || 'IMD Emergency Response'}
              </span>
              <span className="text-[11px] text-red-300/80">
                Ref: {emergencyAlert.id || 'NDMA-EMERGENCY'}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
              {emergencyAlert.title}
            </h2>

            <p className="text-xs text-red-100/90 leading-snug line-clamp-2 md:line-clamp-none">
              {emergencyAlert.summary || emergencyAlert.description}
            </p>

            {emergencyAlert.affectedRegions && emergencyAlert.affectedRegions.length > 0 && (
              <div className="flex items-center space-x-1.5 text-[11px] text-red-200 pt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-red-300" />
                <span className="font-semibold">Affected Zones:</span>
                <span className="truncate">{emergencyAlert.affectedRegions.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-shrink-0">
          <button
            onClick={() => setActiveScreen('map')}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-xs font-bold text-white transition flex items-center space-x-1.5 shadow"
          >
            <span>GIS Danger Zones</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => setActiveScreen('alerts')}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30"
          >
            Safety Protocols
          </button>

          <button
            onClick={dismissEmergencyAlert}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Acknowledge and Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
