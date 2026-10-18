"use client";
// app/dashboard/recursos/page.jsx — Biblioteca de recursos.
//
// Reúne los archivos que el equipo sube a cada sesión del curso (R7,
// `sesion_recursos`), agrupados por sesión. Antes era «Próximamente» sobre una
// tabla `recursos` que nunca existió (change candidata-datos-reales). Los datos
// salen de GET /api/dashboard/sesiones: sólo las sesiones que la candidata
// puede ver, con la misma descarga autenticada del curso.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, PlayCircle } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import { useAccessGate, GateLoading, GateScreen } from "@/components/dashboard/AccessGate";
import { ListaRecursos } from "@/components/dashboard/ListaRecursos";

export default function RecursosPage() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const gate = useAccessGate("recursos");
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/sesiones")
      .then((r) => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then((d) => { setSesiones(d?.sesiones || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || gate.loading) return <GateLoading/>;
  if (!gate.access) return <GateScreen estado={gate.estado} titulo="Los recursos"/>;

  const conRecursos = sesiones.filter((s) => s.recursos?.length > 0);
  const bloqueadas  = sesiones.filter((s) => s.estado === "locked").length;

  return (
    <div style={{ fontFamily:T.font, color:T.text, padding:isMobile?"16px 16px 90px":"28px 30px", maxWidth:900, margin:"0 auto", width:"100%" }}>
      <div style={{ fontSize:isMobile?21:26, fontWeight:700, lineHeight:1.1 }}>Recursos</div>
      <div style={{ fontSize:13.5, color:T.textSoft, marginTop:3 }}>Guías y documentos de cada clase de tu curso, para descargar cuando los necesites.</div>

      {conRecursos.length === 0 ? (
        <div style={{ marginTop:22, background:"#fff", borderRadius:20, padding:"34px 24px", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:16, background:T.lilac, color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
            <FolderOpen size={24}/>
          </div>
          <div style={{ fontSize:15, fontWeight:700 }}>Aún no hay recursos para ti</div>
          <div style={{ fontSize:13, color:T.textSoft, marginTop:6, lineHeight:1.5 }}>
            Aparecen aquí a medida que el equipo los publica y avanzas en tu curso.
          </div>
          <Link href="/dashboard/curso" style={{ display:"inline-flex", alignItems:"center", gap:7, marginTop:16, background:T.primary, color:"#fff", borderRadius:12, padding:"10px 16px", fontWeight:700, fontSize:13, textDecoration:"none" }}>
            <PlayCircle size={15}/> Ir a mi curso
          </Link>
        </div>
      ) : (
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:14 }}>
          {conRecursos.map((s, i) => (
            <div key={s.id} style={{ background:"#fff", borderRadius:20, padding:isMobile?16:20 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", color:T.textSoft }}>CLASE {s.orden ?? i + 1}</div>
              <div style={{ fontSize:15, fontWeight:700, margin:"3px 0 12px" }}>{s.titulo}</div>
              <ListaRecursos recursos={s.recursos}/>
            </div>
          ))}
        </div>
      )}

      {bloqueadas > 0 && (
        <div style={{ marginTop:14, fontSize:12.5, color:T.textSoft, textAlign:"center" }}>
          Si una clase aún está bloqueada, sus recursos aparecen cuando llegues a ella.
        </div>
      )}
    </div>
  );
}
