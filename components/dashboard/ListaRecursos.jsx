"use client";
// Filas de recursos descargables (R7): las usan el curso, bajo cada clase, y la
// biblioteca de Recursos, que los agrupa por sesión (candidata-datos-reales).
import { Download, FileText } from "lucide-react";
import { T } from "@/lib/tema";

const TIPO_RECURSO = { pdf:"PDF", docx:"Word", otro:"Archivo" };
const tamano = (kb) => !kb ? "" : kb >= 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`;

export function ListaRecursos({ recursos }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {recursos.map(r => {
        const ok = r.disponible !== false;
        return (
          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:T.softFill, opacity:ok?1:.6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#fff", color:T.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FileText size={17}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.nombre}</div>
              <div style={{ fontSize:11.5, color:T.textSoft }}>
                {ok ? [TIPO_RECURSO[r.tipo] || "Archivo", tamano(r.tamano_kb)].filter(Boolean).join(" · ") : "No disponible"}
              </div>
            </div>
            {ok && (
              <a href={r.url} download aria-label={`Descargar ${r.nombre}`}
                style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.primary, color:"#fff", borderRadius:10, padding:"8px 12px", fontSize:12.5, fontWeight:700, textDecoration:"none", flexShrink:0 }}>
                <Download size={14}/> Descargar
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
