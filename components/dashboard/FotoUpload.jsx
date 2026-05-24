"use client";
// components/dashboard/FotoUpload.jsx
// Uso: <FotoUpload value={form.foto_url} onChange={(base64) => set("foto_url", base64)} />

import { useRef, useState } from "react";

const MAX_SIZE = 400;   // px máximo lado más largo
const QUALITY  = 0.82;  // calidad JPEG

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
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

export default function FotoUpload({ value, onChange, size=100, label="Foto de perfil" }) {
  const inputRef = useRef();
  const [drag,    setDrag]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const procesar = async (file) => {
    if (!file) return;
    const tipos = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
    if (!tipos.includes(file.type)) { setError("Solo PNG, JPG, WEBP o GIF"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Máximo 10 MB"); return; }
    setError(""); setLoading(true);
    try {
      const base64 = await comprimirImagen(file);
      onChange(base64);
    } catch { setError("Error al procesar la imagen"); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
      {/* Preview circular */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width:size, height:size, borderRadius:"50%",
            background:"#fce8ed", border:"3px dashed #f0b8c4",
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden", cursor:"pointer", transition:"border-color .15s",
            ...(drag ? { borderColor:"#a0435f", background:"#fce0e8" } : {}),
          }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); procesar(e.dataTransfer.files[0]); }}>
          {loading ? (
            <div style={{ width:24, height:24, border:"3px solid #f0b8c4", borderTopColor:"#a0435f", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
          ) : value ? (
            <img src={value} alt="Foto de perfil" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          ) : (
            <div style={{ textAlign:"center", padding:8 }}>
              <div style={{ fontSize:28, marginBottom:4 }}>📷</div>
              <p style={{ fontSize:9, color:"#c0909a", margin:0, lineHeight:1.3 }}>Subir foto</p>
            </div>
          )}
        </div>
        {/* Botón de editar sobre la foto */}
        {value && (
          <button
            onClick={() => inputRef.current?.click()}
            style={{ position:"absolute", bottom:0, right:0, width:28, height:28, borderRadius:"50%", background:"#a0435f", border:"2px solid #fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
            ✏️
          </button>
        )}
        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" style={{ display:"none" }}
          onChange={e => procesar(e.target.files[0])}/>
      </div>

      {/* Info y acciones */}
      <div style={{ flex:1, minWidth:180 }}>
        <p style={{ fontSize:13, fontWeight:600, color:"#2d1a22", margin:"0 0 4px" }}>{label}</p>
        <p style={{ fontSize:11, color:"#9a7080", margin:"0 0 10px", lineHeight:1.5 }}>
          PNG, JPG, WEBP o GIF · Máx. 10 MB<br/>
          Se comprime automáticamente a {MAX_SIZE}px
        </p>
        {error && (
          <p style={{ fontSize:11, color:"#dc2626", margin:"0 0 8px", background:"#fee2e2", padding:"6px 10px", borderRadius:8 }}>
            ⚠️ {error}
          </p>
        )}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button
            onClick={() => inputRef.current?.click()}
            style={{ fontSize:12, fontWeight:600, color:"#a0435f", background:"#fce8ed", border:"1.5px solid #f0b8c4", padding:"7px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
            {value ? "Cambiar foto" : "Seleccionar foto"}
          </button>
          {value && (
            <button
              onClick={() => onChange("")}
              style={{ fontSize:12, fontWeight:600, color:"#9a7080", background:"#fff", border:"1.5px solid #f0dde2", padding:"7px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>
              Quitar foto
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}