import SectionTitle from "@/components/SectionTitle";
import Image from "next/image";
import { PlayCircle, Unlock, FileText, Users, Heart, Infinity } from "lucide-react";

const features = [
  {
    icon: PlayCircle,
    title: "Sesiones en video",
    description: "8 videos cortos y directos. Aprende a tu propio ritmo, desde donde estés.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    accent: "bg-[#a0435f]",
    badge: "Contenido",
  },
  {
    icon: Unlock,
    title: "Avance progresivo",
    description: "Cada sesión se desbloquea al completar la anterior. Sin saltar pasos, sin perderse.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    accent: "bg-[#e8849a]",
    badge: "Estructura",
  },
  {
    icon: FileText,
    title: "Documentación clara",
    description: "Visa, cartas de presentación, contratos — todo explicado paso a paso.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    accent: "bg-[#2d1a22]",
    badge: "Documentos",
  },
  {
    icon: Users,
    title: "Comunidad exclusiva",
    description: "Al terminar el programa, accedes a la comunidad privada de au pairs en proceso.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    accent: "bg-[#5a8a3a]",
    badge: "Comunidad",
  },
  {
    icon: Heart,
    title: "Acompañamiento real",
    description: "Al finalizar, agenda tu revisión directa con Jennifer y Tati. No estás sola.",
    image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    accent: "bg-[#c9607a]",
    badge: "Mentoring",
  },
  {
    icon: Infinity,
    title: "Acceso de por vida",
    description: "Vuelve cuando quieras. El contenido siempre estará disponible para ti.",
    image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80",
    accent: "bg-[#8a3550]",
    badge: "Acceso",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-[#fff8f9]">

      <SectionTitle
        text1="El programa"
        text2="Todo lo que necesitas para llegar preparada"
        text3="No es solo información — es un proceso diseñado para que tomes la mejor decisión y llegues lista."
      />

      <div className="mt-10 max-w-5xl mx-auto w-full px-4">

        {/* Banner principal */}
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
              <h3 className="text-white text-2xl md:text-3xl font-serif font-bold leading-snug mb-4">
                Un proceso guiado, no <br className="hidden md:block" />
                una biblioteca de videos.
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
                  <p className="text-[#f0a0b4] font-serif text-2xl font-bold">{s.value}</p>
                  <p className="text-white/50 text-[11px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-[#f0dde2] shadow-md shadow-[#e8b0bc]/20 hover:shadow-xl hover:shadow-[#e8b0bc]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
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