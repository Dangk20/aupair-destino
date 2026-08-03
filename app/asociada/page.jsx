"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, CalendarIcon, ArrowRight, ChevronRight,
  UsersIcon, TrendingUpIcon, CheckCircleIcon,
} from "lucide-react";
import { useMobile } from "@/context/MobileContext";

function StatCard({ icon: Icon, title, value, color, emoji }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm" style={{ padding:"16px 20px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, fontWeight:600, color:"#9C8790", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:".5px" }}>{title}</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#4A2A38", margin:0 }}>{value}</p>
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
          {emoji || <Icon size={20} className="text-white"/>}
        </div>
      </div>
    </div>
  );
}

export default function AsociadaDashboard() {
  const router = useRouter();
  const { isMobile } = useMobile();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p, fb=null) =>
      p.then(r=>{ if(r.status===401){router.push("/login");return fb;} return r.json().catch(()=>fb); }).catch(()=>fb);
    Promise.all([
      safe(fetch("/api/auth/me"), {user:null}),
      safe(fetch("/api/asociada/stats"), null),
    ]).then(([me, stats_data]) => {
      setUser(me?.user||null);
      setStats(stats_data);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FBF4F6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C77D93] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-[13px] text-[#9C8790]">Cargando tu panel...</p>
      </div>
    </div>
  );

  const { totalUsuarias=0, completadas=0, enProgreso=0, reunionesSemanales=0, proximasReuniones=[], usuariasRecientes=[], tareasPendientes=[] } = stats||{};

  return (
    <div className="min-h-screen bg-[#FBF4F6]" style={{ fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#ece8f0] sticky top-0 z-20"
           style={{ padding:isMobile?"12px 16px":"14px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:isMobile?18:22, fontWeight:700, color:"#4A2A38", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              ¡Hola, {user?.nombre}! 👋
            </h1>
            {!isMobile && <p style={{ fontSize:13, color:"#9C8790", margin:"2px 0 0" }}>Panel de control de asesora 💜</p>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <button style={{ position:"relative", padding:8, borderRadius:12, border:"1px solid #F5E1E7", background:"#fff", cursor:"pointer", flexShrink:0 }}>
              <Bell size={17} style={{ color:"#9C8790" }}/>
              <span style={{ position:"absolute", top:6, right:6, width:7, height:7, background:"#A0435F", borderRadius:"50%", border:"1.5px solid #fff" }}/>
            </button>
            {!isMobile && (
              <>
                <Link href="/asociada/reuniones" style={{ display:"flex", alignItems:"center", gap:6, border:"1.5px solid #e0d0e8", color:"#6b4a70", fontSize:13, fontWeight:500, padding:"8px 14px", borderRadius:12, textDecoration:"none", background:"#fff" }}>
                  <CalendarIcon size={14}/> Ver reuniones
                </Link>
                <Link href="/asociada/usuarias" style={{ display:"flex", alignItems:"center", gap:6, background:"#A0435F", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:12, textDecoration:"none" }}>
                  Mis usuarias <ArrowRight size={13}/>
                </Link>
              </>
            )}
            {isMobile && (
              <Link href="/asociada/usuarias" style={{ display:"flex", alignItems:"center", gap:4, background:"#A0435F", color:"#fff", fontSize:11, fontWeight:600, padding:"7px 12px", borderRadius:10, textDecoration:"none" }}>
                Usuarias <ArrowRight size={11}/>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:isMobile?"14px 16px 40px":"20px 24px 40px", maxWidth:1400, margin:"0 auto" }}>
        <div style={{ display:"flex", gap:20, flexDirection:isMobile?"column":"row" }}>

          {/* ── MAIN COLUMN ── */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>

            {/* ESTADÍSTICAS */}
            <div>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:"#4A2A38", margin:"0 0 10px" }}>Resumen de tu semana</h2>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:12 }}>
                <StatCard title="Mis Usuarias" value={totalUsuarias} emoji="👥"/>
                <StatCard title="Completadas" value={completadas} emoji="✓"/>
                <StatCard title="En Progreso" value={enProgreso} emoji="📈"/>
                <StatCard title="Reuniones esta semana" value={reunionesSemanales} emoji="📅"/>
              </div>
            </div>

            {/* PRÓXIMAS REUNIONES + USUARIAS RECIENTES — lado a lado */}
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:16 }}>

              {/* Próximas Reuniones */}
              <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm overflow-hidden">
                <div style={{ padding:"12px 16px 10px", borderBottom:"1px solid #FCE8EE", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#4A2A38", margin:0 }}>Próximas reuniones</h3>
                  <Link href="/asociada/reuniones" style={{ fontSize:11, fontWeight:600, color:"#A0435F", textDecoration:"none" }}>Ver todas</Link>
                </div>
                <div>
                  {proximasReuniones && proximasReuniones.length > 0 ? (
                    proximasReuniones.slice(0, 5).map((r, i) => (
                      <Link key={i} href={`/asociada/reuniones`}
                        style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", borderBottom:i<Math.min(5, proximasReuniones.length)-1?"1px solid #FBF4F6":"none", textDecoration:"none" }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"#FCE8EE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>📞</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:600, color:"#4A2A38", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.usuario_nombre || "Usuario"}</p>
                          <p style={{ fontSize:11, color:"#9C8790", margin:"2px 0 0" }}>{r.fecha} a las {r.hora}</p>
                        </div>
                        {!r.confirmada && <div style={{ fontSize:9, fontWeight:700, color:"#E8853B", background:"#FFF4EC", padding:"2px 8px", borderRadius:6, whiteSpace:"nowrap", flexShrink:0 }}>Pendiente</div>}
                      </Link>
                    ))
                  ) : (
                    <p style={{ fontSize:12, color:"#9C8790", padding:16, textAlign:"center", margin:0 }}>Sin reuniones próximas</p>
                  )}
                </div>
              </div>

              {/* Mis Usuarias Recientes */}
              <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm overflow-hidden">
                <div style={{ padding:"12px 16px 10px", borderBottom:"1px solid #FCE8EE", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#4A2A38", margin:0 }}>Mis usuarias</h3>
                  <Link href="/asociada/usuarias" style={{ fontSize:11, fontWeight:600, color:"#A0435F", textDecoration:"none" }}>Ver todas</Link>
                </div>
                <div>
                  {usuariasRecientes && usuariasRecientes.length > 0 ? (
                    usuariasRecientes.slice(0, 5).map((u, i) => (
                      <Link key={i} href={`/asociada/usuarias/${u.id}`}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 16px", borderBottom:i<Math.min(5, usuariasRecientes.length)-1?"1px solid #FBF4F6":"none", textDecoration:"none" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:600, color:"#4A2A38", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.nombre} {u.apellido}</p>
                          <p style={{ fontSize:10, color:"#9C8790", margin:"2px 0 0" }}>Progreso: {u.porcentaje || 0}%</p>
                        </div>
                        <div style={{ width:28, height:28, borderRadius:8, background:"#FBF4F6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#A0435F", flexShrink:0 }}>
                          {u.porcentaje || 0}%
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p style={{ fontSize:12, color:"#9C8790", padding:16, textAlign:"center", margin:0 }}>Sin usuarias asignadas</p>
                  )}
                </div>
              </div>
            </div>

            {/* TAREAS PENDIENTES */}
            {tareasPendientes && tareasPendientes.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm overflow-hidden">
                <div style={{ padding:"12px 16px 10px", borderBottom:"1px solid #FCE8EE" }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#4A2A38", margin:0 }}>Tareas pendientes</h3>
                </div>
                <div>
                  {tareasPendientes.map((tarea, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", borderBottom:i<tareasPendientes.length-1?"1px solid #FBF4F6":"none" }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:"#FCE8EE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12 }}>✓</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:"#4A2A38", margin:"0 0 2px" }}>{tarea.titulo}</p>
                        <p style={{ fontSize:11, color:"#9C8790", margin:0 }}>{tarea.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR (DESKTOP) ── */}
          {!isMobile && (
            <div style={{ width:280, flexShrink:0, display:"flex", flexDirection:"column", gap:16 }}>

              {/* Mi Perfil */}
              <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm overflow-hidden">
                <div style={{ padding:16, borderBottom:"1px solid #FCE8EE", background:"linear-gradient(135deg,#A0435F,#A0435F)" }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:8 }}>
                    👩‍🏫
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>{user?.nombre || "Asesora"}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.8)", margin:0 }}>{user?.ciudad || "Ciudad"}, {user?.pais || "País"}</p>
                </div>
                <div style={{ padding:16 }}>
                  <Link href="/asociada/configuracion" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, fontWeight:600, color:"#A0435F", textDecoration:"none", padding:"8px 12px", borderRadius:10, border:"1px solid #FCE8EE", background:"#FBF4F6", marginBottom:8 }}>
                    Editar perfil
                    <ChevronRight size={14}/>
                  </Link>
                  <p style={{ fontSize:10, color:"#9C8790", margin:"12px 0 8px", fontWeight:700, textTransform:"uppercase", letterSpacing:".5px" }}>Contacto</p>
                  <p style={{ fontSize:11, color:"#4A2A38", margin:"4px 0", fontWeight:600 }}>{user?.telefono || "Sin teléfono"}</p>
                  <p style={{ fontSize:11, color:"#4A2A38", margin:"4px 0", fontWeight:600 }}>{user?.email}</p>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-2xl border border-[#F5E1E7] shadow-sm" style={{ padding:16 }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:"#4A2A38", margin:"0 0 12px", textTransform:"uppercase", letterSpacing:".5px" }}>Acciones rápidas</h4>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <Link href="/asociada/usuarias" style={{ fontSize:12, fontWeight:600, color:"#A0435F", background:"#FBF4F6", border:"1px solid #FCE8EE", padding:"10px 12px", borderRadius:10, textDecoration:"none", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <UsersIcon size={14}/> Ver todas mis usuarias
                  </Link>
                  <Link href="/asociada/reuniones" style={{ fontSize:12, fontWeight:600, color:"#A0435F", background:"#FBF4F6", border:"1px solid #FCE8EE", padding:"10px 12px", borderRadius:10, textDecoration:"none", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <CalendarIcon size={14}/> Gestionar reuniones
                  </Link>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
