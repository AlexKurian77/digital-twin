import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface HealthChatProps {
  aqiContext: any;
}

export function HealthChat({ aqiContext }: HealthChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: {
            aqi: aqiContext?.aqi || 0,
            city: aqiContext?.city || 'Delhi',
            risk_summary: aqiContext?.risk_summary || 'Unknown'
          }
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (e) {
      console.error("Health Chat Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't reach the health expert right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💬</span>
        <h4 className="font-bold text-white text-sm uppercase tracking-wide">
          Ask the Air Quality Expert
        </h4>
      </div>

      <div className="bg-slate-950 rounded-lg border border-slate-800 h-64 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-slate-500 text-xs text-center mt-20 italic">
              "How does this affect my asthma?"<br/>
              "Is it safe to jog right now?"<br/>
              Ask me anything about the current air quality.
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 rounded-b-lg flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your health question..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1 transition-colors disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
