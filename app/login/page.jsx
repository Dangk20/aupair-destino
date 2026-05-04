"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("El correo y la contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Correo o contraseña incorrectos.");
      } else {
        router.push(data.redirect || "/dashboard");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#f0dde2] rounded-xl px-4 py-3 text-[14px] text-[#2d1a22] bg-[#fff8f9] placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] focus:border-transparent transition";

  return (
    <div className="min-h-screen flex bg-[#fff8f9]">

      {/* LEFT decorativo */}
      <div className="hidden lg:flex w-[45%] bg-[#a0435f] relative overflow-hidden flex-col items-center justify-center p-12">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotslogin" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotslogin)" />
        </svg>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#2d1a22]/20 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={90} height={90} className="mx-auto mb-8 brightness-0 invert" />

          <h2 className="font-serif text-white text-[32px] font-bold leading-tight mb-4">
            Bienvenida<br />
            <span className="italic text-[#fce8ed]">de vuelta.</span>
          </h2>

          <p className="text-white/60 text-[14px] leading-relaxed max-w-xs mx-auto mb-10">
            Continúa donde lo dejaste. Tu progreso está guardado y tu próxima sesión te espera.
          </p>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 text-left max-w-xs mx-auto">
            <p className="text-white/50 text-[11px] tracking-widest uppercase mb-3">Tu progreso</p>
            <div className="space-y-2.5">
              {[
                { label: "Bienvenida", done: true },
                { label: "Sesión 1 · ¿Qué es ser au pair?", done: true },
                { label: "Sesión 2 · Visa y documentación", active: true },
                { label: "Sesión 3 · Buscar familia", locked: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    s.done ? "bg-white/20 border border-white/30"
                    : s.active ? "bg-[#fce8ed]"
                    : "bg-white/10 border border-white/10"
                  }`}>
                    {s.done && (
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {s.active && (
                      <svg viewBox="0 0 10 10" fill="#a0435f" className="w-2.5 h-2.5">
                        <path d="M3 2l5 3-5 3V2z"/>
                      </svg>
                    )}
                    {s.locked && (
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                        <rect x="2" y="4.5" width="6" height="4" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                        <path d="M3.5 4.5V3a1.5 1.5 0 013 0v1.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-[12px] ${
                    s.done ? "text-white/50 line-through"
                    : s.active ? "text-white font-medium"
                    : "text-white/25"
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-8 lg:hidden">
            <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={64} height={64} />
          </div>

          <h2 className="font-serif text-[28px] font-bold text-[#2d1a22] mb-1">Iniciar sesión</h2>
          <p className="text-[13px] text-[#9a6672] mb-8">Ingresa a tu cuenta para continuar tu camino au pair.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">Correo electrónico</label>
              <input name="email" type="email" placeholder="tu@correo.com"
                value={form.email} onChange={handleChange} required className={inputClass} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-[#2d1a22] tracking-wide uppercase">Contraseña</label>
                <Link href="/forgot-password" className="text-[12px] text-[#a0435f] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Tu contraseña"
                  value={form.password} onChange={handleChange} required className={`${inputClass} pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0909a] hover:text-[#a0435f] transition">
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white font-medium text-[14px] py-3.5 rounded-xl transition shadow-lg shadow-[#a0435f]/20 mt-2">
              {loading ? "Ingresando..." : "Ingresar →"}
            </button>

            <p className="text-center text-[13px] text-[#9a6672] pt-1">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-[#a0435f] font-medium hover:underline">Regístrate gratis</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}