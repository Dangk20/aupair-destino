"use client";
// Transferir el cupo de una candidata (R11, change `transferir-cupo`). Vivía en
// Usuarios; desde `usuarios-administracion` se abre desde Ventas, porque es una
// operación sobre una venta: la venta pasa a la cuenta que recibe el cupo.
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

export default function ModalTransferir({ u, onClose }) {
  const [pendiente, setPendiente] = useState(undefined);
  const [email, setEmail] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const url = `/api/admin/usuarias/${u.id}/transferir`;
  const cargar = () => fetch(url).then(r => r.json()).then(d => setPendiente(d.pendiente || null)).catch(() => setPendiente(null));
  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const fecha = (f) => new Date(f).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric", timeZone:"America/Bogota" });

  const enviar = async (correo) => {
    setOcupado(true); setError(""); setCopiado(false);
    const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email: correo }) });
    const d = await r.json().catch(() => ({}));
    setOcupado(false);
    if (!r.ok) { setError(d.error || "No se pudo enviar la invitación."); return; }
    setLink(d.link); setEmail(""); cargar();
  };
  const cancelarla = async () => {
    setOcupado(true); setError("");
    const r = await fetch(url, { method:"DELETE" });
    const d = await r.json().catch(() => ({}));
    setOcupado(false);
    if (!r.ok) { setError(d.error || "No se pudo cancelar."); return; }
    setLink(null); cargar();
  };
  const copiar = async () => { try { await navigator.clipboard.writeText(link); setCopiado(true); } catch { /* el link sigue visible */ } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2A38]/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#A0435F] via-[#C77D93] to-[#A0435F]"/>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E1E7]">
          <div>
            <h3 className="font-bold text-[16px] text-[#4A2A38]">Transferir cupo</h3>
            <p className="text-[11px] text-[#9C8790]">De {u.nombre} {u.apellido}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FCE8EE] flex items-center justify-center"><XIcon size={14} className="text-[#A0435F]"/></button>
        </div>
        <div className="px-5 py-4 space-y-3 text-[12.5px] text-[#4A2A38] leading-relaxed">
          <p className="text-[#9C8790]">
            A ese correo le llega un link para crear su cuenta con este cupo; vence a los 30 días. Cuando se registre, {u.nombre} pierde el acceso (puede seguir entrando) y la venta pasa a la cuenta nueva, sin cobro. La cuenta nueva empieza de cero.
          </p>
          {pendiente === undefined && <p className="text-[#9C8790]">Cargando…</p>}
          {pendiente && (
            <div className="bg-[#FFF4EC] border border-[#F5D6BC] rounded-xl px-3 py-2.5">
              Invitación pendiente a <strong>{pendiente.email}</strong>, vence el {fecha(pendiente.vence_at)}.
              <div className="flex gap-2 mt-2">
                <button disabled={ocupado} onClick={()=>enviar(pendiente.email)} className="flex-1 bg-white border border-[#F5E1E7] rounded-lg py-1.5 font-semibold text-[#A0435F]">Reenviar</button>
                <button disabled={ocupado} onClick={cancelarla} className="flex-1 bg-white border border-[#F5E1E7] rounded-lg py-1.5 font-semibold text-[#C0392B]">Cancelar transferencia</button>
              </div>
            </div>
          )}
          {pendiente === null && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1">Correo de la persona que recibe el cupo</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                className="w-full border border-[#F5E1E7] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#C77D93] bg-[#FBF4F6]"/>
            </div>
          )}
          {link && (
            <div className="bg-[#E6F9F0] border border-[#BDEBD5] rounded-xl px-3 py-2.5">
              Enviamos la invitación. Si no le llega, compártele este link:
              <div className="flex gap-2 mt-2 items-center">
                <code className="flex-1 text-[10.5px] break-all text-[#4A2A38]">{link}</code>
                <button onClick={copiar} className="shrink-0 bg-white border border-[#BDEBD5] rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#12A46B]">{copiado ? "Copiado" : "Copiar"}</button>
              </div>
            </div>
          )}
          {error && <p className="text-[#C0392B]">{error}</p>}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-[#F5E1E7] text-[#9C8790] font-semibold text-[13px] py-3 rounded-xl">Cerrar</button>
          {pendiente === null && (
            <button disabled={ocupado || !email.trim()} onClick={()=>enviar(email)} className="flex-1 bg-[#A0435F] text-white font-semibold text-[13px] py-3 rounded-xl disabled:opacity-50">
              {ocupado ? "Enviando…" : "Enviar invitación"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
