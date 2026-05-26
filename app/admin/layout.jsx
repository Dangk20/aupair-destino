"use client";
// app/admin/layout.jsx

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon, UsersIcon, VideoIcon, LogOutIcon,
  MenuIcon, XIcon, UserPlusIcon, BarChart2Icon,
  SettingsIcon, BellIcon, CreditCardIcon, CalendarIcon,
} from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";

const navItems = [
  { label:"Resumen",                href:"/admin",                icon:LayoutDashboardIcon },
  { label:"Referidos y comisiones", href:"/admin/referidos",      icon:UserPlusIcon        },
  { label:"Pagos y comisiones",     href:"/admin/pagos",          icon:CreditCardIcon      },
  { label:"Usuarios",               href:"/admin/usuarias",       icon:UsersIcon           },
  { label:"Perfiles",               href:"/admin/perfiles",       icon:UsersIcon           },
  { label:"Sesiones",               href:"/admin/sesiones",       icon:VideoIcon           },
  { label:"Calendario",             href:"/admin/reuniones",     icon:CalendarIcon        },
  { label:"Reportes",               href:"/admin/reportes",       icon:BarChart2Icon       },
  { label:"Configuración",          href:"/admin/configuracion",  icon:SettingsIcon        },
  { label:"Notificaciones",         href:"/admin/notificaciones", icon:BellIcon            },
];

function AdminLayoutInner({ children }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/login");
  };

  function SidebarContent() {
    return (
      <div style={{ width:200, minWidth:200 }}
           className="h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=60"
               alt="" className="w-full h-full object-cover object-center"/>
          <div className="absolute inset-0 bg-[#2d0a3a]/88"/>
        </div>
        <div className="relative z-10 px-5 pt-6 pb-4 border-b border-white/10">
          <Link href="/admin" onClick={()=>setMobileOpen(false)}>
            <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair"
                   width={52} height={52} className="brightness-0 invert mb-2"/>
          </Link>
          <p className="text-[9px] font-bold tracking-[3px] uppercase text-[#e8849a]">Panel Admin</p>
        </div>
        <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = item.href==="/admin"
              ? pathname==="/admin"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                onClick={()=>setMobileOpen(false)}
                className={`flex items-center gap-2.5 text-[12px] px-3 py-2.5 rounded-xl transition-all
                  ${active
                    ? "bg-[#a0435f] text-white font-semibold shadow-md shadow-[#a0435f]/30"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                  }`}>
                <Icon size={15} strokeWidth={active?2:1.6}/>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="relative z-10 flex justify-center pb-4">
          <div className="w-20 h-28 relative shadow-xl opacity-60"
               style={{ transform:"rotate(-4deg)", filter:"drop-shadow(2px 4px 10px rgba(0,0,0,0.5))" }}>
            <div className="absolute left-0 top-0 w-3 h-full bg-[#6b0a2a] rounded-l-lg"/>
            <div className="absolute left-3 top-0 right-0 h-full bg-[#a0435f] rounded-r-xl flex flex-col items-center justify-between py-2 px-2">
              <div className="w-full h-px bg-white/20"/>
              <div className="flex flex-col items-center gap-1">
                <img src="/assets/destino-aupair-logo.svg" alt="" className="w-8 h-8 brightness-0 invert opacity-90"/>
                <p className="text-white text-[5px] tracking-[2px] uppercase font-bold opacity-80">Au Pair</p>
              </div>
              <div className="w-full h-px bg-white/20"/>
            </div>
          </div>
        </div>
        <div className="relative z-10 px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#a0435f] flex items-center justify-center shrink-0">
              <span className="text-white text-[12px] font-bold">J</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-[11px] font-semibold truncate leading-snug">Jenni Salgado</p>
              <p className="text-white/40 text-[9px] truncate">Admin CEO</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/35 hover:text-white/70 text-[11px] transition">
            <LogOutIcon size={12}/> Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#fff8f9" }}>
      {/* Sidebar desktop */}
      <div className="hidden md:block shrink-0"><SidebarContent/></div>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setMobileOpen(false)}/>
          <div className="fixed inset-y-0 left-0 z-50 md:hidden flex"><SidebarContent/></div>
        </>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <header className="md:hidden bg-[#fff8f9] border-b border-[#f0dde2] px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={()=>setMobileOpen(!mobileOpen)} className="text-[#a0435f]">
            {mobileOpen ? <XIcon size={20}/> : <MenuIcon size={20}/>}
          </button>
          <Image src="/assets/destino-aupair-logo.svg" alt="" width={36} height={36}/>
          <div/>
        </header>
        {/* ← data-main="true" para CSS responsive */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }} data-main="true">
          <div className="inner-page">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <MobileProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </MobileProvider>
  );
}