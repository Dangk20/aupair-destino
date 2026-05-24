"use client";
// app/reset-password/page.jsx

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  const [password,  setPassword]  = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showP,     setShowP]     = useState(false);
  const [showC,     setShowC]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [exito,     setExito]     = useState(false);
  const [error,     setError]     = useState("");
  const [emailExito,setEmailExito]= useState("");

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido. Solicita uno nuevo.");
    }
  }, [token]);

  // Requisitos de contraseña
  const reqs = [
    { label:"Mínimo 8 caracteres",     ok: password.length >= 8 },
    { label:"Al menos una mayúscula",   ok: /[A-Z]/.test(password) },
    { label:"Al menos un número",       ok: /[0-9]/.test(password) },
  ];
  const passwordOk   = reqs.every(r => r.ok);
  const coinciden    = password === confirmar && confirmar !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordOk) { setError("La contraseña no cumple los requisitos."); return; }
    if (!coinciden)  { setError("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailExito(data.email || "");
        setExito(true);
        setTimeout(() => router.push("/login"), 4000);
      } else {
        setError(data.error || "Error al restablecer. Intenta de nuevo.");
      }
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };

  /* ── Sin token ── */
  if (!token) return (
    <div className="bg-white rounded-3xl border border-[#f0dde2] shadow-xl shadow-[#a0435f]/8 px-8 py-10 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="font-serif font-bold text-[22px] text-[#2d1a22] mb-3">Enlace inválido</h2>
      <p className="text-[13px] text-[#9a6672] mb-6 leading-relaxed">
        Este enlace no es válido o ya expiró. Solicita uno nuevo desde la página de inicio de sesión.
      </p>
      <Link href="/forgot-password"
        className="block w-full bg-[#a0435f] text-white font-semibold text-[14px] py-3.5 rounded-2xl text-center no-underline hover:bg-[#8a3550] transition">
        Solicitar nuevo enlace
      </Link>
    </div>
  );

  /* ── Éxito ── */
  if (exito) return (
    <div className="bg-white rounded-3xl border border-[#f0dde2] shadow-xl shadow-[#a0435f]/8 px-8 py-10 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-[#e8f0e0] border border-[#c8e0c0] flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500"/>
        </div>
      </div>
      <h2 className="font-serif font-bold text-[24px] text-[#2d1a22] mb-3">¡Contraseña actualizada!</h2>
      <p className="text-[13px] text-[#9a6672] mb-6 leading-relaxed">
        Tu contraseña fue restablecida correctamente.{emailExito && <><br/>Cuenta: <strong className="text-[#a0435f]">{emailExito}</strong></>}
        <br/><br/>
        Serás redirigida al inicio de sesión en unos segundos...
      </p>
      <div className="w-full bg-[#f0dde2] rounded-full h-1.5 overflow-hidden mb-6">
        <div className="h-full bg-[#a0435f] rounded-full animate-[shrink_4s_linear_forwards]"/>
      </div>
      <Link href="/login"
        className="block w-full bg-[#a0435f] text-white font-semibold text-[14px] py-3.5 rounded-2xl text-center no-underline hover:bg-[#8a3550] transition">
        Ir al inicio de sesión →
      </Link>
      <style>{`@keyframes shrink{from{width:100%}to{width:0%}}`}</style>
    </div>
  );

  /* ── Formulario ── */
  return (
    <div className="bg-white rounded-3xl border border-[#f0dde2] shadow-xl shadow-[#a0435f]/8 px-8 py-10">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center">
          <Lock size={26} className="text-[#a0435f]" strokeWidth={1.5}/>
        </div>
      </div>
      <h1 className="font-serif font-bold text-center text-[26px] text-[#2d1a22] mb-2">
        Nueva contraseña
      </h1>
      <p className="text-center text-[13px] text-[#9a6672] mb-8 leading-relaxed">
        Elige una contraseña segura para tu cuenta.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nueva contraseña */}
        <div>
          <label className="block text-[10px] font-bold tracking-[2px] uppercase text-[#2d1a22] mb-1.5">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0909a]" strokeWidth={1.5}/>
            <input
              type={showP?"text":"password"} required
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#f0dde2] rounded-2xl px-4 pl-11 pr-11 py-3.5 text-[14px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] transition"/>
            <button type="button" onClick={() => setShowP(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0909a] hover:text-[#a0435f] transition">
              {showP ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>

          {/* Requisitos */}
          {password && (
            <div className="mt-3 space-y-1.5">
              {reqs.map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${r.ok?"bg-green-500":"bg-[#f0dde2]"}`}>
                    {r.ok && <CheckCircle2 size={10} className="text-white"/>}
                  </div>
                  <span className={`text-[11px] ${r.ok?"text-green-600 font-semibold":"text-[#9a6672]"}`}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmar */}
        <div>
          <label className="block text-[10px] font-bold tracking-[2px] uppercase text-[#2d1a22] mb-1.5">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0909a]" strokeWidth={1.5}/>
            <input
              type={showC?"text":"password"} required
              placeholder="••••••••"
              value={confirmar} onChange={e => setConfirmar(e.target.value)}
              className={`w-full border rounded-2xl px-4 pl-11 pr-11 py-3.5 text-[14px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 transition
                ${confirmar && !coinciden
                  ? "border-red-300 focus:ring-red-200/50 focus:border-red-400"
                  : coinciden
                  ? "border-green-300 focus:ring-green-200/50 focus:border-green-400"
                  : "border-[#f0dde2] focus:ring-[#e8849a]/30 focus:border-[#e8849a]"}`}/>
            <button type="button" onClick={() => setShowC(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0909a] hover:text-[#a0435f] transition">
              {showC ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {confirmar && !coinciden && (
            <p className="text-[11px] text-red-500 mt-1.5">Las contraseñas no coinciden</p>
          )}
          {coinciden && (
            <p className="text-[11px] text-green-600 font-semibold mt-1.5">✓ Las contraseñas coinciden</p>
          )}
        </div>

        <button type="submit" disabled={loading || !passwordOk || !coinciden}
          className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-2xl shadow-lg shadow-[#a0435f]/20 transition">
          {loading ? "Actualizando..." : "Restablecer contraseña"}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#f0dde2] text-center">
        <Link href="/login" className="text-[13px] text-[#9a6672] hover:text-[#a0435f] transition">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/login">
            <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={56} height={56}/>
          </Link>
        </div>
        <Suspense fallback={
          <div className="bg-white rounded-3xl border border-[#f0dde2] p-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
          </div>
        }>
          <ResetPasswordForm/>
        </Suspense>
      </div>
    </div>
  );
}