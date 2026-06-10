import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Brain, AlertCircle, RefreshCw } from 'lucide-react';
import { getAiClient } from '../services/geminiService';

interface ChatMessage {
  id: string;
  source: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "How can I level up my 'Leadership' score?",
  "Give me a mock scenario for an Advanced Software Engineer.",
  "Write an ideal STAR response for: 'Tell me about a time you failed.'",
  "How do I keep consistent eye contact during virtual video interviews?"
];

export const CoachChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      source: 'model',
      text: "Hello! I am Zephyr, your Executive Career Coach at InterviewForge Pro. I have reviewed your performance metrics and portfolio index. Ask me any strategic career question, standard behavioral answer designs, or target interview preparations!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      source: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setInputText('');
    setError(null);

    try {
      // Build high-context prompt
      const conversationHistory = messages
        .concat(userMsg)
        .map(m => `${m.source === 'model' ? 'Interviewer Coach' : 'Candidate'}: ${m.text}`)
        .join('\n\n');

      const systemPrompt = `You are Zephyr, an elite Executive Career Coach and Lead Professional Recruiter at InterviewForge Pro.
      Based on the candidate's requests, guide them on how to ace interviews, format standard response workflows (STAR method), draft tactical follow-ups, and structure their thoughts cleanly.
      Keep your answer highly insightful, encouraging, and structured with clear bullets. Use markdown headers if needed.
      
      Conversation timeline:
      ${conversationHistory}
      
      Coach (Response):`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: systemPrompt,
      });

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        source: 'model',
        text: response.text || "I apologize, I'm analyzing that query but need a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (e) {
      console.error(e);
      setError("Failed to reach Zephyr's neural bridge. Please check your internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700/80 flex flex-col h-[75vh]">
      {/* Coach Header */}
      <div className="p-5 border-b border-gray-700 flex items-center justify-between bg-gray-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-400 font-bold text-white relative">
            <Bot className="w-5 h-5 text-indigo-100" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Zephyr AI</h3>
            <p className="text-xs text-indigo-300 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Executive AI Career Coach
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                source: 'model',
                text: "Session restarted. I am ready to deep-dive into your behavioral strategies or interview preparations!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setError(null);
          }}
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 hover:border-gray-600 rounded-xl flex items-center gap-1 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.source === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`p-1.5 rounded-full h-8 w-8 flex items-center justify-center ${msg.source === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-indigo-400 border border-gray-700'}`}>
              {msg.source === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.source === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-900/60 text-gray-200 border border-gray-800 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[10px] text-gray-500 mt-1 block ${msg.source === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="p-1.5 rounded-full h-8 w-8 bg-gray-900 border border-gray-700 text-indigo-300 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-gray-900/40 border border-gray-800 text-gray-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span>Thinking... Mapping response strategies</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/20 border border-red-500/20 text-red-300 rounded-xl p-3 text-xs flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick prompts - hide when user is sending to keep UI clean */}
      {!isSending && messages.length < 5 && (
        <div className="px-5 py-2 flex flex-wrap gap-2 border-t border-gray-700/40 bg-gray-850/40">
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(qp)}
              className="text-xs bg-gray-900/60 hover:bg-indigo-950/30 text-gray-400 hover:text-indigo-300 border border-gray-850 hover:border-indigo-500/20 rounded-lg px-3 py-1.5 text-left transition-all max-w-[450px] truncate"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 border-t border-gray-700 bg-gray-850">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask Zephyr about standard behaviors, formatting, or custom mock preparations..."
            className="flex-grow bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachChat;
