import { ChevronRightIcon, SparklesIcon } from "lucide-react";

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
                Manage smarter.{" "}
                <span className="bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                    Automate faster.
                </span>{" "}
                Scale without limits.
            </h1>
            <p className="text-base text-slate-600 max-w-lg mt-5">
                Project Center centralizes your projects, teams, and workflows to help you move faster and achieve more.
            </p>
            <div className="flex items-center gap-4 mt-6">
                <button className="bg-cyan-600 hover:bg-cyan-700 transition px-8 py-3 rounded-md text-white">
                    <span>Get Started</span>
                </button>
                <button className="flex items-center justify-center gap-2 border border-cyan-400 px-5 py-3 rounded-md text-cyan-600">
                    <SparklesIcon size={16} />
                    <span>AI Features</span>
                </button>
            </div>

            {/* App Mockup */}
            <div className="w-full max-w-4xl mt-16 mx-auto drop-shadow-2xl drop-shadow-blue-500/15 rounded-2xl overflow-hidden border border-slate-200 bg-white text-left">

                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 mx-4 bg-slate-200 rounded-full h-5 flex items-center px-3">
                        <span className="text-slate-400 text-[11px]">app.projectcenter.com/dashboard</span>
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-44 bg-slate-900 p-4 hidden md:flex flex-col gap-1 min-h-64">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/assets/project-center-icon.svg" alt="icon" className="w-6 h-6" />
                            <span className="text-white text-xs font-bold">Project Center</span>
                        </div>
                        {["Dashboard", "Projects", "Clients", "Invoices", "Team", "Settings"].map((item, i) => (
                            <div key={i} className={`text-xs px-3 py-2 rounded-lg cursor-pointer ${i === 0 ? "bg-cyan-600 text-white font-semibold" : "text-slate-400 hover:text-white"}`}>
                                {item}
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-5 bg-white">
                        {/* Top stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: "Active Projects", value: "24", change: "+3 this week", color: "text-cyan-600" },
                                { label: "Revenue", value: "$48,200", change: "+20% this month", color: "text-emerald-600" },
                                { label: "Pending Invoices", value: "7", change: "$12,400 total", color: "text-amber-600" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-slate-400 text-[10px] mb-1">{stat.label}</p>
                                    <p className="text-slate-800 font-bold text-base">{stat.value}</p>
                                    <p className={`text-[10px] font-medium ${stat.color}`}>{stat.change}</p>
                                </div>
                            ))}
                        </div>

                        {/* Projects table */}
                        <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                                <span className="text-slate-700 text-xs font-semibold">Recent Projects</span>
                                <span className="text-cyan-600 text-[10px] font-medium cursor-pointer">View all →</span>
                            </div>
                            <div className="grid grid-cols-4 px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <span>Project</span><span>Client</span><span>Progress</span><span>Status</span>
                            </div>
                            {[
                                { name: "Roof Replacement", client: "Johnson Family", progress: 85, status: "On Track", color: "bg-emerald-100 text-emerald-700" },
                                { name: "Office Renovation", client: "TechCorp Inc.", progress: 42, status: "In Progress", color: "bg-cyan-100 text-cyan-700" },
                                { name: "Deck Construction", client: "Miller Home", progress: 10, status: "Starting", color: "bg-amber-100 text-amber-700" },
                            ].map((project, i) => (
                                <div key={i} className="grid grid-cols-4 items-center px-4 py-2 hover:bg-slate-100 transition">
                                    <span className="text-slate-700 text-[11px] font-medium truncate">{project.name}</span>
                                    <span className="text-slate-500 text-[11px] truncate">{project.client}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                        </div>
                                        <span className="text-[10px] text-slate-400">{project.progress}%</span>
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${project.color}`}>{project.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
