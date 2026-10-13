"use client";
// app/asociada/page.jsx — Las candidatas de la asociada, por etapa.
//
// El mismo tablero del admin y la agencia (components/panel/TableroEtapas),
// en sólo lectura: las que llegaron por su cupón (change `candidatas-por-cupon`),
// en qué etapa van y si ya pagaron. Sin contacto, perfil ni chat.
//
// Reemplaza al inicio heredado del proveedor, que filtraba por una columna
// que nunca existió (`asesora_asignada_id`) y respondía error.
import { useEffect, useState } from "react";
import Link from "next/link";
import { HandCoins } from "lucide-react";
import { useMobile } from "@/context/MobileContext";
import { T } from "@/lib/tema";
import TableroEtapas from "@/components/panel/TableroEtapas";

function Cifra({ titulo, valor }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: T.shadow, minWidth: 140, flex: "1 1 140px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: T.textSoft }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.ink, marginTop: 2 }}>{valor}</div>
    </div>
  );
}

export default function AsociadaInicioPage() {
  const { isMobile } = useMobile();
  const [candidatas, setCandidatas] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/asociada/tablero")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setCandidatas(d.candidatas || []))
      .catch(() => { setError(true); setCandidatas([]); });
  }, []);

  const pagaron = (candidatas || []).filter(c => c.pago).length;

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: isMobile ? "16px 16px 90px" : "28px 30px", display: "flex", flexDirection: "column", gap: 18, width: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: isMobile ? 21 : 26, fontWeight: 700, lineHeight: 1.1 }}>Mis candidatas</div>
          <div style={{ fontSize: 13.5, color: T.textSoft, marginTop: 3 }}>
            Las que se registraron o pagaron con tu código, y en qué etapa de su proceso van.
          </div>
        </div>
        <Link href="/asociada/comisiones" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: T.primary, color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
          <HandCoins size={14} /> Mis comisiones
        </Link>
      </div>

      {candidatas === null
        ? <div style={{ fontSize: 13, color: T.textSoft }}>Cargando…</div>
        : error
        ? <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: T.shadow, fontSize: 13.5, color: T.danger, textAlign: "center" }}>
            No se pudieron cargar tus candidatas. Intenta de nuevo en un momento.
          </div>
        : <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Cifra titulo="CANDIDATAS" valor={candidatas.length} />
              <Cifra titulo="PAGARON SU CUPO" valor={pagaron} />
              <Cifra titulo="SÓLO REGISTRADAS" valor={candidatas.length - pagaron} />
            </div>
            {candidatas.length === 0
              ? <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: T.shadow, fontSize: 13.5, color: T.textSoft, textAlign: "center" }}>
                  Todavía no tienes candidatas. Aparecerán aquí cuando alguien se registre o pague su cupo con tu código.
                </div>
              : <TableroEtapas candidatas={candidatas} soloLectura />}
          </>}
    </div>
  );
}
