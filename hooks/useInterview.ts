import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewConfig, TranscriptEntry } from '../types';
import { getAiClient } from '../services/geminiService';
import { FunctionDeclaration, GoogleGenAI, LiveServerMessage, Modality, Type, Blob } from '@google/genai';

// FIX: Infer LiveSession type from the Gemini client for type safety since it's not exported.
const aiForTypes = getAiClient();
type LiveSession = Awaited<ReturnType<typeof aiForTypes.live.connect>>;

// --- Audio Helper Functions ---

// From base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// From Uint8Array to base64
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decodes raw PCM audio into an AudioBuffer
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

// Converts a Float32Array from microphone to a base64 encoded PCM blob
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

const endInterviewFunctionDeclaration: FunctionDeclaration = {
    name: 'endInterview',
    description: 'Call this function when the interview is complete and you have no more questions.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            reason: {
                type: Type.STRING,
                description: 'A brief reason for ending the interview, e.g., "All questions asked."',
            },
        },
        required: ['reason'],
    },
};

interface UseInterviewProps {
    interviewConfig: InterviewConfig;
    onFinish: (transcript: TranscriptEntry[]) => void;
    videoElement: React.RefObject<HTMLVideoElement>;
}

export const useInterview = ({ interviewConfig, onFinish, videoElement }: UseInterviewProps) => {
    const [status, setStatus] = useState<'Connecting...' | 'Connected' | 'Finished' | 'Error'>('Connecting...');
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextAudioStartTimeRef = useRef<number>(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const finalTranscriptRef = useRef<TranscriptEntry[]>([]);
    const frameIntervalRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    // Effect for managing the interview timer
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

    const updateTranscript = useCallback((newEntry: Omit<TranscriptEntry, 'timestamp'>) => {
        const entry = { ...newEntry, timestamp: Date.now() };
        setTranscript(prev => [...prev, entry]);
        finalTranscriptRef.current.push(entry);
    }, []);

    const endInterview = useCallback(() => {
        setStatus('Finished');
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
        onFinish(finalTranscriptRef.current);
    }, [onFinish]);


    useEffect(() => {
        const ai = getAiClient();
        
        let systemInstruction: string;
        if (interviewConfig.type === 'role') {
            systemInstruction = `You are an expert interviewer conducting a live interview for a ${interviewConfig.difficulty}-level ${interviewConfig.role} position.
            Start by greeting the candidate and explaining the interview process.
            Ask one question at a time and wait for the candidate's response.
            Your questions should be relevant to the ${interviewConfig.role} role and ${interviewConfig.difficulty} level.
            Keep the conversation flowing naturally.
            When you have asked enough questions and are ready to conclude, you MUST call the 'endInterview' function.`;
        } else {
            systemInstruction = `You are an expert interviewer conducting a live interview based on the provided job description.
            Your primary goal is to assess the candidate's suitability for the role described below.
            
            **Instructions:**
            1. Start by greeting the candidate and briefly explaining that the interview will be based on the job description they provided.
            2. Ask exactly ${interviewConfig.numQuestions} questions, one at a time.
            3. Your questions must be directly relevant to the skills, responsibilities, and qualifications listed in the job description.
            4. After asking the ${interviewConfig.numQuestions}th question and waiting for the candidate's response, you MUST conclude the interview by calling the 'endInterview' function. Do not ask any more questions after the ${interviewConfig.numQuestions}th one.

            **Job Description:**
            ---
            ${interviewConfig.jobDescription}
            ---`;
        }
        
        let sessionPromise: Promise<LiveSession> | null = null;
        
        const initialize = async () => {
            try {
                // Media Setup
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                if (videoElement.current) {
                    videoElement.current.srcObject = mediaStreamRef.current;
                }
                
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                canvasRef.current = document.createElement('canvas');

                sessionPromise = ai.live.connect({
                    model: 'gemini-3.1-flash-live-preview',
                    callbacks: {
                        onopen: () => {
                            setStatus('Connected');

                            // Start streaming audio from microphone
                            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                            scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createPcmBlob(inputData);
                                if (sessionPromise) {
                                  sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ audio: pcmBlob });
                                  }).catch(e => console.error("Error sending audio input:", e));
                                }
                            };
                            source.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                            
                            // Start streaming video frames
                            const ctx = canvasRef.current.getContext('2d');
                            if (videoElement.current && ctx) {
                                frameIntervalRef.current = window.setInterval(() => {
                                    if(!videoElement.current) return;
                                    canvasRef.current!.width = videoElement.current.videoWidth;
                                    canvasRef.current!.height = videoElement.current.videoHeight;
                                    ctx.drawImage(videoElement.current, 0, 0, videoElement.current.videoWidth, videoElement.current.videoHeight);
                                    canvasRef.current!.toBlob(
                                      async (blob) => {
                                          if (blob && sessionPromise) {
                                              const base64Data = await blobToBase64(blob);
                                              sessionPromise.then((session) => {
                                                session.sendRealtimeInput({
                                                  video: { data: base64Data, mimeType: 'image/jpeg' }
                                                });
                                              }).catch(e => console.error("Error sending video frame:", e));
                                          }
                                      },
                                      'image/jpeg',
                                      0.7 // JPEG quality
                                  );
                                }, 1000 / 5); // 5 frames per second
                            }
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            // Handle function calls
                            if (message.toolCall?.functionCalls) {
                                for(const fc of message.toolCall.functionCalls) {
                                    if(fc.name === 'endInterview') {
                                        endInterview();
                                    }
                                }
                            }

                            // Handle audio output
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
                                  source.stop();
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
                            console.error("Session error:", e);
                            setError(`Session error: ${e.message}`);
                            setStatus('Error');
                        },
                        onclose: (e: CloseEvent) => {
                           console.log("Session closed.");
                           if(status !== 'Finished') {
                            setStatus('Finished'); // May have already been set by endInterview
                           }
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        systemInstruction,
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        tools: [{ functionDeclarations: [endInterviewFunctionDeclaration] }],
                    },
                });
                
                sessionRef.current = await sessionPromise;

            } catch (err) {
                console.error("Initialization failed:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred during setup.");
                setStatus('Error');
            }
        };

        initialize();

        return () => {
            // Cleanup function
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
    }, [interviewConfig, onFinish, videoElement]);

    return { status, transcript, error, endInterview, isModelSpeaking, elapsedTime };
};