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
import { ChevronLeft, Save, CheckCircle2, XCircle, Undo2, Eye, EyeOff, MessageSquareWarning } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { parteCompleta, faltantesDeParte, invalidosDeParte } from "@/lib/campos-perfil";
import FichaCandidata from "@/components/perfil/FichaCandidata";
import { etapaPorId, ETAPAS_AGENCIA } from "@/lib/etapas-candidata";

const IC = {
  width:"100%", border:`1.5px solid ${T.border}`, borderRadius:10,
  padding:"9px 12px", fontSize:12.5, color:T.text, background:"#fff",
  outline:"none", fontFamily:T.font, boxSizing:"border-box",
};
const LC = {
  fontSize:10, fontWeight:700, color:T.textSoft, textTransform:"uppercase",
  letterSpacing:".7px", display:"block", marginBottom:5,
};

/**
 * La decisión del equipo y lo que el equipo escribe sobre la candidata.
 *
 * Antes eran cinco campos y un "Guardar" que decían lo mismo de tres maneras
 * (botón Aprobar, Calificación DAP y el estado "Aprobada/Rechazada"), con un
 * score de 0 a 10 escrito a mano y un letrero "Sólo lo ve el equipo" que no era
 * cierto: la agencia veía la calificación, el score y la nota. Ahora:
 *
 *   · la etapa, la agencia y el score se CALCULAN (lib/etapas-candidata.js);
 *   · la decisión son tres acciones (PUT .../decision);
 *   · las dos notas dicen quién las ve.
 */
function BloqueDecision({ form, set, estado, agencias, onDecidir, onMover, onGuardarNotas, ocupado, puedeAprobar, faltan }) {
  const [abierto, setAbierto] = useState(null);       // "aprobar" | "no_califica" | null
  const [agenciaId, setAgenciaId] = useState("");
  const [motivo, setMotivo] = useState("");
  const etapa = etapaPorId(estado?.etapa);
  const decidida = form.decision_dap;
  const deAgencia = ETAPAS_AGENCIA.includes(estado?.etapa);

  useEffect(() => { if (agencias.length === 1) setAgenciaId(String(agencias[0].id)); }, [agencias]);

  const BTN = (activo = true) => ({
    display:"inline-flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10,
    fontSize:12.5, fontWeight:700, fontFamily:T.font, cursor: activo ? "pointer" : "not-allowed", opacity: activo ? 1 : .5,
  });

  return (
    <div style={{ background:"#fff", borderRadius:18, padding:20, boxShadow:T.shadow, border:`1.5px solid ${T.border}`, display:"flex", flexDirection:"column", gap:16 }}>
      {/* Dónde está: calculado, no escrito */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"stretch" }}>
        {[
          { k:"ETAPA",   v: etapa?.label || "—", c: estado?.etapa === "no_califica" || estado?.etapa === "no_continua" ? T.danger : T.primary },
          { k:"AGENCIA", v: estado?.agencia?.nombre || (estado?.etapa === "evaluacion" ? "Sin asignar" : "—"), c: T.ink },
          { k:"SCORE",   v: estado ? `${estado.score}%` : "—", c: T.ink, ayuda: "Porcentaje de la información diligenciada: campos que le aplican y documentos." },
        ].map(x => (
          <div key={x.k} title={x.ayuda} style={{ flex:"1 1 150px", background:T.softFill, borderRadius:12, padding:"10px 14px" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".08em", color:T.textSoft }}>{x.k}</div>
            <div style={{ fontSize:15, fontWeight:700, color:x.c, marginTop:3 }}>{x.v}</div>
          </div>
        ))}
      </div>

      {/* La decisión del equipo */}
      <div>
        <div style={{ fontSize:14.5, fontWeight:700, color:T.ink }}>Decisión del equipo</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
          {!decidida && (<>
            <button type="button" disabled={ocupado || !puedeAprobar} onClick={() => setAbierto(abierto === "aprobar" ? null : "aprobar")}
              title={puedeAprobar ? "Aprobar y enviar a la agencia" : `Falta: ${faltan.join(", ")}`}
              style={{ ...BTN(puedeAprobar), background:T.green, color:"#fff", border:"none" }}>
              <CheckCircle2 size={14} /> Aprobar y enviar a la agencia
            </button>
            <a href="#secciones-ficha" style={{ ...BTN(), background:T.amberBg, color:T.amber, border:"none", textDecoration:"none" }}
              title="Usa «Observar» en cada campo, sección o documento">
              <MessageSquareWarning size={14} /> Pedir correcciones
            </a>
            <button type="button" disabled={ocupado} onClick={() => setAbierto(abierto === "no_califica" ? null : "no_califica")}
              style={{ ...BTN(), background:"#fff", color:T.danger, border:`1.5px solid ${T.dangerBg}` }}>
              <XCircle size={14} /> No califica
            </button>
          </>)}
          {/* Aprobadas antes de que existiera la relación con la agencia: se
              les asigna sin revertir la aprobación. */}
          {decidida === "aprobada" && !estado?.agencia && (
            <button type="button" disabled={ocupado} onClick={() => setAbierto(abierto === "aprobar" ? null : "aprobar")}
              style={{ ...BTN(), background:T.green, color:"#fff", border:"none" }}>
              <CheckCircle2 size={14} /> Asignar agencia
            </button>
          )}
          {decidida && (
            <button type="button" disabled={ocupado} onClick={() => onDecidir({ accion:"revertir" })}
              style={{ ...BTN(), background:"#fff", color:T.textSoft, border:`1px solid ${T.border}` }}>
              <Undo2 size={14} /> Revertir decisión
            </button>
          )}
        </div>
        {!decidida && !puedeAprobar && (
          <div style={{ fontSize:11.5, color:T.textSoft, marginTop:6 }}>Para aprobar falta: {faltan.join(", ")}</div>
        )}
        {decidida === "no_califica" && form.decision_dap_motivo && (
          <div style={{ fontSize:12.5, color:T.text, marginTop:8, background:T.neutralBg, borderRadius:10, padding:"8px 12px" }}>
            <strong>Motivo (interno):</strong> {form.decision_dap_motivo}
          </div>
        )}

        {abierto === "aprobar" && (
          <div style={{ marginTop:12, background:T.greenBg, borderRadius:12, padding:12, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <label style={{ fontSize:12.5, color:T.ink, fontWeight:600 }}>Agencia</label>
            <select value={agenciaId} onChange={e => setAgenciaId(e.target.value)} style={{ ...IC, width:"auto", minWidth:220 }}>
              <option value="">Elegir agencia</option>
              {agencias.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            <button type="button" disabled={ocupado || !agenciaId}
              onClick={async () => { if (await onDecidir({ accion:"aprobar", agencia_id:Number(agenciaId) })) setAbierto(null); }}
              style={{ ...BTN(!!agenciaId), background:T.green, color:"#fff", border:"none" }}>
              Confirmar aprobación
            </button>
          </div>
        )}
        {abierto === "no_califica" && (
          <div style={{ marginTop:12, background:T.dangerBg, borderRadius:12, padding:12 }}>
            <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} autoFocus
              placeholder="Motivo. Es interno: la candidata no lo verá." style={{ ...IC, resize:"vertical" }} />
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
              <button type="button" disabled={ocupado || !motivo.trim()}
                onClick={async () => { if (await onDecidir({ accion:"no_califica", motivo })) { setAbierto(null); setMotivo(""); } }}
                style={{ ...BTN(!!motivo.trim()), background:T.danger, color:"#fff", border:"none" }}>
                Confirmar «No califica»
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Con la agencia: la etapa se mueve a mano */}
      {deAgencia && (
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <label style={{ fontSize:12.5, color:T.ink, fontWeight:600 }}>Mover etapa</label>
          <select value={estado.etapa} disabled={ocupado} onChange={e => onMover(e.target.value)} style={{ ...IC, width:"auto", minWidth:220 }}>
            {ETAPAS_AGENCIA.map(id => <option key={id} value={id}>{etapaPorId(id).label}</option>)}
          </select>
        </div>
      )}

      {/* Las notas, con quién las ve */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
        <div>
          <label style={LC}><Eye size={11} style={{ verticalAlign:"-1px" }} /> Presentación para la agencia · la ve la agencia</label>
          <textarea rows={3} value={form.nota_dap || ""} onChange={e => set("nota_dap", e.target.value)}
            style={{ ...IC, resize:"vertical" }} placeholder="Una presentación corta de la candidata" />
        </div>
        <div>
          <label style={LC}><EyeOff size={11} style={{ verticalAlign:"-1px" }} /> Notas internas · sólo el equipo</label>
          <textarea rows={3} value={form.notas_agencia || ""} onChange={e => set("notas_agencia", e.target.value)}
            style={{ ...IC, resize:"vertical" }} placeholder="Lo que el equipo necesita recordar" />
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button type="button" onClick={onGuardarNotas} disabled={ocupado}
          style={{ ...BTN(), background:T.primary, color:"#fff", border:"none" }}>
          <Save size={13} /> Guardar notas
        </button>
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
  // Etapa, agencia, score e historial (GET .../historial), y las agencias para aprobar.
  const [estado, setEstado]       = useState(null);
  const [agencias, setAgencias]   = useState([]);
  // Observaciones del perfil (R3): crearlas abre el elemento a corrección.
  const [observaciones, setObservaciones] = useState([]);

  const cargarObservaciones = () =>
    fetch(`/api/admin/perfiles/${id}/observaciones`)
      .then(r => r.json())
      .then(d => setObservaciones(d.observaciones || []))
      .catch(() => {});
  const cargarEstado = () =>
    fetch(`/api/admin/perfiles/${id}/historial`)
      .then(r => r.json())
      .then(d => setEstado(d.etapa ? d : null))
      .catch(() => {});
  const cargarPerfil = () =>
    fetch(`/api/admin/perfiles/${id}`)
      .then(r => r.json())
      .then(d => { setPerfil(d.perfil || null); setCargando(false); })
      .catch(() => setCargando(false));

  useEffect(() => {
    cargarPerfil();
    cargarObservaciones();
    cargarEstado();
    fetch("/api/admin/agencias").then(r => r.json()).then(d => setAgencias(d.agencias || [])).catch(() => {});
  }, [id]);

  // Una observación nueva cambia la etapa (Con correcciones): se recargan las dos.
  const alObservar = () => { cargarObservaciones(); cargarEstado(); };

  const set   = (k, v) => setPerfil(p => ({ ...p, [k]: v }));
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  // Se guardan sólo las dos notas: reenviar el perfil completo desde una
  // pantalla de lectura escribiría de vuelta lo que la candidata haya cambiado.
  const guardarNotas = async () => {
    setGuardando(true);
    const res = await fetch(`/api/admin/perfiles/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota_dap: perfil.nota_dap, notas_agencia: perfil.notas_agencia }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) decir("Notas guardadas");
    else decir(data.error || "No se pudieron guardar", "error");
    setGuardando(false);
  };

  /** Aprobar, No califica o revertir. Devuelve true si salió bien. */
  const decidir = async (cuerpo) => {
    setGuardando(true);
    const res  = await fetch(`/api/admin/perfiles/${id}/decision`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo),
    });
    const data = await res.json().catch(() => ({}));
    setGuardando(false);
    if (!res.ok) { decir(data.error || "No se pudo registrar la decisión", "error"); return false; }
    decir(data.mensaje);
    await Promise.all([cargarPerfil(), cargarEstado()]);
    return true;
  };

  const mover = async (etapa) => {
    setGuardando(true);
    const res  = await fetch(`/api/admin/perfiles/${id}/etapa`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }),
    });
    const data = await res.json().catch(() => ({}));
    setGuardando(false);
    if (!res.ok) decir(data.error || "No se pudo mover", "error");
    else { decir(`Ahora en «${etapaPorId(etapa)?.label}»`); cargarEstado(); }
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
        subtitulo="Lo mismo que ella ve, más la decisión del equipo."
        rutaEdicion={sec => `/admin/perfiles/${id}/editar?parte=${sec.parte}&seccion=${sec.id}`}
        observaciones={observaciones}
        onObservacion={alObservar}
        recorrido={estado ? { etapa: estado.etapa, agencia: estado.agencia?.nombre || null, historial: estado.historial } : null}
        bloqueInterno={
          <BloqueDecision form={perfil} set={set} estado={estado} agencias={agencias}
            onDecidir={decidir} onMover={mover} onGuardarNotas={guardarNotas} ocupado={guardando}
            // Pista para pintar: la ruta lo vuelve a verificar.
            puedeAprobar={parteCompleta(1, perfil)}
            faltan={[
              ...faltantesDeParte(1, perfil).map(c => c.label),
              ...invalidosDeParte(1, perfil).map(c => `${c.label} (${c.error})`),
            ]} />
        }
        isMobile={isMobile}
      />
    </div>
  );
}
