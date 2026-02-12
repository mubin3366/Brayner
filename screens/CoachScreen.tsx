
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, GraduationCap, Loader2, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { getState, updateState } from '../services/localEngine';

const CoachScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = getState();
    if (state.coach.history.length > 0) {
      setMessages(state.coach.history);
    } else {
      const initial = [{ role: 'model', parts: [{ text: t.coachWelcome }] }] as ChatMessage[];
      setMessages(initial);
      updateState({ coach: { history: initial } });
    }
  }, [t.coachWelcome]);

  useEffect(() => {
    if (messages.length > 0) {
      updateState({ coach: { history: messages } });
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: textToSend }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newMessages,
        config: {
          systemInstruction: `You are Professor Brayner, an elite academic mentor for Bangladeshi SSC and HSC students. Respond formally in the detected language. Focus on syllabus mastery, study discipline, and exams.`,
          temperature: 0.6,
        },
      });

      const modelResponse: ChatMessage = { 
        role: 'model', 
        parts: [{ text: response.text || "I apologize, my analysis failed." }] 
      };
      setMessages([...newMessages, modelResponse]);
    } catch (error) {
      const errorResponse: ChatMessage = { 
        role: 'model', 
        parts: [{ text: "Error in communication. Please try again shortly." }] 
      };
      setMessages([...newMessages, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm(t.confirmReset)) {
      const initial = [{ role: 'model', parts: [{ text: t.coachWelcome }] }] as ChatMessage[];
      setMessages(initial);
      updateState({ coach: { history: initial } });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfcf9] dark:bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-90">
            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-950 dark:bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-indigo-950 dark:text-indigo-400 leading-tight tracking-tight">{t.coachTitle}</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.coachStatus}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={clearHistory} className="p-2 text-slate-300 hover:text-red-500 transition-all active:scale-90">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 md:pb-32 scroll-smooth hide-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] md:max-w-[75%] p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
              msg.role === 'user' 
              ? 'bg-indigo-700 text-white rounded-tr-none border-indigo-600' 
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.parts[0].text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consulting Knowledge Base...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-24 left-0 right-0 md:relative md:bottom-0 p-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.coachInputPlaceholder}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none dark:text-slate-200"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-4 p-2 bg-indigo-900 text-white rounded-lg active:scale-90 disabled:opacity-40"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachScreen;
