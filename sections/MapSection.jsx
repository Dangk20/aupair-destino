"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Annotation, ZoomableGroup } from "react-simple-maps";
import { MapPin, Clock, DollarSign, BookOpen, Users, Globe } from "lucide-react";
import Link from "next/link";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function FlagImg({ countryCode, size = 40 }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      width={size} height={size * 0.75}
      alt={countryCode}
      className="rounded-md object-cover shadow-sm"
      style={{ minWidth: size }}
    />
  );
}

/* Contador animado */
function Counter({ target, suffix = "+" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(target / 60);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toLocaleString("es-CO")}{suffix}</>;
}

export default function MapSection() {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const COLOMBIA = [-74, 4];
  const USA      = [-98, 38];

  return (
    <section id="map"
      className="bg-[#ede9f8] py-16 xl:py-20 w-full relative overflow-hidden
                 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

      {/* ── Decorativos ── */}
      <div className="absolute left-4 xl:left-10 top-10 pointer-events-none select-none opacity-25"
           style={{ width: "clamp(70px, 9vw, 120px)",
                    filter: "invert(35%) sepia(40%) saturate(400%) hue-rotate(220deg)" }}>
        <img src="/paperairplane.png" alt="" className="w-full object-contain" />
      </div>
      <div className="absolute right-6 xl:right-12 top-10 pointer-events-none select-none opacity-20">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="72" cy="38" r="26" stroke="#7c5cc4" strokeWidth="2" strokeDasharray="6 5"/>
          <path d="M72 64 Q64 76 56 82" stroke="#7c5cc4" strokeWidth="1.8"
                strokeDasharray="5 4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── ENCABEZADO ── */}
      <div className="text-center mb-10 xl:mb-14 relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#7c5cc4] px-4 py-1.5 rounded-full mb-6 shadow-md">
          <span className="text-[13px]">⭐</span>
          <span className="text-[10px] xl:text-[11px] font-bold tracking-[3px] uppercase text-white">
            La ruta más popular
          </span>
        </div>

        {/* Título */}
        <h2 className="font-serif font-bold leading-[1.05] mb-5">
          <span className="block text-[38px] md:text-[54px] xl:text-[62px] 2xl:text-[70px] text-[#1a0a3d]">
            De Colombia
          </span>
          <span className="block text-[38px] md:text-[54px] xl:text-[62px] 2xl:text-[70px] italic text-[#7c5cc4]">
            a Estados Unidos
            <span className="not-italic ml-3 text-[28px] xl:text-[36px]">✦ ✦</span>
          </span>
        </h2>

        {/* Descripción */}
        <p className="text-[14px] xl:text-[16px] text-[#5a4080] leading-relaxed max-w-xl mx-auto">
          Colombia es uno de los países emisores de au pairs con mayor participación<br />
          en el programa de intercambio cultural estadounidense.<br />
          <strong className="text-[#1a0a3d]">Nosotras te preparamos para llegar lista!</strong>
        </p>
      </div>

      {/* ── MAPA — fondo transparente ── */}
      <div className="relative rounded-3xl border border-[#d4c4f0] overflow-hidden mb-6 xl:mb-8">

        {/* Panel izquierdo dentro del mapa */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 xl:left-6 z-20
                        bg-white rounded-2xl border border-[#d4c4f0] shadow-lg p-4 xl:p-5
                        w-44 xl:w-52">
          {/* Colombia */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-[#7c5cc4] shrink-0" />
            <FlagImg countryCode="co" size={22} />
            <div>
              <p className="text-[11px] xl:text-[12px] font-bold text-[#7c5cc4] tracking-wide uppercase">
                Colombia
              </p>
              <p className="text-[10px] text-[#9a80c0]">Tu punto de partida</p>
            </div>
          </div>

          {/* Flecha */}
          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-[#ede9f8] border border-[#c4b0e8]
                            flex items-center justify-center">
              <span className="text-[14px]">✈️</span>
            </div>
          </div>

          {/* USA */}
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#7c5cc4] shrink-0" />
            <FlagImg countryCode="us" size={22} />
            <div>
              <p className="text-[11px] xl:text-[12px] font-bold text-[#7c5cc4] tracking-wide uppercase">
                Estados Unidos
              </p>
              <p className="text-[10px] text-[#9a80c0]">Tu nuevo destino</p>
            </div>
          </div>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 160, center: [-60, 20] }}
          style={{ width: "100%", height: "380px" }}
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
                      fill={isCO ? "#9b72d4" : isUS ? "#7c5cc4" : "#d4c4f0"}
                      stroke="#ede9f8"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover:   { fill: isCO ? "#b090e0" : isUS ? "#9070d0" : "#c4b0e8", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Línea curva Colombia → USA */}
            <Annotation subject={[-86, 22]} dx={0} dy={0} connectorProps={{}}>
              <g>
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#7c5cc4" />
                  </marker>
                </defs>
                <path d="M 48 68 Q 20 20 -48 -30" fill="none"
                      stroke="#7c5cc4" strokeWidth="2.5" strokeDasharray="6 4"
                      markerEnd="url(#arr)" opacity="0.9"/>
                {/* X en el punto medio */}
                <text x="0" y="18" textAnchor="middle" fontSize="14"
                      fill="#7c5cc4" fontWeight="bold">✕</text>
              </g>
            </Annotation>

            {/* Marcador Colombia */}
            <Marker coordinates={COLOMBIA}
              onMouseEnter={(e) => { setTooltip("co"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}>
              <circle r={9}  fill="#7c5cc4" stroke="white" strokeWidth={2.5} style={{ cursor: "pointer" }}/>
              <circle r={18} fill="#7c5cc4" opacity={0.2}/>
            </Marker>

            {/* Marcador USA */}
            <Marker coordinates={USA}
              onMouseEnter={(e) => { setTooltip("us"); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}>
              <circle r={11} fill="#5a3a90" stroke="white" strokeWidth={2.5} style={{ cursor: "pointer" }}/>
              <circle r={22} fill="#5a3a90" opacity={0.2}/>
            </Marker>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip Colombia */}
        {tooltip === "co" && (
          <div className="fixed z-50 bg-white rounded-2xl shadow-xl px-4 py-3 pointer-events-none border border-[#d4c4f0]"
               style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 80 }}>
            <div className="flex items-center gap-2 mb-2">
              <FlagImg countryCode="co" size={22}/>
              <p className="font-bold text-[13px] text-[#1a0a3d]">Colombia</p>
            </div>
            <p className="text-[11px] text-[#5a4080]">🎓 500+ chicas preparadas</p>
            <p className="text-[11px] text-[#5a4080]">📍 12+ ciudades representadas</p>
          </div>
        )}
        {tooltip === "us" && (
          <div className="fixed z-50 bg-white rounded-2xl shadow-xl px-4 py-3 pointer-events-none border border-[#d4c4f0]"
               style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 80 }}>
            <div className="flex items-center gap-2 mb-2">
              <FlagImg countryCode="us" size={22}/>
              <p className="font-bold text-[13px] text-[#1a0a3d]">Estados Unidos</p>
            </div>
            <p className="text-[11px] text-[#5a4080]">✈️ 2094+ Au Pairs colombianas</p>
            <p className="text-[11px] text-[#5a4080]">💵 $195.75 USD / semana</p>
            <p className="text-[11px] text-[#5a4080]">🛂 Visa J-1 Exchange</p>
          </div>
        )}

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2
                        bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5
                        border border-[#d4c4f0] whitespace-nowrap shadow-sm">
          <span className="text-[12px]">🌐</span>
          <span className="text-[10px] text-[#7c5cc4]">Desliza para hacer zoom · Arrastra para mover</span>
        </div>
      </div>

      {/* ── STATS — una sola card horizontal como la referencia ── */}
      <div className="bg-[#e8e0f5] border border-[#c4b0e8] rounded-2xl
                      p-5 xl:p-6 mb-8 xl:mb-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0">

          {/* ── Colombia ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <FlagImg countryCode="co" size={32}/>
              <div>
                <p className="font-serif font-bold text-[15px] xl:text-[17px] text-[#1a0a3d]">Colombia</p>
                <p className="text-[10px] text-[#7c5cc4]">País de origen</p>
              </div>
            </div>
            {[
              { icon: Users,    label: "Chicas en Colombia",    val: "12.6 millones" },
              { icon: MapPin,   label: "Ciudades representadas",val: "12+"           },
              { icon: Clock,    label: "Edad promedio",         val: "22 años"       },
              { icon: BookOpen, label: "Inglés requerido",      val: "Intermedio"    },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center justify-between py-2
                                        border-b border-[#c4b0e8]/40 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                    <span className="text-[11px] xl:text-[12px] text-[#3d1a7a]">{s.label}</span>
                  </div>
                  <span className="text-[11px] xl:text-[12px] font-bold text-[#7c5cc4]">{s.val}</span>
                </div>
              );
            })}
          </div>

          {/* ── Contadores centrales ── */}
          <div className="flex flex-col items-center gap-5 px-5 xl:px-8
                          border-l border-r border-[#c4b0e8] mx-4 xl:mx-6 self-stretch justify-center">
            {/* Au Pairs Colombianas */}
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-[#7c5cc4]/15 border border-[#c4b0e8]
                              flex items-center justify-center mx-auto mb-1.5">
                <Users size={16} className="text-[#7c5cc4]" strokeWidth={1.5}/>
              </div>
              <p className="text-[9px] xl:text-[10px] font-bold text-[#5a3a90] uppercase tracking-wide leading-snug">
                Au Pairs<br/>Colombianas 2025
              </p>
              <p className="font-serif font-bold text-[26px] xl:text-[30px] text-[#7c5cc4] leading-none mt-0.5">
                +<Counter target={2094} suffix=""/>
              </p>
            </div>
            {/* Au Pairs Globales */}
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-[#7c5cc4]/15 border border-[#c4b0e8]
                              flex items-center justify-center mx-auto mb-1.5">
                <Globe size={16} className="text-[#7c5cc4]" strokeWidth={1.5}/>
              </div>
              <p className="text-[9px] xl:text-[10px] font-bold text-[#5a3a90] uppercase tracking-wide leading-snug">
                Au Pairs<br/>Globales 2025
              </p>
              <p className="font-serif font-bold text-[26px] xl:text-[30px] text-[#7c5cc4] leading-none mt-0.5">
                +<Counter target={16840} suffix=""/>
              </p>
            </div>
          </div>

          {/* ── Estados Unidos ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <FlagImg countryCode="us" size={32}/>
              <div>
                <p className="font-serif font-bold text-[15px] xl:text-[17px] text-[#1a0a3d]">Estados Unidos</p>
                <p className="text-[10px] text-[#7c5cc4]">Destino principal</p>
              </div>
            </div>
            {[
              { icon: Clock,      label: "Duración del programa", val: "1 a 2 años"   },
              { icon: DollarSign, label: "Estipendio semanal",    val: "$195.75 USD"  },
              { icon: BookOpen,   label: "Visa requerida",        val: "J-1 Exchange" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center justify-between py-2
                                        border-b border-[#c4b0e8]/40 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                    <span className="text-[11px] xl:text-[12px] text-[#3d1a7a]">{s.label}</span>
                  </div>
                  <span className="text-[11px] xl:text-[12px] font-bold text-[#7c5cc4]">{s.val}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      <div className="text-center relative z-10">
        <p className="text-[14px] xl:text-[15px] text-[#5a4080] mb-5">
          ¿Lista para hacer parte de estas estadísticas?
        </p>
        <Link href="/register"
          className="inline-flex items-center gap-2 bg-[#7c5cc4] hover:bg-[#6a4ab0] transition
                     text-white font-semibold text-[15px] xl:text-[16px]
                     px-10 xl:px-14 py-4 rounded-2xl shadow-lg shadow-[#7c5cc4]/30">
          Comenzar mi destino ✈️
        </Link>
      </div>

    </section>
  );
}