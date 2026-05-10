"use client";

import { testimonialsData } from "@/data/testimonialsData";
import { Heart, Users, Globe, Sparkles, Plane, MapPin, Star, Camera, Home, MessageCircle } from "lucide-react";

/* Íconos rotativos para las cards */
const cardIcons = [Heart, Users, Plane, MessageCircle, Star, Camera, Heart, Home];

/* Stats inferiores */
const stats = [
  { icon: Users,    val: "+2.094",         label: "Chicas Au Pair ya viven su destino en USA." },
  { icon: Globe,    val: "+20",             label: "estados en USA donde nuestras colombianas han vivido." },
  { icon: Heart,    val: "Historias reales",label: "de crecimiento, independencia y nuevas oportunidades." },
  { icon: Sparkles, val: "Tú puedes ser",   label: "la próxima historia que inspire a otras." },
];

/* Palabras destacadas por card (índice → fragmentos a resaltar) */
const highlights = [
  ["cambió la vida"],
  ["mejores decisiones"],
  ["salir de mi zona de confort"],
  ["mejorar mi inglés"],
  ["aprendizajes"],
  ["muchas oportunidades"],
  ["todo esfuerzo valió la pena"],
  ["te cambia para siempre"],
];

function highlightText(text, words) {
  if (!words?.length) return text;
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <span key={i} className="text-[#6b3fa0] font-semibold not-italic">{part}</span>
      : part
  );
}

function TestimonialCard({ testimonial, index }) {
  const Icon = cardIcons[index % cardIcons.length];
  const raw = testimonialsData[index]?.text || testimonial.text;

  return (
    <div className="bg-white rounded-2xl border border-[#e0d4f5] shadow-sm
                    hover:shadow-md hover:shadow-[#c4b0e8]/30 hover:-translate-y-0.5
                    transition-all duration-300 p-5 xl:p-6 flex flex-col justify-between">

      {/* Comillas grandes */}
      <div>
        <span className="text-[48px] xl:text-[56px] font-serif text-[#7c5cc4] leading-none block mb-1">"</span>
        <p className="text-[13px] xl:text-[14px] text-[#2d1052] leading-relaxed italic -mt-4">
          {highlightText(`"${raw}"`, highlights[index])}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#ede9f8]">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-[#ede9f8]
                        flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#7c5cc4]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[12px] xl:text-[13px] font-semibold text-[#2d1052]">Au Pair en USA</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-[#7c5cc4]" />
            <span className="text-[11px] text-[#7060a0]">{testimonial.destination || "USA"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const cards = testimonialsData.slice(0, 8);

  return (
    <section id="testimonials"
      className="bg-[#ede9f8] py-16 xl:py-20 w-full relative overflow-hidden
                 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

      {/* ── Decorativos laterales ── */}
      {/* Avión papel izquierda */}
      <div className="absolute left-4 xl:left-10 top-10 pointer-events-none select-none opacity-30"
           style={{ width: "clamp(60px, 8vw, 110px)" }}>
        <img src="/paperairplane.png" alt=""
             className="w-full object-contain"
             style={{ filter: "invert(35%) sepia(40%) saturate(400%) hue-rotate(220deg)" }} />
      </div>
      {/* Corazón / burbuja derecha */}
      <div className="absolute right-4 xl:right-10 top-8 pointer-events-none select-none opacity-25">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="60" cy="30" r="24" stroke="#7c5cc4" strokeWidth="2" strokeDasharray="6 5"/>
          <path d="M60 23 C60 20 56 17 56 14 C56 11 60 11 60 14 C60 11 64 11 64 14 C64 17 60 20 60 23Z"
                fill="#7c5cc4"/>
          <path d="M60 54 Q52 66 44 72" stroke="#7c5cc4" strokeWidth="2" strokeDasharray="5 4"
                strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-12 xl:mb-16 relative z-10">

        {/* Label con líneas */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-10 xl:w-14 h-px bg-[#7c5cc4]" />
          <span className="text-[11px] xl:text-[12px] font-bold tracking-[4px] uppercase text-[#7c5cc4]">
            Testimonios
          </span>
          <span className="w-10 xl:w-14 h-px bg-[#7c5cc4]" />
        </div>

        {/* Título */}
        <h2 className="font-serif font-bold leading-[1.05] mb-5">
          <span className="block text-[36px] md:text-[52px] xl:text-[60px] 2xl:text-[68px] text-[#1a0a3d]">
            Ellas ya dieron
          </span>
          <span className="block text-[36px] md:text-[52px] xl:text-[60px] 2xl:text-[68px] italic text-[#7c5cc4]">
            el primer paso
            {/* Corazón decorativo inline */}
            <svg className="inline-block ml-3 mb-1" width="40" height="34" viewBox="0 0 40 34" fill="none">
              <path d="M20 32 C10 24 2 18 2 10 C2 5 6 2 11 4 C15 6 20 12 20 12 C20 12 25 6 29 4 C34 2 38 5 38 10 C38 18 30 24 20 32Z"
                    stroke="#7c5cc4" strokeWidth="2" strokeDasharray="5 4" fill="none"/>
            </svg>
          </span>
        </h2>

        <p className="text-[14px] xl:text-[16px] text-[#5a4080] leading-relaxed">
          Miles de colombianas han decidido vivir la experiencia Au Pair en USA.<br />
          <strong className="text-[#1a0a3d]">Esto es lo que dicen sobre su proceso.</strong>
        </p>
      </div>

      {/* ── GRID 4×2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 mb-12 xl:mb-16 relative z-10">
        {cards.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} index={i} />
        ))}
      </div>

      {/* ── STATS INFERIORES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 xl:gap-10 relative z-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-start gap-3 xl:gap-4">
              <Icon size={32} className="text-[#3d1a7a] shrink-0 mt-0.5 xl:w-10 xl:h-10" strokeWidth={1.4} />
              <div>
                <p className="text-[15px] xl:text-[18px] font-bold text-[#1a0a3d] leading-snug">{s.val}</p>
                <p className="text-[11px] xl:text-[13px] text-[#5a3a90] leading-snug mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}