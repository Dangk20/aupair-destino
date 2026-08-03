"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon, DownloadIcon, CalendarIcon, StarIcon, PartyPopper,
} from "lucide-react";

export default function PantallaFinalPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#FBF4F6] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#C77D93] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF4F6]">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <PartyPopper size={52} className="mx-auto mb-4 text-[#a0435f]" strokeWidth={1.5}/>
          <div className="inline-flex items-center gap-2 bg-[#FCE8EE] border border-[#C77D93] text-[#a0435f] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-5">
            <CheckCircleIcon size={13} />
            Programa completado
          </div>
          <h1 className="font-serif text-[36px] md:text-[42px] font-bold text-[#3A2530] leading-tight mb-4">
            ¡Lo lograste,{" "}
            <span className="italic text-[#a0435f]">{user?.nombre}!</span>
          </h1>
          <p className="text-[15px] text-[#9C8790] leading-relaxed max-w-md mx-auto">
            Completaste las 8 sesiones del programa. Estás lista para dar el siguiente paso en tu camino au pair.
          </p>
        </div>

        {/* Estrellas */}
        <div className="flex justify-center gap-1 mb-10">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} size={24} fill="#C77D93" className="text-[#C77D93]" />
          ))}
        </div>

        {/* Opciones */}
        <div className="space-y-4 mb-8">

          {/* WhatsApp */}
          <a href="https://chat.whatsapp.com/TU-LINK-AQUI" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-[#F5E1E7] rounded-2xl p-5 hover:border-[#25D366] hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#3A2530] group-hover:text-[#25D366] transition">Unirme a la comunidad privada</p>
              <p className="text-[12px] text-[#9C8790] mt-0.5">Grupo de WhatsApp exclusivo para au pairs en proceso</p>
            </div>
            <span className="text-[#25D366] text-[13px] font-medium shrink-0">Entrar →</span>
          </a>

          {/* Revisión */}
          <a href="https://calendly.com/TU-LINK-AQUI" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-[#F5E1E7] rounded-2xl p-5 hover:border-[#C77D93] hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#a0435f] flex items-center justify-center shrink-0">
              <CalendarIcon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#3A2530] group-hover:text-[#a0435f] transition">Agendar revisión con Jennifer y Tati</p>
              <p className="text-[12px] text-[#9C8790] mt-0.5">Revisión personalizada de tu perfil y próximos pasos</p>
            </div>
            <span className="text-[#a0435f] text-[13px] font-medium shrink-0">Agendar →</span>
          </a>

          {/* Certificado */}
          <a href="/dashboard/certificado"
            className="flex items-center gap-4 bg-[#a0435f] rounded-2xl p-5 hover:bg-[#7D2F47] transition group">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <DownloadIcon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-white">Descargar mi certificado</p>
              <p className="text-[12px] text-white/60 mt-0.5">Certificado de finalización del programa Destino Au Pair</p>
            </div>
            <span className="text-white text-[13px] font-medium shrink-0">Descargar →</span>
          </a>
        </div>

        {/* Mensaje Jennifer y Tati */}
        <div className="bg-white border border-[#F5E1E7] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-[#FCE8EE] border-2 border-white flex items-center justify-center">
                <span className="text-[#a0435f] text-[12px] font-serif font-bold">J</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#e8e0f8] border-2 border-white flex items-center justify-center">
                <span className="text-[#6b4f9e] text-[12px] font-serif font-bold">T</span>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#3A2530]">Jennifer y Tati</p>
              <p className="text-[11px] text-[#9C8790]">Creadoras de Destino Au Pair</p>
            </div>
          </div>
          <p className="text-[14px] text-[#9C8790] leading-relaxed italic">
            "Estamos muy orgullosas de ti por llegar hasta aquí. Este es solo el comienzo de una aventura increíble. Recuerda que estamos aquí para acompañarte en cada paso. ¡Mucho éxito! 🌍✈️"
          </p>
        </div>

        {/* Volver */}
        <div className="text-center">
          <a href="/dashboard" className="text-[13px] text-[#9C8790] hover:text-[#a0435f] transition">
            ← Volver al dashboard
          </a>
        </div>

      </div>
    </div>
  );
}