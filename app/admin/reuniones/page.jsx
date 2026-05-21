"use client";
// app/admin/reuniones/page.jsx

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, VideoIcon, CalendarIcon, XIcon, CheckIcon, UserIcon, ExternalLinkIcon } from "lucide-react";

/* ─── Modal crear/editar reunión ─────────────────────────────────────────── */
function ModalReunion({ inicial, usuarias, onClose, onSave }) {
  const [form, setForm] = useState({
    usuario_id:  inicial?.usuario_id  || "",
    titulo:      inicial?.titulo      || "1 a 1 con tu asesora",
    descripcion: inicial?.descripcion || "",
    fecha:       inicial?.fecha?.split("T")[0] || "",
    hora_inicio: inicial?.hora_inicio?.slice(0,5) || "10:00",
    hora_fin:    inicial?.hora_fin?.slice(0,5)    || "11:00",
    meet_url:    inicial?.meet_url    || "",
    asesora:     inicial?.asesora     || "Valentina G.",
    estado:      inicial?.estado      || "programada",
  });
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState("");

  const ic = { width:"100%", border:"1.5px solid #f0dde2", borderRadius:12, padding:"9px 13px", fontSize:13, color:"#2d1a22", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  const guardar = async () => {
    if (!form.usuario_id || !form.titulo || !form.fecha || !form.hora_inicio)
      return setErr("Estudiante, título, fecha y hora son obligatorios.");
    setGuardando(true); setErr("");
    await onSave({ ...form, id: inicial?.id });
    setGuardando(false);
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(45,26,34,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, boxShadow:"0 20px 60px rgba(0,0,0,.15)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ height:4, background:"linear-gradient(90deg,#a0435f,#e8849a)" }}/>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#2d1a22", margin:0 }}>
              {inicial ? "Editar reunión" : "Nueva reunión"}
            </h2>
            <button onClick={onClose} style={{ background:"#fce8ed", border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:18, color:"#a0435f", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>

          {err && <div style={{ background:"#fce8ed", border:"1px solid #f0b8c4", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#a0435f", marginBottom:14 }}>{err}</div>}

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Estudiante */}
            <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Estudiante *</span>
              <select value={form.usuario_id} onChange={e => setForm({...form, usuario_id:e.target.value})} style={{ ...ic, cursor:"pointer" }}>
                <option value="">Seleccionar estudiante...</option>
                {usuarias.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido} — {u.email}</option>)}
              </select>
            </label>

            <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Título *</span>
              <input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})} style={ic}/>
            </label>

            <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Descripción</span>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} rows={2} style={{ ...ic, resize:"vertical" }}/>
            </label>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Fecha *</span>
                <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha:e.target.value})} style={ic}/>
              </label>
              <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Hora inicio *</span>
                <input type="time" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio:e.target.value})} style={ic}/>
              </label>
              <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Hora fin</span>
                <input type="time" value={form.hora_fin} onChange={e => setForm({...form, hora_fin:e.target.value})} style={ic}/>
              </label>
            </div>

            <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Link de Google Meet</span>
              <input type="url" placeholder="https://meet.google.com/..." value={form.meet_url} onChange={e => setForm({...form, meet_url:e.target.value})} style={ic}/>
            </label>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Nombre asesora</span>
                <input value={form.asesora} onChange={e => setForm({...form, asesora:e.target.value})} style={ic}/>
              </label>
              {inicial && (
                <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#2d1a22", textTransform:"uppercase", letterSpacing:.7 }}>Estado</span>
                  <select value={form.estado} onChange={e => setForm({...form, estado:e.target.value})} style={{ ...ic, cursor:"pointer" }}>
                    <option value="programada">Programada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:12, border:"1.5px solid #f0dde2", background:"#fff", color:"#9a6672", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando} style={{ flex:2, padding:"10px", borderRadius:12, border:"none", background:guardando?"#c0909a":"#a0435f", color:"#fff", fontSize:13, fontWeight:600, cursor:guardando?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {guardando ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>Guardando…</> : <><CheckIcon size={14}/>{inicial?"Guardar cambios":"Crear reunión"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminReunionesPage() {
  const [reuniones, setReuniones] = useState([]);
  const [usuarias,  setUsuarias]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editando,  setEditando]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [filtro,    setFiltro]    = useState("todas");

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/reuniones").then(r=>r.json());
      setReuniones(r.reuniones || []);
      setUsuarias(r.usuarias || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (form) => {
    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/reuniones", {
      method, headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { showToast(form.id ? "✓ Reunión actualizada" : "✓ Reunión creada"); cargar(); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta reunión?")) return;
    await fetch(`/api/admin/reuniones?id=${id}`, { method:"DELETE" });
    showToast("✓ Reunión eliminada");
    cargar();
  };

  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const filtradas = reuniones.filter(r => {
    if (filtro === "proximas")   return new Date(r.fecha) >= hoy && r.estado !== "cancelada";
    if (filtro === "completadas") return r.estado === "completada";
    if (filtro === "canceladas")  return r.estado === "cancelada";
    return true;
  });

  const ESTADO_CFG = {
    programada: { bg:"#ede9fe", color:"#5b21b6", label:"Programada" },
    completada: { bg:"#d1fae5", color:"#059669", label:"Completada" },
    cancelada:  { bg:"#fee2e2", color:"#dc2626", label:"Cancelada"  },
  };

  return (
    <div className="p-5 xl:p-7 bg-[#fff8f9] min-h-full space-y-5">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:100, background:"#2d1a22", color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
          {toast}
        </div>
      )}

      {(modal || editando) && (
        <ModalReunion
          inicial={editando}
          usuarias={usuarias}
          onClose={() => { setModal(false); setEditando(null); }}
          onSave={guardar}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-bold text-[#2d1a22] text-[24px]">Reuniones</h1>
          <p className="text-[12px] text-[#9a6672]">Crea y asigna reuniones a las estudiantes. Ellas recibirán el link de Meet y podrán agregarlo a Google Calendar.</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#a0435f]/20">
          <PlusIcon size={14}/> + Nueva reunión
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total reuniones",   val:reuniones.length,                                    color:"bg-[#fce8ed] text-[#a0435f]",   emoji:"📅" },
          { label:"Próximas",          val:reuniones.filter(r=>new Date(r.fecha)>=hoy&&r.estado!=="cancelada").length, color:"bg-[#ede9fe] text-[#5b21b6]", emoji:"⏰" },
          { label:"Completadas",       val:reuniones.filter(r=>r.estado==="completada").length, color:"bg-[#d1fae5] text-[#059669]",   emoji:"✅" },
          { label:"Con Meet",          val:reuniones.filter(r=>r.meet_url).length,              color:"bg-[#dbeafe] text-[#1d4ed8]",   emoji:"🎥" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#f0dde2] rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-lg ${s.color}`}>{s.emoji}</div>
            <p className="text-[10px] text-[#9a6672]">{s.label}</p>
            <p className="font-serif font-bold text-[24px] text-[#2d1a22] leading-none">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id:"todas",      label:"Todas"       },
          { id:"proximas",   label:"Próximas"    },
          { id:"completadas",label:"Completadas" },
          { id:"canceladas", label:"Canceladas"  },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border-none transition cursor-pointer ${
              filtro===f.id ? "bg-[#a0435f] text-white shadow-md" : "bg-white text-[#6b7280]"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div style={{ width:28, height:28, border:"3px solid #fce8ed", borderTopColor:"#a0435f", borderRadius:"50%", margin:"0 auto", animation:"spin 1s linear infinite" }}/>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#9a6672]">
            No hay reuniones con ese filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#fff8f9" }}>
                  {["Estudiante","Título","Fecha y hora","Asesora","Meet","Estado","Acciones"].map(h => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#9a6672", textTransform:"uppercase", letterSpacing:.6, borderBottom:"1px solid #f0dde2", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(r => {
                  const cfg = ESTADO_CFG[r.estado] || ESTADO_CFG.programada;
                  return (
                    <tr key={r.id} style={{ borderBottom:"1px solid #fdf0f2" }}
                      onMouseEnter={e => e.currentTarget.style.background="#fff8f9"}
                      onMouseLeave={e => e.currentTarget.style.background=""}>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:"#fce8ed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                            {r.usuario_foto
                              ? <img src={r.usuario_foto} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                              : <span style={{ fontSize:12, fontWeight:700, color:"#a0435f" }}>{r.nombre?.[0]}</span>
                            }
                          </div>
                          <div>
                            <p style={{ fontSize:12, fontWeight:600, color:"#2d1a22", margin:0 }}>{r.nombre} {r.apellido}</p>
                            <p style={{ fontSize:10, color:"#9a6672", margin:0 }}>{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#2d1a22", margin:0 }}>{r.titulo}</p>
                        {r.descripcion && <p style={{ fontSize:11, color:"#9a6672", margin:"2px 0 0" }}>{r.descripcion.slice(0,60)}{r.descripcion.length>60?"…":""}</p>}
                      </td>
                      <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                        <p style={{ fontSize:12, fontWeight:600, color:"#2d1a22", margin:0 }}>
                          {new Date(r.fecha).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"})}
                        </p>
                        <p style={{ fontSize:11, color:"#9a6672", margin:0 }}>
                          {r.hora_inicio?.slice(0,5)}{r.hora_fin?` - ${r.hora_fin.slice(0,5)}`:""} EST
                        </p>
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:"#2d1a22" }}>{r.asesora || "—"}</td>
                      <td style={{ padding:"12px 16px" }}>
                        {r.meet_url
                          ? <a href={r.meet_url} target="_blank" rel="noopener noreferrer"
                              style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#dbeafe", color:"#1d4ed8", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:8, textDecoration:"none" }}>
                              <VideoIcon size={11}/> Abrir
                            </a>
                          : <span style={{ fontSize:11, color:"#9ca3af" }}>Sin link</span>
                        }
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ fontSize:10, fontWeight:600, background:cfg.bg, color:cfg.color, padding:"4px 10px", borderRadius:99 }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => setEditando(r)}
                            style={{ width:30, height:30, borderRadius:9, border:"1px solid #f0dde2", background:"#fce8ed", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#a0435f" }}>
                            <PencilIcon size={13}/>
                          </button>
                          <button onClick={() => eliminar(r.id)}
                            style={{ width:30, height:30, borderRadius:9, border:"1px solid #fecaca", background:"#fee2e2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#dc2626" }}>
                            <TrashIcon size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}