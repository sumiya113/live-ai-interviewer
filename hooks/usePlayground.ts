import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAiClient } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// Infer LiveSession type
const aiForTypes = getAiClient();
type LiveSession = Awaited<ReturnType<typeof aiForTypes.live.connect>>;

// --- Audio Helper Functions for Raw PCM ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const blobToBase64 = (blob: globalThis.Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface UsePlaygroundProps {
    onFinish?: () => void;
    videoElement: React.RefObject<HTMLVideoElement>;
}

export const usePlayground = ({ onFinish, videoElement }: UsePlaygroundProps) => {
    const [playgroundMode, setPlaygroundMode] = useState<'webspeech' | 'livews'>('webspeech');
    const [status, setStatus] = useState<'Connecting...' | 'Connected' | 'Finished' | 'Error'>('Connecting...');
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<{ source: 'user' | 'model'; text: string; timestamp: number }[]>([]);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Web Speech States
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [liveUserSpeech, setLiveUserSpeech] = useState<string>('');
    const [turnTakingMode, setTurnTakingMode] = useState<'auto' | 'manual'>('auto');
    const [silenceThreshold, setSilenceThreshold] = useState<number>(2.5);

    // Refs for live callback handlers to completely avoid React stale closures
    const playgroundModeRef = useRef<'webspeech' | 'livews'>('webspeech');
    const isModelSpeakingRef = useRef(false);
    const isMutedRef = useRef(false);
    const statusRef = useRef<'Connecting...' | 'Connected' | 'Finished' | 'Error'>('Connecting...');
    const recognitionRef = useRef<any>(null);
    const turnTakingModeRef = useRef<'auto' | 'manual'>('auto');
    const silenceThresholdRef = useRef<number>(2.5);
    const liveUserSpeechRef = useRef<string>('');

    // Live WebSocket refs
    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextAudioStartTimeRef = useRef<number>(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const finalTranscriptRef = useRef<{ source: 'user' | 'model'; text: string; timestamp: number }[]>([]);
    const frameIntervalRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const silenceTimeoutRef = useRef<any>(null);

    // Sync refs
    useEffect(() => {
        playgroundModeRef.current = playgroundMode;
    }, [playgroundMode]);

    useEffect(() => {
        isModelSpeakingRef.current = isModelSpeaking;
    }, [isModelSpeaking]);

    useEffect(() => {
        turnTakingModeRef.current = turnTakingMode;
    }, [turnTakingMode]);

    useEffect(() => {
        silenceThresholdRef.current = silenceThreshold;
    }, [silenceThreshold]);

    useEffect(() => {
        liveUserSpeechRef.current = liveUserSpeech;
    }, [liveUserSpeech]);

    useEffect(() => {
        isMutedRef.current = isMuted;
        if (playgroundMode === 'webspeech') {
            if (isMuted) {
                try { recognitionRef.current?.stop(); } catch(e){}
            } else if (status === 'Connected' && !isModelSpeaking) {
                try { recognitionRef.current?.start(); } catch(e){}
            }
        }
    }, [isMuted, playgroundMode, status]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Timer logic
    useEffect(() => {
        if (status === 'Connected' && !timerIntervalRef.current) {
            timerIntervalRef.current = window.setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (status !== 'Connected' && timerIntervalRef.current) {
            window.clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        return () => {
            if (timerIntervalRef.current) {
                window.clearInterval(timerIntervalRef.current);
            }
        };
    }, [status]);

    const updateTranscript = useCallback((newEntry: { source: 'user' | 'model'; text: string }) => {
        const entry = { ...newEntry, timestamp: Date.now() };
        setTranscript(prev => [...prev, entry]);
        finalTranscriptRef.current.push(entry);
    }, []);

    // Load custom text-to-speech voices
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const voicesList = window.speechSynthesis.getVoices();
                const enVoices = voicesList.filter(v => v.lang.startsWith('en'));
                setAvailableVoices(enVoices);
                
                // Select a default voice
                const preferred = enVoices.find(v => 
                    v.name.includes('Google') || 
                    v.name.includes('Samantha') || 
                    v.name.includes('Natural') || 
                    v.name.includes('Daniel')
                );
                if (preferred) {
                    setSelectedVoiceName(preferred.name);
                } else if (enVoices.length > 0) {
                    setSelectedVoiceName(enVoices[0].name);
                }
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Speech Synthesis Executor
    const speakText = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        
        try { window.speechSynthesis.cancel(); } catch(e){}
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const activeVoice = voices.find(v => v.name === selectedVoiceName);
        if (activeVoice) {
            utterance.voice = activeVoice;
        }
        
        utterance.onstart = () => {
            setIsModelSpeaking(true);
            isModelSpeakingRef.current = true;
            try { recognitionRef.current?.stop(); } catch(e){}
        };
        
        utterance.onend = () => {
            setIsModelSpeaking(false);
            isModelSpeakingRef.current = false;
            // Trigger voice recognition restart if applicable
            if (playgroundModeRef.current === 'webspeech' && !isMutedRef.current && statusRef.current === 'Connected') {
                try { recognitionRef.current?.start(); } catch(e){}
            }
        };

        utterance.onerror = () => {
            setIsModelSpeaking(false);
            isModelSpeakingRef.current = false;
            if (playgroundModeRef.current === 'webspeech' && !isMutedRef.current && statusRef.current === 'Connected') {
                try { recognitionRef.current?.start(); } catch(e){}
            }
        };

        window.speechSynthesis.speak(utterance);
    }, [selectedVoiceName]);

    // Send Message unifying typed prompts and speech pipeline
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        if (playgroundModeRef.current === 'webspeech') {
            updateTranscript({ source: 'user', text: text.trim() });
            
            // Stop talking or listening to prevent collision
            try { window.speechSynthesis.cancel(); } catch(e){}
            try { recognitionRef.current?.stop(); } catch(e){}
            
            try {
                setIsLoadingResponse(true);
                const ai = getAiClient();
                const response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: text.trim(),
                    config: {
                        systemInstruction: `You are a brilliant, highly seasoned, and empathetic career partner and interviewer in the InterviewForge Real-time voice suite.
Your objective is to conduct an outstanding, collaborative, and entirely organic live discussion that feels exactly like talking to an elite high-level tech executive or empathetic coach.
- DO NOT sound like an AI assistant. Do not say "As an AI..." or present standard list templates.
- Listen carefully to the candidate's arguments, acknowledge them explicitly with professional interest, and offer deep business reasoning or strategic suggestions.
- Keep the dialogue extremely fluid by using occasional human conversational phrases (e.g. "Ah, I see where you're coming from there,", "That makes perfect sense, especially considering...", "Hmm, that's incredibly interesting. Let's dig deeper into...").
- Keep your verbal responses conversational, focused, and human-like (between 2 to 3 natural, expressive sentences per turn) so the session moves with professional rhythm rather than text monologues. Avoid listing multiple points; focus on one key idea to discuss further.`
                    }
                });
                
                const reply = response.text || "I'm processing. Let's discuss further.";
                updateTranscript({ source: 'model', text: reply });
                setIsLoadingResponse(false);
                speakText(reply);
            } catch (err) {
                console.error("Gemini context content generation failed:", err);
                setIsLoadingResponse(false);
                updateTranscript({ source: 'model', text: "Signal latency encountered. Let's try that again!" });
            }
        } else {
            // Live WebSocket API sendMessage
            if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({
                    text: text.trim()
                });
            }
        }
    }, [updateTranscript, speakText]);

    // Force send whatever speech has been accumulated up to this point
    const triggerManualResponse = useCallback(async () => {
        const textToSend = liveUserSpeechRef.current.trim();
        if (textToSend) {
            setLiveUserSpeech('');
            liveUserSpeechRef.current = '';
            await sendMessage(textToSend);
        }
    }, [sendMessage]);

    const endPlayground = useCallback(() => {
        setStatus('Finished');
        try { window.speechSynthesis.cancel(); } catch(e){}
        try { recognitionRef.current?.stop(); } catch(e){}
        
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        if (frameIntervalRef.current) {
          window.clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        if (onFinish) onFinish();
    }, [onFinish]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // Main multi-mode session engine controller
    useEffect(() => {
        const ai = getAiClient();
        
        const systemInstruction = `You are a brilliant, empathetic, and highly human career companion and brainstorming mentor in the InterviewForge Real-time voice suite.
Your objective is to conduct a highly collaborative, supportive, and entirely organic dialogue that feels exactly like speaking to a premium hiring manager, director, or expert mentor.
1. DO NOT sound like an AI assistant. Avoid robotic templates or bullet lists.
2. Listen carefully to user ideas, build on top of them, and guide the brainstorm with professional intelligence and deep reasoning.
3. Bring professional perspective, real-world case experiences, and natural conversational cadence (e.g. "Ah, that's a brilliant observation,", "That absolutely checks out, especially in dynamic situations...", "Hmm, let's look at the other side of that").
4. Keep your verbal responses conversational, engaging, and highly concise (about 2-3 natural sentences per turn) so that the live speech channel flows seamlessly.`;
        
        let sessionPromise: Promise<LiveSession> | null = null;
        let active = true;

        const initialize = async () => {
            // Start Local Video Stream PIP for immersive atmosphere
            try {
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                if (videoElement.current && active) {
                    videoElement.current.srcObject = mediaStreamRef.current;
                }
            } catch (err) {
                console.warn("Media devices stream fetch failed, using visual avatars:", err);
            }

            if (playgroundMode === 'webspeech') {
                // Initialize browser native SpeechRecognition implementation
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    setError("Web Speech API is not supported in this browser. Please use Chrome, Safari or Edge.");
                    setStatus('Error');
                    return;
                }

                try {
                    const rec = new SpeechRecognition();
                    rec.continuous = true;
                    rec.interimResults = true;
                    rec.lang = 'en-US';

                    let fullSpeechBuffer = '';

                    rec.onstart = () => {
                        if (active) setIsListening(true);
                    };

                    rec.onerror = (e: any) => {
                        console.warn("Speech recognition warning:", e.error);
                        if (e.error === 'network') {
                            setError("Speech Recognition network interface issue.");
                        }
                    };

                    rec.onend = () => {
                        if (active) {
                            setIsListening(false);
                            // Auto restart if conditions match
                            if (active && playgroundModeRef.current === 'webspeech' && !isModelSpeakingRef.current && !isMutedRef.current && statusRef.current === 'Connected') {
                                try { rec.start(); } catch(err){}
                            }
                        }
                    };

                    rec.onresult = (event: any) => {
                        if (!active) return;
                        
                        let interimTranscript = '';
                        let newFinalTranscript = '';
                        
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                newFinalTranscript += event.results[i][0].transcript + ' ';
                            } else {
                                interimTranscript += event.results[i][0].transcript;
                            }
                        }

                        if (newFinalTranscript) {
                            fullSpeechBuffer += newFinalTranscript;
                        }

                        const currentPhrase = (fullSpeechBuffer + interimTranscript).trim();
                        setLiveUserSpeech(currentPhrase);

                        // Clear the active timer
                        if (silenceTimeoutRef.current) {
                            clearTimeout(silenceTimeoutRef.current);
                            silenceTimeoutRef.current = null;
                        }

                        // Debounce sending ONLY when turn-taking is set to auto
                        if (turnTakingModeRef.current === 'auto') {
                            silenceTimeoutRef.current = setTimeout(async () => {
                                const completedText = (fullSpeechBuffer + interimTranscript).trim();
                                if (completedText && statusRef.current === 'Connected' && !isModelSpeakingRef.current) {
                                    fullSpeechBuffer = '';
                                    setLiveUserSpeech('');
                                    await sendMessage(completedText);
                                }
                            }, silenceThresholdRef.current * 1000);
                        }
                    };

                    recognitionRef.current = rec;
                    setStatus('Connected');

                    // Prompt initial welcome greeting from AI Coach instantly
                    setTimeout(() => {
                        if (active) {
                            const welcome = "Welcome to the InterviewForge AI Playground! What shall we discuss today?";
                            updateTranscript({ source: 'model', text: welcome });
                            speakText(welcome);
                        }
                    }, 500);

                } catch (err) {
                    console.error("Speech Recognition startup exception:", err);
                    setError("Failed to initialize Web Speech Recognition.");
                    setStatus('Error');
                }

            } else {
                // Live WebSocket backing-channel
                try {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                    canvasRef.current = document.createElement('canvas');

                    sessionPromise = ai.live.connect({
                        model: 'gemini-3.1-flash-live-preview',
                        callbacks: {
                            onopen: () => {
                                if (!active) return;
                                setStatus('Connected');

                                // Stream Audio
                                if (mediaStreamRef.current) {
                                  const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                                  scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                                  
                                  scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                      if (!active || isMutedRef.current) return;
                                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                      const pcmBlob = createPcmBlob(inputData);
                                      if (sessionPromise && active) {
                                        sessionPromise.then((session) => {
                                          if (active) session.sendRealtimeInput({ audio: pcmBlob });
                                        }).catch(e => console.error("Error sending audio input:", e));
                                      }
                                  };
                                  source.connect(scriptProcessorRef.current);
                                  scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                                }
                                
                                // Stream Video
                                const ctx = canvasRef.current?.getContext('2d');
                                if (videoElement.current && ctx) {
                                    frameIntervalRef.current = window.setInterval(() => {
                                        if(!videoElement.current || !active) return;
                                        canvasRef.current!.width = videoElement.current.videoWidth;
                                        canvasRef.current!.height = videoElement.current.videoHeight;
                                        ctx.drawImage(videoElement.current, 0, 0, videoElement.current.videoWidth, videoElement.current.videoHeight);
                                        canvasRef.current!.toBlob(
                                          async (blob) => {
                                              if (blob && sessionPromise && active) {
                                                  const base64Data = await blobToBase64(blob);
                                                  sessionPromise.then((session) => {
                                                    if (active) {
                                                      session.sendRealtimeInput({
                                                        video: { data: base64Data, mimeType: 'image/jpeg' }
                                                      });
                                                    }
                                                  }).catch(e => console.error("Error sending video frame:", e));
                                              }
                                          },
                                          'image/jpeg',
                                          0.7
                                        );
                                    }, 1000);
                                }
                            },
                            onmessage: async (message: LiveServerMessage) => {
                                if (!active) return;
                                // Handle audio bytes
                                const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                                if (audioData && outputAudioContextRef.current) {
                                    setIsModelSpeaking(true);
                                    const audioCtx = outputAudioContextRef.current;
                                    nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, audioCtx.currentTime);
                                    const audioBuffer = await decodeAudioData(decode(audioData), audioCtx, 24000, 1);
                                    const source = audioCtx.createBufferSource();
                                    source.buffer = audioBuffer;
                                    source.connect(audioCtx.destination);
                                    source.addEventListener('ended', () => {
                                        outputAudioSourcesRef.current.delete(source);
                                        if (outputAudioSourcesRef.current.size === 0) {
                                            setIsModelSpeaking(false);
                                        }
                                    });
                                    source.start(nextAudioStartTimeRef.current);
                                    nextAudioStartTimeRef.current += audioBuffer.duration;
                                    outputAudioSourcesRef.current.add(source);
                                }

                                if (message.serverContent?.interrupted) {
                                    for (const source of outputAudioSourcesRef.current.values()) {
                                      try { source.stop(); } catch(e){}
                                    }
                                    outputAudioSourcesRef.current.clear();
                                    nextAudioStartTimeRef.current = 0;
                                    setIsModelSpeaking(false);
                                }

                                // Handle transcriptions
                                if (message.serverContent?.outputTranscription?.text) {
                                    currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                                }
                                if (message.serverContent?.inputTranscription?.text) {
                                    currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                                }
                                if(message.serverContent?.turnComplete) {
                                    if(currentInputTranscriptionRef.current.trim()) {
                                        updateTranscript({source: 'user', text: currentInputTranscriptionRef.current.trim()});
                                    }
                                    if(currentOutputTranscriptionRef.current.trim()) {
                                        updateTranscript({source: 'model', text: currentOutputTranscriptionRef.current.trim()});
                                    }
                                    currentInputTranscriptionRef.current = '';
                                    currentOutputTranscriptionRef.current = '';
                                }
                            },
                            onerror: (e: ErrorEvent) => {
                                console.error("Playground Session error:", e);
                                if (active) {
                                    setError(`Session error: ${e.message || "WebSocket Handshake Terminated"}`);
                                    setStatus('Error');
                                }
                            },
                            onclose: (e: CloseEvent) => {
                               console.log("Playground Session closed.");
                               if(active && statusRef.current !== 'Finished') {
                                 setStatus('Finished');
                               }
                            },
                        },
                        config: {
                            responseModalities: [Modality.AUDIO],
                            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                            systemInstruction,
                            inputAudioTranscription: {},
                            outputAudioTranscription: {},
                        },
                    });
                    
                    sessionRef.current = await sessionPromise;

                } catch (err) {
                    console.error("Playground setup initialization failed:", err);
                    if (active) {
                        setError(err instanceof Error ? err.message : "WebSocket connections blocked inside current frame.");
                        setStatus('Error');
                    }
                }
            }
        };

        setStatus('Connecting...');
        initialize();

        return () => {
            active = false;
            try { window.speechSynthesis.cancel(); } catch(e){}
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            if (sessionRef.current) {
                sessionRef.current.close();
                sessionRef.current = null;
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (outputAudioContextRef.current) {
                outputAudioContextRef.current.close();
                outputAudioContextRef.current = null;
            }
            if(scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
            }
            if (frameIntervalRef.current) {
              window.clearInterval(frameIntervalRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playgroundMode, videoElement, onFinish]);

    return { 
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
    };
};
