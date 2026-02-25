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
        <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-slate-200 bg-white/40 ${openMobileMenu ? "bg-white/80" : "backdrop-blur"}`}>
            
            {/* Logo */}
            <Link href="/">
                <Image
                    className="h-9 md:h-9.5 w-auto shrink-0"
                    src="/assets/project-center.svg"
                    alt="Logo"
                    width={140}
                    height={40}
                    priority
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden items-center md:gap-8 lg:gap-9 md:flex lg:pl-20">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="hover:text-cyan-600"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/40 backdrop-blur-md md:hidden transition duration-300 ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
                
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setOpenMobileMenu(false)}
                    >
                        {link.name}
                    </Link>
                ))}

                <Link
                    href="/login"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    Sign in
                </Link>

                <button
                    className="aspect-square size-10 p-1 items-center justify-center bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md flex"
                    onClick={() => setOpenMobileMenu(false)}
                >
                    <XIcon />
                </button>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-4">

                <Link
                    href="/login"
                    className="hidden md:block hover:bg-slate-100 transition px-4 py-2 border border-cyan-600 rounded-md"
                >
                    Sign in
                </Link>

                <Link 
                href="/register"
                className="hidden md:block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 transition text-white rounded-md">
                    Get started
                </Link>

                <button
                    onClick={() => setOpenMobileMenu(!openMobileMenu)}
                    className="md:hidden"
                >
                    <MenuIcon size={26} className="active:scale-90 transition" />
                </button>

            </div>
        </nav>
    );
}