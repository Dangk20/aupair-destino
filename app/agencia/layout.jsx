"use client";
// app/agencia/layout.jsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  UsersIcon, UserIcon, FileTextIcon, BarChart3Icon,
  SettingsIcon, LogOutIcon, MenuIcon, XIcon, HelpCircleIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

const NAV = [
  { href:"/agencia",              label:"Candidatas",   icon:UsersIcon },
  { href:"/agencia/perfiles",     label:"Perfiles",     icon:UserIcon },
  { href:"/agencia/documentos",   label:"Documentos",   icon:FileTextIcon },
  { href:"/agencia/reportes",     label:"Reportes",     icon:BarChart3Icon },
  { href:"/agencia/configuracion",label:"Configuración",icon:SettingsIcon },
];

export default function AgenciaLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { isMobile } = useMobile();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.ok?r.json():null).then(d=>setUser(d?.user||null)).catch(()=>{});
  },[]);

  useEffect(()=>{ setOpen(false); },[pathname]);

  const logout = async()=>{
    await fetch("/api/auth/logout",{method:"POST"});
    router.push("/login");
  };

  const Sidebar = () => (
    <aside style={{
      width:200, flexShrink:0, background:"#1e1033",
      display:"flex", flexDirection:"column", minHeight:"100vh",
      position: isMobile ? "fixed" : "sticky",
      top:0, left:0, zIndex:40,
      transform: isMobile && !open ? "translateX(-100%)" : "translateX(0)",
      transition:"transform .25s",
    }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"#7c5cc4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>✈️</div>
          <div>
            <p style={{ fontSize:8,fontWeight:700,color:"#a78bfa",margin:0,textTransform:"uppercase",letterSpacing:1 }}>Portal Agencia</p>
            <p style={{ fontSize:12,fontWeight:700,color:"#fff",margin:0 }}>Destino Au Pair</p>
          </div>
        </div>
        <div style={{ background:"rgba(124,92,196,.3)",borderRadius:8,padding:"6px 10px",border:"1px solid rgba(124,92,196,.4)" }}>
          <p style={{ fontSize:10,color:"rgba(255,255,255,.5)",margin:0 }}>PORTAL AGENCIA</p>
          <p style={{ fontSize:12,fontWeight:600,color:"#a78bfa",margin:0 }}>Aliada</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2 }}>
        {NAV.map(item=>{
          const Icon = item.icon;
          const active = pathname===item.href || (item.href!=="/agencia" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,textDecoration:"none",fontSize:13,fontWeight:active?600:400,color:active?"#fff":"rgba(255,255,255,.55)",background:active?"#7c5cc4":"transparent",transition:"all .15s" }}>
              <Icon size={15} style={{ flexShrink:0 }}/>{item.label}
            </Link>
          );
        })}
      </nav>

      {/* Ayuda */}
      <div style={{ margin:"0 10px 10px",background:"rgba(124,92,196,.15)",borderRadius:12,padding:"12px",border:"1px solid rgba(124,92,196,.2)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:"rgba(124,92,196,.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <HelpCircleIcon size={14} style={{ color:"#a78bfa" }}/>
          </div>
          <p style={{ fontSize:12,fontWeight:600,color:"#fff",margin:0 }}>¿Necesitas ayuda?</p>
        </div>
        <p style={{ fontSize:10,color:"rgba(255,255,255,.5)",margin:"0 0 8px",lineHeight:1.4 }}>Estamos aquí para apoyarte.</p>
        <a href="mailto:hola@destino-aupair.com"
          style={{ display:"block",textAlign:"center",background:"#7c5cc4",color:"#fff",fontSize:11,fontWeight:600,padding:"7px",borderRadius:8,textDecoration:"none" }}>
          Contactar soporte
        </a>
      </div>

      {/* User */}
      <div style={{ padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
          <div style={{ width:32,height:32,borderRadius:"50%",background:"#7c5cc4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
            {user?.nombre?.[0]||"A"}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12,fontWeight:600,color:"#fff",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.nombre} {user?.apellido}</p>
            <p style={{ fontSize:10,color:"rgba(255,255,255,.4)",margin:0 }}>Agencia aliada</p>
          </div>
        </div>
        <button onClick={logout}
          style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
          <LogOutIcon size={13}/> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#f5f3ff",fontFamily:"system-ui,-apple-system,sans-serif" }}>
      {isMobile && open && <div onClick={()=>setOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:39 }}/>}
      <Sidebar/>
      <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column" }}>
        {isMobile && (
          <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30 }}>
            <button onClick={()=>setOpen(o=>!o)} style={{ background:"none",border:"none",cursor:"pointer",color:"#1e1033" }}>
              {open?<XIcon size={20}/>:<MenuIcon size={20}/>}
            </button>
            <p style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:"#1e1033",margin:0 }}>Portal Agencia</p>
            <div style={{ width:20 }}/>
          </div>
        )}
        <main style={{ flex:1 }}>{children}</main>
      </div>
    </div>
  );
}