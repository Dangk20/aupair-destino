"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlayCircleIcon, CheckIcon, LockIcon, SparklesIcon, UserIcon, CalendarIcon, TrophyIcon, ArrowRightIcon } from "lucide-react";

const FRASES = [
  "Tu aventura comienza con un solo paso. ✈️",
  "El mundo es tuyo — solo tienes que ir por él. 🌍",
  "Cada sesión te acerca más a tu sueño. 💫",
  "Preparada, segura y lista para despegar. 🛫",
  "Las mejores historias empiezan con valentía. 🌟",
  "Hoy es un buen día para soñar en grande. 💕",
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/sesiones")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setData(d); setLoading(false); } });

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        // Mostrar solo si NO ha visto la bienvenida
      if (!d.user?.vio_bienvenida) setMostrarBienvenida(true);
  });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#9a6672]">Cargando tu programa...</p>
        </div>
      </div>
    );
  }

  const { sesiones, completadas, total, porcentaje } = data;
  const sesionActual = sesiones.find((s) => s.estado === "available");
  const todasCompletadas = completadas === total;
  const diasActiva = user?.created_at
    ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
    : 0;
  const sesionesCompletadas = sesiones.filter(s => s.estado === "completed");
  const ultimaSesion = sesionesCompletadas.slice(-1)[0];
  const cerrarBienvenida = async () => {
    setMostrarBienvenida(false);
    // Marcar en BD que ya la vio
    await fetch("/api/dashboard/bienvenida", { method: "POST" });
  };

  return (
    <div className="min-h-screen bg-[#fff8f9]">

      {/* Fondo sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-db" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-db)" />
        </svg>
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#f8c0ce]/15 blur-3xl" />
        <div className="absolute -bottom-10 right-0 w-72 h-72 rounded-full bg-[#e8849a]/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full">

        {/* ── IZQUIERDA: Sesiones ── */}
        <main className="flex-1 p-6 md:p-8 max-w-xl">

          <div className="mb-7">
            <p className="text-[11px] font-semibold tracking-[3px] uppercase text-[#e8849a] mb-1">✈️ Tu camino au pair</p>
            <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">
              Hola, {user?.nombre} 👋
            </h1>
            <p className="text-[13px] text-[#9a6672] mt-0.5">
              {todasCompletadas
                ? "¡Completaste el programa! 🎉"
                : sesionActual
                ? `Continúa con: ${sesionActual.titulo}`
                : "Ya completaste todo el contenido disponible."}
            </p>
          </div>

          {/* Progreso */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#9a6672]">{completadas} de {total} sesiones</span>
              <span className="font-serif text-[16px] font-bold text-[#a0435f]">{porcentaje}%</span>
            </div>
            <div className="w-full h-3 bg-[#f0dde2] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${porcentaje}%`, background: "linear-gradient(90deg, #a0435f, #e8849a)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>
            </div>
          </div>

          {/* Paywall */}
          {!user?.tiene_acceso && completadas >= 1 && (
            <div className="relative overflow-hidden bg-[#a0435f] rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 shadow-lg shadow-[#a0435f]/20">
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <SparklesIcon size={13} className="text-[#fce8ed]" />
                  <p className="text-[#fce8ed] text-[11px] font-semibold tracking-wide uppercase">Desbloquea todo</p>
                </div>
                <p className="text-white text-[13px]">7 sesiones por <span className="text-[#fce8ed] font-semibold">$29 USD</span></p>
              </div>
              <Link href="/pago" className="shrink-0 bg-white hover:bg-[#fef0f3] text-[#a0435f] text-[13px] font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap">
                Pagar →
              </Link>
            </div>
          )}

          {/* Sesiones */}
          <div className="space-y-2.5">
            {sesiones.map((s, idx) => (
              <div key={s.id}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                  s.estado === "available"
                    ? "border-[#e8849a] bg-white shadow-md shadow-[#e8849a]/15 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                    : s.estado === "completed"
                    ? "border-[#f0dde2] bg-white/80 cursor-pointer hover:border-[#e8b0bc]"
                    : "border-[#f5e8eb] bg-[#fffcfd]/60 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => { if (s.estado !== "locked") router.push(`/dashboard/sesion/${s.id}`); }}
              >
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    s.estado === "completed" ? "bg-[#fce8ed]"
                    : s.estado === "available" ? "bg-[#a0435f]"
                    : "bg-[#f5e8eb]"
                  }`}>
                    {s.estado === "completed" && <CheckIcon size={14} className="text-[#a0435f]" />}
                    {s.estado === "available" && <PlayCircleIcon size={16} className="text-white" />}
                    {s.estado === "locked" && <LockIcon size={12} className="text-[#c0909a]" />}
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#f0dde2] text-[#a0435f] text-[9px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${s.estado === "locked" ? "text-[#c0909a]" : "text-[#2d1a22]"}`}>
                    {(s.es_gratis === 1 || s.es_gratis === true) && (
                      <span className="text-[9px] bg-[#fce8ed] text-[#a0435f] font-bold px-1.5 py-0.5 rounded-full mr-2 uppercase tracking-wide">Gratis</span>
                    )}
                    {s.titulo}
                  </p>
                  {s.descripcion && <p className="text-[11px] text-[#9a6672] truncate mt-0.5">{s.descripcion}</p>}
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  s.estado === "completed" ? "bg-[#fce8ed] text-[#a0435f]"
                  : s.estado === "available" ? "bg-[#a0435f] text-white"
                  : "bg-[#f8e8eb] text-[#c0909a]"
                }`}>
                  {s.estado === "completed" && "✓ Lista"}
                  {s.estado === "available" && "▶ Continuar"}
                  {s.estado === "locked" && "🔒"}
                </span>
              </div>
            ))}
          </div>

          {todasCompletadas && (
            <div className="mt-6 bg-[#a0435f] rounded-3xl p-6 text-center shadow-xl shadow-[#a0435f]/20">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-serif text-white text-[20px] font-bold mb-2">¡Lo lograste!</h3>
              <p className="text-white/70 text-[13px] mb-4">Accede a tu comunidad y agenda tu revisión.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://chat.whatsapp.com/tu-link-aqui" target="_blank" rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1fba58] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition">
                  Comunidad WhatsApp
                </a>
                <Link href="/dashboard/revision"
                  className="bg-white hover:bg-[#fef0f3] text-[#a0435f] text-[13px] font-medium px-5 py-2.5 rounded-xl transition">
                  Agendar revisión
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* ── DERECHA: Panel lateral ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 p-6 pt-8 shrink-0">

          {/* Mini perfil */}
          <div className="bg-white border border-[#f0dde2] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center overflow-hidden shrink-0">
                {user?.foto_url
                  ? <img src={user.foto_url} alt="" className="w-full h-full object-cover" />
                  : <UserIcon size={20} className="text-[#a0435f]" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#2d1a22] truncate">{user?.nombre} {user?.apellido}</p>
                <p className="text-[11px] text-[#9a6672] truncate">
                  {user?.ciudad ? `${user.ciudad}, ${user.pais}` : user?.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#fce8ed]">
              {[
                { val: diasActiva, label: "Días activa", icon: CalendarIcon },
                { val: `${porcentaje}%`, label: "Completado", icon: TrophyIcon },
                { val: ultimaSesion ? `S${sesiones.indexOf(ultimaSesion) + 1}` : "—", label: "Última sesión", icon: CheckIcon },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="font-serif text-[16px] font-bold text-[#a0435f]">{s.val}</p>
                  <p className="text-[10px] text-[#9a6672] leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Frase motivacional */}
          <div className="bg-gradient-to-br from-[#a0435f] to-[#c9607a] rounded-2xl p-4 shadow-md shadow-[#a0435f]/20 relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="absolute -left-2 -bottom-2 w-10 h-10 rounded-full bg-white/5" />
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-white/60 mb-2 relative z-10">✨ Frase del día</p>
            <p className="text-white text-[13px] font-medium leading-relaxed italic relative z-10">"{frase}"</p>
          </div>

          {/* Card próxima sesión */}
          {sesionActual && !todasCompletadas && (
            <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-1 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]" />
              <div className="p-4">
                <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#e8849a] mb-3">
                  ▶ Próxima sesión
                </p>

                {/* Número de sesión grande */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#a0435f] flex items-center justify-center shrink-0 shadow-md shadow-[#a0435f]/20">
                    <span className="font-serif text-white text-[20px] font-bold">
                      {sesiones.indexOf(sesionActual) + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#2d1a22] leading-snug">
                      {sesionActual.titulo}
                    </p>
                    {sesionActual.descripcion && (
                      <p className="text-[11px] text-[#9a6672] mt-1 leading-relaxed line-clamp-2">
                        {sesionActual.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mini progreso */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-[#f0dde2] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#a0435f] to-[#e8849a] rounded-full"
                      style={{ width: `${porcentaje}%` }} />
                  </div>
                  <span className="text-[10px] text-[#9a6672] shrink-0">{completadas}/{total}</span>
                </div>

                {/* Botón continuar */}
                <button
                  onClick={() => router.push(`/dashboard/sesion/${sesionActual.id}`)}
                  className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white text-[13px] font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#a0435f]/20"
                >
                  <PlayCircleIcon size={15} />
                  Continuar ahora
                  <ArrowRightIcon size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Si completó todo — card especial */}
          {todasCompletadas && (
            <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-1 bg-gradient-to-r from-[#a0435f] via-[#e8849a] to-[#a0435f]" />
              <div className="p-5 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-serif text-[15px] font-bold text-[#2d1a22] mb-1">¡Programa completo!</p>
                <p className="text-[11px] text-[#9a6672] mb-4 leading-relaxed">
                  Completaste las {total} sesiones. Estás lista para tu aventura.
                </p>
                <Link href="/dashboard/certificado"
                  className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  Ver mi certificado →
                </Link>
              </div>
            </div>
          )}

        </aside>
      </div>
      {mostrarBienvenida && user && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#2d1a22]/50 backdrop-blur-sm" onClick={cerrarBienvenida} />
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#2d1a22] via-[#e8849a] to-[#2d1a22]" />
      <div className="p-7 text-center">
        <div className="text-5xl mb-4">🌍✈️</div>
        <h2 className="font-serif text-[26px] font-bold text-[#2d1a22] mb-2">
          ¡Bienvenida,<br />
          <span className="italic text-[#a0435f]">{user.nombre}!</span>
        </h2>
        <p className="text-[13px] text-[#7a4a54] leading-relaxed mb-6">
          Tu aventura au pair empieza hoy. Comienza con la sesión de bienvenida — es gratis y te tomará solo unos minutos. 💕
        </p>
        <div className="bg-[#fff8f9] border border-[#f0dde2] rounded-2xl p-4 mb-6 text-left">
          <p className="text-[12px] text-[#7a4a54] italic leading-relaxed mb-3">
            "Estamos muy emocionadas de tenerte aquí. Este programa lo creamos con todo el amor para que llegues preparada y segura a tu familia anfitriona."
          </p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-7 h-7 rounded-full bg-[#fce8ed] border-2 border-white flex items-center justify-center">
                <span className="text-[#a0435f] text-[10px] font-serif font-bold">J</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#e8e0f8] border-2 border-white flex items-center justify-center">
                <span className="text-[#6b4f9e] text-[10px] font-serif font-bold">T</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-[#a0435f]">Jennifer y Tati 💕</p>
          </div>
        </div>
        <button onClick={cerrarBienvenida}
          className="w-full bg-[#a0435f] hover:bg-[#8a3550] text-white font-medium text-[14px] py-3.5 rounded-2xl transition shadow-lg shadow-[#a0435f]/20">
          ¡Empezar mi aventura! 🚀
        </button>
        <p className="text-[11px] text-[#9a6672] mt-3">Tu primera sesión es completamente gratis 🎉</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}