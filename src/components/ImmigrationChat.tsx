import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, RedNotice } from "../types";
import { Send, Shield, MessageSquare, AlertCircle, RefreshCw, Cpu, Radio } from "lucide-react";

interface ImmigrationChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
  activeSuspect: RedNotice | null;
}

const SUGGESTED_QUERIES = [
  "Enquire about overstay deportation protocols",
  "Explain TM30 hotel registration enforcement",
  "Raid suspect's last seen Pattaya resort coordinate",
  "Verify Suvarnabhumi APPS trigger settings",
];

export default function ImmigrationChat({
  chatHistory,
  onSendMessage,
  loading,
  activeSuspect,
}: ImmigrationChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;
    
    onSendMessage(inputText);
    setInputText("");
  };

  const handleQuickQuery = (query: string) => {
    if (loading) return;
    onSendMessage(query);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  return (
    <div className="bg-[#f0f3f6] p-4 md:h-[390px] h-auto flex flex-col justify-between gap-2.5">
      
      {/* Connection Header */}
      <div className="flex items-center justify-between border-b border-[#d2d2d2] pb-2">
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#3595db] animate-pulse" />
          <span className="font-sans text-[11px] font-bold text-slate-800 uppercase tracking-wide">
            RTP NCB BANGKOK COMMUNICATIONS LINK
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">SECURE LINK</span>
        </div>
      </div>

      {/* MSN Messenger Styled Messages Window */}
      <div className="flex-1 overflow-y-auto my-3 p-3 bg-white border border-[#b9c9d6] rounded-sm space-y-3.5 min-h-[150px] max-h-[170px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
        {chatHistory.map((msg) => {
          const isUser = msg.sender === "USER";
          const isSystem = msg.sender === "SYSTEM";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex items-center justify-center py-0.5">
                <p className="text-[9.5px] font-sans font-bold text-slate-400 bg-slate-100 border border-[#e2e5e9] px-2 py-0.5 rounded-sm uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-sky-600" />
                  {msg.text}
                </p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {/* Sender Name & Badge */}
              <span className="text-[9px] font-sans font-semibold text-slate-400 mb-0.5 px-1 uppercase tracking-wide">
                {isUser ? "INTERPOL OPS CORE" : `${msg.officerName || "Officer"} [${msg.badgeNumber || "RTP-IMM-9842"}]`}
              </span>
              
              {/* Message Bubble - MSN Messenger Glass Balloon look */}
              <div
                className={`max-w-[85%] rounded-[10px] px-3 py-2 text-xs font-sans leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-[#e2f0fd] border border-[#a7d3f8] text-[#0d47a1] rounded-tr-none"
                    : "bg-[#f1f2f4] border border-[#d2d2d2] text-slate-700 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-sky-700 animate-pulse p-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3595db]" />
            <span>TRANSMITTING ENCRYPTED WIRE...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries / Tactical Actions */}
      <div className="mb-3.5">
        <span className="block text-[9px] font-sans font-bold text-slate-400 uppercase mb-1.5 tracking-wide">
          Quick Inquiries
        </span>
        <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto">
          {SUGGESTED_QUERIES.map((query) => (
            <button
              key={query}
              onClick={() => handleQuickQuery(query)}
              disabled={loading}
              className="win7-btn text-[9px] px-2.5 py-1 cursor-pointer transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-[#d2d2d2] pt-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          placeholder={
            activeSuspect
              ? `Inquire about target: ${activeSuspect.name}...`
              : "Ask Officer Somchai about visa blacklists, TM30, checkpoints..."
          }
          className="flex-1 bg-white border border-[#b9c9d6] text-slate-800 rounded-sm px-3 py-2 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-[#3c7fb1] focus:ring-1 focus:ring-[#3c7fb1]/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className={`px-3 rounded-sm font-bold font-sans text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            inputText.trim() && !loading
              ? "win7-btn-primary text-white"
              : "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-3.5 h-3.5 text-white" />
          Send
        </button>
      </form>

    </div>
  );
}
