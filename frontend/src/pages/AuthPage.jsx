import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CloudSun, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, authLoading } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('ayan.samanta@weathergpt.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [name, setName] = useState('Ayan Samanta');
  const [role, setRole] = useState('Meteorology Lead');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signup({ name, email, password, role });
      } else {
        await login({ email, password, name });
      }
      navigate('/current');
    } catch (err) {
      setError(err?.message || 'Authentication error occurred');
      navigate('/current'); // Always proceed for demo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 20% 30%, rgba(6, 182, 212, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 70%, rgba(99, 102, 241, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 10%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
          `
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="w-full max-w-lg relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.45), 0 0 60px rgba(6, 182, 212, 0.15)'
              }}
            >
              <CloudSun className="w-9 h-9 text-white" />
            </div>
          </div>

          <div>
            <h1
              className="text-4xl font-black tracking-tight text-white"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              Weather<span style={{ color: '#06b6d4' }}>GPT</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Ministry of Earth Sciences · IMD Decision Platform
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
            {['SIH 2026', 'CAP 1.2 Protocol', 'Offline ML Ready'].map((badge) => (
              <span
                key={badge}
                className="text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide"
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  color: '#67e8f9'
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-3xl p-8 space-y-6"
          style={{
            background: 'rgba(5, 12, 28, 0.9)',
            border: '1px solid rgba(6, 182, 212, 0.12)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(6, 182, 212, 0.04)',
            backdropFilter: 'blur(24px)'
          }}
        >
          {/* Tab Switcher */}
          <div
            className="flex p-1 rounded-2xl"
            style={{ background: 'rgba(4, 10, 24, 0.8)', border: '1px solid rgba(30, 41, 59, 0.8)' }}
          >
            {[
              { label: 'Sign In', value: false },
              { label: 'Register Officer', value: true }
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsSignUp(value)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                style={isSignUp === value ? {
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
                } : { color: '#64748b' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-xl text-xs font-semibold text-red-300 animate-fade-in-up"
              style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (signup only) */}
            {isSignUp && (
              <div className="space-y-1.5 animate-fade-in-up">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Officer / Farmer Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Ayan Samanta"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(4, 10, 24, 0.8)',
                      border: '1px solid rgba(51, 65, 85, 0.8)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(51, 65, 85, 0.8)'; e.target.style.boxShadow = ''; }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Official Portal Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gov.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(4, 10, 24, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.8)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(51, 65, 85, 0.8)'; e.target.style.boxShadow = ''; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(4, 10, 24, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.8)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(51, 65, 85, 0.8)'; e.target.style.boxShadow = ''; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role (signup) */}
            {isSignUp && (
              <div className="space-y-1.5 animate-fade-in-up">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl text-xs text-white focus:outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(4, 10, 24, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.8)'
                  }}
                >
                  <option value="Meteorology Lead">Meteorology Lead (IMD/MoES)</option>
                  <option value="Disaster Response Officer">Disaster Response Officer (NDMA)</option>
                  <option value="Agricultural Extension Officer">Agricultural Officer (Kisan Portal)</option>
                  <option value="Progressive Farmer">Progressive Farmer / Grower</option>
                  <option value="Climate Researcher">Climate & Atmosphere Researcher</option>
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading || isLoading}
              className="w-full py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center space-x-2 transition-all duration-300 mt-2 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 60%, #6366f1 100%)',
                boxShadow: '0 6px 24px rgba(6, 182, 212, 0.4)'
              }}
              onMouseEnter={e => { if (!authLoading && !isLoading) e.currentTarget.style.boxShadow = '0 10px 36px rgba(6, 182, 212, 0.55)'; }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(6, 182, 212, 0.4)'}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Complete Registration' : 'Access WeatherGPT Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Access */}
          <div
            className="pt-4 text-center"
            style={{ borderTop: '1px solid rgba(30, 41, 59, 0.8)' }}
          >
            <button
              onClick={() => navigate('/current')}
              className="text-xs text-slate-500 hover:text-cyan-400 font-semibold transition-colors duration-200"
            >
              Continue as Guest Observer →
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center space-x-2 mt-6 text-[11px] text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>CAP 1.2 Encrypted · JWT Secured · MoES Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
