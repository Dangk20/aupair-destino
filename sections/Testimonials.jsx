import SectionTitle from "@/components/SectionTitle";
import { testimonialsData } from "@/data/testimonialsData";
import Marquee from "react-fast-marquee";
import { StarIcon } from "lucide-react";

function FlagImg({ countryCode, size = 16 }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w40/${countryCode}.png 2x`}
      width={size}
      height={size * 0.75}
      alt={countryCode}
      className="rounded-sm object-cover inline-block"
      style={{ minWidth: size }}
    />
  );
}

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
        <div className="w-9 h-9 rounded-full bg-[#fce8ed] border-2 border-[#f0dde2] flex items-center justify-center shrink-0">
          <span className="text-[14px] font-semibold text-[#a0435f]">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#a0435f]">{testimonial.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {/* Bandera Colombia origen */}
            <FlagImg countryCode="co" size={14} />
            <span className="text-[10px] text-[#9a6672]">→</span>
            {/* Bandera destino */}
            <FlagImg countryCode={testimonial.countryCode} size={14} />
            <span className="text-[10px] text-[#9a6672] truncate">{testimonial.destination}</span>
          </div>
        </div>
        <span className="ml-auto text-[10px] text-[#c0909a] shrink-0">{testimonial.date}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-[#fff8f9] overflow-hidden">

      <div className="max-w-5xl mx-auto px-4 mb-14">
        <div className="flex flex-col items-center text-center">

          <span className="inline-flex items-center gap-2 text-[#a0435f] text-[11px] font-semibold tracking-[4px] uppercase mb-5">
            <span className="w-8 h-px bg-[#e8849a]" />
            Testimonios
            <span className="w-8 h-px bg-[#e8849a]" />
          </span>

          <h2 className="font-serif font-bold leading-[1.05] text-[#2d1a22] mb-5">
            <span className="block text-[40px] md:text-[56px]">Ellas ya dieron</span>
            <span className="block text-[40px] md:text-[56px] italic text-[#a0435f]">el primer paso</span>
          </h2>

          <p className="text-[15px] text-[#7a4a54] leading-relaxed max-w-lg">
            Más de 2.094 Au Pairs han pasado por este programa. Esto es lo que dicen.
          </p>
        </div>
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