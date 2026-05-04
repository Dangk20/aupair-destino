"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2, XCircle, Clock, DollarSign, Eye, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

const ID_CLIENTE = 1; // TODO: from session

const STATUS_STYLE = {
  pending:  { bg:"bg-amber-50  border-amber-200",  badge:"bg-amber-100  text-amber-700",  icon: Clock,        label:"Pending Review" },
  approved: { bg:"bg-emerald-50 border-emerald-200", badge:"bg-emerald-100 text-emerald-700", icon: CheckCircle2, label:"Approved" },
  rejected: { bg:"bg-red-50   border-red-200",     badge:"bg-red-100   text-red-700",     icon: XCircle,      label:"Rejected" },
};

export default function ClientQuotesPage() {
  const [quotes,   setQuotes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({});
  const [acting,   setActing]   = useState(null);

  async function loadQuotes() {
    const r = await fetch(`/api/app/cliente/quotes?id_cliente=${ID_CLIENTE}`).catch(()=>null);
    const d = r ? await r.json().catch(()=>[]) : [];
    setQuotes(Array.isArray(d)?d:[]);
    setLoading(false);
  }

  useEffect(() => { loadQuotes(); }, []);

  async function handleAction(id, action) {
    setActing(id);
    await fetch(`/api/app/cliente/quotes/${id}`, {
      method: "PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status: action }),
    });
    setActing(null);
    loadQuotes();
  }

  function toggle(id) { setExpanded(e=>({...e,[id]:!e[id]})); }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Quotes</h2>
        <p className="text-slate-500 text-sm mt-0.5">Review and approve quotes from your contractor</p>
      </div>

      {loading && <div className="py-10 text-center text-slate-400">Loading quotes...</div>}

      {!loading && quotes.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <FileText size={40} className="text-slate-300 mx-auto mb-3"/>
          <p className="text-slate-500 font-medium">No quotes yet</p>
          <p className="text-slate-400 text-sm mt-1">Your contractor will send quotes for your approval.</p>
        </div>
      )}

      <div className="space-y-4">
        {quotes.map(q => {
          const s      = STATUS_STYLE[q.status] || STATUS_STYLE.pending;
          const Icon   = s.icon;
          const isOpen = expanded[q.id];

          return (
            <div key={q.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${s.bg}`}>

              {/* Quote header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <FileText size={18} className="text-cyan-600"/>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{q.projectName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sent {q.sentAt ? new Date(q.sentAt).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.badge}`}>
                    <Icon size={11}/> {s.label}
                  </span>
                  <button onClick={()=>toggle(q.id)} className="text-slate-400 hover:text-slate-600 transition">
                    {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-slate-200/60 divide-y divide-slate-100">

                  {/* Annotated blueprint image */}
                  {q.blueprintUrl && (
                    <div className="p-5">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <ImageIcon size={13}/> Annotated Blueprint
                      </h4>
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-48">
                        <img src={q.blueprintUrl} alt="Annotated blueprint" className="max-w-full max-h-96 object-contain"/>
                      </div>
                    </div>
                  )}

                  {/* Cost breakdown */}
                  <div className="p-5">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <DollarSign size={13}/> Cost Breakdown
                    </h4>
                    {q.priceNote ? (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{q.priceNote}</pre>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No cost breakdown provided.</p>
                    )}
                  </div>

                  {/* Shapes / annotations summary */}
                  {q.shapes && q.shapes.length > 0 && (
                    <div className="p-5">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Annotations Summary</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          q.shapes.reduce((acc,s)=>{acc[s.type]=(acc[s.type]||0)+1;return acc;},{})
                        ).map(([type,count])=>(
                          <span key={type} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                            {count}× {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approve / Reject */}
                  {q.status === "pending" && (
                    <div className="p-5 bg-slate-50 flex items-center justify-between gap-4">
                      <p className="text-sm text-slate-600">Do you approve this quote?</p>
                      <div className="flex gap-3">
                        <button onClick={()=>handleAction(q.id,"rejected")} disabled={acting===q.id}
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
                          <XCircle size={15}/> Reject
                        </button>
                        <button onClick={()=>handleAction(q.id,"approved")} disabled={acting===q.id}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                          <CheckCircle2 size={15}/> {acting===q.id?"Saving…":"Approve"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Already actioned */}
                  {q.status !== "pending" && (
                    <div className={`p-4 flex items-center gap-2 text-sm font-medium ${q.status==="approved"?"text-emerald-700 bg-emerald-50":"text-red-700 bg-red-50"}`}>
                      <Icon size={16}/>
                      {q.status === "approved" ? "You approved this quote." : "You rejected this quote."}
                      {q.decidedAt && <span className="ml-auto text-xs opacity-60">{new Date(q.decidedAt).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}