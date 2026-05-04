"use client";
import SectionTitle from "@/components/SectionTitle";
import { faqsData } from "@/data/faqsData";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 bg-[#fff8f9] relative overflow-hidden">

      {/* Decoración fondo */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#e8849a]/6 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#2d1a22]/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto flex flex-col items-center px-4 md:px-0">

        <SectionTitle
          text1="Preguntas frecuentes"
          text2="Todo lo que necesitas saber"
          text3="Resolvemos las dudas más comunes antes de que empieces tu camino au pair."
        />

        <div className="mt-10 w-full">
          {faqsData.map((faq, index) => (
            <div
              key={index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className={`mb-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
                openIndex === index
                  ? "border-[#e8849a] bg-white shadow-md shadow-[#e8849a]/10"
                  : "border-[#f0dde2] bg-white hover:border-[#e8b0bc] hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <h3 className="text-[14px] font-medium leading-snug text-[#2d1a22] transition-colors">
                  {faq.question}
                </h3>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  openIndex === index ? "bg-[#a0435f]" : "bg-[#fce8ed]"
                }`}>
                  <ChevronDown
                    size={14}
                    className={`transition-all duration-300 ease-in-out ${
                      openIndex === index ? "rotate-180 text-white" : "text-[#9a6672]"
                    }`}
                  />
                </div>
              </div>

              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <p className="px-5 pb-5 text-[13.5px] text-[#7a4a54] leading-relaxed border-t border-[#fce8ed] pt-3">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA al pie */}
        <div className="mt-10 text-center">
          <p className="text-[13px] text-[#9a6672] mb-3">
            ¿Tienes una pregunta que no está aquí?
          </p>
          <a
            href="mailto:hola@destinoaupair.com"
            className="inline-flex items-center gap-2 text-[13px] text-[#a0435f] font-medium border border-[#e8b0bc] rounded-xl px-5 py-2.5 hover:bg-[#fef0f3] transition"
          >
            Escríbenos directamente →
          </a>
        </div>

      </div>
    </section>
  );
};