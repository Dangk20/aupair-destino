"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon, ChevronLeftIcon, LockIcon, PlayCircleIcon } from "lucide-react";

const VIDEO_DEMO =  "/assets/Bienvenida.mp4";

export default function SesionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sesion, setSesion] = useState(null);
  const [todas, setTodas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completando, setCompletando] = useState(false);
  const [yaCompletada, setYaCompletada] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/sesiones")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setTodas(d.sesiones);
        const encontrada = d.sesiones.find((s) => String(s.id) === String(id));
        if (!encontrada) { router.push("/dashboard"); return; }
        if (encontrada.estado === "locked") { router.push("/dashboard"); return; }
        setSesion(encontrada);
        setYaCompletada(encontrada.estado === "completed");
        setLoading(false);
      });
  }, [id]);

  const handleCompletar = async () => {
    if (yaCompletada || completando) return;
    setCompletando(true);
    try {
      const res = await fetch("/api/dashboard/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: Number(id) }),
      });
      if (res.ok) {
        setYaCompletada(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo completar la sesión.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setCompletando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#9a6672]">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  const indiceActual = todas.findIndex((s) => String(s.id) === String(id));
  const siguiente = todas[indiceActual + 1];
  const anterior = todas[indiceActual - 1];

  return (
    <div className="min-h-screen bg-[#fff8f9]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-[13px] text-[#9a6672] hover:text-[#a0435f] transition">
            <ChevronLeftIcon size={14} />
            Mi ruta
          </Link>
          <span className="text-[#e8b0bc] text-[13px]">/</span>
          <span className="text-[13px] text-[#2d1a22] font-medium">{sesion.titulo}</span>
        </div>

        {/* Video player */}
        <div className="rounded-2xl overflow-hidden bg-[#2d1a22] shadow-2xl shadow-[#2d1a22]/25 mb-6 aspect-video w-full">
          {sesion.url_video ? (
            sesion.url_video.includes("youtube.com") || sesion.url_video.includes("youtu.be") ? (
              <iframe src={sesion.url_video.replace("watch?v=", "embed/")} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : sesion.url_video.includes("vimeo.com") ? (
              <iframe src={sesion.url_video.replace("vimeo.com/", "player.vimeo.com/video/")} className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            ) : (
              <video src={sesion.url_video} controls className="w-full h-full" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
            )
          ) : (
            <video src={VIDEO_DEMO} controls className="w-full h-full" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
          )}
        </div>

        {/* Info sesión */}
        <div className="bg-white rounded-2xl border border-[#f0dde2] p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              {(sesion.es_gratis === 1 || sesion.es_gratis === true) && (
                <span className="text-[10px] bg-[#fce8ed] text-[#a0435f] font-semibold px-2 py-0.5 rounded-full mr-2">
                  GRATIS
                </span>
              )}
              <h1 className="font-serif text-[22px] font-bold text-[#2d1a22] mt-1">{sesion.titulo}</h1>
            </div>
            {yaCompletada ? (
              <div className="flex items-center gap-1.5 bg-[#fce8ed] text-[#a0435f] text-[12px] font-medium px-3 py-1.5 rounded-full shrink-0">
                <CheckIcon size={12} />
                Completada
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#fce8ed] text-[#e8849a] text-[12px] font-medium px-3 py-1.5 rounded-full shrink-0">
                <PlayCircleIcon size={12} />
                En curso
              </div>
            )}
          </div>
          {sesion.descripcion && (
            <p className="text-[14px] text-[#7a4a54] leading-relaxed">{sesion.descripcion}</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Botón completar */}
        {!yaCompletada ? (
          <button onClick={handleCompletar} disabled={completando}
            className="w-full bg-[#a0435f] hover:bg-[#8a3550] disabled:bg-[#a0435f]/50 text-white font-medium text-[14px] py-4 rounded-2xl transition shadow-lg shadow-[#a0435f]/20 mb-4">
            {completando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : "✓ Marcar como completada y continuar"}
          </button>
        ) : (
          <div className="w-full bg-[#fce8ed] border border-[#f0b8c4] text-[#a0435f] font-medium text-[14px] py-4 rounded-2xl text-center mb-4">
            ✓ Sesión completada — redirigiendo...
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between gap-3">
          {anterior ? (
            <Link href={`/dashboard/sesion/${anterior.id}`}
              className="flex items-center gap-2 text-[13px] text-[#9a6672] hover:text-[#a0435f] border border-[#f0dde2] bg-white px-4 py-2.5 rounded-xl transition">
              <ChevronLeftIcon size={14} />
              {anterior.titulo}
            </Link>
          ) : <div />}

          {siguiente && siguiente.estado !== "locked" ? (
            <Link href={`/dashboard/sesion/${siguiente.id}`}
              className="flex items-center gap-2 text-[13px] text-white bg-[#a0435f] hover:bg-[#8a3550] px-4 py-2.5 rounded-xl transition ml-auto">
              {siguiente.titulo}
              <ChevronLeftIcon size={14} className="rotate-180" />
            </Link>
          ) : siguiente ? (
            <div className="flex items-center gap-2 text-[13px] text-[#c0909a] border border-[#f0dde2] px-4 py-2.5 rounded-xl ml-auto">
              <LockIcon size={12} />
              {siguiente.titulo}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}