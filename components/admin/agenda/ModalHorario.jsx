"use client";
// La agenda como en Google Calendar (referencias de Daniel, 17 oct 2026):
//
//   AdministrarAgenda  el horario semanal («Disponibilidad general»): la
//                      duración de la cita y una fila por día con sus horarios.
//                      Se repite cada semana, sin fecha de fin; el servidor
//                      mantiene abiertos los próximos 60 días.
//   EditarDia          ajusta UN día («Disponibilidad ajustada»): ese día deja
//                      de seguir el horario semanal y puede volver a él.
//
// Cada horario se quita (⊘), se agrega otro (+) o se copia a otros días (⧉).
// La hora se elige de la lista o se escribe. La lógica vive en
// lib/agenda-aupair.js (guardarHorario, configurarDia, restablecerDia).

import { useEffect, useRef, useState } from "react";
import { X, Clock, Repeat, Ban, Plus, Copy, Users, Video } from "lucide-react";
import { T } from "@/lib/tema";

const DIAS = [
  { n: 1, corto: "Lun", largo: "lunes" }, { n: 2, corto: "Mar", largo: "martes" }, { n: 3, corto: "Mié", largo: "miércoles" },
  { n: 4, corto: "Jue", largo: "jueves" }, { n: 5, corto: "Vie", largo: "viernes" }, { n: 6, corto: "Sáb", largo: "sábado" },
  { n: 0, corto: "Dom", largo: "domingo" },
];
const DURACIONES = [[15, "15 minutos"], [20, "20 minutos"], [30, "30 minutos"], [45, "45 minutos"], [60, "1 hora"], [90, "1 hora y media"]];

const pad = (n) => String(n).padStart(2, "0");
const aMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const deMin = (n) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
const hora12 = (t) => { const [h, m] = t.split(":").map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }).replace(/\s/g, "").replace("a.m.", "am").replace("p.m.", "pm"); };
// Todo el día, cada 15 minutos (la lista se abre en la hora actual).
const HORAS = Array.from({ length: 24 * 4 }, (_, i) => deMin(i * 15));
const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const ahoraBogota = () => new Date().toLocaleTimeString("en-GB", { timeZone: "America/Bogota", hour12: false }).slice(0, 5);

/** "9", "9:15", "930", "2pm", "2:45 p. m.", "14:30" → "HH:MM"; null si no se entiende. */
function leerHora(texto) {
  const t = String(texto || "").toLowerCase().replace(/\s|\./g, "");
  const m = t.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/);
  if (!m) return null;
  let h = Number(m[1]); const min = Number(m[2] || 0); const suf = m[3];
  if (min > 59) return null;
  if (suf) { if (h < 1 || h > 12) return null; if (suf.startsWith("p") && h < 12) h += 12; if (suf.startsWith("a") && h === 12) h = 0; }
  if (h > 23) return null;
  return deMin(h * 60 + min);
}

/**
 * Hora como la de Google: un selector que también se escribe. Al enfocarlo
 * se abre la lista (cada 15 min) en la hora actual; al salir, lo escrito se
 * interpreta y, si no se entiende, vuelve a la hora anterior.
 */
function CampoHora({ value, onChange, min, etiqueta }) {
  const [texto, setTexto] = useState(hora12(value));
  const [abierto, setAbierto] = useState(false);
  const lista = useRef(null);
  useEffect(() => { setTexto(hora12(value)); }, [value]);
  useEffect(() => {
    if (!abierto || !lista.current) return;
    const actual = lista.current.querySelector("[data-actual='1']");
    if (actual) lista.current.scrollTop = actual.offsetTop - 60;
  }, [abierto]);
  const opciones = HORAS.filter((h) => !min || h > min);
  const confirmar = () => {
    const h = leerHora(texto);
    if (h && (!min || h > min)) onChange(h); else setTexto(hora12(value));
    setAbierto(false);
  };
  return (
    <div style={{ position: "relative", width: 96 }}>
      <input value={texto} aria-label={etiqueta} onFocus={(e) => { setAbierto(true); e.target.select(); }} onChange={(e) => setTexto(e.target.value)}
        onBlur={() => setTimeout(confirmar, 120)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } if (e.key === "Escape") { setTexto(hora12(value)); setAbierto(false); } }}
        style={{ ...sel, width: "100%", boxSizing: "border-box", cursor: "text", borderBottom: abierto ? `2px solid ${T.primary}` : "none" }} />
      {abierto && (
        <div ref={lista} style={{ position: "absolute", top: 42, left: 0, width: 120, maxHeight: 210, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(58,37,48,.18)", zIndex: 20, padding: "4px 0" }}>
          {opciones.map((h) => (
            <div key={h} data-actual={h === value ? "1" : "0"} onMouseDown={(e) => { e.preventDefault(); onChange(h); setTexto(hora12(h)); setAbierto(false); }}
              style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer", background: h === value ? T.softFill : "#fff", fontWeight: h === value ? 700 : 500, color: T.ink }}>
              {hora12(h)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Cambia el inicio (k=0) o el fin; si el inicio pasa al fin, el fin se corre una hora después, como en Google. */
function ajustar([hi, hf], k, v) {
  if (k === 1) return [hi, v];
  return v < hf ? [v, hf] : [v, deMin(Math.min(aMin(v) + 60, 24 * 60 - 1))];
}

const PLAN_INICIAL = { 1: [["09:00", "12:00"]], 2: [["09:00", "12:00"]], 3: [["09:00", "12:00"]], 4: [["09:00", "12:00"]], 5: [["09:00", "12:00"]] };

const sel = { height: 38, border: "none", borderRadius: 8, background: T.softFill, color: T.ink, fontSize: 13, fontWeight: 600, fontFamily: T.font, padding: "0 10px", cursor: "pointer", outline: "none" };
const iconoBtn = { width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", color: T.textSoft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

function Seccion({ Icono, titulo, ayuda, children }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: `1px solid ${T.softFill}` }}>
      <Icono size={19} color={T.textSoft} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{titulo}</div>
        {ayuda && <div style={{ fontSize: 12, color: T.textSoft, marginTop: 1 }}>{ayuda}</div>}
        <div style={{ marginTop: 10 }}>{children}</div>
      </div>
    </div>
  );
}

/** Los horarios de un día: filas inicio – fin con ⊘ y +, o «No disponible». */
function Rangos({ rangos, onChange, etiqueta, extra }) {
  const agregar = () => {
    const u = rangos[rangos.length - 1];
    const ini = u ? Math.min(aMin(u[1]) + 60, 21 * 60) : 9 * 60;
    onChange([...rangos, [deMin(ini), deMin(Math.min(ini + 120, 23 * 60 + 45))]]);
  };
  if (!rangos.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 38 }}>
      <span style={{ fontSize: 13, color: T.textSoft }}>No disponible</span>
      <button type="button" onClick={agregar} title="Agregar horario" aria-label={`Agregar horario ${etiqueta}`} style={iconoBtn}><Plus size={17} /></button>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {rangos.map(([hi, hf], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <CampoHora value={hi} onChange={(v) => onChange(rangos.map((x, j) => (j === i ? ajustar(x, 0, v) : x)))} etiqueta={`Inicio ${etiqueta}`} />
          <span style={{ color: T.textSoft }}>–</span>
          <CampoHora value={hf} min={hi} onChange={(v) => onChange(rangos.map((x, j) => (j === i ? ajustar(x, 1, v) : x)))} etiqueta={`Fin ${etiqueta}`} />
          <button type="button" onClick={() => onChange(rangos.filter((_, j) => j !== i))} title="Quitar este horario" aria-label={`Quitar horario ${etiqueta}`} style={iconoBtn}><Ban size={16} /></button>
          {i === 0 && <button type="button" onClick={agregar} title="Agregar otro horario" aria-label={`Agregar otro horario ${etiqueta}`} style={iconoBtn}><Plus size={17} /></button>}
          {i === 0 && extra}
        </div>
      ))}
    </div>
  );
}

const cortos = (rangos, duracion) => rangos.some(([hi, hf]) => aMin(hf) - aMin(hi) < duracion);
const sesionesDe = (rangos, duracion) => rangos.reduce((s, [hi, hf]) => s + Math.max(0, Math.floor((aMin(hf) - aMin(hi)) / duracion)), 0);

function Marco({ titulo, etiqueta, onCerrar, children, pie }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(58,37,48,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, maxHeight: "94vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: 20, fontFamily: T.font, color: T.text, boxShadow: "0 20px 50px rgba(58,37,48,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 6px" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: T.textSoft }}>{etiqueta}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: T.ink, marginTop: 2 }}>{titulo}</div>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ ...iconoBtn, color: T.ink }}><X size={19} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "0 22px" }}>{children}</div>
        <div style={{ padding: "14px 22px 18px", borderTop: `1px solid ${T.softFill}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>{pie}</div>
      </div>
    </div>
  );
}

const Botones = ({ onCerrar, onGuardar, ocupado, deshabilitado, texto = "Guardar" }) => (
  <div style={{ display: "flex", gap: 8 }}>
    <button type="button" onClick={onCerrar} style={{ border: `1.5px solid ${T.border}`, background: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, color: T.ink }}>Cancelar</button>
    <button type="button" onClick={onGuardar} disabled={ocupado || deshabilitado}
      style={{ border: "none", background: T.primary, color: "#fff", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, opacity: ocupado || deshabilitado ? .55 : 1 }}>
      {ocupado ? "Guardando…" : texto}
    </button>
  </div>
);

const Aviso = ({ error, children }) => (
  <div style={{ fontSize: 12.5, color: error ? T.danger : T.textSoft, fontWeight: error ? 700 : 500, flex: "1 1 200px" }}>{error || children}</div>
);

/** «Administrar agenda»: el horario semanal, que se repite sin fecha de fin. */
export default function AdministrarAgenda({ equipo, yo, horarios = [], onCerrar, onGuardado }) {
  const [dueno, setDueno] = useState(yo || equipo[0]?.id || "");
  const deDueno = (id) => horarios.find((h) => Number(h.dueno_id) === Number(id));
  const inicial = deDueno(dueno);
  const [duracion, setDuracion] = useState(inicial?.duracion_min || 30);
  const [plan, setPlan] = useState(inicial?.plan || PLAN_INICIAL);
  const [urlMeet, setUrlMeet] = useState(inicial?.url_meet || "");
  const [copiando, setCopiando] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  // Cada persona del equipo tiene su propio horario: al cambiar quién atiende se carga el suyo.
  const cambiarDueno = (id) => {
    setDueno(id);
    const h = deDueno(id);
    setDuracion(h?.duracion_min || 30); setPlan(h?.plan || PLAN_INICIAL); setUrlMeet(h?.url_meet || "");
  };
  const setDia = (d, rangos) => setPlan((p) => { const x = { ...p }; if (rangos.length) x[d] = rangos; else delete x[d]; return x; });
  const aplicarCopia = () => {
    setPlan((p) => { const x = { ...p }; destinos.forEach((d) => { x[d] = p[copiando].map((r) => [...r]); }); return x; });
    setCopiando(null); setDestinos([]);
  };

  const todos = Object.values(plan).flat();
  const invalido = cortos(todos, duracion) ? "Hay un horario más corto que una sesión." : null;
  const porSemana = sesionesDe(todos, duracion);

  const guardar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch("/api/admin/agenda", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horario: { dueno_id: dueno, duracion_min: duracion, plan, url_meet: urlMeet } }),
    });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo guardar.");
    onGuardado(porSemana ? `Horario semanal guardado · ${porSemana} ${porSemana === 1 ? "sesión" : "sesiones"} cada semana` : "Horario semanal en pausa");
  };

  return (
    <Marco titulo="Administrar agenda" etiqueta="AGENDA DE CITAS PARA RESERVAR" onCerrar={onCerrar}
      pie={<>
        <Aviso error={error || invalido}>
          {porSemana ? <><b style={{ color: T.ink }}>{porSemana} {porSemana === 1 ? "sesión" : "sesiones"}</b> de {duracion} min cada semana. Se repite sin fecha de fin.</> : "Sin días con horario: la agenda queda en pausa."}
        </Aviso>
        <Botones onCerrar={onCerrar} onGuardar={guardar} ocupado={ocupado} deshabilitado={!!invalido} />
      </>}>
      <Seccion Icono={Users} titulo="Quién atiende" ayuda="Cada persona del equipo tiene su propio horario.">
        <select value={dueno} onChange={(e) => cambiarDueno(Number(e.target.value))} style={sel} aria-label="Quién atiende">
          {equipo.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </Seccion>

      <Seccion Icono={Clock} titulo="Duración de la cita" ayuda="¿Cuánto debe durar cada cita?">
        <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} style={sel} aria-label="Duración de la cita">
          {DURACIONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Seccion>

      <Seccion Icono={Repeat} titulo="Disponibilidad general" ayuda="Cuándo sueles estar disponible. Se repite cada semana; un día puntual lo ajustas desde la agenda.">
        <div style={{ display: "grid", gap: 4 }}>
          {DIAS.map(({ n, corto, largo }) => (
            <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 0", position: "relative" }}>
              <div style={{ width: 38, fontSize: 13, fontWeight: 700, color: plan[n]?.length ? T.ink : T.textSoft, paddingTop: 9, flexShrink: 0 }}>{corto}</div>
              <div style={{ flex: 1 }}>
                <Rangos rangos={plan[n] || []} onChange={(r) => setDia(n, r)} etiqueta={largo}
                  extra={<button type="button" onClick={() => { setCopiando(n); setDestinos([]); }} title="Copiar a otros días" aria-label={`Copiar el ${largo} a otros días`} style={iconoBtn}><Copy size={15} /></button>} />
              </div>
              {copiando === n && (
                <div style={{ position: "absolute", right: 0, top: 40, zIndex: 25, background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(58,37,48,.18)", padding: 12, width: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: ".05em", marginBottom: 6 }}>COPIAR HORARIO A</div>
                  {DIAS.filter((x) => x.n !== n).map((x) => (
                    <label key={x.n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0", cursor: "pointer", textTransform: "capitalize" }}>
                      <input type="checkbox" checked={destinos.includes(x.n)} onChange={() => setDestinos((ds) => (ds.includes(x.n) ? ds.filter((y) => y !== x.n) : [...ds, x.n]))} style={{ accentColor: T.primary }} /> {x.largo}
                    </label>
                  ))}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
                    <button type="button" onClick={() => setCopiando(null)} style={{ border: "none", background: "transparent", color: T.textSoft, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.font }}>Cancelar</button>
                    <button type="button" onClick={aplicarCopia} disabled={!destinos.length} style={{ border: "none", background: T.primary, color: "#fff", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.font, opacity: destinos.length ? 1 : .5 }}>Aplicar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion Icono={Video} titulo="Enlace de la reunión" ayuda="Opcional. Lo recibe la candidata al reservar.">
        <input value={urlMeet} onChange={(e) => setUrlMeet(e.target.value)} placeholder="https://meet.google.com/…"
          style={{ ...sel, width: "100%", boxSizing: "border-box", cursor: "text", fontWeight: 500 }} />
      </Seccion>
    </Marco>
  );
}

/**
 * «Editar este día»: los horarios de UN día. Ese día deja de seguir el horario
 * semanal (y puede volver a él). Sin horarios = no disponible ese día.
 */
export function EditarDia({ fecha, equipo, yo, horarios = [], franjasDelDia = [], ajustado, onCerrar, onGuardado }) {
  const [dueno, setDueno] = useState(yo || equipo[0]?.id || "");
  const propias = (id) => franjasDelDia.filter((f) => Number(f.dueno_id) === Number(id));
  const base = (id) => {
    const fr = propias(id);
    const h = horarios.find((x) => Number(x.dueno_id) === Number(id));
    return {
      rangos: fr.length ? fr.map((f) => [f.hora_inicio, f.hora_fin]) : (ajustado ? [] : [["09:00", "12:00"]]),
      duracion: fr[0]?.duracion_min || h?.duracion_min || 30,
      url: fr[0]?.url_meet || h?.url_meet || "",
    };
  };
  const [rangos, setRangos] = useState(base(dueno).rangos);
  const [duracion, setDuracion] = useState(base(dueno).duracion);
  const [urlMeet, setUrlMeet] = useState(base(dueno).url);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const cambiarDueno = (id) => { setDueno(id); const b = base(id); setRangos(b.rangos); setDuracion(b.duracion); setUrlMeet(b.url); };

  const esHoy = fecha === hoyBogota();
  const vigentes = rangos.filter(([hi]) => !esHoy || hi > ahoraBogota());
  const invalido = cortos(rangos, duracion) ? "Hay un horario más corto que una sesión." : null;
  const n = sesionesDe(vigentes, duracion);
  const titulo = new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  const enviar = async (metodo) => {
    setOcupado(true); setError(null);
    const res = metodo === "DELETE"
      ? await fetch(`/api/admin/agenda?dia=${fecha}&dueno_id=${dueno}`, { method: "DELETE" })
      : await fetch("/api/admin/agenda", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dia: { dueno_id: dueno, fecha, rangos, duracion_min: duracion, url_meet: urlMeet } }) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo guardar.");
    onGuardado(metodo === "DELETE" ? "El día vuelve a tu horario semanal" : n ? `${n} ${n === 1 ? "sesión" : "sesiones"} ese día` : "Ese día queda no disponible");
  };

  return (
    <Marco titulo={titulo[0].toUpperCase() + titulo.slice(1)} etiqueta="EDITAR ESTE DÍA" onCerrar={onCerrar}
      pie={<>
        <Aviso error={error || invalido}>{n ? <><b style={{ color: T.ink }}>{n} {n === 1 ? "sesión" : "sesiones"}</b> de {duracion} min ese día. Sólo cambia este día.</> : "Ese día quedará no disponible."}</Aviso>
        <Botones onCerrar={onCerrar} onGuardar={() => enviar("POST")} ocupado={ocupado} deshabilitado={!!invalido} />
      </>}>
      <Seccion Icono={Users} titulo="Quién atiende">
        <select value={dueno} onChange={(e) => cambiarDueno(Number(e.target.value))} style={sel} aria-label="Quién atiende">
          {equipo.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </Seccion>
      <Seccion Icono={Clock} titulo="Duración de la cita">
        <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} style={sel} aria-label="Duración de la cita">
          {DURACIONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Seccion>
      <Seccion Icono={Repeat} titulo="Horarios de este día" ayuda="Sólo cambian este día; las demás semanas siguen tu horario semanal. Lo ya reservado se respeta.">
        <Rangos rangos={rangos} onChange={setRangos} etiqueta="del día" />
        {ajustado && (
          <button type="button" onClick={() => enviar("DELETE")} disabled={ocupado}
            style={{ marginTop: 12, border: "none", background: T.lilac, color: T.primary, borderRadius: 10, padding: "8px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.font }}>
            Volver al horario semanal
          </button>
        )}
      </Seccion>
      <Seccion Icono={Video} titulo="Enlace de la reunión" ayuda="Opcional.">
        <input value={urlMeet} onChange={(e) => setUrlMeet(e.target.value)} placeholder="https://meet.google.com/…"
          style={{ ...sel, width: "100%", boxSizing: "border-box", cursor: "text", fontWeight: 500 }} />
      </Seccion>
    </Marco>
  );
}
