
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserState, Message, PlatformConfig } from '../types';
import { chatWithNero } from '../geminiService';

interface ChatWidgetProps {
  user: UserState;
  onQuery: (isPaid: boolean) => void;
  onConnect: () => void;
  onPricing: () => void;
  detectedDapp?: string | null;
  embedded?: boolean;
  platformConfig?: PlatformConfig;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  user, onQuery, onConnect, detectedDapp, embedded = false, platformConfig 
}) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPaid = user.freeQuestionsRemaining <= 0;
  const currentFee = platformConfig?.feePerQuery || 0.005;

  useEffect(() => {
    const greeting = `Hello! ${platformConfig?.name || 'Nero'} sentinel active. I'm ready to help you explore ${detectedDapp || 'Movement M2'}. How can I assist?`;
    setMessages([{ id: 'init', role: 'assistant', content: greeting, timestamp: Date.now() }]);
  }, [detectedDapp, platformConfig]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!user.walletAddress) { onConnect(); return; }
    if (!text.trim()) return;
    if (isPaid && user.balance < currentFee) {
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Insufficient MOVE balance. Please top up.", timestamp: Date.now() }]);
       return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now(), isPaid };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithNero([...messages, userMsg], user.level);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: response, timestamp: Date.now() }]);
      onQuery(isPaid);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Connection interrupted.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !embedded) return null;

  return (
    <div className={`flex flex-col h-full bg-white relative ${embedded ? '' : 'rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'}`}>
      {!embedded && (
        <div className="bg-white p-5 border-b border-slate-100 flex items-center justify-between">
           <span className="text-sm font-bold text-slate-900">Nero Sentinel</span>
           <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors text-xl">×</button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-onboarding`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-800 border border-slate-100'
            }`}>
              {m.content}
              {m.isPaid && <div className={`mt-2 pt-2 border-t text-[9px] font-bold uppercase tracking-widest flex justify-between ${m.role === 'user' ? 'border-white/10 opacity-60' : 'border-slate-200 text-slate-400'}`}>
                <span>Synced</span>
                <span>-{currentFee} MOVE</span>
              </div>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder={isPaid ? `Enter prompt (-${currentFee} MOVE)...` : "Ask Nero anything..."}
            className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-[13px] font-semibold outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/50 transition-all pr-12"
          />
          <button 
            onClick={() => sendMessage(input)} 
            className="absolute right-3 p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
