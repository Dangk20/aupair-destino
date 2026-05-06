"use client";

import Image from "next/image";
import { PlayCircle, Unlock, FileText, Users, Heart, Infinity } from "lucide-react";

const features = [
  {
    icon: PlayCircle,
    title: "Sesiones en video",
    description: "8 videos cortos y directos. Aprende a tu propio ritmo, desde donde estés.",
    // 👇 Cambia esta ruta por tu foto real en /public/assets/
    image: "/assets/sesiones.PNG",
    fallback: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    accent: "bg-[#a0435f]",
    badge: "Contenido",
  },
  {
    icon: Unlock,
    title: "Avance progresivo",
    description: "Cada sesión se desbloquea al completar la anterior. Sin saltar pasos, sin perderse.",
    image: "/assets/avance.PNG",
    fallback: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    accent: "bg-[#e8849a]",
    badge: "Estructura",
  },
  {
    icon: FileText,
    title: "Documentación clara",
    description: "Visa, cartas de presentación, contratos — todo explicado paso a paso.",
    image: "/assets/feature-documentos.jpg",
    fallback: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    accent: "bg-[#2d1a22]",
    badge: "Documentos",
  },
  {
    icon: Users,
    title: "Comunidad exclusiva",
    description: "Al terminar el programa, accedes a la comunidad privada de Au Pairs en proceso.",
    image: "/carrusel/imagen15.jpg",
    fallback: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    accent: "bg-[#5a8a3a]",
    badge: "Comunidad",
  },
  {
    icon: Heart,
    title: "Acompañamiento real",
    description: "Tu proceso no comienza sola. En Destino Au Pair revisaremos tu situación actual contigo antes de avanzar. Queremos asegurarnos de que estés preparada en todos los aspectos.",
    image: "/assets/acompanamiento.jpeg",
    fallback: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    accent: "bg-[#c9607a]",
    badge: "Mentoring",
  },
  {
    icon: Infinity,
    title: "Acceso durante tu proceso",
    description: "Tendrás acceso al contenido y a nuestra plataforma mientras avanzas en tu camino a ser Au Pair.",
    image: "/carrusel/imagen6.jpg",
    fallback: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80",
    accent: "bg-[#8a3550]",
    badge: "Acceso",
  },
];

function FeatureImage({ src, fallback, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={(e) => { e.target.src = fallback; }}
    />
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-[#fff8f9] overflow-hidden">

      {/* ── Título llamativo ── */}
      <div className="max-w-5xl mx-auto px-4 mb-14">
        <div className="flex flex-col items-center text-center">

          <span className="inline-flex items-center gap-2 text-[#a0435f] text-[11px] font-semibold tracking-[4px] uppercase mb-5">
            <span className="w-8 h-px bg-[#e8849a]" />
            El programa
            <span className="w-8 h-px bg-[#e8849a]" />
          </span>

          <h2 className="font-serif font-bold leading-[1.05] text-[#2d1a22] mb-5">
            <span className="block text-[40px] md:text-[56px]">Todo lo que necesitas</span>
            <span className="block text-[40px] md:text-[56px] italic text-[#a0435f]">para llegar preparada</span>
          </h2>

          <p className="text-[15px] text-[#7a4a54] leading-relaxed max-w-lg">
            No es solo información — es un proceso diseñado para que tomes la mejor decisión y llegues lista.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4">

        {/* ── Banner principal ── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#a0435f] p-8 md:p-12 mb-10 shadow-2xl shadow-[#a0435f]/25">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots2)" />
          </svg>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <span className="inline-block bg-[#e8849a]/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full mb-5 tracking-widest uppercase border border-[#e8849a]/30">
                Plataforma PRO
              </span>
              {/* Título banner también llamativo */}
              <h3 className="text-white font-serif font-bold leading-snug mb-4">
                <span className="block text-[26px] md:text-[32px]">Un proceso guiado,</span>
                <span className="block text-[26px] md:text-[32px] italic text-[#fce8ed]">no una biblioteca de videos.</span>
              </h3>
              <p className="text-white/60 text-[14px] leading-relaxed max-w-md">
                Corto, claro, premium y acompañado. Diseñado para que avances
                paso a paso y llegues al final con claridad y confianza.
              </p>
            </div>
            <div className="flex gap-4 md:flex-col md:items-end shrink-0">
              {[
                { value: "8", label: "Sesiones en total" },
                { value: "+500", label: "Au pairs preparadas" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-center backdrop-blur-sm">
                  <p className="text-[#f0a0b4] font-serif text-[28px] font-bold leading-none">{s.value}</p>
                  <p className="text-white/50 text-[11px] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6 cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-[#f0dde2] shadow-md shadow-[#e8b0bc]/20 hover:shadow-xl hover:shadow-[#e8b0bc]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <FeatureImage src={feature.image} fallback={feature.fallback} alt={feature.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d1a22]/60 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/30 tracking-wide">
                    {feature.badge}
                  </span>
                  <div className={`absolute bottom-3 right-3 w-9 h-9 ${feature.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[#2d1a22] font-semibold text-[15px] mb-1.5">{feature.title}</h3>
                  <p className="text-[#7a4a54] text-[13px] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}