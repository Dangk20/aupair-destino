"use client";

import { navLinks } from "@/data/navLinks";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (openMobileMenu) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [openMobileMenu]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`flex items-center justify-between fixed z-50 top-0 w-full border-b border-[#f0dde2] transition-all duration-300
      px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-28
      py-2 md:py-3 xl:py-4
      ${openMobileMenu ? "bg-[#fff8f9]" : scrolled ? "bg-[#fff8f9]/95 backdrop-blur shadow-sm" : "bg-[#fff8f9]/80 backdrop-blur"}
    `}>

      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Image
          src="/assets/destino-aupair-logo2.svg"
          alt="Destino Au Pair"
          width={72}
          height={72}
          priority
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-[68px] xl:h-[68px] 2xl:w-[72px] 2xl:h-[72px]"
        />
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center flex-1 px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="flex items-center w-full
                        gap-4 lg:gap-5
                        md:justify-center
                        xl:justify-between xl:gap-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[15px]
                font-medium transition whitespace-nowrap relative group
                ${pathname === link.href
                  ? "text-[#a0435f]"
                  : "text-[#7a4a54] hover:text-[#a0435f]"}
              `}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#a0435f] rounded-full transition-all duration-300
                ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}
              `} />
            </Link>
          ))}
        </div>
      </div>

      {/* Botones desktop */}
      <div className="hidden md:flex items-center gap-2 2xl:gap-3 shrink-0">
        <Link
          href="/login"
          className="text-[11px] lg:text-[13px] 2xl:text-[15px]
            text-[#a0435f] border border-[#e8b0bc] hover:bg-[#fef0f3] transition
            px-3 lg:px-4 2xl:px-6
            py-2 2xl:py-2.5
            rounded-lg whitespace-nowrap"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="text-[11px] lg:text-[13px] 2xl:text-[15px]
            text-white bg-[#a0435f] hover:bg-[#8a3550] transition
            px-3 lg:px-4 2xl:px-6
            py-2 2xl:py-2.5
            rounded-lg font-medium whitespace-nowrap"
        >
          Registrarse
        </Link>
      </div>

      {/* Botón hamburguesa mobile */}
      <button
        onClick={() => setOpenMobileMenu(!openMobileMenu)}
        className="md:hidden text-[#2d1a22] p-1"
        aria-label="Menú"
      >
        {openMobileMenu
          ? <XIcon size={22} className="active:scale-90 transition" />
          : <MenuIcon size={22} className="active:scale-90 transition" />
        }
      </button>

      {/* Mobile Menu — sin cambios */}
      <div className={`fixed inset-0 flex flex-col items-center justify-center gap-5 bg-[#fff8f9]/98 backdrop-blur-md md:hidden transition-all duration-300 z-40
        ${openMobileMenu ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"}
      `}>
        <Image
          src="/assets/destino-aupair-logo.svg"
          alt="Destino Au Pair"
          width={56}
          height={56}
          className="mb-4"
        />
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-[16px] font-medium text-[#2d1a22] hover:text-[#a0435f] transition"
            onClick={() => setOpenMobileMenu(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="flex flex-col items-center gap-3 mt-4 w-full px-10">
          <Link
            href="/login"
            className="w-full text-center text-[14px] text-[#a0435f] border-2 border-[#e8b0bc] hover:bg-[#fef0f3] transition py-3 rounded-xl font-medium"
            onClick={() => setOpenMobileMenu(false)}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="w-full text-center text-[14px] text-white bg-[#a0435f] hover:bg-[#8a3550] transition py-3 rounded-xl font-medium shadow-lg shadow-[#a0435f]/20"
            onClick={() => setOpenMobileMenu(false)}
          >
            Registrarse
          </Link>
        </div>
      </div>

    </nav>
  );
}