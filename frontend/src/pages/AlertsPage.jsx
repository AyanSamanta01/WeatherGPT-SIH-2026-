import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ALERTS } from '../data/mockData';
import { 
  AlertTriangle, 
  ShieldAlert, 
  BellRing, 
  CheckCircle, 
  MapPin, 
  Clock, 
  UserCheck, 
  Filter, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

const AlertsPage = () => {
  const { selectedCity, notificationsEnabled, setNotificationsEnabled } = useApp();
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredAlerts = MOCK_ALERTS.filter(alert => {
    if (severityFilter === 'All') return true;
    return alert.severity.toLowerCase() === severityFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>National Early Warning Dissemination System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Active Weather Warnings & Hazard Advisories
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time bulletins issued by India Meteorological Department (IMD) & State Disaster Management Authorities
          </p>
        </div>

        {/* Push Notification Setting Card */}
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Emergency Push Alerts</p>
            <p className="text-[10px] text-slate-400">Receive SMS / Web notifications</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {notificationsEnabled ? 'Subscribed' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Severity:
        </span>
        {['All', 'Extreme', 'Severe', 'Advisory'].map((level) => (
          <button
            key={level}
            onClick={() => setSeverityFilter(level)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              severityFilter === level
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {level} Warnings
          </button>
        ))}
      </div>

      {/* Warning Cards List */}
      <div className="space-y-6">
        {filteredAlerts.map((alert) => {
          const isRed = alert.color === 'red';
          const isOrange = alert.color === 'orange';

          return (
            <div
              key={alert.id}
              className={`glass-panel p-6 rounded-3xl border transition-all ${
                isRed 
                  ? 'border-red-500/50 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900 shadow-xl shadow-red-500/10' 
                  : isOrange 
                  ? 'border-orange-500/50 bg-gradient-to-r from-orange-950/20 via-slate-900 to-slate-900 shadow-xl shadow-orange-500/10'
                  : 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
              }`}
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      isRed ? 'bg-red-500 text-white' : isOrange ? 'bg-orange-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {alert.severity} Level
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Ref: {alert.id}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Issued: {alert.issuedAt}</span>
                  </div>
                </div>

                {/* Warning Title & Summary */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{alert.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{alert.summary}</p>
                </div>

                {/* Affected Regions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Affected Sub-Districts & Cities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.affectedRegions.map((region, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Advisories List */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-cyan-400" /> Stakeholder Action Guidelines:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {alert.advisories.map((adv, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPage;
