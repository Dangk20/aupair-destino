import Marquee from "react-fast-marquee";

const fotos = [
  { src: "/carrusel/imagen1.jpg",  caption: "Preparando el viaje ✈️" },
  { src: "/carrusel/imagen2.jpg",  caption: "Nueva familia, nuevo hogar 🏡" },
  { src: "/carrusel/imagen3.jpg",  caption: "Explorando el mundo 🌍" },
  { src: "/carrusel/imagen4.jpg",  caption: "Aprendiendo juntas 📚" },
  { src: "/carrusel/imagen5.jpg",  caption: "Destinos increíbles 🗺️" },
  { src: "/carrusel/imagen6.jpg",  caption: "Lista para despegar 🛫" },
  { src: "/carrusel/imagen7.jpeg",  caption: "Comunidad au pair 💛" },
  { src: "/carrusel/imagen8.jpeg",  caption: "Nuevas amistades 🤝" },
  { src: "/carrusel/imagen9.jpg",  caption: "Mi aventura empieza 🌟" },
  { src: "/carrusel/imagen11.jpg", caption: "Familias increíbles 👨‍👩‍👧" },
  { src: "/carrusel/imagen23.jpg", caption: "Viviendo el sueño 💫" },
  { src: "/carrusel/imagen13.jpg", caption: "Au pair en USA 🇺🇸" },
  { src: "/carrusel/imagen14.jpg", caption: "Momentos únicos 📸" },
  { src: "/carrusel/imagen16.jpg", caption: "Creciendo cada día 🌱" },
  { src: "/carrusel/imagen15.jpg", caption: "Amigas para siempre 💕" },
  { src: "/carrusel/imagen18.jpg", caption: "Nuevas culturas 🌎" },
  { src: "/carrusel/imagen19.jpg", caption: "El mundo es tuyo 🗺️" },
  { src: "/carrusel/imagen20.jpeg", caption: "Experiencia de vida 🙌" },
  { src: "/carrusel/imagen21.jpg", caption: "Preparada y segura 💪" },
  { src: "/carrusel/imagen22.jpeg", caption: "Tu camino au pair 🛤️" },
  { src: "/carrusel/imagen12.jpg", caption: "Sonrisas y recuerdos 😊" },
  { src: "/carrusel/imagen24.jpg", caption: "¡Lo lograste! 🎉" },
];

const fila1 = fotos.slice(0, 11);
const fila2 = fotos.slice(11);

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
          {[...fila1, ...fila1].map((foto, i) => (
            <FotoCard key={i} foto={foto} />
          ))}
        </div>
      </Marquee>

      <Marquee gradient gradientColor="#fff8f9" speed={30} direction="right">
        <div className="flex items-center py-2">
          {[...fila2, ...fila2].map((foto, i) => (
            <FotoCard key={i} foto={foto} />
          ))}
        </div>
      </Marquee>

    </section>
  );
}