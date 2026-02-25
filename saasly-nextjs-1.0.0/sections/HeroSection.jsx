import { ChevronRightIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="flex flex-col items-center justify-center text-center bg-[url('/assets/hero-section-dot-image.png')] bg-cover bg-no-repeat">
            <a href="#" className="flex items-center gap-2 rounded-full p-1 pr-3 mt-44 text-cyan-600 bg-cyan-50">
                <span className="bg-cyan-600 text-white text-xs px-3.5 py-1 rounded-full">
                    NEW
                </span>
                <p className="flex items-center gap-1">
                    <span>Try 7 days free trial option </span>
                    <ChevronRightIcon size={16} />
                </p>
            </a>
            <h1 className="text-[40px]/12 md:text-[54px]/16 font-semibold max-w-3xl mt-4">
                Manage smarter.     {" "}
                <span className="bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                  Automate faster.  
                </span>
                {" "} Scale without limits.
            </h1>
            <p className="text-base text-slate-600 max-w-lg mt-5">Project Center centralizes your projects, teams, and workflows to help you move faster and achieve more.</p>
            <div className="flex items-center gap-4 mt-6">
                <button className="bg-cyan-600 hover:bg-cyan-700 transition px-8 py-3 rounded-md text-white">
                    <span>Get Started</span>
                </button>
                <button className="flex items-center justify-center gap-2 border border-cyan-400 px-5 py-3 rounded-md text-cyan-600">
                    <SparklesIcon size={16} />
                    <span>AI Features</span>
                </button>
            </div>
            <Image 
  className="w-full max-w-xl mt-16 drop-shadow-2xl drop-shadow-blue-500/15 mx-auto" 
  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80" 
  alt="Hero Section" 
  width={1000} 
  height={500} 
  priority 
/>
        </div>
    );
}