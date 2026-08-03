"use client";
// app/pago/page.jsx — Rediseño Panel Candidata (borgoña).
// Activar acompañamiento: resumen + incluye + CÓDIGO DE DESCUENTO + medio de pago.
// El código ancla la comisión al asociado; "Continuar" registra la venta (/api/ventas).

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check, Tag, ShieldCheck, ArrowLeft, ArrowRight, X,
  Users, ClipboardCheck, Plane, MessageCircle, BookMarked, Lock,
} from "lucide-react";
import { T } from "@/lib/tema";

const WHATSAPP_NUMBER = "13478886836";
const PRECIO_REGULAR  = 35;

const INCLUYE = [
  { icon: Users,          text: "Presentación de tu perfil a agencias aliadas" },
  { icon: ClipboardCheck, text: "Evaluación y preparación de tu perfil" },
  { icon: Plane,          text: "Acompañamiento en visa y viaje" },
  { icon: MessageCircle,  text: "Asesora personal por WhatsApp" },
  { icon: BookMarked,     text: "Acceso de por vida a tu curso" },
];

const METODOS = [
  { nombre:"Nequi",         emoji:"💜" },
  { nombre:"Daviplata",     emoji:"❤️" },
  { nombre:"Bancolombia",   emoji:"💛" },
  { nombre:"Transferencia", emoji:"🔑" },
];

export default function PagoPage() {
  const router = useRouter();
  const [codigo,          setCodigo]          = useState("");
  const [codigoAplicado,  setCodigoAplicado]  = useState(false);
  const [precioConCodigo, setPrecioConCodigo] = useState(29);
  const [validando,       setValidando]       = useState(false);
  const [errorCodigo,     setErrorCodigo]     = useState("");
  const [metodo,          setMetodo]          = useState("Nequi");
  const [registrando,     setRegistrando]     = useState(false);
  const [enviado,         setEnviado]         = useState(false);

  const precioFinal = codigoAplicado ? precioConCodigo : PRECIO_REGULAR;

  const aplicarCodigo = async () => {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    setValidando(true); setErrorCodigo("");
    try {
      // Código promo (nuestro modelo: descuento + asociado + comisión)
      const res  = await fetch("/api/codigos-promo/validar", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ codigo:c }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPrecioConCodigo(Number(data.precio_final));
        setCodigoAplicado(true);
        await fetch("/api/codigos-promo/usar", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ codigo:c }) }).catch(()=>{});
      } else {
        setErrorCodigo(data.error || "Código no válido. Verifica e intenta de nuevo.");
      }
    } catch {
      setErrorCodigo("No pudimos validar el código. Intenta de nuevo.");
    }
    setValidando(false);
  };

  const waLink = () => {
    const txt = codigoAplicado
      ? `¡Hola! Tengo el código ${codigo.toUpperCase()} y quiero activar mi acompañamiento en Destino Au Pair por $${precioFinal} USD (${metodo}). ¿Cómo procedo?`
      : `¡Hola! Quiero activar mi acompañamiento en Destino Au Pair por $${precioFinal} USD (${metodo}). ¿Cómo procedo?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
  };

  // Registra la intención de pago (venta 'pendiente') antes de abrir WhatsApp.
  const continuar = async () => {
    setRegistrando(true);
    try {
      await fetch("/api/ventas", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ codigo: codigoAplicado ? codigo.trim().toUpperCase() : null }),
      });
    } catch { /* no bloquear el paso a WhatsApp */ }
    finally {
      setRegistrando(false);
      setEnviado(true);
      window.open(waLink(), "_blank", "noopener,noreferrer");
    }
  };

  // Vista tras enviar la solicitud (se abrió WhatsApp en otra pestaña).
  if (enviado) return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 18px" }}>
      <div style={{ maxWidth:440, textAlign:"center" }}>
        <div style={{ width:76, height:76, borderRadius:22, background:T.gradIcon, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", animation:"floaty 4s ease-in-out infinite" }}><Check size={34}/></div>
        <style>{`@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
        <h2 style={{ fontSize:22, fontWeight:700, color:T.ink, margin:"0 0 8px" }}>Estamos procesando tu solicitud</h2>
        <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6, margin:"0 0 8px" }}>
          Te abrimos WhatsApp para coordinar tu pago{codigoAplicado?` con el código ${codigo.toUpperCase()}`:""}. En cuanto lo confirmemos, se activará tu acompañamiento completo — te avisaremos aquí y por correo.
        </p>
        <p style={{ fontSize:12.5, color:T.textSoft, margin:"0 0 22px" }}>¿No se abrió WhatsApp? <a href={waLink()} target="_blank" rel="noopener noreferrer" style={{ color:T.primary, fontWeight:700 }}>Ábrelo aquí</a>.</p>
        <button onClick={()=>router.push("/dashboard")} style={{ background:T.primary, color:"#fff", border:"none", borderRadius:14, padding:"14px 26px", fontFamily:T.font, fontWeight:700, fontSize:14.5, cursor:"pointer", boxShadow:"0 10px 22px rgba(160,67,95,.28)", display:"inline-flex", alignItems:"center", gap:8 }}>
          <ArrowLeft size={17}/> Volver al inicio
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, padding:"22px 18px 60px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <Link href="/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:6, color:T.primary, fontSize:13, fontWeight:600, textDecoration:"none", marginBottom:16 }}>
          <ArrowLeft size={15}/> Volver al inicio
        </Link>

        <div style={{ background:"#fff", borderRadius:22, boxShadow:"0 20px 50px rgba(160,67,95,.12)", overflow:"hidden" }}>
          {/* encabezado */}
          <div style={{ background:T.gradHero, color:"#fff", padding:"22px 24px" }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:".1em", opacity:.9 }}>ACTIVAR ACOMPAÑAMIENTO</div>
            <div style={{ fontSize:19, fontWeight:700, marginTop:5, lineHeight:1.25 }}>Tu proceso completo hacia la agencia</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:14 }}>
              {codigoAplicado && <div style={{ fontSize:16, textDecoration:"line-through", opacity:.7 }}>${PRECIO_REGULAR}</div>}
              <div style={{ fontSize:34, fontWeight:800 }}>${precioFinal}</div>
              <div style={{ fontSize:12, opacity:.9 }}>USD · pago único</div>
            </div>
          </div>

          <div style={{ padding:24 }}>
            {/* incluye */}
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Incluye todo tu proceso:</div>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              {INCLUYE.map((it,i) => {
                const Ic = it.icon;
                return (
                  <div key={i} style={{ display:"flex", gap:11, alignItems:"center" }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:T.lilac, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic size={16}/></div>
                    <div style={{ fontSize:13, color:T.text }}>{it.text}</div>
                  </div>
                );
              })}
            </div>

            {/* código de descuento */}
            <div style={{ height:1, background:T.border, margin:"18px 0" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9 }}>
              <Tag size={15} style={{ color:T.primary }}/>
              <div style={{ fontSize:13, fontWeight:700, color:T.text }}>¿Tienes un código de descuento?</div>
            </div>
            {codigoAplicado ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:T.greenBg, border:"1px solid #BEEAD3", borderRadius:12, padding:"11px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"#0E8F5E", fontWeight:600, fontSize:13 }}>
                  <Check size={15}/> Código <b>{codigo.toUpperCase()}</b> aplicado · ${precioConCodigo} USD
                </div>
                <button onClick={()=>{ setCodigoAplicado(false); setCodigo(""); setErrorCodigo(""); }} style={{ background:"none", border:"none", color:T.textSoft, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}><X size={13}/>Quitar</button>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={codigo} onChange={e=>{ setCodigo(e.target.value.toUpperCase()); setErrorCodigo(""); }}
                    onKeyDown={e=>e.key==="Enter"&&aplicarCodigo()}
                    placeholder="INGRESA TU CÓDIGO"
                    style={{ flex:1, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"11px 14px", fontSize:13, fontWeight:700, color:T.text, fontFamily:T.font, textTransform:"uppercase", outline:"none", background:"#fff" }}/>
                  <button onClick={aplicarCodigo} disabled={!codigo.trim()||validando}
                    style={{ background:T.primary, color:"#fff", border:"none", borderRadius:12, padding:"0 18px", fontFamily:T.font, fontWeight:700, fontSize:13, cursor:"pointer", opacity:(!codigo.trim()||validando)?.5:1 }}>
                    {validando?"…":"Aplicar"}
                  </button>
                </div>
                {errorCodigo && <div style={{ fontSize:11.5, color:"#C0392B", marginTop:7 }}>{errorCodigo}</div>}
              </>
            )}

            {/* medio de pago */}
            <div style={{ fontSize:12, fontWeight:700, color:T.textSoft, margin:"18px 0 9px" }}>Elige tu medio de pago</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {METODOS.map(m => {
                const on = metodo===m.nombre;
                return (
                  <button key={m.nombre} onClick={()=>setMetodo(m.nombre)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:on?T.lilac:"#fff", border:`1.5px solid ${on?T.primary:T.border}`, borderRadius:12, padding:"11px 13px", fontFamily:T.font, cursor:"pointer" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16 }}>{m.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:on?T.ink:T.text }}>{m.nombre}</span>
                    </span>
                    {on && <Check size={16} style={{ color:T.primary }}/>}
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <button onClick={continuar} disabled={registrando}
              style={{ marginTop:18, width:"100%", background:T.primary, color:"#fff", border:"none", borderRadius:14, padding:15, fontFamily:T.font, fontWeight:700, fontSize:14.5, cursor:"pointer", boxShadow:"0 10px 22px rgba(160,67,95,.28)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {registrando ? <><div style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"dapspin 1s linear infinite" }}/>Registrando…</> : <>Continuar por WhatsApp <ArrowRight size={17}/></>}
            </button>
            <style>{`@keyframes dapspin{to{transform:rotate(360deg)}}`}</style>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:14, color:T.textSoft, fontSize:11.5 }}>
              <ShieldCheck size={14} style={{ color:T.primary }}/> Coordinamos y confirmamos tu pago de forma segura.
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:8, color:T.textSoft, fontSize:11 }}>
              <Lock size={12}/> Activamos tu acceso en menos de 24 horas hábiles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
