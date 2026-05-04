"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PlayCircleIcon, CheckIcon, LockIcon,
  LogOutIcon, SparklesIcon, FlameIcon,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar sesiones + progreso
    fetch("/api/dashboard/sesiones")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setData(d); setLoading(false); } });

    // Cargar datos del usuario desde la sesión
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9973a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#8a7d6b]">Cargando tu programa...</p>
        </div>
      </div>
    );
  }

  const { sesiones, completadas, total, porcentaje } = data;
  const sesionActual = sesiones.find((s) => s.estado === "available");
  const todasCompletadas = completadas === total;

  return (
    <div className="min-h-screen bg-[#faf8f2] flex">

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-56 bg-[#0f1e3d] flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/">
            <Image
              src="/assets/destino-aupair-logo.svg"
              alt="Destino Au Pair"
              width={48}
              height={48}
              className="brightness-0 invert"
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: "Mi ruta", href: "/dashboard", active: true },
            { label: "Comunidad", href: "/dashboard/comunidad", locked: !user?.tiene_acceso },
            { label: "Certificado", href: "/dashboard/certificado", locked: !todasCompletadas },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.locked ? "#" : item.href}
              className={`flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg transition ${
                item.active
                  ? "bg-[#c9973a] text-white font-medium"
                  : item.locked
                  ? "text-white/25 cursor-not-allowed"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.locked && <LockIcon size={10} />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#c9973a]/20 border border-[#c9973a]/30 flex items-center justify-center shrink-0">
              <span className="text-[#e8b860] text-[12px] font-serif font-bold">
                {user?.nombre?.[0] || "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-[12px] font-medium truncate">{user?.nombre} {user?.apellido}</p>
              <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[11px] transition"
          >
            <LogOutIcon size={12} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 p-6 md:p-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-[24px] font-bold text-[#0f1e3d]">
              Hola, {user?.nombre} 👋
            </h1>
            <p className="text-[13px] text-[#8a7d6b] mt-0.5">
              {todasCompletadas
                ? "¡Completaste el programa! 🎉"
                : sesionActual
                ? `Continúa con: ${sesionActual.titulo}`
                : "Ya completaste todo el contenido disponible."}
            </p>
          </div>

          {/* Progreso circular simple */}
          <div className="text-right shrink-0">
            <p className="font-serif text-[28px] font-bold text-[#0f1e3d] leading-none">{porcentaje}%</p>
            <p className="text-[11px] text-[#8a7d6b]">{completadas}/{total} sesiones</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="w-full h-2 bg-[#e8e0d0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c9973a] to-[#e8b860] rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Paywall banner — solo si no tiene acceso y ya terminó la bienvenida */}
        {!user?.tiene_acceso && completadas >= 1 && (
          <div className="bg-[#0f1e3d] rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <SparklesIcon size={13} className="text-[#c9973a]" />
                <p className="text-[#e8b860] text-[11px] font-semibold tracking-wide uppercase">Desbloquea el programa completo</p>
              </div>
              <p className="text-white text-[13px] leading-relaxed">
                Accede a las 7 sesiones restantes por un único pago de <span className="text-[#e8b860] font-semibold">$97 USD</span>
              </p>
            </div>
            <Link
              href="/pago"
              className="shrink-0 bg-[#c9973a] hover:bg-[#b8862e] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap"
            >
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
                  ? "border-[#c9973a] bg-white shadow-md shadow-[#c9973a]/10 cursor-pointer hover:shadow-lg"
                  : s.estado === "completed"
                  ? "border-[#e0d8cc] bg-[#f5f2ec] cursor-pointer hover:border-[#c9b89a]"
                  : "border-[#e8e4dc] bg-[#faf9f6] opacity-50 cursor-not-allowed"
              }`}
              onClick={() => {
                if (s.estado !== "locked") router.push(`/dashboard/sesion/${s.id}`);
              }}
            >
              {/* Ícono estado */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                s.estado === "completed" ? "bg-[#e8f0e0]"
                : s.estado === "available" ? "bg-[#c9973a]"
                : "bg-[#e8e4dc]"
              }`}>
                {s.estado === "completed" && <CheckIcon size={13} className="text-[#5a8a3a]" />}
                {s.estado === "available" && <PlayCircleIcon size={15} className="text-white" />}
                {s.estado === "locked" && <LockIcon size={12} className="text-[#c9b89a]" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] font-medium truncate ${
                  s.estado === "locked" ? "text-[#b0a898]" : "text-[#0f1e3d]"
                }`}>
                  {s.es_gratis && (
                    <span className="text-[10px] bg-[#e8f0e0] text-[#5a8a3a] font-semibold px-1.5 py-0.5 rounded-full mr-2">
                      GRATIS
                    </span>
                  )}
                  {s.titulo}
                </p>
                {s.descripcion && (
                  <p className="text-[11px] text-[#8a7d6b] truncate mt-0.5">{s.descripcion}</p>
                )}
              </div>

              {/* Badge */}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                s.estado === "completed" ? "bg-[#e8f0e0] text-[#5a8a3a]"
                : s.estado === "available" ? "bg-[#fdf3e3] text-[#c9973a]"
                : "bg-[#f0ebe0] text-[#b0a898]"
              }`}>
                {s.estado === "completed" && "Completada"}
                {s.estado === "available" && "Continuar →"}
                {s.estado === "locked" && "Bloqueada"}
              </span>
            </div>
          ))}
        </div>

        {/* Pantalla final — cuando completa todo */}
        {todasCompletadas && (
          <div className="mt-8 bg-[#0f1e3d] rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-serif text-white text-[20px] font-bold mb-2">
              ¡Lo lograste!
            </h3>
            <p className="text-white/50 text-[13px] mb-5">
              Completaste el programa. Ahora accede a la comunidad o agenda tu revisión con Jennifer y Tati.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://chat.whatsapp.com/tu-link-aqui"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1fba58] text-white text-[13px] font-medium px-6 py-2.5 rounded-xl transition"
              >
                Unirme a la comunidad
              </a>
              <Link
                href="/dashboard/revision"
                className="bg-[#c9973a] hover:bg-[#b8862e] text-white text-[13px] font-medium px-6 py-2.5 rounded-xl transition"
              >
                Agendar revisión con Jennifer y Tati
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}