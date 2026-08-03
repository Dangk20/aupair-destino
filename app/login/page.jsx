"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon, Mail, Lock, Users, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

/* ── Íconos redes ── */
const IGIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const YTIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const TKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
  </svg>
);
const FBIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const socials = [
  { icon: IGIcon,  href: "https://instagram.com/destinoaupair",  label: "Instagram" },
  { icon: YTIcon,  href: "https://youtube.com/@destinoaupair",   label: "YouTube"   },
  { icon: TKIcon,  href: "https://tiktok.com/@destinoaupair",    label: "TikTok"    },
  { icon: FBIcon,  href: "https://facebook.com/destinoaupair",   label: "Facebook"  },
  { icon: WAIcon,  href: "https://wa.me/13478886836",            label: "WhatsApp"  },
];

const avatars = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&q=80",
];

const sessions = [
  { label: "Bienvenida",                    sub: "Completado",   status: "done"   },
  { label: "Sesión 1 - La realidad de ser Au pair", sub: "Completado", status: "done"   },
  { label: "Sesión 2 - ¿Cumples con los requisitos?", sub: "En progreso", status: "active" },
  { label: "Sesión 3 - ¿Cómo crear un perfil?",     sub: "Bloqueado",    status: "locked" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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
      if (!res.ok) setError(data.error || "Correo o contraseña incorrectos.");
      // Navegación de documento, no del router. La cookie de sesión acaba de
      // cambiar y el destino está detrás del middleware: `router.push` puede
      // servir un segmento de la caché del cliente anterior a la cookie, sin
      // volver a pasar por el middleware. Es el patrón correcto para una
      // sesión en cookie, y descarta esa clase de fallo.
      //
      // Nota: el "botón de ingresar no responde tras cerrar sesión" que
      // reporta la clienta NO se pudo reproducir aquí, ni en desarrollo ni con
      // build de producción. Este cambio es correcto de todas formas, pero no
      // está confirmado que sea la causa de aquel síntoma.
      else window.location.assign(data.redirect || "/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border border-[#F5E1E7] rounded-2xl px-4 pl-11 py-3.5 text-[14px] text-[#3A2530] bg-white placeholder:text-[#c0a0a8] focus:outline-none focus:ring-2 focus:ring-[#C77D93]/40 focus:border-[#C77D93] transition";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ══════════════════════════════
          PANEL IZQUIERDA — imagen + overlay
      ══════════════════════════════ */}
      <div className="lg:w-[45%] relative flex flex-col items-center justify-center
                      px-8 py-12 lg:py-0 overflow-hidden min-h-[420px] lg:min-h-screen">

        {/* Imagen de fondo — pon tu foto aquí */}
        <Image
          src="/carrusel/imagen21.jpg"
          alt="Au pair background"
          fill
          className="object-cover object-center"
          priority
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=90"; }}
        />

        {/* Overlay degradado rosa — más opaco para que resalte el texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#a0435f]/95 via-[#a0435f]/90 to-[#3A2530]/95" />

        {/* Puntitos */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotsL" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotsL)" />
        </svg>

        {/* Sparkles decorativos */}
        <span className="absolute top-8 left-10 text-white/40 text-[20px] select-none">✦</span>
        <span className="absolute top-16 right-16 text-white/30 text-[13px] select-none">✦</span>
        <span className="absolute bottom-24 left-14 text-white/30 text-[16px] select-none">✦</span>

        {/* Contenido */}
        <div className="relative z-10 text-center w-full max-w-xs mx-auto">

          {/* Logo */}
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair"
                 width={64} height={64}
                 className="mx-auto mb-5 brightness-0 invert opacity-90" />

          {/* Título */}
          <h2 className="font-serif font-bold text-white text-[34px] lg:text-[42px] leading-tight mb-2 drop-shadow-lg">
            Bienvenida
          </h2>
          <h2 className="font-serif font-bold italic text-[#FCE8EE] text-[34px] lg:text-[42px] leading-tight mb-4 drop-shadow-lg">
            de vuelta.
          </h2>
          <div className="flex justify-center mb-5">
            <span className="text-white/50 text-[20px]">♡</span>
          </div>
          <p className="text-white/90 text-[13px] xl:text-[14px] leading-relaxed max-w-[240px] mx-auto mb-8 drop-shadow-sm font-medium">
            Tu proceso ya comenzó.<br />
            Ahora sigamos preparándote para<br />
            llegar lista a tu experiencia Au Pair.
          </p>

          {/* Card de progreso */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 text-left backdrop-blur-sm mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/70 text-[10px] font-bold tracking-[2px] uppercase">Tu progreso</p>
              <p className="text-[#FCE8EE] text-[10px] font-semibold">37% completado</p>
            </div>
            {/* Barra de progreso */}
            <div className="w-full h-1.5 bg-white/20 rounded-full mb-4">
              <div className="h-full w-[37%] bg-gradient-to-r from-[#FCE8EE] to-[#C77D93] rounded-full" />
            </div>
            <div className="space-y-2.5">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {/* Ícono estado */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    s.status === "done"   ? "bg-white/25 border border-white/30"
                    : s.status === "active" ? "bg-white"
                    : "bg-white/10 border border-white/15"
                  }`}>
                    {s.status === "done" && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    )}
                    {s.status === "active" && (
                      <svg viewBox="0 0 12 12" fill="#a0435f" className="w-3 h-3">
                        <path d="M3 2l7 4-7 4V2z"/>
                      </svg>
                    )}
                    {s.status === "locked" && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <rect x="2.5" y="5.5" width="7" height="5" rx="1"
                              stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                        <path d="M4 5.5V4a2 2 0 014 0v1.5"
                              stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-[11px] font-medium leading-none ${
                      s.status === "active" ? "text-white"
                      : s.status === "done" ? "text-white/60"
                      : "text-white/30"
                    }`}>{s.label}</p>
                    <p className={`text-[9px] mt-0.5 ${
                      s.status === "active" ? "text-[#FCE8EE]"
                      : "text-white/30"
                    }`}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card comunidad */}
          <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3.5
                          flex items-center gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Users size={16} className="text-white" strokeWidth={1.5}/>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-[11px] leading-snug">
                Únete a una comunidad de chicas<br/>colombianas que ya están viviendo<br/>su sueño en USA.
              </p>
            </div>
          </div>

          {/* Avatars */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white/40 overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover"/>
                </div>
              ))}
            </div>
            <span className="text-white/70 text-[11px] ml-2">+2K</span>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════
          PANEL DERECHA — formulario
      ══════════════════════════════ */}
      <div className="flex-1 bg-[#FBF4F6] flex flex-col items-center justify-between
                      px-6 sm:px-10 xl:px-16 py-10 xl:py-12 relative overflow-hidden">

        {/* Burbuja decorativa derecha */}
        <div className="absolute top-8 right-6 pointer-events-none opacity-20 select-none">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="56" cy="28" r="22" stroke="#a0435f" strokeWidth="1.8" strokeDasharray="5 4"/>
            <path d="M56 50 Q48 62 40 68" stroke="#a0435f" strokeWidth="1.5"
                  strokeDasharray="4 3" strokeLinecap="round"/>
            <path d="M56 22 C56 19 52 16 52 13 C52 10 56 10 56 13 C56 10 60 10 60 13 C60 16 56 19 56 22Z"
                  fill="#a0435f"/>
          </svg>
        </div>

        {/* Formulario card */}
        <div className="w-full max-w-md xl:max-w-lg mx-auto">

          {/* Ícono mail */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-[#FCE8EE] border border-[#C77D93]
                            flex items-center justify-center relative">
              <Mail size={24} className="text-[#a0435f]" strokeWidth={1.5}/>
              <span className="absolute -top-1 -right-1 text-[14px]">✦</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-serif font-bold text-center text-[28px] xl:text-[32px]
                         text-[#3A2530] mb-1">
            Iniciar{" "}
            <span className="italic text-[#a0435f]">sesión</span>
          </h1>
          <p className="text-center text-[13px] xl:text-[14px] text-[#9C8790] mb-8">
            Ingresa a tu cuenta para continuar tu Destino Au Pair.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px]
                            px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] xl:text-[12px] font-bold tracking-[2px]
                                uppercase text-[#3A2530] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A9B4]" strokeWidth={1.5}/>
                <input name="email" type="email" placeholder="info@destino-aupair.com"
                       value={form.email} onChange={handleChange} required
                       className={inputBase}/>
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] xl:text-[12px] font-bold tracking-[2px]
                                  uppercase text-[#3A2530]">
                  Contraseña
                </label>
                <Link href="/forgot-password" style={{ fontSize:13, color:"#a0435f", textDecoration:"none" }}>
  ¿Olvidaste tu contraseña?
</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A9B4]" strokeWidth={1.5}/>
                <input name="password" type={showPassword ? "text" : "password"}
                       placeholder="••••••••••••••"
                       value={form.password} onChange={handleChange} required
                       className={`${inputBase} pr-11`}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A9B4] hover:text-[#a0435f] transition">
                  {showPassword ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setRemember(!remember)}
                   className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                     remember ? "bg-[#a0435f] border-[#a0435f]" : "border-[#e8b0bc] bg-white"
                   }`}>
                {remember && (
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[13px] text-[#9C8790]">Recordarme en este dispositivo</span>
            </label>

            {/* CTA */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#a0435f] to-[#c9607a]
                         hover:from-[#7D2F47] hover:to-[#b54f68]
                         disabled:opacity-60 text-white font-semibold
                         text-[15px] xl:text-[16px] py-4 rounded-2xl
                         shadow-lg shadow-[#a0435f]/30 transition-all duration-200">
              {loading ? "Ingresando..." : "Ingresar a mi destino →"}
            </button>

            <p className="text-center text-[13px] text-[#9C8790]">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-[#a0435f] font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </form>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { icon: Users,  val: "+2.094", label: "chicas ya viven la experiencia Au Pair" },
              { icon: null,   flag: true,    val: "Comunidad", label: "Colombiana en USA"     },
              { icon: Heart,  val: "Acompañamiento", label: "real en cada paso del proceso"   },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[#F5E1E7] rounded-2xl
                                      px-3 py-4 text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#FCE8EE] border border-[#C77D93]
                                flex items-center justify-center mx-auto mb-2">
                  {s.flag
                    ? <img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-5 h-4 rounded-sm object-cover"/>
                    : <s.icon size={16} className="text-[#a0435f]" strokeWidth={1.5}/>
                  }
                </div>
                <p className="text-[12px] font-bold text-[#a0435f] leading-snug">{s.val}</p>
                <p className="text-[10px] text-[#9C8790] leading-snug mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redes sociales */}
        <div className="w-full max-w-md xl:max-w-lg mx-auto mt-8 text-center">
          <p className="text-[13px] text-[#3A2530] font-semibold mb-4">
            Síguenos en nuestras <span className="italic text-[#a0435f]">redes</span>{" "}
            <span className="text-[14px]">✦</span>
          </p>
          <div className="flex items-center justify-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                 aria-label={label}
                 className="w-11 h-11 rounded-full bg-white border border-[#F5E1E7]
                            flex items-center justify-center text-[#9C8790]
                            hover:text-[#a0435f] hover:border-[#C77D93]
                            hover:shadow-md transition-all duration-200">
                <Icon />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}