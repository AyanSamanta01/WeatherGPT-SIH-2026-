import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, ArrowLeft, X } from 'lucide-react';

const FloatingAIChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [previousRoute, setPreviousRoute] = useState('/current');

  const isChatActive = location.pathname === '/chat';

  // Keep track of the last non-chat route to return back to
  useEffect(() => {
    if (location.pathname !== '/chat' && location.pathname !== '/login') {
      setPreviousRoute(location.pathname);
    }
  }, [location.pathname]);

  const handleToggleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChatActive) {
      navigate(previousRoute || '/current');
    } else {
      navigate('/chat');
    }
  };

  const getPreviousPageLabel = (path) => {
    switch (path) {
      case '/current': return 'Telemetry';
      case '/forecast': return 'Forecast';
      case '/map': return 'Disaster Map';
      case '/alerts': return 'Warnings';
      case '/analytics': return 'Climate';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <aside 
      aria-label="WeatherGPT Floating Chatbot Trigger"
      className="fixed z-[9999] pointer-events-auto select-none flex items-center space-x-2 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu"
      style={{
        top: isChatActive ? '5.25rem' : 'calc(100vh - 5.5rem)',
        right: isChatActive ? '1.25rem' : '1.5rem'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 💬 Expanding Interactive Tooltip Pill on Hover */}
      <div 
        className={`hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl transition-all duration-300 pointer-events-none transform ${
          isHovered 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-4 scale-95'
        }`}
      >
        {isChatActive ? (
          <div className="flex items-center space-x-1.5">
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              Back to {getPreviousPageLabel(previousRoute)}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
              <span className="text-xs font-bold text-white">WeatherGPT AI</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-semibold px-1.5 py-0.5 bg-cyan-500/20 rounded-md border border-cyan-500/30">
              RAG LLM
            </span>
          </div>
        )}
      </div>

      {/* 🤖 3D Liquid Floating Action Button with Animated Top Transition */}
      <button
        type="button"
        onClick={handleToggleChat}
        aria-label={isChatActive ? `Return to ${getPreviousPageLabel(previousRoute)}` : 'Open WeatherGPT AI Chat'}
        title={isChatActive ? `Back to ${getPreviousPageLabel(previousRoute)}` : 'Open WeatherGPT AI Chat'}
        className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl group cursor-pointer pointer-events-auto transform-gpu active:scale-90 ${
          isChatActive
            ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-700 border-2 border-cyan-300/80 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-95 hover:scale-105 ring-2 ring-cyan-400/30'
            : 'bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 border-2 border-white/30 hover:border-cyan-300 hover:shadow-[0_12px_40px_-5px_rgba(6,182,212,0.65)] hover:scale-110'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Animated Liquid Glare Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/35 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Ambient Ring Wave */}
        <div className="absolute -inset-1.5 rounded-2xl bg-cyan-400/30 blur-sm group-hover:blur-md transition-all duration-300 -z-10 animate-pulse" />

        {/* Main Icon with Smooth Morph on Hover */}
        {isChatActive ? (
          <div className="flex items-center justify-center relative">
            <Bot className="w-6 h-6 text-white drop-shadow-md group-hover:opacity-20 transition-all duration-300" />
            <X className="w-5 h-5 text-white absolute opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </div>
        ) : (
          <Bot className="w-7 h-7 text-white drop-shadow-md group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" />
        )}

        {/* Top-Right Badge */}
        {isChatActive ? (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-md shadow-cyan-500/50 border border-white/40 animate-pulse">
            <ArrowLeft className="w-3 h-3 text-white" />
          </div>
        ) : (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/40 border border-white/40 animate-bounce">
            <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
          </div>
        )}

        {/* Live Status Dot */}
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 shadow-sm" />
      </button>
    </aside>
  );
};

export default FloatingAIChatButton;
