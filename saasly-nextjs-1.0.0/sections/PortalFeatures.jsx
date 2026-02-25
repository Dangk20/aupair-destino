"use client";

import SectionTitle from "@/components/SectionTitle";
import { LayoutDashboard, FolderOpen, Bot, CreditCard } from "lucide-react";

const features = [
  {
    id: 1,
    icon: LayoutDashboard,
    title: "Project Dashboard",
    description: "See every project's phase and next milestone.",
    mockup: (
      <div className="bg-slate-50 rounded-xl p-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="ml-2 text-slate-400 font-medium text-[11px]">Projects Center</span>
        </div>
        <div className="grid grid-cols-4 gap-2 px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          <span>Project</span><span>Status</span><span>Progress</span><span>Due</span>
        </div>
        {[
          { name: "Website Redesign", status: "Active", progress: 72, due: "Mar 12", color: "bg-green-100 text-green-700" },
          { name: "Mobile App v2", status: "Review", progress: 45, due: "Apr 5", color: "bg-yellow-100 text-yellow-700" },
          { name: "API Integration", status: "Pending", progress: 20, due: "May 1", color: "bg-orange-100 text-orange-700" },
          { name: "Brand Guidelines", status: "Active", progress: 88, due: "Feb 28", color: "bg-green-100 text-green-700" },
        ].map((p, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
            <span className="text-slate-700 font-medium truncate">{p.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${p.color}`}>{p.status}</span>
            <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-slate-400">{p.due}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    icon: FolderOpen,
    title: "Document Vault",
    description: "Organize and share all project docs with easy approval.",
    mockup: (
      <div className="bg-slate-50 rounded-xl p-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="ml-2 text-slate-400 font-medium text-[11px]">Document Vault</span>
        </div>
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl p-3 text-white mb-3">
          <p className="text-[10px] opacity-80 mb-0.5">Roofing Estimate</p>
          <p className="font-semibold text-sm">Price: <strong>$24,000</strong></p>
        </div>
        {[
          { name: "Roofing Estimate", amount: "$12,391.00", status: "Sent", color: "bg-green-100 text-green-700" },
          { name: "Roofing Estimate", amount: "$8,202.00", status: "Draft", color: "bg-orange-100 text-orange-700" },
        ].map((d, i) => (
          <div key={i} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-slate-100 transition">
            <span className="text-base">📄</span>
            <div className="flex-1">
              <p className="text-slate-700 font-medium">{d.name}</p>
              <p className="text-slate-400 text-[10px]">{d.amount}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.color}`}>{d.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    icon: Bot,
    title: "AI Assistant",
    description: "Draft bids, contracts, and reports with AI.",
    mockup: (
      <div className="bg-slate-50 rounded-xl p-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="ml-2 text-slate-400 font-medium text-[11px]">AI Assistant</span>
        </div>
        <div className="flex flex-col gap-2 mb-3">
          <div className="self-end bg-cyan-600 text-white rounded-xl rounded-br-sm px-3 py-2 max-w-[85%] leading-relaxed">
            Draft a roofing estimate for 2,400 sqft residential job.
          </div>
          <div className="self-start bg-white border border-slate-200 text-slate-700 rounded-xl rounded-bl-sm px-3 py-2 max-w-[90%] leading-relaxed">
            <span className="text-cyan-600 font-semibold text-[10px]">✦ Generating estimate</span><br />
            Roof replacement — 2,400 sqft<br />
            Materials: $11,200 · Labor: $6,800<br />
            <strong>Total: $18,000</strong>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-cyan-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-700 transition">Insert to Doc</button>
          <button className="border border-slate-200 text-slate-500 text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Edit</button>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: CreditCard,
    title: "Payment Tracking",
    description: "Manage payments, invoices, and due dates.",
    mockup: (
      <div className="bg-slate-50 rounded-xl p-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="ml-2 text-slate-400 font-medium text-[11px]">Payment Tracking</span>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl p-3 text-white">
            <p className="text-[10px] opacity-80">Collected</p>
            <p className="font-bold text-base">$48,200</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] text-slate-400">Pending</p>
            <p className="font-bold text-base text-slate-700">$12,400</p>
          </div>
        </div>
        {[
          { client: "Johnson Roof", amount: "$8,400", status: "Paid", date: "Feb 10", color: "bg-green-100 text-green-700" },
          { client: "Miller Home", amount: "$5,200", status: "Overdue", date: "Jan 28", color: "bg-red-100 text-red-700" },
          { client: "Davis Build", amount: "$12,400", status: "Pending", date: "Mar 1", color: "bg-orange-100 text-orange-700" },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-slate-100 transition">
            <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {p.client[0]}
            </div>
            <div className="flex-1">
              <p className="text-slate-700 font-medium">{p.client}</p>
              <p className="text-slate-400 text-[10px]">{p.date}</p>
            </div>
            <span className="font-bold text-slate-800">{p.amount}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.status}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function PortalFeatures() {
  return (
    <section id="features" className="py-20 bg-white">
    <>
      <SectionTitle
        text1="Product"
        text2="A Real Client Portal For Contractors"
        text3="Generate estimates, draft contracts, and create client updates in a few clicks."
      />

      <div className="grid grid-cols-1 sm:grid grid-cols-2 gap-6 mt-16 max-w-4xl mx-auto w-full">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="bg-white rounded-2xl p-6 w-full shadow-md shadow-slate-200/80 border border-slate-100 hover:shadow-lg hover:shadow-slate-200 transition-shadow duration-300"
            >
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-base">{feature.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{feature.description}</p>
              {feature.mockup}
            </div>
          );
        })}
      </div>
    </>
    </section>
  );
}
