import SectionTitle from "@/components/SectionTitle";
import { testimonialsData } from "@/data/testimonialsData";
import Marquee from "react-fast-marquee";
import { StarIcon } from "lucide-react";

function TestimonialCard({ testimonial }) {
  return (
    <div className="mx-3 w-72 bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm shadow-[#e8b0bc]/20 hover:shadow-md hover:shadow-[#e8b0bc]/30 hover:-translate-y-0.5 transition-all duration-300 shrink-0">

      {/* Estrellas */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(testimonial.stars)].map((_, i) => (
          <StarIcon key={i} size={12} fill="#e8849a" className="text-[#e8849a]" />
        ))}
      </div>

      {/* Texto */}
      <p className="text-[13px] text-[#2d1a22] leading-relaxed mb-4 italic">
        "{testimonial.text}"
      </p>

      {/* Autor */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#fce8ed]">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-9 h-9 rounded-full object-cover border-2 border-[#f0dde2]"
        />
        <div>
          <p className="text-[13px] font-semibold text-[#a0435f]">{testimonial.name}</p>
          <p className="text-[11px] text-[#9a6672]">{testimonial.handle}</p>
        </div>
        <span className="ml-auto text-[10px] text-[#c0909a]">{testimonial.date}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-[#fff8f9] overflow-hidden">

      <SectionTitle
        text1="Testimonios"
        text2="Ellas ya dieron el primer paso"
        text3="Más de 500 au pairs han pasado por este programa. Esto es lo que dicen."
      />

      {/* Contador social */}
      <div className="flex items-center justify-center gap-8 mt-8 mb-12">
        {[
          { val: "+500", label: "Au pairs preparadas" },
          { val: "4.9 ★", label: "Valoración promedio" },
          { val: "12", label: "Países de destino" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="font-serif text-[26px] font-bold text-[#a0435f]">{s.val}</p>
            <p className="text-[11px] text-[#9a6672]">{s.label}</p>
          </div>
        ))}
      </div>

      <Marquee gradient gradientColor="#fff8f9" speed={28}>
        <div className="flex items-center py-3">
          {[...testimonialsData, ...testimonialsData].map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </Marquee>

      <Marquee gradient gradientColor="#fff8f9" speed={28} direction="right">
        <div className="flex items-center py-3">
          {[...testimonialsData, ...testimonialsData].map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </Marquee>

    </section>
  );
}