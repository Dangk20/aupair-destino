"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboardIcon, UsersIcon, VideoIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";

const navItems = [
  { label: "Resumen",  href: "/admin",          icon: LayoutDashboardIcon },
  { label: "Usuarias", href: "/admin/usuarias",  icon: UsersIcon },
  { label: "Perfiles", href: "/admin/perfiles", icon: UsersIcon },
  { label: "Sesiones", href: "/admin/sesiones",  icon: VideoIcon },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const Sidebar = () => (
    <aside className="w-56 bg-[#2d1a22] flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin">
          <Image
            src="/assets/destino-aupair-logo.svg"
            alt="Destino Au Pair"
            width={52} height={52}
            className="brightness-0 invert"
          />
        </Link>
        <p className="text-[10px] text-[#e8849a] font-semibold tracking-widest uppercase mt-2">
          Panel Admin
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 text-[12px] px-3 py-2.5 rounded-xl transition ${
                active
                  ? "bg-[#a0435f] text-white font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[11px] transition"
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
        <header className="md:hidden bg-[#fff8f9] border-b border-[#f0dde2] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#a0435f]">
            {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <Image src="/assets/destino-aupair-logo.svg" alt="" width={36} height={36} />
          <div />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}