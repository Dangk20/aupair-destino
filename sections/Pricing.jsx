import { CheckIcon, SparklesIcon, ShieldCheckIcon, UsersIcon, InfinityIcon, VideoIcon, MessageCircleIcon, StarIcon } from "lucide-react";
import Link from "next/link";

const includes = [
  { icon: VideoIcon,          text: "8 sesiones en video (bienvenida + 7 módulos)" },
  { icon: CheckIcon,          text: "Desbloqueo progresivo — avanza a tu ritmo" },
  { icon: MessageCircleIcon,  text: "Acceso a comunidad privada al finalizar" },
  { icon: UsersIcon,          text: "Revisión directa con Jennifer y Tati" },
  { icon: InfinityIcon,       text: "Acceso de por vida al contenido" },
  { icon: ShieldCheckIcon,    text: "Documentación, visa y contratos explicados" },
];

const testimonial = {
  text: "Gracias al programa llegué a mi entrevista con la familia sin nervios. Sabía exactamente qué decir y qué preguntar.",
  name: "Valeria M.",
  country: "🇨🇴 Colombia → 🇩🇪 Alemania",
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-[#a0435f] relative overflow-hidden">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/8 rounded-full translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2d1a22]/10 rounded-full -translate-x-1/2 translate-y-1/3" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotsp" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotsp)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/25 tracking-widest uppercase mb-5">
            <SparklesIcon size={11} />
            Acceso completo
          </span>
          <h2 className="font-serif text-white text-[38px] md:text-[46px] font-bold leading-tight mb-4">
            Una inversión en tu<br />
            <span className="italic text-[#fce8ed]">próxima aventura.</span>
          </h2>
          <p className="text-white/60 text-[15px] max-w-md mx-auto leading-relaxed">
            Todo lo que necesitas para llegar preparada — en un solo programa.
          </p>
        </div>

        {/* Card + Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center">

          {/* CARD DE PRECIO */}
          <div className="relative bg-[#fff8f9] rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl shadow-[#2d1a22]/20">

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#2d1a22] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              <SparklesIcon size={11} />
              Programa completo · Pago único
            </div>

            <div className="mt-4 mb-6">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[#9a6672] text-[14px] line-through">$197 USD</span>
                <span className="bg-[#fce8ed] text-[#a0435f] text-[11px] font-semibold px-2 py-0.5 rounded-full">Oferta lanzamiento</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-[56px] font-bold text-[#2d1a22] leading-none">$97</span>
                <span className="text-[#9a6672] text-[15px] mb-1">USD</span>
              </div>
              <p className="text-[12px] text-[#9a6672] mt-1">Pago único · Sin suscripción</p>
            </div>

            <div className="w-full h-px bg-[#f0dde2] mb-6" />

            <p className="text-[11px] text-[#9a6672] font-semibold tracking-widest uppercase mb-4">Qué incluye</p>
            <ul className="space-y-3 mb-8">
              {includes.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                      <Icon size={11} className="text-[#a0435f]" />
                    </div>
                    <span className="text-[13.5px] text-[#2d1a22]">{item.text}</span>
                  </li>
                );
              })}
            </ul>

            <Link href="/register" className="w-full bg-[#a0435f] hover:bg-[#8a3550] transition text-white font-medium text-[15px] py-4 rounded-2xl shadow-lg shadow-[#a0435f]/20 mb-4 block text-center">
            Comenzar mi viaje →
            </Link>

            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon size={14} className="text-[#9a6672]" />
              <p className="text-[11px] text-[#9a6672] text-center">
                Garantía de 7 días — si no es para ti, te devolvemos el dinero.
              </p>
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="flex flex-col gap-6 w-full max-w-sm">

            <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur-sm flex-1">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={14} fill="white" className="text-white" />
                ))}
              </div>
              <p className="text-white/90 text-[14px] leading-relaxed italic mb-5">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <span className="text-white text-[13px] font-serif font-bold">V</span>
                </div>
                <div>
                  <p className="text-white text-[13px] font-medium">{testimonial.name}</p>
                  <p className="text-white/50 text-[11px]">{testimonial.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2d1a22]/20 border border-white/15 rounded-3xl p-6">
              <p className="text-white text-[11px] font-semibold tracking-widest uppercase mb-4">
                Por qué Destino Au Pair
              </p>
              <ul className="space-y-3">
                {[
                  "No es teoría — es un proceso real que funciona",
                  "Acompañamiento humano, no solo videos",
                  "Comunidad de au pairs que están en lo mismo",
                  "Acceso directo a Jennifer y Tati al finalizar",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-white/80">
                    <span className="text-white mt-0.5 shrink-0">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        <p className="text-center text-white/40 text-[11px] mt-10 tracking-wide">
          Pago seguro · Stripe · Visa · Mastercard
        </p>

      </div>
    </section>
  );
}