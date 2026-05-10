"use client";

import { useState } from "react";
import { MessageCircle, Mail, Clock, Send } from "lucide-react";

/* ── Íconos de redes sociales ── */
const IGIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const YTIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

const TKIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
  </svg>
);

const FBIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WAIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const socialLinks = [
  { icon: IGIcon, label: "Instagram", handle: "@destinoaupair",  href: "#", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]", color: "text-white" },
  { icon: YTIcon, label: "YouTube",   handle: "Destino Au Pair", href: "#", bg: "bg-[#FF0000]", color: "text-white" },
  { icon: TKIcon, label: "TikTok",    handle: "@destinoaupair",  href: "#", bg: "bg-[#010101]", color: "text-white" },
  { icon: FBIcon, label: "Facebook",  handle: "Destino Au Pair", href: "#", bg: "bg-[#1877F2]", color: "text-white" },
  { icon: WAIcon, label: "WhatsApp",  handle: "+57 300 123 4567",href: "https://wa.me/573001234567", bg: "bg-[#25D366]", color: "text-white" },
];

const asuntoOpciones = [
  "Información sobre el programa",
  "Problemas técnicos",
  "Pagos y facturación",
  "Comunidad y acceso",
  "Otro",
];

export default function ContactSection() {
  const [form, setForm] = useState({ nombre: "", correo: "", asunto: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section id="contacto"
        className="bg-[#ede9f8] py-16 xl:py-20 w-full relative overflow-hidden
                   px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40">

        {/* ── Decorativos ── */}
        <div className="absolute left-4 xl:left-10 top-10 pointer-events-none select-none opacity-25"
             style={{ width: "clamp(60px, 8vw, 110px)",
                      filter: "invert(35%) sepia(40%) saturate(400%) hue-rotate(220deg)" }}>
          <img src="/paperairplane.png" alt="" className="w-full object-contain" />
        </div>
        <div className="absolute right-6 xl:right-14 top-10 pointer-events-none select-none opacity-20">
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <circle cx="65" cy="35" r="24" stroke="#7c5cc4" strokeWidth="2" strokeDasharray="6 5"/>
            <path d="M65 61 Q57 73 49 79" stroke="#7c5cc4" strokeWidth="1.8"
                  strokeDasharray="5 4" strokeLinecap="round"/>
            <path d="M65 28 C65 25 61 22 61 19 C61 16 65 16 65 19 C65 16 69 16 69 19 C69 22 65 25 65 28Z"
                  fill="#7c5cc4"/>
          </svg>
        </div>

        {/* ── Badge ── */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-3">
            <span className="w-10 h-px bg-[#7c5cc4]" />
            <span className="text-[10px] xl:text-[11px] font-bold tracking-[4px] uppercase text-[#7c5cc4]">
              Contacto
            </span>
            <span className="w-10 h-px bg-[#7c5cc4]" />
          </div>
        </div>

        {/* ── DOS COLUMNAS ── */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start
                        max-w-5xl xl:max-w-6xl mx-auto relative z-10">

          {/* ── IZQUIERDA — título + contacto ── */}
          <div className="w-full lg:w-[42%]">

            <h2 className="font-serif font-bold leading-[1.05] mb-5">
              <span className="block text-[32px] md:text-[42px] xl:text-[48px] 2xl:text-[54px] text-[#1a0a3d]">
                ¡Estamos aquí
              </span>
              <span className="block text-[32px] md:text-[42px] xl:text-[48px] 2xl:text-[54px] text-[#1a0a3d]">
                para <span className="italic text-[#7c5cc4]">ayudarte!</span>
              </span>
            </h2>

            <p className="text-[14px] xl:text-[15px] text-[#5a4080] leading-relaxed mb-8 max-w-sm">
              Si tienes dudas sobre el programa, tu proceso o cualquier
              cosa antes de comenzar tu destino Au Pair, escríbenos.
            </p>

            {/* Canales de contacto */}
            <div className="space-y-4">
              {/* WhatsApp */}
              <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-4 group">
                <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-[#d4c4f0] border border-[#c4b0e8]
                                flex items-center justify-center shrink-0
                                group-hover:bg-[#7c5cc4] transition-colors">
                  <WAIcon />
                </div>
                <div>
                  <p className="text-[13px] xl:text-[14px] font-bold text-[#1a0a3d]">WhatsApp</p>
                  <p className="text-[12px] xl:text-[13px] text-[#7c5cc4]">+57 300 123 4567</p>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:info@destino-aupair.com"
                 className="flex items-center gap-4 group">
                <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-[#d4c4f0] border border-[#c4b0e8]
                                flex items-center justify-center shrink-0
                                group-hover:bg-[#7c5cc4] transition-colors">
                  <Mail size={18} className="text-[#7c5cc4] group-hover:text-white transition-colors" strokeWidth={1.5}/>
                </div>
                <div>
                  <p className="text-[13px] xl:text-[14px] font-bold text-[#1a0a3d]">Email</p>
                  <p className="text-[12px] xl:text-[13px] text-[#7c5cc4]">info@destino-aupair.com</p>
                </div>
              </a>

              {/* Horario */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-[#d4c4f0] border border-[#c4b0e8]
                                flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-[#7c5cc4]" strokeWidth={1.5}/>
                </div>
                <div>
                  <p className="text-[13px] xl:text-[14px] font-bold text-[#1a0a3d]">Horario de atención</p>
                  <p className="text-[12px] xl:text-[13px] text-[#5a4080]">
                    Lunes a viernes de 9:00 a.m. a 6:00 p.m. (COL)<br/>
                    Tiempo de respuesta: 24 hrs hábiles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── DERECHA — formulario ── */}
          <div className="w-full lg:w-[58%]">
            <div className="bg-white rounded-3xl border border-[#d4c4f0] shadow-sm p-6 xl:p-8">

              {/* Header form */}
              <div className="mb-6">
                <h3 className="font-serif font-bold text-[18px] xl:text-[20px] text-[#1a0a3d]">
                  Escríbenos <span className="italic text-[#7c5cc4]">directamente</span>{" "}
                  <span className="not-italic">✦</span>
                </h3>
                <p className="text-[12px] xl:text-[13px] text-[#9a80c0] mt-1">
                  Completa el formulario y te responderemos lo antes posible.
                </p>
              </div>

              {sent ? (
                <div className="text-center py-10">
                  <p className="text-[32px] mb-3">✈️</p>
                  <p className="font-bold text-[16px] text-[#1a0a3d] mb-1">¡Mensaje enviado!</p>
                  <p className="text-[13px] text-[#7c5cc4]">Te responderemos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Nombre + Correo en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] xl:text-[12px] font-semibold text-[#3d1a7a] mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        required
                        className="w-full border border-[#d4c4f0] rounded-xl px-4 py-2.5
                                   text-[13px] text-[#1a0a3d] placeholder-[#b0a0d0]
                                   focus:outline-none focus:border-[#7c5cc4] focus:ring-1
                                   focus:ring-[#7c5cc4]/30 bg-[#faf8ff] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] xl:text-[12px] font-semibold text-[#3d1a7a] mb-1.5">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="Tu correo"
                        value={form.correo}
                        onChange={e => setForm({ ...form, correo: e.target.value })}
                        required
                        className="w-full border border-[#d4c4f0] rounded-xl px-4 py-2.5
                                   text-[13px] text-[#1a0a3d] placeholder-[#b0a0d0]
                                   focus:outline-none focus:border-[#7c5cc4] focus:ring-1
                                   focus:ring-[#7c5cc4]/30 bg-[#faf8ff] transition"
                      />
                    </div>
                  </div>

                  {/* Asunto */}
                  <div>
                    <label className="block text-[11px] xl:text-[12px] font-semibold text-[#3d1a7a] mb-1.5">
                      Asunto
                    </label>
                    <select
                      value={form.asunto}
                      onChange={e => setForm({ ...form, asunto: e.target.value })}
                      required
                      className="w-full border border-[#d4c4f0] rounded-xl px-4 py-2.5
                                 text-[13px] text-[#1a0a3d] bg-[#faf8ff]
                                 focus:outline-none focus:border-[#7c5cc4] focus:ring-1
                                 focus:ring-[#7c5cc4]/30 transition appearance-none cursor-pointer"
                    >
                      <option value="" disabled>¿En qué podemos ayudarte?</option>
                      {asuntoOpciones.map((op, i) => (
                        <option key={i} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-[11px] xl:text-[12px] font-semibold text-[#3d1a7a] mb-1.5">
                      Mensaje
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Cuéntanos tu duda o comentario..."
                      value={form.mensaje}
                      onChange={e => setForm({ ...form, mensaje: e.target.value })}
                      required
                      className="w-full border border-[#d4c4f0] rounded-xl px-4 py-2.5
                                 text-[13px] text-[#1a0a3d] placeholder-[#b0a0d0]
                                 focus:outline-none focus:border-[#7c5cc4] focus:ring-1
                                 focus:ring-[#7c5cc4]/30 bg-[#faf8ff] transition resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button type="submit"
                    className="w-full bg-[#7c5cc4] hover:bg-[#6a4ab0] transition text-white
                               font-semibold text-[14px] xl:text-[15px] py-3.5 rounded-2xl
                               shadow-lg shadow-[#7c5cc4]/25 flex items-center justify-center gap-2">
                    Enviar mensaje
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── REDES SOCIALES — strip inferior ── */}
      <div className="bg-[#f5f0fd] border-t border-[#d4c4f0] w-full
                      px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 2xl:px-40
                      py-8 xl:py-10">
        <div className="max-w-5xl xl:max-w-6xl mx-auto">

          <div className="text-center mb-6">
            <p className="font-serif font-bold text-[18px] xl:text-[20px] text-[#1a0a3d]">
              Síguenos en nuestras <span className="italic text-[#7c5cc4]">redes</span>{" "}
              <span className="not-italic text-[16px]">✦</span>
            </p>
            <p className="text-[12px] xl:text-[13px] text-[#7060a0] mt-1">
              Contenido real, tips, experiencias y todo lo que necesitas para<br/>
              vivir tu propio destino Au Pair.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 xl:gap-4">
            {socialLinks.map((s, i) => {
              const Icon = s.icon;
              return (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 bg-white border border-[#d4c4f0]
                              rounded-2xl px-4 xl:px-5 py-3 xl:py-3.5
                              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-8 h-8 xl:w-9 xl:h-9 rounded-full ${s.bg}
                                  flex items-center justify-center shrink-0`}>
                    <span className={s.color}>
                      <Icon />
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] xl:text-[13px] font-bold text-[#1a0a3d] leading-none">
                      {s.label}
                    </p>
                    <p className="text-[10px] xl:text-[11px] text-[#7c5cc4] mt-0.5">{s.handle}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}