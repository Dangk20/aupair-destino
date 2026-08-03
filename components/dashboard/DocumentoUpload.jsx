"use client";
// components/dashboard/DocumentoUpload.jsx
// Uso: <DocumentoUpload value={form.cedula_frontal_url} onChange={(base64) => set("cedula_frontal_url", base64)} label="Cédula - Lado frontal" />

import { useRef, useState } from "react";
import { IdCard, Pencil } from "lucide-react";

const MAX_SIZE = 1000;  // px máximo lado más largo — más alto que FotoUpload para que el texto del documento sea legible
const QUALITY  = 0.85;

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > MAX_SIZE || h > MAX_SIZE) {
          if (w > h) { h = Math.round((h * MAX_SIZE) / w); w = MAX_SIZE; }
          else        { w = Math.round((w * MAX_SIZE) / h); h = MAX_SIZE; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentoUpload({ value, onChange, label="Documento", hint="JPG o PNG · Máx. 10 MB" }) {
  const inputRef = useRef();
  const [drag,    setDrag]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const procesar = async (file) => {
    if (!file) return;
    const tipos = ["image/jpeg","image/jpg","image/png","image/webp"];
    if (!tipos.includes(file.type)) { setError("Solo JPG, PNG o WEBP"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Máximo 10 MB"); return; }
    setError(""); setLoading(true);
    try {
      const base64 = await comprimirImagen(file);
      onChange(base64);
    } catch { setError("Error al procesar la imagen"); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#1e1033", textTransform:"uppercase", letterSpacing:".7px", margin:0 }}>{label}</p>

      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width:"100%", aspectRatio:"16/10", borderRadius:14,
          background:"#fce8ed", border:"2.5px dashed #f0b8c4",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden", cursor:"pointer", transition:"border-color .15s", position:"relative",
          ...(drag ? { borderColor:"#a0435f", background:"#fce0e8" } : {}),
        }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); procesar(e.dataTransfer.files[0]); }}>
        {loading ? (
          <div style={{ width:28, height:28, border:"3px solid #f0b8c4", borderTopColor:"#a0435f", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
        ) : value ? (
          <img src={value} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        ) : (
          <div style={{ textAlign:"center", padding:12 }}>
            <IdCard size={28} style={{ color:"#c0909a", marginBottom:6 }} strokeWidth={1.5}/>
            <p style={{ fontSize:11, color:"#c0909a", margin:0, fontWeight:600 }}>Clic o arrastra la imagen</p>
          </div>
        )}

        {value && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            style={{ position:"absolute", bottom:8, right:8, width:30, height:30, borderRadius:"50%", background:"#a0435f", border:"2px solid #fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Pencil size={13} style={{ color:"#fff" }}/>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display:"none" }}
        onChange={e => procesar(e.target.files[0])}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <p style={{ fontSize:10, color:"#9a7080", margin:0 }}>{hint}</p>
        {value && (
          <button
            onClick={() => onChange("")}
            style={{ fontSize:11, fontWeight:600, color:"#9a7080", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textDecoration:"underline" }}>
            Quitar
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontSize:11, color:"#dc2626", margin:0, background:"#fee2e2", padding:"6px 10px", borderRadius:8 }}>
          {error}
        </p>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}