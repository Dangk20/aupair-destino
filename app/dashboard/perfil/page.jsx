"use client";
// app/dashboard/perfil/page.jsx — El perfil de la candidata. Una sola pantalla.
//
// Antes había dos: un índice con el progreso y, detrás, los formularios. La
// candidata terminaba sus 15 secciones y no tenía dónde verlas, porque las dos
// únicas pantallas que mostraban su información eran formularios de edición.
//
// Lo que se ve vive ahora en components/perfil/FichaCandidata.jsx, compartido
// con `/admin/perfiles/[id]`: la clienta veía una ficha distinta de la de la
// candidata, con su propia lista de campos y su propio porcentaje. Esta página
// se queda con lo suyo: traer los datos y decidir a dónde lleva cada lápiz.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";
import { perfilCompleto } from "@/lib/campos-perfil";
import FichaCandidata from "@/components/perfil/FichaCandidata";

// Cada parte se edita en su propio formulario, y el lápiz de una sección abre
// el suyo anclado a ella. La regla de hasta dónde se puede saltar la aplica
// `seccionInicial()` dentro del formulario, no aquí.
const FORMULARIO = {
  1: "/dashboard/perfil/evaluacion",
  2: "/dashboard/perfil/agencia",
};

export default function PerfilPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const gate = useAccessGate("perfil");
  const gateDocs = useAccessGate("documentos");

  const [user, setUser]       = useState(null);
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p, fb = null) =>
      p.then(r => { if (r.status === 401) { router.push("/login"); return fb; } return r.json().catch(() => fb); })
       .catch(() => fb);
    Promise.all([
      safe(fetch("/api/auth/me"), { user: null }),
      safe(fetch("/api/dashboard/perfil"), null),
    ]).then(([me, perf]) => {
      setUser(me?.user || null);
      setPerfil(perf?.perfil || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || gate.loading) return <GateLoading />;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="Tu perfil de candidata" />;
  if (!perfil) return <GateLoading />;

  const completo = perfilCompleto(perfil);

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile ? "16px 16px 90px" : "28px 30px", maxWidth:860, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", gap:18 }}>

      <FichaCandidata
        perfil={perfil}
        usuario={user}
        modo="propio"
        titulo="Mi perfil"
        subtitulo={completo
          ? "Así te presentamos ante las agencias aliadas."
          : "Complétalo para que podamos presentarte ante una agencia."}
        rutaEdicion={sec => `${FORMULARIO[sec.parte]}?seccion=${sec.id}`}
        puedeVerDocumentos={gateDocs.access}
        isMobile={isMobile}
      />

      {/* Qué sigue — lo explicaba el índice que esta pantalla reemplazó */}
      {completo && (
        <div style={{ background:T.lilac, borderRadius:18, padding:16, fontSize:12.5, color:T.textSoft, lineHeight:1.5 }}>
          Puedes seguir tu avance en <Link href="/dashboard/proceso" style={{ color:T.primary, fontWeight:700 }}>Mi Destino</Link>.
        </div>
      )}

    </div>
  );
}
