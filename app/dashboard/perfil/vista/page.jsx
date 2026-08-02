"use client";
// app/dashboard/perfil/vista/page.jsx — El perfil completo, de un vistazo.
//
// Hasta ahora la candidata terminaba sus 15 secciones y no tenía dónde verlas:
// las dos únicas pantallas eran formularios de edición. Ésta es de sólo
// lectura y muestra las dos partes juntas.
//
// Se GENERA desde lib/campos-perfil.js, que ya declara las secciones y el
// label de cada campo. No hay ni una etiqueta escrita a mano aquí: si mañana
// se añade un campo al formulario, aparece solo. Escribirla a mano crearía una
// segunda lista de campos que hay que acordarse de actualizar, que es el
// defecto que el Sprint 0.0 corrigió al centralizar la validación.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, MapPin, Mail, Cake, CheckCircle2, Clock,
  User, ClipboardCheck, Briefcase, Heart, Baby, Plane,
  GraduationCap, Car, Sparkles, MessageCircle, HeartPulse, UserCheck, Image as ImageIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema-candidata";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";
import { PARTE1, PARTE2, valorParaMostrar, perfilCompleto, camposFaltantes } from "@/lib/campos-perfil";

// Cada parte se edita en su propio formulario. Los ids de sección se repiten
// entre partes (personal, experiencia, salud están en las dos), así que la
// clave única de una sección es parte + id.
const PARTES = [
  { n: 1, secciones: PARTE1, formulario: "/dashboard/perfil/evaluacion", nombre: "Cuéntanos de ti" },
  { n: 2, secciones: PARTE2, formulario: "/dashboard/perfil/agencia",    nombre: "Perfil con la agencia" },
];

// Un icono por sección, por posición dentro de su parte. Va aquí y no en
// campos-perfil.js porque es presentación: ese archivo declara qué campos hay
// y cuáles son obligatorios, y lo usan también el servidor y la validación.
const ICONOS = {
  1: [User, ClipboardCheck, Briefcase, Heart, Baby, Plane],
  2: [User, Baby, GraduationCap, Car, Sparkles, MessageCircle, HeartPulse, UserCheck, ImageIcon],
};

// Las 15 secciones aplanadas, cada una con su parte. Se muestran como
// pestañas y sólo se pinta la activa: en una sola columna la vista medía más
// de 4.000 píxeles de alto y obligaba a recorrerla entera para ver el final.
const PESTANAS = PARTES.flatMap(p =>
  p.secciones.map((s, i) => ({
    ...s, clave: `${p.n}-${s.id}`, parte: p.n,
    formulario: p.formulario, parteNombre: p.nombre,
    Icono: ICONOS[p.n][i] || User,
  }))
);

const edad = (fecha) => {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const hoy = new Date();
  let a = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) a--;
  return a > 0 && a < 120 ? a : null;
};

export default function VistaPerfilPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const gate = useAccessGate("perfil");
  const [user, setUser]     = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activaClave, setActiva] = useState(PESTANAS[0].clave);

  useEffect(() => {
    const safe = (p, fb = null) =>
      p.then(r => { if (r.status === 401) { router.push("/login"); return fb; } return r.json().catch(() => fb); })
       .catch(() => fb);
    Promise.all([
      safe(fetch("/api/auth/me"), { user: null }),
      safe(fetch("/api/dashboard/perfil"), null),
    ]).then(([me, perf]) => {
      setUser(me?.user || null);
      setPerfil(perf?.perfil || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || gate.loading) return <GateLoading />;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="Tu perfil de candidata" />;
  if (!perfil) return <GateLoading />;

  const nombre    = `${user?.nombre || ""} ${user?.apellido || ""}`.trim();
  const anios     = edad(perfil.fecha_nacimiento);
  const lugar     = [perfil.ciudad, perfil.pais].filter(Boolean).join(", ");
  const aprobado  = Number(perfil.evaluacion_aprobada) === 1;
  const activa    = PESTANAS.find(p => p.clave === activaClave) || PESTANAS[0];

  // El perfil a medias no esconde la vista: la cambia. En vez de las pestañas
  // con los datos, se muestra el recorrido de las 15 secciones con lo que
  // falta en cada una. Así la candidata ve su tarjeta desde el primer día y
  // sabe exactamente qué le queda.
  const completo = perfilCompleto(perfil);
  const estado   = PESTANAS.map(p => {
    const faltan = camposFaltantes(p, perfil);
    return { ...p, faltan, lista: faltan.length === 0 };
  });
  const listas   = estado.filter(s => s.lista).length;
  const pct      = Math.round((listas / estado.length) * 100);

  const Campo = ({ campo }) => {
    const { tipo, texto } = valorParaMostrar(campo, perfil);

    // Una imagen se pinta como miniatura. El valor es un data-URI de hasta
    // 42 KB: mostrarlo como texto volcaría cuarenta mil caracteres. Y omitir
    // el campo dejaría la sección "Fotos y videos" con el título y nada más.
    if (tipo === "imagen") {
      return (
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.softLine}` }}>
          <div style={{ fontSize: 12.5, color: T.textSoft, minWidth: 190, flexShrink: 0 }}>{campo.label}</div>
          <img src={texto} alt={campo.label} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: `1px solid ${T.border}` }} />
        </div>
      );
    }

    const vacio  = tipo === "vacio";
    const bloque = tipo === "bloque";
    return (
      <div style={{
        display: bloque || isMobile ? "block" : "flex",
        gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.softLine}`,
      }}>
        <div style={{ fontSize: 12.5, color: T.textSoft, minWidth: bloque ? undefined : 190, flexShrink: 0 }}>
          {campo.label}
        </div>
        <div style={{
          fontSize: 13.5, color: vacio ? T.softText : T.text,
          fontStyle: vacio ? "italic" : "normal",
          fontWeight: vacio ? 400 : 600,
          marginTop: bloque ? 4 : 0, lineHeight: 1.5, wordBreak: "break-word",
        }}>
          {texto}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", maxWidth: 860, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>

      <Link href="/dashboard/perfil" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.primary, fontWeight: 600, textDecoration: "none" }}>
        <ArrowLeft size={15} /> Volver a mi perfil
      </Link>

      {/* Cabecera */}
      <div style={{ background: "#fff", borderRadius: 22, padding: isMobile ? 18 : 24, boxShadow: T.shadow, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        {perfil.foto_url
          ? <img src={perfil.foto_url} alt={nombre} style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 92, height: 92, borderRadius: "50%", background: T.lilac, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, flexShrink: 0 }}>
              {(user?.nombre || "?").charAt(0).toUpperCase()}
            </div>}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: T.ink, lineHeight: 1.15 }}>{nombre || "Tu perfil"}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, fontSize: 12.5, color: T.textSoft }}>
            {lugar   && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={13} /> {lugar}</span>}
            {anios   && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Cake size={13} /> {anios} años</span>}
            {user?.email && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Mail size={13} /> {user.email}</span>}
          </div>
        </div>
      </div>

      {/* Estado de la evaluación. Dos estados: es lo único que el sistema
          registra — sólo se escribe `evaluacion_aprobada`, un booleano. */}
      {completo && <div style={{ background: aprobado ? T.greenBg : T.amberBg, borderRadius: 18, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ marginTop: 1, color: aprobado ? T.green : T.amber, flexShrink: 0 }}>
          {aprobado ? <CheckCircle2 size={19} /> : <Clock size={19} />}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>
            {aprobado ? "Tu perfil fue aprobado" : "Tu perfil está en revisión"}
          </div>
          <div style={{ fontSize: 12.5, color: T.textSoft, marginTop: 3, lineHeight: 1.5 }}>
            {aprobado
              ? "Nuestro equipo lo revisó y quedó listo para presentarlo a una agencia aliada."
              : "Nuestro equipo lo está revisando (1–3 días hábiles). Te avisamos apenas tengamos novedades."}
          </div>
        </div>
      </div>}

      {/* ── Perfil a medias: el recorrido de las secciones ─────────────── */}
      {!completo && (
        <>
          <div style={{ borderRadius: 20, padding: 20, background: T.gradHero, color: "#fff", boxShadow: T.shadowHero }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Te falta poco</div>
                <div style={{ fontSize: 13, opacity: .92, marginTop: 3 }}>
                  {listas} de {estado.length} secciones completas
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{pct}%</div>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,.25)", borderRadius: 20, overflow: "hidden", marginTop: 14 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#fff", borderRadius: 20, transition: "width .5s" }} />
            </div>
          </div>

          {PARTES.map(parte => (
            <div key={parte.n}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.lilac, padding: "3px 9px", borderRadius: 20 }}>
                  PARTE {parte.n}
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.textSoft }}>{parte.nombre}</div>
              </div>

              {/* Recorrido vertical: el hilo con su punto por sección */}
              <div style={{ position: "relative", paddingLeft: 26 }}>
                <div style={{ position: "absolute", left: 8, top: 12, bottom: 12, width: 2, background: T.softLine }} />
                {estado.filter(s => s.parte === parte.n).map(sec => (
                  <div key={sec.clave} style={{ position: "relative", marginBottom: 10 }}>
                    <div style={{
                      position: "absolute", left: -22, top: 18, width: 14, height: 14, borderRadius: "50%",
                      background: sec.lista ? T.primary : "#fff",
                      border: `2px solid ${sec.lista ? T.primary : T.border}`,
                    }} />
                    <Link href={`${sec.formulario}?seccion=${sec.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: sec.lista ? "#fff" : T.lilac, borderRadius: 14, padding: "13px 16px",
                        boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 12,
                        border: `1px solid ${sec.lista ? "transparent" : T.border}`,
                      }}>
                        <sec.Icono size={17} style={{ color: sec.lista ? T.primary : T.textSoft, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{sec.titulo}</div>
                          <div style={{ fontSize: 11.5, color: T.textSoft, marginTop: 2 }}>
                            {sec.lista
                              ? "Completa"
                              : `Te falta: ${sec.faltan.map(f => f.label).join(", ")}`}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, flexShrink: 0,
                          background: sec.lista ? T.greenBg : "#fff",
                          color: sec.lista ? T.green : T.primary,
                          border: sec.lista ? "none" : `1px solid ${T.primary3}`,
                        }}>
                          {sec.lista ? "Completa" : "Continuar"}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Pestañas: una fila que se desplaza en horizontal. La activa va
          contorneada, no rellena, para que el color fuerte quede para las
          acciones y no para indicar dónde estás. */}
      {completo && <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
        {PESTANAS.map((p, i) => {
          const act = p.clave === activaClave;
          const cambiaDeParte = i > 0 && PESTANAS[i - 1].parte !== p.parte;
          return (
            <div key={p.clave} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {cambiaDeParte && <div style={{ width: 1, height: 26, background: T.border, flexShrink: 0 }} />}
              <button onClick={() => setActiva(p.clave)} title={`Parte ${p.parte} · ${p.parteNombre}`}
                style={{
                  fontFamily: T.font, fontSize: 12.5, fontWeight: act ? 700 : 600,
                  padding: "9px 14px", borderRadius: 12, cursor: "pointer",
                  background: "#fff",
                  color: act ? T.primary : T.textSoft,
                  border: `1.5px solid ${act ? T.primary : T.border}`,
                  display: "inline-flex", alignItems: "center", gap: 7,
                  whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s",
                }}>
                <p.Icono size={15} strokeWidth={act ? 2.2 : 1.8} />
                {p.titulo}
              </button>
            </div>
          );
        })}
      </div>}

      {/* La sección activa */}
      {completo && activa && (
        <div style={{ background: "#fff", borderRadius: 18, padding: isMobile ? 16 : 22, boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{activa.titulo}</div>
              <div style={{ fontSize: 11.5, color: T.softText, marginTop: 2 }}>
                Parte {activa.parte} · {activa.parteNombre}
              </div>
            </div>
            <Link href={`${activa.formulario}?seccion=${activa.id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: T.primary, textDecoration: "none", background: T.lilac, padding: "8px 14px", borderRadius: 10, flexShrink: 0 }}>
              <Pencil size={13} /> Editar
            </Link>
          </div>
          {activa.campos.map(campo => <Campo key={campo.name} campo={campo} />)}
        </div>
      )}
    </div>
  );
}
