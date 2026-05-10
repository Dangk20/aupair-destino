"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Users, ShieldCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: "Crea tu cuenta gratis",
    desc: "Toma menos de 1 minuto.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" opacity=".6"/>
      </svg>
    ),
    title: "Ve la sesión de bienvenida",
    desc: "Conoce el programa y cómo funciona.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Desbloquea el programa completo",
    desc: "Accede a todo el contenido y materiales.",
  },
];

const avatars = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&q=80",
];

const badges = [
  { icon: Users,       label: "Comunidad\nColombiana en USA" },
  { icon: ShieldCheck, label: "Acompañamiento\nreal y cercano"   },
  { icon: Star,        label: "Contenido probado\ny actualizado"  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd]       = useState(false);
  const [showPwd2, setShowPwd2]     = useState(false);
  const [accepted, setAccepted]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirm: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!accepted) { setError("Debes aceptar los Términos de Uso y Política de Privacidad."); return; }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (form.password.length < 8) { setError("La contraseña debe tener mínimo 8 caracteres."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre, apellido: form.apellido,
          email: form.email, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "No se pudo crear la cuenta.");
      else router.push(data.redirect || "/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border border-[#e0d4f5] rounded-2xl px-4 pl-11 py-3.5 text-[14px] " +
    "text-[#1a0a3d] bg-white placeholder:text-[#b0a0d0] " +
    "focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]/30 focus:border-[#7c5cc4] transition";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ══ PANEL IZQUIERDA ══ */}
      <div className="lg:w-[45%] relative flex flex-col items-center justify-center
                      px-8 py-14 lg:py-0 overflow-hidden min-h-[480px] lg:min-h-screen">

        {/* Imagen fondo */}
        <Image
          src="/carrusel/imagen5.jpg"
          alt="Register background"
          fill
          className="object-cover object-center"
          priority
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=90"; }}
        />

        {/* Overlay morado */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3d1a7a]/92 via-[#5a3a90]/88 to-[#2d0a5a]/95" />

        {/* Puntitos */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotsR" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotsR)" />
        </svg>

        {/* Avión decorativo */}
        <div className="absolute top-10 right-10 pointer-events-none select-none opacity-60">
          <svg viewBox="0 0 80 50" fill="none" className="w-20 h-12">
            <path d="M5 25 L72 5 L50 48 L32 30 Z" fill="white" opacity=".25"/>
            <path d="M5 25 L32 30 L28 42 Z" fill="white" opacity=".15"/>
          </svg>
        </div>

        {/* Sparkles */}
        <span className="absolute top-8 left-10 text-white/60 text-[22px] select-none">✦</span>
        <span className="absolute top-20 left-6 text-white/30 text-[13px] select-none">✦</span>
        <span className="absolute bottom-32 right-10 text-white/20 text-[16px] select-none">♡</span>

        {/* Línea punteada curva abajo-izquierda */}
        <svg className="absolute bottom-10 left-4 opacity-20 pointer-events-none"
             width="120" height="80" viewBox="0 0 120 80" fill="none">
          <path d="M10 70 Q40 20 110 10" stroke="white" strokeWidth="1.5"
                strokeDasharray="6 5" strokeLinecap="round"/>
        </svg>

        {/* Contenido */}
        <div className="relative z-10 text-center w-full max-w-xs mx-auto">

          {/* Logo */}
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair"
                 width={64} height={64}
                 className="mx-auto mb-5 brightness-0 invert opacity-90" />

          {/* Título */}
          <h2 className="font-serif font-bold text-white text-[32px] lg:text-[38px]
                         leading-tight mb-1 drop-shadow-lg">
            Tu Destino
          </h2>
          <h2 className="font-serif font-bold italic text-white text-[32px] lg:text-[38px]
                         leading-tight mb-4 drop-shadow-lg">
            empieza aquí.
          </h2>
          <div className="flex justify-center mb-4">
            <span className="text-white/50 text-[20px]">♡</span>
          </div>
          <p className="text-white/85 text-[13px] xl:text-[14px] leading-relaxed
                        max-w-[240px] mx-auto mb-8 font-medium drop-shadow-sm">
            Regístrate gratis y accede a la sesión<br/>
            de bienvenida. Da el primer paso<br/>
            sin compromiso.
          </p>

          {/* Pasos */}
          <div className="bg-white/12 border border-white/20 rounded-2xl p-4
                          text-left backdrop-blur-sm mb-5 space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/25
                                flex items-center justify-center shrink-0 text-white">
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-white/40 text-[10px] font-bold">{s.num}</span>
                    <p className="text-white text-[12px] font-bold">{s.title}</p>
                  </div>
                  <p className="text-white/60 text-[11px]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Card comunidad */}
          <div className="bg-white/12 border border-white/20 rounded-2xl p-4
                          backdrop-blur-sm">
            {/* Avatars + contador */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2.5">
                {avatars.map((src, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white/40 overflow-hidden shrink-0">
                    <img src={src} alt="" className="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-[15px] leading-none">+2.094</p>
                <p className="text-white/70 text-[11px] leading-snug mt-0.5">
                  Chicas colombianas ya<br/>viven el Destino Au Pair.
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20
                                    flex items-center justify-center">
                      <Icon size={16} className="text-white" strokeWidth={1.5}/>
                    </div>
                    <p className="text-white/70 text-[9px] text-center leading-snug whitespace-pre-line">
                      {b.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ══ PANEL DERECHA ══ */}
      <div className="flex-1 bg-[#f8f5ff] flex items-center justify-center
                      px-6 sm:px-10 xl:px-14 py-10 xl:py-12 relative overflow-hidden">

        {/* Avión decorativo derecha */}
        <div className="absolute top-10 right-8 pointer-events-none select-none opacity-20">
          <svg viewBox="0 0 100 80" fill="none" className="w-24">
            <path d="M8 40 L90 8 L64 74 L40 46 Z" stroke="#7c5cc4" strokeWidth="1.5" fill="none"/>
            <path d="M8 40 Q-5 20 20 5" stroke="#7c5cc4" strokeWidth="1.5"
                  strokeDasharray="5 4" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="w-full max-w-md xl:max-w-lg">

          {/* Card formulario */}
          <div className="bg-white rounded-3xl border border-[#e0d4f5] shadow-xl
                          shadow-[#7c5cc4]/10 px-7 xl:px-9 py-8 xl:py-10">

            {/* Ícono usuario */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[#ede9f8] border border-[#c4b0e8]
                              flex items-center justify-center relative">
                <User size={26} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                <span className="absolute -top-1 -right-1 text-[#7c5cc4] text-[14px]">✦</span>
              </div>
            </div>

            {/* Título */}
            <h1 className="font-serif font-bold text-center text-[28px] xl:text-[32px]
                           text-[#1a0a3d] mb-1">
              Crea tu{" "}
              <span className="italic text-[#7c5cc4]">cuenta</span>
            </h1>
            <p className="text-center text-[13px] xl:text-[14px] text-[#7060a0] mb-7">
              Es gratis — Da el primer paso sin compromiso.
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[13px]
                              px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nombre + Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] xl:text-[11px] font-bold tracking-[2px]
                                    uppercase text-[#1a0a3d] mb-1.5">Nombre</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a0d0]" strokeWidth={1.5}/>
                    <input name="nombre" type="text" placeholder="María"
                           value={form.nombre} onChange={handleChange} required
                           className={inputBase}/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] xl:text-[11px] font-bold tracking-[2px]
                                    uppercase text-[#1a0a3d] mb-1.5">Apellido</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a0d0]" strokeWidth={1.5}/>
                    <input name="apellido" type="text" placeholder="García"
                           value={form.apellido} onChange={handleChange} required
                           className={inputBase}/>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-bold tracking-[2px]
                                  uppercase text-[#1a0a3d] mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a0d0]" strokeWidth={1.5}/>
                  <input name="email" type="email" placeholder="tu@correo.com"
                         value={form.email} onChange={handleChange} required
                         className={inputBase}/>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-bold tracking-[2px]
                                  uppercase text-[#1a0a3d] mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a0d0]" strokeWidth={1.5}/>
                  <input name="password" type={showPwd ? "text" : "password"}
                         placeholder="Mínimo 8 caracteres"
                         value={form.password} onChange={handleChange} required
                         className={`${inputBase} pr-11`}/>
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a0d0] hover:text-[#7c5cc4] transition">
                    {showPwd ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-bold tracking-[2px]
                                  uppercase text-[#1a0a3d] mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a0d0]" strokeWidth={1.5}/>
                  <input name="confirm" type={showPwd2 ? "text" : "password"}
                         placeholder="Repite tu contraseña"
                         value={form.confirm} onChange={handleChange} required
                         className={`${inputBase} pr-11`}/>
                  <button type="button" onClick={() => setShowPwd2(!showPwd2)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a0d0] hover:text-[#7c5cc4] transition">
                    {showPwd2 ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
                  </button>
                </div>
              </div>

              {/* Checkbox términos */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setAccepted(!accepted)}
                     className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                 shrink-0 mt-0.5 transition-colors ${
                       accepted ? "bg-[#7c5cc4] border-[#7c5cc4]" : "border-[#c4b0e8] bg-white"
                     }`}>
                  {accepted && (
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[12px] xl:text-[13px] text-[#5a4080] leading-relaxed">
                  Acepto los{" "}
                  <Link href="/terminos" className="text-[#7c5cc4] font-semibold hover:underline">
                    Términos de uso
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacidad" className="text-[#7c5cc4] font-semibold hover:underline">
                    Política de privacidad
                  </Link>
                </span>
              </label>

              {/* CTA */}
              <button type="submit" disabled={loading}
                className="w-full bg-[#7c5cc4] hover:bg-[#6a4ab0] disabled:opacity-60
                           text-white font-semibold text-[15px] xl:text-[16px]
                           py-4 rounded-2xl shadow-lg shadow-[#7c5cc4]/30
                           transition-all duration-200">
                {loading ? "Creando cuenta..." : "Comenzar gratis →"}
              </button>

              <p className="text-center text-[13px] text-[#7060a0]">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-[#7c5cc4] font-bold hover:underline">
                  Iniciar sesión
                </Link>
              </p>

            </form>

            {/* Seguridad */}
            <div className="mt-6 pt-5 border-t border-[#ede9f8] text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lock size={13} className="text-[#9a80c0]" strokeWidth={1.5}/>
                <p className="text-[12px] font-semibold text-[#1a0a3d]">
                  Tus datos están protegidos
                </p>
              </div>
              <p className="text-[11px] xl:text-[12px] text-[#9a80c0]">
                Nunca compartimos tu información<br/>con terceros.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}