"use client";
// app/dashboard/perfil/page.jsx — "Cuéntanos de ti" (rediseño borgoña).
// La candidata completa su perfil. La EVALUACIÓN (revisión del equipo) es el
// paso siguiente, no una acción suya — antes estaban mezclados y confundía.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Check, ArrowRight, User, Sparkles, Heart, Baby, Plane, Briefcase, ClipboardCheck, ChevronRight,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema-candidata";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";

import {
  PARTE1, seccionCompleta as seccionCompletaDe, progresoParte,
} from "@/lib/campos-perfil";

// Los íconos y títulos de esta pantalla; los campos obligatorios vienen de
// lib/campos-perfil.js, para que este progreso y la validación del formulario
// no puedan discrepar (antes cada uno usaba su propio criterio).
const ICONOS = [User, ClipboardCheck, Briefcase, Heart, Baby, Plane];
const TITULOS = [
  "Datos personales", "Habilidades y requisitos", "Tu situación actual",
  "Salud", "Experiencia con niños", "Visas y antecedentes",
];
const SECCIONES = PARTE1.map((s,i) => ({ ...s, icon:ICONOS[i], titulo:TITULOS[i] }));

const seccionCompleta = (p, s) => !!p && seccionCompletaDe(s, p);
const progresoAgencia = (p) => (p ? progresoParte(2, p) : 0);

export default function CuentanosDeTiPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const gate = useAccessGate("perfil");
  const [user,setUser]=useState(null); const [perfil,setPerfil]=useState(null); const [loading,setLoading]=useState(true);

  useEffect(() => {
    const safe = (p,fb=null) => p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([ safe(fetch("/api/auth/me"),{user:null}), safe(fetch("/api/dashboard/perfil"),null) ])
      .then(([me,perf])=>{ setUser(me?.user||null); setPerfil(perf?.perfil||null); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  if (loading || gate.loading) return <GateLoading/>;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="Tu perfil de candidata"/>;

  const completas = SECCIONES.filter(s => seccionCompleta(perfil, s)).length;
  const total = SECCIONES.length;
  const pct = Math.round(completas/total*100);          // parte 1
  const listo = completas === total;                    // parte 1 completa → desbloquea parte 2
  const pctAgencia = progresoAgencia(perfil);           // parte 2
  const overall = Math.round((pct + pctAgencia) / 2);   // progreso TOTAL (ambas partes)
  const perfilTotalCompleto = listo && pctAgencia === 100;
  const boton = perfilTotalCompleto ? "Revisar mi perfil" : (completas>0||pctAgencia>0) ? "Continuar mi perfil" : "Empezar a contarte";

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile?"16px 16px 90px":"28px 30px", maxWidth:860, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", gap:18 }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ fontSize:isMobile?21:26, fontWeight:700, color:T.text, lineHeight:1.1 }}>Cuéntanos de ti</div>
          <div style={{ fontSize:13.5, color:T.textSoft, marginTop:3 }}>Completa tu perfil para que podamos presentarte ante una agencia</div>
        </div>
        <button style={{ width:42, height:42, borderRadius:12, background:"#fff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, cursor:"pointer", position:"relative", flexShrink:0 }}>
          <Bell size={19}/><span style={{ position:"absolute", top:11, right:12, width:7, height:7, borderRadius:"50%", background:T.primary3 }}/>
        </button>
      </div>

      {/* hero progreso */}
      <div style={{ borderRadius:22, padding:24, background:T.gradHero, color:"#fff", boxShadow:T.shadowHero }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:".12em", opacity:.85 }}>TU PERFIL</div>
            <div style={{ fontSize:20, fontWeight:700, marginTop:6 }}>{perfilTotalCompleto ? "¡Tu perfil está completo! 🎉" : "Cuéntanos quién eres"}</div>
            <div style={{ fontSize:13, opacity:.92, marginTop:4, maxWidth:"46ch", lineHeight:1.5 }}>
              {perfilTotalCompleto
                ? "Nuestro equipo revisará tu perfil (1–3 días hábiles) y lo preparará para presentarlo a una agencia aliada."
                : "Tu perfil tiene dos partes. Complétalas ambas para que podamos presentarte ante las agencias. Puedes guardar y continuar cuando quieras."}
            </div>
          </div>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <div style={{ fontSize:34, fontWeight:800 }}>{overall}%</div>
            <div style={{ fontSize:12, opacity:.85 }}>Parte 1 y 2</div>
          </div>
        </div>
        <div style={{ height:9, background:"rgba(255,255,255,.25)", borderRadius:20, overflow:"hidden", marginTop:16 }}>
          <div style={{ height:"100%", width:`${overall}%`, background:"#fff", borderRadius:20, transition:"width .5s" }}/>
        </div>
        <button onClick={()=>router.push(listo && pctAgencia<100 ? "/dashboard/perfil/agencia" : "/dashboard/perfil/evaluacion")} style={{ marginTop:16, background:"#fff", color:T.primary, border:"none", borderRadius:13, padding:"13px 22px", fontFamily:T.font, fontWeight:700, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}>
          {boton} <ArrowRight size={17}/>
        </button>
      </div>

      {/* PARTE 1 — secciones */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.primary, background:T.lilac, padding:"3px 9px", borderRadius:20 }}>PARTE 1</span>
        <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Cuéntanos de ti</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)", gap:12 }}>
        {SECCIONES.map(s => {
          const ok = seccionCompleta(perfil, s), Ic = s.icon;
          return (
            <button key={s.id} onClick={()=>router.push("/dashboard/perfil/evaluacion")}
              style={{ background:"#fff", borderRadius:16, padding:14, display:"flex", alignItems:"center", gap:12, boxShadow:T.shadow, border:`1.5px solid ${ok?T.primary3:"transparent"}`, cursor:"pointer", fontFamily:T.font, textAlign:"left" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:ok?T.primary:T.lilac, color:ok?"#fff":T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {ok ? <Check size={20}/> : <Ic size={19}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:14, color:T.text }}>{s.titulo}</div>
                <div style={{ fontSize:12, fontWeight:600, color:ok?T.primary:T.textSoft }}>{ok?"Completa":"Pendiente"}</div>
              </div>
              <ChevronRight size={16} style={{ color:T.softText, flexShrink:0 }}/>
            </button>
          );
        })}
      </div>

      {/* PARTE 2 — perfil con la agencia */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
        <span style={{ fontSize:11, fontWeight:700, color:T.primary, background:T.lilac, padding:"3px 9px", borderRadius:20 }}>PARTE 2</span>
        <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Perfil con la agencia</div>
      </div>
      <div style={{ background:"#fff", borderRadius:18, padding:18, boxShadow:T.shadow, opacity: listo?1:.6, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ width:42, height:42, borderRadius:12, background: pctAgencia===100?T.primary:T.lilac, color: pctAgencia===100?"#fff":T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {pctAgencia===100 ? <Check size={20}/> : <User size={19}/>}
        </div>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:14.5, fontWeight:700, color:T.text }}>Tu perfil para presentarte a las familias</div>
          <div style={{ fontSize:12.5, color:T.textSoft, marginTop:3, lineHeight:1.5 }}>
            {listo
              ? "El perfil detallado (foto, bio, experiencia, referencias…) que la agencia muestra a las familias."
              : "Completa primero la Parte 1 para desbloquear esta sección."}
          </div>
        </div>
        <button onClick={()=> listo ? router.push("/dashboard/perfil/agencia") : router.push("/dashboard/perfil/evaluacion")}
          style={{ background: listo?T.primary:"#fff", color: listo?"#fff":T.primary, border: listo?"none":`1.5px solid ${T.border}`, borderRadius:12, padding:"11px 20px", fontFamily:T.font, fontWeight:700, fontSize:13.5, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {listo ? <>{pctAgencia===100?"Revisar":pctAgencia>0?"Continuar":"Empezar"} <ArrowRight size={16}/></> : <>Completa la Parte 1 primero</>}
        </button>
      </div>

      {/* qué sigue después */}
      <div style={{ background:T.lilac, borderRadius:18, padding:18, display:"flex", gap:13, alignItems:"flex-start" }}>
        <div style={{ width:38, height:38, borderRadius:12, background:"#fff", color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Sparkles size={18}/></div>
        <div>
          <div style={{ fontSize:13.5, fontWeight:700, color:T.ink }}>¿Qué pasa cuando lo completes?</div>
          <div style={{ fontSize:12.5, color:T.textSoft, marginTop:3, lineHeight:1.5 }}>
            Nuestro equipo <b style={{ color:T.ink }}>evalúa tu perfil</b> (1–3 días) y, si todo está en orden, lo <b style={{ color:T.ink }}>presenta a una agencia aliada</b>. Puedes seguir tu avance en <Link href="/dashboard/proceso" style={{ color:T.primary, fontWeight:700 }}>Mi Destino</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
