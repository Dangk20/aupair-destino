"use client";
// app/dashboard/layout.jsx — Rediseño Panel Candidata (sistema "pasaporte/viaje")

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Map, BookOpen, FileText, MessageCircle,
  User, Calendar, Users, FolderOpen, Settings, LogOut, Lock,
} from "lucide-react";
import { MobileProvider } from "@/context/MobileContext";
import { T, POPPINS_HREF } from "@/lib/tema-candidata";

function DashboardLayoutInner({ children }) {
  const pathname = usePathname();

  const [user,          setUser]          = useState(null);
  const [mensajesCount, setMensajesCount] = useState(0);
  const [accesos,       setAccesos]       = useState({
    perfil:false, documentos:false, recursos:false,
    reuniones:false, mensajes:false, comunidad:false,
  });

  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(d=>setUser(d.user)).catch(()=>{});
    fetch("/api/dashboard/mensajes?limit=1&solo_conteo=true")
      .then(r=>r.json()).then(d=>setMensajesCount(d.no_leidos||0)).catch(()=>{});
    fetch("/api/dashboard/acceso").then(r=>r.json())
      .then(d => setAccesos({
        perfil:!!d.perfil, documentos:!!d.documentos, recursos:!!d.recursos,
        reuniones:!!d.reuniones, mensajes:!!d.mensajes, comunidad:!!d.comunidad,
      })).catch(()=>{});
  }, []);

  // Sale a la pantalla de ingreso, como los otros tres paneles — antes
  // devolvía a la landing. Navegación de documento para descartar la
  // caché de segmentos de la sesión que se acaba de cerrar.
  const logout = async () => { await fetch("/api/auth/logout",{method:"POST"}); window.location.assign("/login"); };

  // Navegación primaria (la del diseño) + secundaria (rutas que se conservan)
  const navPrim = [
    { label:"Inicio",     href:"/dashboard",            icon:Home,          locked:false },
    { label:"Mi Destino", href:"/dashboard/proceso",    icon:Map,           locked:false },
    { label:"Curso",      href:"/dashboard/curso",      icon:BookOpen,      locked:false },
    { label:"Documentos", href:"/dashboard/documentos", icon:FileText,      locked:!accesos.documentos },
    { label:"Mensajes",   href:"/dashboard/mensajes",   icon:MessageCircle, locked:!accesos.mensajes, badge:mensajesCount },
  ];
  const navSec = [
    { label:"Mi Perfil",     href:"/dashboard/perfil",        icon:User,       locked:!accesos.perfil },
    { label:"Calendario",    href:"/dashboard/reuniones",     icon:Calendar,   locked:!accesos.reuniones },
    { label:"Comunidad",     href:"/dashboard/comunidad",     icon:Users,      locked:!accesos.comunidad },
    { label:"Recursos",      href:"/dashboard/recursos",      icon:FolderOpen, locked:!accesos.recursos },
    { label:"Configuración", href:"/dashboard/configuracion", icon:Settings,   locked:false },
  ];

  const isActive = (href) => href==="/dashboard"
    ? pathname==="/dashboard"
    : pathname===href || pathname.startsWith(href+"/");

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link href={item.href}
        style={{
          display:"flex", alignItems:"center", gap:13, padding:"12px 13px",
          borderRadius:14, fontFamily:T.font, fontSize:14, fontWeight:active?700:500,
          textDecoration:"none", cursor:"pointer",
          background: active ? T.gradIcon : "transparent",
          color: active ? "#fff" : (item.locked ? T.softText : T.textSoft),
          boxShadow: active ? "0 8px 20px rgba(160,67,95,.28)" : "none",
        }}>
        {item.locked ? <Lock size={18}/> : <Icon size={20}/>}
        <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>
        {!item.locked && item.badge>0 && (
          <span style={{ background:T.primary3, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99 }}>{item.badge}</span>
        )}
      </Link>
    );
  };

  const Sidebar = () => (
    <aside style={{ width:240, flexShrink:0, background:"#fff", padding:"26px 16px", display:"flex", flexDirection:"column", gap:4, height:"100%", overflowY:"auto" }}>
      <Link href="/dashboard" style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"0 8px 20px", textDecoration:"none" }}>
        <img src="/assets/destino-aupair-logo2.svg" alt="Destino Au Pair" style={{ height:96, width:"auto", maxWidth:"100%", objectFit:"contain" }}/>
      </Link>
      {navPrim.map(it => <NavItem key={it.href} item={it}/>)}
      <div style={{ height:1, background:T.border, margin:"12px 8px" }}/>
      {navSec.map(it => <NavItem key={it.href} item={it}/>)}

      <div style={{ marginTop:"auto", paddingTop:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, background:T.lilac, borderRadius:14, padding:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, overflow:"hidden", flexShrink:0, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {user?.foto_url
              ? <img src={user.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <span style={{ color:T.primary, fontWeight:700 }}>{user?.nombre?.[0]||"?"}</span>}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:13, color:T.text, fontFamily:T.font, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.nombre} {user?.apellido}</div>
            <div style={{ fontSize:11, color:T.textSoft, fontFamily:T.font }}>✨ Futura Au Pair</div>
          </div>
        </div>
        <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:7, marginTop:12, padding:"4px 8px", background:"none", border:"none", color:T.textSoft, fontFamily:T.font, fontSize:12, cursor:"pointer" }}>
          <LogOut size={13}/> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  const BottomNav = () => (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:30, background:"rgba(255,255,255,.94)", backdropFilter:"blur(10px)", borderTop:`1px solid ${T.border}`, padding:"9px 6px 11px", display:"flex", justifyContent:"space-around" }}>
      {navPrim.map(it => {
        const Icon = it.locked ? Lock : it.icon;
        const active = isActive(it.href);
        return (
          <Link key={it.href} href={it.href} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, textDecoration:"none", color: active?T.primary:T.softText, fontFamily:T.font, padding:"4px 8px" }}>
            <Icon size={21}/>
            <span style={{ fontSize:10, fontWeight:600 }}>{it.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <MobileProvider>
      {/* Poppins */}
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link rel="stylesheet" href={POPPINS_HREF}/>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg, fontFamily:T.font }}>
        {/* Sidebar desktop */}
        <div className="hidden md:flex" style={{ flexShrink:0 }}><Sidebar/></div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
          {/* Mobile header — solo en móvil. Sin `display` inline para que
              `md:hidden` (display:none en desktop) no quede pisado. */}
          <header className="md:hidden flex items-center justify-between" style={{ background:"#fff", borderBottom:`1px solid ${T.border}`, padding:"10px 16px", flexShrink:0 }}>
            <Link href="/dashboard" style={{ display:"flex", alignItems:"center", textDecoration:"none" }}>
              <img src="/assets/destino-aupair-logo2.svg" alt="Destino Au Pair" style={{ height:48, width:"auto", objectFit:"contain" }}/>
            </Link>
            <div style={{ width:34, height:34, borderRadius:11, overflow:"hidden", background:T.lilac, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {user?.foto_url ? <img src={user.foto_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ color:T.primary, fontWeight:700, fontSize:13 }}>{user?.nombre?.[0]||"?"}</span>}
            </div>
          </header>

          <main className="dap-main" data-main="true" style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
            <div className="inner-page">{children}</div>
          </main>

          {/* Bottom nav mobile */}
          <div className="md:hidden"><BottomNav/></div>
        </div>
      </div>
    </MobileProvider>
  );
}

export default function DashboardLayout({ children }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>;
}
