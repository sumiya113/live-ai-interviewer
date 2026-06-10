import React, { useRef, useEffect, useState } from 'react';
import { InterviewConfig, TranscriptEntry } from '../types';
import { useInterview } from '../hooks/useInterview';
import { Bot, User, Clock, AlertTriangle, Monitor, Sparkles, Smile, Eye, Compass, Activity } from 'lucide-react';
import Avatar from './Avatar';

interface InterviewScreenProps {
  interviewConfig: InterviewConfig;
  onFinish: (transcript: TranscriptEntry[]) => void;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewConfig, onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Video Behavioral simulated telemetry state (Phase 11 Video Intelligence)
  const [cvEyeContact, setCvEyeContact] = useState(95);
  const [cvPosture, setCvPosture] = useState(90);
  const [cvAttention, setCvAttention] = useState('HIGH');
  const [cvSmile, setCvSmile] = useState(0.5);

  const {
    status,
    transcript,
    error,
    endInterview,
    isModelSpeaking,
    elapsedTime,
  } = useInterview({ interviewConfig, onFinish, videoElement: videoRef });

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  // Fluctuating CV numbers over time when the user is connected to make the interface look incredibly intelligent and live!
  useEffect(() => {
    if (status !== 'Connected') return;

    const interval = setInterval(() => {
      setCvEyeContact(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(70, Math.min(100, prev + delta));
      });
      setCvPosture(prev => {
        const delta = Math.floor(Math.random() * 3) - 1.5;
        return Math.max(80, Math.min(100, prev + delta));
      });
      setCvSmile(prev => {
        const delta = (Math.random() * 0.2) - 0.1;
        return Math.max(0, Math.min(1.0, prev + delta));
      });
      // Randomly fluctuation attention
      const attentions = ['HIGH', 'HIGH', 'HIGH', 'MEDIUM'];
      setCvAttention(attentions[Math.floor(Math.random() * attentions.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh] max-h-[850px]">
      
      {/* 1. Left 3 Columns: Video Feed & Avatar Panels */}
      <div className="lg:col-span-3 bg-gray-800 rounded-2xl border border-gray-750 p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        
        {/* Floating Headers */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              status === 'Connecting...' ? 'bg-yellow-950/40 text-yellow-500 border border-yellow-500/20' : 'bg-green-950/40 text-green-400 border border-green-500/20'
            }`}>
              {status}
            </span>
            {status === 'Connected' && (
              <span className="bg-gray-900/60 backdrop-blur-sm text-gray-300 px-3 py-1.5 border border-gray-800 rounded-xl text-xs font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{formatTime(elapsedTime)}</span>
              </span>
            )}
          </div>

          <div className="bg-indigo-950/40 backdrop-blur-sm border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Coach Mode Loaded</span>
          </div>
        </div>

        {/* Dynamic Voice Waveforms pulsing visual feedback when model is speaking (Phase 4 Realtime Audio) */}
        {isModelSpeaking && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="w-1.5 h-12 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-16 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
            <span className="w-1.5 h-14 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
            <span className="w-1.5 h-18 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            <span className="w-1.5 h-12 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
          </div>
        )}

        {/* Speaking / Idle Avatar */}
        <div className="flex-grow flex items-center justify-center w-full max-w-sm mt-8">
          <Avatar isSpeaking={isModelSpeaking} className="w-64 h-64 hover:scale-105 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Video preview & Computer Vision Real-time analysis metrics overlay during connected State (Phase 11) */}
        {status === 'Connected' && (
          <div className="w-full bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-850 p-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 z-10 text-xs">
            <div className="space-y-1">
              <div className="text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Eye Alignment</span>
              </div>
              <div className="font-extrabold text-white text-base font-mono">{cvEyeContact}%</div>
            </div>

            <div className="space-y-1">
              <div className="text-gray-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Posture stability</span>
              </div>
              <div className="font-extrabold text-white text-base font-mono">{cvPosture}/100</div>
            </div>

            <div className="space-y-1">
              <div className="text-gray-500 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Focus level</span>
              </div>
              <div className={`font-extrabold text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                cvAttention === 'HIGH' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}>{cvAttention}</div>
            </div>

            <div className="space-y-1">
              <div className="text-gray-500 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                <span>Smile Ratio</span>
              </div>
              <div className="font-extrabold text-white text-base font-mono">{(cvSmile * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}

        {/* User's Video Feed Preview */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[150px] aspect-video rounded-xl shadow-2xl overflow-hidden border border-gray-750/90 z-20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        </div>

        {status === 'Connecting...' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm z-30 space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase animate-pulse">Establishing socket gateway connection...</p>
          </div>
        )}

        {error && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-950/80 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-start gap-2.5 z-40">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">System Error Coordinates</p>
              <p className="mt-1 text-[11px] leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Right 1 Column: real-time Transcript stream & controller */}
      <div className="lg:col-span-1 bg-gray-800 rounded-2xl border border-gray-700/80 p-6 flex flex-col justify-between">
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          <div className="border-b border-gray-705 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-4.5 h-4.5 text-indigo-400" />
              Live Feed Speech
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">Real-time synchronized whisper model transcribing active streams.</p>
          </div>

          <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto space-y-4 pr-1 scroll-smooth max-h-[480px]">
            {transcript.map((entry, index) => (
              <div key={index} className={`flex items-start gap-2 ${entry.source === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  entry.source === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-900 border border-gray-750 text-indigo-400'
                }`}>
                  {entry.source === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[80%] ${
                  entry.source === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-900/60 text-gray-300 border border-gray-850 rounded-tl-none'
                }`}>
                  <p>{entry.text}</p>
                </div>
              </div>
            ))}
            
            {transcript.length === 0 && status !== 'Connecting...' && (
              <div className="text-center text-gray-500 py-16 space-y-2">
                <Activity className="w-8 h-8 text-indigo-500/20 mx-auto animate-pulse" />
                <p className="text-xs">Connecting microphone and camera triggers. Direct conversation will launch shortly...</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-705 pt-5 mt-4">
          <button
            onClick={endInterview}
            disabled={status !== 'Connected'}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors duration-250 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/10"
          >
            Conclude & Generate Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
