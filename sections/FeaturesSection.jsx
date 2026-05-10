"use client";

import {
  PlayCircle, Users, FileText, Plane,
  MessageCircle, Heart, Award, BookOpen,
  Video, Headphones, Gift, Sparkles,
} from "lucide-react";

const features = [
  {
    num: "01", icon: PlayCircle,
    title: "Entrenamiento completo",
    description: (
      <>Clases en video, guías y materiales para que aprendas{" "}
        <span className="text-[#a0435f] font-semibold">todo lo que necesitas saber</span> para tu proceso.</>
    ),
    image: "/assets/sesiones.PNG",
    fallback: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
  },
  {
    num: "02", icon: Users,
    title: "Preparación para entrevistas",
    description: (
      <>Te entrenamos para tus entrevistas con familias anfitrionas con{" "}
        <span className="text-[#a0435f] font-semibold">confianza</span> y{" "}
        <span className="text-[#a0435f] font-semibold">seguridad</span>.</>
    ),
    image: "/assets/avance.PNG",
    fallback: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
  },
  {
    num: "03", icon: FileText,
    title: "Documentación paso a paso",
    description: (
      <>Te guiamos para reunir y enviar todos tus documentos{" "}
        <span className="text-[#a0435f] font-semibold">sin errores</span> ni complicaciones.</>
    ),
    image: "/carrusel/documento.jpg",
    fallback: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  },
  {
    num: "04", icon: Plane,
    title: "Acompañamiento hasta tu vuelo",
    description: (
      <>Estamos <span className="text-[#a0435f] font-semibold">contigo</span> hasta tu llegada
        a la agencia: vuelo, llegada y adaptación inicial.</>
    ),
    image: "/carrusel/imagen6.jpg",
    fallback: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80",
  },
  {
    num: "05", icon: Users,
    title: "Comunidad exclusiva",
    description: (
      <>Conecta con otras Au Pairs, comparte experiencias y recibe{" "}
        <span className="text-[#a0435f] font-semibold">apoyo</span> en todo el proceso.</>
    ),
    image: "/carrusel/imagen15.jpg",
    fallback: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
  {
    num: "06", icon: MessageCircle,
    title: "Mentorías y sesiones en vivo",
    description: (
      <>Resuelve tus dudas en sesiones en vivo con{" "}
        <span className="text-[#a0435f] font-semibold">expertas</span> y recibe
        retroalimentación <span className="text-[#a0435f] font-semibold">personalizada</span>.</>
    ),
    image: "/assets/acompanamiento.jpeg",
    fallback: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
  },
  {
    num: "07", icon: Heart,
    title: "Herramientas y recursos",
    description: (
      <>Plantillas, ejemplos, listas de verificación y más para cada etapa de tu camino{" "}
        <span className="text-[#a0435f] font-semibold">Au Pair</span>.</>
    ),
    image: "/carrusel/imagen9.jpg",
    fallback: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
  },
  {
    num: "08", icon: Award,
    title: "Certificado de finalización",
    description: (
      <>Al completar el programa, recibes tu{" "}
        <span className="text-[#a0435f] font-semibold">certificado</span> y quedas
        lista para iniciar tu aventura.</>
    ),
    image: "/carrusel/certificado.jpg",
    fallback: "https://unsplash.com/es/fotos/texto-XQaqV5qYcXg",
  }
];

const bonos = [
  { icon: BookOpen,   label: "Guías prácticas descargables" },
  { icon: Video,      label: "Simulacros de entrevistas" },
  { icon: Users,      label: "Acceso a comunidad privada" },
  { icon: Headphones, label: "Soporte durante todo tu proceso" },
];

function FeatureCard({ f }) {
  const Icon = f.icon;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#f0dde2]
                    shadow-sm hover:shadow-lg hover:shadow-[#e8b0bc]/25
                    hover:-translate-y-1 transition-all duration-300">

      {/* Imagen */}
      <div className="relative h-48 xl:h-52 w-full overflow-hidden">
        <img
          src={f.image} alt={f.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = f.fallback; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d1a22]/50 to-transparent" />

        {/* Número — arriba derecha */}
        <div className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full
                        flex items-center justify-center shadow-md border border-[#f0dde2]">
          <span className="text-[12px] font-bold text-[#a0435f]">{f.num}</span>
        </div>

        {/* Ícono — abajo izquierda */}
        <div className="absolute bottom-3 left-3 w-10 h-10 bg-[#a0435f] rounded-full
                        flex items-center justify-center shadow-lg">
          <Icon size={18} className="text-white" />
        </div>
      </div>

      {/* Texto */}
      <div className="p-4 xl:p-5">
        <h3 className="text-[#2d1a22] font-bold text-[14px] xl:text-[15px] mb-1.5">
          {f.title}
        </h3>
        <p className="text-[#7a4a54] text-[12px] xl:text-[13px] leading-relaxed">
          {f.description}
        </p>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features"
      className="bg-[#fff8f9] py-16 xl:py-20 w-full
                 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

      {/* ══════════════════════════════
          HEADER — título izquierda / stats derecha
      ══════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 mb-12 xl:mb-16">

        {/* Izquierda — título */}
        <div className="flex-1 mb-8 lg:mb-0">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#fce8ed] border border-[#f0b8c4]
                          px-3 py-1.5 rounded-full mb-5">
            <span className="text-[13px]">✨</span>
            <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-[#a0435f]">
              El programa más completo para tu éxito
            </span>
          </div>

          {/* Título */}
          <h2 className="font-serif font-bold text-[#2d1a22] leading-[1.05] mb-5">
            <span className="block text-[36px] md:text-[48px] xl:text-[56px] 2xl:text-[64px]">
              Nuestro programa,
            </span>
            <span className="block text-[36px] md:text-[48px] xl:text-[56px] 2xl:text-[64px] italic text-[#a0435f]">
              diseñado para ti. <span className="not-italic">✨</span>
            </span>
          </h2>

          {/* Descripción */}
          <p className="text-[14px] xl:text-[16px] text-[#7a4a54] leading-relaxed max-w-xl">
            Te acompañamos en cada etapa con entrenamiento, herramientas y recursos
            prácticos para que llegues a la agencia{" "}
            <span className="text-[#a0435f] font-semibold">preparada</span>,{" "}
            <span className="text-[#a0435f] font-semibold">segura</span> y{" "}
            <span className="text-[#a0435f] font-semibold">lista</span>{" "}
            para vivir tu mejor experiencia.
          </p>
        </div>

        {/* Derecha — stats */}
        <div className="flex flex-row lg:flex-row gap-4 shrink-0">
          {[
            { icon: Users,  val: "+2.094", label: "Chicas Au Pair", sub: "viviendo su destino" },
            { icon: Plane,  val: "+20",    label: "estados en USA", sub: "donde puedes vivir tu experiencia Au Pair" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i}
                className="bg-white border border-[#f0dde2] rounded-2xl
                           px-6 py-6 xl:px-8 xl:py-8 flex flex-col items-center text-center
                           shadow-sm w-44 xl:w-52">
                <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-[#fce8ed] border border-[#f0b8c4]
                                flex items-center justify-center mb-3">
                  <Icon size={22} className="text-[#a0435f]" />
                </div>
                <p className="font-serif font-bold text-[#a0435f] text-[32px] xl:text-[40px] leading-none mb-1">
                  {s.val}
                </p>
                <p className="text-[13px] xl:text-[14px] font-bold text-[#2d1a22]">{s.label}</p>
                <p className="text-[11px] xl:text-[12px] text-[#9a6672] mt-0.5 leading-snug">{s.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════
          GRID 8 CARDS — 4 columnas
      ══════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 mb-8 xl:mb-10">
        {features.map((f, i) => <FeatureCard key={i} f={f} />)}
      </div>

      {/* ══════════════════════════════
          BONOS STRIP
      ══════════════════════════════ */}
      <div className="bg-[#fce8ed] border border-[#f0b8c4] rounded-2xl
                      px-8 xl:px-12 py-7 xl:py-9
                      flex flex-col sm:flex-row items-center justify-center gap-6 xl:gap-10">

        {/* Label bonos */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-full bg-[#a0435f]
                          flex items-center justify-center shadow-md">
            <Gift size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <span className="font-bold text-[#2d1a22] text-[22px] xl:text-[26px] whitespace-nowrap">
            Bonos incluidos
          </span>
        </div>

        {/* Divisor */}
        <div className="hidden sm:block w-px h-14 bg-[#f0b8c4]" />

        {/* Items */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 xl:gap-10">
          {bonos.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-[#f9d0da]
                                flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-[#a0435f]" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] xl:text-[15px] font-medium text-[#a0435f] leading-snug max-w-[100px] xl:max-w-[120px]">
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}