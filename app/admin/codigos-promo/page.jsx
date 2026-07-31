"use client";
// app/admin/codigos-promo/page.jsx

import { useEffect, useState } from "react";
import {
  Plus, X, Trash2, Edit2, Check, Copy,
  Tag, Users, DollarSign, ToggleLeft, ToggleRight,
  Calendar, AlertCircle,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

function pad(n) { return String(n).padStart(2,"0"); }
function fmtFecha(f) {
  if (!f) return "Sin vencimiento";
  const d = new Date(f+"T12:00:00");
  return d.toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"});
}
function isVencido(f) {
  if (!f) return false;
  return new Date(f+"T23:59:59") < new Date();
}

const IC = { width:"100%", border:"1.5px solid #e0d4f5", borderRadius:10, padding:"9px 12px", fontSize:13, color:"#1a0a3d", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LC = { fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 };

/* ── Modal crear/editar código ── */
function ModalCodigo({ editando, asociadas, onClose, onGuardar, loading }) {
  const [form, setForm] = useState(editando ? {
    codigo: editando.codigo,
    precio_final: editando.precio_final,
    usos_max: editando.usos_max || "",
    fecha_expiracion: editando.fecha_expiracion?.split("T")[0] || "",
    descripcion: editando.descripcion || "",
    asociada_id: editando.asociada_id || "",
    comision_porcentaje: Number(editando.comision_porcentaje) || 0,
  } : {
    codigo: "", precio_final: 29, usos_max: "", fecha_expiracion: "", descripcion: "",
    asociada_id: "", comision_porcentaje: 0,
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Al elegir asociada, proponer 20% de comisión si estaba en 0.
  const setAsociada = (v) => setForm(f=>({
    ...f, asociada_id: v,
    comision_porcentaje: v && !Number(f.comision_porcentaje) ? 20 : (v ? f.comision_porcentaje : 0),
  }));

  const generarCodigo = () => {
    const palabras = ["DESTINO","AUPAIR","USA","PROMO","LANZAMIENTO","ESPECIAL","VIP","TATI","JENI"];
    const nums = Math.floor(Math.random()*90)+10;
    const p = palabras[Math.floor(Math.random()*palabras.length)];
    set("codigo", `${p}${nums}`);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(26,10,61,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:460,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ height:4,background:"linear-gradient(90deg,#7c5cc4,#a0435f)",borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#1a0a3d",margin:0 }}>
            {editando?"Editar código":"Crear código promocional"}
          </h2>
          <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={14} style={{ color:"#6b7280" }}/>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {/* Código */}
          <div>
            <label style={LC}>Código *</label>
            <div style={{ display:"flex",gap:8 }}>
              <input type="text" value={form.codigo} onChange={e=>set("codigo",e.target.value.toUpperCase().replace(/\s/g,""))}
                style={{ ...IC,flex:1,fontWeight:700,letterSpacing:1 }} placeholder="Ej: PROMO29"/>
              <button onClick={generarCodigo}
                style={{ padding:"0 14px",borderRadius:10,border:"1.5px solid #e0d4f5",background:"#f5f0ff",color:"#7c5cc4",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
                Generar
              </button>
            </div>
          </div>

          {/* Precio */}
          <div>
            <label style={LC}>Precio final (USD) *</label>
            <div style={{ display:"flex",gap:8 }}>
              {[25,29,35].map(p=>(
                <button key={p} onClick={()=>set("precio_final",p)}
                  style={{ flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${form.precio_final===p?"#7c5cc4":"#e0d4f5"}`,background:form.precio_final===p?"#f5f0ff":"#fff",color:form.precio_final===p?"#7c5cc4":"#374151",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                  ${p}
                </button>
              ))}
              <input type="number" min="1" value={form.precio_final} onChange={e=>set("precio_final",Number(e.target.value))}
                style={{ ...IC,width:80,textAlign:"center",fontWeight:700 }}/>
            </div>
            <p style={{ fontSize:11,color:"#9a80c0",margin:"5px 0 0" }}>
              El precio normal es $35. Con este código el cliente paga ${form.precio_final} USD.
            </p>
          </div>

          {/* Usos máximos */}
          <div>
            <label style={LC}>Límite de usos</label>
            <div style={{ display:"flex",gap:8 }}>
              {[10,25,50,100].map(n=>(
                <button key={n} onClick={()=>set("usos_max",n)}
                  style={{ flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${form.usos_max===n?"#7c5cc4":"#e0d4f5"}`,background:form.usos_max===n?"#f5f0ff":"#fff",color:form.usos_max===n?"#7c5cc4":"#374151",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                  {n}
                </button>
              ))}
              <button onClick={()=>set("usos_max","")}
                style={{ flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${form.usos_max===""?"#7c5cc4":"#e0d4f5"}`,background:form.usos_max===""?"#f5f0ff":"#fff",color:form.usos_max===""?"#7c5cc4":"#374151",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                ∞
              </button>
            </div>
            {form.usos_max==="" && <p style={{ fontSize:11,color:"#9a80c0",margin:"4px 0 0" }}>Sin límite de usos.</p>}
          </div>

          {/* Fecha expiración */}
          <div>
            <label style={LC}>Fecha de vencimiento</label>
            <input type="date" value={form.fecha_expiracion} onChange={e=>set("fecha_expiracion",e.target.value)}
              style={IC} min={new Date().toISOString().split("T")[0]}/>
            {!form.fecha_expiracion && <p style={{ fontSize:11,color:"#9a80c0",margin:"4px 0 0" }}>Sin fecha de vencimiento.</p>}
          </div>

          {/* Descripción */}
          <div>
            <label style={LC}>Descripción interna</label>
            <input type="text" value={form.descripcion} onChange={e=>set("descripcion",e.target.value)}
              style={IC} placeholder="Ej: Campaña Instagram mayo 2026"/>
          </div>

          {/* Asociada dueña + comisión */}
          <div>
            <label style={LC}>Asociada dueña (comisión por venta)</label>
            <div style={{ display:"flex",gap:8 }}>
              <select value={form.asociada_id} onChange={e=>setAsociada(e.target.value)}
                style={{ ...IC,flex:1,cursor:"pointer" }}>
                <option value="">Sin asociada (código general)</option>
                {(asociadas||[]).map(a=>(
                  <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                ))}
              </select>
              {form.asociada_id && (
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <input type="number" min="0" max="100" step="0.5" value={form.comision_porcentaje}
                    onChange={e=>set("comision_porcentaje",e.target.value)}
                    style={{ ...IC,width:70,textAlign:"center",fontWeight:700 }}/>
                  <span style={{ fontSize:13,fontWeight:700,color:"#7c5cc4" }}>%</span>
                </div>
              )}
            </div>
            <p style={{ fontSize:11,color:"#9a80c0",margin:"5px 0 0" }}>
              {form.asociada_id
                ? `Cada venta confirmada con este código genera ${form.comision_porcentaje||0}% de comisión para la asociada.`
                : "Sin asociada, el código sólo aplica descuento (no genera comisión)."}
            </p>
          </div>

          {/* Preview */}
          {form.codigo && (
            <div style={{ background:"linear-gradient(135deg,#f5f0ff,#fce8ed)",borderRadius:14,padding:"14px 16px",border:"1px solid #e0d4f5" }}>
              <p style={{ fontSize:11,fontWeight:700,color:"#7c5cc4",textTransform:"uppercase",letterSpacing:".5px",margin:"0 0 6px" }}>Vista previa</p>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontFamily:"monospace",fontSize:18,fontWeight:800,color:"#1a0a3d",letterSpacing:2,margin:0 }}>{form.codigo}</p>
                  <p style={{ fontSize:12,color:"#7c5cc4",margin:"2px 0 0" }}>
                    Precio especial: <strong>${form.precio_final} USD</strong>
                    {form.usos_max ? ` · Máx. ${form.usos_max} usos` : " · Usos ilimitados"}
                    {form.fecha_expiracion ? ` · Vence ${fmtFecha(form.fecha_expiracion)}` : ""}
                  </p>
                </div>
                <div style={{ background:"#7c5cc4",color:"#fff",fontSize:18,fontWeight:800,padding:"8px 14px",borderRadius:10 }}>
                  ${form.precio_final}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fff",color:"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={()=>onGuardar(form)} disabled={loading||!form.codigo||!form.precio_final}
            style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#7c5cc4,#a0435f)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(loading||!form.codigo)?0.6:1 }}>
            {loading?"Guardando...":`✓ ${editando?"Guardar cambios":"Crear código"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function AdminCodigosPromoPage() {
  const { isMobile } = useMobile();
  const [codigos,   setCodigos]   = useState([]);
  const [asociadas, setAsociadas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiado, setCopiado] = useState(null);

  const showToast = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = async() => {
    setLoading(true);
    const res = await fetch("/api/admin/codigos-promo");
    const data = await res.json();
    setCodigos(data.codigos||[]);
    setLoading(false);
  };
  useEffect(()=>{
    cargar();
    fetch("/api/admin/asociadas").then(r=>r.json()).then(d=>setAsociadas(d.asociadas||[])).catch(()=>{});
  },[]);

  const guardar = async(form) => {
    setLoadingGuardar(true);
    const method = editando ? "PUT" : "POST";
    const body   = editando ? {...form, id:editando.id} : form;
    const res = await fetch("/api/admin/codigos-promo",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data = await res.json();
    if (res.ok) {
      showToast(editando?"✓ Código actualizado":"✓ Código creado");
      setModal(false); setEditando(null);
      await cargar();
    } else showToast(data.error||"Error al guardar","error");
    setLoadingGuardar(false);
  };

  const toggleActivo = async(c) => {
    await fetch("/api/admin/codigos-promo",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:c.id,activo:c.activo?0:1})});
    showToast(c.activo?"Código desactivado":"Código activado ✓");
    await cargar();
  };

  const eliminar = async(id) => {
    if (!confirm("¿Eliminar este código? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/codigos-promo?id=${id}`,{method:"DELETE"});
    showToast("Código eliminado");
    await cargar();
    setDeletingId(null);
  };

  const copiar = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(()=>setCopiado(null),2000);
  };

  /* Stats generales
     Usos confirmados = ventas pagadas (consumen cupo).
     Aplicaciones pendientes = candidatas que ya aplicaron el código y aún no
     tienen la venta confirmada; no consumen cupo. */
  const totalActivos    = codigos.filter(c=>c.activo&&!isVencido(c.fecha_expiracion)).length;
  const totalUsos       = codigos.reduce((s,c)=>s+(Number(c.usos_confirmados)||0),0);
  const totalPendientes = codigos.reduce((s,c)=>s+(Number(c.aplicaciones_pendientes)||0),0);
  const totalRecaudado  = codigos.reduce((s,c)=>s+(Number(c.total_recaudado)||0),0);

  return (
    <div style={{ minHeight:"100vh",background:"#f5f0ff",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,background:toast.tipo==="error"?"#dc2626":"#1a0a3d",color:"#fff",padding:"12px 20px",borderRadius:14,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.15)" }}>{toast.msg}</div>}
      {(modal||editando) && <ModalCodigo editando={editando} asociadas={asociadas} onClose={()=>{setModal(false);setEditando(null);}} onGuardar={guardar} loading={loadingGuardar}/>}

      {/* HEADER */}
      <div style={{ background:"#1a0a3d",padding:isMobile?"14px 16px":"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontFamily:"Georgia,serif",fontSize:isMobile?17:20,fontWeight:700,color:"#fff",margin:0 }}>Códigos Promocionales</h1>
          {!isMobile&&<p style={{ fontSize:12,color:"rgba(255,255,255,.6)",margin:"2px 0 0" }}>Crea y gestiona descuentos especiales para tu comunidad</p>}
        </div>
        <button onClick={()=>setModal(true)}
          style={{ display:"flex",alignItems:"center",gap:6,background:"#7c5cc4",color:"#fff",fontSize:isMobile?12:13,fontWeight:700,padding:isMobile?"9px 14px":"10px 18px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
          <Plus size={14}/> Crear código
        </button>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:isMobile?"14px 16px 40px":"20px 24px 40px" }}>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?10:14,marginBottom:16 }}>
          {[
            { n:totalActivos,            label:"Códigos activos",      color:"#7c5cc4",bg:"#f5f0ff",emoji:"🎟️" },
            { n:totalUsos,               label:"Usos confirmados",     color:"#059669",bg:"#d1fae5",emoji:"✅" },
            { n:totalPendientes,         label:"Aplicados sin pagar",  color:"#d97706",bg:"#fef3c7",emoji:"⏳" },
            { n:`$${totalRecaudado.toFixed(0)}`, label:"Recaudado con códigos", color:"#d97706",bg:"#fef3c7",emoji:"💰" },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff",borderRadius:16,border:"1px solid #e0d4f5",padding:isMobile?"12px":"16px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ width:isMobile?36:44,height:isMobile?36:44,borderRadius:12,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?16:20,flexShrink:0 }}>{s.emoji}</div>
              <div>
                <p style={{ fontFamily:"Georgia,serif",fontSize:isMobile?20:26,fontWeight:700,color:s.color,margin:0,lineHeight:1 }}>{s.n}</p>
                <p style={{ fontSize:isMobile?10:12,color:"#9a80c0",margin:0,lineHeight:1.3 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de códigos */}
        {loading ? (
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e0d4f5",padding:"48px",display:"flex",justifyContent:"center" }}>
            <div style={{ width:32,height:32,border:"2px solid #7c5cc4",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>
          </div>
        ) : codigos.length===0 ? (
          <div style={{ background:"#fff",borderRadius:20,border:"1px solid #e0d4f5",padding:"60px 24px",textAlign:"center" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🎟️</div>
            <p style={{ fontSize:16,fontWeight:600,color:"#1a0a3d",margin:"0 0 8px" }}>Sin códigos aún</p>
            <p style={{ fontSize:13,color:"#9a80c0",margin:"0 0 20px" }}>Crea tu primer código promocional para dar descuentos especiales.</p>
            <button onClick={()=>setModal(true)}
              style={{ display:"inline-flex",alignItems:"center",gap:6,background:"#7c5cc4",color:"#fff",fontSize:13,fontWeight:600,padding:"11px 22px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit" }}>
              <Plus size={14}/> Crear código
            </button>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {codigos.map(c => {
              // El cupo se evalúa SÓLO contra los usos confirmados (ventas
              // pagadas). Las aplicaciones pendientes no agotan el código.
              const usosConf   = Number(c.usos_confirmados ?? c.usos_actuales ?? 0);
              const pendientes = Number(c.aplicaciones_pendientes || 0);
              const vencido    = isVencido(c.fecha_expiracion);
              const agotado    = c.usos_max && usosConf >= c.usos_max;
              const inactivo   = !c.activo || vencido || agotado;
              const usosRest   = c.usos_max ? c.usos_max - usosConf : null;
              const pctUsos    = c.usos_max ? Math.round((usosConf/c.usos_max)*100) : null;

              return (
                <div key={c.id} style={{ background:"#fff",borderRadius:20,border:`1.5px solid ${inactivo?"#e5e7eb":"#c4b0e8"}`,padding:isMobile?"14px 16px":"18px 22px",boxShadow:"0 1px 4px rgba(0,0,0,.04)",opacity:inactivo?.7:1 }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap",flexDirection:isMobile?"column":"row" }}>

                    {/* Código + precio — fila en mobile */}
                    <div style={{ flex:1,minWidth:0,width:"100%" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                        <div style={{ background:inactivo?"#f3f4f6":"#f5f0ff",borderRadius:12,padding:"8px 14px",border:`1.5px solid ${inactivo?"#e5e7eb":"#c4b0e8"}` }}>
                          <p style={{ fontFamily:"monospace",fontSize:isMobile?16:18,fontWeight:800,color:inactivo?"#9ca3af":"#7c5cc4",letterSpacing:2,margin:0 }}>{c.codigo}</p>
                        </div>
                        <button onClick={()=>copiar(c.codigo)}
                          style={{ width:32,height:32,borderRadius:9,border:"1px solid #e0d4f5",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          {copiado===c.codigo?<Check size={13} style={{ color:"#059669" }}/>:<Copy size={13} style={{ color:"#9a80c0" }}/>}
                        </button>
                        {/* Estado */}
                        <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,
                          background:vencido?"#fee2e2":agotado?"#fef3c7":c.activo?"#d1fae5":"#f3f4f6",
                          color:vencido?"#dc2626":agotado?"#d97706":c.activo?"#059669":"#6b7280",
                        }}>
                          {vencido?"Vencido":agotado?"Agotado":c.activo?"Activo":"Inactivo"}
                        </span>
                        {/* Precio en mobile — inline */}
                        {isMobile && (
                          <div style={{ marginLeft:"auto",background:"#f5f0ff",borderRadius:10,padding:"6px 12px",textAlign:"center" }}>
                            <p style={{ fontFamily:"Georgia,serif",fontSize:18,fontWeight:800,color:"#7c5cc4",margin:0,lineHeight:1 }}>${c.precio_final} <span style={{ fontSize:11,fontWeight:500,color:"#9a80c0" }}>USD</span></p>
                          </div>
                        )}
                      </div>
                      {c.descripcion && <p style={{ fontSize:12,color:"#9a80c0",margin:0 }}>{c.descripcion}</p>}
                      {c.asociada_nombre && (
                        <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"#fce8ed",border:"1px solid #f3c6d3",borderRadius:99,padding:"3px 10px",marginTop:6 }}>
                          <Users size={11} style={{ color:"#a0435f" }}/>
                          <span style={{ fontSize:11,fontWeight:700,color:"#a0435f" }}>
                            {c.asociada_nombre} {c.asociada_apellido} · {Number(c.comision_porcentaje)||0}% comisión
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Precio — solo desktop */}
                    {!isMobile && (
                    <div style={{ textAlign:"center",background:"#f5f0ff",borderRadius:14,padding:"10px 18px",flexShrink:0 }}>
                      <p style={{ fontSize:10,color:"#9a80c0",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:".5px" }}>Precio especial</p>
                      <p style={{ fontFamily:"Georgia,serif",fontSize:24,fontWeight:800,color:"#7c5cc4",margin:0,lineHeight:1 }}>${c.precio_final}</p>
                      <p style={{ fontSize:10,color:"#9a80c0",margin:"2px 0 0" }}>USD</p>
                    </div>
                    )}

                    {/* Stats del código */}
                    <div style={{ display:"flex",flexDirection:"column",gap:6,minWidth:160 }}>
                      {/* Usos */}
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <Users size={12} style={{ color:"#9a80c0",flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                            <span style={{ fontSize:11,color:"#374151" }}>
                              {usosConf} usos{c.usos_max?` / ${c.usos_max}`:` / ∞`}
                            </span>
                            {usosRest!==null && <span style={{ fontSize:11,color:"#9a80c0" }}>{usosRest} rest.</span>}
                          </div>
                          {pctUsos!==null && (
                            <div style={{ height:5,background:"#ede9f8",borderRadius:99,overflow:"hidden" }}>
                              <div style={{ height:"100%",width:`${pctUsos}%`,background:pctUsos>80?"#dc2626":"#7c5cc4",borderRadius:99 }}/>
                            </div>
                          )}
                          {pendientes>0 && (
                            <p style={{ fontSize:10.5,color:"#d97706",margin:"3px 0 0" }}>
                              ⏳ {pendientes} aplicado{pendientes>1?"s":""} sin pago confirmado
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Recaudado */}
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <DollarSign size={12} style={{ color:"#9a80c0" }}/>
                        <span style={{ fontSize:11,color:"#374151" }}>${Number(c.total_recaudado||0).toFixed(0)} USD recaudados</span>
                      </div>
                      {/* Vencimiento */}
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <Calendar size={12} style={{ color:vencido?"#dc2626":"#9a80c0" }}/>
                        <span style={{ fontSize:11,color:vencido?"#dc2626":"#374151" }}>{fmtFecha(c.fecha_expiracion)}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div style={{ display:"flex",gap:8,alignItems:"center",flexShrink:0,width:isMobile?"100%":"auto" }}>
                      <button onClick={()=>toggleActivo(c)}
                        style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:"1.5px solid #e0d4f5",background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:c.activo?"#059669":"#6b7280",fontFamily:"inherit",flex:isMobile?1:"unset" }}>
                        {c.activo?<ToggleRight size={16} style={{ color:"#059669" }}/>:<ToggleLeft size={16} style={{ color:"#9ca3af" }}/>}
                        {c.activo?"Activo":"Inactivo"}
                      </button>
                      <button onClick={()=>setEditando(c)}
                        style={{ width:34,height:34,borderRadius:10,border:"1.5px solid #e0d4f5",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Edit2 size={13} style={{ color:"#7c5cc4" }}/>
                      </button>
                      <button onClick={()=>eliminar(c.id)} disabled={deletingId===c.id}
                        style={{ width:34,height:34,borderRadius:10,border:"1.5px solid #fecaca",background:"#fee2e2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        {deletingId===c.id?<div style={{ width:13,height:13,border:"2px solid #dc262640",borderTopColor:"#dc2626",borderRadius:"50%",animation:"spin 1s linear infinite" }}/>:<Trash2 size={13} style={{ color:"#dc2626" }}/>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tip */}
        <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e0d4f5",padding:"14px 20px",marginTop:16,display:"flex",alignItems:"center",gap:12 }}>
          <AlertCircle size={16} style={{ color:"#7c5cc4",flexShrink:0 }}/>
          <p style={{ fontSize:12,color:"#7060a0",margin:0,lineHeight:1.5 }}>
            <strong style={{ color:"#1a0a3d" }}>Cómo funciona:</strong> Crea un código, compártelo con tu comunidad en Instagram, TikTok o WhatsApp. Las usuarias lo ingresan en la página de pago y el precio se actualiza automáticamente. Puedes limitar los usos y poner fecha de vencimiento.
          </p>
        </div>
      </div>
    </div>
  );
}