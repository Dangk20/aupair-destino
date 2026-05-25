import {
  CheckIcon, SparklesIcon, ShieldCheckIcon, UsersIcon,
  InfinityIcon, VideoIcon, MessageCircleIcon, StarIcon,
  HeartIcon, MapPinIcon,
} from "lucide-react";
import Link from "next/link";

const includes = [
  { icon: VideoIcon,         text: "8 sesiones en video (bienvenida + 7 módulos)" },
  { icon: CheckIcon,         text: "Desbloqueo progresivo — avanza a tu ritmo" },
  { icon: MessageCircleIcon, text: "Acceso a comunidad privada al finalizar" },
  { icon: UsersIcon,         text: "Revisión del perfil personalizado" },
  { icon: InfinityIcon,      text: "Acceso durante tu proceso" },
  { icon: MapPinIcon,        text: "Documentación, visa y contratos explicados" },
];

const testimonial = {
  text: "Gracias al programa llegué a mi entrevista con la familia sin nervios. Sabía exactamente qué decir y qué preguntar.",
  highlight: "Sabía exactamente qué decir y qué preguntar.",
  name: "Valeria M.",
  country: "COLOMBIA — US ESTADOS UNIDOS",
};

const reasons = [
  "No es teoría, es un proceso real que funciona",
  "Acompañamiento humano, no solo videos",
  "Comunidad de Au Pairs que están en lo mismo",
  "Acceso directo al equipo Destino Au Pair al finalizar",
];

export default function Pricing() {
  return (
    <section id="pricing"
      className="bg-[#fff8f9] py-16 xl:py-20 w-full relative overflow-hidden
                 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

      {/* ── Círculos decorativos en esquinas ── */}
      <div className="absolute top-0 left-0 pointer-events-none"
           style={{ width: "clamp(260px, 28vw, 420px)", aspectRatio: "1" }}>
        <div className="w-full h-full rounded-full bg-[#fce8ed] opacity-60
                        -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none"
           style={{ width: "clamp(200px, 22vw, 340px)", aspectRatio: "1" }}>
        <div className="w-full h-full rounded-full bg-[#fce8ed] opacity-50
                        translate-x-1/2 translate-y-1/2" />
      </div>
      {/* Círculo medio-izquierda */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none"
           style={{ width: "clamp(80px, 10vw, 140px)", aspectRatio: "1" }}>
        <div className="w-full h-full rounded-full bg-[#f0dde2] opacity-40 -translate-x-1/2" />
      </div>

      {/* ── Avión papel izquierda ── */}
      <div className="absolute pointer-events-none select-none"
           style={{ left: "3%", top: "22%", width: "clamp(70px, 8vw, 120px)",
                    filter: "invert(45%) sepia(20%) saturate(400%) hue-rotate(300deg) opacity(0.5)" }}>
        <img src="/paperairplane.png" alt="" className="w-full object-contain" />
      </div>

      {/* ── Corazón + burbuja derecha ── */}
      <div className="absolute right-4 xl:right-10 top-12 pointer-events-none select-none opacity-20">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="72" cy="38" r="26" stroke="#a0435f" strokeWidth="2" strokeDasharray="6 5"/>
          <HeartIcon className="text-[#a0435f]" style={{ position:"absolute", top:22, right:24 }} size={18}/>
          <path d="M72 64 Q64 76 56 82" stroke="#a0435f" strokeWidth="1.8"
                strokeDasharray="5 4" strokeLinecap="round"/>
          <path d="M20 75 Q28 60 40 68" stroke="#a0435f" strokeWidth="1.8"
                strokeDasharray="5 4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-12 xl:mb-16 relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#fce8ed] border border-[#f0b8c4]
                        px-4 py-1.5 rounded-full mb-6">
          <span className="text-[12px]">#</span>
          <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-[#a0435f]">
            Acceso completo
          </span>
        </div>

        {/* Título */}
        <h2 className="font-serif font-bold leading-[1.05] mb-5">
          <span className="block text-[36px] md:text-[52px] xl:text-[60px] 2xl:text-[68px] text-[#2d1a22]">
            Una inversión en tu
          </span>
          <span className="block text-[36px] md:text-[52px] xl:text-[60px] 2xl:text-[68px] italic text-[#a0435f] relative">
            próxima aventura.
            {/* Subrayado curvo */}
            <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[60%]"
                 height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0 6 Q75 1 150 5 Q225 8 300 3"
                    stroke="#e8849a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
            {/* Sparkles decorativos */}
            <span className="absolute -top-2 right-[10%] text-[20px]">✦</span>
            <span className="absolute top-2 right-[4%] text-[12px] opacity-60">✦</span>
          </span>
        </h2>

        <p className="text-[14px] xl:text-[16px] text-[#7a4a54] mt-6">
          Todo lo que necesitas para llegar preparada — en un solo programa.
        </p>
      </div>

      {/* ── DOS COLUMNAS ── */}
      <div className="flex flex-col lg:flex-row gap-5 xl:gap-6 items-start justify-center relative z-10
                      max-w-4xl xl:max-w-5xl mx-auto">

        {/* ═══ CARD PRECIO — izquierda ═══ */}
        <div className="relative bg-white rounded-3xl border border-[#f0dde2]
                        shadow-xl shadow-[#e8b0bc]/20 w-full lg:w-[52%] p-7 xl:p-9">

          {/* Badge superior centrado */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2
                          flex items-center gap-1.5 bg-[#a0435f] text-white
                          text-[10px] xl:text-[11px] font-bold px-5 py-2 rounded-full
                          shadow-md whitespace-nowrap tracking-widest uppercase">
            <CheckIcon size={11} />
            Programa completo · Pago único
          </div>

          {/* Precio */}
          <div className="mt-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#9a6672] text-[13px] line-through">$60 USD</span>
              <span className="bg-[#fce8ed] text-[#a0435f] text-[10px] font-bold
                               px-2.5 py-0.5 rounded-full">
                Oferta lanzamiento
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-[58px] xl:text-[64px] font-bold text-[#2d1a22] leading-none">
                $35
              </span>
              <span className="text-[#9a6672] text-[16px] mb-1">USD</span>
            </div>
            <p className="text-[12px] text-[#9a6672] mt-1">Pago único · Sin suscripción</p>
          </div>

          <div className="w-full h-px bg-[#f0dde2] mb-5" />

          {/* Qué incluye */}
          <p className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-[#a0435f] mb-4">
            Qué incluye
          </p>
          <ul className="space-y-3 mb-7">
            {includes.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#fce8ed] border border-[#f0b8c4]
                                  flex items-center justify-center shrink-0">
                    <Icon size={11} className="text-[#a0435f]" />
                  </div>
                  <span className="text-[13px] xl:text-[14px] text-[#2d1a22]">{item.text}</span>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <Link href="/register"
            className="w-full bg-[#a0435f] hover:bg-[#8a3550] transition text-white
                       font-semibold text-[15px] xl:text-[16px] py-4 rounded-2xl
                       shadow-lg shadow-[#a0435f]/25 mb-4 block text-center">
            Empezar mi destino
          </Link>

          {/* Garantía */}
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheckIcon size={13} className="text-[#9a6672]" />
            <p className="text-[11px] text-[#9a6672] text-center">
              Garantía de 7 días — si no es para ti, puedes transferir tu cupo.
            </p>
          </div>
        </div>

        {/* ═══ PANEL DERECHO ═══ */}
        <div className="flex flex-col gap-4 xl:gap-5 w-full lg:w-[48%] self-stretch">

          {/* Testimonio */}
          <div className="bg-[#fef2f4] rounded-3xl border border-[#f0b8c4]
                          shadow-sm p-6 xl:p-8 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={18} fill="#e8849a" className="text-[#e8849a]" />
                ))}
              </div>
              <p className="text-[15px] xl:text-[16px] text-[#2d1a22] leading-relaxed italic mb-5">
                "Gracias al programa llegué a mi entrevista con la familia sin nervios.{" "}
                <span className="text-[#a0435f] font-semibold not-italic">
                  Sabía exactamente qué decir y qué preguntar.
                </span>"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[#f0b8c4]">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-[#f0dde2]
                              flex items-center justify-center shrink-0">
                <span className="text-[#a0435f] text-[15px] font-bold font-serif">V</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#2d1a22]">{testimonial.name}</p>
                <p className="text-[11px] xl:text-[12px] text-[#9a6672] tracking-wide uppercase mt-0.5">
                  {testimonial.country}
                </p>
              </div>
            </div>
          </div>

          {/* Por qué Destino Au Pair */}
          <div className="bg-[#fef2f4] rounded-3xl border border-[#f0b8c4]
                          shadow-sm p-6 xl:p-8 flex-1 flex flex-col">
            <p className="text-[11px] xl:text-[12px] font-bold tracking-[3px] uppercase text-[#a0435f] mb-5">
              Por qué Destino Au Pair
            </p>
            <ul className="space-y-4 flex-1">
              {reasons.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] xl:text-[16px] text-[#2d1a22]">
                  <HeartIcon size={16} fill="#a0435f" className="text-[#a0435f] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Métodos de pago ── */}
      <p className="text-center text-[#9a6672] text-[12px] xl:text-[13px] mt-10 xl:mt-12 relative z-10">
        Pago seguro · transferencia bancaria · Nequi · Bancolombia · Daviplata · Davivienda · Llave?<br />
        <span className="font-medium">No tarjeta de crédito</span>
      </p>

    </section>
  );
}