import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  Sparkles, 
  Globe, 
  Send, 
  Radio, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { voiceService, isSpeechRecognitionSupported } from '../../services/voiceService';

const MULTILINGUAL_PROMPTS = [
  { lang: 'English', text: 'Will it rain heavily in Mumbai tonight?', tag: 'Rain Check' },
  { lang: 'Hindi', text: 'क्या आज दिल्ली में भारी बारिश होगी?', tag: 'बारिश का अलर्ट' },
  { lang: 'Bengali', text: 'আগামীকাল কলকাতায় কি ঝড়-বৃষ্টি হতে পারে?', tag: 'আবহাওয়া বার্তা' },
  { lang: 'Marathi', text: 'आज पुण्यात पाऊस पडणार आहे का?', tag: 'हवामान अंदाज' },
  { lang: 'Tamil', text: 'சென்னையில் இன்று மழை பெய்யுமா?', tag: 'வானிலை' },
  { lang: 'Telugu', text: 'హైదరాబాద్‌లో ఈరోజు వర్షం పడుతుందా?', tag: 'వాతావరణం' },
  { lang: 'Agriculture', text: 'Irrigation & sowing advisory for wheat crop', tag: 'Kisan Alert' },
  { lang: 'Marine', text: 'Sea conditions and squall warning for fishermen', tag: 'Coast Watch' }
];

const VoiceQueryModal = ({ isOpen, onClose, onSelectQuery, currentLanguage = 'en' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Click Speak to start voice query');
  const [hasMicSupport, setHasMicSupport] = useState(true);

  useEffect(() => {
    setHasMicSupport(isSpeechRecognitionSupported());
  }, []);

  // Auto-start recording when modal opens if supported
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      if (isSpeechRecognitionSupported()) {
        startRecording();
      } else {
        setStatusText('Speech API is unavailable in this browser. Choose a voice prompt below:');
      }
    } else {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = () => {
    setIsRecording(true);
    setStatusText('Listening to your microphone... Speak clearly now');

    voiceService.startListening({
      language: currentLanguage,
      onInterim: (interim) => {
        setTranscript(interim);
      },
      onResult: (finalText) => {
        setTranscript(finalText);
        setIsRecording(false);
        setStatusText('Voice captured successfully!');
      },
      onError: (err) => {
        setIsRecording(false);
        setStatusText(err?.message || 'Microphone error. You can pick a sample voice query below:');
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const stopRecording = () => {
    voiceService.stopListening();
    setIsRecording(false);
  };

  const handleSend = () => {
    if (transcript.trim() && onSelectQuery) {
      onSelectQuery(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-up">
      <div 
        className="w-full max-w-lg rounded-3xl p-6 relative overflow-hidden text-white shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(8, 18, 38, 0.98) 0%, rgba(4, 10, 24, 0.99) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(6, 182, 212, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              WeatherGPT Voice Assistant
            </h2>
            <p className="text-xs text-slate-400">Natural voice queries in English & Indian regional languages</p>
          </div>
        </div>

        {/* Microphone Pulse & Status */}
        <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl mb-5" style={{ background: 'rgba(10, 22, 44, 0.7)', border: '1px solid rgba(6, 182, 212, 0.12)' }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105"
            style={{
              background: isRecording 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: isRecording
                ? '0 0 40px rgba(239, 68, 68, 0.6)'
                : '0 0 30px rgba(6, 182, 212, 0.5)'
            }}
          >
            {isRecording ? (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
                <MicOff className="w-8 h-8 text-white relative z-10" />
              </>
            ) : (
              <Mic className="w-8 h-8 text-white relative z-10" />
            )}
          </button>

          {/* Soundwave Bars while recording */}
          {isRecording && (
            <div className="flex items-center space-x-1 mt-4">
              {[12, 24, 18, 32, 16, 28, 14, 26, 20].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDuration: `${0.4 + (idx % 3) * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-center font-medium mt-3 text-cyan-300">
            {statusText}
          </p>

          {/* Captured Transcript Text Box */}
          <div className="w-full mt-4">
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Captured spoken text will appear here... or type a question"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {transcript.trim() && (
            <button
              onClick={handleSend}
              className="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask WeatherGPT This Question</span>
            </button>
          )}
        </div>

        {/* Multilingual Voice Query Samples */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click to Try Indian Regional Queries</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {MULTILINGUAL_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (onSelectQuery) {
                    onSelectQuery(item.text);
                    onClose();
                  }
                }}
                className="text-left p-2.5 rounded-xl transition-all duration-150 group"
                style={{
                  background: 'rgba(15, 28, 54, 0.6)',
                  border: '1px solid rgba(30, 41, 59, 0.8)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)';
                  e.currentTarget.style.background = 'rgba(15, 28, 54, 0.6)';
                }}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-cyan-400">{item.lang}</span>
                  <span className="text-slate-500 font-mono text-[9px]">{item.tag}</span>
                </div>
                <div className="text-xs text-slate-200 group-hover:text-white line-clamp-2">
                  {item.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceQueryModal;
