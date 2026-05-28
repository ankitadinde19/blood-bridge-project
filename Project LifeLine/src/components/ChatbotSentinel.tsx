import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Heart, Shield, Activity, Sparkles } from 'lucide-react';
import { apiFetch } from '../api';

const fetch = apiFetch;

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const ChatbotSentinel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I am **LifeLink Sentinel**, your AI health assistant. I can help with blood type compatibility questions, donation frequency requirements, preparation checklists, or help you understand how to navigate the LifeLink system. Ask me anything!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = customText || inputText;
    if (!queryText.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistoryForAPI = [...messages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/gemini/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistoryForAPI })
      });

      if (!res.ok) throw new Error("Chat api request failed");
      const data = await res.json();

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "My neural connection was briefly interrupted. Standard Clinical fallback recommendation: ensure you are well hydrated with high-iron nutrition before donating. *Please check your server GEMINI_API_KEY if this persists.*",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "What are donor eligibility guidelines?",
    "How often can I donate blood?",
    "Why is O- negative so critical?",
    "How should I prepare for a blood drive?"
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group border border-red-500"
      >
        <Sparkles className="h-5 w-5 animate-pulse text-yellow-300 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-sans font-semibold text-sm whitespace-nowrap">
          Ask Sentinel AI
        </span>
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Slide-out Sidebar Chat Console */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-xs font-sans animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative border-l border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    LifeLink Sentinel
                    <span className="bg-yellow-400 text-slate-950 text-[9px] px-1 rounded font-mono uppercase tracking-tight font-semibold">AI Assistant</span>
                  </h3>
                  <p className="text-[11px] text-red-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-ping"></span>
                    Clinical Logistics Expert
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              <div className="bg-red-50 border border-red-100/80 rounded-xl p-3 text-xs text-red-800 space-y-2 shadow-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-red-600 fill-current" /> Medical Disclaimer:
                </p>
                <p className="text-slate-600 leading-relaxed font-sans">
                  LifeLink Sentinel provides guidance on scheduling, operations, and general health eligibility based on Red Cross policies. It is not a replacement for legal medical diagnostics.
                </p>
              </div>

              {messages.map((m, index) => {
                const isBot = m.sender === 'bot';
                return (
                  <div key={index} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                      isBot 
                        ? 'bg-white text-slate-800 border border-slate-250 rounded-tl-none font-normal' 
                        : 'bg-red-600 text-white rounded-tr-none'
                    }`}>
                      {/* Simple custom markdown renderer helper for bold text */}
                      <p className="leading-relaxed font-sans select-text whitespace-pre-wrap">
                        {m.text.split('**').map((tok, i) => i % 2 !== 0 ? <strong key={i} className="font-bold">{tok}</strong> : tok)}
                      </p>
                      <span className={`text-[10px] block mt-1 select-none font-mono ${isBot ? 'text-slate-400 text-right' : 'text-red-100 text-right'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 shadow-sm flex items-center gap-1.5 text-slate-500 text-xs">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="font-mono text-[10px] pl-1 text-slate-400">Analysing records...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action prompts */}
            <div className="bg-slate-50 px-4 pb-2 pt-1 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-mono mb-1.5 uppercase font-semibold">Suggested Inquiries:</p>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(undefined, q)}
                    className="text-[11px] bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-slate-250 transition-all font-sans cursor-pointer text-left leading-snug"
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask clinical or logistics advice..."
                className="flex-1 bg-slate-100 hover:bg-slate-150 focus:bg-white text-slate-800 rounded-xl px-4 py-2 text-sm border-0 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-750 text-white p-2.5 rounded-xl cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition-all text-xs flex items-center justify-center"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
