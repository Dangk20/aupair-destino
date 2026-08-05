"use client";
// app/admin/perfiles/[id]/page.jsx — La ficha de una candidata, para el personal.
//
// Era un asistente de edición de seis pasos con su propia lista de campos, su
// propio `calcProgreso()` sobre 16 columnas escritas a mano y un botón para
// saltar a una TERCERA pantalla ("Perfil agencia") que tenía otra lista de diez
// secciones y daba una sección por completa con la mitad de sus campos llenos.
// De ahí salía el "100% completado" sobre perfiles que no lo estaban.
//
// Ahora es la MISMA ficha que ve la candidata —components/perfil/FichaCandidata—
// más el bloque de valoración interna, que sólo ve el personal. Editar sigue
// siendo un formulario: el lápiz de cada sección abre `[id]/editar` anclado a
// ella.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, ShieldCheck, CheckCircle2, CircleDashed } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { parteCompleta, faltantesDeParte } from "@/lib/campos-perfil";
import FichaCandidata from "@/components/perfil/FichaCandidata";

const IC = {
  width:"100%", border:`1.5px solid ${T.border}`, borderRadius:10,
  padding:"9px 12px", fontSize:12.5, color:T.text, background:"#fff",
  outline:"none", fontFamily:T.font, boxSizing:"border-box",
};
const LC = {
  fontSize:10, fontWeight:700, color:T.textSoft, textTransform:"uppercase",
  letterSpacing:".7px", display:"block", marginBottom:5,
};

// Los valores de `estado_agencia`, tal como los guarda hoy la base.
const ESTADOS_AGENCIA = ["En progreso", "En revisión", "Lista para agencia", "Incompleto", "Aprobada", "Rechazada"];
const CALIFICACIONES  = ["califica", "requiere_revision", "no_califica"];

/**
 * Valoración interna: lo que el equipo escribe sobre la candidata y que ella
 * NO ve. La ruta `/api/dashboard/perfil` no le devuelve estas columnas, así
 * que ocultarlas aquí no es la única defensa — es la de la interfaz.
 *
 * El selector "Estado admin" del diseño anterior escribía sobre `estado_perfil`,
 * una columna que NO existe en `usuarios`. Como el PUT descarta las claves que
 * no son columnas, nunca guardó nada: se movía, decía "guardado" y al recargar
 * volvía a "Pendiente". Aquí se usa `estado_agencia`, que sí existe.
 */
function BloqueInterno({ form, set, onGuardar, guardando, aprobacion }) {
  const aprobado = Number(form.evaluacion_aprobada) === 1;
  // Un perfil incompleto no se puede aprobar, pero sí se le puede QUITAR la
  // aprobación: hay perfiles aprobados en producción a los que después les
  // faltó algo, y dejar el botón muerto sería encerrar a la clienta con una
  // aprobación que ya no quiere y no puede retirar.
  const habilitado = aprobado || aprobacion.puede;
  return (
    <div style={{ background:"#fff", borderRadius:18, padding:20, boxShadow:T.shadow, border:`1.5px solid ${T.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:T.lilac, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize:14.5, fontWeight:700, color:T.ink }}>Valoración interna</div>
            <div style={{ fontSize:11.5, color:T.textSoft }}>Sólo lo ve el equipo. La candidata no.</div>
          </div>
        </div>
        {/* Aprobar es una acción, no un campo: surte efecto sola y no viaja
            con las otras seis columnas del bloque. Antes vivía en el listado,
            donde hay que decidir sin ver el perfil. */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <button onClick={aprobacion.alternar} disabled={aprobacion.ocupado || !habilitado}
            title={habilitado
              ? (aprobado ? "Quitar la aprobación de este perfil" : "Aprobar este perfil")
              : `No se puede aprobar un perfil incompleto. Falta: ${aprobacion.faltan.join(", ")}`}
            style={{
              display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10,
              fontSize:12.5, fontWeight:700, fontFamily:T.font,
              cursor: habilitado ? "pointer" : "not-allowed",
              opacity: habilitado ? 1 : .55,
              background: aprobado ? T.greenBg : "#fff",
              color:      aprobado ? T.green   : T.primary,
              border:`1.5px solid ${aprobado ? T.green : T.primary}`,
            }}>
            {aprobacion.ocupado
              ? "Un momento…"
              : aprobado
              ? <><CheckCircle2 size={13} /> Aprobado · quitar</>
              : <><CircleDashed size={13} /> Aprobar perfil</>}
          </button>

          <button onClick={onGuardar} disabled={guardando}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"none", background:T.primary, color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:T.font }}>
            {guardando ? "Guardando…" : <><Save size={13} /> Guardar</>}
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
        <div>
          <label style={LC}>Estado con la agencia</label>
          <select value={form.estado_agencia || ""} onChange={e => set("estado_agencia", e.target.value)} style={IC}>
            <option value="">Seleccionar</option>
            {ESTADOS_AGENCIA.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={LC}>Calificación DAP</label>
          <select value={form.calificacion_dap || ""} onChange={e => set("calificacion_dap", e.target.value)} style={IC}>
            <option value="">Sin calificar</option>
            {CALIFICACIONES.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div>
          <label style={LC}>Score DAP</label>
          <input type="number" step="0.1" min="0" max="10" value={form.score_dap ?? ""}
            onChange={e => set("score_dap", e.target.value)} style={IC} placeholder="0.0" />
        </div>
      </div>

      <div style={{ marginTop:14 }}>
        <label style={LC}>Nota DAP</label>
        <input value={form.nota_dap || ""} onChange={e => set("nota_dap", e.target.value)} style={IC}
          placeholder="Una línea sobre la candidata" />
      </div>
      <div style={{ marginTop:14 }}>
        <label style={LC}>Notas para la agencia</label>
        <textarea rows={3} value={form.notas_agencia || ""} onChange={e => set("notas_agencia", e.target.value)}
          style={{ ...IC, resize:"vertical" }} placeholder="Observaciones internas del equipo" />
      </div>
    </div>
  );
}

export default function AdminFichaCandidataPage() {
  const { id } = useParams();
  const { isMobile } = useMobile();

  const [perfil, setPerfil]       = useState(null);
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso]         = useState(null);
  const [aprobando, setAprobando] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/perfiles/${id}`)
      .then(r => r.json())
      .then(d => { setPerfil(d.perfil || null); setCargando(false); })
      .catch(() => setCargando(false));
  }, [id]);

  const set   = (k, v) => setPerfil(p => ({ ...p, [k]: v }));
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  // Se guarda sólo la valoración interna, no la fila entera: reenviar el perfil
  // completo desde una pantalla de lectura escribiría de vuelta todo lo que la
  // candidata haya cambiado entretanto.
  const guardarInterno = async () => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado_agencia:      perfil.estado_agencia,
        calificacion_dap:    perfil.calificacion_dap,
        score_dap:           perfil.score_dap,
        nota_dap:            perfil.nota_dap,
        notas_agencia:       perfil.notas_agencia,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) decir("Valoración guardada");
    else decir(data.error || "No se pudo guardar", "error");
    setGuardando(false);
  };

  // Aprobar tiene su propia ruta y su propia llamada. Guardar la valoración no
  // la toca, y ella no toca la valoración.
  const alternarAprobacion = async () => {
    setAprobando(true);
    const aprobada = Number(perfil.evaluacion_aprobada) !== 1;
    const res  = await fetch("/api/admin/aprobar-evaluacion", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: perfil.id, aprobada }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      set("evaluacion_aprobada", data.evaluacion_aprobada);
      decir(data.mensaje);
    } else {
      decir(data.error || "No se pudo cambiar la aprobación", "error");
    }
    setAprobando(false);
  };

  if (cargando) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:36, height:36, border:`3px solid ${T.primary3}`, borderTopColor:"transparent", borderRadius:"50%", animation:"dapspin 1s linear infinite" }} />
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!perfil?.id) return (
    <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, fontFamily:T.font }}>
      <p style={{ color:T.textSoft, fontSize:14 }}>Perfil no encontrado.</p>
      <Link href="/admin/perfiles" style={{ color:T.primary, fontSize:13, textDecoration:"none", fontWeight:600 }}>← Volver a candidatas</Link>
    </div>
  );

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile ? "16px 16px 90px" : "28px 30px", maxWidth:900, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", gap:18 }}>
      <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>

      {aviso && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background: aviso.tipo === "error" ? T.danger : T.ink, color:"#fff", padding:"12px 20px", borderRadius:14, fontSize:13, fontWeight:600 }}>
          {aviso.msg}
        </div>
      )}

      <Link href="/admin/perfiles"
        style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.textSoft, textDecoration:"none", fontSize:13, border:`1px solid ${T.border}`, padding:"7px 12px", borderRadius:10, alignSelf:"flex-start" }}>
        <ChevronLeft size={14} /> Candidatas
      </Link>

      <FichaCandidata
        perfil={perfil}
        usuario={perfil}
        modo="revision"
        titulo="Ficha de la candidata"
        subtitulo="Lo mismo que ella ve, más la valoración del equipo."
        rutaEdicion={sec => `/admin/perfiles/${id}/editar?parte=${sec.parte}&seccion=${sec.id}`}
        bloqueInterno={
          <BloqueInterno form={perfil} set={set} onGuardar={guardarInterno} guardando={guardando}
            aprobacion={{
              alternar: alternarAprobacion,
              ocupado:  aprobando,
              // La Parte 1 es la evaluación; es la que decide si hay perfil que
              // aprobar. Es una pista para pintar: la ruta lo vuelve a verificar.
              puede:    parteCompleta(1, perfil),
              faltan:   faltantesDeParte(1, perfil).map(c => c.label),
            }} />
        }
        isMobile={isMobile}
      />
    </div>
  );
}
