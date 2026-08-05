"use client";
// app/admin/perfiles/[id]/editar/page.jsx — Editar el perfil de una candidata.
//
// Sustituye a las dos pantallas de edición que tenía el admin: el asistente de
// seis pasos de `[id]/page.jsx` y el "perfil agencia" de `[id]/agencia/page.jsx`.
// Cada una traía su propia lista de campos, y ninguna coincidía con la de la
// candidata; por eso el mismo perfil tenía tres porcentajes.
//
// Aquí no hay ni una etiqueta ni una lista de valores escrita a mano: los
// campos, sus opciones y su obligatoriedad salen de lib/campos-perfil.js. Un
// campo nuevo declarado allí aparece solo en las 15 secciones.
//
// Guarda contra PUT /api/admin/perfiles/[id], que ya existía y ya filtra las
// columnas que no se pueden tocar. No se reutiliza el formulario de la
// candidata porque ése escribe sobre el perfil de QUIEN ESTÁ LOGUEADO.

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, AlertTriangle, Check } from "lucide-react";
import { T } from "@/lib/tema";
import {
  PARTE1, PARTE2, camposRequeridos, camposFaltantes, seccionCompleta,
} from "@/lib/campos-perfil";

// Las 15 secciones, con su parte. La clave es parte + id porque los ids se
// repiten entre partes (personal, experiencia y salud están en las dos).
const SECCIONES = [
  ...PARTE1.map(s => ({ ...s, parte: 1, parteNombre: "Cuéntanos de ti" })),
  ...PARTE2.map(s => ({ ...s, parte: 2, parteNombre: "Perfil con la agencia" })),
].map(s => ({ ...s, clave: `${s.parte}-${s.id}` }));

const IC = {
  width:"100%", border:`1.5px solid ${T.border}`, borderRadius:12,
  padding:"10px 14px", fontSize:13, color:T.text, background:"#fff",
  outline:"none", fontFamily:T.font, boxSizing:"border-box",
};
const LC = {
  fontSize:10, fontWeight:700, color:T.textSoft, textTransform:"uppercase",
  letterSpacing:".7px", display:"block", marginBottom:6,
};

/**
 * Opciones a ofrecer, con el valor guardado incluido si no está en la lista.
 *
 * La base trae valores que ninguna lista declara: "Si" donde las opciones dicen
 * "Sí", "Catolica" sin tilde, "No" donde se ofrece "No, aún no". Son de
 * versiones anteriores del formulario. Sin esto el `select` los pinta en blanco
 * y la clienta lee "sin diligenciar" un campo que sí tiene dato.
 *
 * Se añade al final y marcado, para que se vea que es un valor heredado y quien
 * revise pueda normalizarlo eligiendo el de la lista.
 */
function opcionesCon(campo, valor) {
  const v = String(valor ?? "").trim();
  if (!v || campo.opciones.includes(v)) return campo.opciones;
  return [...campo.opciones, v];
}

/** Un campo, según lo que declare `campos-perfil.js`. */
function CampoEditable({ campo, valor, obligatorio, onChange }) {
  const comun = {
    name: campo.name,
    value: valor ?? "",
    onChange: e => onChange(campo.name, e.target.value),
    style: IC,
  };

  let control;
  if (campo.opciones) {
    const opciones = opcionesCon(campo, valor);
    control = (
      <select {...comun}>
        <option value="">Seleccionar</option>
        {opciones.map(o => (
          <option key={o} value={o}>
            {campo.opciones.includes(o) ? o : `${o} (valor guardado)`}
          </option>
        ))}
      </select>
    );
  }
  else if (campo.tipo === "parrafo") control = <textarea {...comun} rows={3} style={{ ...IC, resize:"vertical" }} />;
  else if (campo.tipo === "fecha")   control = <input {...comun} type="date" value={String(valor ?? "").slice(0, 10)} />;
  else if (campo.tipo === "numero")  control = <input {...comun} type="number" min="0" />;
  else                               control = <input {...comun} type="text" />;

  // `foto_url` guarda un data-URI de la foto que subió la candidata. Mostrarlo
  // como texto volcaría cuarenta mil caracteres en el campo.
  const esDataUri = campo.name === "foto_url" && String(valor ?? "").startsWith("data:");

  return (
    <div>
      <label style={LC}>{campo.label}{obligatorio ? " *" : ""}</label>
      {esDataUri ? (
        <>
          <input readOnly value="[Imagen subida ✓]" style={{ ...IC, color:T.textSoft }} />
          <img src={valor} alt="" onError={e => { e.target.style.display = "none"; }}
            style={{ width:80, height:80, borderRadius:12, objectFit:"cover", marginTop:8, border:`2px solid ${T.border}` }} />
        </>
      ) : control}
    </div>
  );
}

export default function AdminEditarPerfilPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const params  = useSearchParams();

  const [form, setForm]           = useState({});
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso]         = useState(null);
  const [activa, setActiva]       = useState(null);

  useEffect(() => {
    fetch(`/api/admin/perfiles/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.perfil) {
          const p = { ...d.perfil };
          if (p.fecha_nacimiento) p.fecha_nacimiento = String(p.fecha_nacimiento).slice(0, 10);
          setForm(p);
        }
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [id]);

  // ?parte=1&seccion=personal — el lápiz de la ficha abre aquí, anclado. A
  // diferencia de la candidata NO se limita el salto: el personal corrige lo
  // que haga falta, no recorre el formulario en orden.
  useEffect(() => {
    const parte   = params.get("parte");
    const seccion = params.get("seccion");
    const encontrada = SECCIONES.find(s =>
      s.id === seccion && (!parte || String(s.parte) === String(parte)));
    setActiva(encontrada?.clave || SECCIONES[0].clave);
  }, [params]);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  const guardar = async () => {
    setGuardando(true);
    const res  = await fetch(`/api/admin/perfiles/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) decir("Cambios guardados");
    else decir(data.error || "No se pudo guardar", "error");
    setGuardando(false);
  };

  if (cargando) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:`3px solid ${T.primary3}`, borderTopColor:"transparent", borderRadius:"50%", animation:"dapspin 1s linear infinite" }} />
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!form.id) return (
    <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, fontFamily:T.font }}>
      <p style={{ color:T.textSoft, fontSize:14 }}>Perfil no encontrado.</p>
      <Link href="/admin/perfiles" style={{ color:T.primary, fontSize:13, textDecoration:"none", fontWeight:600 }}>← Volver a candidatas</Link>
    </div>
  );

  const sec       = SECCIONES.find(s => s.clave === activa) || SECCIONES[0];
  const faltan    = camposFaltantes(sec, form);
  const requeridos = new Set(camposRequeridos(sec, form).map(c => c.name));

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:"28px 30px", maxWidth:1100, margin:"0 auto", width:"100%" }}>
      <style>{`
        @keyframes dapspin{to{transform:rotate(360deg)}}
        input:focus,textarea:focus,select:focus{border-color:${T.primary}!important;box-shadow:0 0 0 3px rgba(160,67,95,.1);}
      `}</style>

      {aviso && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background: aviso.tipo === "error" ? T.danger : T.ink, color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
          {aviso.msg}
        </div>
      )}

      {/* Encabezado */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href={`/admin/perfiles/${id}`}
            style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.textSoft, textDecoration:"none", fontSize:13, border:`1px solid ${T.border}`, padding:"7px 12px", borderRadius:10 }}>
            <ChevronLeft size={14} /> Volver a la ficha
          </Link>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:T.ink, lineHeight:1.2 }}>
              {form.nombre} {form.apellido}
            </div>
            <div style={{ fontSize:12.5, color:T.textSoft }}>Editar el perfil</div>
          </div>
        </div>
        <button onClick={guardar} disabled={guardando}
          style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:"none", background:T.primary, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:T.font }}>
          {guardando
            ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"dapspin 1s linear infinite" }} />Guardando…</>
            : <><Save size={14} /> Guardar cambios</>}
        </button>
      </div>

      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>

        {/* Índice de las 15 secciones */}
        <div style={{ width:230, flexShrink:0 }}>
          {[1, 2].map(parte => (
            <div key={parte} style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.textSoft, textTransform:"uppercase", letterSpacing:".8px", margin:"0 0 8px" }}>
                Parte {parte} · {parte === 1 ? "Cuéntanos de ti" : "Perfil con la agencia"}
              </div>
              {SECCIONES.filter(s => s.parte === parte).map(s => {
                const act   = s.clave === activa;
                const lista = seccionCompleta(s, form);
                return (
                  <button key={s.clave} onClick={() => setActiva(s.clave)}
                    style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:12, border:"none", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:3, fontFamily:T.font,
                      background: act ? T.lilac : "transparent",
                      boxShadow:  act ? `0 0 0 1.5px ${T.primary}` : "none" }}>
                    <div style={{ width:22, height:22, borderRadius:7, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                      background: lista ? T.greenBg : act ? "#fff" : T.neutralBg }}>
                      {lista ? <Check size={12} style={{ color:T.green }} /> : <span style={{ width:6, height:6, borderRadius:"50%", background: act ? T.primary : T.softText }} />}
                    </div>
                    <span style={{ fontSize:11.5, fontWeight: act ? 700 : 500, color: act ? T.primary : T.text }}>{s.titulo}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* La sección activa */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ background:T.lilac, borderRadius:18, border:`1px solid ${T.border}`, padding:"18px 22px", marginBottom:16 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:".7px" }}>
              Parte {sec.parte} · {sec.parteNombre}
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:T.ink, marginTop:2 }}>{sec.titulo}</div>
          </div>

          {faltan.length > 0 && (
            <div style={{ background:T.amberBg, borderRadius:12, padding:"11px 16px", fontSize:12.5, color:T.amber, marginBottom:14, lineHeight:1.6 }}>
              <AlertTriangle size={13} style={{ display:"inline", verticalAlign:"-2px", marginRight:6 }} />
              Sin diligenciar: {faltan.map(c => c.label).join(", ")}.
            </div>
          )}

          <div style={{ background:"#fff", borderRadius:20, border:`1px solid ${T.border}`, padding:26, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {sec.campos.map(campo => (
              <div key={campo.name} style={{ gridColumn: campo.tipo === "parrafo" ? "1 / -1" : "auto" }}>
                <CampoEditable campo={campo} valor={form[campo.name]}
                  obligatorio={requeridos.has(campo.name)} onChange={set} />
              </div>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
            <button onClick={guardar} disabled={guardando}
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"11px 24px", borderRadius:12, border:"none", background:T.primary, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:T.font }}>
              {guardando ? "Guardando…" : <><Save size={14} /> Guardar cambios</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
