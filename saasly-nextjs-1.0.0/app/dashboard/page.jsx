"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlayCircleIcon, CheckIcon, LockIcon, SparklesIcon } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard/sesiones")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setData(d); setLoading(false); } });

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
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

  return (
    <div className="min-h-screen bg-[#fff8f9] flex">
      <main className="flex-1 p-6 md:p-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-[24px] font-bold text-[#2d1a22]">
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
          <div className="text-right shrink-0">
            <p className="font-serif text-[28px] font-bold text-[#a0435f] leading-none">{porcentaje}%</p>
            <p className="text-[11px] text-[#9a6672]">{completadas}/{total} sesiones</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="w-full h-2 bg-[#f0dde2] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#a0435f] to-[#e8849a] rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Paywall banner */}
        {!user?.tiene_acceso && completadas >= 1 && (
          <div className="bg-[#a0435f] rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <SparklesIcon size={13} className="text-[#fce8ed]" />
                <p className="text-[#fce8ed] text-[11px] font-semibold tracking-wide uppercase">Desbloquea el programa completo</p>
              </div>
              <p className="text-white text-[13px] leading-relaxed">
                Accede a las 7 sesiones restantes por un único pago de <span className="text-[#fce8ed] font-semibold">$97 USD</span>
              </p>
            </div>
            <Link href="/pago" className="shrink-0 bg-white hover:bg-[#fef0f3] text-[#a0435f] text-[13px] font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap">
              Pagar ahora →
            </Link>
          </div>
        )}

        {/* Lista de sesiones */}
        <div className="space-y-2">
          {sesiones.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                s.estado === "available"
                  ? "border-[#e8849a] bg-white shadow-md shadow-[#e8849a]/10 cursor-pointer hover:shadow-lg"
                  : s.estado === "completed"
                  ? "border-[#f0dde2] bg-[#fff0f3] cursor-pointer hover:border-[#e8b0bc]"
                  : "border-[#f5e8eb] bg-[#fffcfd] opacity-50 cursor-not-allowed"
              }`}
              onClick={() => { if (s.estado !== "locked") router.push(`/dashboard/sesion/${s.id}`); }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                s.estado === "completed" ? "bg-[#fce8ed]"
                : s.estado === "available" ? "bg-[#a0435f]"
                : "bg-[#f5e8eb]"
              }`}>
                {s.estado === "completed" && <CheckIcon size={13} className="text-[#a0435f]" />}
                {s.estado === "available" && <PlayCircleIcon size={15} className="text-white" />}
                {s.estado === "locked" && <LockIcon size={12} className="text-[#c0909a]" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] font-medium truncate ${s.estado === "locked" ? "text-[#c0909a]" : "text-[#2d1a22]"}`}>
                  {(s.es_gratis === 1 || s.es_gratis === true) && (
                    <span className="text-[10px] bg-[#fce8ed] text-[#a0435f] font-semibold px-1.5 py-0.5 rounded-full mr-2">GRATIS</span>
                  )}
                  {s.titulo}
                </p>
                {s.descripcion && (
                  <p className="text-[11px] text-[#9a6672] truncate mt-0.5">{s.descripcion}</p>
                )}
              </div>

              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                s.estado === "completed" ? "bg-[#fce8ed] text-[#a0435f]"
                : s.estado === "available" ? "bg-[#fce8ed] text-[#a0435f]"
                : "bg-[#f8e8eb] text-[#c0909a]"
              }`}>
                {s.estado === "completed" && "Completada"}
                {s.estado === "available" && "Continuar →"}
                {s.estado === "locked" && "Bloqueada"}
              </span>
            </div>
          ))}
        </div>

        {/* Pantalla final */}
        {todasCompletadas && (
          <div className="mt-8 bg-[#a0435f] rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-serif text-white text-[20px] font-bold mb-2">¡Lo lograste!</h3>
            <p className="text-white/70 text-[13px] mb-5">
              Completaste el programa. Ahora accede a la comunidad o agenda tu revisión con Jennifer y Tati.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://chat.whatsapp.com/tu-link-aqui" target="_blank" rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1fba58] text-white text-[13px] font-medium px-6 py-2.5 rounded-xl transition">
                Unirme a la comunidad
              </a>
              <Link href="/dashboard/revision"
                className="bg-white hover:bg-[#fef0f3] text-[#a0435f] text-[13px] font-medium px-6 py-2.5 rounded-xl transition">
                Agendar revisión con Jennifer y Tati
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}