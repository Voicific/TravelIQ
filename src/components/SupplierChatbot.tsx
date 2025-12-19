import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content, LiveServerMessage, Modality, Blob, GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { useVeeChat } from '../context/VeeChatContext.tsx';
import { useAI } from '../context/AIContext.tsx';
import { useLeads } from '../context/LeadContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { elevenLabsService } from '../services/elevenLabsVoiceService.ts';
import { SEED_SUPPLIERS } from '../constants.ts';

interface SupplierChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: { title: string; uri: string }[];
}

// Default fallback if not provided
const VEE_AVATAR_DEFAULT = "/traveliq-ai-avatar.png";

// ElevenLabs Voice IDs
const ELEVENLABS_VEE_VOICE_ID = 'agent_9701k60px56gezba55q83jamzhbk';

// --- ICONS ---
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
        <path d="M17 11a1 1 0 012 0v1a6 6 0 01-5.026 5.95L14 18v2h-4v-2l.026-.05A6 6 0 015 12v-1a1 1 0 112 0v1a4 4 0 008 0v-1z"></path>
    </svg>
);
const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);
const KeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM5.25 7.5c.414 0 .75.336.75.75v.008a.75.75 0 00-.75.75H4.5a.75.75 0 00-.75-.75V8.25c0-.414.336-.75.75-.75h.75zM6 9.75A.75.75 0 016.75 9h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM8.25 15.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75H4.5zM4.5 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H4.5zM7.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5zM10.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM13.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM16.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM18 12a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75h-.75zM18 15a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75h-.75zM19.5 9a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.75z" clipRule="evenodd" />
    </svg>
);
const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14.657 5.343a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 01-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z" />
    <path d="M12.828 7.172a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.242 1 1 0 010-1.414zM11 9a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" />
    <path fillRule="evenodd" d="M4 8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm1-3a3 3 0 00-3 3v8a3 3 0 003 3h2a3 3 0 003-3V8a3 3 0 00-3-3H5z" clipRule="evenodd" />
  </svg>
);
interface AudioWaveIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
const AudioWaveIcon: React.FC<AudioWaveIconProps> = (props) => (
    <svg viewBox="0 0 24 24" {...props} className={`animate-pulse ${props.className || ''}`}>
        <path d="M3 10h2v4H3z M7 8h2v8H7z M11 6h2v12h-2z M15 8h2v8h-2z M19 10h2v4h-2z" fill="currentColor"></path>
    </svg>
);


// --- AUDIO HELPERS ---
function encode(bytes: Uint8Array){let binary='';const len=bytes.byteLength;for(let i=0;i<len;i++){binary+=String.fromCharCode(bytes[i])}return btoa(binary)}
function decode(base64:string){const binaryString=atob(base64);const len=binaryString.length;const bytes=new Uint8Array(len);for(let i=0;i<len;i++){bytes[i]=binaryString.charCodeAt(i)}return bytes}
async function decodeAudioData(data:Uint8Array,ctx:AudioContext,sampleRate:number,numChannels:number):Promise<AudioBuffer>{const dataInt16=new Int16Array(data.buffer);const frameCount=dataInt16.length/numChannels;const buffer=ctx.createBuffer(numChannels,frameCount,sampleRate);for(let channel=0;channel<numChannels;channel++){const channelData=buffer.getChannelData(channel);for(let i=0;i<frameCount;i++){channelData[i]=dataInt16[i*numChannels+channel]/32768.0}}return buffer}
function createBlob(data:Float32Array):Blob{const l=data.length;const int16=new Int16Array(l);for(let i=0;i<l;i++){int16[i]=data[i]*32768}return{data:encode(new Uint8Array(int16.buffer)),mimeType:'audio/pcm;rate=16000'}}

// --- PRONUNCIATION CORRECTION ---
const getPhoneticallyCorrectedText = (text: string): string => {
  return text
    .replace(/\bEL AL\b/gi, 'el-AHL')
    .replace(/\bTUI\b/gi, 'Too-ee');
};

// --- LEAD EXTRACTION UTILITY ---
interface ExtractedLead {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

const extractContactDetails = (conversationText: string): ExtractedLead => {
  const lead: ExtractedLead = {};
  
  // Email pattern
  const emailMatch = conversationText.match(/[\w.-]+@[\w.-]+\.\w+/i);
  if (emailMatch) lead.email = emailMatch[0];
  
  // Phone pattern (various formats)
  const phoneMatch = conversationText.match(/(?:\+?[\d\s\-().]{10,})/);
  if (phoneMatch) lead.phone = phoneMatch[0].trim();
  
  // Name patterns (looking for "my name is X" or "I'm X" patterns)
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:name[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  ];
  for (const pattern of namePatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      lead.name = match[1].trim();
      break;
    }
  }
  
  // Company patterns
  const companyMatch = conversationText.match(/(?:i work for|company|agency)\s+([A-Z][a-zA-Z\s&.-]+)/i);
  if (companyMatch) lead.company = companyMatch[1].trim();
  
  return lead;
};

// --- SPEECH GENERATION WITH ELEVENLABS INTEGRATION ---
const generateSpeech = async (text: string, supplierId?: string): Promise<string> => {
  try {
    // For main Vee chatbot (when no supplierId provided)
    if (!supplierId) {
      console.log('Using ElevenLabs for main Vee chatbot');
      return await elevenLabsService.generateSpeech(text, ELEVENLABS_VEE_VOICE_ID);
    }

    // For specific supplier
    const supplier = SEED_SUPPLIERS.find(s => s.id === supplierId);
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Check if supplier uses ElevenLabs
    if (supplier.useElevenLabs && supplier.elevenLabsVoiceId) {
      try {
        console.log(`Using ElevenLabs for ${supplier.name}`);
        const audioUrl = await elevenLabsService.generateSpeech(
          text,
          supplier.elevenLabsVoiceId
        );
        return audioUrl;
      } catch (error) {
        console.error(`ElevenLabs failed for ${supplier.name}, falling back to Gemini:`, error);
        // Fallback to Gemini if ElevenLabs fails
      }
    }

    // Fallback to Gemini for other suppliers
    return generateGeminiSpeech(text, supplier.geminiVoiceName);
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw error;
  }
};

// Gemini fallback function
const generateGeminiSpeech = async (text: string, voiceName: string): Promise<string> => {
  // Your existing Gemini implementation
  try {
    // This would be your existing Gemini TTS logic
    // For now, we'll return an empty string to maintain compatibility
    return '';
  } catch (error) {
    console.error('Gemini speech generation failed:', error);
    throw error;
  }
};

// --- COMPONENT ---
const SupplierChatbot: React.FC<SupplierChatbotProps> = ({ isOpen, onClose, avatarUrl }) => {
  const [mode, setMode] = useState<'chat' | 'live'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'ai', 
      text: `Hello! I'm Vee, your AI assistant for TravelIQ. I'm here to help you connect with travel suppliers instantly. How can I assist you today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [transcript, setTranscript] = useState<Array<{speaker: 'user' | 'ai', text: string}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  
  const { addLead } = useLeads();
  const { isVeeChatOpen, closeVeeChat } = useUI();
  const ai = useAI();
  
  const navigate = useNavigate();
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const ttsCurrentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const inputBufferRef = useRef<Int16Array[]>([]);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const handleClose = useCallback(() => {
    // Clean up audio resources
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
      outputAudioContextRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    
    // Stop any playing audio
    if (ttsCurrentAudioSourceRef.current) {
      try {
        ttsCurrentAudioSourceRef.current.stop();
      } catch (e) {
        // Audio might already be stopped
      }
      ttsCurrentAudioSourceRef.current = null;
    }
    
    setPlayingMessageIndex(null);
    onClose();
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const fullConversation = [...messages, userMessage].map(m => `${m.sender}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: fullConversation }] }],
      });
      
      const aiText = response.text;
      const aiMessage: Message = { sender: 'ai', text: aiText };
      setMessages(prev => [...prev, aiMessage]);

      // Extract lead information if present
      const lead = extractContactDetails(aiText);
      if (lead.email || lead.name || lead.phone) {
        const leadData: Omit<import('../context/LeadContext.tsx').Lead, 'timestamp'> = {
          type: 'Agent Chat',
          name: lead.name || 'Unknown',
          email: lead.email || 'no-email-provided@example.com',
          agency: lead.company,
          message: `Phone: ${lead.phone || 'N/A'} | Captured via Vee chat`,
        };
        addLead(leadData);
        console.log('Lead captured from Vee chat conversation:', lead);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'I apologize, but I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

    const playAudioMessage = useCallback(async (text: string, index: number) => {
        if (playingMessageIndex === index) {
            // Stop current audio
            if (ttsCurrentAudioSourceRef.current) {
                try {
                    ttsCurrentAudioSourceRef.current.stop();
                } catch (e) {
                    // Audio might already be stopped
                }
                ttsCurrentAudioSourceRef.current = null;
            }
            setPlayingMessageIndex(null);
            return;
        }

        try {
            setPlayingMessageIndex(index);
            
            // Initialize output audio context if needed
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            
            const correctedText = getPhoneticallyCorrectedText(text);

            // Use ElevenLabs for main Vee chatbot
            const audioUrl = await generateSpeech(correctedText);
            
            if (audioUrl) {
                // Fetch and play ElevenLabs audio
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await outputAudioContextRef.current!.decodeAudioData(arrayBuffer);
                
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                source.onended = () => {
                    setPlayingMessageIndex(null);
                    ttsCurrentAudioSourceRef.current = null;
                };
                source.start();
                ttsCurrentAudioSourceRef.current = source;
            } else {
                // Fallback to Gemini TTS for other suppliers
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: correctedText }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    },
                });
                
                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                    const source = outputAudioContextRef.current!.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContextRef.current!.destination);
                    source.onended = () => {
                        setPlayingMessageIndex(null);
                        ttsCurrentAudioSourceRef.current = null;
                    };
                    source.start();
                    ttsCurrentAudioSourceRef.current = source;
                } else {
                    setPlayingMessageIndex(null);
                }
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setPlayingMessageIndex(null);
        }
    }, [playingMessageIndex, ai]);


    // --- LIVE CHAT LOGIC ---
    const startLiveSession = useCallback(async () => {
        if (!ai) return;
        setMode('live');
        setLiveStatus('connecting');
        setTranscript([]);

        try {
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            
            // Play greeting using ElevenLabs
            const greetingText = "Welcome to TravelIQ! I'm Vee, your AI assistant. I'm here to help you connect with travel suppliers instantly. How can I assist you today?";
            const greetingAudioUrl = await generateSpeech(greetingText);
            
            if (greetingAudioUrl) {
                const response = await fetch(greetingAudioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await outputAudioContextRef.current!.decodeAudioData(arrayBuffer);
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                source.start();
                setLiveStatus('connected');
            } else {
                setLiveStatus('connected');
            }

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (inputAudioContextRef.current.state === 'suspended') {
                await inputAudioContextRef.current.resume();
            }

            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);

            scriptProcessor.onaudioprocess = async (event) => {
                const inputBuffer = event.inputBuffer.getChannelData(0);
                const int16Buffer = new Int16Array(inputBuffer.length);
                for (let i = 0; i < inputBuffer.length; i++) {
                    int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768));
                }
                inputBufferRef.current.push(int16Buffer);

                if (inputBufferRef.current.length >= 10) {
                    const audioData = new Int16Array(inputBufferRef.current.reduce((acc, buffer) => acc + buffer.length, 0));
                    let offset = 0;
                    for (const buffer of inputBufferRef.current) {
                        audioData.set(buffer, offset);
                        offset += buffer.length;
                    }

                    const base64Audio = createBlob(new Float32Array(audioData.buffer));
                    
                    try {
                        const response = await ai.models.generateContent({
                            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                            contents: [{ parts: [{ inlineData: base64Audio }] }],
                            config: {
                                responseModalities: [Modality.AUDIO],
                                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                            },
                        });

                        const base64ResponseAudio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                        if (base64ResponseAudio) {
                            const audioBuffer = await decodeAudioData(decode(base64ResponseAudio), outputAudioContextRef.current!, 24000, 1);
                            const source = outputAudioContextRef.current!.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current!.destination);
                            nextStartTimeRef.current += audioBuffer.duration;
                            source.start(nextStartTimeRef.current);
                        }
                    } catch (error) {
                        console.error('Live session error:', error);
                    }

                    inputBufferRef.current = [];
                }
            };

            // Play greeting response
            const greetingText = "Welcome to TravelIQ! I'm Vee, your AI assistant. I'm here to help you connect with travel suppliers instantly. How can I assist you today?";
            
            // Use ElevenLabs for greeting
            const greetingAudioUrl = await generateSpeech(greetingText);
            
            if (greetingAudioUrl) {
                const response = await fetch(greetingAudioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await outputAudioContextRef.current!.decodeAudioData(arrayBuffer);
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                source.start();
            }

        } catch (error) {
            console.error('Live session error:', error);
            setLiveStatus('error');
        }
    }, [ai]);

    const stopLiveSession = useCallback(() => {
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        setMode('chat');
        setLiveStatus('connecting');
        setTranscript([]);
    }, []);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopLiveSession();
        } else {
            startLiveSession();
        }
    }, [isRecording, startLiveSession, stopLiveSession]);

    // Audio wave indicator for live mode
    const renderAudioWave = () => (
        <div className="flex items-center justify-center h-32 bg-brand-bg/30 rounded-lg border border-brand-light/10">
            <AudioWaveIcon className="w-8 h-8 text-brand-cyan" />
        </div>
    );

    // --- RENDERING LOGIC ---
    const renderContent = () => {
        switch (mode) {
            case 'chat':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${
                                        message.sender === 'user' 
                                            ? 'bg-brand-primary text-white' 
                                            : 'bg-brand-bg/50 text-brand-light border border-brand-light/10'
                                    }`}>
                                        <p className="text-sm">{message.text}</p>
                                        {message.sender === 'ai' && (
                                            <button
                                                onClick={() => playAudioMessage(message.text, index)}
                                                className="mt-2 text-xs text-brand-cyan hover:text-brand-cyan-light transition-colors flex items-center gap-1"
                                                aria-label={playingMessageIndex === index ? "Stop audio" : "Play audio"}
                                            >
                                                <SpeakerIcon className="w-3 h-3" />
                                                {playingMessageIndex === index ? 'Stop' : 'Listen'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-brand-bg/50 text-brand-light border border-brand-light/10 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="border-t border-brand-light/10 p-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask about travel suppliers..."
                                    className="flex-1 bg-brand-bg/50 border border-brand-light/20 rounded-lg px-4 py-2 text-brand-light placeholder-brand-gray focus:outline-none focus:border-brand-cyan"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'live':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 p-4">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-heading text-lg font-semibold text-brand-light">Live Voice Chat</h3>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        liveStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                                        liveStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {liveStatus === 'connected' ? 'Connected' : 
                                         liveStatus === 'connecting' ? 'Connecting...' : 'Error'}
                                    </div>
                                </div>
                                <p className="text-sm text-brand-gray">
                                    Speak naturally and I'll respond with voice. Click the microphone to start or stop.
                                </p>
                            </div>
                            
                            {renderAudioWave()}
                            
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={toggleRecording}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                                        isRecording 
                                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                                            : 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                                    }`}
                                >
                                    {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                                    {isRecording ? 'Stop Recording' : 'Start Voice Chat'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-brand-bg/70 backdrop-blur-lg border border-brand-light/10 rounded-xl shadow-2xl p-6 max-w-lg w-full relative flex flex-col h-[70vh]">
                <div className="flex justify-between items-center border-b border-brand-light/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-light/20">
                            <img src={avatarUrl || VEE_AVATAR_DEFAULT} alt="Vee" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="font-heading text-xl font-bold text-brand-light">Chat with Vee</h2>
                    </div>
                    <button onClick={handleClose} className="text-brand-gray hover:text-brand-light transition-colors" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default SupplierChatbot;