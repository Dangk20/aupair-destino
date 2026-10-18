"use client";
// ════════════════════════════════════════════════════════════════════════
// components/panel/TableroEtapas.jsx — Las candidatas, cada una en su etapa
//
// Una columna por etapa del recorrido (lib/etapas-candidata.js) y las salidas
// aparte. Lo usa el admin y lo usará la agencia: lo que cambia es qué columnas
// se pueden mover (`movibles`) y qué hace mover (`onMover`), nunca el tablero.
//
// Dos vistas de las mismas candidatas: «Tablero» (columnas) y «Lista»
// (filas ordenadas por etapa). La elegida se recuerda en el navegador.
//
// Tocar una tarjeta (o la burbuja de la fila, en la lista) abre la vista rápida: el chat con
// la candidata y sus datos generales (components/panel/VistaRapida). El punto
// en el avatar = mensajes sin leer.
//
// Mover: arrastrar la tarjeta (HTML5 nativo, sin librería) o el menú ⋯ de la
// tarjeta o la fila. Sin `onSoltar`, sólo entre etapas de la agencia. Con
// `onSoltar` (el admin, change `tablero-arrastre-total`) toda tarjeta se
// arrastra a toda columna y quien usa el tablero decide qué significa soltar:
// mover, o abrir la decisión que produce una etapa calculada.
//
// `soloLectura` (la asociada, change `candidatas-por-cupon`): sin vista
// rápida, sin ficha y sin contacto; cada candidata lleva el cupón por el que
// llegó. Lo que no se ve tampoco viene de la API.
// ════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Phone, Mail, MoreVertical, LayoutGrid, List, Eye, MessageCircle, ChevronDown, Tag } from "lucide-react";
import { T } from "@/lib/tema";
import { ETAPAS, SALIDAS, etapaPorId, posicion } from "@/lib/etapas-candidata";
import VistaRapida from "@/components/panel/VistaRapida";

const dias = (desde) => {
  if (!desde) return null;
  const d = Math.floor((Date.now() - new Date(desde).getTime()) / 86400000);
  return d <= 0 ? "hoy" : d === 1 ? "1 día" : `${d} días`;
};

/** Un color por etapa, del tema: el punto de la columna y la etiqueta. */
const COLOR = {
  diligenciando: T.softText, revision: T.amber, correcciones: T.danger,
  evaluacion: T.primary3, plan: T.primary, pago: T.green, visa: T.primary2, completada: T.green,
  no_califica: T.danger, no_continua: T.neutral,
};

/** La píldora de la etapa, con su color. */
const Pildora = ({ etapa, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: T.ink, background: T.softFill, padding: "3px 10px", borderRadius: 8 }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLOR[etapa] }} />
    {etapaPorId(etapa)?.label || etapa}
    {children}
  </span>
);

/**
 * El menú para mover a otra etapa. En la tarjeta se abre con ⋯ (`etapa`
 * ausente); en la lista, desde la propia etapa: la píldora es el botón.
 */
function MenuMover({ c, movibles, onMover, style, etapa = false }) {
  // `menu` = dónde abrirlo. Va en posición fija: dentro del carril o de la
  // tabla (que tienen scroll) un menú absoluto queda recortado.
  const [menu, setMenu] = useState(null);
  const caja = useRef(null);
  const abrir = () => {
    if (menu) return setMenu(null);
    const r = caja.current.getBoundingClientRect();
    // Desde la etapa (a la izquierda de la fila) abre hacia la derecha.
    setMenu(etapa ? { top: r.bottom + 4, left: r.left } : { top: r.bottom + 4, right: window.innerWidth - r.right });
  };
  // Se cierra al tocar fuera o al desplazar (quedaría flotando lejos del botón).
  useEffect(() => {
    if (!menu) return;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setMenu(null); };
    const cerrar = () => setMenu(null);
    document.addEventListener("pointerdown", fuera);
    window.addEventListener("scroll", cerrar, true);
    return () => { document.removeEventListener("pointerdown", fuera); window.removeEventListener("scroll", cerrar, true); };
  }, [menu]);

  return (
    <div ref={caja} style={style} onClick={(e) => e.stopPropagation()}>
      {etapa ? (
        <button type="button" onClick={abrir} aria-label={`Etapa de ${c.nombre}: ${etapaPorId(c.etapa)?.label}. Cambiar`} title="Cambiar de etapa"
          style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: T.font,
                   borderRadius: 8, outline: menu ? `2px solid ${T.primary3}` : "none" }}>
          <Pildora etapa={c.etapa}><ChevronDown size={13} style={{ color: T.textSoft, marginLeft: 2 }} /></Pildora>
        </button>
      ) : (
        <button type="button" onClick={abrir} aria-label={`Mover a ${c.nombre} a otra etapa`} title="Mover a otra etapa"
          style={{ width: 24, height: 24, borderRadius: 8, border: "none",
                   background: menu ? T.lilac : "transparent", color: T.textSoft, cursor: "pointer",
                   display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MoreVertical size={16} />
        </button>
      )}
      {menu && (
        <div role="menu" style={{ position: "fixed", top: menu.top, left: menu.left, right: menu.right, zIndex: 50, background: "#fff", borderRadius: 12,
                                  boxShadow: "0 12px 28px rgba(58,37,48,.18)", border: `1px solid ${T.border}`, padding: 6, minWidth: 190 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft, padding: "4px 8px" }}>MOVER A</div>
          {movibles.filter((id) => id !== c.etapa).map((id) => (
            <button key={id} type="button" role="menuitem" onClick={() => { setMenu(null); onMover(c.id, id); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", border: "none", background: "transparent", borderRadius: 8,
                       padding: "7px 8px", fontSize: 12.5, color: T.text, cursor: "pointer", fontFamily: T.font }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.softFill; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLOR[id], flexShrink: 0 }} />
              {etapaPorId(id)?.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const Avatar = ({ c, size = 36 }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <Foto c={c} size={size} />
    {c.no_leidos > 0 && (
      <span title={`${c.no_leidos} sin leer`} aria-label={`${c.no_leidos} mensajes sin leer`}
        style={{ position: "absolute", top: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: T.primary, border: "2px solid #fff" }} />
    )}
  </div>
);
const Foto = ({ c, size }) => c.foto_url
  ? <img src={c.foto_url} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  : <div style={{ width: size, height: size, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.39, flexShrink: 0 }}>
      {(c.nombre || "?").charAt(0).toUpperCase()}
    </div>;

/** Por qué cupón llegó (sólo en el tablero de la asociada). */
const PildoraCupon = ({ c }) => (
  <span title={c.pago ? "Pagó su cupo con tu código" : "Se registró con tu código; todavía no paga"}
    style={{ fontSize: 11, fontWeight: 600, color: c.pago ? T.green : T.neutral, background: c.pago ? T.greenBg : T.neutralBg,
             padding: "3px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
    <Tag size={11} /> {c.pago ? "Pagó" : "Se registró"} con {c.cupon}
  </span>
);

function Tarjeta({ c, movible, arrastrable = movible, movibles, onMover, onAbrir, onArrastrar, soloLectura }) {

  const fila  = { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.neutral, minWidth: 0 };
  const corto = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  const vacio = (t) => <em style={{ color: T.softText, fontStyle: "normal" }}>{t}</em>;

  return (
    <div draggable={arrastrable} {...(!soloLectura && { onClick: () => onAbrir(c), role: "button", tabIndex: 0, "aria-label": `Abrir a ${c.nombre}`,
      onKeyDown: (e) => { if (e.key === "Enter") onAbrir(c); } })}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(c.id)); onArrastrar(c.id); }}
      style={{ position: "relative", background: "#fff", borderRadius: 14, padding: 14, cursor: soloLectura ? "default" : "pointer",
               boxShadow: "0 1px 3px rgba(58,37,48,.06)", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Quién es y desde cuándo está en la etapa */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: movible ? 22 : 0 }}>
        <Avatar c={c} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, ...corto }}>{c.nombre || "Sin nombre"}</div>
          {dias(c.desde) && <div style={{ fontSize: 11, color: T.softText }}>En la etapa: {dias(c.desde)}</div>}
        </div>
      </div>

      <div style={{ height: 1, background: T.softLine }} />

      {/* Cómo contactarla y dónde está */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {!soloLectura && <>
        <div style={fila}>
          <Phone size={13} style={{ flexShrink: 0 }} />
          {c.telefono ? <a href={`tel:${c.telefono}`} draggable={false} onClick={(e) => e.stopPropagation()} style={{ ...corto, color: T.neutral, textDecoration: "none" }}>{c.telefono}</a> : vacio("Sin teléfono")}
        </div>
        <div style={fila}>
          <Mail size={13} style={{ flexShrink: 0 }} />
          {c.email ? <a href={`mailto:${c.email}`} draggable={false} onClick={(e) => e.stopPropagation()} style={{ ...corto, color: T.neutral, textDecoration: "none" }}>{c.email}</a> : vacio("Sin correo")}
        </div>
        </>}
        <div style={fila}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          {c.ciudad ? <span style={corto}>{c.ciudad}</span> : vacio("Sin ciudad")}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span title="Información diligenciada" style={{ fontSize: 11, fontWeight: 600, color: T.primary, background: T.lilac, padding: "3px 10px", borderRadius: 8 }}>{c.score}% diligenciado</span>
        {c.cupon && <PildoraCupon c={c} />}
        {c.agencia && (
          <span style={{ fontSize: 11, fontWeight: 600, color: T.neutral, background: T.neutralBg, padding: "3px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Building2 size={11} /> {c.agencia}
          </span>
        )}
      </div>

      {/* Mover sin arrastrar (en el celular arrastrar no es fiable): un menú
          discreto en la esquina, no un selector permanente en cada tarjeta. */}
      {movible && <MenuMover c={c} movibles={movibles} onMover={onMover} style={{ position: "absolute", top: 12, right: 10 }} />}
    </div>
  );
}

const VISTA_KEY = "dap.tablero.vista";

const icono = { width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.border}`, background: "#fff", color: T.primary,
                display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, textDecoration: "none" };

/** Las mismas candidatas en filas, ordenadas por etapa. */
function Lista({ candidatas, movibles, onMover, onAbrir, hrefFicha, conAgencia, soloLectura }) {
  const filas = [...candidatas].sort((a, b) => {
    const pa = posicion(a.etapa), pb = posicion(b.etapa);
    // Las salidas (posición -1) van al final, como en el tablero.
    return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb) || (a.nombre || "").localeCompare(b.nombre || "");
  });
  const th = { textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft, padding: "10px 12px", whiteSpace: "nowrap" };
  const td = { fontSize: 12.5, color: T.neutral, padding: "10px 12px", borderTop: `1px solid ${T.softLine}`, whiteSpace: "nowrap" };
  const vacio = (t) => <span style={{ color: T.softText }}>{t}</span>;

  if (!filas.length) return <div style={{ fontSize: 13, color: T.textSoft, textAlign: "center", padding: 28 }}>Sin candidatas</div>;
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${T.border}`, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
        <thead>
          <tr>
            <th style={th}>CANDIDATA</th><th style={th}>ETAPA</th><th style={th}>EN LA ETAPA</th>
            {!soloLectura && <><th style={th}>TELÉFONO</th><th style={th}>CORREO</th></>}<th style={th}>CIUDAD</th>
            <th style={th}>DILIGENCIADO</th>{soloLectura && <th style={th}>CUPÓN</th>}{conAgencia && <th style={th}>AGENCIA</th>}{!soloLectura && <th style={th} />}
          </tr>
        </thead>
        <tbody>
          {filas.map((c) => (
            <tr key={c.id}>
              <td style={td}>
                {soloLectura
                  ? <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar c={c} size={30} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{c.nombre || "Sin nombre"}</span>
                    </span>
                  : <button type="button" onClick={() => onAbrir(c)}
                      style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: T.font }}>
                      <Avatar c={c} size={30} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{c.nombre || "Sin nombre"}</span>
                    </button>}
              </td>
              <td style={td}>
                {/* La etapa se cambia desde la etapa. Las que se calculan de los
                    datos (antes de la agencia) quedan fijas. */}
                {movibles.includes(c.etapa)
                  ? <MenuMover c={c} movibles={movibles} onMover={onMover} etapa style={{ position: "relative", display: "inline-block" }} />
                  : <Pildora etapa={c.etapa} />}
              </td>
              <td style={td}>{dias(c.desde) || vacio("—")}</td>
              {!soloLectura && <>
              <td style={td}>{c.telefono ? <a href={`tel:${c.telefono}`} style={{ color: T.neutral, textDecoration: "none" }}>{c.telefono}</a> : vacio("Sin teléfono")}</td>
              <td style={td}>{c.email ? <a href={`mailto:${c.email}`} style={{ color: T.neutral, textDecoration: "none" }}>{c.email}</a> : vacio("Sin correo")}</td>
              </>}
              <td style={td}>{c.ciudad || vacio("Sin ciudad")}</td>
              <td style={td}><span style={{ fontSize: 11, fontWeight: 600, color: T.primary, background: T.lilac, padding: "3px 10px", borderRadius: 8 }}>{c.score}%</span></td>
              {soloLectura && <td style={td}>{c.cupon ? <PildoraCupon c={c} /> : vacio("—")}</td>}
              {conAgencia && <td style={td}>{c.agencia || vacio("Sin agencia")}</td>}
              {!soloLectura && <td style={{ ...td, width: 80 }}>
                {/* Dos accesos: el perfil completo y el chat (vista rápida). */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                  <Link href={hrefFicha(c.id)} title="Ver perfil" aria-label={`Ver el perfil de ${c.nombre}`} style={icono}>
                    <Eye size={16} />
                  </Link>
                  <button type="button" onClick={() => onAbrir(c)} title="Chatear" aria-label={`Chatear con ${c.nombre}`} style={{ ...icono, position: "relative" }}>
                    <MessageCircle size={16} />
                    {c.no_leidos > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: T.primary, border: "1.5px solid #fff" }} />}
                  </button>
                </div>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TableroEtapas({ candidatas = [], movibles = [], onMover, onSoltar = null, hrefFicha, columnas = null, soloLectura = false }) {
  const [vista, setVista] = useState("tablero");
  const [abierta, setAbierta] = useState(null);
  // Lo que se abrió en esta visita ya no tiene punto (el servidor ya lo marcó leído).
  const [vistas, setVistas] = useState(() => new Set());
  const conPunto = (c) => (vistas.has(c.id) ? { ...c, no_leidos: 0 } : c);
  const [arrastrando, setArrastrando] = useState(null);
  const [encima, setEncima] = useState(null);
  const carril = useRef(null);
  // La agencia sólo ve las suyas: la agencia de cada candidata sobra.
  const conAgencia = !columnas;

  useEffect(() => {
    try { const v = localStorage.getItem(VISTA_KEY); if (v === "lista" || v === "tablero") setVista(v); } catch (_) {}
  }, []);
  const elegir = (v) => { setVista(v); try { localStorage.setItem(VISTA_KEY, v); } catch (_) {} };

  // Arrastrando cerca de un borde, el tablero se desplaza solo: las columnas
  // no caben en pantalla y sin esto no se podría soltar en una que no se ve.
  const desplazarSiBorde = (ev) => {
    const el = carril.current;
    if (!el || arrastrando == null) return;
    const { left, right } = el.getBoundingClientRect();
    if (ev.clientX > right - 70) el.scrollBy({ left: 24 });
    else if (ev.clientX < left + 70) el.scrollBy({ left: -24 });
  };
  const lista = columnas ? ETAPAS.filter((e) => columnas.includes(e.id)) : ETAPAS;
  // Las salidas no son parte del camino: van al final de la fila, en gris.
  const salidas = SALIDAS.filter((s) => !columnas || columnas.includes(s.id));

  const soltar = (etapa) => {
    const c = candidatas.find((x) => x.id === arrastrando);
    setEncima(null); setArrastrando(null);
    if (!c || c.etapa === etapa) return;
    if (onSoltar) onSoltar(c, etapa);
    else if (movibles.includes(c.etapa) && movibles.includes(etapa)) onMover(c.id, etapa);
  };

  const columna = (e, salida = false) => {
    const tarjetas = candidatas.filter((c) => c.etapa === e.id);
    const recibe = arrastrando != null && (onSoltar ? true : movibles.includes(e.id));
    return (
      <div key={e.id}
        onDragOver={(ev) => { if (recibe) { ev.preventDefault(); setEncima(e.id); } }}
        onDragLeave={() => setEncima(null)}
        onDrop={(ev) => { ev.preventDefault(); soltar(e.id); }}
        style={{ width: 260, flexShrink: 0, borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", gap: 10,
                 background: encima === e.id ? T.lilac : salida ? T.neutralBg : "transparent",
                 outline: encima === e.id ? `2px dashed ${T.primary}` : "none", transition: "background .15s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px 2px" }}>
          <div title={e.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: T.ink, minWidth: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: COLOR[e.id], flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.neutral, background: "#fff", border: `1px solid ${T.border}`, padding: "2px 9px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, marginLeft: 8 }}>
            {tarjetas.length} {tarjetas.length === 1 ? "candidata" : "candidatas"}
          </span>
        </div>
        {tarjetas.map((c) => (
          <Tarjeta key={c.id} c={conPunto(conAgencia ? c : { ...c, agencia: null })} movible={movibles.includes(c.etapa)} arrastrable={onSoltar ? !soloLectura : movibles.includes(c.etapa)} movibles={movibles}
            onMover={onMover} onAbrir={setAbierta} onArrastrar={setArrastrando} soloLectura={soloLectura} />
        ))}
        {!tarjetas.length && <div style={{ fontSize: 11.5, color: T.softText, textAlign: "center", padding: "18px 0", border: `1.5px dashed ${T.border}`, borderRadius: 14 }}>Sin candidatas</div>}
      </div>
    );
  };

  const boton = (v, Icono, texto) => (
    <button type="button" onClick={() => elegir(v)} aria-pressed={vista === v}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer",
               fontFamily: T.font, fontSize: 12.5, fontWeight: 600,
               background: vista === v ? "#fff" : "transparent", color: vista === v ? T.primary : T.textSoft,
               boxShadow: vista === v ? "0 1px 3px rgba(58,37,48,.1)" : "none" }}>
      <Icono size={14} /> {texto}
    </button>
  );

  return (
    <div style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "inline-flex", alignSelf: "flex-start", gap: 2, padding: 3, borderRadius: 10, background: T.softFill, border: `1px solid ${T.border}` }}>
        {boton("tablero", LayoutGrid, "Tablero")}
        {boton("lista", List, "Lista")}
      </div>
      {vista === "lista"
        ? <Lista candidatas={candidatas.map(conPunto)} movibles={movibles} onMover={onMover} onAbrir={setAbierta} hrefFicha={hrefFicha} conAgencia={conAgencia} soloLectura={soloLectura} />
        : <div ref={carril} onDragOver={desplazarSiBorde} onDragEnd={() => { setArrastrando(null); setEncima(null); }}
            style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, alignItems: "flex-start" }}>
            {lista.map((e) => columna(e))}
            {salidas.map((s) => columna(s, true))}
          </div>}
      {abierta && !soloLectura && (
        <VistaRapida candidata={(({ agencia, ...x }) => (conAgencia ? { ...x, agencia } : x))(candidatas.find((x) => x.id === abierta.id) || abierta)} hrefFicha={hrefFicha}
          onCerrar={() => setAbierta(null)} onLeido={(id) => setVistas((v) => new Set(v).add(id))} />
      )}
    </div>
  );
}
