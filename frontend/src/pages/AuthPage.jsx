import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CloudRain, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Globe, 
  Sparkles, 
  ShieldCheck,
  Wind,
  Sun
} from 'lucide-react';

const AuthPage = () => {
  const { loginUser, signupUser, SUPPORTED_LANGUAGES } = useApp();
  const navigate = useNavigate();
  
  // false = Sign In (Form on Right, Welcome on Left)
  // true = Sign Up (Form on Left, Welcome on Right)
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // React Hook Form for Sign In
  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmitForm,
    formState: { errors: signInErrors },
    setValue: setSignInValue
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  });

  // React Hook Form for Sign Up
  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmitForm,
    formState: { errors: signUpErrors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Meteorologist',
      preferredLanguage: 'en'
    }
  });

  // 3D Parallax & Liquid Glare Mouse Tracking
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt angles between -6deg and +6deg
    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;
    
    // Calculate glare percentage
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  }, []);

  // Form Submit Handlers
  const onSignInSubmit = async (data) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const success = await loginUser('Meteorology Lead', data.email, data.password);
      if (success) {
        navigate('/current');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const onSignUpSubmit = async (data) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const success = await signupUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
        preferredLanguage: data.preferredLanguage
      });
      if (success) {
        navigate('/current');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full flex items-center justify-center p-3 sm:p-6 select-none bg-cover bg-center bg-no-repeat overflow-hidden perspective-[1200px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(8, 12, 24, 0.45), rgba(15, 6, 20, 0.55)), url('/auth-bg.jpg')`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 🌊 Background Ambient Liquid Morphing Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-tr from-rose-600/30 via-pink-500/20 to-amber-500/20 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-liquid-2 pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-80 h-80 bg-gradient-to-r from-amber-400/20 to-rose-500/20 rounded-full blur-3xl animate-liquid-1 pointer-events-none" />

      {/* 🪟 3D Floating Mini Liquid Weather Badges */}
      <div className="hidden lg:flex items-center space-x-2 absolute top-8 left-12 liquid-badge px-4 py-2 rounded-2xl z-30 animate-float-3d text-xs font-semibold text-white/90">
        <Sun className="w-4 h-4 text-amber-400" />
        <span>IMD Telemetry • 28°C Mountain Peak Clear</span>
      </div>

      <div className="hidden lg:flex items-center space-x-2 absolute bottom-8 right-12 liquid-badge px-4 py-2 rounded-2xl z-30 animate-float-fast text-xs font-semibold text-white/90">
        <Wind className="w-4 h-4 text-cyan-400" />
        <span>Field Sensor Grid • 14 km/h Gusts</span>
      </div>

      {/* 💎 3D Tilt Card with Liquid Glassmorphic Depth */}
      <div 
        ref={cardRef}
        className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative min-h-[640px] liquid-glass flex transition-transform duration-300 ease-out transform-gpu"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Dynamic Specular Liquid Glare Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%)`
          }}
        />

        {/* ========================================================================= */}
        {/* 1. SLIDING FORM CONTAINER (Moves from Right to Left on Sign Up)          */}
        {/* ========================================================================= */}
        <div 
          className={`absolute top-0 bottom-0 w-full md:w-1/2 z-20 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform ${
            isSignUp 
              ? 'translate-x-0 md:translate-x-0' 
              : 'translate-x-0 md:translate-x-full'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="w-full h-full p-8 sm:p-10 flex flex-col justify-center liquid-glass-inner overflow-y-auto relative">
            
            {/* SIGN IN FORM (Visible when !isSignUp) */}
            {!isSignUp ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    Sign In
                  </h2>
                  <p className="text-xs text-slate-300/90 mt-1 font-medium">Access your WeatherGPT portal</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/25 border border-rose-500/40 text-rose-100 text-xs font-semibold text-center backdrop-blur-md">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSignInSubmitForm(onSignInSubmit)} className="space-y-5">
                  {/* Email with React Hook Form */}
                  <div>
                    <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 focus-within:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)] transition-all pb-1">
                      <input
                        type="email"
                        placeholder="Email Address"
                        {...registerSignIn('email', { 
                          required: 'Email address is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none pr-8 py-1.5 font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-1 top-2" />
                    </div>
                    {signInErrors.email && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{signInErrors.email.message}</p>
                    )}
                  </div>

                  {/* Password with React Hook Form */}
                  <div>
                    <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 focus-within:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)] transition-all pb-1">
                      <input
                        type="password"
                        placeholder="Password"
                        {...registerSignIn('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none pr-8 py-1.5 font-medium"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-1 top-2" />
                    </div>
                    {signInErrors.password && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{signInErrors.password.message}</p>
                    )}
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between text-xs text-slate-200 pt-1 font-medium">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...registerSignIn('rememberMe')}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-900/80"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions sent to registered email.')}
                      className="text-slate-300 hover:text-pink-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* 💧 Glossy Liquid Crimson CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl liquid-button text-white font-bold text-sm tracking-wide disabled:opacity-50"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                {/* Switch to Sign Up */}
                <div className="text-center text-xs text-slate-300 pt-1">
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setErrorMessage('');
                      }}
                      className="font-bold text-white hover:text-pink-300 transition underline underline-offset-4 ml-1"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* SIGN UP FORM (Visible when isSignUp) */
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    Sign Up
                  </h2>
                  <p className="text-xs text-slate-300/90 mt-1 font-medium">Create your WeatherGPT account</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/25 border border-rose-500/40 text-rose-100 text-xs font-semibold text-center backdrop-blur-md">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSignUpSubmitForm(onSignUpSubmit)} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 focus-within:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)] transition-all pb-1">
                      <input
                        type="text"
                        placeholder="Full Name"
                        {...registerSignUp('name', { required: 'Full name is required' })}
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none pr-8 py-1 font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-1 top-1.5" />
                    </div>
                    {signUpErrors.name && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{signUpErrors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 focus-within:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)] transition-all pb-1">
                      <input
                        type="email"
                        placeholder="Email Address"
                        {...registerSignUp('email', { 
                          required: 'Email address is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none pr-8 py-1 font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-1 top-1.5" />
                    </div>
                    {signUpErrors.email && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{signUpErrors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 focus-within:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)] transition-all pb-1">
                      <input
                        type="password"
                        placeholder="Password"
                        {...registerSignUp('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none pr-8 py-1 font-medium"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-1 top-1.5" />
                    </div>
                    {signUpErrors.password && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{signUpErrors.password.message}</p>
                    )}
                  </div>

                  {/* Persona Selector */}
                  <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 transition-all pb-1">
                    <select
                      {...registerSignUp('role')}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none pr-8 py-1 font-medium [&>option]:bg-slate-900 [&>option]:text-white cursor-pointer"
                    >
                      <option value="Meteorologist">Meteorologist / Scientific Researcher</option>
                      <option value="Disaster Manager">Disaster Response Manager (NDRF/SDMA)</option>
                      <option value="Farmer">Farmer / Agricultural Advisor</option>
                      <option value="Aviation Specialist">Aviation & Maritime Specialist</option>
                      <option value="General Public">General Public</option>
                    </select>
                    <Briefcase className="w-4 h-4 text-slate-400 absolute right-1 top-1.5 pointer-events-none" />
                  </div>

                  {/* Language Selector */}
                  <div className="relative border-b-2 border-white/25 focus-within:border-rose-400 transition-all pb-1">
                    <select
                      {...registerSignUp('preferredLanguage')}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none pr-8 py-1 font-medium [&>option]:bg-slate-900 [&>option]:text-white cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name} ({l.native})
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-slate-400 absolute right-1 top-1.5 pointer-events-none" />
                  </div>

                  {/* 💧 Glossy Liquid Crimson CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl liquid-button text-white font-bold text-sm tracking-wide disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>

                {/* Switch to Sign In */}
                <div className="text-center text-xs text-slate-300 pt-1">
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setErrorMessage('');
                      }}
                      className="font-bold text-white hover:text-pink-300 transition underline underline-offset-4 ml-1"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BACKGROUND INFO PANELS (LEFT & RIGHT)                                  */}
        {/* ========================================================================= */}

        {/* Left Side Content (Displayed when Form is on Right / !isSignUp) */}
        <div 
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
            !isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none hidden md:flex'
          }`}
        >
          {/* Logo Heading */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/35 border border-white/30 backdrop-blur-md">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <div className="font-extrabold text-2xl tracking-tight text-white font-sans drop-shadow-md">
              Weather<span className="text-pink-400">GPT</span>
            </div>
          </div>

          {/* Center Welcome Headline & Paragraph */}
          <div className="my-8 space-y-3.5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              Welcome!
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-pink-200/95 tracking-tight">
              To WeatherGPT Platform.
            </p>
            <p className="text-xs sm:text-sm text-slate-200/85 max-w-sm leading-relaxed font-medium pt-1">
              AI-Powered Conversational Weather Intelligence, NWP Forecasts & Real-Time Disaster Dissemination for MoES & IMD.
            </p>
          </div>

          {/* Badges Footer (Liquid Badges) */}
          <div className="flex items-center space-x-3 text-white/90">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full liquid-badge text-xs font-semibold text-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>SIH 2026</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full liquid-badge text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MoES / IMD Protocol</span>
            </div>
          </div>
        </div>

        {/* Right Side Content (Displayed when Form is on Left / isSignUp) */}
        <div 
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
            isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none hidden md:flex'
          }`}
        >
          {/* Logo Heading */}
          <div className="flex items-center space-x-3 justify-end">
            <div className="font-extrabold text-2xl tracking-tight text-white font-sans drop-shadow-md">
              Weather<span className="text-pink-400">GPT</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/35 border border-white/30 backdrop-blur-md">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Center Sign Up Headline & Paragraph */}
          <div className="my-8 space-y-3.5 text-right">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              Join Us!
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-pink-200/95 tracking-tight">
              Create Your Intelligence Account.
            </p>
            <p className="text-xs sm:text-sm text-slate-200/85 max-w-sm ml-auto leading-relaxed font-medium pt-1">
              Connect to regional meteorological radars, customize agricultural crop alerts, and stream national CAP 1.2 warnings.
            </p>
          </div>

          {/* Badges Footer (Liquid Badges) */}
          <div className="flex items-center space-x-3 text-white/90 justify-end">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full liquid-badge text-xs font-semibold text-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Multi-lingual RAG</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full liquid-badge text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>GIS Early Warning</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
