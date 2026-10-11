"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/ModalSiguientePaso.jsx — Qué sigue al terminar una parte
//
// Al pulsar "Finalizar" la candidata veía "Guardado correctamente" y volvía a
// su perfil: nada le decía que el paso siguiente era cargar sus documentos, y
// los ocho obligatorios se quedaban sin cargar hasta que ella entraba por su
// cuenta al módulo (R1, reunión del 2026-08-05).
//
// `siguientePaso()` decide qué ofrecer; el formulario sólo muestra el aviso si
// hay algo que ofrecer.
// ════════════════════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { FileUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { T } from "@/lib/tema";
import { avanceDocumentacion } from "@/lib/documentos";

/**
 * Qué se le puede ofrecer a la candidata al terminar una parte.
 *
 * Documentos sólo si tiene el módulo habilitado —si no, el acceso directo la
 * llevaría a una pantalla con candado— y le falta algún obligatorio.
 *
 * @param {{ parte: 1|2, parte2Completa: boolean }} opciones
 * @returns {Promise<{ documentos:boolean, parte2:boolean, pendientes:number }>}
 */
export async function siguientePaso({ parte, parte2Completa }) {
  const json = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const acceso = await json("/api/dashboard/acceso");

  let documentos = false;
  let pendientes = 0;
  if (acceso?.documentos) {
    const docs = await json("/api/dashboard/documentos");
    const lista = docs?.docs || [];
    const { cargados, total } = avanceDocumentacion(lista);
    pendientes = total - cargados;
    documentos = pendientes > 0;
  }

  return { documentos, parte2: parte === 1 && !parte2Completa, pendientes };
}

export default function ModalSiguientePaso({ parte, oferta }) {
  const router = useRouter();
  const ir = (url) => router.push(url);

  const boton = (primario) => ({
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "13px 18px", borderRadius: 14, cursor: "pointer", fontFamily: T.font,
    fontWeight: 700, fontSize: 14,
    background: primario ? T.primary : "#fff",
    color: primario ? "#fff" : T.primary,
    border: primario ? "none" : `1.5px solid ${T.border}`,
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="siguiente-paso-titulo"
      style={{ position: "fixed", inset: 0, background: "rgba(58,37,48,.45)", zIndex: 1000,
               display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.card, borderRadius: 22, maxWidth: 420, width: "100%",
                    padding: "28px 24px", textAlign: "center", fontFamily: T.font,
                    boxShadow: "0 24px 48px rgba(58,37,48,.25)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: T.greenBg, color: T.green,
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <CheckCircle2 size={30} />
        </div>
        <h2 id="siguiente-paso-titulo" style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 8px" }}>
          ¡Terminaste la Parte {parte}!
        </h2>
        <p style={{ fontSize: 14, color: T.textSoft, lineHeight: 1.6, margin: "0 0 22px" }}>
          {oferta.documentos
            ? <>¿Quieres cargar tus documentos ahora? Te {oferta.pendientes === 1 ? "falta 1 obligatorio" : `faltan ${oferta.pendientes} obligatorios`} para que podamos revisar tu perfil completo.</>
            : <>Sigue con la Parte 2: es la información que verá la agencia.</>}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {oferta.documentos && (
            <button type="button" onClick={() => ir("/dashboard/documentos")} style={boton(true)}>
              <FileUp size={16} /> Cargar documentos
            </button>
          )}
          {oferta.parte2 && (
            <button type="button" onClick={() => ir("/dashboard/perfil/agencia")} style={boton(!oferta.documentos)}>
              Continuar con la Parte 2 <ArrowRight size={16} />
            </button>
          )}
          <button type="button" onClick={() => ir("/dashboard/perfil")}
            style={{ ...boton(false), border: "none", color: T.textSoft, fontWeight: 600 }}>
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
