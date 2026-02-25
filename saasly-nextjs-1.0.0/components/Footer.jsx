import { navLinks } from "@/data/navLinks";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 mt-40 w-full text-slate-500">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-200 pb-10">

                {/* Logo + description */}
                <div className="max-w-sm">
                    <a href="#!">
                        <Image
                            className="h-9 md:h-9.5 w-auto shrink-0"
                            src="/assets/project-center.svg"
                            alt="Logo"
                            width={140}
                            height={40}
                            priority
                            fetchPriority="high"
                        />
                    </a>
                    <p className="mt-6 text-sm leading-relaxed">
                        Launch your contracting business in record time with our all-in-one platform designed for speed, flexibility and growth. Whether you&apos;re a solo contractor or a fast-moving team, we provide everything you need.
                    </p>
                </div>

                {/* Links */}
                <div className="flex-1 flex items-start md:justify-end gap-16 md:gap-20">
                    <div>
                        <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                        <ul className="space-y-2 text-sm">
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="hover:text-cyan-600 transition-colors duration-200">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5 text-gray-800">Get in touch</h2>
                        <div className="space-y-2 text-sm">
                            <p>+1-(206)-261-9355</p>
                            <p>jennisalgado@projectcenter.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <p className="pt-4 text-center pb-5 text-sm">
                Copyright 2026 © Project Center. All Rights Reserved.
            </p>
        </footer>
    );
}
