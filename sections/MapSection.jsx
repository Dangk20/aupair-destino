"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Países destino con coordenadas y datos
const DESTINOS = [
  { nombre: "Estados Unidos", coords: [-100, 40], chicas: 312, emoji: "🇺🇸" },
  { nombre: "Alemania",       coords: [10, 51],   chicas: 87,  emoji: "🇩🇪" },
  { nombre: "Francia",        coords: [2, 46],    chicas: 54,  emoji: "🇫🇷" },
  { nombre: "Países Bajos",   coords: [5, 52],    chicas: 43,  emoji: "🇳🇱" },
  { nombre: "Bélgica",        coords: [4, 50],    chicas: 28,  emoji: "🇧🇪" },
  { nombre: "Suiza",          coords: [8, 47],    chicas: 31,  emoji: "🇨🇭" },
  { nombre: "Austria",        coords: [14, 47],   chicas: 19,  emoji: "🇦🇹" },
  { nombre: "Irlanda",        coords: [-8, 53],   chicas: 24,  emoji: "🇮🇪" },
  { nombre: "Canadá",         coords: [-96, 56],  chicas: 22,  emoji: "🇨🇦" },
  { nombre: "Australia",      coords: [134, -25], chicas: 15,  emoji: "🇦🇺" },
  { nombre: "Reino Unido",    coords: [-2, 54],   chicas: 38,  emoji: "🇬🇧" },
  { nombre: "España",         coords: [-4, 40],   chicas: 21,  emoji: "🇪🇸" },
];

const totalChicas = DESTINOS.reduce((a, b) => a + b.chicas, 0);

export default function MapSection() {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contador, setContador] = useState(0);
  const [viendo, setViendo] = useState(23);

  // Animación contador
  useEffect(() => {
    let current = 0;
    const target = totalChicas;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setContador(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Contador "viendo ahora" que varía
  useEffect(() => {
    const timer = setInterval(() => {
      setViendo((v) => v + Math.floor(Math.random() * 3) - 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-[#2d1a22] relative overflow-hidden">

      {/* Decoración fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots-map" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="white" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots-map)" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#a0435f]/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#a0435f]/20 border border-[#a0435f]/30 text-[#f0a0b4] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase mb-5">
            🌍 Destinos reales
          </span>
          <h2 className="font-serif text-white text-[36px] md:text-[44px] font-bold leading-tight mb-4">
            Au pairs de toda<br />
            <span className="italic text-[#e8849a]">Latinoamérica al mundo</span>
          </h2>
          <p className="text-white/50 text-[15px] max-w-md mx-auto leading-relaxed">
            Más de {totalChicas} chicas ya están viviendo su aventura au pair en estos países.
          </p>
        </div>

        {/* Contador en vivo */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#e8849a] animate-pulse" />
            <span className="text-white/60 text-[13px]">Viendo ahora:</span>
            <span className="font-serif text-[18px] font-bold text-[#e8849a]">{Math.max(viendo, 18)}</span>
            <span className="text-white/40 text-[12px]">chicas</span>
          </div>
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
            <span className="text-white/60 text-[13px]">Au pairs preparadas:</span>
            <span className="font-serif text-[18px] font-bold text-white">{contador}+</span>
          </div>
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
            <span className="text-white/60 text-[13px]">Países destino:</span>
            <span className="font-serif text-[18px] font-bold text-white">{DESTINOS.length}</span>
          </div>
        </div>

        {/* Mapa */}
        <div className="relative bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 130, center: [10, 20] }}
            style={{ width: "100%", height: "420px" }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#3d2530"
                      stroke="#2d1a22"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#4d3040", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Marcadores de destinos */}
              {DESTINOS.map((d, i) => (
                <Marker
                  key={i}
                  coordinates={d.coords}
                  onMouseEnter={(e) => {
                    setTooltip(d);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                >
                  {/* Pulso */}
                  <circle
                    r={d.chicas > 100 ? 14 : d.chicas > 50 ? 10 : 7}
                    fill="#a0435f"
                    opacity={0.2}
                    className="animate-ping"
                    style={{ transformOrigin: "center", animationDuration: `${1.5 + i * 0.2}s` }}
                  />
                  {/* Punto */}
                  <circle
                    r={d.chicas > 100 ? 8 : d.chicas > 50 ? 6 : 4}
                    fill="#e8849a"
                    stroke="white"
                    strokeWidth={1.5}
                    style={{ cursor: "pointer" }}
                  />
                  {/* Número para los más grandes */}
                  {d.chicas > 50 && (
                    <text
                      textAnchor="middle"
                      y={-12}
                      style={{
                        fontSize: "9px",
                        fill: "white",
                        fontWeight: "bold",
                        pointerEvents: "none",
                      }}
                    >
                      {d.chicas}
                    </text>
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 pointer-events-none border border-[#f0dde2]"
              style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 60 }}
            >
              <p className="font-semibold text-[13px] text-[#2d1a22]">
                {tooltip.emoji} {tooltip.nombre}
              </p>
              <p className="text-[12px] text-[#9a6672]">
                <span className="font-bold text-[#a0435f]">{tooltip.chicas}</span> au pairs
              </p>
            </div>
          )}

          
          {/* Leyenda */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-[#2d1a22]/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
            <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#e8849a]" />
                <span className="text-[10px] text-white/50">País destino</span>
            </div>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-white/50">Hover para ver detalles</span>
            </div>
            </div>

        {/* Lista de destinos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-8">
          {DESTINOS.sort((a, b) => b.chicas - a.chicas).map((d, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-center hover:bg-white/10 transition">
              <p className="text-[18px] mb-1">{d.emoji}</p>
              <p className="text-white text-[11px] font-medium leading-tight">{d.nombre}</p>
              <p className="text-[#e8849a] font-serif text-[14px] font-bold mt-0.5">{d.chicas}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}