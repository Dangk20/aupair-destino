"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock, MessagesSquare, Handshake, Lightbulb, ClipboardList, PartyPopper,
} from "lucide-react";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";

export default function ComunidadPage() {
  const router = useRouter();
  const gate = useAccessGate("comunidad");
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
        setUser(d.user);
        setLoading(false);
      });
  }, []);

  if (loading || gate.loading) return <GateLoading/>;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="La comunidad privada"/>;

  return (
    <div className="min-h-screen bg-[#FBF4F6] relative overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots-com" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots-com)" />
        </svg>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FCE8EE]/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#C77D93]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <MessagesSquare size={44} className="mx-auto mb-4 text-[#c77d93]" strokeWidth={1.5}/>
          <h1 className="font-serif text-[32px] font-bold text-[#3A2530] mb-3">
            Comunidad Destino Au Pair
          </h1>
          <p className="text-[15px] text-[#9C8790] leading-relaxed max-w-lg mx-auto">
            Bienvenida al espacio exclusivo para au pairs en proceso. Aquí vas a encontrar apoyo, respuestas y amigas que están viviendo lo mismo que tú.
          </p>
        </div>

        {/* ── DOS COLUMNAS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* IZQUIERDA — Jennifer y Tati */}
          <div className="bg-white border border-[#F5E1E7] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-1 bg-gradient-to-r from-[#3A2530] via-[#C77D93] to-[#3A2530]" />

            {/* Foto grande */}
            <div className="relative h-64 overflow-hidden">
              <img
                src="/assets/jeni-tati.jpg"
                alt="Jennifer y Tati"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2530]/50 to-transparent" />
              {/* Badge sobre la foto */}
              <div className="absolute bottom-4 left-4">
                <span className="inline-block bg-white/90 backdrop-blur-sm text-[#a0435f] text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase border border-[#C77D93]">
                  Las creadoras
                </span>
              </div>
            </div>

            {/* Texto */}
            <div className="p-5 flex-1 flex flex-col">
              <h2 className="font-serif text-[22px] font-bold text-[#3A2530] mb-2">
                Destino Au Pair
              </h2>
              <p className="text-[13px] text-[#9C8790] leading-relaxed mb-3 flex-1">
                Somos el Equipo de Destino Au Pair — dos colombianas que vivimos el proceso Au Pair de primera mano y decidimos crear Destino Au Pair para que ninguna chica se sienta sola en este camino.
              </p>
              <p className="text-[13px] text-[#9C8790] leading-relaxed mb-4">
                Esta comunidad es nuestro espacio más especial: un lugar seguro donde conectas con otras chicas, resuelves dudas y celebras cada paso del proceso. 🌍
              </p>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {["Au pairs certificadas", "500+ chicas", "Colombia 🇨🇴"].map((tag, i) => (
                  <span key={i} className="text-[11px] bg-[#fff0f3] text-[#9C8790] px-2.5 py-1 rounded-full border border-[#F5E1E7]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* DERECHA — WhatsApp + info */}
          <div className="flex flex-col gap-5">

            {/* Card WhatsApp */}
            <div className="bg-white border border-[#F5E1E7] rounded-3xl p-6 text-center shadow-sm flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#25D366]/20">
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <h2 className="font-serif text-[20px] font-bold text-[#3A2530] mb-2">
                Grupo de WhatsApp
              </h2>
              <p className="text-[13px] text-[#9C8790] mb-6 leading-relaxed max-w-xs mx-auto">
                Más de 500 chicas latinoamericanas compartiendo experiencias, consejos y apoyo en su camino Au Pair.
              </p>
              <a
                href="https://chat.whatsapp.com/TU-LINK-AQUI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba58] text-white font-medium text-[14px] px-8 py-3.5 rounded-2xl transition shadow-lg shadow-[#25D366]/20 w-full justify-center"
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Unirme al grupo
              </a>
            </div>

            {/* Card qué encontrarás */}
            <div className="bg-white border border-[#F5E1E7] rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-[13px] text-[#3A2530] mb-3">¿Qué vas a encontrar?</h3>
              <ul className="space-y-2">
                {[
                  { Icono: Handshake, text: "Apoyo de chicas en el mismo proceso" },
                  { Icono: Lightbulb, text: "Consejos de au pairs que ya viajaron" },
                  { Icono: ClipboardList, text: "Ayuda con documentos y entrevistas" },
                  { Icono: PartyPopper, text: "Celebraciones de cada logro" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <item.Icono size={15} className="shrink-0 text-[#a0435f]"/>
                    <p className="text-[12px] text-[#9C8790] leading-relaxed">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mensaje final */}
        <div className="bg-[#FCE8EE] border border-[#C77D93] rounded-2xl p-5 text-center">
          <p className="text-[13px] text-[#9C8790] leading-relaxed italic mb-3">
            "Esta comunidad es un espacio seguro. Recuerda siempre ser amable, compartir lo que sabes y pedir ayuda cuando la necesites."
          </p>
          <p className="text-[12px] font-semibold text-[#a0435f]">— Destino Au Pair 💕</p>
        </div>

      </div>
    </div>
  );
}