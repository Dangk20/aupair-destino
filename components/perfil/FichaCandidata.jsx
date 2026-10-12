"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/FichaCandidata.jsx — La ficha de una candidata. Una sola.
//
// Antes había tres fichas de la misma persona, y las tres decían cosas
// distintas: la de la candidata (generada desde campos-perfil.js), el asistente
// de seis pasos del admin (con su propia lista de campos y su propio cálculo) y
// el "perfil agencia" (con una tercera lista y una regla según la cual una
// sección estaba completa con la mitad de sus campos llenos). De ahí salía el
// "100% completado" del admin sobre perfiles incompletos.
//
// Ahora es este componente, y sólo cambia QUÉ SE PUEDE HACER:
//
//   modo="propio"    la candidata mira su ficha
//   modo="revision"  el personal la revisa: añade el bloque de valoración interna
//
// Se recibe `modo`, no el rol, porque lo que cambia la ficha es si la miras como
// dueña o como revisora. El día que una asociada revise a sus candidatas entra
// en "revision" sin tocar este archivo.
//
// Y `modo` NO es autorización: sólo decide qué se dibuja. Quién puede pedir el
// perfil de otra persona lo sigue decidiendo `requiereAdmin()` en la ruta de
// API. Manipular el cliente para pasar "revision" no obtiene nada.
//
// No hace `fetch`: cada pantalla trae sus datos de su propia API y se los pasa.
// La excepción es la pestaña de Documentos, que es dueña de un recurso que se
// muta desde ella misma.
// ════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";
import {
  Pencil, MapPin, Mail, Cake, CheckCircle2, Clock, Paperclip, ListChecks,
  User, ClipboardCheck, Briefcase, Heart, Baby, Plane,
  GraduationCap, Car, Sparkles, MessageCircle, HeartPulse, UserCheck,
  Image as ImageIcon, Milestone,
} from "lucide-react";
import { T } from "@/lib/tema";
import {
  PARTE1, PARTE2, valorParaMostrar, perfilCompleto, camposFaltantes,
} from "@/lib/campos-perfil";
import PestanaDocumentos from "./PestanaDocumentos";
import LineaDeTiempo from "./LineaDeTiempo";
import {
  ObservarElemento, PanelObservaciones, NotaObservacion, observacionesDe, seccionConCorreccion,
} from "./Observaciones";

// Cada parte se edita en su propio formulario. Los ids de sección se repiten
// entre partes (personal, experiencia y salud están en las dos), así que la
// clave única de una sección es parte + id.
const PARTES = [
  { n: 1, secciones: PARTE1, nombre: "Cuéntanos de ti" },
  { n: 2, secciones: PARTE2, nombre: "Perfil con la agencia" },
];

// Un icono por sección, por posición dentro de su parte. Va aquí y no en
// campos-perfil.js porque es presentación: ese archivo declara qué campos hay
// y cuáles son obligatorios, y lo usan también el servidor y la validación.
const ICONOS = {
  1: [User, ClipboardCheck, Briefcase, Heart, Baby, Plane],
  2: [User, Baby, GraduationCap, Car, Sparkles, MessageCircle, HeartPulse, UserCheck, ImageIcon],
};

/** Las 15 secciones aplanadas, cada una con su parte. */
const SECCIONES = PARTES.flatMap(p =>
  p.secciones.map((s, i) => ({
    ...s,
    clave: `${p.n}-${s.id}`,
    parte: p.n,
    parteNombre: p.nombre,
    Icono: ICONOS[p.n][i] || User,
  }))
);

// Dos pestañas que no son secciones del perfil.
//   PROGRESO   el recorrido de las 15 secciones con lo que falta en cada una.
//              Sólo existe mientras el perfil esté incompleto: cuando ya no
//              falta nada, no hay nada que recorrer. Va primera porque es lo
//              que hay que hacer a continuación.
//   DOCUMENTOS la documentación. Va última, y siempre.
const PROGRESO   = "progreso";
const DOCUMENTOS = "documentos";
//   RECORRIDO  la línea de tiempo: etapas e historial. La misma que ve la
//              candidata en "Mi Destino". Sólo si la pantalla la trae.
const RECORRIDO  = "recorrido";

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

/* ── Un campo, en sólo lectura ──────────────────────────────────────────── */
function Campo({ campo, perfil, isMobile }) {
  const { tipo, texto } = valorParaMostrar(campo, perfil);

  // Una imagen se pinta como miniatura. El valor es un data-URI de hasta
  // 42 KB: mostrarlo como texto volcaría cuarenta mil caracteres. Y omitir el
  // campo dejaría la sección "Fotos y videos" con el título y nada más.
  if (tipo === "imagen") {
    return (
      <div style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${T.softLine}` }}>
        <div style={{ fontSize:12.5, color:T.textSoft, minWidth:190, flexShrink:0 }}>{campo.label}</div>
        <img src={texto} alt={campo.label} style={{ width:56, height:56, borderRadius:10, objectFit:"cover", border:`1px solid ${T.border}` }} />
      </div>
    );
  }

  const vacio  = tipo === "vacio";
  const bloque = tipo === "bloque";
  return (
    <div style={{ display: bloque || isMobile ? "block" : "flex", gap:12, padding:"9px 0", borderBottom:`1px solid ${T.softLine}` }}>
      <div style={{ fontSize:12.5, color:T.textSoft, minWidth: bloque ? undefined : 190, flexShrink:0 }}>
        {campo.label}
      </div>
      <div style={{
        fontSize:13.5, color: vacio ? T.softText : T.text,
        fontStyle: vacio ? "italic" : "normal",
        fontWeight: vacio ? 400 : 600,
        marginTop: bloque ? 4 : 0, lineHeight:1.5, wordBreak:"break-word",
      }}>
        {texto}
      </div>
    </div>
  );
}

/* ── Las fotos de la cédula ─────────────────────────────────────────────────
   Se suben en la Parte 1 · Información personal pero no están declaradas en
   campos-perfil.js (no se validan ni cuentan para el progreso), así que nada
   las pintaba: se cargaban y desaparecían (R2). Van aquí, debajo de los campos
   de esa sección, para la candidata y para quien la revisa. */
const LADOS_CEDULA = [
  { name: "cedula_frontal_url",   label: "Lado frontal" },
  { name: "cedula_posterior_url", label: "Lado posterior" },
];

/** Un data-URI no se puede abrir con un enlace (el navegador bloquea navegar a `data:`). */
function verEnGrande(src, titulo) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.title = titulo;
  w.document.body.style.cssText = "margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh";
  const img = w.document.createElement("img");
  img.src = src; img.alt = titulo;
  img.style.cssText = "max-width:100%;max-height:100vh";
  w.document.body.appendChild(img);
}

function FotosCedula({ perfil }) {
  return (
    <div style={{ marginTop:16 }}>
      <div style={{ fontSize:12.5, color:T.textSoft, marginBottom:10 }}>Cédula</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
        {LADOS_CEDULA.map(lado => {
          const src = String(perfil?.[lado.name] || "");
          const hay = src.startsWith("data:image/") || /^https?:\/\//.test(src);
          return (
            <div key={lado.name}>
              {hay ? (
                <button type="button" onClick={() => verEnGrande(src, `Cédula · ${lado.label}`)}
                  title="Ver en grande" aria-label={`Ver la cédula, ${lado.label.toLowerCase()}, en grande`}
                  style={{ display:"block", width:"100%", padding:0, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", cursor:"zoom-in", background:T.softFill }}>
                  <img src={src} alt={`Cédula · ${lado.label}`} style={{ display:"block", width:"100%", height:140, objectFit:"cover" }} />
                </button>
              ) : (
                <div style={{ height:140, borderRadius:12, border:`1.5px dashed ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12.5, color:T.softText, fontStyle:"italic" }}>
                  Sin cargar
                </div>
              )}
              <div style={{ fontSize:11.5, color:T.textSoft, marginTop:6, textAlign:"center" }}>{lado.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {object}   perfil      la fila de `usuarios`, ya filtrada por la API
 * @param {object}   usuario     identidad (nombre, apellido, email). Si no viene,
 *                               se toma del propio perfil — el admin la trae ahí.
 * @param {"propio"|"revision"} modo
 * @param {string}   titulo      encabezado de la pantalla
 * @param {string}   subtitulo   línea bajo el encabezado
 * @param {function} rutaEdicion (seccion) => href del formulario, anclado
 * @param {boolean}  puedeVerDocumentos  en modo "propio", si tiene el permiso
 * @param {node}     bloqueInterno       en modo "revision", la valoración interna
 * @param {Array}    observaciones       las del perfil (R3): el admin las crea y
 *                                       gestiona aquí; la candidata las ve junto
 *                                       a cada elemento
 * @param {function} onObservacion       en "revision", recargar tras crear/cambiar
 * @param {object}   recorrido           { etapa, agencia, historial } para la
 *                                       pestaña Recorrido (línea de tiempo)
 * @param {object}   enviadas            { 1: fecha|null, 2: fecha|null } — una
 *                                       parte enviada ya no ofrece "Editar"
 * @param {boolean}  isMobile
 */
export default function FichaCandidata({
  perfil,
  usuario,
  modo = "propio",
  titulo,
  subtitulo,
  rutaEdicion,
  puedeVerDocumentos = true,
  bloqueInterno = null,
  observaciones = [],
  onObservacion,
  enviadas = {},
  recorrido = null,
  isMobile = false,
}) {
  // Empieza sin decidir: cuál es la primera pestaña depende de si el perfil
  // está completo, y eso se sabe abajo, ya con el perfil en la mano.
  const [elegida, setElegida] = useState(null);

  const revision = modo === "revision";
  const ident    = usuario || perfil || {};
  const nombre   = `${ident.nombre || ""} ${ident.apellido || ""}`.trim();
  const anios    = edad(perfil?.fecha_nacimiento);
  const lugar    = [perfil?.ciudad, perfil?.pais].filter(Boolean).join(", ");
  const aprobado = Number(perfil?.evaluacion_aprobada) === 1;

  // El estado de cada sección y el avance salen de campos-perfil.js. Ni esta
  // ficha ni la pantalla que la monta calculan nada por su cuenta: ésa era la
  // raíz de que el mismo perfil tuviera tres porcentajes distintos.
  const completo = perfilCompleto(perfil || {});
  const estado   = SECCIONES.map(s => {
    const faltan = camposFaltantes(s, perfil || {});
    return { ...s, faltan, lista: faltan.length === 0 };
  });
  const listas = estado.filter(s => s.lista).length;
  const pct    = Math.round((listas / estado.length) * 100);

  // Con el perfil a medias se abre en Progreso, que es lo que hay que hacer;
  // terminado, en la primera sección. Si la elegida deja de existir —el perfil
  // se completó estando en Progreso— se cae a la primera sección.
  const inicial = completo ? SECCIONES[0].clave : PROGRESO;
  const activa  = (elegida === PROGRESO && completo) ? inicial : (elegida || inicial);

  const seccionActiva = SECCIONES.find(s => s.clave === activa);

  return (
    <div style={{ fontFamily:T.font, color:T.text, display:"flex", flexDirection:"column", gap:18 }}>

      {/* Encabezado */}
      {(titulo || subtitulo) && (
        <div>
          {titulo && <div style={{ fontSize:isMobile ? 21 : 26, fontWeight:700, color:T.text, lineHeight:1.1 }}>{titulo}</div>}
          {subtitulo && <div style={{ fontSize:13.5, color:T.textSoft, marginTop:3 }}>{subtitulo}</div>}
        </div>
      )}

      {/* Tarjeta de identidad */}
      <div style={{ background:"#fff", borderRadius:22, padding:isMobile ? 18 : 24, boxShadow:T.shadow, display:"flex", gap:18, alignItems:"center", flexWrap:"wrap" }}>
        {perfil?.foto_url
          ? <img src={perfil.foto_url} alt={nombre} onError={e => { e.target.style.display = "none"; }}
              style={{ width:92, height:92, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
          : <div style={{ width:92, height:92, borderRadius:"50%", background:T.lilac, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:700, flexShrink:0 }}>
              {(ident.nombre || "?").charAt(0).toUpperCase()}
            </div>}
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:isMobile ? 20 : 24, fontWeight:700, color:T.ink, lineHeight:1.15 }}>
            {nombre || (revision ? "Candidata" : "Tu perfil")}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginTop:8, fontSize:12.5, color:T.textSoft }}>
            {lugar        && <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><MapPin size={13} /> {lugar}</span>}
            {anios        && <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Cake size={13} /> {anios} años</span>}
            {ident.email  && <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Mail size={13} /> {ident.email}</span>}
          </div>
        </div>
      </div>

      {/* Estado de la evaluación. Dos estados: es lo único que el sistema
          registra — sólo se escribe `evaluacion_aprobada`, un booleano. */}
      {completo && (
        <div style={{ background: aprobado ? T.greenBg : T.amberBg, borderRadius:18, padding:16, display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ marginTop:1, color: aprobado ? T.green : T.amber, flexShrink:0 }}>
            {aprobado ? <CheckCircle2 size={19} /> : <Clock size={19} />}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>
              {aprobado
                ? (revision ? "Perfil aprobado" : "Tu perfil fue aprobado")
                : (revision ? "Perfil en revisión" : "Tu perfil está en revisión")}
            </div>
            <div style={{ fontSize:12.5, color:T.textSoft, marginTop:3, lineHeight:1.5 }}>
              {aprobado
                ? (revision
                    ? "Quedó listo para presentarlo a una agencia aliada."
                    : "Nuestro equipo lo revisó y quedó listo para presentarlo a una agencia aliada.")
                : (revision
                    ? "Todavía no se ha aprobado para presentarlo a una agencia."
                    : "Nuestro equipo lo está revisando (1–3 días hábiles). Te avisamos apenas tengamos novedades.")}
            </div>
          </div>
        </div>
      )}

      {/* Bloque de valoración interna — sólo en revisión */}
      {revision && bloqueInterno}

      {/* Observaciones abiertas, atendidas y cerradas — sólo en revisión */}
      {revision && (
        <PanelObservaciones usuarioId={perfil?.id} observaciones={observaciones} onCambio={onObservacion} />
      )}

      {/* Cuánto le falta. Se queda fuera de las pestañas: es el titular del
          estado del perfil, no un contenido más que haya que ir a buscar. */}
      {!completo && (
        <div style={{ borderRadius:20, padding:20, background:T.gradHero, color:"#fff", boxShadow:T.shadowHero }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:17, fontWeight:700 }}>{revision ? "Perfil incompleto" : "Te falta poco"}</div>
              <div style={{ fontSize:13, opacity:.92, marginTop:3 }}>
                {listas} de {estado.length} secciones completas
              </div>
            </div>
            <div style={{ fontSize:30, fontWeight:800 }}>{pct}%</div>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,.25)", borderRadius:20, overflow:"hidden", marginTop:14 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"#fff", borderRadius:20, transition:"width .5s" }} />
          </div>
        </div>
      )}

      {/* Pestañas: una fila que se desplaza en horizontal. La activa va
          contorneada, no rellena, para que el color fuerte quede para las
          acciones y no para indicar dónde estás.

          Progreso primero y sólo si falta algo; Documentos último y siempre. */}
      <div id="secciones-ficha" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, scrollbarWidth:"thin", scrollMarginTop:20 }}>
        {!completo && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => setElegida(PROGRESO)} title="Qué falta por diligenciar"
              style={{
                fontFamily:T.font, fontSize:12.5, fontWeight: activa === PROGRESO ? 700 : 600,
                padding:"9px 14px", borderRadius:12, cursor:"pointer", background:"#fff",
                color: activa === PROGRESO ? T.primary : T.textSoft,
                border:`1.5px solid ${activa === PROGRESO ? T.primary : T.border}`,
                display:"inline-flex", alignItems:"center", gap:7,
                whiteSpace:"nowrap", flexShrink:0, transition:"all .15s",
              }}>
              <ListChecks size={15} strokeWidth={activa === PROGRESO ? 2.2 : 1.8} />
              Progreso
            </button>
            <div style={{ width:1, height:26, background:T.border, flexShrink:0 }} />
          </div>
        )}

        {SECCIONES.map((p, i) => {
          const act = p.clave === activa;
          const cambiaDeParte = i > 0 && SECCIONES[i - 1].parte !== p.parte;
          return (
            <div key={p.clave} style={{ display:"flex", alignItems:"center", gap:8 }}>
              {cambiaDeParte && <div style={{ width:1, height:26, background:T.border, flexShrink:0 }} />}
              <button onClick={() => setElegida(p.clave)} title={`Parte ${p.parte} · ${p.parteNombre}`}
                style={{
                  fontFamily:T.font, fontSize:12.5, fontWeight: act ? 700 : 600,
                  padding:"9px 14px", borderRadius:12, cursor:"pointer", background:"#fff",
                  color: act ? T.primary : T.textSoft,
                  border:`1.5px solid ${act ? T.primary : T.border}`,
                  display:"inline-flex", alignItems:"center", gap:7,
                  whiteSpace:"nowrap", flexShrink:0, transition:"all .15s",
                }}>
                <p.Icono size={15} strokeWidth={act ? 2.2 : 1.8} />
                {p.titulo}
              </button>
            </div>
          );
        })}

        {/* Documentos, siempre al final de la fila */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:1, height:26, background:T.border, flexShrink:0 }} />
          <button onClick={() => setElegida(DOCUMENTOS)} title="Documentación de la candidata"
            style={{
              fontFamily:T.font, fontSize:12.5, fontWeight: activa === DOCUMENTOS ? 700 : 600,
              padding:"9px 14px", borderRadius:12, cursor:"pointer", background:"#fff",
              color: activa === DOCUMENTOS ? T.primary : T.textSoft,
              border:`1.5px solid ${activa === DOCUMENTOS ? T.primary : T.border}`,
              display:"inline-flex", alignItems:"center", gap:7,
              whiteSpace:"nowrap", flexShrink:0, transition:"all .15s",
            }}>
            <Paperclip size={15} strokeWidth={activa === DOCUMENTOS ? 2.2 : 1.8} />
            Documentos
          </button>
        </div>

        {recorrido && (
          <button onClick={() => setElegida(RECORRIDO)} title="Etapas e historial"
            style={{
              fontFamily:T.font, fontSize:12.5, fontWeight: activa === RECORRIDO ? 700 : 600,
              padding:"9px 14px", borderRadius:12, cursor:"pointer", background:"#fff",
              color: activa === RECORRIDO ? T.primary : T.textSoft,
              border:`1.5px solid ${activa === RECORRIDO ? T.primary : T.border}`,
              display:"inline-flex", alignItems:"center", gap:7,
              whiteSpace:"nowrap", flexShrink:0, transition:"all .15s",
            }}>
            <Milestone size={15} strokeWidth={activa === RECORRIDO ? 2.2 : 1.8} />
            Recorrido
          </button>
        )}
      </div>

      {/* Contenido de la pestaña activa */}
      {activa === PROGRESO ? (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {PARTES.map(parte => (
            <div key={parte.n}>
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"0 0 10px" }}>
                <span style={{ fontSize:11, fontWeight:700, color:T.primary, background:T.lilac, padding:"3px 9px", borderRadius:20 }}>
                  PARTE {parte.n}
                </span>
                <div style={{ fontSize:13.5, fontWeight:700, color:T.textSoft }}>{parte.nombre}</div>
              </div>

              {/* Recorrido vertical: el hilo con su punto por sección */}
              <div style={{ position:"relative", paddingLeft:26 }}>
                <div style={{ position:"absolute", left:8, top:12, bottom:12, width:2, background:T.softLine }} />
                {estado.filter(s => s.parte === parte.n).map(sec => (
                  <div key={sec.clave} style={{ position:"relative", marginBottom:10 }}>
                    <div style={{
                      position:"absolute", left:-22, top:18, width:14, height:14, borderRadius:"50%",
                      background: sec.lista ? T.primary : "#fff",
                      border:`2px solid ${sec.lista ? T.primary : T.border}`,
                    }} />
                    <Link href={rutaEdicion(sec)} style={{ textDecoration:"none" }}>
                      <div style={{
                        background: sec.lista ? "#fff" : T.lilac, borderRadius:14, padding:"13px 16px",
                        boxShadow:T.shadow, display:"flex", alignItems:"center", gap:12,
                        border:`1px solid ${sec.lista ? "transparent" : T.border}`,
                      }}>
                        <sec.Icono size={17} style={{ color: sec.lista ? T.primary : T.textSoft, flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13.5, fontWeight:700, color:T.ink }}>{sec.titulo}</div>
                          <div style={{ fontSize:11.5, color:T.textSoft, marginTop:2 }}>
                            {sec.lista ? "Completa" : `${revision ? "Falta" : "Te falta"}: ${sec.faltan.map(f => f.label).join(", ")}`}
                          </div>
                        </div>
                        <span style={{
                          fontSize:10.5, fontWeight:700, padding:"4px 10px", borderRadius:20, flexShrink:0,
                          background: sec.lista ? T.greenBg : "#fff",
                          color:      sec.lista ? T.green   : T.primary,
                          border:     sec.lista ? "none"    : `1px solid ${T.primary3}`,
                        }}>
                          {sec.lista ? "Completa" : (revision ? "Completar" : "Continuar")}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : activa === RECORRIDO && recorrido ? (
        <div style={{ background:"#fff", borderRadius:18, padding:isMobile ? 16 : 22, boxShadow:T.shadow }}>
          <LineaDeTiempo etapa={recorrido.etapa} agencia={recorrido.agencia} historial={recorrido.historial} modo={modo} />
        </div>
      ) : activa === DOCUMENTOS ? (
        <PestanaDocumentos
          modo={modo}
          usuarioId={perfil?.id}
          puedeVer={puedeVerDocumentos}
          observaciones={observaciones}
          onObservacion={onObservacion}
        />
      ) : seccionActiva && (
        <div style={{ background:"#fff", borderRadius:18, padding:isMobile ? 16 : 22, boxShadow:T.shadow }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:T.ink }}>{seccionActiva.titulo}</div>
              <div style={{ fontSize:11.5, color:T.softText, marginTop:2 }}>
                Parte {seccionActiva.parte} · {seccionActiva.parteNombre}
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
              {revision && (
                <ObservarElemento usuarioId={perfil?.id} etiqueta="Observar sección" onCreada={onObservacion}
                  elemento={{ tipo:"seccion", parte:seccionActiva.parte, seccion:seccionActiva.id }} />
              )}
              {/* La candidata edita mientras no haya enviado la parte. Enviada,
                  sólo corrige lo observado, y eso se hace desde su perfil. */}
              {(revision || !enviadas[seccionActiva.parte]) ? (
                <Link href={rutaEdicion(seccionActiva)}
                  style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12.5, fontWeight:700, color:T.primary, textDecoration:"none", background:T.lilac, padding:"8px 14px", borderRadius:10, flexShrink:0 }}>
                  <Pencil size={13} /> Editar
                </Link>
              ) : seccionConCorreccion(observaciones, seccionActiva.parte, seccionActiva.id) ? (
                <a href="#correcciones"
                  style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12.5, fontWeight:700, color:"#fff", textDecoration:"none", background:T.amber, padding:"8px 14px", borderRadius:10, flexShrink:0 }}>
                  <Pencil size={13} /> Corregir
                </a>
              ) : null}
            </div>
          </div>
          {observacionesDe(observaciones, { parte:seccionActiva.parte, seccion:seccionActiva.id }).map(o => (
            <NotaObservacion key={o.id} obs={o} paraCandidata={!revision} />
          ))}
          {seccionActiva.campos.map(campo => (
            <div key={campo.name}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:220 }}>
                  <Campo campo={campo} perfil={perfil || {}} isMobile={isMobile} />
                </div>
                {revision && (
                  <ObservarElemento usuarioId={perfil?.id} compacto onCreada={onObservacion}
                    elemento={{ tipo:"campo", campo:campo.name }} />
                )}
              </div>
              {observacionesDe(observaciones, { campo:campo.name }).map(o => (
                <NotaObservacion key={o.id} obs={o} paraCandidata={!revision} />
              ))}
            </div>
          ))}
          {seccionActiva.clave === "1-personal" && <FotosCedula perfil={perfil} />}
        </div>
      )}
    </div>
  );
}
