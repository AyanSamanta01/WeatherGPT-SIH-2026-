import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { weatherService } from '../services/api';
import { INITIAL_CHAT_MESSAGES, CHAT_SUGGESTIONS } from '../data/mockData';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Sparkles, 
  CloudRain, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  MapPin,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const ChatPage = () => {
  const { 
    selectedCity, 
    formatTemp, 
    speakText, 
    voiceEnabled, 
    setVoiceEnabled,
    language
  } = useApp();

  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Speech Recognition (Web Speech API)
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please type your query.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  // Send Message Logic
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    // Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call AI Chat Service
      const result = await weatherService.sendChatQuery(query);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources,
        weatherCard: result.weatherCard
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(result.replyText);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue processing your meteorological query. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Chat Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-100 text-sm">WeatherGPT Intelligence Engine</h2>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                Grounded LLM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: <span className="text-cyan-400 font-semibold">{selectedCity}</span> • Multilingual Grounded RAG
            </p>
          </div>
        </div>

        {/* Voice Synth Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              voiceEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Text-to-Speech Output"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Muted'}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
                  : 'bg-gradient-to-tr from-cyan-500 to-teal-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble Container */}
            <div className={`max-w-2xl space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {/* Message Box */}
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-lg'
                    : 'glass-card border border-slate-700/60 text-slate-200 rounded-tl-none shadow-xl'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Embedded Weather Card if present */}
                {msg.weatherCard && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-left flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                        <CloudRain className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 text-xs">{msg.weatherCard.location}</p>
                        <p className="text-[10px] text-cyan-400 font-semibold">{msg.weatherCard.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-300">{msg.weatherCard.temp}</p>
                      <p className="text-[10px] text-slate-400">Rain Prob: {msg.weatherCard.rainChance}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Metadata & Sources */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>{msg.timestamp}</span>
                {msg.sources && (
                  <div className="flex items-center space-x-1.5 text-cyan-400/80">
                    <CheckCircle className="w-3 h-3 text-cyan-400" />
                    <span>Grounded in: {msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <span>WeatherGPT is querying NWP models & active hazard layers...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">Suggestions:</span>
        {CHAT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box Area */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-3">
        {/* Voice Input Button */}
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-2xl border transition shadow-lg ${
            isListening
              ? 'bg-red-500 text-white border-red-400 animate-bounce shadow-red-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-cyan-300 hover:border-cyan-500/50'
          }`}
          title="Voice Speech-to-Text Input"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask WeatherGPT about ${selectedCity} forecast, cyclone alerts, or crop advisories...`}
          className="flex-1 glass-input rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || loading}
          className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-50 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
