import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Waves, 
  Wind, 
  ExternalLink,
  Volume2,
  Sparkles
} from 'lucide-react';

const AlertsPage = () => {
  const { alertsList, triggerSimulatedAlert, speakText, setActiveScreen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAlerts = (alertsList || []).filter(alert => {
    if (selectedCategory === 'all') return true;
    return alert.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              National Disaster Warning Bulletins
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              CAP 1.2 Protocol Feeds
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official early warnings verified by IMD, NDMA, and State Disaster Management Authorities (SDMA).
          </p>
        </div>

        {/* Live Simulation Button */}
        <button
          onClick={() => triggerSimulatedAlert()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-red-600/30 transition transform active:scale-95"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Simulate Emergency Siren</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['all', 'cyclone', 'thunderstorm', 'heatwave', 'flood'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition flex-shrink-0 ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {cat === 'all' ? 'All Bulletins' : cat}
          </button>
        ))}
      </div>

      {/* Active Bulletins Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bulletins List Column */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAlerts.map((alert) => {
            const isExtreme = alert.severity?.toLowerCase() === 'extreme';
            const isSevere = alert.severity?.toLowerCase() === 'severe';

            return (
              <div 
                key={alert.id}
                className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 shadow-xl space-y-4 ${
                  isExtreme
                    ? 'bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-900/90 border-red-500/40 hover:border-red-500'
                    : isSevere
                    ? 'bg-gradient-to-br from-orange-950/40 via-slate-900/90 to-slate-900/90 border-orange-500/40 hover:border-orange-500'
                    : 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-900/90 border-amber-500/40 hover:border-amber-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isExtreme ? 'bg-red-500 text-white animate-pulse' : isSevere ? 'bg-orange-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {alert.severity} Alert
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Ref: {alert.id}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {alert.issuedAt || 'Just now'}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {alert.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {alert.summary || alert.description}
                  </p>
                </div>

                {/* Affected Locations */}
                {alert.affectedRegions && alert.affectedRegions.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-400">Target Zones:</span>
                    <span className="font-medium text-white">{alert.affectedRegions.join(', ')}</span>
                  </div>
                )}

                {/* Advisories Checklist */}
                {alert.advisories && alert.advisories.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Standard Operating Procedures (SOP)
                    </div>
                    <ul className="space-y-1.5">
                      {alert.advisories.map((adv, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Issued By: <span className="text-slate-200 font-semibold">{alert.issuedBy || 'IMD Emergency Centre'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => speakText(`Warning: ${alert.title}. ${alert.summary || ''}`)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold flex items-center space-x-1 transition"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActiveScreen('map')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <span>GIS Danger Map</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Safety Protocol Guidelines Column */}
        <div className="space-y-4">
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Disaster Response Checklist</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cyclone & Floods</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Disconnect electrical mains. Move essential supplies and livestock to elevated RCC shelters.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  <span>Squalls & Lightning</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Do not shelter under isolated trees or tin sheds. Suspend open field tractor operations immediately.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Heatwave Action</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Consume ORS electrolyte solutions. Mulch farm soil to prevent root temperature spikes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveScreen('chat')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Custom Safety Plan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlertsPage;
