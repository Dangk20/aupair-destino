"use client";
// app/asociada/layout.jsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboardIcon, UsersIcon, DollarSignIcon,
  CalendarIcon, SettingsIcon, LogOutIcon, MenuIcon, XIcon, BellIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const NAV = [
  { href:"/asociada",             label:"Resumen",         icon:LayoutDashboardIcon },
  { href:"/asociada/usuarias",   label:"Mis referidas",   icon:UsersIcon },
  { href:"/asociada/comisiones",  label:"Comisiones",      icon:DollarSignIcon },
  { href:"/asociada/reuniones",  label:"Calendario",      icon:CalendarIcon },
  { href:"/asociada/configuracion", label:"Configuración", icon:SettingsIcon },
];

export default function AsociadaLayout({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { isMobile } = useMobile();
  const [open,     setOpen]     = useState(false);
  const [user,     setUser]     = useState(null);

  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.ok?r.json():null).then(d=>setUser(d?.user||null)).catch(()=>{});
  },[]);

  useEffect(()=>{ setOpen(false); },[pathname]);

  const logout = async()=>{
    await fetch("/api/auth/logout",{method:"POST"});
    router.push("/login");
  };

  const Sidebar = () => (
    <aside style={{ width:220,flexShrink:0,background:"#1e1033",display:"flex",flexDirection:"column",minHeight:"100vh",position:isMobile?"fixed":"sticky",top:0,left:0,zIndex:40,transform:isMobile&&!open?"translateX(-100%)":"translateX(0)",transition:"transform .25s" }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <Link href="/asociada" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
          <img src="/assets/destino-aupair-logo.svg" alt="Logo" style={{ width:36,height:36,borderRadius:8 }} onError={e=>e.target.style.display="none"}/>
          <div>
            <p style={{ fontSize:13,fontWeight:700,color:"#fff",margin:0,lineHeight:1.2 }}>Destino Au Pair</p>
            <p style={{ fontSize:10,color:"rgba(255,255,255,.5)",margin:0 }}>Asociada / Referidora</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2 }}>
        {NAV.map(item=>{
          const Icon=item.icon;
          const active = pathname===item.href || (item.href!=="/asociada" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,textDecoration:"none",fontSize:13,fontWeight:active?600:400,color:active?"#fff":"rgba(255,255,255,.6)",background:active?"rgba(160,67,95,.4)":"transparent",transition:"all .15s" }}>
              <Icon size={16} style={{ flexShrink:0 }}/>{item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:"#a0435f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
            {user?.nombre?.[0]||"A"}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12,fontWeight:600,color:"#fff",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.nombre} {user?.apellido}</p>
            <p style={{ fontSize:10,color:"rgba(255,255,255,.5)",margin:0 }}>Asociada</p>
          </div>
        </div>
        <button onClick={logout} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
          <LogOutIcon size={13}/> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      {/* Overlay mobile */}
      {isMobile && open && <div onClick={()=>setOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:39 }}/>}

      <Sidebar/>

      {/* Main */}
      <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column" }}>
        {/* Topbar mobile */}
        {isMobile && (
          <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30 }}>
            <button onClick={()=>setOpen(o=>!o)} style={{ background:"none",border:"none",cursor:"pointer",padding:4,color:"#1e1033" }}>
              {open?<XIcon size={20}/>:<MenuIcon size={20}/>}
            </button>
            <p style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1e1033",margin:0 }}>Destino Au Pair</p>
            <button style={{ background:"none",border:"none",cursor:"pointer",padding:4,color:"#1e1033",position:"relative" }}>
              <BellIcon size={18}/>
              <span style={{ position:"absolute",top:4,right:4,width:6,height:6,background:"#a0435f",borderRadius:"50%" }}/>
            </button>
          </div>
        )}

        <main style={{ flex:1 }}>{children}</main>
      </div>
    </div>
  );
}