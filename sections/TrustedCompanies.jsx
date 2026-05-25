"use client";

import Marquee from "react-fast-marquee";
import { Heart, Users, Globe, Sparkles, Star, Home, Plane, MapPin } from "lucide-react";

const fila1 = [
  { src: "/carrusel/imagen1.jpg",   caption: "Nuevos comienzos",               icon: Star  },
  { src: "/carrusel/imagen2.jpg",   caption: "Descubriendo mi nueva ciudad",   icon: Globe },
  { src: "/carrusel/imagen3.jpg",   caption: "Mi hogar lejos de casa",         icon: Home  },
  { src: "/carrusel/imagen4.jpg",   caption: "Aventuras inolvidables",         icon: Plane },
  { src: "/carrusel/imagen5.jpg",   caption: "Amistades que duran para siempre", icon: Star },
  { src: "/carrusel/imagen6.jpg",   caption: "Experiencias que marcan",        icon: Heart },
  { src: "/carrusel/imagen7.jpeg",  caption: "Conexiones que me transforman",  icon: Plane },
  { src: "/carrusel/imagen8.jpeg",  caption: "Creciendo cada día",             icon: Heart },
  { src: "/carrusel/imagen9.jpg",   caption: "Nuevos comienzos",               icon: Star  },
  { src: "/carrusel/imagen11.jpg",  caption: "Mi aventura empieza",            icon: Sparkles },
  { src: "/carrusel/imagen23.jpg",  caption: "Viviendo el sueño",              icon: Star  },
];

const fila2 = [
  { src: "/carrusel/imagen13.jpg",  caption: "Lo que soñé, lo logré",          icon: Heart },
  { src: "/carrusel/imagen14.jpg",  caption: "Mi destino, mi historia",        icon: Heart },
  { src: "/carrusel/imagen16.jpg",  caption: "Momentos que se quedan",         icon: Star  },
  { src: "/carrusel/imagen15.jpg",  caption: "Retos que me hicieron más fuerte", icon: Users },
  { src: "/carrusel/imagen18.jpg",  caption: "Mi red de apoyo",                icon: Heart },
  { src: "/carrusel/imagen19.jpg",  caption: "Nuevas culturas, nuevas yo",     icon: Globe },
  { src: "/carrusel/imagen20.jpeg", caption: "Un año que cambia todo",         icon: Heart },
  { src: "/carrusel/imagen21.jpg",  caption: "Recuerdos para toda la vida",    icon: Plane },
  { src: "/carrusel/imagen22.jpeg", caption: "Au Pair en USA",                 icon: MapPin },
  { src: "/carrusel/imagen12.jpg",  caption: "Sonrisas y recuerdos",           icon: Star  },
  { src: "/carrusel/imagen24.jpg",  caption: "¡Lo lograste!",                  icon: Sparkles },
];

const statsTop = [
  { icon: Heart,    title: "Historias reales",   desc: "De chicas colombianas que ya lo vivieron." },
  { icon: Users,    title: "Misma meta",          desc: "Nuevas culturas, crecimiento personal y grandes recuerdos." },
  { icon: Globe,    title: "Mismo destino",       desc: "Ciudades increíbles, nuevos desafíos, aprendizaje real." },
  { icon: Sparkles, title: "Mismo sentimiento",   desc: "Transformación, independencia y confianza en sí mismas." },
];

const statsBottom = [
  { icon: Users,    val: "+2.094", label: "chicas colombianas ya vivieron su destino." },
  { icon: Globe,    val: "+20",    label: "estados en USA donde han creado su historia." },
  { icon: Heart,    val: "Historias reales", label: "de transformación, crecimiento e independencia." },
  { icon: Sparkles, val: "Tú puedes ser",   label: "la próxima historia que inspire a otras." },
];

function FotoCard({ foto }) {
  const Icon = foto.icon;
  return (
    <div className="mx-2 relative w-[168px] h-[220px] xl:w-[188px] xl:h-[240px] 2xl:w-[200px] 2xl:h-[256px]
                    rounded-2xl overflow-hidden shrink-0 group cursor-pointer">
      <img src={foto.src} alt={foto.caption}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a3d]/75 via-[#1a0a3d]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end gap-2">
        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon size={11} className="text-white" />
        </div>
        <p className="text-white text-[11px] font-medium leading-snug">{foto.caption}</p>
      </div>
    </div>
  );
}

/* ── Avión de papel + corazón punteado — IZQUIERDA ── */
function LeftDecoration() {
  return (
    <svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Corazón punteado */}
      <path
        d="M120 195 C75 162 18 125 18 78 C18 48 42 28 68 42 C88 52 120 82 120 82 C120 82 152 52 172 42 C198 28 222 48 222 78 C222 125 165 162 120 195Z"
        stroke="#8b72cc" strokeWidth="3" strokeDasharray="8 6"
        fill="none" strokeLinecap="round"
      />
      {/* Corazón relleno pequeño en la punta superior */}
      <path d="M120 38 C120 33 115 28 115 22 C115 16 120 16 120 22 C120 16 125 16 125 22 C125 28 120 33 120 38Z"
            fill="#8b72cc"/>
      {/* Avión de papel — apuntando arriba-derecha, en la esquina inferior izq del corazón */}
      <g transform="translate(28, 170) rotate(-50)">
        {/* cuerpo principal */}
        <path d="M0 16 L36 0 L26 28 L16 18 Z" fill="#8b72cc"/>
        {/* pliegue inferior */}
        <path d="M0 16 L16 18 L13 28 Z"        fill="#5a3a90"/>
        {/* línea central del doblez */}
        <line x1="16" y1="18" x2="36" y2="0" stroke="#5a3a90" strokeWidth="1.2"/>
      </g>
    </svg>
  );
}

/* ── Avión comercial + curva punteada — DERECHA ── */
function RightDecoration() {
  return (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Trayectoria curva punteada */}
      <path d="M30 185 Q90 120 155 40"
            stroke="#8b72cc" strokeWidth="3" strokeDasharray="8 6"
            fill="none" strokeLinecap="round"/>
      {/* Corazón relleno al final de la curva */}
      <path d="M156 34 C156 30 151 25 151 20 C151 15 156 15 156 20 C156 15 161 15 161 20 C161 25 156 30 156 34Z"
            fill="#8b72cc"/>
      {/* Diamante / estrella decorativa */}
      <path d="M195 70 L200 62 L205 70 L200 78 Z" fill="#8b72cc" opacity="0.55"/>
      <path d="M205 120 L208 114 L211 120 L208 126 Z" fill="#8b72cc" opacity="0.4"/>
      {/* Corazón pequeño decorativo */}
      <path d="M35 168 C35 165 31 162 31 159 C31 156 35 156 35 159 C35 156 39 156 39 159 C39 162 35 165 35 168Z"
            fill="#8b72cc" opacity="0.5"/>
      {/* Avión comercial — rotado siguiendo la curva */}
      <g transform="translate(100, 112) rotate(-52)">
        {/* fuselaje */}
        <ellipse cx="0" cy="0" rx="32" ry="8" fill="#8b72cc"/>
        {/* ala principal */}
        <path d="M-4 -4 Q10 -22 26 -14 L14 2Z"  fill="#5a3a90"/>
        {/* ala inferior trasera */}
        <path d="M-4 4  Q10  18  24  12 L14 0Z"  fill="#5a3a90" opacity="0.7"/>
        {/* aleta de cola */}
        <path d="M-24 -3 Q-30 -13 -22 -10 L-18 0Z" fill="#5a3a90"/>
        {/* ventanas */}
        <circle cx="-4"  cy="0" r="3" fill="white" opacity="0.85"/>
        <circle cx="5"   cy="0" r="3" fill="white" opacity="0.85"/>
        <circle cx="14"  cy="0" r="3" fill="white" opacity="0.75"/>
      </g>
    </svg>
  );
}

export default function PhotoCarousel() {
  return (
    <section id="experiencia" className="py-16 xl:py-20 bg-[#ede9f8] w-full relative">

      {/* ═══ AVIÓN DE PAPEL — IZQUIERDA ═══ */}
      <div className="absolute pointer-events-none select-none z-0"
           style={{
             left: "10%", top: "6%",
             width: "clamp(140px, 15vw, 220px)",
             filter: "invert(55%) sepia(25%) saturate(500%) hue-rotate(220deg) opacity(0.35)",
           }}>
        <img src="assets/love-message.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* ═══ AVIÓN COMERCIAL — DERECHA ═══ */}
      <div className="absolute pointer-events-none select-none z-0"
           style={{
             right: "7%", top: "6%",
             width: "clamp(140px, 15vw, 220px)",
             filter: "invert(55%) sepia(25%) saturate(500%) hue-rotate(220deg) opacity(0.35)",
           }}>
        <img src="assets/love-message.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-10 px-4 relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#c4b0e8]/80 border border-[#a98dd4]
                        px-4 py-1.5 rounded-full mb-5">
          <span className="text-[15px] leading-none">✨</span>
          <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-[#3d1a7a]">
            La experiencia Au Pair
          </span>
        </div>

        <p className="text-[14px] xl:text-[16px] text-[#5a4080] mb-1">En el <strong>2025</strong></p>

        <h2 className="font-serif font-bold text-[#1a0a3d] leading-[1.1] mb-4">
          <span className="block text-[36px] md:text-[48px] xl:text-[56px] 2xl:text-[64px]">
            +2.094 chicas <span className="text-[#7c5cc4]">YA</span>
          </span>
          <span className="block text-[36px] md:text-[48px] xl:text-[56px] 2xl:text-[64px] italic text-[#7c5cc4]">
            vivieron esta aventura
          </span>
        </h2>

        <p className="text-[14px] xl:text-[16px] text-[#5a4080] leading-relaxed max-w-md mx-auto">
          Cada ciudad en USA es única,<br />
          <span className="text-[#7c5cc4] font-medium">y cada experiencia también lo es.</span>
        </p>
      </div>

      {/* ── STATS SUPERIORES ── */}
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 xl:px-10 mb-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6">
          {statsTop.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-start gap-3 bg-white/50 border border-[#d4c4f0]
                                      rounded-2xl px-4 py-4 xl:px-5 xl:py-5">
                <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-[#ede9f8] border border-[#c4b0e8]
                                flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#7c5cc4]" />
                </div>
                <div>
                  <p className="text-[12px] xl:text-[13px] font-bold text-[#1a0a3d] mb-0.5">{s.title}</p>
                  <p className="text-[11px] xl:text-[12px] text-[#7060a0] leading-snug">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARQUEE FILA 1 ── */}
      <Marquee gradient gradientColor="#ede9f8" gradientWidth={80} speed={35} className="mb-3">
        <div className="flex items-center py-2">
          {[...fila1, ...fila1].map((foto, i) => <FotoCard key={i} foto={foto} />)}
        </div>
      </Marquee>

      {/* ── MARQUEE FILA 2 ── */}
      <Marquee gradient gradientColor="#ede9f8" gradientWidth={80} speed={35} direction="right">
        <div className="flex items-center py-2">
          {[...fila2, ...fila2].map((foto, i) => <FotoCard key={i} foto={foto} />)}
        </div>
      </Marquee>

      {/* ══════════════════════════════════════
          STATS INFERIORES — tarjeta ovalada
          con líneas divisorias internas
      ══════════════════════════════════════ */}
      <div className="relative z-10 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 xl:px-10 mt-12">
        <div className="bg-[#d4c4f0] rounded-[32px]
                        px-6 xl:px-10 py-6 xl:py-8
                        shadow-inner shadow-[#b8a0e0]/30">
          <div className="grid grid-cols-2 md:grid-cols-4
                          divide-y-2 md:divide-y-0 md:divide-x-2
                          divide-[#b8a0e0]/60">
            {statsBottom.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center gap-2
                                        px-3 xl:px-6 py-4 md:py-0">
                  <Icon size={26} className="text-[#3d1a7a]" strokeWidth={1.6} />
                  <div>
                    <p className="text-[13px] xl:text-[15px] font-bold text-[#1a0a3d] leading-snug">
                      {s.val}
                    </p>
                    <p className="text-[10px] xl:text-[12px] text-[#3d1a7a] leading-snug mt-0.5 max-w-[140px]">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}