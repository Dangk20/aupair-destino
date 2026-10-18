"use client";
// app/admin/reuniones/page.jsx — Agenda del equipo (change agenda-rango-bloques)
//
// Diseño según la referencia de Daniel (17 oct 2026): a la izquierda el mes
// compacto con puntos en los días con algo (por ahí se navega: un día o, sin
// elegir, lo que viene); a la derecha la agenda por día, con la hora grande,
// la de fin debajo y una barra de color por tipo.
//
// La disponibilidad se configura por franjas: un día, un rango y la duración
// de cada sesión. Los cupos los calcula el servidor (lib/agenda-aupair.js).

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Video, CalendarPlus, Users, Settings2 } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import ModalEvento, { TIPO_CFG } from "@/components/admin/agenda/ModalEvento";
import AdministrarAgenda, { EditarDia } from "@/components/admin/agenda/ModalHorario";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const COLOR = { libre: "#12A46B", reservada: T.primary, evento: "#E8853B" };

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const deIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const sumar = (s, n) => { const d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };
const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const fechaLarga = (s) => { const t = deIso(s).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }); return t[0].toUpperCase() + t.slice(1); };
/** "9:00" y "a. m." por separado, para la hora grande de la agenda. */
const partes = (t) => { const x = hora12(t); const i = x.search(/\s[ap]\./); return i < 0 ? { hm: x, suf: "" } : { hm: x.slice(0, i), suf: x.slice(i + 1) }; };
const hora12 = (t) => { const [h, m] = t.split(":").map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }); };
const aMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const deMin = (n) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;


const campo = { width: "100%", height: 40, border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: "#fff", outline: "none", fontFamily: T.font, boxSizing: "border-box", padding: "0 12px" };
const Etiqueta = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: T.textSoft, margin: "12px 0 5px", textTransform: "uppercase" }}>{children}</div>;

function Modal({ titulo, subtitulo, onCerrar, children, pie, ancho = 460 }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(58,37,48,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: ancho, maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 22, fontFamily: T.font, color: T.text, boxShadow: "0 20px 50px rgba(58,37,48,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{titulo}</div>
            {subtitulo && <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 2 }}>{subtitulo}</div>}
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ border: "none", background: T.lilac, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={15} /></button>
        </div>
        {children}
        {pie && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>{pie}</div>}
      </div>
    </div>
  );
}

const Boton = ({ children, onClick, disabled, tipo = "primario" }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ border: tipo === "secundario" ? `1.5px solid ${T.border}` : "none", borderRadius: 10, padding: "10px 16px", fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: disabled ? "default" : "pointer",
             background: tipo === "secundario" ? "#fff" : tipo === "peligro" ? T.danger : T.primary, color: tipo === "secundario" ? T.ink : "#fff", opacity: disabled ? .55 : 1 }}>
    {children}
  </button>
);

function ModalReserva({ cupo, franja, onCerrar, onCancelada }) {
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const cancelarla = async () => {
    setOcupado(true); setError(null);
    const res = await fetch(`/api/admin/agenda/reservas/${cupo.reunion_id}/cancelar`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo cancelar.");
    onCancelada("Reserva cancelada · le avisamos a la candidata");
  };
  return (
    <Modal titulo={cupo.candidata} subtitulo={`${fechaLarga(franja.fecha)} · ${hora12(cupo.hora_inicio)} – ${hora12(cupo.hora_fin)}`} onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cerrar</Boton><Boton tipo="peligro" onClick={cancelarla} disabled={ocupado}>{ocupado ? "Cancelando…" : "Cancelar reserva"}</Boton></>}>
      <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
        <div><b>Correo:</b> {cupo.candidata_email}</div>
        <div><b>Atiende:</b> {franja.dueno_nombre}</div>
        {franja.url_meet && <div><b>Enlace:</b> <a href={franja.url_meet} target="_blank" rel="noreferrer" style={{ color: T.primary }}>{franja.url_meet}</a></div>}
        {cupo.notas_cliente && <div style={{ marginTop: 8, background: T.softFill, borderRadius: 10, padding: 10 }}><b>Lo que quiere resolver:</b> {cupo.notas_cliente}</div>}
      </div>
      <p style={{ fontSize: 12, color: T.textSoft, margin: "12px 0 0" }}>Si la cancelas, el horario vuelve a quedar libre y ella recibe un correo para elegir otro.</p>
      {error && <p role="alert" style={{ fontSize: 12.5, color: T.danger, fontWeight: 600, margin: "10px 0 0" }}>{error}</p>}
    </Modal>
  );
}

/** El equipo agenda a una candidata en un cupo libre, desde su panel. */
function ModalAgendar({ cupo, franja, onCerrar, onAgendado }) {
  const [candidatas, setCandidatas] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [elegida, setElegida] = useState(null);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    fetch("/api/admin/usuarias").then((r) => r.json())
      .then((d) => setCandidatas((d.usuarias || []).filter((u) => (u.rol === "usuaria" || u.rol === "usuario") && Number(u.cuenta_activa) !== 0)))
      .catch(() => setCandidatas([]));
  }, []);
  const q = buscar.trim().toLowerCase();
  const visibles = (candidatas || []).filter((u) => !q || `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q)).slice(0, 8);
  const agendar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch("/api/admin/agenda/reservas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cupo_id: cupo.id, usuario_id: elegida.id, notas }) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo agendar.");
    onAgendado(`Reunión agendada con ${elegida.nombre} · le llega la confirmación al correo`);
  };
  return (
    <Modal titulo="Agendar a una candidata" subtitulo={`${fechaLarga(franja.fecha)} · ${hora12(cupo.hora_inicio)} – ${hora12(cupo.hora_fin)} · con ${franja.dueno_nombre}`} onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton onClick={agendar} disabled={ocupado || !elegida}>{ocupado ? "Agendando…" : "Agendar"}</Boton></>}>
      {!elegida ? (
        <>
          <Etiqueta>Candidata</Etiqueta>
          <input autoFocus value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por nombre o correo…" style={campo} />
          <div style={{ display: "grid", gap: 2, marginTop: 6, maxHeight: 260, overflowY: "auto" }}>
            {candidatas === null && <div style={{ fontSize: 12.5, color: T.textSoft, padding: 8 }}>Cargando…</div>}
            {candidatas && !visibles.length && <div style={{ fontSize: 12.5, color: T.textSoft, padding: 8 }}>Ninguna candidata coincide.</div>}
            {visibles.map((u) => (
              <button key={u.id} type="button" onClick={() => setElegida(u)} style={{ textAlign: "left", border: "none", background: "transparent", borderRadius: 10, padding: "8px 10px", cursor: "pointer", fontFamily: T.font }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{u.nombre} {u.apellido}</div>
                <div style={{ fontSize: 12, color: T.textSoft }}>{u.email}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.softFill, borderRadius: 12, padding: "10px 12px", marginTop: 10 }}>
            <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{elegida.nombre} {elegida.apellido}</div><div style={{ fontSize: 12, color: T.textSoft }}>{elegida.email}</div></div>
            <button type="button" onClick={() => setElegida(null)} style={{ border: "none", background: "transparent", color: T.primary, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: T.font }}>Cambiar</button>
          </div>
          <Etiqueta>Tema de la reunión (opcional)</Etiqueta>
          <input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej.: revisar sus documentos" style={campo} />
        </>
      )}
      {error && <p role="alert" style={{ fontSize: 12.5, color: T.danger, fontWeight: 600, margin: "12px 0 0" }}>{error}</p>}
    </Modal>
  );
}

export default function AgendaAdminPage() {
  const { isMobile } = useMobile();
  const hoy = hoyBogota();
  const [mes, setMes] = useState(hoy.slice(0, 7));
  // El día que se ve: hoy por omisión; se cambia tocando el calendario.
  const [seleccion, setSeleccion] = useState(hoy);
  const [horarios, setHorarios] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [datos, setDatos] = useState({}); // mes → { franjas, eventos }
  const [equipo, setEquipo] = useState([]);
  const [yo, setYo] = useState(null);
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState(null);
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3200); };

  const cargarMes = async (m) => {
    const [a, e] = await Promise.all([
      fetch(`/api/admin/agenda?mes=${m}`).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/admin/eventos?mes=${m}`).then((r) => r.json()).catch(() => ({})),
    ]);
    if (a.equipo) setEquipo(a.equipo);
    if (a.horarios) setHorarios(a.horarios);
    if (a.excepciones) setExcepciones((x) => [...x.filter((e) => !e.fecha.startsWith(m)), ...a.excepciones]);
    const eventos = (e.eventos || []).map((x) => ({ ...x, fecha: String(x.fecha).slice(0, 10), hora_inicio: x.hora_inicio?.slice(0, 5) || "", hora_fin: x.hora_fin?.slice(0, 5) || "" }));
    setDatos((d) => ({ ...d, [m]: { franjas: a.franjas || [], eventos } }));
  };

  // El rango elegido puede cruzar dos meses: se cargan los que toca.
  const rango = useMemo(() => ({ desde: seleccion, hasta: sumar(seleccion, 1) }), [seleccion]);
  const mesesNecesarios = useMemo(() => [...new Set([mes, rango.desde.slice(0, 7), sumar(rango.hasta, -1).slice(0, 7)])], [mes, rango]);
  const recargar = () => mesesNecesarios.forEach(cargarMes);

  useEffect(() => { mesesNecesarios.filter((m) => !datos[m]).forEach(cargarMes); }, [mesesNecesarios]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setYo(d.user?.id ?? null)).catch(() => {}); }, []);

  const todo = useMemo(() => {
    const franjas = [], eventos = [];
    Object.values(datos).forEach((d) => { franjas.push(...d.franjas); eventos.push(...d.eventos); });
    return { franjas, eventos };
  }, [datos]);

  // Puntos del calendario por día.
  const puntos = useMemo(() => {
    const p = {};
    todo.franjas.forEach((f) => {
      const x = (p[f.fecha] ||= {});
      if (f.cupos.some((c) => c.estado === "disponible")) x.libre = true;
      if (f.cupos.some((c) => c.estado === "reservada")) x.reservada = true;
    });
    todo.eventos.forEach((e) => { (p[e.fecha] ||= {}).evento = true; });
    return p;
  }, [todo]);

  // La agenda del rango, por día.
  const dias = useMemo(() => {
    const out = [];
    for (let f = rango.desde; f < rango.hasta; f = sumar(f, 1)) {
      const franjas = todo.franjas.filter((x) => x.fecha === f);
      const eventos = todo.eventos.filter((x) => x.fecha === f);
      out.push({ fecha: f, franjas, eventos });
    }
    return out;
  }, [todo, rango, seleccion]);

  const [y, m] = mes.split("-").map(Number);
  const celdas = useMemo(() => {
    const primero = new Date(y, m - 1, 1);
    const vacias = (primero.getDay() + 6) % 7;
    const total = new Date(y, m, 0).getDate();
    return [...Array(vacias).fill(null), ...Array.from({ length: total }, (_, i) => `${mes}-${pad(i + 1)}`)];
  }, [mes, y, m]);
  const moverMes = (n) => { const d = new Date(y, m - 1 + n, 1); setMes(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };

  // ¿El día visto está ajustado a mano para quien abre la agenda (o cualquiera del equipo)?
  const ajustado = excepciones.some((e) => e.fecha === seleccion && (!yo || Number(e.dueno_id) === Number(yo)));
  const delMes = datos[mes]?.franjas || [];
  const libres = delMes.reduce((s, f) => s + f.cupos.filter((c) => c.estado === "disponible").length, 0);
  const reservadas = delMes.reduce((s, f) => s + f.cupos.filter((c) => c.estado === "reservada").length, 0);


  const borrarEvento = async (ev) => {
    const res = await fetch(`/api/admin/eventos?id=${ev.id}`, { method: "DELETE" });
    if (!res.ok) return decir("No se pudo borrar el evento.", "error");
    setModal(null); decir("Evento borrado"); recargar();
  };
  const guardarEvento = async (form) => {
    const editando = modal?.evento;
    const res = await fetch("/api/admin/eventos", { method: editando ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editando ? { ...form, id: editando.id } : form) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return decir(d.error || "No se pudo guardar el evento.", "error");
    setModal(null); decir(editando ? "Evento actualizado" : "Evento creado"); recargar();
  };
  const listo = (msg) => { setModal(null); decir(msg); recargar(); };


  const Item = ({ ini, fin, color, etiqueta, titulo, onClick, apagado }) => (
    <button type="button" onClick={onClick} disabled={!onClick}
      style={{ display: "flex", gap: 14, alignItems: "stretch", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "8px 6px", borderRadius: 10, cursor: onClick ? "pointer" : "default", fontFamily: T.font, opacity: apagado ? .55 : 1 }}>
      <div style={{ width: 74, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          {/^\d{2}:\d{2}$/.test(ini) ? <>{partes(ini).hm}<span style={{ fontSize: 10.5, fontWeight: 700, color: T.textSoft, marginLeft: 3 }}>{partes(ini).suf}</span></> : ini}
        </div>
        <div style={{ fontSize: 11.5, color: T.textSoft, marginTop: 2 }}>{fin}</div>
      </div>
      <div style={{ width: 3, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.textSoft, fontWeight: 600 }}>{etiqueta}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titulo}</div>
      </div>
    </button>
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", maxWidth: 1180, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
      {aviso && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: aviso.tipo === "error" ? T.danger : T.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600, maxWidth: 380 }}>{aviso.msg}</div>}

      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Agenda</div>
          <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>Tu horario semanal abre los cupos solo; las candidatas los reservan para resolver sus dudas.</div>
        </div>
        <button type="button" onClick={() => setModal({ tipo: "administrar" })}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: T.primary, color: "#fff", borderRadius: 12, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
          <Settings2 size={16} /> Administrar agenda
        </button>
      </div>

      {/* En computador el alto lo da el mes: el día se desplaza por dentro, sin alargar la caja. */}
      <div style={{ display: "flex", gap: 0, flexDirection: isMobile ? "column" : "row", background: "#fff", borderRadius: 22, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: "0 6px 24px rgba(58,37,48,.06)" }}>
        {/* ── Mes compacto ── */}
        <div style={{ width: isMobile ? "100%" : 360, flexShrink: 0, padding: 22, background: T.softFill, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff", textAlign: "center", boxShadow: "0 1px 3px rgba(58,37,48,.08)", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.textSoft, textTransform: "uppercase", paddingTop: 4 }}>{MESES[Number(hoy.slice(5, 7)) - 1].slice(0, 3)}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.primary, lineHeight: 1 }}>{Number(hoy.slice(8))}</div>
            </div>
            <div style={{ flex: 1, fontSize: 19, fontWeight: 800, color: T.ink }}>{MESES[m - 1]} {y}</div>
            <button type="button" onClick={() => moverMes(-1)} aria-label="Mes anterior" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.ink }}><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => moverMes(1)} aria-label="Mes siguiente" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.ink }}><ChevronRight size={20} /></button>
          </div>


          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: 16, rowGap: 4 }}>
            {DIAS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.textSoft, fontWeight: 600, paddingBottom: 6 }}>{d}</div>)}
            {celdas.map((f, i) => {
              if (!f) return <div key={`v${i}`} />;
              const p = puntos[f] || {};
              const elegido = f === seleccion;
              const esHoy = f === hoy, pasado = f < hoy;
              return (
                <button key={f} type="button" onClick={() => setSeleccion(f)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: "3px 0", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: T.font }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                                 background: elegido ? T.primary : esHoy ? "#E8853B" : "transparent",
                                 color: elegido || esHoy ? "#fff" : pasado ? T.softText : T.ink }}>
                    {Number(f.slice(8))}
                  </span>
                  <span style={{ display: "flex", gap: 2, height: 5, marginTop: 2 }}>
                    {p.libre && <i style={{ width: 4, height: 4, borderRadius: "50%", background: COLOR.libre }} />}
                    {p.reservada && <i style={{ width: 4, height: 4, borderRadius: "50%", background: COLOR.reservada }} />}
                    {p.evento && <i style={{ width: 4, height: 4, borderRadius: "50%", background: COLOR.evento }} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.textSoft, flexWrap: "wrap" }}>
            <span><b style={{ color: COLOR.libre }}>{libres}</b> libres</span>
            <span><b style={{ color: COLOR.reservada }}>{reservadas}</b> reservadas</span>
            <span><b style={{ color: COLOR.evento }}>{(datos[mes]?.eventos || []).length}</b> eventos</span>
          </div>
        </div>

        {/* ── La agenda ── */}
        <div style={{ flex: 1, minWidth: 0, position: "relative", minHeight: isMobile ? 0 : 420 }}>
        <div style={isMobile ? {} : { position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "22px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
              {fechaLarga(seleccion)}
              {ajustado && <span title="Este día no sigue el horario semanal" style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: "#B4631F", background: "#FFF4EC", padding: "3px 8px", borderRadius: 7, verticalAlign: "middle" }}>Ajustado</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setModal({ tipo: "evento" })} title="Nuevo evento" aria-label="Nuevo evento"
                style={{ height: 34, borderRadius: 99, border: `1.5px solid ${T.border}`, background: "#fff", color: T.ink, padding: "0 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 5 }}>
                <CalendarPlus size={14} /> Evento
              </button>
              <button type="button" onClick={() => setModal({ tipo: "dia" })} disabled={seleccion < hoy} title={seleccion < hoy ? "Ese día ya pasó" : "Editar este día"} aria-label="Editar este día"
                style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: T.primary, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={17} />
              </button>
            </div>
          </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 22px" }}>
          {dias.map((d) => (
            <div key={d.fecha} style={{ marginTop: 16 }}>
              {!d.franjas.length && !d.eventos.length && (
                <div style={{ textAlign: "center", padding: "34px 10px", color: T.textSoft, fontSize: 13 }}>
                  {ajustado ? "Este día está marcado como no disponible." : "Sin horarios este día."}
                  {d.fecha >= hoy && <div><button type="button" onClick={() => setModal({ tipo: "dia" })} style={{ marginTop: 12, border: "none", background: T.lilac, color: T.primary, borderRadius: 10, padding: "9px 14px", fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Agregar horarios este día</button></div>}
                </div>
              )}

              {d.eventos.map((ev) => {
                const cfg = TIPO_CFG[ev.tipo] || TIPO_CFG.otro;
                return <Item key={`e${ev.id}`} ini={ev.hora_inicio || "Todo el día"} fin={ev.hora_fin ? hora12(ev.hora_fin) : ""} color={COLOR.evento}
                  etiqueta={`${cfg.label}${Number(ev.visible) ? "" : " · oculto"}`} titulo={ev.titulo} onClick={() => setModal({ tipo: "evento", evento: ev })} />;
              })}

              {d.franjas.map((f) => (
                <div key={f.id} style={{ marginTop: 6, border: `1px solid ${T.softFill}`, borderRadius: 14, padding: "6px 6px 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "2px 6px 4px" }}>
                    <div style={{ fontSize: 11.5, color: T.textSoft, fontWeight: 600, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span>{hora12(f.hora_inicio)} – {hora12(f.hora_fin)} · {f.cupos.length} de {f.duracion_min} min</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={12} /> {f.dueno_nombre}</span>
                      {f.url_meet && <a href={f.url_meet} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.primary }}><Video size={12} /> Enlace</a>}
                    </div>
                  </div>
                  {f.cupos.map((c) => c.estado === "reservada"
                    ? <Item key={c.id} ini={c.hora_inicio} fin={hora12(c.hora_fin)} color={COLOR.reservada} etiqueta="Reservada" titulo={c.candidata || "Candidata"} onClick={c.reunion_id ? () => setModal({ tipo: "reserva", cupo: c, franja: f }) : null} />
                    : <Item key={c.id} ini={c.hora_inicio} fin={hora12(c.hora_fin)} color={COLOR.libre} etiqueta="Disponible" titulo={`Sesión libre · ${f.duracion_min} min`} onClick={f.fecha >= hoy ? () => setModal({ tipo: "agendar", cupo: c, franja: f }) : null} />)}
                </div>
              ))}
            </div>
          ))}
          </div>
        </div>
        </div>
      </div>

      {modal?.tipo === "administrar" && <AdministrarAgenda equipo={equipo} yo={yo} horarios={horarios} onCerrar={() => setModal(null)} onGuardado={listo} />}
      {modal?.tipo === "dia" && <EditarDia fecha={seleccion} equipo={equipo} yo={yo} horarios={horarios} franjasDelDia={todo.franjas.filter((f) => f.fecha === seleccion)} ajustado={ajustado} onCerrar={() => setModal(null)} onGuardado={listo} />}
      {modal?.tipo === "agendar" && <ModalAgendar cupo={modal.cupo} franja={modal.franja} onCerrar={() => setModal(null)} onAgendado={listo} />}
      {modal?.tipo === "reserva" && <ModalReserva cupo={modal.cupo} franja={modal.franja} onCerrar={() => setModal(null)} onCancelada={listo} />}
      {modal?.tipo === "evento" && (
        <>
          <ModalEvento onClose={() => setModal(null)} onGuardar={guardarEvento} loading={false} editando={modal.evento || null} />
          {modal.evento && (
            <button type="button" onClick={() => borrarEvento(modal.evento)}
              style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1600, border: "none", background: T.danger, color: "#fff", borderRadius: 99, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: T.font, display: "flex", gap: 6, alignItems: "center" }}>
              <Trash2 size={14} /> Borrar este evento
            </button>
          )}
        </>
      )}
    </div>
  );
}
