import Link from "next/link";
import { ShieldCheck, FileText, Mail } from "lucide-react";

const terminos = [
  {
    num: "01",
    title: "Qué es Destino Au Pair",
    text: "Destino Au Pair es una plataforma educativa y de acompañamiento diseñada para ayudar a futuras Au Pairs a prepararse para su proceso de aplicación con agencias aliadas.",
  },
  {
    num: "02",
    title: "Qué incluye el acceso",
    text: "El acceso incluye contenido educativo en video, herramientas de preparación, acompañamiento y recursos digitales relacionados con el proceso Au Pair.",
  },
  {
    num: "03",
    title: "No garantía de aprobación",
    text: "Destino Au Pair no garantiza aprobación por parte de agencias, obtención de visa, match con familias o aceptación en programas Au Pair.",
  },
  {
    num: "04",
    title: "Uso personal y transferencias",
    text: "El acceso es personal. Sin embargo, si después de finalizar el programa la persona considera que ser Au Pair no es para ella, podrá transferir su cupo dentro de los siguientes 7 días, previa validación y autorización de Destino Au Pair.",
  },
  {
    num: "05",
    title: "Política de pagos",
    text: "No se realizan reembolsos bajo ninguna circunstancia una vez realizado el pago del programa.",
  },
  {
    num: "06",
    title: "Relación con la agencia",
    text: "Destino Au Pair trabaja junto a agencias aliadas, pero opera como plataforma independiente de preparación y acompañamiento.",
  },
  {
    num: "07",
    title: "Limitación de responsabilidad",
    text: "Destino Au Pair no es una firma legal ni migratoria. La información brindada tiene fines educativos y de acompañamiento.",
  },
];

const privacidad = [
  {
    num: "01",
    title: "Información recopilada",
    text: "Podemos recopilar información como nombre, correo electrónico, redes sociales y otros datos necesarios para acompañar tu proceso.",
  },
  {
    num: "02",
    title: "Uso de la información",
    text: "La información se utiliza únicamente para comunicación, soporte, acceso al programa y acompañamiento relacionado con el proceso Au Pair.",
  },
  {
    num: "03",
    title: "Protección de datos",
    text: "Destino Au Pair no vende ni comparte información personal con terceros no relacionados al proceso.",
  },
  {
    num: "04",
    title: "Comunicación",
    text: "Al registrarte, aceptas recibir correos, mensajes y comunicaciones relacionadas con el programa y tu proceso.",
  },
  {
    num: "05",
    title: "Seguridad",
    text: "Trabajamos para proteger tu información personal y mantener un entorno seguro dentro de nuestra plataforma.",
  },
];

function SectionBlock({ icon: Icon, label, color, items }) {
  return (
    <div className="mb-14 xl:mb-16">
      {/* Header bloque */}
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 ${color.badge}`}>
        <Icon size={14} className={color.icon} />
        <span className={`text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase ${color.icon}`}>
          {label}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.num}
            className="flex gap-4 xl:gap-5 bg-white rounded-2xl border border-[#f0dde2]
                       px-5 xl:px-6 py-4 xl:py-5 shadow-sm hover:shadow-md
                       hover:border-[#e8b0bc] transition-all duration-200">
            {/* Número */}
            <div className={`w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center
                            shrink-0 font-serif font-bold text-[13px] ${color.num}`}>
              {item.num}
            </div>
            <div>
              <p className="text-[14px] xl:text-[15px] font-bold text-[#2d1a22] mb-1">
                {item.title}
              </p>
              <p className="text-[13px] xl:text-[14px] text-[#7a4a54] leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TerminosPage() {
  return (
    <main className="bg-[#fff8f9] min-h-screen">

      {/* ── HERO ── */}
      <div className="bg-[#a0435f] relative overflow-hidden
                      px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40
                      pt-28 xl:pt-32 pb-16 xl:pb-20">

        {/* Círculos decorativos */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/8 rounded-full
                        translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#2d1a22]/10 rounded-full
                        -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-3xl xl:max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25
                          px-4 py-1.5 rounded-full mb-6">
            <span className="text-[12px]">📋</span>
            <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-white">
              Documentos legales
            </span>
          </div>

          <h1 className="font-serif font-bold text-white leading-[1.05] mb-5">
            <span className="block text-[36px] md:text-[48px] xl:text-[54px]">
              Términos de Uso y
            </span>
            <span className="block text-[36px] md:text-[48px] xl:text-[54px] italic text-[#fce8ed]">
              Política de Privacidad
            </span>
          </h1>

          <p className="text-white/70 text-[14px] xl:text-[15px] leading-relaxed max-w-xl mx-auto">
            Al usar Destino Au Pair, aceptas los siguientes términos. Léelos con calma —
            son claros y directos.
          </p>
        </div>
      </div>

      {/* ── CHECKBOX DESTACADO ── */}
      <div className="px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40 -mt-6 relative z-10 mb-12">
        <div className="max-w-3xl xl:max-w-4xl mx-auto">
          <div className="bg-white border-2 border-[#e8849a] rounded-2xl px-6 xl:px-8 py-5 xl:py-6
                          shadow-lg shadow-[#e8849a]/15 flex items-start gap-4">
            <div className="w-5 h-5 rounded border-2 border-[#a0435f] bg-[#a0435f]
                            flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[13px] xl:text-[14px] text-[#2d1a22] leading-relaxed">
              <span className="font-semibold">Acepto los Términos de Uso, Política de Privacidad</span>{" "}
              y entiendo que Destino Au Pair es un programa educativo y de acompañamiento.
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40 pb-20 xl:pb-24">
        <div className="max-w-3xl xl:max-w-4xl mx-auto">

          {/* Términos de Uso */}
          <SectionBlock
            icon={FileText}
            label="Términos de Uso"
            items={terminos}
            color={{
              badge: "bg-[#fce8ed] border border-[#f0b8c4]",
              icon:  "text-[#a0435f]",
              num:   "bg-[#fce8ed] text-[#a0435f]",
            }}
          />

          {/* Política de Privacidad */}
          <SectionBlock
            icon={ShieldCheck}
            label="Política de Privacidad"
            items={privacidad}
            color={{
              badge: "bg-[#ede9f8] border border-[#c4b0e8]",
              icon:  "text-[#7c5cc4]",
              num:   "bg-[#ede9f8] text-[#7c5cc4]",
            }}
          />

          {/* Contacto */}
          <div className="bg-[#a0435f] rounded-2xl px-6 xl:px-8 py-6 xl:py-7
                          flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-[14px] xl:text-[15px] mb-0.5">
                ¿Tienes preguntas sobre estos términos?
              </p>
              <p className="text-white/70 text-[13px] xl:text-[14px]">
                Escríbenos a{" "}
                <a href="mailto:info@destino-aupair.com"
                   className="text-[#fce8ed] font-semibold hover:underline">
                  info@destino-aupair.com
                </a>
              </p>
            </div>
            <Link href="/"
              className="bg-white text-[#a0435f] font-semibold text-[13px] xl:text-[14px]
                         px-6 py-2.5 rounded-xl hover:bg-[#fce8ed] transition shrink-0">
              Volver al inicio
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}