"use client";
// El formulario de un evento general (foro, llamada grupal, taller…). Vivía en
// app/admin/reuniones/page.jsx; se separó en `agenda-rango-bloques` sin cambios.
import { useState } from "react";
import { Bell, MessageSquare, Phone, Pin, Wrench, X } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");
const fechaStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const TIPO_CFG = {
  foro:           { color:"#A0435F", bg:"#FCE8EE", Icono:MessageSquare, label:"Foro"          },
  llamada_grupal: { color:"#A0435F", bg:"#FCE8EE", Icono:Phone,         label:"Llamada grupal" },
  taller:         { color:"#E8853B", bg:"#FFF4EC", Icono:Wrench,        label:"Taller"        },
  importante:     { color:"#C0392B", bg:"#FDECEC", Icono:Bell,          label:"Importante"    },
  otro:           { color:"#6B7280", bg:"#F3F4F6", Icono:Pin,           label:"Otro"          },
};

const IC = { width:"100%", border:"1.5px solid #F5E1E7", borderRadius:10, padding:"9px 12px", fontSize:13, color:"#4A2A38", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LC = { fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:".6px", display:"block", marginBottom:5 };

export default function ModalEvento({ onClose, onGuardar, loading, editando }) {
  const hoy = fechaStr(new Date());
  const [form, setForm] = useState(editando || {
    titulo:"", descripcion:"", tipo:"foro", fecha: hoy,
    hora_inicio:"", hora_fin:"", url_meet:"", color:"#A0435F", visible:1,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,16,51,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:460,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,.15)",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ height:4,background:"linear-gradient(90deg,#A0435F,#A0435F)",borderRadius:99,marginBottom:20 }}/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
          <h2 style={{ fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#4A2A38",margin:0 }}>
            {editando?"Editar evento":"Crear evento"}
          </h2>
          <button onClick={onClose} style={{ background:"#F3F4F6",border:"none",borderRadius:99,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={14} style={{ color:"#6B7280" }}/>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={LC}>Tipo de evento *</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {Object.entries(TIPO_CFG).map(([k,v])=>(
                <button key={k} onClick={()=>{ set("tipo",k); set("color",v.color); }}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:12,border:`1.5px solid ${form.tipo===k?v.color:"#E5E7EB"}`,background:form.tipo===k?v.bg:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .1s" }}>
                  <span style={{ fontSize:16 }}><v.Icono size={15}/></span>
                  <span style={{ fontSize:12,fontWeight:form.tipo===k?700:500,color:form.tipo===k?v.color:"#6B7280" }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LC}>Título *</label>
            <input type="text" value={form.titulo} onChange={e=>set("titulo",e.target.value)} style={IC} placeholder="Ej: Foro de preguntas frecuentes"/>
          </div>
          <div>
            <label style={LC}>Descripción</label>
            <textarea value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} rows={3} style={{ ...IC,resize:"none" }} placeholder="Detalles del evento..."/>
          </div>
          <div>
            <label style={LC}>Fecha *</label>
            <input type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)} style={IC}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={LC}>Hora inicio</label>
              <input type="time" value={form.hora_inicio} onChange={e=>set("hora_inicio",e.target.value)} style={IC}/>
            </div>
            <div>
              <label style={LC}>Hora fin</label>
              <input type="time" value={form.hora_fin} onChange={e=>set("hora_fin",e.target.value)} style={IC}/>
            </div>
          </div>
          <div>
            <label style={LC}>Link de Meet (opcional)</label>
            <input type="url" value={form.url_meet} onChange={e=>set("url_meet",e.target.value)} style={IC} placeholder="https://meet.google.com/..."/>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #FCE8EE" }}>
            <div>
              <p style={{ fontSize:13,fontWeight:600,color:"#4A2A38",margin:0 }}>Visible para todas las usuarias</p>
              <p style={{ fontSize:11,color:"#9C8790",margin:0 }}>Aparece en el calendario de todas</p>
            </div>
            <div onClick={()=>set("visible",form.visible?0:1)}
              style={{ width:44,height:24,borderRadius:99,background:form.visible?"#A0435F":"#E5E7EB",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0 }}>
              <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:form.visible?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.15)" }}/>
            </div>
          </div>
        </div>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #E5E7EB",background:"#fff",color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={()=>onGuardar(form)} disabled={loading||!form.titulo||!form.fecha}
            style={{ flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#A0435F,#A0435F)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:(loading||!form.titulo)?0.6:1 }}>
            {loading?"Guardando...":`✓ ${editando?"Guardar cambios":"Crear evento"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
