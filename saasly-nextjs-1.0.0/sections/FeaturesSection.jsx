import SectionTitle from "@/components/SectionTitle";
import Image from "next/image";
import { BarChart2, Users, FileText } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    title: "Feedback Analyser",
    description: "Turn client responses into actionable insights with real-time sentiment tracking and visual reports.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    accent: "bg-cyan-600",
    badge: "Analytics",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Assign roles, manage permissions, and keep your entire team aligned — all from one place.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    accent: "bg-violet-600",
    badge: "Team",
  },
  {
    icon: FileText,
    title: "Better Invoicing",
    description: "Generate professional invoices in seconds, track payment status, and send automated reminders.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    accent: "bg-emerald-600",
    badge: "Finance",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
    <>
      <SectionTitle
        text1="Features"
        text2="Everything You Need to Deliver"
        text3="A complete toolkit for contractors — built to save time, impress clients, and grow your business."
      />

      <div className="mt-16 max-w-5xl mx-auto w-full px-4">

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-cyan-500 p-8 md:p-12 mb-8 shadow-lg shadow-cyan-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
                All-in-one Platform
              </span>
              <h3 className="text-white text-2xl md:text-3xl font-bold leading-snug mb-3">
                Run your entire contracting<br className="hidden md:block" /> business from one dashboard.
              </h3>
              <p className="text-cyan-100 text-sm leading-relaxed max-w-md">
                From first estimate to final payment — manage projects, clients, documents, and your team without switching tabs.
              </p>
            </div>
            <div className="flex gap-4 md:flex-col md:items-end shrink-0">
              {[
                { value: "10k+", label: "Active users" },
                { value: "98%", label: "Satisfaction rate" },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 rounded-2xl px-6 py-4 text-center backdrop-blur-sm">
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                  <p className="text-cyan-100 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-md shadow-slate-200/80 border border-slate-100 hover:shadow-lg hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image with icon overlay */}
                <div className="relative h-48 w-full">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/30">
                    {feature.badge}
                  </span>
                  <div className={`absolute bottom-3 right-3 w-10 h-10 ${feature.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-slate-800 font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
   </section>
  );
}
