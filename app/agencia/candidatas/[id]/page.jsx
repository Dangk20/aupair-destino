"use client";
// app/agencia/candidatas/[id]/page.jsx — La ficha de una candidata, para su agencia.
//
// La MISMA ficha que ven la candidata y el equipo (components/perfil/FichaCandidata)
// en modo "agencia": ve el perfil, los documentos y la línea de tiempo; puede
// mover la etapa y descargar el perfil; no edita ni observa. Encima, la
// presentación que escribió el equipo para la agencia.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, MessageSquareQuote } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { ETAPAS_AGENCIA, etapaPorId } from "@/lib/etapas-candidata";
import FichaCandidata from "@/components/perfil/FichaCandidata";

function BloqueAgencia({ datos, onMover, ocupado, candidataId }) {
  const IC = { border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: T.text, background: "#fff", fontFamily: T.font };
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: T.shadow, border: `1.5px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>Etapa</label>
          <select value={datos.etapa} disabled={ocupado} onChange={e => onMover(e.target.value)} style={{ ...IC, minWidth: 220 }}>
            {ETAPAS_AGENCIA.map(id => <option key={id} value={id}>{etapaPorId(id).label}</option>)}
          </select>
          <span title="Información diligenciada" style={{ fontSize: 11.5, fontWeight: 600, color: T.primary, background: T.lilac, padding: "4px 10px", borderRadius: 8 }}>{datos.score}% diligenciado</span>
        </div>
        <a href={`/api/agencia/candidatas/${candidataId}/descargar`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: T.primary, color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
          <Download size={14} /> Descargar perfil
        </a>
      </div>
      {datos.perfil?.nota_dap && (
        <div style={{ background: T.softFill, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: T.text, lineHeight: 1.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft, marginBottom: 4 }}>
            <MessageSquareQuote size={13} /> PRESENTACIÓN DE DESTINO AU PAIR
          </div>
          {datos.perfil.nota_dap}
        </div>
      )}
    </div>
  );
}

export default function AgenciaFichaPage() {
  const { id } = useParams();
  const { isMobile } = useMobile();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const decir = (msg, tipo = "ok") => { setAviso({ msg, tipo }); setTimeout(() => setAviso(null), 3000); };

  const cargar = () => fetch(`/api/agencia/candidatas/${id}`)
    .then(r => r.ok ? r.json() : null).then(d => { setDatos(d); setCargando(false); })
    .catch(() => setCargando(false));
  useEffect(() => { cargar(); }, [id]);

  const mover = async (etapa) => {
    setOcupado(true);
    const res = await fetch(`/api/agencia/candidatas/${id}/etapa`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }),
    });
    const d = await res.json().catch(() => ({}));
    setOcupado(false);
    if (!res.ok) decir(d.error || "No se pudo mover", "error");
    else { decir(`Ahora en «${etapaPorId(etapa)?.label}»`); cargar(); }
  };

  if (cargando) return <div style={{ padding: 40, fontFamily: T.font, color: T.textSoft }}>Cargando…</div>;
  if (!datos) return (
    <div style={{ padding: 40, fontFamily: T.font, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <p style={{ color: T.textSoft, fontSize: 14, margin: 0 }}>Esta candidata no está en tu lista.</p>
      <Link href="/agencia" style={{ color: T.primary, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Mis candidatas</Link>
    </div>
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
      {aviso && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: aviso.tipo === "error" ? T.danger : T.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600 }}>
          {aviso.msg}
        </div>
      )}
      <Link href="/agencia" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.textSoft, textDecoration: "none", fontSize: 13, border: `1px solid ${T.border}`, padding: "7px 12px", borderRadius: 10, alignSelf: "flex-start" }}>
        <ChevronLeft size={14} /> Mis candidatas
      </Link>
      <FichaCandidata
        perfil={datos.perfil}
        usuario={datos.perfil}
        modo="agencia"
        titulo="Ficha de la candidata"
        subtitulo="El perfil que Destino Au Pair aprobó para tu agencia."
        recorrido={{ etapa: datos.etapa, agencia: datos.agencia, historial: datos.historial }}
        bloqueInterno={<BloqueAgencia datos={datos} onMover={mover} ocupado={ocupado} candidataId={id} />}
        isMobile={isMobile}
      />
    </div>
  );
}
