"use client";

import { useEffect, useState } from "react";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, UserIcon } from "lucide-react";

const SI_NO = { "Si": "✓ Sí", "SI": "✓ Sí", "No": "✗ No", null: "—", "": "—" };
const badge = (val) => {
  if (!val) return <span className="text-[#c0909a]">—</span>;
  const isYes = val === "Si" || val === "SI";
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isYes ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fce8ed] text-[#a0435f]"}`}>{isYes ? "✓ Sí" : "✗ No"}</span>;
};

const Row = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-5 gap-2 py-1.5 border-b border-[#fff0f3] last:border-0">
      <p className="col-span-2 text-[11px] text-[#9a6672] font-medium leading-snug">{label}</p>
      <p className="col-span-3 text-[12px] text-[#2d1a22] leading-snug">{value}</p>
    </div>
  );
};

const RowBool = ({ label, value }) => (
  <div className="grid grid-cols-5 gap-2 py-1.5 border-b border-[#fff0f3] last:border-0">
    <p className="col-span-2 text-[11px] text-[#9a6672] font-medium leading-snug">{label}</p>
    <div className="col-span-3">{badge(value)}</div>
  </div>
);

export default function AdminPerfilesPage() {
  const [usuarias, setUsuarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandida, setExpandida] = useState(null);

  useEffect(() => {
    fetch("/api/admin/perfiles")
      .then((r) => r.json())
      .then((d) => { setUsuarias(d.perfiles || []); setLoading(false); });
  }, []);

  const filtradas = usuarias.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.email} ${u.pais || ""} ${u.ciudad || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">Perfiles</h1>
        <p className="text-[13px] text-[#9a6672] mt-0.5">Evaluación completa de cada aplicante</p>
      </div>

      <div className="relative mb-5">
        <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0909a]" />
        <input type="text" placeholder="Buscar por nombre o correo..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#f0dde2] rounded-xl text-[13px] text-[#2d1a22] placeholder:text-[#c0909a] focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition" />
      </div>

      {loading ? (
        <div className="py-12 text-center"><div className="w-7 h-7 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtradas.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[#9a6672]">No se encontraron perfiles.</p>
      ) : (
        <div className="space-y-3">
          {filtradas.map((u) => {
            const edad = u.fecha_nacimiento ? Math.floor((new Date() - new Date(u.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
            const abierta = expandida === u.id;

            return (
              <div key={u.id} className="bg-white rounded-2xl border border-[#f0dde2] overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#fff8f9] transition" onClick={() => setExpandida(abierta ? null : u.id)}>
                  <div className="w-11 h-11 rounded-xl bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
                    {u.foto_url ? <img src={u.foto_url} alt="" className="w-full h-full object-cover" /> : <UserIcon size={18} className="text-[#a0435f]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-[#2d1a22]">{u.nombre} {u.apellido}</p>
                      {edad && <span className="text-[11px] text-[#9a6672]">{edad} años</span>}
                      {u.ciudad && <span className="text-[11px] text-[#9a6672]">· {u.ciudad}, {u.pais}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-[#9a6672]">{u.email}</span>
                      {u.perfil_completo ? (
                        <span className="text-[10px] bg-[#e8f0e0] text-[#5a8a3a] font-medium px-2 py-0.5 rounded-full">Completo</span>
                      ) : (
                        <span className="text-[10px] bg-[#fce8ed] text-[#a0435f] font-medium px-2 py-0.5 rounded-full">Incompleto</span>
                      )}
                      {u.nivel_ingles && <span className="text-[10px] bg-[#f0ebe0] text-[#8a6f3a] font-medium px-2 py-0.5 rounded-full">Inglés: {u.nivel_ingles}</span>}
                    </div>
                  </div>
                  {abierta ? <ChevronUpIcon size={16} className="text-[#c0909a] shrink-0" /> : <ChevronDownIcon size={16} className="text-[#c0909a] shrink-0" />}
                </div>

                {/* Detalle completo */}
                {abierta && (
                  <div className="border-t border-[#fce8ed] px-5 py-5 bg-[#fff8f9]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Col 1 */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Datos básicos</p>
                          <Row label="Cédula" value={u.cedula} />
                          <Row label="Teléfono" value={u.telefono} />
                          <Row label="WhatsApp" value={u.whatsapp} />
                          <Row label="Fecha nac." value={u.fecha_nacimiento ? new Date(u.fecha_nacimiento).toLocaleDateString("es-CO") : null} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Habilidades</p>
                          <Row label="Primeros auxilios" value={u.curso_primeros_auxilios} />
                          <Row label="Inglés" value={u.nivel_ingles} />
                          <Row label="Licencia" value={u.licencia_conduccion} />
                          <Row label="Habilidad conducción" value={u.habilidad_conduccion} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Situación actual</p>
                          <Row label="Actividad" value={u.situacion_actual} />
                          <Row label="Detalle actividad" value={u.detalle_otra_actividad || u.detalle_estudios || u.detalle_trabajo || u.detalle_sin_ocupacion} />
                          <Row label="Graduada de" value={u.carrera_graduada} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Experiencia niños</p>
                          <Row label="Exp. externos" value={u.exp_ninos_externos} />
                          <Row label="Horas exp." value={u.horas_exp_ninos} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Vacunas</p>
                          <Row label="Dosis Covid" value={u.dosis_covid} />
                          <Row label="Vacuna" value={u.vacuna_covid} />
                        </div>
                      </div>

                      {/* Col 2 */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Salud</p>
                          <RowBool label="Enfermedad/medicamentos" value={u.enfermedad_medicamentos} />
                          {u.detalle_enfermedad_med && <Row label="Detalle" value={u.detalle_enfermedad_med} />}
                          <RowBool label="Enfermedad grave" value={u.enfermedad_grave} />
                          {u.detalle_enfermedad_grave && <Row label="Detalle" value={u.detalle_enfermedad_grave} />}
                          <RowBool label="Depresión/pánico" value={u.depresion_panico} />
                          <RowBool label="Trastorno alimenticio" value={u.trastorno_alimenticio} />
                          <RowBool label="Autolesiones" value={u.autolesiones} />
                          <RowBool label="Sustancias tóxicas" value={u.abuso_sustancias} />
                          {u.detalle_salud_mental && <Row label="Salud mental" value={u.detalle_salud_mental} />}
                          <RowBool label="Isotretinoina" value={u.isotretinoina} />
                          <RowBool label="Condiciones físicas" value={u.condiciones_fisicas} />
                          <RowBool label="Alergias med." value={u.alergia_medicamentos} />
                          {u.detalle_alergias && <Row label="Detalle alergias" value={u.detalle_alergias} />}
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Visas e inmigración</p>
                          <RowBool label="Visa negada" value={u.visa_negada} />
                          {u.detalle_visa_negada && <Row label="Detalle visa negada" value={u.detalle_visa_negada} />}
                          <Row label="Visa cancelada" value={u.visa_cancelada} />
                          <RowBool label="Familiar resid. USA" value={u.familiar_residencia_usa} />
                          {u.detalle_familiar_residencia && <Row label="Detalle familiar" value={u.detalle_familiar_residencia} />}
                          <RowBool label="Familiar visa estudio" value={u.familiar_visa_estudio_usa} />
                          {u.detalle_familiar_visa_estudio && <Row label="Detalle familiar" value={u.detalle_familiar_visa_estudio} />}
                          <Row label="Overstay otro país" value={u.overstay_otro_pais} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Compromisos y programa</p>
                          <RowBool label="Entiende intercambio" value={u.entiende_intercambio_cultural} />
                          <RowBool label="Consciente riesgo fam." value={u.consciente_riesgo_familiar} />
                          <RowBool label="Participó en AP USA" value={u.participo_programa_ap} />
                          <Row label="Finalizó programa" value={u.finalizo_programa_ap} />
                          <RowBool label="Puede proveer certif." value={u.puede_proveer_certificados} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#a0435f] uppercase tracking-widest mb-2">Requisitos edad</p>
                          <RowBool label="Conoce req. 26 años" value={u.conoce_requisitos_26} />
                          <RowBool label="Conoce req. 18-20 años" value={u.conoce_requisitos_18_20} />
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}