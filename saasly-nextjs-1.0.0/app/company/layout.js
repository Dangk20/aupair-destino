"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, FolderOpen,
  FileText, BarChart3, Settings, LogOut,
  ChevronRight, Menu, X, Bell
} from "lucide-react";

const navItems = [
  { label: "Overview",    href: "/app/company",            icon: LayoutDashboard },
  { label: "Projects",    href: "/app/company/projects",   icon: FolderOpen },
  { label: "Blueprints",  href: "/app/company/blueprints", icon: FileText },
  { label: "Team",        href: "/app/company/team",       icon: Users },
  { label: "Reports",     href: "/app/company/reports",    icon: BarChart3 },
  { label: "Settings",    href: "/app/company/settings",   icon: Settings },
];

export default function AppDashboardLayout({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 flex flex-col
        transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="bg-white rounded-xl p-2 flex items-center justify-center">
            <Image src="/assets/project-center.svg" alt="Project Center" width={120} height={32} />
          </div>
          <p className="text-slate-500 text-[10px] text-center mt-2 uppercase tracking-widest">Company Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon  = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${active
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <Icon size={17} className={active ? "text-white" : "text-slate-500 group-hover:text-cyan-400"} />
                {item.label}
                {active && <ChevronRight size={13} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AE
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin Empresa</p>
              <p className="text-slate-400 text-[10px] truncate">company@example.com</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 text-sm transition">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-500 hover:text-slate-700">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-slate-800 font-semibold text-sm">
                {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "Dashboard"}
              </h1>
              <p className="text-slate-400 text-[11px]">Project Center — Company Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">AE</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}