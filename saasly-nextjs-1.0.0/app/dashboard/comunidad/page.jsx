"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ComunidadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (!d.user?.tiene_acceso) { router.push("/dashboard"); return; }
        setUser(d.user);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8f9]">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="font-serif text-[32px] font-bold text-[#2d1a22] mb-3">
            Comunidad Destino Au Pair
          </h1>
          <p className="text-[15px] text-[#7a4a54] leading-relaxed max-w-md mx-auto">
            Bienvenida al espacio exclusivo para au pairs en proceso. Aquí vas a encontrar apoyo, respuestas y amigas que están viviendo lo mismo que tú.
          </p>
        </div>

        {/* Card principal WhatsApp */}
        <div className="bg-white border border-[#f0dde2] rounded-3xl p-8 mb-6 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </div>
          <h2 className="font-serif text-[20px] font-bold text-[#2d1a22] mb-2">
            Grupo de WhatsApp
          </h2>
          <p className="text-[13px] text-[#9a6672] mb-6 leading-relaxed">
            Más de 500 chicas latinoamericanas compartiendo experiencias, consejos y apoyo en su camino au pair.
          </p>
          <a
            href="https://chat.whatsapp.com/TU-LINK-AQUI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba58] text-white font-medium text-[14px] px-8 py-3.5 rounded-2xl transition shadow-lg shadow-[#25D366]/20"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Unirme al grupo
          </a>
        </div>

        {/* Qué encontrarás */}
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-6 mb-6">
          <h3 className="font-serif text-[16px] font-bold text-[#2d1a22] mb-4">¿Qué vas a encontrar?</h3>
          <ul className="space-y-3">
            {[
              { emoji: "🤝", text: "Apoyo de chicas que están en el mismo proceso que tú" },
              { emoji: "💡", text: "Consejos reales de au pairs que ya llegaron a su destino" },
              { emoji: "📋", text: "Ayuda con documentos, entrevistas y dudas del proceso" },
              { emoji: "🌍", text: "Conexiones con au pairs de toda Latinoamérica" },
              { emoji: "🎉", text: "Celebraciones cuando alguien consigue su familia" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[18px] shrink-0">{item.emoji}</span>
                <p className="text-[13px] text-[#7a4a54] leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Mensaje Jennifer y Tati */}
        <div className="bg-[#fce8ed] border border-[#f0b8c4] rounded-2xl p-5 text-center">
          <p className="text-[13px] text-[#7a4a54] leading-relaxed italic mb-3">
            "Esta comunidad es un espacio seguro. Recuerda siempre ser amable, compartir lo que sabes y pedir ayuda cuando la necesites."
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-[#f0b8c4] flex items-center justify-center">
                <span className="text-[#a0435f] text-[10px] font-serif font-bold">J</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border-2 border-[#f0b8c4] flex items-center justify-center">
                <span className="text-[#6b4f9e] text-[10px] font-serif font-bold">T</span>
              </div>
            </div>
            <p className="text-[12px] font-semibold text-[#a0435f]">Jennifer y Tati</p>
          </div>
        </div>

      </div>
    </div>
  );
}