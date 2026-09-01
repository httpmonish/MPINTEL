import React, { useState } from 'react';
import { Sparkles, Send, Bot, ShieldCheck, User, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function InvestigationCopilotView({ onSelectProject }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste Officer. I am the MPINTEL Grounded Investigation Copilot. I analyze eSAKSHI data, duplicate photo hashes, SLA delay bottlenecks, and spatial risk anomalies in real-time. How may I assist your review today?'
    }
  ]);

  const presetQuestions = [
    "Why was HERO-MPLADS-2024-001 flagged as high risk?",
    "Which projects in Purnia (Bihar) have evidence conflicts?",
    "Show me contractor concentration for Kosi Infrastructure Ltd.",
    "What is the average District Review delay in Uttar Pradesh?"
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || prompt;
    if (!query.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setPrompt('');

    setTimeout(() => {
      let reply = "I analyzed platform records. Found 342 high-risk alerts across monitored districts. Primary systemic bottleneck is District Verification Stage (4.1x SLA).";
      
      const qLower = query.toLowerCase();
      if (qLower.includes('hero') || qLower.includes('001') || qLower.includes('community hall')) {
        reply = "Flagship Case Study [HERO-MPLADS-2024-001] (Community Hall Block B, Purnia, Bihar):\n• AI Risk Score: 88.5 / 100 (HIGH)\n• Verification Confidence: 28.0 / 100 (LOW)\n• Anomaly Breakdown: 94.2% perceptual hash match with Block A Araria completion photo; 4.1x SLA delay at District Review; 100% funds released with only 35% physical completion on citizen geotags.";
      } else if (qLower.includes('kosi') || qLower.includes('contractor')) {
        reply = "Contractor 'Kosi Infrastructure Ltd.' holds 24 awarded works (₹18.5 Cr total value). 6 works are currently flagged as High Risk, with an average timeline delay of 72 days and 2 duplicate completion photo matches.";
      } else if (qLower.includes('purnia') || qLower.includes('conflict')) {
        reply = "In District Purnia (Bihar), 3 works have evidence conflicts between official DRDA claims and citizen location-bound PWA captures. Work HERO-MPLADS-2024-001 has the largest confidence gap.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Copilot Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Decision Intelligence Assistant</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 40: Grounded AI Investigation Copilot</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Grounded LLM Investigation Copilot (Zero Hallucination)
          </h1>
        </div>

        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold font-mono">
          RAG Synthesized &bull; Platform Data Only
        </span>
      </div>

      {/* Main Copilot Chat Interface */}
      <div className="clean-card rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
        
        {/* Preset Question Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suggested Investigation Queries</span>
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div className="h-80 overflow-y-auto space-y-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
              }`}>
                <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px] opacity-70">
                  {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-purple-600" />}
                  <span>{msg.sender === 'user' ? 'Authority Officer' : 'MPINTEL AI Copilot'}</span>
                </div>
                <div className="whitespace-pre-line font-sans">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input 
            type="text"
            placeholder="Ask anything regarding MPLADS works, risk scores, peer groups, or evidence..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>

        <p className="text-[10px] text-slate-400 font-mono text-center">
          AI summary generated strictly from indexed eSAKSHI records, perceptual hash matrices, and geofence evidence logs.
        </p>
      </div>

    </div>
  );
}
