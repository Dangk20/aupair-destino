"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Globe, ClipboardList, Clock, Lock, ShieldCheck,
  Users, Baby, Smartphone, Infinity, RefreshCw,
  PlusSquare, Handshake, Star
} from "lucide-react";
import Link from "next/link";

/* Icono por pregunta — igual al diseño de referencia */
const faqIcons = [
  Globe, ClipboardList, Clock, Lock, ShieldCheck,
  Users, Baby, Smartphone, Infinity, RefreshCw,
  PlusSquare, Handshake, Star,
];

const faqsData = [
  {
    question: "¿Qué es exactamente Destino Au Pair?",
    answer: "Es un programa en video diseñado para guiarte paso a paso en el proceso de convertirte en au pair. No es una biblioteca de videos desordenada — es una secuencia clara: cada sesión se desbloquea cuando completas la anterior, para que vayas avanzando con orden y confianza.",
  },
  {
    question: "¿Qué incluye el programa?",
    answer: "El programa incluye 8 sesiones en video (bienvenida + 7 módulos), guías descargables, plantillas para tu perfil y cartas, acceso a comunidad privada al finalizar, y revisión personalizada de tu situación.",
  },
  {
    question: "¿Cuánto dura el programa y cuánto tiempo toma?",
    answer: "El programa tiene 8 piezas de contenido: 1 video de bienvenida + 7 sesiones principales de aproximadamente 5 minutos cada una. Puedes completarlo en un fin de semana o avanzar a tu ritmo. No hay fechas límite.",
  },
  {
    question: "¿Por qué las sesiones están bloqueadas?",
    answer: "Porque el orden importa. Cada sesión construye sobre la anterior — si saltas pasos, te pierdes contexto clave. La lógica de desbloqueo está diseñada para que llegues al final realmente preparada, no solo con información suelta.",
  },
  {
    question: "¿Destino Au Pair garantiza familia o visa?",
    answer: "No garantizamos familia ni visa — eso depende de tu proceso con la agencia y las autoridades migratorias. Lo que sí garantizamos es que llegarás preparada: con claridad, documentos en orden y la seguridad para presentarte bien.",
  },
  {
    question: "¿Qué pasa cuando termino el programa?",
    answer: "Al completar la Sesión 7 se abre una pantalla final con dos opciones: entrar a la comunidad privada de WhatsApp o agendar una revisión directa con Jennifer y Tati para evaluar tu estado actual y orientarte en los próximos pasos.",
  },
  {
    question: "¿Necesito experiencia previa con niños para ser au pair?",
    answer: "No necesariamente, pero sí es un factor que las familias consideran. En el programa te explicamos cómo presentar tu experiencia de la mejor manera, incluso si es informal — cuidar sobrinos, hacer babysitting, o trabajar con niños en cualquier contexto cuenta.",
  },
  {
    question: "¿Puedo hacer el programa desde el celular?",
    answer: "Sí. La plataforma está diseñada para funcionar desde cualquier dispositivo — computador, tablet o celular. Eso sí, por seguridad, solo puedes tener una sesión activa a la vez.",
  },
  {
    question: "¿Tengo acceso de por vida al contenido?",
    answer: "Sí. Una vez que compras el programa, el contenido es tuyo para siempre. Puedes volver a revisar cualquier sesión cuando quieras, aunque ya hayas completado todo el programa.",
  },
  {
    question: "¿Qué pasa si descubro que ser Au Pair no es para mí?",
    answer: "Tienes 7 días de garantía desde tu compra. Si sientes que el programa no es para ti, puedes transferir tu cupo a otra persona. No hacemos devoluciones en efectivo, pero sí queremos que el acceso tenga valor para alguien.",
  },
  {
    question: "¿Cómo funciona el bono del examen médico?",
    answer: "Al completar el programa recibes información sobre cómo acceder al bono para el examen médico requerido en el proceso Au Pair. Los detalles y disponibilidad se comparten dentro de la plataforma al finalizar.",
  },
  {
    question: "¿Con qué agencia trabajan?",
    answer: "No trabajamos exclusivamente con una agencia. Te enseñamos a evaluar las opciones disponibles y a elegir la que mejor se adapte a tu perfil y destino. Nuestro objetivo es que llegues informada, no atada a una sola opción.",
  },
  {
    question: "¿Por qué pagar por preparación si puedo aplicar sola?",
    answer: "Puedes aplicar sola — pero la diferencia está en cómo llegas. Las chicas que se preparan llegan con más confianza, mejores perfiles y menos errores costosos. El programa no es un requisito, es una ventaja.",
  },
];

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq"
      className="bg-[#fff8f9] py-16 xl:py-20 w-full relative overflow-hidden
                 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

      {/* ── Círculos decorativos ── */}
      <div className="absolute top-0 left-0 pointer-events-none"
           style={{ width: "clamp(200px, 22vw, 320px)", aspectRatio: "1" }}>
        <div className="w-full h-full rounded-full bg-[#fce8ed] opacity-60
                        -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none"
           style={{ width: "clamp(150px, 16vw, 240px)", aspectRatio: "1" }}>
        <div className="w-full h-full rounded-full bg-[#fce8ed] opacity-40
                        translate-x-1/2 translate-y-1/2" />
      </div>

      {/* ── Avión izquierda ── */}
      <div className="absolute pointer-events-none select-none"
           style={{ left: "4%", top: "14%", width: "clamp(60px, 8vw, 110px)",
                    filter: "invert(45%) sepia(20%) saturate(400%) hue-rotate(300deg) opacity(0.45)" }}>
        <img src="/paperairplane.png" alt="" className="w-full object-contain" />
      </div>

      {/* ── Corazón burbuja derecha ── */}
      <div className="absolute right-6 xl:right-14 top-14 pointer-events-none select-none opacity-20">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="65" cy="35" r="24" stroke="#a0435f" strokeWidth="2" strokeDasharray="6 5"/>
          <path d="M65 61 Q57 73 49 79" stroke="#a0435f" strokeWidth="1.8"
                strokeDasharray="5 4" strokeLinecap="round"/>
          <path d="M65 28 C65 25 61 22 61 19 C61 16 65 16 65 19 C65 16 69 16 69 19 C69 22 65 25 65 28Z"
                fill="#a0435f"/>
        </svg>
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-10 xl:mb-12 relative z-10">

        {/* Label con líneas */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-10 xl:w-14 h-px bg-[#e8849a]" />
          <span className="text-[10px] xl:text-[11px] font-bold tracking-[4px] uppercase text-[#a0435f]">
            Preguntas frecuentes
          </span>
          <span className="w-10 xl:w-14 h-px bg-[#e8849a]" />
        </div>

        {/* Título */}
        <h2 className="font-serif font-bold leading-[1.05] mb-5">
          <span className="block text-[36px] md:text-[52px] xl:text-[60px] 2xl:text-[68px] text-[#2d1a22]">
            Todo lo que{" "}
            <span className="italic text-[#a0435f] relative inline-block">
              necesitas saber
              <svg className="absolute -bottom-1 left-0 w-full" height="6"
                   viewBox="0 0 300 6" preserveAspectRatio="none">
                <path d="M0 5 Q75 1 150 4 Q225 6 300 2"
                      stroke="#e8849a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="not-italic text-[28px] xl:text-[34px] ml-2 align-middle">✦</span>
          </span>
        </h2>

        <p className="text-[14px] xl:text-[16px] text-[#7a4a54] leading-relaxed">
          Resolvemos las dudas más comunes{" "}
          <strong className="text-[#a0435f]">antes de que empieces<br/>tu destino au pair.</strong>
        </p>
      </div>

      {/* ── ACORDEÓN ── */}
      <div className="max-w-3xl xl:max-w-4xl mx-auto relative z-10">
        {faqsData.map((faq, index) => {
          const Icon = faqIcons[index] || Globe;
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={`mb-2.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                isOpen
                  ? "border-[#e8849a] bg-white shadow-md shadow-[#e8849a]/10"
                  : "border-[#f0dde2] bg-white hover:border-[#e8b0bc] hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                {/* Ícono izquierda */}
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-[#fce8ed] border border-[#f0b8c4]
                                flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-[#a0435f]" strokeWidth={1.6}/>
                </div>

                {/* Pregunta */}
                <h3 className="flex-1 text-[13px] xl:text-[14px] font-medium text-[#2d1a22] leading-snug">
                  {faq.question}
                </h3>

                {/* Chevron */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                                 transition-colors duration-300 ${
                  isOpen ? "bg-[#a0435f]" : "bg-[#fce8ed]"
                }`}>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : "text-[#9a6672]"
                    }`}
                  />
                </div>
              </div>

              {/* Respuesta */}
              <div className={`transition-all duration-400 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <p className="px-5 pb-5 text-[13px] xl:text-[14px] text-[#7a4a54]
                               leading-relaxed border-t border-[#fce8ed] pt-3 ml-11">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CTA ── */}
      <div className="mt-10 text-center relative z-10">
        <p className="text-[13px] xl:text-[14px] text-[#a0435f] mb-4">
          ¿Tienes una pregunta que no está aquí?
        </p>
        <a
          href="mailto:hola@destinoaupair.com"
          className="inline-flex items-center gap-2 text-[14px] xl:text-[15px]
                     text-[#a0435f] font-semibold border-2 border-[#e8b0bc]
                     rounded-2xl px-8 py-3 hover:bg-[#fef0f3] transition"
        >
          <span className="text-[16px]">✈️</span>
          Escríbenos directamente
        </a>
      </div>

    </section>
  );
};