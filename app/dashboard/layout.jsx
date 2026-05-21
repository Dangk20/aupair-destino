"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Map, BookOpen, User, FileText,
  GraduationCap, Calendar, Users, FolderOpen,
  MessageCircle, Settings, LogOut, Lock, Menu, X,
} from "lucide-react";

const FRASES = [
  "Hoy es un gran día para acercarte a tu sueño. ¡Sigue así!",
  "Cada paso te acerca más a tu aventura. 💫",
  "El mundo es tuyo, solo tienes que ir por él. 🌍",
  "Preparada, segura y lista para despegar. 🛫",
];

export default function DashboardLayout({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user,         setUser]         = useState(null);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [mensajesCount,setMensajesCount]= useState(0);
  const [todasComp,    setTodasComp]    = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);

useEffect(() => {
  setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);
}, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(d=>setUser(d.user));
    fetch("/api/dashboard/sesiones").then(r=>r.json()).then(d=>{
      if(d?.completadas && d?.total) setTodasComp(d.completadas===d.total);
    });
    fetch("/api/dashboard/mensajes?limit=1&solo_conteo=true")
      .then(r=>r.json()).then(d=>setMensajesCount(d.no_leidos||0))
      .catch(()=>{});
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout",{method:"POST"});
    router.push("/");
  };

  const nav = [
    { label:"Dashboard",          href:"/dashboard",                   icon:LayoutDashboard, locked:false },
    { label:"Mi Destino Au Pair", href:"/dashboard/proceso",           icon:Map,             locked:false },
    { label:"Curso",              href:"/dashboard/curso",             icon:BookOpen,        locked:false },
    { label:"Perfil",             href:"/dashboard/perfil",            icon:User,            locked:!user?.perfil_habilitado },
    { label:"Documentos",         href:"/dashboard/documentos",        icon:FileText,        locked:!user?.tiene_acceso },
    { label:"Clases y formación", href:"/dashboard/clases",            icon:GraduationCap,   locked:!user?.tiene_acceso },
    { label:"Reuniones",          href:"/dashboard/reuniones",         icon:Calendar,        locked:!user?.tiene_acceso },
    { label:"Comunidad",          href:"/dashboard/comunidad",         icon:Users,           locked:!user?.tiene_acceso },
    { label:"Recursos",           href:"/dashboard/recursos",          icon:FolderOpen,      locked:false },
    { label:"Mensajes",           href:"/dashboard/mensajes",          icon:MessageCircle,   locked:false, badge:mensajesCount },
    { label:"Configuración",      href:"/dashboard/configuracion",     icon:Settings,        locked:false },
  ];

  const Sidebar = () => (
    <aside className="w-[200px] bg-white border-r border-[#f0e8ea] flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#f5eced]">
        <Link href="/" onClick={()=>setMobileOpen(false)}>
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={44} height={44} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {nav.map((item) => {
          const Icon   = item.icon;
          const active = item.href==="/dashboard"
            ? pathname==="/dashboard"
            : pathname===item.href || pathname.startsWith(item.href+"/");
          return (
            <Link key={item.href}
              href={item.locked?"#":item.href}
              onClick={()=>setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all group
                ${active
                  ? "bg-[#fce8ed] text-[#a0435f]"
                  : item.locked
                  ? "text-[#d0b0b8] cursor-not-allowed pointer-events-none"
                  : "text-[#6b4a54] hover:bg-[#fff0f3] hover:text-[#a0435f]"
                }`}
            >
              {item.locked
                ? <Lock size={13} className="shrink-0 text-[#d0b0b8]" />
                : <Icon size={14} className={`shrink-0 ${active?"text-[#a0435f]":"text-[#9a7080] group-hover:text-[#a0435f]"}`} />
              }
              <span className="truncate">{item.label}</span>
              {item.badge>0 && (
                <span className="ml-auto bg-[#a0435f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Quote */}
      <div className="p-4 border-t border-[#f5eced]">
        {/* Profile */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0 overflow-hidden">
            {user?.foto_url
              ? <img src={user.foto_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-[#a0435f] text-[13px] font-serif font-bold">{user?.nombre?.[0]||"?"}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#2d1a22] truncate leading-tight">{user?.nombre} {user?.apellido}</p>
            <p className="text-[10px] text-[#9a7080] truncate">{user?.pais||user?.email}</p>
          </div>
        </div>

        {/* Badge */}
        <div className="bg-[#fce8ed] rounded-lg px-2.5 py-1.5 mb-3">
          <p className="text-[10px] font-semibold text-[#a0435f] text-center tracking-wide">✨ Futura Au Pair</p>
        </div>

        {/* Quote */}
        <div className="relative">
          <span className="text-[#e8849a] text-[20px] font-serif leading-none absolute -top-1 -left-0.5">"</span>
          <p className="text-[10.5px] text-[#9a7080] leading-relaxed pl-3 italic">{frase}</p>
          <div className="mt-2 flex justify-end">
            <span className="text-[#e8849a] text-lg">💕</span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="flex items-center gap-1.5 text-[#c0909a] hover:text-[#a0435f] text-[11px] mt-2 transition w-full pt-2 border-t border-[#f5eced]">
          <LogOut size={11} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#faf5f6] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0 shadow-sm"><Sidebar /></div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={()=>setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden shadow-xl"><Sidebar /></div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-[#f0e8ea] px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={()=>setMobileOpen(!mobileOpen)} className="text-[#a0435f] p-1">
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={34} height={34} />
          <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center overflow-hidden">
            {user?.foto_url
              ? <img src={user.foto_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-[#a0435f] text-[12px] font-serif font-bold">{user?.nombre?.[0]||"?"}</span>
            }
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}