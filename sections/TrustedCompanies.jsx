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
  { icon: Users,    title: "Misma meta",          desc: "Nuevas culturas, crecimiento personal y recuerdos." },
  { icon: Globe,    title: "Mismo destino",       desc: "Ciudades increíbles, aprendizaje real." },
  { icon: Sparkles, title: "Mismo sentimiento",   desc: "Transformación, independencia y confianza." },
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
    <div className="mx-1.5 relative shrink-0 rounded-2xl overflow-hidden group cursor-pointer"
         style={{ width:148, height:196 }}>
      <img src={foto.src} alt={foto.caption}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a3d]/75 via-[#1a0a3d]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end gap-2">
        <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon size={10} className="text-white" />
        </div>
        <p className="text-white text-[10px] font-medium leading-snug">{foto.caption}</p>
      </div>
    </div>
  );
}

export default function PhotoCarousel() {
  return (
    <section id="experiencia" className="py-12 xl:py-20 bg-[#ede9f8] w-full relative overflow-hidden">

      {/* Decoraciones — ocultas en mobile para no saturar */}
      <div className="hidden md:block absolute pointer-events-none select-none z-0"
           style={{ left:"10%", top:"6%", width:"clamp(140px, 15vw, 220px)", filter:"invert(55%) sepia(25%) saturate(500%) hue-rotate(220deg) opacity(0.35)" }}>
        <img src="assets/love-message.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="hidden md:block absolute pointer-events-none select-none z-0"
           style={{ right:"7%", top:"6%", width:"clamp(140px, 15vw, 220px)", filter:"invert(55%) sepia(25%) saturate(500%) hue-rotate(220deg) opacity(0.35)" }}>
        <img src="assets/love-message.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-8 px-5 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-[#c4b0e8]/80 border border-[#a98dd4] px-4 py-1.5 rounded-full mb-4">
          <span className="text-[14px] leading-none">✨</span>
          <span className="text-[10px] font-bold tracking-[3px] uppercase text-[#3d1a7a]">La experiencia Au Pair</span>
        </div>

        <p className="text-[13px] xl:text-[16px] text-[#5a4080] mb-1">En el <strong>2025</strong></p>

        <h2 className="font-serif font-bold text-[#1a0a3d] leading-[1.1] mb-3">
          <span className="block text-[30px] md:text-[48px] xl:text-[56px] 2xl:text-[64px]">
            +2.094 chicas <span className="text-[#7c5cc4]">YA</span>
          </span>
          <span className="block text-[30px] md:text-[48px] xl:text-[56px] 2xl:text-[64px] italic text-[#7c5cc4]">
            vivieron esta aventura
          </span>
        </h2>

        <p className="text-[13px] xl:text-[16px] text-[#5a4080] leading-relaxed max-w-xs mx-auto">
          Cada ciudad en USA es única,{" "}
          <span className="text-[#7c5cc4] font-medium">y cada experiencia también lo es.</span>
        </p>
      </div>

      {/* ── STATS SUPERIORES ── */}
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-5 xl:px-10 mb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:gap-6">
          {statsTop.map((s,i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 bg-white/50 border border-[#d4c4f0] rounded-2xl px-3 py-3 xl:px-5 xl:py-5">
                <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#ede9f8] border border-[#c4b0e8] flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-[#7c5cc4]" />
                </div>
                <div>
                  <p className="text-[11px] xl:text-[13px] font-bold text-[#1a0a3d] mb-0.5">{s.title}</p>
                  <p className="text-[10px] xl:text-[12px] text-[#7060a0] leading-snug">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARQUEE FILA 1 ── */}
      <Marquee gradient gradientColor="#ede9f8" gradientWidth={40} speed={32} className="mb-2.5">
        <div className="flex items-center py-2">
          {[...fila1, ...fila1].map((foto,i) => <FotoCard key={i} foto={foto}/>)}
        </div>
      </Marquee>

      {/* ── MARQUEE FILA 2 ── */}
      <Marquee gradient gradientColor="#ede9f8" gradientWidth={40} speed={32} direction="right">
        <div className="flex items-center py-2">
          {[...fila2, ...fila2].map((foto,i) => <FotoCard key={i} foto={foto}/>)}
        </div>
      </Marquee>

      {/* ── STATS INFERIORES ── */}
      <div className="relative z-10 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-5 xl:px-10 mt-10">
        <div className="bg-[#d4c4f0] rounded-[28px] px-4 xl:px-10 py-5 xl:py-8 shadow-inner shadow-[#b8a0e0]/30">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#b8a0e0]/60">
            {statsBottom.map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 px-3 xl:px-6 py-3 md:py-0">
                  <Icon size={22} className="text-[#3d1a7a]" strokeWidth={1.6}/>
                  <div>
                    <p className="text-[12px] xl:text-[15px] font-bold text-[#1a0a3d] leading-snug">{s.val}</p>
                    <p className="text-[10px] xl:text-[12px] text-[#3d1a7a] leading-snug mt-0.5 max-w-[130px]">{s.label}</p>
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