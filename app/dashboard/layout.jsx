"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LockIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [todasCompletadas, setTodasCompletadas] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));

    fetch("/api/dashboard/sesiones")
      .then((r) => r.json())
      .then((d) => {
        if (d?.completadas && d?.total) {
          setTodasCompletadas(d.completadas === d.total);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navItems = [
    { label: "Mi ruta",     href: "/dashboard",             locked: false },
    { label: "Mi perfil", href: "/dashboard/perfil", locked: !user?.tiene_acceso },
    { label: "Comunidad",   href: "/dashboard/comunidad",   locked: !user?.tiene_acceso },
    { label: "Certificado", href: "/dashboard/certificado", locked: !todasCompletadas },
  ];

  const Sidebar = () => (
    <aside className="w-56 bg-[#a0435f] flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/15">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Image
            src="/assets/destino-aupair-logo.svg"
            alt="Destino Au Pair"
            width={52} height={52}
            className="brightness-0 invert"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, i) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={i}
              href={item.locked ? "#" : item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 text-[12px] px-3 py-2.5 rounded-xl transition ${
                active
                  ? "bg-white text-[#a0435f] font-medium"
                  : item.locked
                  ? "text-white/25 cursor-not-allowed pointer-events-none"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.locked && <LockIcon size={10} />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/15">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <span className="text-white text-[12px] font-serif font-bold">
              {user?.nombre?.[0] || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[12px] font-medium truncate">{user?.nombre} {user?.apellido}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-[11px] transition w-full"
        >
          <LogOutIcon size={12} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#fff8f9] overflow-hidden">

      <div className="hidden md:flex shrink-0"><Sidebar /></div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden"><Sidebar /></div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar móvil */}
        <header className="md:hidden bg-[#fff8f9] border-b border-[#f0dde2] px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#a0435f]">
            {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <Image src="/assets/destino-aupair-logo.svg" alt="Destino Au Pair" width={36} height={36} />
          <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center">
            <span className="text-[#a0435f] text-[12px] font-serif font-bold">{user?.nombre?.[0] || "?"}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}