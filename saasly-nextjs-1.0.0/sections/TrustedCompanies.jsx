import Marquee from "react-fast-marquee";

const fotos = [
  {
    src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80",
    caption: "Preparando el viaje ✈️",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    caption: "Nueva familia, nuevo hogar 🏡",
  },
  {
    src: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&q=80",
    caption: "Explorando el mundo 🌍",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80",
    caption: "Aprendiendo juntas 📚",
  },
  {
    src: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=80",
    caption: "Destinos increíbles 🗺️",
  },
  {
    src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80",
    caption: "Lista para despegar 🛫",
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80",
    caption: "Comunidad au pair 💛",
  },
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
    caption: "Nuevas amistades 🤝",
  },
];

function FotoCard({ foto }) {
  return (
    <div className="mx-3 relative w-56 h-72 rounded-2xl overflow-hidden shrink-0 group">
      <img
        src={foto.src}
        alt={foto.caption}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2d1a22]/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white text-[12px] font-medium">{foto.caption}</p>
      </div>
    </div>
  );
}

export default function PhotoCarousel() {
  return (
    <section className="py-16 bg-[#fff8f9] overflow-hidden">

      <div className="text-center mb-10 px-4">
        <p className="text-[11px] font-semibold tracking-[3px] uppercase text-[#e8849a] mb-3">
          La experiencia au pair
        </p>
        <h2 className="font-serif text-[28px] md:text-[34px] font-bold text-[#2d1a22] leading-tight">
          Más de 500 chicas ya<br />
          <span className="italic text-[#a0435f]">vivieron esta aventura</span>
        </h2>
      </div>

      <Marquee gradient gradientColor="#fff8f9" speed={30} className="mb-4">
        <div className="flex items-center py-2">
          {[...fotos, ...fotos].map((foto, i) => (
            <FotoCard key={i} foto={foto} />
          ))}
        </div>
      </Marquee>

      <Marquee gradient gradientColor="#fff8f9" speed={30} direction="right">
        <div className="flex items-center py-2">
          {[...fotos.slice(3), ...fotos.slice(0, 3), ...fotos].map((foto, i) => (
            <FotoCard key={i} foto={foto} />
          ))}
        </div>
      </Marquee>

    </section>
  );
}