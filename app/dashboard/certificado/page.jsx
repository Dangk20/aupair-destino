"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, CheckCircleIcon } from "lucide-react";

export default function CertificadoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fecha] = useState(new Date().toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric"
  }));

  useEffect(() => {
    fetch("/api/dashboard/sesiones")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.completadas < d.total) { router.push("/dashboard"); return; }
        setLoading(false);
      });

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8f9] py-10 px-4">

      {/* Botón descargar */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <a href="/dashboard" className="text-[13px] text-[#9a6672] hover:text-[#a0435f] transition">
          ← Volver
        </a>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition"
        >
          <DownloadIcon size={14} />
          Descargar certificado
        </button>
      </div>

      {/* Certificado */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[#a0435f]/10 border border-[#f0dde2] print:shadow-none print:rounded-none">

        <div className="h-3 bg-gradient-to-r from-[#2d1a22] via-[#e8849a] to-[#2d1a22]" />

        <div className="p-10 md:p-14 text-center">

          <div className="flex justify-center mb-6">
            <img src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" className="h-16 w-auto" />
          </div>

          <p className="text-[11px] font-semibold tracking-[4px] text-[#9a6672] uppercase mb-2">
            Certifica que
          </p>
          <h1 className="font-serif text-[38px] md:text-[46px] font-bold text-[#2d1a22] leading-tight mb-2">
            {user?.nombre} {user?.apellido}
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#e8849a] to-transparent mx-auto mb-6" />

          <p className="text-[15px] text-[#7a4a54] leading-relaxed max-w-md mx-auto mb-8">
            Ha completado satisfactoriamente el programa
          </p>

          <div className="bg-[#fff8f9] border border-[#f0dde2] rounded-2xl px-8 py-5 inline-block mb-8">
            <p className="font-serif text-[22px] font-bold text-[#2d1a22]">Destino Au Pair</p>
            <p className="text-[12px] text-[#9a6672] mt-1">Programa completo de preparación au pair · 8 sesiones</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            <CheckCircleIcon size={14} className="text-[#a0435f]" />
            <p className="text-[13px] text-[#9a6672]">Completado el {fecha}</p>
          </div>

          <div className="flex items-end justify-center gap-16">
            <div className="text-center">
              <div className="w-28 h-px bg-[#e8b0bc] mb-2 mx-auto" />
              <p className="text-[13px] font-semibold text-[#2d1a22]">Jennifer</p>
              <p className="text-[11px] text-[#9a6672]">Co-fundadora</p>
            </div>
            <div className="text-center">
              <div className="w-28 h-px bg-[#e8b0bc] mb-2 mx-auto" />
              <p className="text-[13px] font-semibold text-[#2d1a22]">Tati</p>
              <p className="text-[11px] text-[#9a6672]">Co-fundadora</p>
            </div>
          </div>

        </div>

        <div className="h-3 bg-gradient-to-r from-[#2d1a22] via-[#e8849a] to-[#2d1a22]" />
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none { position: fixed; top: 0; left: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}