"use client";
// app/dashboard/reuniones/page.jsx — Calendario de la candidata
// (change agenda-rango-bloques).
//
// Como un agendador tipo Salesmate (referencia de Daniel, 17 oct 2026):
//   1. «¿Con quién quieres agendar?»: las personas del equipo con horarios
//      libres, con su duración y su próximo horario.
//   2. Elegida una, su agenda en tres columnas: quién y qué (a la izquierda),
//      el mes con los días disponibles (al centro) y los horarios del día (a
//      la derecha). Tocar un horario lo convierte en «Confirmar».
// La reserva es atómica en el servidor (lib/agenda-aupair.js): si dos
// candidatas eligen el mismo horario, una lo obtiene y la otra ve el aviso.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Video, CalendarCheck, CalendarPlus, Globe } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";
import { useContacto } from "@/components/dashboard/useContacto";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const NARANJA = "#E8853B", VERDE = "#12A46B";

const pad = (n) => String(n).padStart(2, "0");
const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const deIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fechaLarga = (s) => { const t = deIso(s).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }); return t[0].toUpperCase() + t.slice(1); };
const hora12 = (t) => { const [h, m] = t.split(":").map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }); };
const duracionTexto = (m) => (m >= 60 ? (m === 60 ? "1 hora" : `${m / 60} horas`) : `${m} min`);

/** Enlace para añadirla a Google Calendar, en hora de Colombia. */
function enlaceGoogle({ fecha, hora_inicio, hora_fin, url_meet }) {
  const f = fecha.replace(/-/g, "");
  const t = (h) => h.replace(":", "") + "00";
  const p = new URLSearchParams({ action: "TEMPLATE", text: "Reunión con Destino Au Pair", dates: `${f}T${t(hora_inicio)}/${f}T${t(hora_fin)}`, ctz: "America/Bogota", details: url_meet ? `Enlace: ${url_meet}` : "" });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const Avatar = ({ nombre, foto, tam = 48 }) => foto
  ? <img src={foto} alt="" style={{ width: tam, height: tam, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  : <div style={{ width: tam, height: tam, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: tam * .38, flexShrink: 0 }}>{(nombre || "?")[0].toUpperCase()}</div>;

export default function CalendarioCandidataPage() {
  const { isMobile } = useMobile();
  const gate = useAccessGate("reuniones");
  const contacto = useContacto();
  const hoy = hoyBogota();
  const [cupos, setCupos] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [reuniones, setReuniones] = useState([]);
  const [persona, setPersona] = useState(null); // dueno_id elegido
  const [mes, setMes] = useState(hoy.slice(0, 7));
  const [dia, setDia] = useState(null);
  const [elegido, setElegido] = useState(null); // cupo a confirmar
  const [notas, setNotas] = useState("");
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const decir = (msg) => { setAviso(msg); setTimeout(() => setAviso(null), 3500); };

  const cargar = async () => {
    const [d, r, e] = await Promise.all([
      fetch("/api/dashboard/disponibilidad").then((x) => x.json()).catch(() => ({})),
      fetch("/api/dashboard/reuniones").then((x) => x.json()).catch(() => ({})),
      fetch("/api/dashboard/eventos").then((x) => x.json()).catch(() => ({})),
    ]);
    setCupos(d.cupos || []); setReuniones(r.reuniones || []); setEventos(e.eventos || []);
  };
  useEffect(() => { if (gate.access) cargar(); }, [gate.access]); // eslint-disable-line react-hooks/exhaustive-deps

  // Puede tener varias (Daniel, 17 oct): se listan todas y se sigue agendando.
  const proximas = useMemo(() => reuniones
    .filter((r) => r.estado === "confirmada" && `${r.fecha} ${r.hora_fin}` >= `${hoy} 00:00`)
    .sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`)), [reuniones, hoy]);

  // Las personas con horarios libres, con su duración y su próximo horario.
  const personas = useMemo(() => {
    const m = new Map();
    (cupos || []).forEach((c) => {
      if (!m.has(c.dueno_id)) m.set(c.dueno_id, { id: c.dueno_id, nombre: c.con, foto: c.con_foto, rol: c.con_rol, duraciones: new Set(), primero: c });
      m.get(c.dueno_id).duraciones.add(c.duracion_min);
    });
    return [...m.values()];
  }, [cupos]);
  // Siempre se elige primero con quién, aunque haya una sola persona: así el
  // paso a paso es el mismo cuando existan las agendas de las agencias (R15).
  const quien = personas.find((p) => p.id === persona) || null;
  const grupos = [
    { titulo: "Equipo Destino Au Pair", lista: personas.filter((p) => p.rol !== "agencia") },
    { titulo: "Tu agencia", lista: personas.filter((p) => p.rol === "agencia") },
  ].filter((g) => g.lista.length);

  const suyos = useMemo(() => (quien ? (cupos || []).filter((c) => c.dueno_id === quien.id) : []), [cupos, quien]);
  const diasLibres = useMemo(() => new Set(suyos.map((c) => c.fecha)), [suyos]);
  const diaVisto = dia && diasLibres.has(dia) ? dia : suyos[0]?.fecha || null;
  const delDia = suyos.filter((c) => c.fecha === diaVisto);

  const [y, m] = mes.split("-").map(Number);
  const celdas = useMemo(() => {
    const vacias = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    return [...Array(vacias).fill(null), ...Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => `${mes}-${pad(i + 1)}`)];
  }, [mes, y, m]);
  const moverMes = (n) => { const d = new Date(y, m - 1 + n, 1); setMes(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };

  const elegirPersona = (p) => {
    setPersona(p.id); setDia(p.primero.fecha); setMes(p.primero.fecha.slice(0, 7)); setElegido(null); setError(null);
  };

  const confirmar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch("/api/dashboard/reuniones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ disponibilidad_id: elegido.id, notas_cliente: notas }) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) { setError(d.error || "No se pudo agendar."); setElegido(null); await cargar(); return; }
    setElegido(null); setNotas(""); setPersona(null);
    decir("¡Listo! Tu reunión quedó agendada. Te enviamos la confirmación al correo."); cargar();
  };
  const cancelarla = async (r) => {
    setOcupado(true);
    const res = await fetch(`/api/dashboard/reuniones?id=${r.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return decir(d.error || "No se pudo cancelar.");
    decir("Cancelaste la reunión. Puedes elegir otro horario cuando quieras."); cargar();
  };

  if (gate.loading) return <GateLoading />;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="El calendario de reuniones" />;

  const tarjeta = { background: "#fff", borderRadius: 22, border: `1px solid ${T.border}`, boxShadow: "0 6px 24px rgba(58,37,48,.06)" };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
      {aviso && <div style={{ position: "fixed", top: 20, right: 20, left: isMobile ? 20 : "auto", zIndex: 2000, background: T.ink, color: "#fff", padding: "12px 18px", borderRadius: 14, fontSize: 13, fontWeight: 600, maxWidth: 380 }}>{aviso}</div>}

      <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Calendario</div>
      <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3, marginBottom: 18 }}>Agenda una reunión con el equipo para resolver tus dudas.</div>

      {proximas.length > 0 && (
        <div style={{ ...tarjeta, padding: isMobile ? 14 : 18, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 10 }}>
            <CalendarCheck size={18} style={{ color: T.primary }} /> Próximas reuniones
          </div>
          {proximas.map((r, i) => (
            <div key={r.id} style={{ display: "flex", gap: 12, alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", padding: "12px 0", borderTop: i ? `1px solid ${T.softLine}` : "none" }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: i === 0 ? T.gradIcon : T.lilac, color: i === 0 ? "#fff" : T.primary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>{Number(r.fecha.slice(8, 10))}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>{new Date(`${r.fecha}T12:00:00`).toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{fechaLarga(r.fecha)} · {hora12(r.hora_inicio)} – {hora12(r.hora_fin)}</div>
                <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 2 }}>Con {[r.asesora_nombre, r.asesora_apellido].filter(Boolean).join(" ")}</div>
                {r.url_meet ? <a href={r.url_meet} target="_blank" rel="noreferrer" style={{ color: T.primary, fontSize: 12.5, fontWeight: 700, display: "inline-flex", gap: 6, alignItems: "center", marginTop: 3, textDecoration: "none" }}><Video size={14} /> Entrar a la reunión</a>
                  : <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3 }}>Te compartiremos el enlace antes de la reunión.</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={enlaceGoogle(r)} target="_blank" rel="noreferrer" style={{ background: T.lilac, color: T.primary, borderRadius: 99, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", gap: 6, alignItems: "center" }}><CalendarPlus size={14} /> A mi calendario</a>
                <button type="button" onClick={() => cancelarla(r)} disabled={ocupado} style={{ background: "#fff", color: T.primary, border: `1.5px solid ${T.primary3}`, borderRadius: 99, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Cancelar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cupos === null ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : !personas.length ? (
          <div style={{ ...tarjeta, textAlign: "center", padding: "36px 20px", color: T.textSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            Por ahora no hay horarios libres. El equipo abre nuevos cada semana.
            {contacto.whatsapp && <div><a href={`https://wa.me/${contacto.whatsapp}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, background: T.lilac, color: T.primary, borderRadius: 10, padding: "9px 14px", fontWeight: 700, textDecoration: "none" }}>Escríbenos por WhatsApp</a></div>}
          </div>
        ) : !quien ? (
          /* ── Paso 1: con quién ── */
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>¿Con quién quieres agendar?</div>
            {grupos.map((g) => (
              <div key={g.titulo} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft, textTransform: "uppercase", marginBottom: 8 }}>{g.titulo}</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {g.lista.map((p) => (
                  <button key={p.id} type="button" onClick={() => elegirPersona(p)}
                    style={{ ...tarjeta, textAlign: "left", padding: 18, cursor: "pointer", fontFamily: T.font, display: "flex", gap: 14, alignItems: "center" }}>
                    <Avatar nombre={p.nombre} foto={p.foto} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{p.nombre}</div>
                      <div style={{ fontSize: 12.5, color: T.textSoft, display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}><Clock size={13} /> {[...p.duraciones].sort((a, b) => a - b).map(duracionTexto).join(" · ")}</div>
                      <div style={{ fontSize: 12, color: T.primary, fontWeight: 700, marginTop: 6 }}>Próximo: {fechaLarga(p.primero.fecha)} · {hora12(p.primero.hora_inicio)}</div>
                    </div>
                    <ChevronRight size={18} color={T.textSoft} />
                  </button>
                ))}
              </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Paso 2: la agenda de esa persona ── */
          <div style={{ ...tarjeta, display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden" }}>
            <div style={{ width: isMobile ? "100%" : 270, flexShrink: 0, padding: 22, borderRight: isMobile ? "none" : `1px solid ${T.softFill}`, borderBottom: isMobile ? `1px solid ${T.softFill}` : "none", boxSizing: "border-box" }}>
              {(
                <button type="button" onClick={() => { setPersona(null); setElegido(null); }} style={{ border: "none", background: "transparent", color: T.primary, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ChevronLeft size={16} /> {personas.length > 1 ? "Elegir a otra persona" : "Volver"}
                </button>
              )}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
                <Avatar nombre={quien.nombre} foto={quien.foto} tam={44} />
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, lineHeight: 1.2 }}>{quien.nombre}</div>
              </div>
              <div style={{ fontSize: 13, color: T.textSoft, display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}><Clock size={15} /> {[...quien.duraciones].sort((a, b) => a - b).map(duracionTexto).join(" · ")}</div>
              <div style={{ fontSize: 13, color: T.textSoft, display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}><Globe size={15} /> Hora de Colombia</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: T.textSoft, margin: "18px 0 6px", textTransform: "uppercase" }}>¿Qué quieres resolver? (opcional)</div>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} maxLength={1000} placeholder="Ej.: tengo dudas sobre la visa"
                style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 10, padding: 10, fontSize: 13, fontFamily: T.font, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
              <p style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5, marginTop: 12 }}>
                ¿No encuentras un horario? {contacto.whatsapp ? <a href={`https://wa.me/${contacto.whatsapp}`} target="_blank" rel="noreferrer" style={{ color: T.primary, fontWeight: 700 }}>Escríbenos</a> : "Escríbenos por mensajes"} y lo coordinamos.
              </p>
            </div>

            {/* El mes con el mismo diseño de la agenda del equipo: días redondos y un punto donde hay horarios. */}
            <div style={{ flex: 1, padding: 22, minWidth: 0, background: T.softFill }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Elige el día y la hora</div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: T.ink }}>{MESES[m - 1]} {y}</div>
                <button type="button" onClick={() => moverMes(-1)} disabled={mes <= hoy.slice(0, 7)} aria-label="Mes anterior" style={{ border: "none", background: "transparent", cursor: "pointer", color: mes <= hoy.slice(0, 7) ? T.softText : T.primary }}><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => moverMes(1)} aria-label="Mes siguiente" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.primary }}><ChevronRight size={20} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: 12, rowGap: 4 }}>
                {DIAS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.textSoft, fontWeight: 600, paddingBottom: 6 }}>{d}</div>)}
                {celdas.map((f, i) => {
                  if (!f) return <div key={`v${i}`} />;
                  const libre = diasLibres.has(f), activo = f === diaVisto, esHoy = f === hoy;
                  return (
                    <button key={f} type="button" disabled={!libre} onClick={() => { setDia(f); setElegido(null); }}
                      style={{ border: "none", background: "transparent", cursor: libre ? "pointer" : "default", padding: "3px 0", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: T.font }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                                     background: activo ? T.primary : esHoy ? NARANJA : "transparent", color: activo || esHoy ? "#fff" : libre ? T.ink : T.softText }}>
                        {Number(f.slice(8))}
                      </span>
                      <span style={{ height: 5, marginTop: 2, display: "flex" }}>{libre && <i style={{ width: 4, height: 4, borderRadius: "50%", background: VERDE }} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ width: isMobile ? "100%" : 250, flexShrink: 0, padding: 22, borderLeft: isMobile ? "none" : `1px solid ${T.softFill}`, borderTop: isMobile ? `1px solid ${T.softFill}` : "none", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{diaVisto ? fechaLarga(diaVisto) : "Elige un día"}</div>
              {error && <p role="alert" style={{ fontSize: 12.5, color: T.danger, fontWeight: 600, margin: "10px 0 0" }}>{error}</p>}
              <div style={{ display: "grid", gap: 8, marginTop: 14, overflowY: "auto", maxHeight: isMobile ? "none" : 380, paddingRight: 2 }}>
                {delDia.map((c) => elegido?.id === c.id ? (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ height: 40, borderRadius: 99, background: T.softFill, color: T.ink, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{hora12(c.hora_inicio)}</div>
                    <button type="button" onClick={confirmar} disabled={ocupado}
                      style={{ height: 40, borderRadius: 99, border: "none", background: T.primary, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, opacity: ocupado ? .6 : 1 }}>
                      {ocupado ? "…" : "Confirmar"}
                    </button>
                  </div>
                ) : (
                  <button key={c.id} type="button" onClick={() => { setElegido(c); setError(null); }}
                    style={{ height: 40, borderRadius: 99, border: `1.5px solid ${T.primary3}`, background: "#fff", color: T.primary, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
                    {hora12(c.hora_inicio)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      {eventos.length > 0 && (
        <div style={{ ...tarjeta, marginTop: 18, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 6 }}>Eventos del programa</div>
          {eventos.map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 12, padding: "7px 0", alignItems: "center" }}>
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 3, background: NARANJA }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: T.textSoft, fontWeight: 600 }}>{fechaLarga(e.fecha)}{e.hora_inicio ? ` · ${hora12(e.hora_inicio)}` : ""}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.titulo}</div>
              </div>
              {e.url_meet && <a href={e.url_meet} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: T.primary, fontWeight: 700 }}>Unirme</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
