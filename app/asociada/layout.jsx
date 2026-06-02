"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LogOutIcon, MenuIcon, XIcon, BarChart3Icon, UsersIcon, CalendarIcon,
  SettingsIcon, BellIcon, HelpCircleIcon, ChevronDownIcon,
} from "lucide-react";

export default function AsociadaLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { href: "/asociada", label: "Dashboard", icon: BarChart3Icon },
    { href: "/asociada/usuarias", label: "Mis Usuarias", icon: UsersIcon },
    { href: "/asociada/reuniones", label: "Reuniones", icon: CalendarIcon },
    { href: "/asociada/configuracion", label: "Configuración", icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y Menú */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
              </button>
              <Link href="/asociada" className="flex items-center gap-2 font-bold text-lg">
                <span className="text-[#7c5cc4]">✈️</span>
                <span>Destino Au Pair</span>
              </Link>
            </div>

            {/* Acciones Derecha */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded relative">
                <BellIcon size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {userData && (
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{userData.nombre}</p>
                    <p className="text-xs text-gray-500">Asesora</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Cerrar sesión"
                  >
                    <LogOutIcon size={18} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* ── SIDEBAR ── */}
        <aside
          className={`${
            isOpen ? "block" : "hidden"
          } lg:block w-64 bg-white border-r border-gray-200 shadow-sm`}
        >
          <div className="p-6 space-y-4">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-[#7c5cc4] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
