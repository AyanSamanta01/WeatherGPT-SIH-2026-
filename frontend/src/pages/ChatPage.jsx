import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  CloudSun, 
  Check, 
  Copy,
  Info,
  Droplets,
  Sprout
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Will it rain tomorrow in Mumbai?',
  'Is it safe to spray pesticides on grapes in Nashik this weekend?',
  'Check cyclone status in Bay of Bengal',
  'What are the heatwave precautions for dairy cattle?'
];

const ChatPage = () => {
  const { 
    messages, 
    sendMessage, 
    chatLoading, 
    startVoiceInput, 
    stopVoiceInput, 
    isListening, 
    speakText, 
    stopSpeaking, 
    isSpeaking,
    language,
    selectedCity,
    weatherData
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || chatLoading) return;
    const q = inputQuery;
    setInputQuery('');
    sendMessage(q);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput((transcript) => {
        setInputQuery(transcript);
        sendMessage(transcript);
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl mb-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black text-white">WeatherGPT Conversational Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Offline ML & RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: <span className="text-cyan-400 font-semibold">{selectedCity}</span> • Dialect: <span className="text-slate-300 font-medium">{language}</span>
            </p>
          </div>
        </div>

        {/* Voice Speech Indicator Badge */}
        {isListening && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to {language}...</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-2 pr-3">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-cyan-600/30 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl ${
                isBot
                  ? 'bg-slate-900/90 border border-slate-800 text-slate-100'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20'
              }`}>
                {/* Message Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Weather Card Attachment if returned */}
                {isBot && msg.weatherCard && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{msg.weatherCard.city}</div>
                        <div className="text-[11px] text-slate-400">{msg.weatherCard.condition}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        <div className="text-base font-extrabold text-cyan-300">{msg.weatherCard.temperature}°C</div>
                        <div className="text-[10px] text-slate-400">{msg.weatherCard.rainProb}% Rain Prob</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bot Footer: Timestamp, Verification Source Tags & Audio Button */}
                {isBot && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified via:</span>
                      {(msg.sources || ['IMD AWS Telemetry', 'Local ML Ensemble']).map((src, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          {src}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => speakText(msg.text)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {chatLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-xs text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing Numerical Forecast & Crop Matrices...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto flex items-center space-x-2 no-scrollbar">
        {SUGGESTED_QUERIES.map((query, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputQuery(query);
              sendMessage(query);
            }}
            className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 font-medium whitespace-nowrap transition flex-shrink-0 shadow-sm"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="relative flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={handleMicClick}
          className={`p-2.5 rounded-xl transition ${
            isListening 
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40' 
              : 'bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask WeatherGPT about weather, crops, or warnings in ${language}...`}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
          disabled={chatLoading}
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || chatLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 transition"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};

export default ChatPage;
