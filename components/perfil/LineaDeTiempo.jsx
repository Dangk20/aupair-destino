"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/LineaDeTiempo.jsx — El recorrido de una candidata
//
// Una sola línea de tiempo para todas las vistas: la candidata la ve en
// "Mi Destino" y en su perfil; el admin, en la ficha (y la agencia, en la
// suya). Lo único que cambia con `modo` es qué detalle se muestra:
//
//   modo="propio"    sin autor ni hechos internos (la API ya no los envía)
//   modo="revision"  con autor, y los internos marcados
//
// No hace fetch: cada pantalla trae { etapa, agencia, historial } de su API.
// ════════════════════════════════════════════════════════════════════════
import { Check, Circle, XCircle, Lock } from "lucide-react";
import { T } from "@/lib/tema";
import { ETAPAS, etapaPorId, posicion } from "@/lib/etapas-candidata";

const fecha = (f) => f
  ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" })
  : null;

/** Fecha en que llegó a cada etapa: el último hecho que lleva a ella. */
function fechasPorEtapa(historial = []) {
  const m = {};
  for (const h of historial) if (h.etapa) m[h.etapa] = h.fecha;
  return m;
}

export default function LineaDeTiempo({ etapa, agencia = null, historial = [], modo = "propio", compacta = false }) {
  const revision = modo === "revision";
  const salida   = etapaPorId(etapa)?.id === "no_califica" || etapa === "no_continua";
  const fechas   = fechasPorEtapa(historial);
  const hubo     = new Set(historial.map((h) => h.etapa).filter(Boolean));

  // "Con correcciones" sólo aparece en el camino si ocurrió o es la actual.
  const camino = ETAPAS.filter((e) => e.id !== "correcciones" || etapa === "correcciones" || hubo.has("correcciones"));
  // Hasta dónde llegó, para pintar el camino de una salida.
  const alcanzada = salida
    ? Math.max(...historial.map((h) => posicion(h.etapa)).filter((p) => p >= 0), 0)
    : posicion(etapa);

  return (
    <div style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 18 }}>
      {salida && (
        <div style={{ background: T.dangerBg, color: T.danger, borderRadius: 14, padding: "12px 14px", fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
          <XCircle size={18} />
          <div>
            <strong>{etapaPorId(etapa)?.label}.</strong>{" "}
            <span style={{ color: T.text }}>{etapaPorId(etapa)?.descripcion}</span>
          </div>
        </div>
      )}

      {/* El camino: cumplidas, la actual y las que faltan */}
      <div style={{ position: "relative", paddingLeft: 30 }}>
        <div style={{ position: "absolute", left: 11, top: 10, bottom: 10, width: 2, background: T.softLine }} />
        {camino.map((e) => {
          const p      = posicion(e.id);
          const hecha  = salida ? p <= alcanzada && hubo.has(e.id) : p < alcanzada || (e.id === "completada" && etapa === "completada");
          const actual = !salida && e.id === etapa && etapa !== "completada";
          const color  = hecha ? T.primary : actual ? T.amber : T.softText;
          return (
            <div key={e.id} style={{ position: "relative", padding: compacta ? "6px 0" : "8px 0" }}>
              <div style={{
                position: "absolute", left: -30, top: compacta ? 6 : 8, width: 24, height: 24, borderRadius: "50%",
                background: hecha ? T.primary : "#fff", border: `2px solid ${color}`, color: hecha ? "#fff" : color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: actual ? "0 0 0 5px rgba(232,133,59,.15)" : "none",
              }}>
                {hecha ? <Check size={13} /> : actual ? <Circle size={9} fill={T.amber} /> : <Lock size={11} />}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <div style={{ fontSize: 13.5, fontWeight: actual ? 700 : 600, color: hecha || actual ? T.ink : T.textSoft }}>
                  {e.label}
                  {actual && <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, color: T.amber, background: T.amberBg, padding: "2px 8px", borderRadius: 20 }}>AHORA</span>}
                </div>
                {fechas[e.id] && <div style={{ fontSize: 11.5, color: T.textSoft }}>{fecha(fechas[e.id])}</div>}
              </div>
              {!compacta && (actual || (e.agencia && agencia && (hecha || actual))) && (
                <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2, lineHeight: 1.5 }}>
                  {actual && e.descripcion}
                  {e.agencia && agencia && (hecha || actual) && <>{actual ? " · " : ""}Agencia: <strong style={{ color: T.ink }}>{agencia}</strong></>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Los hechos, con fecha */}
      {!compacta && historial.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: T.textSoft, marginBottom: 8 }}>HISTORIAL</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...historial].reverse().map((h) => (
              <div key={h.id} style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.45, padding: "6px 10px", borderRadius: 10, background: h.interno ? T.neutralBg : T.softFill }}>
                <div style={{ color: T.textSoft, minWidth: 92, flexShrink: 0 }}>{fecha(h.fecha)}</div>
                <div style={{ color: T.text }}>
                  {h.texto}
                  {h.agencia && h.evento !== "etapa" && <> · {h.agencia}</>}
                  {revision && h.detalle && <span style={{ color: T.textSoft }}> — {h.detalle}</span>}
                  {revision && (h.actor || h.interno) && (
                    <span style={{ color: T.softText, fontSize: 11.5 }}>
                      {" "}({[h.actor, h.interno ? "interno" : null].filter(Boolean).join(" · ")})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
