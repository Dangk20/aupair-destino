"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon, CheckIcon, LockIcon, PlayCircleIcon, GlobeIcon, UsersIcon, StarIcon, XIcon, SparklesIcon } from "lucide-react";

const sessions = [
  { label: "Bienvenida", status: "completed" },
  { label: "Sesión 1 · ¿Qué es ser Au Pair?", status: "completed" },
  { label: "Sesión 2 · Visa y documentación", status: "available", progress: 60 },
  { label: "Sesión 3 · Buscar familia anfitriona", status: "locked" },
  { label: "Sesión 4 · Entrevistas y contratos", status: "locked" },
];


export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sesiones, setSesiones] = useState([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);

  const abrirModal = async () => {
    setModalOpen(true);
    if (sesiones.length === 0) {
      setLoadingSesiones(true);
      try {
        const res = await fetch("/api/sesiones-public");
        const data = await res.json();
        setSesiones(data.sesiones || []);
      } catch {
        setSesiones([]);
      } finally {
        setLoadingSesiones(false);
      }
    }
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  return (
    <>
      <div className="min-h-screen bg-[#fff8f9] overflow-hidden">

        {/* BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#e8849a]/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#a0435f]/5 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

    
        {/* HERO BODY */}
        <div className="relative max-w-6xl mx-auto px-8 pt-14 pb-10 flex flex-col lg:flex-row items-center gap-14">

          {/* LEFT */}
          <div className="w-full lg:w-[46%] flex flex-col items-start">
            <div className="flex items-center gap-2 bg-[#fef0f3] border border-[#f0c8d0] rounded-full px-3 py-1.5 mb-7">
              <span className="w-2 h-2 rounded-full bg-[#e8849a] animate-pulse" />
              <span className="text-[11px] text-[#a0435f] font-medium tracking-wide">Nuevo — Cursos actualizados 2026</span>
            </div>

            <h1 className="font-serif text-[46px] md:text-[54px] font-bold text-[#2d1a22] leading-[1.1] mb-5">
              Tu camino<br />Au Pair,{" "}
              <span className="relative inline-block">
                <span className="italic text-[#a0435f]">paso a paso</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                  <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="#e8849a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </span>
              <br />desde cero.
            </h1>

            <p className="text-[15px] text-[#7a4a54] leading-relaxed mb-7 max-w-[400px]">
              Aprende todo lo que necesitas para convertirte en Au Pair: visa, entrevistas,
              llegada y adaptación. Cada sesión se desbloquea cuando completas la anterior.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Sesiones progresivas — cada etapa desbloquea la siguiente",
                "Acceso durante tu proceso.",
                "Comunidad privada al completar el programa",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[13.5px] text-[#7a4a54]">
                  <span className="w-5 h-5 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                    <CheckIcon size={10} className="text-[#a0435f]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 mb-10">
              <Link href="/register"
                className="bg-[#a0435f] hover:bg-[#8a3550] transition text-white text-[14px] font-medium px-7 py-3.5 rounded-xl shadow-lg shadow-[#a0435f]/20">
                Comenzar mi viaje
              </Link>
              <button onClick={abrirModal}
                className="flex items-center gap-1.5 border border-[#e8b0bc] text-[#a0435f] text-[14px] px-5 py-3.5 rounded-xl hover:bg-[#fef0f3] transition">
                Ver cursos <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>

          {/* RIGHT — mockup */}
          <div className="w-full lg:w-[54%] relative pb-8">
            <div className="hidden lg:flex absolute -left-6 top-8 z-20 items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-[#a0435f]/8 border border-[#f0dde2]">
              <div className="w-8 h-8 rounded-full bg-[#fce8ed] flex items-center justify-center">
                <CheckIcon size={14} className="text-[#a0435f]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#2d1a22]">Sesión completada</p>
                <p className="text-[10px] text-[#9a6672]">¡Sigue así, vas genial! 🎉</p>
              </div>
            </div>

            <div className="hidden lg:flex absolute -right-4 bottom-14 z-20 flex-col gap-1 bg-[#2d1a22] rounded-2xl px-4 py-3 shadow-xl">
              <p className="text-[10px] text-white/60">Próxima sesión</p>
              <p className="text-[12px] font-semibold text-white">Buscar familia anfitriona</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8849a]" />
                <span className="text-[10px] text-[#e8849a]">Se desbloquea al completar S2</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#f0dde2] shadow-2xl shadow-[#a0435f]/10 bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fff0f3] border-b border-[#f0dde2]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <div className="flex-1 mx-3 bg-[#fce8ed] rounded-full h-4 flex items-center px-3">
                  <span className="text-[#9a6672] text-[10px]">app.destinoaupair.com/mis-sesiones</span>
                </div>
              </div>
              <div className="flex">
                <div className="w-40 bg-[#2d1a22] p-3 hidden md:flex flex-col gap-1 shrink-0">
                  <div className="bg-white/10 rounded-lg p-2 mb-4 text-center">
                    <p className="font-serif text-[11px] text-white font-bold tracking-wide">Destino</p>
                    <p className="text-[7px] text-white/40 tracking-[2px] uppercase">Au Pair</p>
                  </div>
                  {["Mi ruta", "Sesiones", "Comunidad", "Recursos", "Certificado"].map((item, i) => (
                    <div key={i} className={`text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer ${
                      i === 0 ? "bg-[#a0435f] text-white font-medium" : i >= 3 ? "text-white/25" : "text-white/50"}`}>
                      {i >= 3 && <LockIcon size={8} className="inline mr-1 mb-0.5" />}{item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 bg-[#fffcfd] min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-semibold text-[#2d1a22]">Hola, Jennifer 👋</p>
                      <p className="text-[9px] text-[#9a6672]">Estás en la Sesión 2 de 7</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-[#9a6672] mb-1">37% completado</p>
                      <div className="w-24 h-1.5 bg-[#fce8ed] rounded-full">
                        <div className="h-full bg-gradient-to-r from-[#a0435f] to-[#e8849a] rounded-full" style={{ width: "37%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {sessions.map((s, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
                        s.status === "available" ? "border-[#e8849a] bg-white shadow-sm"
                        : s.status === "completed" ? "border-[#f0dde2] bg-[#fff8f9]"
                        : "border-[#f5e8eb] bg-[#fffcfd] opacity-50"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          s.status === "completed" ? "bg-[#fce8ed]" : s.status === "available" ? "bg-[#a0435f]" : "bg-[#f5e8eb]"}`}>
                          {s.status === "completed" && <CheckIcon size={10} className="text-[#a0435f]" />}
                          {s.status === "available" && <PlayCircleIcon size={12} className="text-white" />}
                          {s.status === "locked" && <LockIcon size={9} className="text-[#d0a0a8]" />}
                        </div>
                        <p className={`text-[10px] font-medium truncate flex-1 ${s.status === "locked" ? "text-[#c0909a]" : "text-[#2d1a22]"}`}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ val: "2/8", label: "Sesiones" }, { val: "12 min", label: "Tiempo" }, { val: "4 días", label: "Racha 🔥" }].map((s, i) => (
                      <div key={i} className="bg-[#fff0f3] rounded-xl p-2 text-center">
                        <p className="text-[13px] font-semibold text-[#2d1a22]">{s.val}</p>
                        <p className="text-[8px] text-[#9a6672]">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL VER CURSOS ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-white rounded-3xl shadow-2xl shadow-[#a0435f]/20 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0dde2]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon size={14} className="text-[#e8849a]" />
                  <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#e8849a]">El programa completo</p>
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#2d1a22]">✈️ Tus 8 sesiones Au Pair</h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                <XIcon size={14} className="text-[#a0435f]" />
              </button>
            </div>

            {/* Sesiones */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingSesiones ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sesiones.length === 0 ? (
                <p className="text-center text-[13px] text-[#9a6672] py-8">No se pudieron cargar las sesiones.</p>
              ) : (
                <div className="space-y-3">
                  {sesiones.map((s, i) => (
                    <div key={s.id} className="flex items-start gap-3 p-4 rounded-2xl border border-[#f0dde2] bg-[#fff8f9] hover:border-[#e8b0bc] hover:bg-white transition">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-[14px] ${
                        i === 0 ? "bg-[#a0435f] text-white" : "bg-[#fce8ed] text-[#a0435f]"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-[13px] font-semibold text-[#2d1a22]">{s.titulo}</p>
                          {(s.es_gratis === 1 || s.es_gratis === true) && (
                            <span className="text-[9px] bg-[#e8f0e0] text-[#5a8a3a] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                              Gratis
                            </span>
                          )}
                        </div>
                        {s.descripcion && (
                          <p className="text-[12px] text-[#9a6672] leading-relaxed">{s.descripcion}</p>
                        )}
                      </div>
                      {!(s.es_gratis === 1 || s.es_gratis === true) && (
                        <LockIcon size={13} className="text-[#c0909a] shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-[#f0dde2] bg-[#fff8f9]">
              <p className="text-[12px] text-[#9a6672] text-center mb-3">
                La primera sesión es gratis 🎉 — Da el primer paso sin compromiso.
              </p>
              <Link href="/register" onClick={() => setModalOpen(false)}
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