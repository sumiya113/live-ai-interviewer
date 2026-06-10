import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Database, 
  Activity, 
  Eye, 
  Smile, 
  Compass, 
  Mic, 
  MicOff, 
  Terminal, 
  Volume2, 
  Sliders, 
  Lightbulb, 
  Search, 
  HelpCircle, 
  Code, 
  Monitor, 
  Bot, 
  User, 
  Network, 
  Clock, 
  Settings, 
  Info,
  ChevronLeft,
  Tv
} from 'lucide-react';
import { usePlayground } from '../hooks/usePlayground';
import Avatar from './Avatar';

interface DBRecord {
  id: string;
  timestamp: string;
  latencyMs: number;
  category: string;
  prompt: string;
  response: string;
  sizeBytes: number;
}

export const PlaygroundSession: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Layout tabs inside the sidebar to prevent clutter
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'neural' | 'db'>('chat');

  // Conversation logs
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'model'; text: string; timestamp: Date }[]>([
    {
      id: 'm_init',
      sender: 'model',
      text: "System handshake established. I'm live-calibrated as your open-ended real-time brain partner. Speak clearly into your microphone, or type below! Ask me literally anything. I am listening.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  
  // ForgeDB persistent logs
  const [dbRecords, setDbRecords] = useState<DBRecord[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'WRITING' | 'READING' | 'FLUSHING'>('IDLE');
  const [lastTxHash, setLastTxHash] = useState('0x3F8A...C18D');
  const [writeLatency, setWriteLatency] = useState(58);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  // Dial sliders (purely visual settings)
  const [thinkingConfig, setThinkingConfig] = useState(90);
  const [creativeIndex, setCreativeIndex] = useState(80);

  // Telemetry real-time indicators
  const [cvEyeContact, setCvEyeContact] = useState(98);
  const [cvPosture, setCvPosture] = useState(95);
  const [cvPulse, setCvPulse] = useState(74);
  const [cvAttention, setCvAttention] = useState('MAXIMAL');

  // Interactive nodes for Neural Map
  const [nodes, setNodes] = useState<{ id: string; label: string; x: number; y: number; category: string }[]>([
    { id: '1', label: 'Quantum Decoupling', x: 25, y: 30, category: 'Science' },
    { id: '2', label: 'Gemini Live Websockets', x: 72, y: 22, category: 'AI' },
    { id: '3', label: 'Distributed Systems Layout', x: 48, y: 56, category: 'Architecture' },
    { id: '4', label: 'Vite Native Proxy', x: 18, y: 76, category: 'Dev' },
    { id: '5', label: 'TypeScript Type-Safety', x: 82, y: 68, category: 'Dev' },
  ]);

  // Invoke our custom live audio sandbox hook
  const { 
    status, 
    transcript, 
    error, 
    sendMessage, 
    endPlayground, 
    isModelSpeaking, 
    elapsedTime,
    playgroundMode,
    setPlaygroundMode,
    isListening,
    isMuted,
    toggleMute,
    isLoadingResponse,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName,
    liveUserSpeech,
    setLiveUserSpeech,
    turnTakingMode,
    setTurnTakingMode,
    silenceThreshold,
    setSilenceThreshold,
    triggerManualResponse
  } = usePlayground({
    videoElement: videoRef
  });

  // Handle auto scroll for text feed
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Fluctuations of simulated metrics to match the sci-fi dashboard theme
  useEffect(() => {
    const interval = setInterval(() => {
      setCvEyeContact(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(85, Math.min(100, prev + delta));
      });
      setCvPosture(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(90, Math.min(100, prev + delta));
      });
      setCvPulse(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(68, Math.min(95, prev + delta));
      });
      const indices = ['MAXIMAL', 'OPTIMAL', 'MAXIMAL', 'FLOWING'];
      setCvAttention(indices[Math.floor(Math.random() * indices.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync Log Collections on init
  useEffect(() => {
    const stored = localStorage.getItem('forge_db_playground');
    if (stored) {
      try {
        setDbRecords(JSON.parse(stored));
      } catch (e) {
        console.error("Failed parsing forge db", e);
      }
    } else {
      const seed: DBRecord[] = [
        {
          id: 'tx_init_101',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          latencyMs: 76,
          category: 'AI',
          prompt: 'Sandbox environment initialization query',
          response: 'InterviewForge Real-time AI Playground socket mounted correctly.',
          sizeBytes: 420
        }
      ];
      localStorage.setItem('forge_db_playground', JSON.stringify(seed));
      setDbRecords(seed);
    }
  }, []);

  // Sync transcripts from the live audio hook to messages state & database ledger
  const prevTranscriptLength = useRef(0);
  useEffect(() => {
    if (transcript.length > prevTranscriptLength.current) {
      const newEntries = transcript.slice(prevTranscriptLength.current);
      prevTranscriptLength.current = transcript.length;

      newEntries.forEach(entry => {
        // Log into conversational messages list
        const msgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        setMessages(prev => [...prev, {
          id: msgId,
          sender: entry.source,
          text: entry.text,
          timestamp: new Date(entry.timestamp)
        }]);

        // If speaking model turn is completed, commit to persistent database
        if (entry.source === 'model') {
          // Locate corresponding user input text for relationship context
          const lastUserText = transcript.slice(0, transcript.indexOf(entry))
            .reverse()
            .find(t => t.source === 'user')?.text || "Verbal user greeting";

          let inferredCategory = 'General';
          const qLow = lastUserText.toLowerCase();
          if (qLow.includes('quantum') || qLow.includes('science') || qLow.includes('physics')) inferredCategory = 'Science';
          else if (qLow.includes('code') || qLow.includes('script') || qLow.includes('react') || qLow.includes('type')) inferredCategory = 'Dev';
          else if (qLow.includes('db') || qLow.includes('postgres') || qLow.includes('server')) inferredCategory = 'Architecture';
          else if (qLow.includes('ai') || qLow.includes('model') || qLow.includes('gemini') || qLow.includes('live')) inferredCategory = 'AI';

          // Insert matching coordinates dynamically into the visual graph
          const isDuplicateNode = nodes.some(n => n.label.toLowerCase() === lastUserText.toLowerCase());
          if (!isDuplicateNode && lastUserText.length < 35 && lastUserText.length > 3) {
            setNodes(curr => [
              ...curr.slice(-5),
              {
                id: `n_${Date.now()}`,
                label: lastUserText,
                x: Math.floor(Math.random() * 70) + 15,
                y: Math.floor(Math.random() * 70) + 15,
                category: inferredCategory
              }
            ]);
          }

          writeToAuditDB(lastUserText, entry.text, inferredCategory, 120);
        }
      });
    }
  }, [transcript]);

  // Insert to local database
  const writeToAuditDB = async (prompt: string, response: string, category: string, latency: number) => {
    setDbStatus('WRITING');
    const dbString = localStorage.getItem('forge_db_playground') || '[]';
    let currentLogs: DBRecord[] = [];
    try {
      currentLogs = JSON.parse(dbString);
    } catch {
      currentLogs = [];
    }

    const item: DBRecord = {
      id: `tx_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
      category,
      prompt,
      response,
      sizeBytes: encodeURI(prompt + response).length
    };

    const updated = [item, ...currentLogs];
    localStorage.setItem('forge_db_playground', JSON.stringify(updated));

    await new Promise(resolve => setTimeout(resolve, 200)); // artificial persistence confirmation lock
    setDbRecords(updated);
    setLastTxHash(`0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`);
    setWriteLatency(latency);
    setDbStatus('IDLE');
  };

  // Erase log collections
  const handleFlushDB = () => {
    setDbStatus('FLUSHING');
    setTimeout(() => {
      localStorage.removeItem('forge_db_playground');
      setDbRecords([]);
      setDbStatus('IDLE');
    }, 400);
  };

  // Trigger content send from typed input
  const handleSendPrompt = (text: string) => {
    const query = text.trim();
    if (!query) return;

    // Send down WebSocket to Gemini Live API
    sendMessage(query);
    setInputText('');
  };

  const handleNodeTrigger = (label: string) => {
    setInputText(label);
    handleSendPrompt(label);
  };

  const filteredLogs = dbRecords.filter(r => {
    const isCatMatched = selectedCategory === 'All Topics' || r.category === selectedCategory;
    const isSearchMatched = r.prompt.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                            r.response.toLowerCase().includes(dbSearchQuery.toLowerCase());
    return isCatMatched && isSearchMatched;
  });

  // Calculate elapsed session timer format
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh] max-h-[850px] text-white">
      
      {/* LEFT 3 COLUMNS: COCKPIT AVATAR, VIDEO PIP, DYNAMIC METRICS TELEMETRY */}
      <div className="lg:col-span-3 bg-gray-800 rounded-2xl border border-gray-750 p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        
        {/* Connection status overlay headers */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status === 'Connected' ? 'bg-indigo-400' : status === 'Connecting...' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === 'Connected' ? 'bg-indigo-500' : status === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
              </span>
              <span>{status.toUpperCase()}</span>
            </span>
            <span className="bg-gray-900/60 backdrop-blur-sm text-gray-300 px-3 py-1.5 border border-gray-800 rounded-xl text-xs font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{formatTimer(elapsedTime)}</span>
            </span>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-gray-400 flex items-center gap-1.5 animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>REAL-TIME MULTIMODAL SPEECH</span>
          </div>
        </div>

        {/* Dynamic Voice Waveforms pulsing visual feedback when model is speaking or loading */}
        {(isModelSpeaking || isLoadingResponse) && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-gray-950/80 backdrop-blur-md p-3.5 px-6 rounded-full border border-gray-800/80 shadow-2xl">
            {isModelSpeaking ? (
              <div className="flex gap-1 items-end h-8">
                <span className="w-1 h-5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                <span className="w-1 h-6 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1 h-9 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 pl-1">
                  Synthesizing Voice Stream...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 h-8">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-indigo-455 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300">
                  AI Brainstorming...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Connection Setup Overlays */}
        {status === 'Connecting...' && (
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col justify-center items-center z-30 space-y-4">
            <div className="relative w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin flex items-center justify-center">
              <Network className="w-6 h-6 text-indigo-400 absolute" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg tracking-wide">Plugging into Gemini Live WebSockets</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Initializing 16kHz audio capture and 24kHz stream decodes...</p>
            </div>
          </div>
        )}

        {status === 'Error' && (
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm flex flex-col justify-center items-center z-30 space-y-4 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-red-400 tracking-wide">Handshake Blocked</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">{error || "An API authentication error occurred."}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Central speaking AI Avatar representing interviewer */}
        <div className="flex-grow flex items-center justify-center w-full max-w-sm mt-8">
          <Avatar 
            isSpeaking={isModelSpeaking} 
            className="w-60 h-60 hover:scale-105 transform transition-all duration-300 pointer-events-none" 
          />
        </div>

        {/* Real-time computer vision metrics telemetry feedback panel */}
        <div className="w-full bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-850 p-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 z-10 text-xs shadow-xl">
          <div className="space-y-1">
            <div className="text-gray-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gaze alignment tracking</span>
            </div>
            <div className="font-extrabold text-white text-base font-mono">{cvEyeContact}%</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Posture index score</span>
            </div>
            <div className="font-extrabold text-white text-base font-mono">{cvPosture}/100</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Biometric pulse</span>
            </div>
            <div className="font-extrabold text-white text-base font-mono">{cvPulse} bpm</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Interactivity Evaluation</span>
            </div>
            <div className="font-extrabold text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 bg-green-500/10 text-green-400 border border-green-500/20 font-mono">
              {cvAttention}
            </div>
          </div>
        </div>

        {/* Real camera video capture or abstract visual fallback */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[140px] aspect-video rounded-xl shadow-2xl overflow-hidden border border-gray-750/90 z-20 bg-gray-950 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        </div>

      </div>

      {/* RIGHT 1 COLUMN: SIDEBAR LOGS, INTERACTIVE MENTAL NEURAL MAPS, DIALS */}
      <div className="lg:col-span-1 bg-gray-800 rounded-2xl border border-gray-700/85 p-4 flex flex-col justify-between">
        
        {/* TABS AT THE TOP */}
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1.5 rounded-xl border border-gray-850">
            <button
              onClick={() => setSidebarTab('chat')}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                sidebarTab === 'chat' ? 'bg-indigo-650 text-white shadow' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Dialogue</span>
            </button>
            <button
              onClick={() => setSidebarTab('neural')}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                sidebarTab === 'neural' ? 'bg-indigo-650 text-white shadow' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Neurons</span>
            </button>
            <button
              onClick={() => setSidebarTab('db')}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                sidebarTab === 'db' ? 'bg-indigo-650 text-white shadow' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>ForgeDB</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: REAL-TIME SECURE DIALOGUE STREAM */}
          {sidebarTab === 'chat' && (
            <div className="flex-grow flex flex-col justify-between overflow-hidden">
              <div className="border-b border-gray-750 pb-2 mb-2">
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Dialogue stream:
                </h4>
                <p className="text-[9px] text-gray-500 mt-0.5 font-sans">Speak directly into your mic or type backup questions below.</p>
                
                {/* Voice Pipeline Engine Controls */}
                <div className="mt-2.5 p-2 bg-gray-950/90 rounded-xl border border-gray-850 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-wider text-gray-500 uppercase font-bold">Speech Pipeline:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPlaygroundMode('webspeech')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          playgroundMode === 'webspeech' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-900 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Web Speech
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlaygroundMode('livews')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          playgroundMode === 'livews' ? 'bg-indigo-650 text-white shadow' : 'bg-gray-900 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Live WS
                      </button>
                    </div>
                  </div>

                  {playgroundMode === 'webspeech' && (
                    <div className="space-y-2.5 pt-1 border-t border-gray-900">
                      {/* Audio mute, active indicator row */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 flex items-center gap-1 font-mono">
                          {isListening ? (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                            </span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                          )}
                          <span>{isMuted ? "MUTED" : isListening ? "LISTENING" : "INACTIVE"}</span>
                        </span>

                        <button
                          type="button"
                          onClick={toggleMute}
                          className={`p-1 px-2 rounded-lg border flex items-center gap-1 text-[9px] font-bold transition-all cursor-pointer ${
                            isMuted 
                              ? 'bg-red-950/40 text-red-400 border-red-500/20 hover:bg-red-900/20' 
                              : 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20 hover:bg-indigo-900/20'
                          }`}
                        >
                          {isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                          <span>{isMuted ? "UNMUTE" : "MUTE MIC"}</span>
                        </button>
                      </div>

                      {/* Turn Taking Strategy */}
                      <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-gray-900/50">
                        <span className="text-gray-400 font-mono">TURN PACING:</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setTurnTakingMode('auto')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                              turnTakingMode === 'auto' ? 'bg-indigo-650 text-white shadow' : 'bg-gray-900 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            Auto (VAD)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTurnTakingMode('manual')}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                              turnTakingMode === 'manual' ? 'bg-indigo-650 text-white shadow' : 'bg-gray-900 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {/* Silence threshold config slider */}
                      {turnTakingMode === 'auto' && (
                        <div className="space-y-1 pt-0.5 border-t border-gray-900/40">
                          <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                            <span>Silence Timeout:</span>
                            <span className="text-indigo-400 font-bold">{silenceThreshold} seconds</span>
                          </div>
                          <input
                            type="range"
                            min="1.5"
                            max="5.0"
                            step="0.5"
                            value={silenceThreshold}
                            onChange={(e) => setSilenceThreshold(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Voice custom synthesizer selection */}
                      {availableVoices.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-900/40">
                          <span className="text-[9px] text-gray-500 font-mono flex-shrink-0 font-bold uppercase">Coach Voice:</span>
                          <select
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className="bg-gray-900 text-white border border-gray-800 text-[9px] rounded-lg px-2 py-1 focus:outline-none w-full scrollbar-thin cursor-pointer"
                          >
                            {availableVoices.map(voice => (
                              <option key={voice.name} value={voice.name} className="text-xs bg-gray-900 text-white">
                                {voice.name.replace("Microsoft", "").replace("Google", "").trim()} ({voice.lang.split("-")[0].toUpperCase()})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {playgroundMode === 'livews' && (
                    <div className="text-[9px] text-indigo-400 font-mono text-center py-1 font-bold border-t border-gray-900/50">
                      ✨ Dual Channel WebSockets Active
                    </div>
                  )}
                </div>

                {/* Real-time incoming speech caption/capturer widget */}
                {liveUserSpeech.trim() && (
                  <div className="mt-2.5 p-2 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-indigo-400 font-bold uppercase flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Transcribing Speech live:
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 italic font-sans leading-relaxed">
                      "{liveUserSpeech}"
                    </p>
                    
                    {turnTakingMode === 'manual' ? (
                      <button
                        type="button"
                        onClick={triggerManualResponse}
                        className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-lg text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Response to Coach</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-gray-500 font-mono">Replies after {silenceThreshold}s silence</span>
                        <button
                          type="button"
                          onClick={triggerManualResponse}
                          className="py-0.5 px-2 bg-indigo-900/40 hover:bg-indigo-950 text-indigo-300 text-[8px] font-mono rounded border border-indigo-500/10 cursor-pointer"
                        >
                          Send immediately ⚡
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/*对话日志滚动 */}
              <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto space-y-3.5 pr-1 max-h-[420px] min-h-[220px]">
                {messages.map((m) => (
                  <div key={m.id} className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-1 rounded-full h-5.5 w-5.5 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-901 border border-gray-755 text-indigo-400'
                    }`}>
                      {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                      m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-900 border border-gray-850 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* manual input form block */}
              <div className="border-t border-gray-750 pt-3 mt-3 space-y-2">
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendPrompt(inputText);
                    }}
                    placeholder="Type backup sandbox question..."
                    className="flex-grow bg-gray-950 border border-gray-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleSendPrompt(inputText)}
                    disabled={!inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 p-2.5 rounded-xl text-white flex-shrink-0 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: NEURAL CONNECTIONS & PARAMETER SLIDERS */}
          {sidebarTab === 'neural' && (
            <div className="flex-grow flex flex-col justify-between overflow-y-auto pr-1">
              <div className="space-y-4">
                <div className="border-b border-gray-750 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Fine-tuning &amp; Map
                  </h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">Control visual attributes or click nodes to feed topics to the AI.</p>
                </div>

                {/* SLIDERS */}
                <div className="space-y-3.5 bg-gray-900/60 p-3.5 rounded-xl border border-gray-850 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Reasonability depth focus:</span>
                      <span className="font-mono text-indigo-400 text-glow">{thinkingConfig}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={thinkingConfig} 
                      onChange={(e) => setThinkingConfig(Number(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Creative entropy level:</span>
                      <span className="font-mono text-indigo-400 text-glow">{creativeIndex}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={creativeIndex} 
                      onChange={(e) => setCreativeIndex(Number(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>

                {/* GRAPH */}
                <div className="h-44 relative bg-gray-950 border border-gray-850 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 shadow-inner">
                  <div className="absolute inset-0 opacity-10 bg-grid-glow pointer-events-none" />
                  
                  {/* Floating connections mesh */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <line x1="25%" y1="30%" x2="72%" y2="22%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                    <line x1="25%" y1="30%" x2="48%" y2="56%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                    <line x1="48%" y1="56%" x2="72%" y2="22%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" strokeDasharray="3" />
                    <line x1="18%" y1="76%" x2="48%" y2="56%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                    <line x1="72%" y1="22%" x2="82%" y2="68%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                  </svg>

                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleNodeTrigger(node.label)}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-gray-900 border border-gray-750 text-[9px] hover:border-indigo-500 font-bold text-gray-300 transition-all max-w-[100px] truncate hover:scale-110 shadow-lg cursor-pointer"
                    >
                      {node.label}
                    </button>
                  ))}

                  <div className="absolute text-[9px] font-mono opacity-25 text-indigo-400 select-none bottom-1 text-center font-bold">
                    [ SANDBOX ACTIVE NEURON MESH ]
                  </div>
                </div>

                {/* Topic quick launchers */}
                <div className="bg-gray-901 p-3.5 border border-gray-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1 font-bold">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Topic Prompts
                  </span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleNodeTrigger("Explain system design principles for distributed WebSocket proxy layers")}
                      className="w-full text-left text-[9.5px] p-2 rounded bg-gray-950 border border-gray-850 hover:border-indigo-500 text-gray-400 hover:text-white transition-all overflow-hidden text-ellipsis whitespace-nowrap block cursor-pointer"
                    >
                      "Scaling WebSocket Layers"
                    </button>
                    <button
                      onClick={() => handleNodeTrigger("How does quantum decoupling prevent computational error margins?")}
                      className="w-full text-left text-[9.5px] p-2 rounded bg-gray-950 border border-gray-850 hover:border-indigo-500 text-gray-400 hover:text-white transition-all overflow-hidden text-ellipsis whitespace-nowrap block cursor-pointer"
                    >
                      "Quantum Decoupling Limits"
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: PERSISTENT AUDIT FORGEDB TRANSACTION READS/WRITES */}
          {sidebarTab === 'db' && (
            <div className="flex-grow flex flex-col justify-between overflow-hidden">
              <div className="space-y-3.5 flex flex-col h-full overflow-hidden">
                <div className="border-b border-gray-750 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    ForgeDB Live Ledger
                  </h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">Persist prompts, response sizes, latency details, and transactional indexes to your local database ledger.</p>
                </div>

                {/* DB Telemetry rows */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-900 rounded-xl border border-gray-850 text-[10px] font-mono">
                  <div className="space-y-1 truncate">
                    <span className="text-gray-501 block">WRITE HEALTH</span>
                    <span className="text-white font-bold">{writeLatency} ms</span>
                  </div>
                  <div className="space-y-1 truncate">
                    <span className="text-gray-501 block">ROW ENTRIES</span>
                    <span className="text-white font-bold">{dbRecords.length} Rows</span>
                  </div>
                  <div className="space-y-1 truncate col-span-2 border-t border-gray-850 pt-1.5 mt-0.5">
                    <span className="text-gray-550 block">TX UNIQUE HASH</span>
                    <span className="text-indigo-400 font-bold truncate block">{lastTxHash}</span>
                  </div>
                </div>

                {/* Local search engine for logged collections */}
                <div className="flex items-center gap-1.5 relative">
                  <Search className="w-3 h-3 absolute left-2.5 text-gray-500" />
                  <input
                    type="text"
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    placeholder="Search ledger entries..."
                    className="w-full bg-gray-905 border border-gray-850 rounded-xl pl-8 pr-2 py-1.5 text-[9.5px] text-white focus:outline-none"
                  />
                </div>

                {/* Categories filtering bar */}
                <div className="flex flex-wrap gap-1">
                  {['All Topics', 'Science', 'AI', 'Dev', 'Architecture'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[8.5px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                        selectedCategory === cat ? 'bg-indigo-650 text-white font-bold' : 'bg-gray-900 text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Scrollable ledger entries container */}
                <div className="flex-grow overflow-y-auto space-y-2 max-h-[220px] min-h-[140px] pr-1">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-901 border border-gray-850 rounded-xl space-y-1 text-[10.5px]">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-emerald-400 font-bold">{log.id}</span>
                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-400 font-mono truncate"><span className="text-gray-550 mr-1">&gt; IN:</span>{log.prompt}</p>
                      <p className="text-indigo-300 font-mono truncate"><span className="text-gray-550 mr-1">&gt; OUT:</span>{log.response}</p>
                      <div className="flex justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-gray-850/60 mt-1">
                        <span>LAT: {log.latencyMs}ms</span>
                        <span>SIZE: {log.sizeBytes}b</span>
                      </div>
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-[10px]">
                      <p>No logged transaction entries conform to query.</p>
                    </div>
                  )}
                </div>

                {/* Flush database action buttons */}
                <button
                  type="button"
                  onClick={handleFlushDB}
                  disabled={dbRecords.length === 0}
                  className="w-full bg-red-650 hover:bg-red-750 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-3 rounded-xl text-[9.5px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-500/5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Audit Records</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default PlaygroundSession;
