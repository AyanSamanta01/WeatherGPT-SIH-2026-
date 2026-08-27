import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Globe, 
  Volume2, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Sparkles,
  Sliders,
  Building
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addLocation, deleteLocation, setDefaultLocation } from '../store/slices/locationsSlice';
import { updateUserProfile } from '../store/slices/authSlice';

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center space-x-3 mb-5">
    <div
      className="p-2.5 rounded-xl"
      style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
    >
      <Icon className="w-4 h-4 text-cyan-400" />
    </div>
    <div>
      <div className="text-sm font-black text-white">{title}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { 
    user, language, setLanguage, supportedLanguages, 
    voiceEnabled, setVoiceEnabled, voiceSpeed, setVoiceSpeed, speakText
  } = useApp();

  const savedLocations = useSelector(state => state.locations.savedLocations || []);

  const [userName, setUserName] = useState(user?.name || 'Ayan Samanta');
  const [userEmail, setUserEmail] = useState(user?.email || 'user@weathergpt.gov.in');
  const [userRole, setUserRole] = useState(user?.role || 'Meteorology Lead');
  const [savedStatus, setSavedStatus] = useState(false);
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('Mumbai');
  const [newLocType, setNewLocType] = useState('Agriculture');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name: userName, email: userEmail, role: userRole }));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    dispatch(addLocation({
      id: 'loc-' + Date.now().toString().slice(-6),
      name: newLocName.trim(),
      city: newLocCity,
      state: 'India',
      type: newLocType,
      lat: 19.076, lon: 72.877,
      isDefault: false
    }));
    setNewLocName('');
    setShowAddLoc(false);
  };

  const inputStyle = {
    background: 'rgba(4, 10, 24, 0.8)',
    border: '1px solid rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0'
  };

  const inputFocusStyle = (e) => {
    e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)';
    e.target.style.outline = 'none';
  };
  const inputBlurStyle = (e) => {
    e.target.style.borderColor = 'rgba(51, 65, 85, 0.8)';
    e.target.style.boxShadow = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1
            className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
          >
            Preferences
          </h1>
          <span className="badge-info">
            <Sliders className="w-3 h-3" />
            <span>Personalization</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Customize meteorological alerts, regional voice dialects, and favorite agricultural monitoring zones.
        </p>
      </div>

      {/* Profile Section */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-3xl space-y-5"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex items-center justify-between">
          <SectionHeader icon={User} title="Profile Information" sub="Officer / Kisan account details" />
          {savedStatus && (
            <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 animate-fade-in-up">
              <div
                className="p-1 rounded-full"
                style={{ background: 'rgba(16, 185, 129, 0.15)' }}
              >
                <Check className="w-3 h-3" />
              </div>
              <span>Saved!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Full Name', value: userName, set: setUserName, type: 'text', placeholder: 'Dr. Ayan Samanta' },
            { label: 'Official Email', value: userEmail, set: setUserEmail, type: 'email', placeholder: 'name@gov.in' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200"
                style={inputStyle}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200"
              style={inputStyle}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            >
              <option value="Meteorology Lead">Meteorology Lead (IMD)</option>
              <option value="Disaster Response Officer">Disaster Response Officer (NDMA)</option>
              <option value="Agricultural Extension Officer">Agricultural Officer</option>
              <option value="Progressive Farmer (Kisan)">Progressive Farmer (Kisan)</option>
              <option value="Climate Researcher">Climate Researcher</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Voice & Language */}
      <div
        className="p-6 rounded-3xl space-y-5"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <SectionHeader icon={Globe} title="Regional Language & Voice Audio" sub="6 Indian language dialects supported" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Language Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400">Default Dialect for Voice & AI Responses</label>
            <div className="grid grid-cols-2 gap-2">
              {supportedLanguages.map((l) => {
                const isActive = language === l.name;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.name)}
                    className="p-3 rounded-2xl text-xs font-semibold text-left flex items-center justify-between transition-all duration-200"
                    style={isActive ? {
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: '#67e8f9'
                    } : {
                      background: 'rgba(10, 22, 42, 0.7)',
                      border: '1px solid rgba(30, 41, 59, 0.9)',
                      color: '#64748b'
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.8)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)'; e.currentTarget.style.color = '#64748b'; } }}
                  >
                    <span className="font-bold">{l.name}</span>
                    <span style={{ fontSize: '13px' }}>{l.native}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="space-y-4">
            <div
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'rgba(10, 22, 42, 0.7)', border: '1px solid rgba(30, 41, 59, 0.9)' }}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Read Aloud Responses</div>
                <div className="text-[10px] text-slate-500">Auto-synthesize text-to-speech for AI & alerts</div>
              </div>
              <div
                className="relative cursor-pointer w-10 h-6 rounded-full transition-all duration-300"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                style={{
                  background: voiceEnabled
                    ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                    : 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(51, 65, 85, 0.6)'
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                  style={{ left: voiceEnabled ? '18px' : '2px' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Voice Playback Speed</span>
                <span className="text-cyan-400">{voiceSpeed}x</span>
              </div>
              <input
                type="range" min="0.7" max="1.4" step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#06b6d4' }}
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>0.7× (Farmer Pace)</span>
                <span>1.0× Standard</span>
                <span>1.4× Fast</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakText(`Namaste! Testing WeatherGPT audio playback speed at ${voiceSpeed}x in ${language}.`)}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200"
              style={{
                background: 'rgba(10, 22, 42, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#64748b'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'; e.currentTarget.style.color = '#67e8f9'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)'; e.currentTarget.style.color = '#64748b'; }}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Audio Readout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Saved Locations */}
      <div
        className="p-6 rounded-3xl space-y-5"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex items-center justify-between">
          <SectionHeader icon={MapPin} title="Saved Farms & Monitoring Zones" sub="Telemetry watchpoints across India" />

          <button
            onClick={() => setShowAddLoc(!showAddLoc)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              background: showAddLoc ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              color: '#67e8f9'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone</span>
          </button>
        </div>

        {showAddLoc && (
          <form
            onSubmit={handleAddLocation}
            className="p-4 rounded-2xl space-y-3 animate-fade-in-up"
            style={{ background: 'rgba(4, 10, 24, 0.8)', border: '1px solid rgba(6, 182, 212, 0.15)' }}
          >
            <div className="text-xs font-bold text-slate-300">Register New Telemetry Zone</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Zone / Farm Label (e.g. Nashik Vineyard)"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={inputStyle}
                onFocus={inputFocusStyle}
                onBlur={inputBlurStyle}
                required
              />
              <select
                value={newLocCity}
                onChange={(e) => setNewLocCity(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs"
                style={inputStyle}
              >
                {['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Nashik', 'Bhubaneswar'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={newLocType}
                onChange={(e) => setNewLocType(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs"
                style={inputStyle}
              >
                <option value="Agriculture">Agriculture / Farming</option>
                <option value="Aquaculture">Aquaculture / Fisheries</option>
                <option value="Disaster Relief Base">Disaster Relief Base</option>
                <option value="Urban Meteorology">Urban Meteorology</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddLoc(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.6)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-black text-slate-950 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                Save Zone
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5">
          {savedLocations.length === 0 ? (
            <div
              className="p-8 rounded-2xl text-center"
              style={{ background: 'rgba(10, 22, 42, 0.5)', border: '1px dashed rgba(51, 65, 85, 0.6)' }}
            >
              <Building className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-xs text-slate-500">No monitoring zones saved. Add your farm or field above.</div>
            </div>
          ) : (
            savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-4 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200"
                style={{
                  background: loc.isDefault ? 'rgba(6, 182, 212, 0.06)' : 'rgba(10, 22, 42, 0.7)',
                  border: loc.isDefault ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(30, 41, 59, 0.9)'
                }}
                onMouseEnter={e => { if (!loc.isDefault) e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.8)'; }}
                onMouseLeave={e => { if (!loc.isDefault) e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)'; }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      background: loc.isDefault ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                      border: `1px solid ${loc.isDefault ? 'rgba(6, 182, 212, 0.25)' : 'rgba(51, 65, 85, 0.5)'}`
                    }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: loc.isDefault ? '#06b6d4' : '#64748b' }} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{loc.name}</span>
                      {loc.isDefault && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-black"
                          style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#67e8f9' }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {loc.city}, {loc.state} · <span className="text-slate-400">{loc.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!loc.isDefault && (
                    <button
                      onClick={() => dispatch(setDefaultLocation(loc.id))}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150"
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(51, 65, 85, 0.6)',
                        color: '#94a3b8'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.8)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)'; }}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(deleteLocation(loc.id))}
                    className="p-1.5 rounded-lg transition-all duration-150"
                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                    title="Remove location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Disaster Early Warning & Notification Thresholds (Prisma alertPreferences) */}
      <div
        className="p-6 rounded-3xl space-y-5"
        style={{
          background: 'rgba(5, 12, 28, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <SectionHeader 
          icon={Sliders} 
          title="Disaster Early Warning Thresholds" 
          sub="Configure personal triggers for IMD CAP 1.2 siren alerts" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl space-y-2 bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Rainfall Deluge Threshold</span>
              <span className="text-cyan-400">50 mm / 24h</span>
            </div>
            <p className="text-[10px] text-slate-500">Triggers flood watch sirens when radar predicts heavy downpours.</p>
          </div>

          <div className="p-4 rounded-2xl space-y-2 bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Squall Wind Speed Threshold</span>
              <span className="text-cyan-400">45 km/h</span>
            </div>
            <p className="text-[10px] text-slate-500">Broadcasts coastal gale alerts and crop lodging hazard advisories.</p>
          </div>

          <div className="p-4 rounded-2xl space-y-2 bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Extreme Heatwave Threshold</span>
              <span className="text-cyan-400">42°C</span>
            </div>
            <p className="text-[10px] text-slate-500">Activates thermal comfort precautions and livestock hydration warnings.</p>
          </div>

          <div className="p-4 rounded-2xl space-y-2 bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Minimum Alert Severity</span>
              <span className="text-orange-400 font-extrabold uppercase">Moderate (Yellow+)</span>
            </div>
            <p className="text-[10px] text-slate-500">Filter out minor bulletins and focus on actionable meteorological alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
