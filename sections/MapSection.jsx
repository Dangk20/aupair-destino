"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Annotation, ZoomableGroup } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function FlagImg({ countryCode, size = 40 }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      width={size}
      alt={countryCode}
      className="rounded-md object-cover shadow-md"
      style={{ minWidth: size }}
    />
  );
}

export default function MapSection() {
  const [contador, setContador] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const target = 2094;

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setContador(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const COLOMBIA = [-74, 4];
  const USA = [-98, 38];

  return (
    <section className="py-20 bg-[#2d1a22] relative overflow-hidden">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-map" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-map)" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#a0435f]/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#a0435f]/20 border border-[#a0435f]/30 text-[#f0a0b4] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase mb-5">
            ✈️ La ruta más popular
          </span>
          <h2 className="font-serif text-white font-bold leading-tight mb-4">
            <span className="block text-[36px] md:text-[48px]">De Colombia</span>
            <span className="block text-[36px] md:text-[48px] italic text-[#e8849a]">a Estados Unidos</span>
          </h2>
          <p className="text-white/50 text-[15px] max-w-md mx-auto leading-relaxed">
            La ruta Au Pair más solicitada por chicas latinoamericanas. Nosotras te preparamos para llegar lista.
          </p>
        </div>

        {/* Mapa */}
        <div className="relative bg-white/3 border border-white/8 rounded-3xl overflow-hidden mb-8">

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 160, center: [-85, 18] }}
            style={{ width: "100%", height: "420px" }}
          >
            <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>

              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name = geo.properties?.name || "";
                    const isCO = name === "Colombia";
                    const isUS = name === "United States of America";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isCO ? "#e8849a" : isUS ? "#a0435f" : "#3d2530"}
                        stroke="#2d1a22"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: isCO ? "#f0a0b8" : isUS ? "#b8506e" : "#4d3040", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Línea curva Colombia → USA con flecha */}
              <Annotation subject={[-86, 22]} dx={0} dy={0} connectorProps={{}}>
                <g>
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#e8849a" />
                    </marker>
                  </defs>
                  <path
                    d="M 48 68 Q 20 20 -48 -30"
                    fill="none"
                    stroke="#e8849a"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    markerEnd="url(#arrowhead)"
                    opacity="0.9"
                  />
                  <text x="5" y="25" textAnchor="middle" style={{ fontSize: "16px" }}>✈️</text>
                </g>
              </Annotation>

              {/* Marcador Colombia */}
              <Marker
                coordinates={COLOMBIA}
                onMouseEnter={(e) => {
                  setTooltip("co");
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setTooltip(null)}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
              >
                <circle r={10} fill="#e8849a" stroke="white" strokeWidth={2.5} style={{ cursor: "pointer" }} />
                <circle r={18} fill="#e8849a" opacity={0.2} />
                <circle r={26} fill="#e8849a" opacity={0.1} />
              </Marker>

              {/* Marcador USA */}
              <Marker
                coordinates={USA}
                onMouseEnter={(e) => {
                  setTooltip("us");
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setTooltip(null)}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
              >
                <circle r={12} fill="#a0435f" stroke="white" strokeWidth={2.5} style={{ cursor: "pointer" }} />
                <circle r={22} fill="#a0435f" opacity={0.2} />
                <circle r={32} fill="#a0435f" opacity={0.1} />
              </Marker>

            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip Colombia */}
          {tooltip === "co" && (
            <div
              className="fixed z-50 bg-white rounded-2xl shadow-xl px-4 py-3 pointer-events-none border border-[#f0dde2] min-w-[160px]"
              style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 80 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FlagImg countryCode="co" size={24} />
                <p className="font-bold text-[14px] text-[#2d1a22]">Colombia</p>
              </div>
              <p className="text-[11px] text-[#9a6672]">🎓 500+ chicas preparadas</p>
              <p className="text-[11px] text-[#9a6672]">📍 12+ ciudades representadas</p>
              <p className="text-[11px] text-[#9a6672]">🌎 Inglés intermedio requerido</p>
            </div>
          )}

          {/* Tooltip USA */}
          {tooltip === "us" && (
            <div
              className="fixed z-50 bg-white rounded-2xl shadow-xl px-4 py-3 pointer-events-none border border-[#f0dde2] min-w-[170px]"
              style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 80 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FlagImg countryCode="us" size={24} />
                <p className="font-bold text-[14px] text-[#2d1a22]">Estados Unidos</p>
              </div>
              <p className="text-[11px] text-[#9a6672]">✈️ {contador}+ Au Pairs colombianas</p>
              <p className="text-[11px] text-[#9a6672]">📅 Programa de 1 a 2 años</p>
              <p className="text-[11px] text-[#9a6672]">💵 $195.75 USD por semana</p>
              <p className="text-[11px] text-[#9a6672]">🛂 Visa J-1 Exchange</p>
            </div>
          )}

          {/* Instrucción */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#2d1a22]/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-[#e8849a]" />
            <span className="text-[10px] text-white/50">Scroll para hacer zoom · Arrastra para mover</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Colombia */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <FlagImg countryCode="co" size={40} />
              <div>
                <p className="text-white font-serif text-[18px] font-bold">Colombia</p>
                <p className="text-white/40 text-[12px]">País de origen</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: "Chicas preparadas", val: "500+" },
                { label: "Ciudades representadas", val: "12+" },
                { label: "Edad promedio", val: "22 años" },
                { label: "Inglés requerido", val: "Intermedio" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-white/50 text-[13px]">{s.label}</span>
                  <span className="text-[#e8849a] font-semibold text-[13px]">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estados Unidos */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <FlagImg countryCode="us" size={40} />
              <div>
                <p className="text-white font-serif text-[18px] font-bold">Estados Unidos</p>
                <p className="text-white/40 text-[12px]">Destino principal</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: "Au Pairs colombianas", val: `${contador}+` },
                { label: "Duración del programa", val: "1 a 2 años" },
                { label: "Estipendio semanal", val: "$195.75 USD" },
                { label: "Visa requerida", val: "J-1 Exchange" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-white/50 text-[13px]">{s.label}</span>
                  <span className="text-[#e8849a] font-semibold text-[13px]">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-[13px] mb-4">¿Lista para hacer parte de estas estadísticas?</p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] text-white font-medium text-[14px] px-8 py-3.5 rounded-2xl transition shadow-lg shadow-[#a0435f]/30"
          >
            Comenzar mi viaje a USA ✈️
          </a>
        </div>

      </div>
    </section>
  );
}