"use client";

import { useEffect, useState } from "react";
import { PencilIcon, SaveIcon, XIcon, VideoIcon } from "lucide-react";

export default function AdminSesionesPage() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargar = () => {
    fetch("/api/admin/sesiones")
      .then((r) => r.json())
      .then((d) => { setSesiones(d.sesiones || []); setLoading(false); });
  };

  useEffect(() => { cargar(); }, []);

  const iniciarEdicion = (s) => {
    setEditando(s.id);
    setForm({ titulo: s.titulo, descripcion: s.descripcion || "", url_video: s.url_video || "" });
    setMensaje("");
  };

  const guardar = async (id) => {
    setGuardando(true);
    const res = await fetch("/api/admin/sesiones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    if (res.ok) {
      setMensaje("✓ Guardado correctamente");
      setEditando(null);
      cargar();
    } else {
      setMensaje("Error al guardar.");
    }
    setGuardando(false);
  };

  const inputClass = "w-full border border-[#f0dde2] rounded-xl px-4 py-2.5 text-[13px] text-[#2d1a22] bg-white focus:outline-none focus:ring-2 focus:ring-[#e8849a] transition";

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-bold text-[#2d1a22]">Sesiones</h1>
        <p className="text-[13px] text-[#9a6672] mt-0.5">Edita los títulos, descripciones y URLs de video</p>
      </div>

      {mensaje && (
        <div className="bg-[#e8f0e0] border border-[#b8d4a0] text-[#5a8a3a] text-[13px] px-4 py-3 rounded-xl mb-5">
          {mensaje}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-7 h-7 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sesiones.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-[#f0dde2] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#fce8ed] flex items-center justify-center shrink-0">
                  <span className="font-serif text-[#a0435f] text-[13px] font-bold">{s.orden}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-[#2d1a22]">{s.titulo}</p>
                    {(s.es_gratis === 1 || s.es_gratis === true) && (
                      <span className="text-[9px] bg-[#fce8ed] text-[#a0435f] font-semibold px-1.5 py-0.5 rounded-full">
                        GRATIS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <VideoIcon size={10} className={s.url_video ? "text-[#5a8a3a]" : "text-[#c0909a]"} />
                    <p className="text-[11px] text-[#9a6672] truncate max-w-xs">
                      {s.url_video || "Sin URL de video"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => editando === s.id ? setEditando(null) : iniciarEdicion(s)}
                className="flex items-center gap-1.5 text-[12px] text-[#9a6672] hover:text-[#a0435f] border border-[#f0dde2] hover:border-[#e8b0bc] px-3 py-1.5 rounded-xl transition"
              >
                {editando === s.id ? <XIcon size={12} /> : <PencilIcon size={12} />}
                {editando === s.id ? "Cancelar" : "Editar"}
              </button>
            </div>

            {editando === s.id && (
              <div className="border-t border-[#fce8ed] px-5 py-4 bg-[#fff8f9] space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-1 block">Título</label>
                  <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-1 block">Descripción</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#2d1a22] uppercase tracking-wide mb-1 block">URL del video</label>
                  <input type="url" value={form.url_video} onChange={(e) => setForm({ ...form, url_video: e.target.value })}
                    placeholder="https://vimeo.com/... o https://youtube.com/..." className={inputClass} />
                  <p className="text-[11px] text-[#c0909a] mt-1">Soporta YouTube, Vimeo o enlace directo MP4</p>
                </div>
                <button onClick={() => guardar(s.id)} disabled={guardando}
                  className="flex items-center gap-2 bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition">
                  {guardando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <SaveIcon size={13} />
                  )}
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}