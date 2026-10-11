"use client";
// ════════════════════════════════════════════════════════════════════════
// components/perfil/CampoEditable.jsx — El control de un campo del perfil,
// generado desde su declaración en lib/campos-perfil.js
//
// Nació en la edición del admin (app/admin/perfiles/[id]/editar). Salió de ahí
// porque la candidata corrige lo que el equipo le observa con los mismos
// controles: una lista cerrada es un select, un párrafo es un textarea, una
// fecha es una fecha. Escribirlos otra vez sería la quinta lista de valores.
// ════════════════════════════════════════════════════════════════════════
import { T } from "@/lib/tema";

export const IC = {
  width:"100%", border:`1.5px solid ${T.border}`, borderRadius:12,
  padding:"10px 14px", fontSize:13, color:T.text, background:"#fff",
  outline:"none", fontFamily:T.font, boxSizing:"border-box",
};
export const LC = {
  fontSize:10, fontWeight:700, color:T.textSoft, textTransform:"uppercase",
  letterSpacing:".7px", display:"block", marginBottom:6,
};

/**
 * Opciones a ofrecer, con el valor guardado incluido si no está en la lista.
 *
 * La base trae valores que ninguna lista declara: "Si" donde las opciones dicen
 * "Sí", "Catolica" sin tilde, "No" donde se ofrece "No, aún no". Son de
 * versiones anteriores del formulario. Sin esto el `select` los pinta en blanco
 * y la clienta lee "sin diligenciar" un campo que sí tiene dato.
 *
 * Se añade al final y marcado, para que se vea que es un valor heredado y quien
 * revise pueda normalizarlo eligiendo el de la lista.
 */
function opcionesCon(campo, valor) {
  const v = String(valor ?? "").trim();
  if (!v || campo.opciones.includes(v)) return campo.opciones;
  return [...campo.opciones, v];
}

/** Un campo, según lo que declare `campos-perfil.js`. */
/**
 * @param {boolean} marcarHeredado  si el valor guardado no está en la lista, se
 *        marca "(valor guardado)" para que quien revise lo normalice. Es una
 *        pista del equipo: a la candidata no se le muestra.
 */
export default function CampoEditable({ campo, valor, obligatorio, onChange, marcarHeredado = true }) {
  const comun = {
    name: campo.name,
    value: valor ?? "",
    onChange: e => onChange(campo.name, e.target.value),
    style: IC,
  };

  let control;
  if (campo.opciones) {
    const opciones = opcionesCon(campo, valor);
    control = (
      <select {...comun}>
        <option value="">Seleccionar</option>
        {opciones.map(o => (
          <option key={o} value={o}>
            {campo.opciones.includes(o) || !marcarHeredado ? o : `${o} (valor guardado)`}
          </option>
        ))}
      </select>
    );
  }
  else if (campo.tipo === "parrafo") control = <textarea {...comun} rows={3} style={{ ...IC, resize:"vertical" }} />;
  else if (campo.tipo === "fecha")   control = <input {...comun} type="date" value={String(valor ?? "").slice(0, 10)} />;
  else if (campo.tipo === "numero")  control = <input {...comun} type="number" min="0" />;
  else                               control = <input {...comun} type="text" />;

  // `foto_url` guarda un data-URI de la foto que subió la candidata. Mostrarlo
  // como texto volcaría cuarenta mil caracteres en el campo.
  const esDataUri = campo.name === "foto_url" && String(valor ?? "").startsWith("data:");

  return (
    <div>
      <label style={LC}>{campo.label}{obligatorio ? " *" : ""}</label>
      {esDataUri ? (
        <>
          <input readOnly value="[Imagen subida ✓]" style={{ ...IC, color:T.textSoft }} />
          <img src={valor} alt="" onError={e => { e.target.style.display = "none"; }}
            style={{ width:80, height:80, borderRadius:12, objectFit:"cover", marginTop:8, border:`2px solid ${T.border}` }} />
        </>
      ) : control}
    </div>
  );
}

