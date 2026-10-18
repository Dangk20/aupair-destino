"use client";
// app/admin/usuarias/page.jsx — Usuarios: administración de cuentas.
//
// Change `usuarios-administracion` (ítem 8): quién tiene cuenta, con qué rol,
// si está activa y a qué secciones entra. Crear con rol, editar, cambiar rol,
// secciones, restablecer contraseña y desactivar. Nada más.
//
// Lo que había aquí y no era administración de usuarios se fue a su módulo:
// pagos, «Registrar pago» y transferir cupo → Ventas; códigos → Códigos promo;
// progreso del curso y recorrido → Candidatas. «Top referidoras» y «Actividad
// reciente» salían de las tablas heredadas de referidos y se retiraron.
// Las cifras se calculan de la misma lista que pintan las pestañas: cuadran.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Download, Plus, X, Pencil, KeyRound, SlidersHorizontal, UserCog, Power,
  FileText, Calendar, MessageCircle, Users, FolderOpen, User, ExternalLink, Copy, Check,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";

const ROLES = [
  { id: "usuaria",  label: "Candidata", plural: "Candidatas" },
  { id: "asociada", label: "Asociada",  plural: "Asociadas" },
  { id: "agencia",  label: "Agencia",   plural: "Agencias" },
  { id: "admin",    label: "Admin",     plural: "Admins" },
];
const rolLabel = (r) => ROLES.find((x) => x.id === r)?.label || (r === "usuario" ? "Candidata" : r || "—");

// Las secciones que se encienden una a una. El acceso pagado (`tiene_acceso`)
// NO está: se da en Ventas.
const SECCIONES = [
  { key: "perfil_habilitado", label: "Perfil",     Icono: User },
  { key: "acceso_documentos", label: "Documentos", Icono: FileText },
  { key: "acceso_recursos",   label: "Recursos",   Icono: FolderOpen },
  { key: "acceso_reuniones",  label: "Reuniones",  Icono: Calendar },
  { key: "acceso_mensajes",   label: "Mensajes",   Icono: MessageCircle },
  { key: "acceso_comunidad",  label: "Comunidad",  Icono: Users },
];

const activa = (u) => Number(u.cuenta_activa) !== 0;
const nombreDe = (u) => `${u.nombre || ""} ${u.apellido || ""}`.trim() || u.email;
const fecha = (f) => (f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" }) : "—");

/** CSV con BOM: Excel lo abre con las tildes bien. Sólo datos de la cuenta. */
function exportar(filas) {
  const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lineas = [
    ["Nombre", "Apellido", "Correo", "Teléfono", "Rol", "Estado", "Registro"],
    ...filas.map((u) => [u.nombre, u.apellido, u.email, u.telefono, rolLabel(u.rol), activa(u) ? "Activa" : "Desactivada", fecha(u.created_at)]),
  ].map((f) => f.map(celda).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + lineas], { type: "text/csv;charset=utf-8" }));
  Object.assign(document.createElement("a"), { href: url, download: `usuarios-${new Date().toISOString().slice(0, 10)}.csv` }).click();
  URL.revokeObjectURL(url);
}

const campo = { width: "100%", height: 40, border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: "#fff", outline: "none", fontFamily: T.font, boxSizing: "border-box", padding: "0 12px" };

function Modal({ titulo, subtitulo, onCerrar, children, pie }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(58,37,48,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 22, fontFamily: T.font, color: T.text, boxShadow: "0 20px 50px rgba(58,37,48,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{titulo}</div>
            {subtitulo && <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 2 }}>{subtitulo}</div>}
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ border: "none", background: T.lilac, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", color: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        {children}
        {pie && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>{pie}</div>}
      </div>
    </div>
  );
}

const Boton = ({ children, onClick, disabled, tipo = "primario", type = "button" }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    style={{ border: tipo === "secundario" ? `1.5px solid ${T.border}` : "none", borderRadius: 10, padding: "10px 16px", fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: disabled ? "default" : "pointer",
             background: tipo === "secundario" ? "#fff" : tipo === "peligro" ? T.danger : T.primary, color: tipo === "secundario" ? T.ink : "#fff", opacity: disabled ? .55 : 1 }}>
    {children}
  </button>
);

const Etiqueta = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: T.textSoft, margin: "12px 0 5px", textTransform: "uppercase" }}>{children}</div>;
const Error = ({ texto }) => texto ? <p role="alert" style={{ fontSize: 12.5, color: T.danger, fontWeight: 600, margin: "12px 0 0" }}>{texto}</p> : null;

/** Un link que el admin puede copiar si el correo no llega. */
function LinkCopiable({ link, texto }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div style={{ background: T.softFill, borderRadius: 12, padding: 12, fontSize: 12.5, lineHeight: 1.5 }}>
      {texto}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <code style={{ flex: 1, fontSize: 11, wordBreak: "break-all", color: T.ink }}>{link}</code>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopiado(true); } catch { /* sigue visible */ } }}
          style={{ border: `1px solid ${T.border}`, background: "#fff", borderRadius: 8, padding: "5px 9px", fontSize: 11.5, fontWeight: 700, color: T.primary, cursor: "pointer", display: "inline-flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
          {copiado ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
        </button>
      </div>
    </div>
  );
}

function ModalNuevo({ onCerrar, onCreado }) {
  const [f, setF] = useState({ nombre: "", apellido: "", email: "", telefono: "", rol: "usuaria" });
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [link, setLink] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const crear = async () => {
    setOcupado(true); setError(null);
    const res = await fetch("/api/admin/usuarias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo crear la cuenta.");
    setLink(d.link); onCreado();
  };

  if (link) return (
    <Modal titulo="Cuenta creada" subtitulo={`${f.nombre} · ${rolLabel(f.rol)}`} onCerrar={onCerrar} pie={<Boton onClick={onCerrar}>Listo</Boton>}>
      <LinkCopiable link={link} texto={<>Le enviamos a <b>{f.email}</b> un correo para crear su contraseña (vence en 72 horas). Si no le llega, compártele este link:</>} />
    </Modal>
  );

  return (
    <Modal titulo="Nuevo usuario" subtitulo="Recibe un correo para crear su contraseña: tú no la conoces." onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton onClick={crear} disabled={ocupado || !f.nombre.trim() || !f.email.trim()}>{ocupado ? "Creando…" : "Crear cuenta"}</Boton></>}>
      <Etiqueta>Rol</Etiqueta>
      <select value={f.rol} onChange={set("rol")} style={{ ...campo, cursor: "pointer" }}>
        {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Etiqueta>Nombre</Etiqueta><input value={f.nombre} onChange={set("nombre")} style={campo} /></div>
        <div><Etiqueta>Apellido</Etiqueta><input value={f.apellido} onChange={set("apellido")} style={campo} /></div>
      </div>
      <Etiqueta>Correo</Etiqueta><input type="email" value={f.email} onChange={set("email")} style={campo} />
      <Etiqueta>Teléfono (opcional)</Etiqueta><input value={f.telefono} onChange={set("telefono")} inputMode="tel" style={campo} />
      <Error texto={error} />
    </Modal>
  );
}

function ModalEditar({ u, onCerrar, onGuardado }) {
  const [f, setF] = useState({ nombre: u.nombre || "", apellido: u.apellido || "", email: u.email || "", telefono: u.telefono || "" });
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const guardar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch(`/api/admin/usuarias/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo guardar.");
    onGuardado("Datos actualizados");
  };
  return (
    <Modal titulo="Editar datos" subtitulo={nombreDe(u)} onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton onClick={guardar} disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar"}</Boton></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Etiqueta>Nombre</Etiqueta><input value={f.nombre} onChange={set("nombre")} style={campo} /></div>
        <div><Etiqueta>Apellido</Etiqueta><input value={f.apellido} onChange={set("apellido")} style={campo} /></div>
      </div>
      <Etiqueta>Correo</Etiqueta><input type="email" value={f.email} onChange={set("email")} style={campo} />
      <Etiqueta>Teléfono</Etiqueta><input value={f.telefono} onChange={set("telefono")} inputMode="tel" style={campo} />
      {u.rol === "usuaria" && <p style={{ fontSize: 12, color: T.textSoft, margin: "12px 0 0" }}>Su perfil de candidata (formulario, documentos) se revisa en su ficha de Candidatas.</p>}
      <Error texto={error} />
    </Modal>
  );
}

function ModalRol({ u, onCerrar, onGuardado }) {
  const [rol, setRol] = useState(u.rol === "usuario" ? "usuaria" : u.rol);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const guardar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch(`/api/admin/usuarios/${u.id}/cambiar-rol`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nuevoRol: rol }) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo cambiar el rol.");
    onGuardado(d.mensaje || "Rol actualizado");
  };
  return (
    <Modal titulo="Cambiar rol" subtitulo={nombreDe(u)} onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton onClick={guardar} disabled={ocupado || rol === u.rol}>{ocupado ? "Guardando…" : "Cambiar rol"}</Boton></>}>
      <div style={{ display: "grid", gap: 8 }}>
        {ROLES.map((r) => (
          <label key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${rol === r.id ? T.primary : T.border}`, background: rol === r.id ? T.lilac : "#fff", fontSize: 13.5, fontWeight: 600 }}>
            <input type="radio" name="rol" checked={rol === r.id} onChange={() => setRol(r.id)} style={{ accentColor: T.primary }} /> {r.label}
          </label>
        ))}
      </div>
      <p style={{ fontSize: 12, color: T.textSoft, margin: "12px 0 0", lineHeight: 1.5 }}>El cambio aplica en su próximo inicio de sesión. Una asociada atribuye ventas con un código de Códigos promo.</p>
      <Error texto={error} />
    </Modal>
  );
}

function ModalSecciones({ u, onCerrar, onCambio }) {
  const [estado, setEstado] = useState(() => Object.fromEntries(SECCIONES.map((s) => [s.key, !!Number(u[s.key])])));
  const [error, setError] = useState(null);
  const cambiar = async (key) => {
    const valor = !estado[key];
    setEstado((e) => ({ ...e, [key]: valor })); setError(null);
    const res = await fetch("/api/admin/toggle-acceso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id, seccion: key, valor }) });
    if (!res.ok) { setEstado((e) => ({ ...e, [key]: !valor })); setError("No se pudo actualizar la sección."); }
    else onCambio(u.id, key, valor);
  };
  return (
    <Modal titulo="Secciones" subtitulo={nombreDe(u)} onCerrar={onCerrar} pie={<Boton onClick={onCerrar}>Listo</Boton>}>
      <div style={{ display: "grid", gap: 8 }}>
        {SECCIONES.map(({ key, label, Icono }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, background: estado[key] ? T.softFill : "#fff", border: `1px solid ${T.border}` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600, color: estado[key] ? T.text : T.textSoft }}><Icono size={16} color={estado[key] ? T.primary : T.softText} /> {label}</span>
            <button type="button" role="switch" aria-checked={estado[key]} aria-label={label} onClick={() => cambiar(key)}
              style={{ width: 38, height: 22, borderRadius: 99, border: "none", cursor: "pointer", background: estado[key] ? T.primary : "#e0d0d8", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 3, left: estado[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
            </button>
          </div>
        ))}
      </div>
      {u.rol === "usuaria" && (
        <p style={{ fontSize: 12, color: T.textSoft, margin: "12px 0 0", lineHeight: 1.5 }}>
          El acceso pagado al programa no se enciende aquí: se da en <Link href="/admin/ventas" style={{ color: T.primary, fontWeight: 700 }}>Ventas</Link> al confirmar o registrar su pago. Ahora: <b>{Number(u.tiene_acceso) ? "con acceso pagado" : "sin acceso pagado"}</b>.
        </p>
      )}
      <Error texto={error} />
    </Modal>
  );
}

function ModalRestablecer({ u, onCerrar }) {
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const enviar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch(`/api/admin/usuarias/${u.id}/restablecer`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo enviar.");
    setLink(d.link);
  };
  return (
    <Modal titulo="Restablecer contraseña" subtitulo={nombreDe(u)} onCerrar={onCerrar}
      pie={link ? <Boton onClick={onCerrar}>Listo</Boton> : <><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton onClick={enviar} disabled={ocupado}>{ocupado ? "Enviando…" : "Enviar correo"}</Boton></>}>
      {link
        ? <LinkCopiable link={link} texto={<>Le enviamos a <b>{u.email}</b> el correo para crear una contraseña nueva (vence en 1 hora). Si no le llega, compártele este link:</>} />
        : <p style={{ fontSize: 13, color: T.textSoft, margin: 0, lineHeight: 1.5 }}>Le llega a <b>{u.email}</b> un correo para crear una contraseña nueva. La actual sigue sirviendo hasta que la cambie.</p>}
      <Error texto={error} />
    </Modal>
  );
}

function ModalEstado({ u, onCerrar, onGuardado }) {
  const desactivar = activa(u);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const guardar = async () => {
    setOcupado(true); setError(null);
    const res = await fetch(`/api/admin/usuarias/${u.id}/estado`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activa: !desactivar }) });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) return setError(d.error || "No se pudo cambiar el estado.");
    onGuardado(desactivar ? "Cuenta desactivada" : "Cuenta reactivada");
  };
  return (
    <Modal titulo={desactivar ? "Desactivar cuenta" : "Reactivar cuenta"} subtitulo={nombreDe(u)} onCerrar={onCerrar}
      pie={<><Boton tipo="secundario" onClick={onCerrar}>Cancelar</Boton><Boton tipo={desactivar ? "peligro" : "primario"} onClick={guardar} disabled={ocupado}>{ocupado ? "Guardando…" : desactivar ? "Desactivar" : "Reactivar"}</Boton></>}>
      <p style={{ fontSize: 13, color: T.textSoft, margin: 0, lineHeight: 1.55 }}>
        {desactivar
          ? "No podrá iniciar sesión y, si tiene el panel abierto, sale en su siguiente carga. Sus datos, pagos e historial se conservan y puedes reactivarla cuando quieras."
          : "Vuelve a poder iniciar sesión con su contraseña de siempre."}
      </p>
      <Error texto={error} />
    </Modal>
  );
}

const PILDORA_ROL = {
  usuaria: { bg: T.lilac, color: T.primary },
  asociada: { bg: "#FFF4EC", color: "#B4631F" },
  agencia: { bg: "#EAF1FB", color: "#2F5E9C" },
  admin: { bg: "#F1EEF6", color: "#5B4A7A" },
};

export default function UsuariosPage() {
  const { isMobile } = useMobile();
  const [usuarios, setUsuarios] = useState(null);
  const [yo, setYo] = useState(null);
  const [pestana, setPestana] = useState("todos");
  const [buscar, setBuscar] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState(null); // { tipo, u }
  const [aviso, setAviso] = useState(null);
  const POR_PAGINA = 12;

  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };
  const cargar = () => fetch("/api/admin/usuarias").then((r) => r.json())
    .then((d) => setUsuarios(d.usuarias || [])).catch(() => { setUsuarios([]); decir("No se pudieron cargar los usuarios", "error"); });

  useEffect(() => {
    cargar();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setYo(d.user?.id ?? null)).catch(() => {});
  }, []);

  // Cifras y pestañas salen de la MISMA lista: cuadran por construcción.
  const pestanas = useMemo(() => {
    const us = usuarios || [];
    const porRol = (id) => us.filter((u) => (u.rol === "usuario" ? "usuaria" : u.rol) === id);
    return [
      { id: "todos", label: "Todos", filas: us },
      ...ROLES.map((r) => ({ id: r.id, label: r.plural, filas: porRol(r.id) })),
      { id: "desactivadas", label: "Desactivadas", filas: us.filter((u) => !activa(u)) },
    ];
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    const base = pestanas.find((p) => p.id === pestana)?.filas || [];
    return base.filter((u) => !q || `${u.nombre || ""} ${u.apellido || ""} ${u.email || ""} ${u.telefono || ""}`.toLowerCase().includes(q));
  }, [pestanas, pestana, buscar]);

  useEffect(() => { setPagina(1); }, [pestana, buscar]);
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const cerrarYRecargar = (msg) => { setModal(null); if (msg) decir(msg); cargar(); };
  const abrir = (tipo, u) => setModal({ tipo, u });

  const acciones = (u) => {
    const soyYo = yo != null && Number(u.id) === Number(yo);
    const lista = [
      { tipo: "editar", Icono: Pencil, titulo: "Editar datos" },
      { tipo: "secciones", Icono: SlidersHorizontal, titulo: "Secciones" },
      { tipo: "rol", Icono: UserCog, titulo: soyYo ? "No puedes cambiar tu propio rol" : "Cambiar rol", off: soyYo },
      { tipo: "restablecer", Icono: KeyRound, titulo: "Restablecer contraseña" },
      { tipo: "estado", Icono: Power, titulo: soyYo ? "No puedes desactivar tu propia cuenta" : activa(u) ? "Desactivar cuenta" : "Reactivar cuenta", off: soyYo, peligro: activa(u) },
    ];
    return (
      <div style={{ display: "flex", gap: 6, justifyContent: isMobile ? "flex-start" : "flex-end", flexWrap: "wrap" }}>
        {u.rol === "usuaria" && (
          <Link href={`/admin/perfiles/${u.id}`} title="Ver su ficha de candidata" aria-label="Ver su ficha de candidata"
            style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSoft, background: "#fff" }}>
            <ExternalLink size={14} />
          </Link>
        )}
        {lista.map(({ tipo, Icono, titulo, off, peligro }) => (
          <button key={tipo} type="button" title={titulo} aria-label={titulo} disabled={off} onClick={() => abrir(tipo, u)}
            style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: off ? "not-allowed" : "pointer",
                     background: "#fff", color: peligro ? T.danger : T.primary, opacity: off ? .35 : 1 }}>
            <Icono size={14} />
          </button>
        ))}
      </div>
    );
  };

  const PildoraRol = ({ rol }) => {
    const c = PILDORA_ROL[rol === "usuario" ? "usuaria" : rol] || PILDORA_ROL.usuaria;
    return <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>{rolLabel(rol)}</span>;
  };
  const PildoraEstado = ({ u }) => activa(u)
    ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#E6F9F0", color: "#12805A" }}>Activa</span>
    : <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#F4F2EF", color: T.neutral }}>Desactivada</span>;
  const Avatar = ({ u }) => u.foto_url
    ? <img src={u.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    : <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{(u.nombre || u.email || "?")[0].toUpperCase()}</div>;

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
      {aviso && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: aviso.tipo === "error" ? T.danger : T.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{aviso.msg}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Usuarios</div>
          <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>Las cuentas de la plataforma: quién entra, con qué rol y a qué secciones.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => exportar(filtrados)} disabled={!filtrados.length}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: "#fff", color: T.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
            <Download size={14} /> Exportar
          </button>
          <button type="button" onClick={() => abrir("nuevo", null)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none", background: T.primary, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
            <Plus size={14} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Pestañas = cifras: el número de cada una es exactamente lo que muestra. */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {pestanas.map((p) => (
          <button key={p.id} type="button" onClick={() => setPestana(p.id)} aria-pressed={pestana === p.id}
            style={{ flexShrink: 0, minWidth: isMobile ? 96 : 120, textAlign: "left", padding: "10px 14px", borderRadius: 14, cursor: "pointer", fontFamily: T.font,
                     border: `1.5px solid ${pestana === p.id ? T.primary : T.border}`, background: pestana === p.id ? T.lilac : "#fff" }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: pestana === p.id ? T.primary : T.textSoft }}>{p.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginTop: 2 }}>{usuarios ? p.filas.length : "—"}</div>
          </button>
        ))}
      </div>

      <div style={{ position: "relative", maxWidth: 440 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.softText }} />
        <input type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por nombre, correo o teléfono…" aria-label="Buscar usuarios"
          style={{ ...campo, paddingLeft: 34 }} />
      </div>

      {usuarios === null ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : !filtrados.length ? <div style={{ background: "#fff", borderRadius: 16, padding: 30, textAlign: "center", fontSize: 13, color: T.textSoft }}>No hay usuarios que coincidan.</div>
        : isMobile ? (
          <div style={{ display: "grid", gap: 10 }}>
            {visibles.map((u) => (
              <div key={u.id} style={{ background: "#fff", borderRadius: 16, padding: 14, border: `1px solid ${T.border}`, opacity: activa(u) ? 1 : .7 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar u={u} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombreDe(u)}</div>
                    <div style={{ fontSize: 12, color: T.textSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, margin: "10px 0" }}><PildoraRol rol={u.rol} /><PildoraEstado u={u} /></div>
                {acciones(u)}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.softFill, textAlign: "left", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: T.textSoft }}>
                  <th style={{ padding: "11px 16px" }}>Usuario</th>
                  <th style={{ padding: "11px 12px" }}>Teléfono</th>
                  <th style={{ padding: "11px 12px" }}>Rol</th>
                  <th style={{ padding: "11px 12px" }}>Estado</th>
                  <th style={{ padding: "11px 12px" }}>Registro</th>
                  <th style={{ padding: "11px 16px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id} style={{ borderTop: `1px solid ${T.softFill}`, opacity: activa(u) ? 1 : .65 }}>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <Avatar u={u} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{nombreDe(u)}{yo != null && Number(u.id) === Number(yo) && <span style={{ fontSize: 11, color: T.textSoft, fontWeight: 600 }}> · tú</span>}</div>
                          <div style={{ fontSize: 12, color: T.textSoft }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 12px", color: u.telefono ? T.text : T.softText }}>{u.telefono || "—"}</td>
                    <td style={{ padding: "11px 12px" }}><PildoraRol rol={u.rol} /></td>
                    <td style={{ padding: "11px 12px" }}><PildoraEstado u={u} /></td>
                    <td style={{ padding: "11px 12px", color: T.textSoft, whiteSpace: "nowrap" }}>{fecha(u.created_at)}</td>
                    <td style={{ padding: "11px 16px" }}>{acciones(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {paginas > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: T.textSoft }}>
          <span>{(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => setPagina(n)} aria-current={pagina === n ? "page" : undefined}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${pagina === n ? T.primary : T.border}`, background: pagina === n ? T.primary : "#fff", color: pagina === n ? "#fff" : T.ink, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {modal?.tipo === "nuevo" && <ModalNuevo onCerrar={() => setModal(null)} onCreado={cargar} />}
      {modal?.tipo === "editar" && <ModalEditar u={modal.u} onCerrar={() => setModal(null)} onGuardado={cerrarYRecargar} />}
      {modal?.tipo === "rol" && <ModalRol u={modal.u} onCerrar={() => setModal(null)} onGuardado={cerrarYRecargar} />}
      {modal?.tipo === "secciones" && <ModalSecciones u={modal.u} onCerrar={() => setModal(null)}
        onCambio={(id, key, valor) => setUsuarios((us) => us.map((x) => (x.id === id ? { ...x, [key]: valor ? 1 : 0 } : x)))} />}
      {modal?.tipo === "restablecer" && <ModalRestablecer u={modal.u} onCerrar={() => setModal(null)} />}
      {modal?.tipo === "estado" && <ModalEstado u={modal.u} onCerrar={() => setModal(null)} onGuardado={cerrarYRecargar} />}
    </div>
  );
}
