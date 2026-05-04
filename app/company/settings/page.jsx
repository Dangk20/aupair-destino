"use client";

import { useState } from "react";
import { Building2, Mail, Phone, Globe, MapPin, Save, Camera } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    companyName: "", email: "", phone: "", website: "",
    address: "", city: "", state: "", zip: "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r=>setTimeout(r,800));
    setMsg("Settings saved successfully.");
    setSaving(false);
    setTimeout(()=>setMsg(""),3000);
  }

  const field = (label, key, type="text", placeholder="") => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"/>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your company profile and account</p>
      </div>

      {/* Company logo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Company Logo</h3>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            PC
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
              <Camera size={15}/> Upload Logo
            </button>
            <p className="text-xs text-slate-400 mt-1.5">PNG or JPG, max 2MB. Recommended: 200x200px</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2"><Building2 size={15} className="text-cyan-600"/>Company Information</h3>
          {field("Company Name", "companyName", "text", "Acme Construction Inc.")}
          <div className="grid grid-cols-2 gap-4">
            {field("Email", "email", "email", "contact@company.com")}
            {field("Phone", "phone", "tel", "+1 (555) 000-0000")}
          </div>
          {field("Website", "website", "url", "https://yourcompany.com")}
          {field("Address", "address", "text", "123 Main Street")}
          <div className="grid grid-cols-3 gap-3">
            {field("City", "city", "text", "Miami")}
            {field("State", "state", "text", "FL")}
            {field("ZIP", "zip", "text", "33101")}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Change Password</h3>
          {field("Current Password", "currentPassword", "password")}
          <div className="grid grid-cols-2 gap-4">
            {field("New Password", "newPassword", "password")}
            {field("Confirm Password", "confirmPassword", "password")}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          {msg && <p className="text-emerald-600 text-sm font-medium">✓ {msg}</p>}
          <div className="ml-auto">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
              <Save size={15}/>{saving?"Saving…":"Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}