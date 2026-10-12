"use client";
// ════════════════════════════════════════════════════════════════════════
// components/panel/TableroEtapas.jsx — Las candidatas, cada una en su etapa
//
// Una columna por etapa del recorrido (lib/etapas-candidata.js) y las salidas
// aparte. Lo usa el admin y lo usará la agencia: lo que cambia es qué columnas
// se pueden mover (`movibles`) y qué hace mover (`onMover`), nunca el tablero.
//
// Mover: arrastrar la tarjeta (HTML5 nativo, sin librería) o, en móvil, el
// selector "Mover a" de la tarjeta. Sólo entre etapas de la agencia: las
// demás se calculan de los datos y se deciden en la ficha.
// ════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Phone, Mail, MoreVertical } from "lucide-react";
import { T } from "@/lib/tema";
import { ETAPAS, SALIDAS, etapaPorId } from "@/lib/etapas-candidata";

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

function Tarjeta({ c, movible, movibles, onMover, hrefFicha, onArrastrar }) {
  const [menu, setMenu] = useState(false);
  const caja = useRef(null);
  // El menú se cierra al tocar fuera de la tarjeta.
  useEffect(() => {
    if (!menu) return;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setMenu(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [menu]);

  const fila  = { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.neutral, minWidth: 0 };
  const corto = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  const vacio = (t) => <em style={{ color: T.softText, fontStyle: "normal" }}>{t}</em>;

  return (
    <div ref={caja} draggable={movible} onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(c.id)); onArrastrar(c.id); }}
      style={{ position: "relative", background: "#fff", borderRadius: 14, padding: 14, cursor: movible ? "grab" : "default",
               boxShadow: "0 1px 3px rgba(58,37,48,.06)", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Quién es y desde cuándo está en la etapa */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: movible ? 22 : 0 }}>
        {c.foto_url
          ? <img src={c.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {(c.nombre || "?").charAt(0).toUpperCase()}
            </div>}
        <div style={{ minWidth: 0 }}>
          <Link href={hrefFicha(c.id)} draggable={false} style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, ...corto }}>{c.nombre || "Sin nombre"}</div>
          </Link>
          {dias(c.desde) && <div style={{ fontSize: 11, color: T.softText }}>En la etapa: {dias(c.desde)}</div>}
        </div>
      </div>

      <div style={{ height: 1, background: T.softLine }} />

      {/* Cómo contactarla y dónde está */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={fila}>
          <Phone size={13} style={{ flexShrink: 0 }} />
          {c.telefono ? <a href={`tel:${c.telefono}`} draggable={false} style={{ ...corto, color: T.neutral, textDecoration: "none" }}>{c.telefono}</a> : vacio("Sin teléfono")}
        </div>
        <div style={fila}>
          <Mail size={13} style={{ flexShrink: 0 }} />
          {c.email ? <a href={`mailto:${c.email}`} draggable={false} style={{ ...corto, color: T.neutral, textDecoration: "none" }}>{c.email}</a> : vacio("Sin correo")}
        </div>
        <div style={fila}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          {c.ciudad ? <span style={corto}>{c.ciudad}</span> : vacio("Sin ciudad")}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span title="Información diligenciada" style={{ fontSize: 11, fontWeight: 600, color: T.primary, background: T.lilac, padding: "3px 10px", borderRadius: 8 }}>{c.score}% diligenciado</span>
        {c.agencia && (
          <span style={{ fontSize: 11, fontWeight: 600, color: T.neutral, background: T.neutralBg, padding: "3px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Building2 size={11} /> {c.agencia}
          </span>
        )}
      </div>

      {/* Mover sin arrastrar (en el celular arrastrar no es fiable): un menú
          discreto en la esquina, no un selector permanente en cada tarjeta. */}
      {movible && (
        <>
          <button type="button" onClick={() => setMenu(!menu)} aria-label={`Mover a ${c.nombre} a otra etapa`} title="Mover a otra etapa"
            style={{ position: "absolute", top: 12, right: 10, width: 24, height: 24, borderRadius: 8, border: "none",
                     background: menu ? T.lilac : "transparent", color: T.textSoft, cursor: "pointer",
                     display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreVertical size={16} />
          </button>
          {menu && (
            <div role="menu" style={{ position: "absolute", top: 38, right: 10, zIndex: 20, background: "#fff", borderRadius: 12,
                                      boxShadow: "0 12px 28px rgba(58,37,48,.18)", border: `1px solid ${T.border}`, padding: 6, minWidth: 190 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft, padding: "4px 8px" }}>MOVER A</div>
              {movibles.filter((id) => id !== c.etapa).map((id) => (
                <button key={id} type="button" role="menuitem" onClick={() => { setMenu(false); onMover(c.id, id); }}
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
        </>
      )}
    </div>
  );
}

export default function TableroEtapas({ candidatas = [], movibles = [], onMover, hrefFicha, columnas = null }) {
  const [arrastrando, setArrastrando] = useState(null);
  const [encima, setEncima] = useState(null);
  const carril = useRef(null);

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

  const soltar = (etapa) => {
    const c = candidatas.find((x) => x.id === arrastrando);
    setEncima(null); setArrastrando(null);
    if (c && c.etapa !== etapa && movibles.includes(c.etapa) && movibles.includes(etapa)) onMover(c.id, etapa);
  };

  const columna = (e, salida = false) => {
    const tarjetas = candidatas.filter((c) => c.etapa === e.id);
    const recibe = movibles.includes(e.id) && arrastrando != null;
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
          <Tarjeta key={c.id} c={c} movible={movibles.includes(c.etapa)} movibles={movibles}
            onMover={onMover} hrefFicha={hrefFicha} onArrastrar={setArrastrando} />
        ))}
        {!tarjetas.length && <div style={{ fontSize: 11.5, color: T.softText, textAlign: "center", padding: "18px 0", border: `1.5px dashed ${T.border}`, borderRadius: 14 }}>Sin candidatas</div>}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: T.font, display: "flex", flexDirection: "column", gap: 16 }}>
      <div ref={carril} onDragOver={desplazarSiBorde} onDragEnd={() => { setArrastrando(null); setEncima(null); }}
        style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, alignItems: "flex-start" }}>
        {lista.map((e) => columna(e))}
      </div>
      {/* Las salidas no son parte del camino: van aparte */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", alignItems: "flex-start" }}>
        {SALIDAS.filter((s) => !columnas || columnas.includes(s.id)).map((s) => columna(s, true))}
      </div>
    </div>
  );
}
