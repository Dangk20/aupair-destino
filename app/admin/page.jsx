"use client";
// app/admin/page.jsx — Punto de entrada del panel (Sprint 1).
//
// Esta pantalla mostraba un resumen construido sobre el sistema VIEJO de
// referidos: tabla de referentes, gráficas decorativas sin datos detrás,
// métricas que se contradecían entre sí (`Total referidos registrados: 0`
// junto a `Referidos que pagaron: 5`), tres controles que no respondían
// —rango de fechas, comparar con el mes anterior, exportar reporte— y el
// saludo escrito en el código.
//
// Se vacía en lugar de rehacerse: el resumen real se alimentará de `ventas` y
// `comisiones`, y el sistema de referidos se retira en el Sprint 3.
// Construirlo antes sería levantar la pantalla de inicio sobre lo que la
// auditoría marcó como muerto, y rehacerla dos veces.
//
// Ver openspec/changes/sprint-1-operacion-segura (decisión 9 del design).

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCardIcon, HandCoinsIcon, TagIcon, UsersIcon, VideoIcon,
  SparklesIcon, ArrowRightIcon,
} from "lucide-react";

const MODULOS = [
  { href:"/admin/ventas",        icon:CreditCardIcon, label:"Ventas",        desc:"Confirma los pagos de las candidatas" },
  { href:"/admin/comisiones",    icon:HandCoinsIcon,  label:"Comisiones",    desc:"Lo que le debes a cada asociada" },
  { href:"/admin/codigos-promo", icon:TagIcon,        label:"Códigos promo", desc:"Precios, usos y porcentaje de comisión" },
  { href:"/admin/usuarias",      icon:UsersIcon,      label:"Usuarios",      desc:"Altas, accesos y cambios de rol" },
  { href:"/admin/perfiles",      icon:UsersIcon,      label:"Perfiles",      desc:"Revisa y aprueba a las candidatas" },
  { href:"/admin/sesiones",      icon:VideoIcon,      label:"Sesiones",      desc:"Contenido del curso y recursos" },
];

export default function AdminInicioPage() {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setNombre(d?.user?.nombre || ""))
      .catch(() => {});
  }, []);

  return (
    <div className="p-5 xl:p-8 bg-[#fff8f9] min-h-full max-w-5xl">
      <h1 className="font-serif font-bold text-[#2d1a22] text-[26px] xl:text-[28px] leading-tight">
        {nombre ? `¡Hola, ${nombre}!` : "¡Hola!"} 👋
      </h1>
      <p className="text-[13px] text-[#9a6672] mt-0.5 mb-6">
        Este es tu panel de <span className="text-[#a0435f] font-semibold">Destino Au Pair</span>.
      </p>

      {/* Aviso de rediseño */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl p-6 mb-7">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#fce8ed] flex items-center justify-center shrink-0">
            <SparklesIcon size={20} className="text-[#a0435f]" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold tracking-[.12em] text-[#a0435f] mb-1.5">EN REDISEÑO</p>
            <h2 className="text-[16px] font-bold text-[#2d1a22] mb-1.5">Tu resumen general llega pronto</h2>
            <p className="text-[13px] text-[#9a6672] leading-relaxed max-w-2xl">
              Lo estamos rehaciendo para que muestre tus cifras de verdad —ingresos, ventas del mes y
              comisiones por pagar— en lugar de los datos de muestra que había antes.
              Mientras tanto, cada cifra real vive en su módulo.
            </p>
          </div>
        </div>
      </div>

      {/* Accesos a lo que sí opera */}
      <p className="text-[12px] font-semibold text-[#9a6672] mb-3">Entra directo a:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULOS.map(({ href, icon:Icon, label, desc }) => (
          <Link key={href} href={href}
            className="group bg-white border border-[#f0dde2] rounded-2xl p-4 hover:border-[#e8849a] hover:shadow-sm transition flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fce8ed] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#a0435f]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#2d1a22] flex items-center gap-1.5">
                {label}
                <ArrowRightIcon size={13} className="text-[#e8849a] opacity-0 group-hover:opacity-100 transition" />
              </p>
              <p className="text-[11.5px] text-[#9a6672] leading-snug mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
