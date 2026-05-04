"use client";
import { navLinks } from "@/data/navLinks";
import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [openMobileMenu, setOpenMobileMenu] = useState(false);

    useEffect(() => {
        if (openMobileMenu) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
    }, [openMobileMenu]);

    return (
        <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-[#f0dde2] ${openMobileMenu ? "bg-[#fff8f9]" : "bg-[#fff8f9]/80 backdrop-blur"}`}>

            {/* Logo */}
            <Link href="/" className="shrink-0">
                <Image
                    className="h-14 md:h-14 w-auto"
                    src="/assets/destino-aupair-logo.svg"
                    alt="Destino Au Pair"
                    width={60}
                    height={60}
                    priority
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden items-center md:gap-8 lg:gap-9 md:flex lg:pl-20">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="text-[13px] text-[#7a4a54] hover:text-[#a0435f] transition"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-base font-medium bg-[#fff8f9]/95 backdrop-blur-md md:hidden transition duration-300 ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>

                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="text-[#2d1a22] hover:text-[#a0435f] transition"
                        onClick={() => setOpenMobileMenu(false)}
                    >
                        {link.name}
                    </Link>
                ))}

                <Link
                    href="/login"
                    className="text-[#2d1a22] hover:text-[#a0435f] transition"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    Iniciar sesión
                </Link>

                <Link
                    href="/register"
                    className="px-6 py-2.5 bg-[#a0435f] text-white rounded-lg text-sm font-medium hover:bg-[#8a3550] transition"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    Registrarse
                </Link>

                <button
                    className="mt-2 w-10 h-10 flex items-center justify-center bg-[#a0435f] hover:bg-[#8a3550] transition text-white rounded-lg"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    <XIcon size={18} />
                </button>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">

                <Link
                    href="/login"
                    className="hidden md:block text-[13px] text-[#a0435f] border border-[#e8b0bc] hover:bg-[#fef0f3] transition px-4 py-2 rounded-lg"
                >
                    Iniciar sesión
                </Link>

                <Link
                    href="/register"
                    className="hidden md:block text-[13px] text-white bg-[#a0435f] hover:bg-[#8a3550] transition px-4 py-2 rounded-lg font-medium"
                >
                    Registrarse
                </Link>

                <button
                    onClick={() => setOpenMobileMenu(!openMobileMenu)}
                    className="md:hidden text-[#2d1a22]"
                >
                    <MenuIcon size={24} className="active:scale-90 transition" />
                </button>

            </div>
        </nav>
    );
}