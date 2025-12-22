
import React, { useState, useRef, useEffect } from 'react';
import { BrandIdentity, ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatBotProps {
  brandData?: BrandIdentity;
  apiKey: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ brandData, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Greetings. I am the Steward of the Mantle. I am here to help you define the coat your application wears.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep the chat session instance ref so we don't recreate it unnecessarily
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-initialize chat when brand data changes (context update) or apiKey changes
    if (apiKey) {
      chatSessionRef.current = createChatSession(apiKey, brandData);
    }
    
    if (brandData) {
        setMessages(prev => [
            ...prev,
            { role: 'model', text: `I have received the new decrees for "${brandData.mission.substring(0, 20)}...". How shall we refine this Mantle?`, timestamp: Date.now() }
        ])
    }
  }, [brandData, apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey) return;
    
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession(apiKey, brandData);
    }

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      const modelMsgId = Date.now();
      
      // Initialize empty model message
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: modelMsgId }]);

      for await (const chunk of response) {
         const c = chunk as GenerateContentResponse;
         if (c.text) {
             fullText += c.text;
             setMessages(prev => prev.map(msg => 
                 msg.timestamp === modelMsgId ? { ...msg, text: fullText } : msg
             ));
         }
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "The threads are tangled. I cannot respond at this moment.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 border border-dim ${
          isOpen ? 'bg-surface rotate-90 text-main' : 'bg-accent text-on-accent'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-surface rounded-2xl shadow-2xl border border-dim flex flex-col z-50 animate-fade-in-up overflow-hidden transition-colors duration-300">
          
          {/* Header */}
          <div className="p-4 bg-accent/10 border-b border-dim flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-surface border border-dim flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <div>
                <h3 className="text-main font-semibold font-serif">Mantle Steward</h3>
                <p className="text-xs text-muted">Tailoring your identity</p>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-page/50">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-accent text-on-accent rounded-br-none shadow-md' 
                        : 'bg-surface text-main rounded-bl-none border border-dim shadow-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
             ))}
             {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-surface rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 border border-dim">
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-surface border-t border-dim">
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Consult the Steward..."
                  className="flex-1 bg-page text-main border border-dim rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-accent outline-none placeholder-muted"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-accent/10 border border-accent/20 rounded-xl hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-accent"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
