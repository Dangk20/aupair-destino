import { ChevronRightIcon, CheckIcon, LockIcon, PlayCircleIcon, GlobeIcon, UsersIcon, StarIcon } from "lucide-react";

const sessions = [
  { label: "Bienvenida", status: "completed" },
  { label: "Sesión 1 · ¿Qué es ser au pair?", status: "completed" },
  { label: "Sesión 2 · Visa y documentación", status: "available", progress: 60 },
  { label: "Sesión 3 · Buscar familia anfitriona", status: "locked" },
  { label: "Sesión 4 · Entrevistas y contratos", status: "locked" },
];

const stats = [
  { icon: UsersIcon, value: "+500", label: "Au pairs preparadas" },
  { icon: GlobeIcon, value: "12", label: "Países destino" },
  { icon: StarIcon, value: "4.9", label: "Valoración promedio" },
];

// ── PALETA BLUSH MUY SUAVE ─────────────────────────────
// Fondo:        #fff8f9   (casi blanco con toque rosado)
// Primario:     #a0435f   (rosa oscuro elegante, no tan intenso)
// Acento:       #e8849a   (rosa claro vibrante)
// Sidebar:      #2d1a22   (casi negro con toque vino — contraste sin ser navy)
// Borde:        #f0dde2
// Texto suave:  #9a6672
// Hover fondo:  #fef0f3

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[#fff8f9] overflow-hidden">

      {/* ── BACKGROUND DECORATION ── */}
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

      {/* ── NAV ── */}
      <nav className="relative flex items-center justify-between px-8 py-4 border-b border-[#f0dde2]">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" stroke="#a0435f" strokeWidth="1.5" />
            <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#a0435f" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="2" y1="18" x2="34" y2="18" stroke="#a0435f" strokeWidth="1" />
            <line x1="4" y1="11" x2="32" y2="11" stroke="#a0435f" strokeWidth="0.8" />
            <line x1="4" y1="25" x2="32" y2="25" stroke="#a0435f" strokeWidth="0.8" />
            <path d="M26 10 L31 14 L24 15 Z" fill="#e8849a" />
          </svg>
          <div>
            <p className="font-serif text-[16px] font-bold text-[#a0435f] leading-none tracking-wide">Destino</p>
            <p className="text-[8px] font-light text-[#9a6672] tracking-[3px] uppercase">Au Pair</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Cursos", "Precios", "Testimonios", "FAQ"].map((item) => (
            <a key={item} href="#" className="text-[13px] text-[#7a4a54] hover:text-[#a0435f] transition">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[13px] text-[#a0435f] border border-[#e8b0bc] rounded-lg px-4 py-2 hover:bg-[#fef0f3] transition">
            Iniciar sesión
          </button>
          <button className="text-[13px] text-white bg-[#a0435f] rounded-lg px-4 py-2 hover:bg-[#8a3550] transition font-medium">
            Registrarse
          </button>
        </div>
      </nav>

      {/* ── HERO BODY ── */}
      <div className="relative max-w-6xl mx-auto px-8 pt-14 pb-10 flex flex-col lg:flex-row items-center gap-14">

        {/* ── LEFT ── */}
        <div className="w-full lg:w-[46%] flex flex-col items-start">

          <div className="flex items-center gap-2 bg-[#fef0f3] border border-[#f0c8d0] rounded-full px-3 py-1.5 mb-7">
            <span className="w-2 h-2 rounded-full bg-[#e8849a] animate-pulse" />
            <span className="text-[11px] text-[#a0435f] font-medium tracking-wide">Nuevo — Cursos actualizados 2026</span>
          </div>

          <h1 className="font-serif text-[46px] md:text-[54px] font-bold text-[#2d1a22] leading-[1.1] mb-5">
            Tu camino<br />
            Au Pair,{" "}
            <span className="relative inline-block">
              <span className="italic text-[#a0435f]">paso a paso</span>
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="#e8849a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </span>
            <br />desde cero.
          </h1>

          <p className="text-[15px] text-[#7a4a54] leading-relaxed mb-7 max-w-[400px]">
            Aprende todo lo que necesitas para convertirte en au pair: visa, entrevistas,
            llegada y adaptación. Cada sesión se desbloquea cuando completas la anterior.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              "Sesiones progresivas — cada etapa desbloquea la siguiente",
              "Acceso de por vida a todos los materiales",
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
            <button className="bg-[#a0435f] hover:bg-[#8a3550] transition text-white text-[14px] font-medium px-7 py-3.5 rounded-xl shadow-lg shadow-[#a0435f]/20">
              Comenzar mi viaje
            </button>
            <button className="flex items-center gap-1.5 border border-[#e8b0bc] text-[#a0435f] text-[14px] px-5 py-3.5 rounded-xl hover:bg-[#fef0f3] transition">
              Ver cursos <ChevronRightIcon size={14} />
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 pt-6 border-t border-[#f0dde2] w-full">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} className="text-[#e8849a]" />
                  <span className="font-serif font-bold text-[20px] text-[#2d1a22]">{value}</span>
                </div>
                <span className="text-[11px] text-[#9a6672]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="w-full lg:w-[54%] relative pb-8">

          {/* Floating card top-left */}
          <div className="hidden lg:flex absolute -left-6 top-8 z-20 items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-[#a0435f]/8 border border-[#f0dde2]">
            <div className="w-8 h-8 rounded-full bg-[#fce8ed] flex items-center justify-center">
              <CheckIcon size={14} className="text-[#a0435f]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#2d1a22]">Sesión completada</p>
              <p className="text-[10px] text-[#9a6672]">¡Sigue así, vas genial! 🎉</p>
            </div>
          </div>

          {/* Floating card bottom-right */}
          <div className="hidden lg:flex absolute -right-4 bottom-14 z-20 flex-col gap-1 bg-[#2d1a22] rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-[10px] text-white/60">Próxima sesión</p>
            <p className="text-[12px] font-semibold text-white">Buscar familia anfitriona</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8849a]" />
              <span className="text-[10px] text-[#e8849a]">Se desbloquea al completar S2</span>
            </div>
          </div>

          {/* Main mockup */}
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
              {/* Sidebar */}
              <div className="w-40 bg-[#2d1a22] p-3 hidden md:flex flex-col gap-1 shrink-0">
                <div className="bg-white/10 rounded-lg p-2 mb-4 text-center">
                  <p className="font-serif text-[11px] text-white font-bold tracking-wide">Destino</p>
                  <p className="text-[7px] text-white/40 tracking-[2px] uppercase">Au Pair</p>
                </div>
                {["Mi ruta", "Sesiones", "Comunidad", "Recursos", "Certificado"].map((item, i) => (
                  <div key={i} className={`text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer ${
                    i === 0 ? "bg-[#a0435f] text-white font-medium"
                    : i >= 3 ? "text-white/25"
                    : "text-white/50"}`}>
                    {i >= 3 && <LockIcon size={8} className="inline mr-1 mb-0.5" />}
                    {item}
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
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition ${
                      s.status === "available" ? "border-[#e8849a] bg-white shadow-sm"
                      : s.status === "completed" ? "border-[#f0dde2] bg-[#fff8f9]"
                      : "border-[#f5e8eb] bg-[#fffcfd] opacity-50"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        s.status === "completed" ? "bg-[#fce8ed]"
                        : s.status === "available" ? "bg-[#a0435f]"
                        : "bg-[#f5e8eb]"}`}>
                        {s.status === "completed" && <CheckIcon size={10} className="text-[#a0435f]" />}
                        {s.status === "available" && <PlayCircleIcon size={12} className="text-white" />}
                        {s.status === "locked" && <LockIcon size={9} className="text-[#d0a0a8]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-medium truncate ${s.status === "locked" ? "text-[#c0909a]" : "text-[#2d1a22]"}`}>
                          {s.label}
                        </p>
                        {s.status === "available" && s.progress && (
                          <div className="mt-1 h-1 bg-[#fce8ed] rounded-full w-24">
                            <div className="h-full bg-[#a0435f] rounded-full" style={{ width: `${s.progress}%` }} />
                          </div>
                        )}
                      </div>
                      <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        s.status === "completed" ? "bg-[#fce8ed] text-[#a0435f]"
                        : s.status === "available" ? "bg-[#fce8ed] text-[#a0435f]"
                        : "bg-[#f8e8eb] text-[#c0909a]"}`}>
                        {s.status === "completed" && "Completado"}
                        {s.status === "available" && "En curso"}
                        {s.status === "locked" && "Bloqueado"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "2/8", label: "Sesiones vistas" },
                    { val: "12 min", label: "Tiempo total" },
                    { val: "4 días", label: "Racha activa 🔥" },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#fff0f3] rounded-xl p-2 text-center">
                      <p className="text-[13px] font-semibold text-[#2d1a22]">{s.val}</p>
                      <p className="text-[8px] text-[#9a6672]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="hidden md:block absolute bottom-0 right-2 w-32 rounded-2xl overflow-hidden border-2 border-white shadow-2xl shadow-[#a0435f]/20 bg-white z-10">
            <div className="bg-[#2d1a22] px-2 pt-2 pb-2">
              <div className="bg-white/10 rounded-md px-2 py-1 mb-2 text-center">
                <p className="font-serif text-[9px] text-white font-bold">Destino Au Pair</p>
              </div>
              {["Mi ruta", "Sesiones", "Comunidad"].map((item, i) => (
                <div key={i} className={`text-[9px] px-2 py-1 rounded-md mb-0.5 ${i === 0 ? "bg-[#a0435f] text-white font-medium" : "text-white/40"}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="p-2 space-y-1.5 bg-[#fffcfd]">
              {[
                { label: "Completadas", val: "2", color: "text-[#a0435f]" },
                { label: "En curso", val: "1", color: "text-[#e8849a]" },
                { label: "Bloqueadas", val: "5", color: "text-[#c0909a]" },
              ].map((s, i) => (
                <div key={i} className="bg-[#fff0f3] rounded-lg p-1.5 border border-[#f0dde2]">
                  <p className="text-[7px] text-[#9a6672]">{s.label}</p>
                  <p className={`font-bold text-xs ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}