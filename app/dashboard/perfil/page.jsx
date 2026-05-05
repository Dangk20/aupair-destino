"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SaveIcon, CheckCircleIcon, UserIcon, CameraIcon, LockIcon } from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [form, setForm] = useState({
    foto_url: "", cedula: "", telefono: "", fecha_nacimiento: "", ciudad: "", pais: "",
    conoce_requisitos_26: "", conoce_requisitos_18_20: "",
    curso_primeros_auxilios: "", nivel_ingles: "", licencia_conduccion: "", habilidad_conduccion: "",
    situacion_actual: "", detalle_otra_actividad: "", detalle_estudios: "",
    carrera_graduada: "", detalle_trabajo: "", detalle_sin_ocupacion: "",
    enfermedad_medicamentos: "", detalle_enfermedad_med: "",
    enfermedad_grave: "", detalle_enfermedad_grave: "",
    depresion_panico: "", trastorno_alimenticio: "", autolesiones: "",
    abuso_sustancias: "", detalle_salud_mental: "", isotretinoina: "",
    condiciones_fisicas: "", alergia_medicamentos: "", detalle_alergias: "",
    dosis_covid: "", vacuna_covid: "",
    exp_ninos_externos: "", horas_exp_ninos: "",
    visa_negada: "", detalle_visa_negada: "", visa_cancelada: "",
    familiar_residencia_usa: "", detalle_familiar_residencia: "",
    familiar_visa_estudio_usa: "", detalle_familiar_visa_estudio: "",
    overstay_otro_pais: "",
    entiende_intercambio_cultural: "", consciente_riesgo_familiar: "",
    participo_programa_ap: "", finalizo_programa_ap: "", puede_proveer_certificados: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then((d) => {
        if (!d) return;
        // Bloquear si no tiene acceso
        if (!d.user?.perfil_habilitado) { router.push("/dashboard"); return; }
        setUser(d.user);
      });

    fetch("/api/dashboard/perfil")
      .then((r) => r.json())
      .then((d) => {
        if (d.perfil) {
          const p = d.perfil;
          setForm((prev) => {
            const updated = { ...prev };
            Object.keys(prev).forEach((key) => {
              if (p[key] !== undefined && p[key] !== null) updated[key] = String(p[key]);
            });
            if (p.fecha_nacimiento) updated.fecha_nacimiento = p.fecha_nacimiento.split("T")[0];
            return updated;
          });
          if (p.foto_url) setPreviewFoto(p.foto_url);
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "foto_url") setPreviewFoto(value);
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setMensaje(""); setError("");
    const res = await fetch("/api/dashboard/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setMensaje("✓ Perfil guardado correctamente"); if (form.foto_url) setPreviewFoto(form.foto_url); }
    else setError(data.error || "Error al guardar.");
    setGuardando(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ic = "w-full border border-[#f0dde2] rounded-xl px-4 py-3 text-[13px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition";
  const lc = "text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-1.5 block";

  const Radio = ({ name, options }) => (
    <div className="flex flex-col gap-2 mt-1">
      {options.map((opt) => (
        <label key={opt} onClick={() => setField(name, opt)} className="flex items-center gap-2.5 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
            form[name] === opt ? "border-[#a0435f] bg-[#a0435f]" : "border-[#f0dde2] group-hover:border-[#e8849a]"
          }`}>
            {form[name] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[13px] text-[#2d1a22] leading-snug">{opt}</span>
        </label>
      ))}
    </div>
  );

  const Box = ({ title, children }) => (
    <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
      <h2 className="font-semibold text-[14px] text-[#2d1a22] mb-4 flex items-center gap-2">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );

  const edad = form.fecha_nacimiento
    ? Math.floor((new Date() - new Date(form.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  if (loading) return (
    <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8f9] relative overflow-hidden">

      {/* ── Decoraciones de fondo ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Puntos */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots-p" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#a0435f" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots-p)" />
        </svg>
        {/* Blobs */}
        <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full bg-[#fce8ed]/40 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-[#f0dde2]/30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full bg-[#e8849a]/10 blur-3xl" />
        {/* Flores decorativas */}
        <svg className="absolute top-20 right-12 w-20 h-20 opacity-[0.07]" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i} cx={30+Math.cos(deg*Math.PI/180)*16} cy={30+Math.sin(deg*Math.PI/180)*16}
              rx="10" ry="6" transform={`rotate(${deg} ${30+Math.cos(deg*Math.PI/180)*16} ${30+Math.sin(deg*Math.PI/180)*16})`}
              fill="#a0435f"/>
          ))}
          <circle cx="30" cy="30" r="8" fill="#a0435f"/>
        </svg>
        <svg className="absolute bottom-40 left-8 w-14 h-14 opacity-[0.06]" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          {[0,90,180,270].map((deg, i) => (
            <ellipse key={i} cx={30+Math.cos(deg*Math.PI/180)*12} cy={30+Math.sin(deg*Math.PI/180)*12}
              rx="8" ry="5" fill="#e8849a"/>
          ))}
          <circle cx="30" cy="30" r="6" fill="#e8849a"/>
        </svg>
        {/* Avión */}
        <svg className="absolute top-8 left-1/4 w-10 h-10 opacity-[0.06]" viewBox="0 0 24 24" fill="#a0435f">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
        {/* Estrellitas */}
        {[[85,15],[92,60],[8,45],[15,80]].map(([x,y],i)=>(
          <svg key={i} className="absolute opacity-[0.08]" style={{left:`${x}%`,top:`${y}%`,width:12,height:12}} viewBox="0 0 24 24" fill="#a0435f">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* ── HEADER con foto grande ── */}
        <div className="bg-white border border-[#f0dde2] rounded-3xl overflow-hidden shadow-sm mb-6">
          {/* Franja superior degradada */}
          <div className="h-32 relative" style={{background: "linear-gradient(135deg, #a0435f 0%, #e8849a 50%, #f0b0c0 100%)"}}>
            {/* Decoración en la franja */}
            <svg className="absolute right-8 top-3 opacity-20 w-16 h-16" viewBox="0 0 24 24" fill="white">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <svg className="absolute left-8 bottom-2 opacity-15 w-10 h-10" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-6">

              {/* Foto grande */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-[#fce8ed] flex items-center justify-center overflow-hidden">
                  {previewFoto ? (
                    <img src={previewFoto} alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewFoto("")}
                    />
                  ) : (
                    <UserIcon size={36} className="text-[#a0435f]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#a0435f] border-2 border-white flex items-center justify-center shadow-md">
                  <CameraIcon size={12} className="text-white" />
                </div>
              </div>

              {/* Info resumen */}
              <div className="flex-1 pt-4 md:pt-0 md:pb-1">
                <h1 className="font-serif text-[22px] font-bold text-[#2d1a22]">
                  {user?.nombre} {user?.apellido}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {edad && (
                    <span className="text-[12px] text-[#9a6672]">🎂 {edad} años</span>
                  )}
                  {form.ciudad && (
                    <span className="text-[12px] text-[#9a6672]">📍 {form.ciudad}, {form.pais}</span>
                  )}
                  {form.nivel_ingles && (
                    <span className="text-[11px] bg-[#fce8ed] text-[#a0435f] font-medium px-2 py-0.5 rounded-full">
                      🌎 Inglés {form.nivel_ingles}
                    </span>
                  )}
                  {form.pais_destino && (
                    <span className="text-[11px] bg-[#e8f0e0] text-[#5a8a3a] font-medium px-2 py-0.5 rounded-full">
                      ✈️ Destino: {form.pais_destino}
                    </span>
                  )}
                </div>
                {/* Bio preview */}
                {form.bio ? (
                  <p className="text-[12px] text-[#9a6672] mt-2 leading-relaxed line-clamp-2 max-w-lg italic">
                    "{form.bio}"
                  </p>
                ) : (
                  <p className="text-[12px] text-[#c0909a] mt-2 italic">Agrega una descripción sobre ti...</p>
                )}
              </div>

              {/* Badge estado */}
              <div className="shrink-0 pb-1">
                <span className="inline-flex items-center gap-1.5 bg-[#fce8ed] text-[#a0435f] text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#f0b8c4]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a0435f] animate-pulse" />
                  Perfil activo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className="flex items-center gap-2 bg-[#e8f0e0] border border-[#b8d4a0] text-[#5a8a3a] text-[13px] px-4 py-3 rounded-xl mb-5">
            <CheckCircleIcon size={14} />{mensaje}
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">{error}</div>}

        <form onSubmit={handleGuardar} className="space-y-5">

          {/* 1. FOTO */}
          <Box title="📸 Foto de perfil">
            <div>
              <label className={lc}>URL de tu foto</label>
              <input name="foto_url" type="url" placeholder="https://..." value={form.foto_url} onChange={handleChange} className={ic} />
              <p className="text-[11px] text-[#c0909a] mt-1">Pega el link de tu foto — se actualiza automáticamente arriba</p>
            </div>
          </Box>

          {/* 2. DATOS BÁSICOS */}
          <Box title="👤 Datos básicos">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Cédula *</label><input name="cedula" type="text" placeholder="1234567890" value={form.cedula} onChange={handleChange} className={ic} /></div>
              <div><label className={lc}>Teléfono *</label><input name="telefono" type="text" placeholder="+57 300 000 0000" value={form.telefono} onChange={handleChange} className={ic} /></div>
            </div>
            <div>
              <label className={lc}>Fecha de nacimiento *</label>
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className={ic} />
              {edad && <p className="text-[11px] text-[#9a6672] mt-1">🎂 {edad} años</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Ciudad</label><input name="ciudad" type="text" placeholder="Bogotá" value={form.ciudad} onChange={handleChange} className={ic} /></div>
              <div><label className={lc}>País</label><input name="pais" type="text" placeholder="Colombia" value={form.pais} onChange={handleChange} className={ic} /></div>
            </div>
            <div>
              <label className={lc}>Descripción personal</label>
              <textarea name="bio" rows={3} placeholder="Cuéntanos quién eres, tus hobbies, tu personalidad..."
                value={form.bio || ""} onChange={handleChange} className={`${ic} resize-none`} />
            </div>
            <div>
              <label className={lc}>País de destino deseado</label>
              <input name="pais_destino" type="text" placeholder="Estados Unidos" value={form.pais_destino || ""} onChange={handleChange} className={ic} />
            </div>
          </Box>

          {/* 3. REQUISITOS */}
          <Box title="📋 Requisitos por edad">
            <div>
              <label className={lc}>Si tienes 26 años cumplidos, ¿sabes que debes cumplir los requisitos de inglés, licencia y horas de experiencia? *</label>
              <Radio name="conoce_requisitos_26" options={["Si", "No"]} />
            </div>
            <div>
              <label className={lc}>Si tienes entre 18 y 20 años, ¿sabes que necesitas certificado de primeros auxilios, natación y 1500 horas mínimo? *</label>
              <Radio name="conoce_requisitos_18_20" options={["Si", "No"]} />
            </div>
          </Box>

          {/* 4. HABILIDADES */}
          <Box title="🛠️ Habilidades">
            <div><label className={lc}>¿Has hecho curso de primeros auxilios? *</label><Radio name="curso_primeros_auxilios" options={["Si", "No", "Lo estoy haciendo"]} /></div>
            <div><label className={lc}>¿Cuál es tu nivel de inglés conversacional? *</label><Radio name="nivel_ingles" options={["Ninguno", "Básico", "Intermedio", "Avanzado"]} /></div>
            <div><label className={lc}>¿Tienes licencia de conducción? *</label><Radio name="licencia_conduccion" options={["Si", "No", "Esta en proceso", "No, pero tengo habilidades manejando y la puedo obtener en menos de un mes"]} /></div>
            <div><label className={lc}>¿Cómo calificarías tus habilidades para conducir? *</label>
              <Radio name="habilidad_conduccion" options={["Nulas", "Puedo conducir pero no lo hago bien. Aún me siento muy insegura cuando conduzco.", "Conduzco bien pero aún me falta coger más práctica.", "Me siento muy cómoda y segura cuando conduzco."]} />
            </div>
          </Box>

          {/* 5. SITUACIÓN ACTUAL */}
          <Box title="💼 Situación actual">
            <div><label className={lc}>¿Qué haces en este momento? *</label><Radio name="situacion_actual" options={["Estudio", "Trabajo", "No hago nada", "Desempeño otra actividad"]} /></div>
            {form.situacion_actual === "Desempeño otra actividad" && <div><label className={lc}>Explica con detalles</label><textarea name="detalle_otra_actividad" rows={3} value={form.detalle_otra_actividad} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            {form.situacion_actual === "Estudio" && <div><label className={lc}>¿Qué estudias, semestre y duración?</label><textarea name="detalle_estudios" rows={3} value={form.detalle_estudios} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>Si ya te graduaste, ¿qué estudiaste?</label><input name="carrera_graduada" type="text" placeholder="Ej: Administración de Empresas" value={form.carrera_graduada} onChange={handleChange} className={ic} /></div>
            {form.situacion_actual === "Trabajo" && <div><label className={lc}>¿Formal o informal? ¿Desde cuándo?</label><textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            {form.situacion_actual === "No hago nada" && <div><label className={lc}>¿Desde cuándo no estudias o trabajas?</label><textarea name="detalle_sin_ocupacion" rows={2} value={form.detalle_sin_ocupacion} onChange={handleChange} className={`${ic} resize-none`} /></div>}
          </Box>

          {/* 6. SALUD */}
          <Box title="🏥 Salud">
            <div><label className={lc}>¿Tienes o has tenido enfermedad que requiera medicamentos constantes? *</label><Radio name="enfermedad_medicamentos" options={["Si", "No"]} /></div>
            {form.enfermedad_medicamentos === "Si" && <div><label className={lc}>Por favor explica</label><textarea name="detalle_enfermedad_med" rows={3} value={form.detalle_enfermedad_med} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Tienes o has tenido alguna enfermedad grave? *</label><Radio name="enfermedad_grave" options={["Si", "No"]} /></div>
            {form.enfermedad_grave === "Si" && <div><label className={lc}>Explica con detalle</label><textarea name="detalle_enfermedad_grave" rows={3} value={form.detalle_enfermedad_grave} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Has sufrido depresión o ataques de pánico diagnosticados con medicamentos? *</label><Radio name="depresion_panico" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Has sufrido trastorno alimenticio (bulimia o anorexia)? *</label><Radio name="trastorno_alimenticio" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Te has autolesionado? *</label><Radio name="autolesiones" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Has abusado de sustancias tóxicas? *</label><Radio name="abuso_sustancias" options={["Si", "No"]} /></div>
            <div><label className={lc}>Si has tenido alguna alteración mental, ¿cuándo fue el último episodio y cómo lo controlaste? *</label><textarea name="detalle_salud_mental" rows={3} placeholder="Si no aplica, escribe 'No aplica'" value={form.detalle_salud_mental} onChange={handleChange} className={`${ic} resize-none`} /></div>
            <div><label className={lc}>¿Sigues tratamiento con Isotretinoina en los últimos 3 meses? *</label><Radio name="isotretinoina" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Sufres condiciones físicas que impidan cuidar niños? *</label><Radio name="condiciones_fisicas" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Eres alérgica a algún medicamento? *</label><Radio name="alergia_medicamentos" options={["Si", "No"]} /></div>
            {form.alergia_medicamentos === "Si" && <div><label className={lc}>¿A cuáles?</label><textarea name="detalle_alergias" rows={2} value={form.detalle_alergias} onChange={handleChange} className={`${ic} resize-none`} /></div>}
          </Box>

          {/* 7. VACUNAS */}
          <Box title="💉 Vacunas Covid-19">
            <div><label className={lc}>¿Cuántas dosis te han aplicado? *</label><Radio name="dosis_covid" options={["Ninguna", "Una", "Dos", "Mas de dos"]} /></div>
            <div><label className={lc}>¿Qué vacuna te aplicaron? *</label><input name="vacuna_covid" type="text" placeholder="Ej: Pfizer, Moderna..." value={form.vacuna_covid} onChange={handleChange} className={ic} /></div>
          </Box>

          {/* 8. EXPERIENCIA NIÑOS */}
          <Box title="👶 Experiencia con niños">
            <div><label className={lc}>¿Tienes experiencia con niños que no sean de tu familia? *</label><Radio name="exp_ninos_externos" options={["Si", "No", "La estoy haciendo"]} /></div>
            <div><label className={lc}>¿Cuántas horas de experiencia tienes (incluyendo institucionales)? *</label><Radio name="horas_exp_ninos" options={["Menos de 500 horas", "Entre 501 y 800 horas", "Entre 801 y 1500 horas", "Más de 1500"]} /></div>
          </Box>

          {/* 9. VISAS */}
          <Box title="🛂 Visas e inmigración">
            <div><label className={lc}>¿Te han negado alguna visa? *</label><Radio name="visa_negada" options={["Si", "No"]} /></div>
            {form.visa_negada === "Si" && <div><label className={lc}>Detalla cuándo, razón y país</label><textarea name="detalle_visa_negada" rows={3} value={form.detalle_visa_negada} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Te han cancelado alguna visa? *</label><textarea name="visa_cancelada" rows={3} placeholder="Si no aplica, escribe 'No'" value={form.visa_cancelada} onChange={handleChange} className={`${ic} resize-none`} /></div>
            <div><label className={lc}>¿Familiar cercano en USA solicitando residencia, green card o ciudadanía? *</label><Radio name="familiar_residencia_usa" options={["Si", "No"]} /></div>
            {form.familiar_residencia_usa === "Si" && <div><label className={lc}>¿Quién y qué está solicitando?</label><textarea name="detalle_familiar_residencia" rows={3} value={form.detalle_familiar_residencia} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Familiar en USA con visa de estudio, intercambio o en situación ilegal? *</label><Radio name="familiar_visa_estudio_usa" options={["Si", "No"]} /></div>
            {form.familiar_visa_estudio_usa === "Si" && <div><label className={lc}>¿Quién y cuál es su situación?</label><textarea name="detalle_familiar_visa_estudio" rows={3} value={form.detalle_familiar_visa_estudio} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Has permanecido en otro país más tiempo del autorizado? *</label><textarea name="overstay_otro_pais" rows={3} placeholder="Si no aplica, escribe 'No'" value={form.overstay_otro_pais} onChange={handleChange} className={`${ic} resize-none`} /></div>
          </Box>

          {/* 10. COMPROMISOS */}
          <Box title="✅ Compromisos">
            <div><label className={lc}>¿Entiendes que el programa es solo intercambio cultural y debes regresar al finalizar? *</label><Radio name="entiende_intercambio_cultural" options={["SI", "No"]} /></div>
            <div><label className={lc}>¿Estás consciente de que si un familiar cercano pide asilo o status migratorio durante tu proceso, tu programa se cancela sin devoluciones? *</label><Radio name="consciente_riesgo_familiar" options={["SI", "No"]} /></div>
          </Box>

          {/* 11. PROGRAMA ANTERIOR */}
          <Box title="🔄 Programa anterior Au Pair USA">
            <div><label className={lc}>¿Has participado antes en el programa de Au Pair USA? *</label><Radio name="participo_programa_ap" options={["Si", "No"]} /></div>
            {form.participo_programa_ap === "Si" && (
              <>
                <div><label className={lc}>¿Finalizaste exitosamente?</label><Radio name="finalizo_programa_ap" options={["Si", "No", "No aplica"]} /></div>
                <div><label className={lc}>¿Puedes proveer certificados del programa y estudios universitarios?</label><Radio name="puede_proveer_certificados" options={["Si", "No"]} /></div>
              </>
            )}
          </Box>

          {/* Botón guardar */}
          <button type="submit" disabled={guardando}
            className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white font-medium text-[14px] py-4 rounded-2xl transition shadow-lg shadow-[#a0435f]/20 sticky bottom-4">
            {guardando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2"><SaveIcon size={15} />Guardar perfil</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}