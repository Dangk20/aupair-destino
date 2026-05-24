"use client";
// app/forgot-password/page.jsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeftIcon } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [enviado,  setEnviado]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email }),
      });
      if (res.ok) setEnviado(true);
      else {
        const d = await res.json();
        setError(d.error || "Error al enviar el email");
      }
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/login">
            <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={86} height={86}/>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#f0dde2] shadow-xl shadow-[#a0435f]/8 px-8 py-10">

          {!enviado ? (
            <>
              {/* Header */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center">
                  <Mail size={26} className="text-[#a0435f]" strokeWidth={1.5}/>
                </div>
              </div>
              <h1 className="font-serif font-bold text-center text-[26px] text-[#2d1a22] mb-2">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-center text-[13px] text-[#9a6672] mb-8 leading-relaxed">
                No te preocupes. Escribe tu correo electrónico y te enviaremos un enlace para restablecerla.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-[2px] uppercase text-[#2d1a22] mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0909a]" strokeWidth={1.5}/>
                    <input
                      type="email" required
                      placeholder="tu@correo.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full border border-[#f0dde2] rounded-2xl px-4 pl-11 py-3.5 text-[14px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] transition"/>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:opacity-60 text-white font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-[#a0435f]/20 transition">
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            </>
          ) : (
            /* ── Estado enviado ── */
            <>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#e8f0e0] border border-[#c8e0c0] flex items-center justify-center">
                  <span className="text-4xl">📬</span>
                </div>
              </div>
              <h1 className="font-serif font-bold text-center text-[24px] text-[#2d1a22] mb-3">
                ¡Revisa tu correo!
              </h1>
              <p className="text-center text-[13px] text-[#9a6672] mb-2 leading-relaxed">
                Si existe una cuenta con el correo
              </p>
              <p className="text-center text-[14px] font-bold text-[#a0435f] mb-4">{email}</p>
              <p className="text-center text-[13px] text-[#9a6672] mb-8 leading-relaxed">
                recibirás un enlace para restablecer tu contraseña. Expira en <strong>1 hora</strong>.
              </p>
              <div className="bg-[#fff8f9] border border-[#f0dde2] rounded-xl p-4 mb-6">
                <p className="text-[12px] text-[#9a6672] text-center leading-relaxed">
                  💡 Si no ves el email, revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong>.
                </p>
              </div>
              <button onClick={() => { setEnviado(false); setEmail(""); }}
                className="w-full border border-[#f0dde2] text-[#a0435f] font-semibold text-[14px] py-3.5 rounded-2xl hover:bg-[#fce8ed] transition">
                Enviar a otro correo
              </button>
            </>
          )}

          {/* Volver al login */}
          <div className="mt-6 pt-5 border-t border-[#f0dde2] text-center">
            <Link href="/login"
              className="flex items-center justify-center gap-2 text-[13px] text-[#9a6672] hover:text-[#a0435f] transition">
              <ArrowLeftIcon size={14}/> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}