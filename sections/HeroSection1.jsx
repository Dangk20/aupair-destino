"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckIcon, LockIcon, PlayCircleIcon, XIcon, SparklesIcon, StarIcon } from "lucide-react";

const sessions = [
  { label: "Bienvenida", status: "completed" },
  { label: "Sesión 1 · ¿Qué es ser Au Pair?", status: "completed" },
  { label: "Sesión 2 · Visa y documentación", status: "available" },
  { label: "Sesión 3 · Buscar familia anfitriona", status: "locked" },
  { label: "Sesión 4 · Entrevistas y contratos", status: "locked" },
];

const BulletIcon = ({ children }) => (
  <span className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 text-[#a0435f]">
    {children}
  </span>
);

const IconGrad = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 3 2 8l10 5 10-5-10-5z" fill="currentColor" opacity="0.15" stroke="currentColor"/>
    <path d="M2 8l10 5 10-5"/>
    <path d="M6 10.5V17c0 0 2 2.5 6 2.5s6-2.5 6-2.5v-6.5"/>
  </svg>
);

const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" opacity="0.12"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/>
    <polyline points="7 12.5 10.5 16 17 9"/>
  </svg>
);

const features = [
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>, title: "Aprende a tu ritmo", desc: "Contenido claro y práctico para avanzar con seguridad." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>, title: "Todo en un solo lugar", desc: "Sesiones, guías y recursos organizados para ti." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: "Acompañamiento real", desc: "Revisión personalizada antes de avanzar con la agencia." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Comunidad que te impulsa", desc: "Conecta con otras Au Pairs y comparte tu experiencia." },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, title: "Acceso durante tu proceso", desc: "Vuelve al contenido siempre que lo necesites." },
];

const avatars = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&q=80",
];

export default function HeroSection() {
  const [modalOpen,       setModalOpen]       = useState(false);
  const [sesiones,        setSesiones]        = useState([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [errorSesiones,   setErrorSesiones]   = useState(false);

  const abrirModal = async () => {
    setModalOpen(true); setErrorSesiones(false); setLoadingSesiones(true);
    try {
      const res = await fetch("/api/sesiones-public");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSesiones(data.sesiones || []);
    } catch { setErrorSesiones(true); setSesiones([]); }
    finally { setLoadingSesiones(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  return (
    <>
      {/* ════════════════════════════════════════
          HERO — MOBILE: columna imagen + texto
                 DESKTOP: fila lado a lado
      ════════════════════════════════════════ */}
      <section className="bg-[#fff8f9] relative w-full overflow-hidden">

        {/* Fondo puntitos */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
            <defs>
              <pattern id="dots-hero" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-hero)" />
          </svg>
        </div>

        {/* ══════════════════════
            MOBILE LAYOUT
        ══════════════════════ */}
        <div className="lg:hidden flex flex-col">

          {/* Imagen hero mobile — elipse/óvalo elegante */}
          <div className="relative w-full" style={{ height:"60vw", minHeight:240, maxHeight:380 }}>
            {/* Imagen con degradado abajo */}
            <img
              src="/assets/portada1.jpeg"
              alt="Au pair"
              className="w-full h-full object-cover object-[50%_30%]"
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=90"; }}
            />
            {/* Degradado suave abajo */}
            <div className="absolute inset-0"
                 style={{ background:"linear-gradient(to bottom, rgba(255,248,249,0) 40%, #fff8f9 100%)" }}/>
            {/* Degradado lateral izquierdo sutil */}
            <div className="absolute inset-0"
                 style={{ background:"linear-gradient(to right, rgba(255,248,249,0.15) 0%, transparent 60%)" }}/>

            {/* Badge flotante sobre la imagen */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#f0b8c4] px-3 py-1.5 rounded-full shadow-sm">
              <span className="text-sm">✈️</span>
              <span className="text-[9px] font-bold tracking-[2.5px] uppercase text-[#a0435f]">
                Tu próximo destino te espera
              </span>
            </div>

            {/* Social proof flotante — abajo derecha */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-lg border border-[#f0dde2] flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {avatars.slice(0,3).map((src,i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#2d1a22] leading-none">+2.094 chicas</p>
                <p className="text-[9px] text-[#9a6672] mt-0.5">ya iniciaron su destino</p>
              </div>
            </div>
          </div>

          {/* Contenido texto mobile */}
          <div className="px-6 pt-4 pb-10 flex flex-col items-start">

            {/* Título */}
            <h1 className="font-serif font-bold text-[#2d1a22] leading-[1.05] mb-4">
              <span className="block text-[40px]">Tu Destino</span>
              <span className="block relative italic text-[#a0435f] text-[40px]">
                Empieza aquí.
                <svg className="absolute -bottom-1 left-0 w-full" height="7"
                     viewBox="0 0 300 7" preserveAspectRatio="none">
                  <path d="M0 5 Q75 1 150 4 Q225 7 300 2"
                        stroke="#e8849a" strokeWidth="2" fill="none"
                        strokeLinecap="round" opacity="0.7"/>
                </svg>
              </span>
            </h1>

            {/* Descripción */}
            <p className="text-[14px] text-[#7a4a54] leading-relaxed mb-6">
              En Destino Au Pair te entrenamos paso a paso para que cumplas tus sueños de ser Au Pair USA. No estás sola, te guiamos en cada etapa.
            </p>

            {/* Bullets compactos */}
            <ul className="space-y-2.5 mb-7 w-full">
              {[
                { icon:<IconGrad/>,  text:"Entrenamiento completo para tu aplicación" },
                { icon:<IconDoc/>,   text:"Preparación para entrevistas con familias" },
                { icon:<IconCheck/>, text:"Acompañamiento hasta tu llegada a USA" },
              ].map((item,i) => (
                <li key={i} className="flex items-center gap-3 text-[13px] text-[#7a4a54]">
                  <BulletIcon>{item.icon}</BulletIcon>
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Botones mobile */}
            <div className="flex flex-col gap-3 w-full mb-6">
              <Link href="/register"
                className="flex items-center justify-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] transition text-white font-semibold rounded-2xl shadow-lg shadow-[#a0435f]/25 text-[15px] py-4 w-full">
                Comenzar mi Destino →
              </Link>
              <button type="button" onClick={abrirModal}
                className="flex items-center justify-center gap-2 border-2 border-[#a0435f] text-[#a0435f] font-semibold rounded-2xl hover:bg-[#fef0f3] transition text-[15px] py-4 w-full">
                Ver el programa
              </button>
            </div>

            {/* Rating mobile */}
            <div className="flex items-center gap-3 pt-5 border-t border-[#f0dde2] w-full">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_,i)=>(
                  <StarIcon key={i} size={14} fill="#e8849a" className="text-[#e8849a]" />
                ))}
              </div>
              <div>
                <span className="text-[14px] font-bold text-[#2d1a22]">4.9</span>
                <span className="text-[12px] text-[#9a6672]">/5 · Valoración del programa</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════
            DESKTOP LAYOUT (lg+) — idéntico al original
        ══════════════════════ */}
        {/* Círculo fotográfico — solo visible lg+ */}
        <div
          className="hidden lg:block absolute overflow-hidden shadow-2xl shadow-[#a0435f]/15 pointer-events-none"
          style={{
            width:        "clamp(660px, 60vw, 1150px)",
            height:       "clamp(760px, 60vw, 1260px)",
            borderRadius: "70%",
            top:          "clamp(-50px, -13vw, -70px)",
            right:        "-115px",
            zIndex:       0,
          }}
        >
          <img
  src="/assets/portada1.jpeg"
  alt="Au pair"
  className="w-full h-full object-cover scale-105"
  style={{ objectPosition: "50% 80%" }}
  onError={e => { e.target.src = "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=90"; }}
/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f9]/20 via-transparent to-transparent" />
        </div>

        {/* Contenedor desktop */}
        <div
          className="hidden lg:flex relative z-10 w-full
                     px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28
                     flex-col lg:flex-row items-center"
          style={{ minHeight:"calc(100vh - 72px)" }}
        >
          {/* Izquierda — texto desktop */}
          <div className="w-full lg:w-[46%] xl:w-[44%] 2xl:w-[42%] flex flex-col items-start
                          pt-20 pb-12 lg:pt-24 lg:pb-14 xl:pt-28 xl:pb-16 2xl:pt-32 2xl:pb-20">
            {/* Badge */}
            <div className="flex items-center gap-2 bg-[#fce8ed] border border-[#f0b8c4] px-3 py-1.5 rounded-full mb-3 xl:mb-4">
              <span className="text-[#a0435f]">✈️</span>
              <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-[#a0435f]">
                Tu próximo destino te espera
              </span>
            </div>

            {/* Título */}
            <h1 className="font-serif font-bold text-[#2d1a22] leading-[1.05] mb-5 xl:mb-7">
              <span className="block text-[46px] md:text-[58px] lg:text-[54px] xl:text-[70px] 2xl:text-[84px]">Tu Destino</span>
              <span className="block relative italic text-[#a0435f] text-[46px] md:text-[58px] lg:text-[44px] xl:text-[60px] 2xl:text-[64px]">
                Empieza aquí.
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
                  <path d="M0 6 Q75 1 150 5 Q225 8 300 3" stroke="#e8849a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
                </svg>
              </span>
            </h1>

            {/* Descripción */}
            <p className="text-[15px] xl:text-[17px] 2xl:text-[18px] text-[#7a4a54] leading-relaxed mb-7 xl:mb-9 max-w-[440px] xl:max-w-[520px] 2xl:max-w-[560px]">
              En Destino Au Pair te entrenamos paso a paso para que cumplas tus sueños de ser Au Pair USA. No estás sola, te guiamos en cada etapa.
            </p>

            {/* Bullets */}
            <ul className="space-y-3 xl:space-y-4 mb-8 xl:mb-10">
              {[
                { icon:<IconGrad/>,  text:"Entrenamiento completo para tu aplicación Au Pair" },
                { icon:<IconDoc/>,   text:"Preparación para entrevistas con familias anfitrionas" },
                { icon:<IconCheck/>, text:"Acompañamiento hasta tu llegada a USA y más allá" },
              ].map((item,i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] xl:text-[15px] 2xl:text-[16px] text-[#7a4a54]">
                  <BulletIcon>{item.icon}</BulletIcon>
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Botones */}
            <div className="flex items-center gap-3 mb-9 flex-wrap">
              <Link href="/register"
                className="flex items-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] transition text-white font-semibold rounded-xl shadow-lg shadow-[#a0435f]/25 text-[14px] xl:text-[16px] px-8 xl:px-10 py-4">
                Comenzar mi Destino →
              </Link>
              <button type="button" onClick={abrirModal}
                className="flex items-center gap-1.5 border-2 border-[#a0435f] text-[#a0435f] font-semibold rounded-xl hover:bg-[#fef0f3] transition text-[14px] xl:text-[16px] px-7 xl:px-9 py-4">
                Ver el programa
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-6 border-t border-[#f0dde2] w-full">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((src,i) => (
                    <div key={i} className="w-9 h-9 xl:w-11 xl:h-11 rounded-full border-2 border-white overflow-hidden shadow-sm">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[13px] xl:text-[15px] font-semibold text-[#2d1a22]">+2.094 chicas ya iniciaron su destino</p>
                  <p className="text-[11px] xl:text-[13px] text-[#9a6672]">que ya están preparando su aventura</p>
                </div>
              </div>
              <div className="hidden sm:block border-l border-[#f0dde2] pl-6">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_,i) => <StarIcon key={i} size={14} fill="#e8849a" className="text-[#e8849a]" />)}
                </div>
                <p className="text-[13px] xl:text-[15px] font-semibold text-[#2d1a22]">4.9<span className="text-[#9a6672] font-normal">/5</span></p>
                <p className="text-[10px] xl:text-[12px] text-[#9a6672]">Valoración del programa</p>
              </div>
            </div>
          </div>

          {/* Derecha — mockup + testimonio desktop */}
          <div className="flex-1 relative self-stretch">
            <div className="absolute bg-white rounded-3xl overflow-hidden border border-[#f0dde2] shadow-2xl shadow-[#a0435f]/20 z-20"
                 style={{ width:"clamp(380px, 40vw, 660px)", top:"45%", right:"-5%" }}>
              <div className="flex bg-[#a0435f] px-4 py-4 items-center gap-3">
                <img src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" className="w-10 h-10 brightness-0 invert"/>
                <div>
                  <p className="text-white text-[13px] font-bold leading-none tracking-wide">Destino</p>
                  <p className="text-white/50 text-[9px] tracking-[2px] uppercase mt-0.5">Au Pair</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-32 bg-[#a0435f] px-2 py-3 flex flex-col gap-1 shrink-0">
                  {["Mi ruta","Sesiones","Comunidad","Recursos","Plantillas","Certificados"].map((item,i) => (
                    <div key={i} className={`text-[11px] px-3 py-2 rounded-xl ${i===0?"bg-white text-[#a0435f] font-semibold":i>=4?"text-white/25":"text-white/60"}`}>
                      {i>=4&&<LockIcon size={8} className="inline mr-1 opacity-40"/>}{item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 bg-[#fffcfd]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[13px] font-bold text-[#2d1a22]">Hola, Jennifer! 👋</p>
                      <p className="text-[11px] text-[#9a6672] mt-0.5">Estás en la Sesión 2 de 7</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#9a6672]">37% completado</p>
                      <div className="w-20 h-2 bg-[#fce8ed] rounded-full mt-1">
                        <div className="h-full w-[37%] bg-gradient-to-r from-[#a0435f] to-[#e8849a] rounded-full"/>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {sessions.map((s,i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${s.status==="available"?"border-[#e8849a] bg-white shadow-sm":s.status==="completed"?"border-[#f0dde2] bg-[#fff8f9]":"border-[#f5e8eb] opacity-40"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.status==="completed"?"bg-[#fce8ed]":s.status==="available"?"bg-[#a0435f]":"bg-[#f5e8eb]"}`}>
                          {s.status==="completed"&&<CheckIcon size={9} className="text-[#a0435f]"/>}
                          {s.status==="available"&&<PlayCircleIcon size={10} className="text-white"/>}
                          {s.status==="locked"&&<LockIcon size={8} className="text-[#d0a0a8]"/>}
                        </div>
                        <p className={`text-[11px] truncate ${s.status==="locked"?"text-[#c0909a]":"text-[#2d1a22] font-medium"}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{val:"2/8",label:"Sesiones"},{val:"12 min",label:"Tiempo"}].map((s,i)=>(
                      <div key={i} className="bg-[#fff0f3] rounded-xl p-3 text-center">
                        <p className="text-[15px] font-bold text-[#2d1a22]">{s.val}</p>
                        <p className="text-[10px] text-[#9a6672] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bg-white rounded-2xl shadow-xl border border-[#f0dde2] p-4 z-20"
                 style={{ width:"clamp(210px, 18vw, 290px)", bottom:"6%", left:"4%" }}>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_,i)=><StarIcon key={i} size={13} fill="#e8849a" className="text-[#e8849a]"/>)}
              </div>
              <p className="text-[13px] text-[#2d1a22] italic leading-relaxed mb-3">
                "Este programa me dio la claridad y la confianza que necesitaba para llegar a USA."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#f0dde2] shrink-0">
                  <img src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&q=80" alt="" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#a0435f]">María P.</p>
                  <p className="text-[11px] text-[#9a6672]">Au Pair en USA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES STRIP
      ════════════════════════════════════════ */}
      <section className="bg-[#fff8f9] border-t border-[#f0dde2] py-8 xl:py-14 w-full">
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 xl:gap-12 2xl:gap-16">
            {features.map((f,i) => (
              <div key={i} className="flex flex-col items-start gap-2.5">
                <div className="w-9 h-9 xl:w-12 xl:h-12 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center text-[#a0435f]">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[12px] xl:text-[15px] font-bold text-[#2d1a22] leading-snug mb-1">{f.title}</p>
                  <p className="text-[11px] xl:text-[14px] text-[#9a6672] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODAL SESIONES ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={()=>setModalOpen(false)}/>
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-[#a0435f]/20 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0dde2]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon size={14} className="text-[#e8849a]"/>
                  <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#e8849a]">El programa completo</p>
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#2d1a22]">✈️ Tus 8 sesiones Au Pair</h3>
              </div>
              <button type="button" onClick={()=>setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                <XIcon size={14} className="text-[#a0435f]"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingSesiones ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : errorSesiones ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#9a6672] mb-3">No se pudieron cargar las sesiones.</p>
                  <button type="button" onClick={abrirModal} className="text-[12px] text-[#a0435f] hover:underline">Intentar de nuevo</button>
                </div>
              ) : sesiones.length===0 ? (
                <p className="text-center text-[13px] text-[#9a6672] py-8">No hay sesiones disponibles.</p>
              ) : (
                <div className="space-y-3">
                  {sesiones.map((s,i) => (
                    <div key={s.id} className="flex items-start gap-3 p-4 rounded-2xl border border-[#f0dde2] bg-[#fff8f9] hover:border-[#e8b0bc] hover:bg-white transition">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-[14px] ${i===0?"bg-[#a0435f] text-white":"bg-[#fce8ed] text-[#a0435f]"}`}>{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-[13px] font-semibold text-[#2d1a22]">{s.titulo}</p>
                          {(s.es_gratis===1||s.es_gratis===true) && (
                            <span className="text-[9px] bg-[#e8f0e0] text-[#5a8a3a] font-bold px-2 py-0.5 rounded-full uppercase">Gratis</span>
                          )}
                        </div>
                        {s.descripcion && <p className="text-[12px] text-[#9a6672] leading-relaxed">{s.descripcion}</p>}
                      </div>
                      {!(s.es_gratis===1||s.es_gratis===true) && <LockIcon size={13} className="text-[#c0909a] shrink-0 mt-1"/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-[#f0dde2] bg-[#fff8f9]">
              <p className="text-[12px] text-[#9a6672] text-center mb-3">La primera sesión es gratis 🎉 — Da el primer paso sin compromiso.</p>
              <Link href="/register" onClick={()=>setModalOpen(false)}
                className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white font-medium text-[14px] py-3.5 rounded-2xl transition shadow-lg shadow-[#a0435f]/20 flex items-center justify-center gap-2">
                Comenzar gratis →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}