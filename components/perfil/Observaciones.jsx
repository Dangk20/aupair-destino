"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/Observaciones.jsx — Las observaciones del perfil, en pantalla
//
// El admin escribe una observación sobre un campo, una sección o un documento,
// y eso basta para que la candidata pueda corregir ese elemento (R3). Aquí
// están las tres piezas que se ven:
//
//   ObservarElemento       el botón del admin y su texto (ficha en revisión)
//   PanelObservaciones     el listado del admin, con estado y acciones
//   CorreccionesCandidata  lo que la candidata tiene que corregir, con el
//                          control para hacerlo ahí mismo
//
// Las reglas (qué cubre cada observación) están en lib/observaciones-perfil.js.
// ════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import Link from "next/link";
import { MessageSquareWarning, Check, X, Send, FileUp } from "lucide-react";
import { T } from "@/lib/tema";
import { seccionDe, elementoDe } from "@/lib/observaciones-perfil";
import { PARTE1, PARTE2 } from "@/lib/campos-perfil";
import CampoEditable from "@/components/perfil/CampoEditable";
import FotoUpload from "@/components/dashboard/FotoUpload";
import DocumentoUpload from "@/components/dashboard/DocumentoUpload";

// Las fotos de la cédula se suben en la Parte 1 · Información personal, pero no
// están declaradas en campos-perfil.js. Sin esto, una observación sobre esa
// sección ("la cédula está borrosa") no tendría dónde volver a subirlas: el
// formulario de una parte enviada ya no se abre.
const FOTOS_CEDULA = [
  { name: "cedula_frontal_url",   label: "Cédula · lado frontal" },
  { name: "cedula_posterior_url", label: "Cédula · lado posterior" },
];
const conFotosDeCedula = (obs) =>
  (obs.tipo === "seccion" && Number(obs.parte) === 1 && obs.seccion === "personal") ||
  (obs.tipo === "campo" && obs.campo?.startsWith("cedula_"));

const ESTADO = {
  abierta:  { texto: "Abierta · la candidata puede corregir", color: T.amber, bg: T.amberBg },
  atendida: { texto: "Atendida · por revisar",                color: T.primary, bg: T.lilac },
  cerrada:  { texto: "Cerrada",                               color: T.green, bg: T.greenBg },
};

const BTN = {
  fontFamily: T.font, fontSize: 12, fontWeight: 700, borderRadius: 10,
  padding: "7px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
};

/** Observaciones que tocan un elemento: el campo, su sección o el documento. */
export function observacionesDe(observaciones = [], { campo, parte, seccion, tipoDoc }) {
  return observaciones.filter((o) => {
    if (o.estado === "cerrada") return false;
    if (campo)   return o.tipo === "campo" && o.campo === campo;
    if (seccion) return o.tipo === "seccion" && Number(o.parte) === Number(parte) && o.seccion === seccion;
    if (tipoDoc) return o.tipo === "documento" && o.tipo_doc === tipoDoc;
    return false;
  });
}

/** ¿Hay una observación abierta que reabra algo de esta sección? */
export function seccionConCorreccion(observaciones = [], parte, seccion) {
  const s = seccionDe(parte, seccion);
  return observaciones.some((o) => o.estado === "abierta" && (
    (o.tipo === "seccion" && Number(o.parte) === Number(parte) && o.seccion === seccion) ||
    (o.tipo === "campo" && s?.campos.some((c) => c.name === o.campo))
  ));
}

/** Texto de una observación con su estado, bajo el elemento. */
export function NotaObservacion({ obs, paraCandidata = false }) {
  const e = ESTADO[obs.estado] || ESTADO.abierta;
  return (
    <div style={{ marginTop: 8, background: e.bg, borderRadius: 10, padding: "9px 12px", fontSize: 12, color: T.text, lineHeight: 1.5 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: e.color, letterSpacing: ".04em", marginBottom: 3 }}>
        {paraCandidata
          ? (obs.estado === "abierta" ? "EL EQUIPO TE PIDE CORREGIR" : "CORREGIDO · EN REVISIÓN")
          : e.texto.toUpperCase()}
      </div>
      {obs.texto}
    </div>
  );
}

/* ── Admin: el botón "Observar" y su texto ──────────────────────────────── */
export function ObservarElemento({ usuarioId, elemento, etiqueta = "Observar", onCreada, compacto = false }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto]     = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError]     = useState("");

  const guardar = async () => {
    setEnviando(true); setError("");
    const res = await fetch(`/api/admin/perfiles/${usuarioId}/observaciones`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...elemento, texto }),
    });
    const d = await res.json().catch(() => ({}));
    setEnviando(false);
    if (!res.ok) { setError(d.error || "No se pudo guardar."); return; }
    setTexto(""); setAbierto(false);
    onCreada?.(d.observacion);
  };

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} title="Abrir a corrección con una observación"
        style={{ ...BTN, padding: compacto ? "4px 9px" : BTN.padding, fontSize: compacto ? 11 : 12,
                 background: T.amberBg, color: T.amber, border: "none", flexShrink: 0 }}>
        <MessageSquareWarning size={compacto ? 12 : 13} /> {etiqueta}
      </button>
    );
  }
  return (
    <div style={{ marginTop: 8, width: "100%", background: T.amberBg, borderRadius: 12, padding: 12 }}>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} autoFocus
        placeholder="Qué hay que corregir. La candidata lo leerá tal cual."
        style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "8px 10px",
                 fontFamily: T.font, fontSize: 13, color: T.text, resize: "vertical", outline: "none" }} />
      {error && <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
        <button type="button" onClick={() => { setAbierto(false); setError(""); }}
          style={{ ...BTN, background: "#fff", color: T.textSoft, border: `1px solid ${T.border}` }}>Cancelar</button>
        <button type="button" onClick={guardar} disabled={enviando || !texto.trim()}
          style={{ ...BTN, background: T.amber, color: "#fff", border: "none", opacity: texto.trim() ? 1 : .5 }}>
          <Send size={13} /> {enviando ? "Guardando…" : "Abrir a corrección"}
        </button>
      </div>
    </div>
  );
}

/* ── Admin: listado de observaciones con su estado ─────────────────────── */
export function PanelObservaciones({ usuarioId, observaciones = [], onCambio }) {
  const [ocupado, setOcupado] = useState(null);
  if (!observaciones.length) return null;

  const accion = async (obs, accion) => {
    setOcupado(obs.id);
    await fetch(`/api/admin/perfiles/${usuarioId}/observaciones`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: obs.id, accion }),
    }).catch(() => {});
    setOcupado(null);
    onCambio?.();
  };

  const vivas = observaciones.filter((o) => o.estado !== "cerrada");
  const cerradas = observaciones.length - vivas.length;

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 18, boxShadow: T.shadow, fontFamily: T.font }}>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>Observaciones</div>
      <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>
        {vivas.filter((o) => o.estado === "abierta").length} abiertas ·{" "}
        {vivas.filter((o) => o.estado === "atendida").length} atendidas por revisar · {cerradas} cerradas
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {vivas.map((o) => (
          <div key={o.id} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{elementoDe(o)}</div>
              {o.estado === "atendida" ? (
                <button type="button" disabled={ocupado === o.id} onClick={() => accion(o, "cerrar")}
                  style={{ ...BTN, background: T.greenBg, color: T.green, border: "none" }}>
                  <Check size={13} /> Dar por corregida
                </button>
              ) : (
                <button type="button" disabled={ocupado === o.id} onClick={() => accion(o, "retirar")}
                  style={{ ...BTN, background: "#fff", color: T.textSoft, border: `1px solid ${T.border}` }}>
                  <X size={13} /> Retirar
                </button>
              )}
            </div>
            <NotaObservacion obs={o} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Candidata: lo que tiene que corregir, con el control para hacerlo ── */

/** Los campos que reabre una observación de campo o de sección. */
function camposDe(obs) {
  if (obs.tipo === "seccion") return seccionDe(Number(obs.parte), obs.seccion)?.campos || [];
  if (obs.tipo === "campo") {
    for (const secciones of [PARTE1, PARTE2]) {
      for (const s of secciones) {
        const c = s.campos.find((c) => c.name === obs.campo);
        if (c) return [c];
      }
    }
  }
  return [];
}

function Correccion({ obs, perfil, onGuardado }) {
  const campos = camposDe(obs);
  const fotos  = conFotosDeCedula(obs)
    ? FOTOS_CEDULA.filter((f) => obs.tipo === "seccion" || f.name === obs.campo)
    : [];
  const [valores, setValores] = useState(() => Object.fromEntries([
    ...campos.map((c) => [c.name, c.tipo === "fecha"
      ? String(perfil?.[c.name] ?? "").slice(0, 10) : (perfil?.[c.name] ?? "")]),
    ...fotos.map((f) => [f.name, perfil?.[f.name] ?? ""]),
  ]));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    setGuardando(true); setError("");
    const res = await fetch("/api/dashboard/perfil", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valores),
    });
    const d = await res.json().catch(() => ({}));
    setGuardando(false);
    if (!res.ok) { setError(d.error || "No se pudo guardar."); return; }
    onGuardado?.();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: T.shadow, border: `1.5px solid ${T.amber}` }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{elementoDe(obs)}</div>
      <NotaObservacion obs={obs} paraCandidata />

      {obs.tipo === "documento" ? (
        <Link href="/dashboard/documentos"
          style={{ ...BTN, marginTop: 12, background: T.primary, color: "#fff", textDecoration: "none" }}>
          <FileUp size={14} /> Volver a cargar el documento
        </Link>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {campos.map((c) => c.name === "foto_url" ? (
              <FotoUpload key={c.name} value={valores.foto_url}
                onChange={(v) => setValores((x) => ({ ...x, foto_url: v }))} />
            ) : (
              <CampoEditable key={c.name} campo={c} valor={valores[c.name]}
                obligatorio={false} marcarHeredado={false}
                onChange={(name, v) => setValores((x) => ({ ...x, [name]: v }))} />
            ))}
            {fotos.map((f) => (
              <DocumentoUpload key={f.name} label={f.label} value={valores[f.name]}
                onChange={(v) => setValores((x) => ({ ...x, [f.name]: v }))} />
            ))}
          </div>
          {error && <div style={{ fontSize: 12.5, color: T.danger, marginTop: 8 }}>{error}</div>}
          <button type="button" onClick={guardar} disabled={guardando}
            style={{ ...BTN, marginTop: 12, background: T.primary, color: "#fff", border: "none", padding: "10px 16px", fontSize: 13 }}>
            <Check size={14} /> {guardando ? "Guardando…" : "Guardar corrección"}
          </button>
        </>
      )}
    </div>
  );
}

export function CorreccionesCandidata({ perfil, observaciones = [], onGuardado }) {
  const abiertas  = observaciones.filter((o) => o.estado === "abierta");
  const atendidas = observaciones.filter((o) => o.estado === "atendida");
  if (!abiertas.length && !atendidas.length) return null;

  return (
    <div id="correcciones" style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: T.font }}>
      {abiertas.length > 0 && (
        <div style={{ background: T.amberBg, borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
            El equipo te pidió corregir {abiertas.length === 1 ? "1 cosa" : `${abiertas.length} cosas`}
          </div>
          <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 3, lineHeight: 1.5 }}>
            Sólo puedes cambiar lo que aparece aquí. Al guardar, vuelve a quedar en revisión.
          </div>
        </div>
      )}
      {abiertas.map((o) => (
        <Correccion key={o.id} obs={o} perfil={perfil} onGuardado={onGuardado} />
      ))}
      {atendidas.length > 0 && (
        <div style={{ background: T.lilac, borderRadius: 14, padding: "12px 14px", fontSize: 12.5, color: T.textSoft, lineHeight: 1.5 }}>
          <strong style={{ color: T.ink }}>En revisión:</strong>{" "}
          {atendidas.map((o) => elementoDe(o)).join(", ")}. Ya lo corregiste; el equipo lo está revisando.
        </div>
      )}
    </div>
  );
}
