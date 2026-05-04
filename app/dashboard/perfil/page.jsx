"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SaveIcon, CheckCircleIcon, UserIcon } from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

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
      .then((d) => { if (d) setUser(d.user); });

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
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (res.ok) setMensaje("✓ Perfil guardado correctamente");
    else setError(data.error || "Error al guardar.");
    setGuardando(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ic = "w-full border border-[#f0dde2] rounded-xl px-4 py-3 text-[13px] text-[#2d1a22] bg-white placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition";
  const lc = "text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-1.5 block";

  const Radio = ({ name, options }) => (
    <div className="flex flex-col gap-2 mt-1">
      {options.map((opt) => (
        <label key={opt} onClick={() => setField(name, opt)} className="flex items-center gap-2.5 cursor-pointer">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${form[name] === opt ? "border-[#a0435f] bg-[#a0435f]" : "border-[#f0dde2]"}`}>
            {form[name] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[13px] text-[#2d1a22] leading-snug">{opt}</span>
        </label>
      ))}
    </div>
  );

  const Box = ({ title, children }) => (
    <div className="bg-white border border-[#f0dde2] rounded-2xl p-5">
      <h2 className="font-semibold text-[14px] text-[#2d1a22] mb-4">{title}</h2>
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
    <div className="min-h-screen bg-[#fff8f9]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
            {form.foto_url ? <img src={form.foto_url} alt="Foto" className="w-full h-full object-cover" /> : <UserIcon size={28} className="text-[#a0435f]" />}
          </div>
          <div>
            <h1 className="font-serif text-[24px] font-bold text-[#2d1a22]">Mi perfil</h1>
            <p className="text-[13px] text-[#9a6672]">{user?.nombre} {user?.apellido}{edad ? ` · ${edad} años` : ""}</p>
          </div>
        </div>

        {mensaje && <div className="flex items-center gap-2 bg-[#e8f0e0] border border-[#b8d4a0] text-[#5a8a3a] text-[13px] px-4 py-3 rounded-xl mb-5"><CheckCircleIcon size={14} />{mensaje}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">{error}</div>}

        <form onSubmit={handleGuardar} className="space-y-5">

          {/* 1. DATOS BÁSICOS */}
          <Box title="👤 Datos básicos">
            <div>
              <label className={lc}>URL de foto de perfil</label>
              <input name="foto_url" type="url" placeholder="https://..." value={form.foto_url} onChange={handleChange} className={ic} />
              <p className="text-[11px] text-[#c0909a] mt-1">Link de tu foto (Google Drive, Imgur, etc.)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Número de cédula *</label><input name="cedula" type="text" placeholder="1234567890" value={form.cedula} onChange={handleChange} className={ic} /></div>
              <div><label className={lc}>Teléfono *</label><input name="telefono" type="text" placeholder="+57 300 000 0000" value={form.telefono} onChange={handleChange} className={ic} /></div>
            </div>
            <div>
              <label className={lc}>Fecha de nacimiento *</label>
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className={ic} />
              {edad && <p className="text-[11px] text-[#9a6672] mt-1">{edad} años</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Ciudad</label><input name="ciudad" type="text" placeholder="Bogotá" value={form.ciudad} onChange={handleChange} className={ic} /></div>
              <div><label className={lc}>País</label><input name="pais" type="text" placeholder="Colombia" value={form.pais} onChange={handleChange} className={ic} /></div>
            </div>
          </Box>

          {/* 2. REQUISITOS */}
          <Box title="📋 Requisitos por edad">
            <div>
              <label className={lc}>Si tienes 26 años cumplidos, ¿sabes que debes cumplir con los requisitos de inglés, licencia de conducción y horas de experiencia, y que tienes menos tiempo para buscar familia? *</label>
              <Radio name="conoce_requisitos_26" options={["Si", "No"]} />
            </div>
            <div>
              <label className={lc}>Si tienes entre 18 y 20 años, ¿sabes que debes tener certificado de primeros auxilios, natación y mínimo 1500 horas de experiencia en cuidado de niños para activar tu perfil? *</label>
              <Radio name="conoce_requisitos_18_20" options={["Si", "No"]} />
            </div>
          </Box>

          {/* 3. HABILIDADES */}
          <Box title="🛠️ Habilidades">
            <div><label className={lc}>¿Has hecho un curso de primeros auxilios? *</label><Radio name="curso_primeros_auxilios" options={["Si", "No", "Lo estoy haciendo"]} /></div>
            <div><label className={lc}>¿Cuál es tu nivel de inglés conversacional? *</label><Radio name="nivel_ingles" options={["Ninguno", "Básico", "Intermedio", "Avanzado"]} /></div>
            <div><label className={lc}>¿Tienes licencia de conducción? *</label><Radio name="licencia_conduccion" options={["Si", "No", "Esta en proceso", "No, pero tengo habilidades manejando y la puedo obtener en menos de un mes"]} /></div>
            <div><label className={lc}>¿Cómo calificarías tus habilidades para conducir en este momento? *</label>
              <Radio name="habilidad_conduccion" options={["Nulas", "Puedo conducir pero no lo hago bien. Aún me siento muy insegura cuando conduzco.", "Conduzco bien pero aún me falta coger más práctica.", "Me siento muy cómoda y segura cuando conduzco."]} />
            </div>
          </Box>

          {/* 4. SITUACIÓN ACTUAL */}
          <Box title="💼 Situación actual">
            <div><label className={lc}>¿Qué haces en este momento? *</label><Radio name="situacion_actual" options={["Estudio", "Trabajo", "No hago nada", "Desempeño otra actividad"]} /></div>
            {form.situacion_actual === "Desempeño otra actividad" && <div><label className={lc}>Explica con detalles qué actividad desempeñas</label><textarea name="detalle_otra_actividad" rows={3} value={form.detalle_otra_actividad} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            {form.situacion_actual === "Estudio" && <div><label className={lc}>¿Qué estudias, qué semestre estás cursando y cuántos semestres son?</label><textarea name="detalle_estudios" rows={3} value={form.detalle_estudios} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>Si ya te graduaste, ¿qué estudiaste?</label><input name="carrera_graduada" type="text" placeholder="Ej: Administración de Empresas" value={form.carrera_graduada} onChange={handleChange} className={ic} /></div>
            {form.situacion_actual === "Trabajo" && <div><label className={lc}>Explica si tu trabajo es formal o informal y desde cuándo estás en él</label><textarea name="detalle_trabajo" rows={3} value={form.detalle_trabajo} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            {form.situacion_actual === "No hago nada" && <div><label className={lc}>¿Desde cuándo no estudias o trabajas?</label><textarea name="detalle_sin_ocupacion" rows={2} value={form.detalle_sin_ocupacion} onChange={handleChange} className={`${ic} resize-none`} /></div>}
          </Box>

          {/* 5. SALUD */}
          <Box title="🏥 Salud">
            <div><label className={lc}>¿Tienes o has tenido alguna enfermedad o condición que requiera medicamentos constantes o controles periódicos? ¿Sigues en tratamiento? *</label><Radio name="enfermedad_medicamentos" options={["Si", "No"]} /></div>
            {form.enfermedad_medicamentos === "Si" && <div><label className={lc}>Por favor explica</label><textarea name="detalle_enfermedad_med" rows={3} value={form.detalle_enfermedad_med} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Tienes o has tenido alguna enfermedad grave o de consideración que debamos conocer? *</label><Radio name="enfermedad_grave" options={["Si", "No"]} /></div>
            {form.enfermedad_grave === "Si" && <div><label className={lc}>Por favor explica con detalle</label><textarea name="detalle_enfermedad_grave" rows={3} value={form.detalle_enfermedad_grave} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Has sufrido de depresión o ataques de pánico y ansiedad diagnosticados y tratados con medicamentos? *</label><Radio name="depresion_panico" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Has sufrido o sufres de algún trastorno alimenticio como bulimia o anorexia? *</label><Radio name="trastorno_alimenticio" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Te has autolesionado? *</label><Radio name="autolesiones" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Has abusado de sustancias tóxicas? *</label><Radio name="abuso_sustancias" options={["Si", "No"]} /></div>
            <div><label className={lc}>Si has sufrido alguna alteración de índole mental, ¿puedes explicar cuándo fue el último episodio y cómo fue controlado? *</label><textarea name="detalle_salud_mental" rows={3} placeholder="Si no aplica, escribe 'No aplica'" value={form.detalle_salud_mental} onChange={handleChange} className={`${ic} resize-none`} /></div>
            <div><label className={lc}>¿Sigues o has seguido en los últimos 3 meses algún tratamiento con Isotretinoina? *</label><Radio name="isotretinoina" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Sufres de dolores de cabeza severos, desmayos, sangrados nasales, mareos u otra condición que te impida cuidar niños? *</label><Radio name="condiciones_fisicas" options={["Si", "No"]} /></div>
            <div><label className={lc}>¿Eres alérgica a algún medicamento? *</label><Radio name="alergia_medicamentos" options={["Si", "No"]} /></div>
            {form.alergia_medicamentos === "Si" && <div><label className={lc}>Explica a qué medicamentos</label><textarea name="detalle_alergias" rows={2} value={form.detalle_alergias} onChange={handleChange} className={`${ic} resize-none`} /></div>}
          </Box>

          {/* 6. VACUNAS */}
          <Box title="💉 Vacunas Covid-19">
            <div><label className={lc}>¿Cuántas dosis de la vacuna Covid-19 te han aplicado? *</label><Radio name="dosis_covid" options={["Ninguna", "Una", "Dos", "Mas de dos"]} /></div>
            <div><label className={lc}>¿Qué vacuna contra el Covid-19 te aplicaron? *</label><input name="vacuna_covid" type="text" placeholder="Ej: Pfizer, Moderna, Johnson..." value={form.vacuna_covid} onChange={handleChange} className={ic} /></div>
          </Box>

          {/* 7. EXPERIENCIA NIÑOS */}
          <Box title="👶 Experiencia con niños">
            <div><label className={lc}>¿Tienes experiencia en cuidado de niños que no sean de tu familia? *</label><Radio name="exp_ninos_externos" options={["Si", "No", "La estoy haciendo"]} /></div>
            <div><label className={lc}>¿Con cuántas horas totales aproximadas de experiencia en cuidado de niños cuentas (incluye horas institucionales)? *</label>
              <Radio name="horas_exp_ninos" options={["Menos de 500 horas", "Entre 501 y 800 horas", "Entre 801 y 1500 horas", "Más de 1500"]} />
            </div>
          </Box>

          {/* 8. VISAS */}
          <Box title="🛂 Visas e inmigración">
            <div><label className={lc}>¿Te han negado alguna visa (cualquier país)? *</label><Radio name="visa_negada" options={["Si", "No"]} /></div>
            {form.visa_negada === "Si" && <div><label className={lc}>¿Qué visas te negaron? Escribe cuándo aplicaste, la razón y el país</label><textarea name="detalle_visa_negada" rows={3} value={form.detalle_visa_negada} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Te han cancelado alguna visa? Si la respuesta es sí, explica los motivos *</label><textarea name="visa_cancelada" rows={3} placeholder="Si no aplica, escribe 'No'" value={form.visa_cancelada} onChange={handleChange} className={`${ic} resize-none`} /></div>
            <div><label className={lc}>¿Tienes algún familiar cercano (mamá, papá, hermanos, abuelos) en USA solicitando visa de residencia, green card o ciudadanía? *</label><Radio name="familiar_residencia_usa" options={["Si", "No"]} /></div>
            {form.familiar_residencia_usa === "Si" && <div><label className={lc}>¿Qué familiar es y qué documentación está solicitando?</label><textarea name="detalle_familiar_residencia" rows={3} value={form.detalle_familiar_residencia} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Tienes algún familiar cercano en USA con visa de estudio, intercambio o en situación ilegal? *</label><Radio name="familiar_visa_estudio_usa" options={["Si", "No"]} /></div>
            {form.familiar_visa_estudio_usa === "Si" && <div><label className={lc}>¿Qué familiar es y cuál es su situación?</label><textarea name="detalle_familiar_visa_estudio" rows={3} value={form.detalle_familiar_visa_estudio} onChange={handleChange} className={`${ic} resize-none`} /></div>}
            <div><label className={lc}>¿Has permanecido en otro país durante más tiempo del autorizado por inmigración? Da el máximo de detalles *</label><textarea name="overstay_otro_pais" rows={3} placeholder="Si no aplica, escribe 'No'" value={form.overstay_otro_pais} onChange={handleChange} className={`${ic} resize-none`} /></div>
          </Box>

          {/* 9. COMPROMISOS */}
          <Box title="✅ Compromisos">
            <div><label className={lc}>Este programa es solo intercambio cultural temporal. Para cambiar de estatus debes regresar a Colombia. ¿Entiendes que debes regresar al finalizar? *</label><Radio name="entiende_intercambio_cultural" options={["SI", "No"]} /></div>
            <div><label className={lc}>Si un familiar cercano se queda ilegal o pide asilo/green card durante tu proceso, resultará en cancelación inmediata sin devoluciones. ¿Estás consciente de este riesgo? *</label><Radio name="consciente_riesgo_familiar" options={["SI", "No"]} /></div>
          </Box>

          {/* 10. PROGRAMA ANTERIOR */}
          <Box title="🔄 Programa anterior Au Pair USA">
            <div><label className={lc}>¿Has participado antes en el programa de Au Pair USA? *</label><Radio name="participo_programa_ap" options={["Si", "No"]} /></div>
            {form.participo_programa_ap === "Si" && (
              <>
                <div><label className={lc}>¿Finalizaste el programa de manera exitosa?</label><Radio name="finalizo_programa_ap" options={["Si", "No", "No aplica"]} /></div>
                <div><label className={lc}>¿Puedes proveer certificados de culminación exitosa del programa y de los estudios de créditos universitarios?</label><Radio name="puede_proveer_certificados" options={["Si", "No"]} /></div>
              </>
            )}
          </Box>

          <button type="submit" disabled={guardando}
            className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white font-medium text-[14px] py-4 rounded-2xl transition shadow-lg shadow-[#a0435f]/20">
            {guardando ? (
              <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><SaveIcon size={15} />Guardar perfil</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}