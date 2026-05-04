"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, User } from "lucide-react";

const ID_CLIENTE  = 1;  // TODO: from session
const CLIENT_NAME = "Client";

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [active,        setActive]        = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`/api/app/cliente/messages?id_cliente=${ID_CLIENTE}`)
      .then(r=>r.json()).catch(()=>[])
      .then(d=>{ setConversations(Array.isArray(d)?d:[]); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!active) return;
    fetch(`/api/app/cliente/messages?id_cliente=${ID_CLIENTE}&id_proyecto=${active.id_proyecto}`)
      .then(r=>r.json()).catch(()=>[])
      .then(d=>setMessages(Array.isArray(d)?d:[]));
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !active) return;
    setSending(true);
    const msg = { id: Date.now(), sender: "client", senderName: CLIENT_NAME, text: input.trim(), createdAt: new Date().toISOString() };
    setMessages(m=>[...m, msg]);
    setInput("");
    await fetch("/api/app/cliente/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id_cliente: ID_CLIENTE, id_proyecto: active.id_proyecto, sender:"client", text: msg.text }),
    }).catch(()=>null);
    setSending(false);
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-5">

      {/* Conversations sidebar */}
      <div className="w-72 bg-white rounded-2xl border border-slate-200 flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Messages</h3>
          <p className="text-xs text-slate-400 mt-0.5">Chat with your contractor</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading && <p className="text-slate-400 text-sm py-6 text-center">Loading...</p>}
          {!loading && conversations.length === 0 && (
            <div className="py-10 text-center px-4">
              <MessageSquare size={28} className="text-slate-300 mx-auto mb-2"/>
              <p className="text-slate-400 text-sm">No conversations yet</p>
            </div>
          )}
          {conversations.map(c=>(
            <button key={c.id_proyecto} onClick={()=>setActive(c)}
              className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition ${active?.id_proyecto===c.id_proyecto?"bg-cyan-50":""}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} className="text-cyan-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${active?.id_proyecto===c.id_proyecto?"text-cyan-700":"text-slate-700"}`}>
                    {c.nombre}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{c.lastMessage || "No messages yet"}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold shrink-0">{c.unread}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <MessageSquare size={36} className="text-slate-300"/>
            <p className="text-sm">Select a project to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
                <MessageSquare size={15} className="text-cyan-600"/>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{active.nombre}</p>
                <p className="text-xs text-slate-400">Chat with your contractor</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No messages yet. Say hello! 👋</p>
                </div>
              )}
              {messages.map(m => {
                const isMe = m.sender === "client";
                return (
                  <div key={m.id} className={`flex gap-3 ${isMe?"flex-row-reverse":""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isMe?"bg-cyan-600":"bg-slate-500"}`}>
                      {isMe ? "Me" : (m.senderName?.[0]||"?")}
                    </div>
                    <div className={`max-w-[70%] ${isMe?"items-end":"items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe?"bg-cyan-600 text-white rounded-tr-sm":"bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
                        {m.text}
                      </div>
                      <p className="text-[10px] text-slate-400 px-1">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-3">
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
                <button onClick={sendMessage} disabled={!input.trim()||sending}
                  className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition">
                  <Send size={16}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}