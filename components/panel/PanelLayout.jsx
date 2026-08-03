"use client";
// components/panel/PanelLayout.jsx — La cáscara de TODOS los paneles.
//
// Antes cada rol tenía la suya: cuatro `layout.jsx`, 577 líneas y cero
// componentes compartidos. `asociada` y `agencia` hacían el mismo trabajo con
// 203 líneas distintas entre sí — no eran copias, habían divergido. El
// resultado es que cada rol parecía una plataforma diferente.
//
// La plataforma es UNA con varios niveles de acceso. Lo que cambia entre roles
// es a qué módulos se entra y qué se puede hacer en ellos, no cómo se ve ni
// cómo se navega. Por eso esta cáscara NO sabe qué es un admin ni qué es una
// agencia: recibe la lista de módulos y la dibuja.
//
// Un módulo puede venir `disponible: false`. Se pinta apagado, sin enlace y
// con su motivo. La idea no es nueva: el panel de la candidata ya la tenía con
// su candado desde el Sprint 0.0. Aquí se comparte en vez de repetirse.

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, Lock } from "lucide-react";
import { T, POPPINS_HREF } from "@/lib/tema";

/**
 * @param {object}   props
 * @param {Array}    props.modulos   [{ href, label, icon, disponible?, motivo?, badge?, separador? }]
 * @param {string}   props.rol       etiqueta bajo el nombre ("Administración", "Asesora"…)
 * @param {string}   props.inicio    a dónde lleva el logo
 * @param {React.ReactNode} props.children
 */
export default function PanelLayout({ modulos = [], rol = "", inicio = "/", children }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Ojo: /api/auth/me responde { user: {...} }. El panel de la asociada
    // guardaba la respuesta entera y luego leía `.nombre`, así que nunca
    // mostró el nombre de nadie.
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setUsuario(d?.user || null))
      .catch(() => {});
  }, []);

  const salir = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Navegación de documento: la cookie acaba de cambiar y el destino está
    // detrás del middleware.
    window.location.assign("/login");
  };

  const activo = (href) =>
    href === inicio ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const Modulo = ({ item }) => {
    const Icono = item.icon;
    const act = activo(item.href);
    const off = item.disponible === false;

    const contenido = (
      <>
        {off ? <Lock size={17} /> : <Icono size={19} />}
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.label}
        </span>
        {!off && item.badge > 0 && (
          <span style={{ background: T.primary3, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
            {item.badge}
          </span>
        )}
      </>
    );

    const estilo = {
      display: "flex", alignItems: "center", gap: 12, padding: "11px 13px",
      borderRadius: 13, fontFamily: T.font, fontSize: 13.5,
      fontWeight: act ? 700 : 500, textDecoration: "none",
      background: act ? T.gradIcon : "transparent",
      color: act ? "#fff" : off ? T.softText : T.textSoft,
      boxShadow: act ? "0 8px 20px rgba(160,67,95,.28)" : "none",
      width: "100%", border: "none", textAlign: "left",
    };

    // Un módulo apagado no es un enlace: no se puede abrir ni con el teclado.
    if (off) {
      return (
        <div style={{ ...estilo, cursor: "not-allowed", opacity: .75 }}
             title={item.motivo || "Todavía no está disponible"}
             aria-disabled="true">
          {contenido}
        </div>
      );
    }

    return (
      <Link href={item.href} onClick={() => setAbierto(false)} style={estilo}>
        {contenido}
      </Link>
    );
  };

  const Barra = () => (
    <aside style={{ width: 240, flexShrink: 0, background: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, height: "100%", overflowY: "auto" }}>
      <Link href={inicio} onClick={() => setAbierto(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px 18px", textDecoration: "none" }}>
        <img src="/assets/destino-aupair-logo2.svg" alt="Destino Au Pair"
             style={{ height: 84, width: "auto", maxWidth: "100%", objectFit: "contain" }} />
      </Link>

      {modulos.map((it, i) => {
        if (it.separador) return <div key={`sep-${i}`} style={{ height: 1, background: T.border, margin: "10px 8px" }} />;
        // Un grupo rotula los módulos que vienen debajo — "Finanzas" sobre
        // ventas, comisiones y códigos. Es una etiqueta, no un destino: no
        // hace falta inventar una pantalla para agrupar tres que ya existen.
        if (it.grupo) return (
          <div key={`gr-${i}`} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: T.softText, padding: "14px 13px 5px", fontFamily: T.font }}>
            {it.grupo.toUpperCase()}
          </div>
        );
        return <Modulo key={it.href} item={it} />;
      })}

      <div style={{ marginTop: "auto", paddingTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, background: T.lilac, borderRadius: 14, padding: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, overflow: "hidden", flexShrink: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {usuario?.foto_url
              ? <img src={usuario.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: T.primary, fontWeight: 700 }}>{usuario?.nombre?.[0]?.toUpperCase() || "?"}</span>}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: T.text, fontFamily: T.font, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {usuario ? `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() : "…"}
            </div>
            <div style={{ fontSize: 11, color: T.textSoft, fontFamily: T.font }}>{rol}</div>
          </div>
        </div>
        <button onClick={salir}
                style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11, padding: "4px 8px", background: "none", border: "none", color: T.textSoft, fontFamily: T.font, fontSize: 12, cursor: "pointer" }}>
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={POPPINS_HREF} />

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: T.font }}>
        <div className="hidden md:flex" style={{ flexShrink: 0 }}><Barra /></div>

        {abierto && (
          <>
            <div className="md:hidden" style={{ position: "fixed", inset: 0, background: "rgba(58,37,48,.45)", zIndex: 40 }}
                 onClick={() => setAbierto(false)} />
            <div className="md:hidden" style={{ position: "fixed", insetBlock: 0, left: 0, zIndex: 50, display: "flex" }}>
              <Barra />
            </div>
          </>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <header className="md:hidden flex items-center justify-between"
                  style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "10px 16px", flexShrink: 0 }}>
            <button onClick={() => setAbierto(!abierto)}
                    style={{ background: "none", border: "none", color: T.primary, cursor: "pointer", display: "flex" }}>
              {abierto ? <X size={21} /> : <Menu size={21} />}
            </button>
            <img src="/assets/destino-aupair-logo2.svg" alt="" style={{ height: 34 }} />
            <div style={{ width: 21 }} />
          </header>

          <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </>
  );
}
