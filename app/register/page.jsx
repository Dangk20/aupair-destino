"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Algo salió mal. Intenta de nuevo.");
      } else {
        router.push("/dashboard");
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fff8f9]">

      {/* ── Panel decorativo — desktop izquierda, mobile arriba ── */}
      <div className="lg:w-[45%] bg-[#a0435f] relative overflow-hidden flex flex-col items-center justify-center p-8 lg:p-12 py-10 lg:py-12">

        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotsreg" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotsreg)" />
        </svg>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#2d1a22]/20 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center w-full max-w-xs mx-auto">
          <Image
            src="/assets/destino-aupair-logo.svg"
            alt="Destino Au Pair"
            width={72} height={72}
            className="mx-auto mb-5 brightness-0 invert"
          />
          <h2 className="font-serif text-white text-[26px] lg:text-[32px] font-bold leading-tight mb-3">
            Tu aventura<br />
            <span className="italic text-[#fce8ed]">empieza aquí.</span>
          </h2>
          <p className="text-white/60 text-[13px] leading-relaxed max-w-xs mx-auto mb-6 lg:mb-10">
            Regístrate gratis y accede a la sesión de bienvenida. Sin tarjeta de crédito.
          </p>

          {/* Pasos — ocultos en mobile muy pequeño */}
          <div className="hidden sm:flex flex-col gap-3 text-left">
            {[
              { num: "01", text: "Crea tu cuenta gratis" },
              { num: "02", text: "Ve la sesión de bienvenida" },
              { num: "03", text: "Desbloquea el programa completo" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-serif text-[#fce8ed] text-[13px] font-bold w-6 shrink-0">{step.num}</span>
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/70 text-[13px]">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-12">
        <div className="w-full max-w-md">

          <h2 className="font-serif text-[26px] lg:text-[28px] font-bold text-[#2d1a22] mb-1">
            Crea tu cuenta
          </h2>
          <p className="text-[13px] text-[#9a6672] mb-7">
            Es gratis — sin tarjeta de crédito requerida.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre + Apellido — en mobile apilados, en sm en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">
                  Nombre
                </label>
                <input
                  name="fullName" type="text" placeholder="María"
                  value={form.fullName} onChange={handleChange} required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">
                  Apellido
                </label>
                <input
                  name="lastName" type="text" placeholder="García"
                  value={form.lastName} onChange={handleChange} required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">
                Correo electrónico
              </label>
              <input
                name="email" type="email" placeholder="tu@correo.com"
                value={form.email} onChange={handleChange} required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={handleChange} required
                  className={`${inputClass} pr-11`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0909a] hover:text-[#a0435f] transition">
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#2d1a22] mb-1.5 block tracking-wide uppercase">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword} onChange={handleChange} required
                  className={`${inputClass} pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0909a] hover:text-[#a0435f] transition">
                  {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox" id="terms" required
                className="mt-0.5 w-4 h-4 rounded accent-[#a0435f] cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-[12px] text-[#9a6672] cursor-pointer leading-relaxed">
                Acepto los{" "}
                <Link href="/terminos" className="text-[#a0435f] hover:underline">Términos de uso</Link>
                {" "}y la{" "}
                <Link href="/privacidad" className="text-[#a0435f] hover:underline">Política de privacidad</Link>
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white font-medium text-[14px] py-4 rounded-xl transition shadow-lg shadow-[#a0435f]/20 mt-2"
            >
              {loading ? "Creando tu cuenta..." : "Comenzar gratis →"}
            </button>

            <p className="text-center text-[13px] text-[#9a6672] pt-1">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[#a0435f] font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}