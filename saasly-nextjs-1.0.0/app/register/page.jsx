"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", lastName: "", companyName: "", nit: "",
    phone: "", country: "", city: "",
    email: "", password: "", confirmPassword: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        fullName: form.fullName,
        lastName: form.lastName,
        companyName: form.companyName,
        nit: form.nit,
        phone: form.phone,
        country: form.country,
        city: form.city,
        email: form.email,
        password: form.password,
      }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-md shadow-slate-200/80 border border-slate-100 w-full max-w-lg">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/assets/project-center.svg" alt="Project Center" width={140} height={40} priority />
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Create your account</h2>
        <p className="text-sm text-slate-500 text-center mb-8">Start managing your projects in minutes</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">First Name</label>
              <input name="fullName" type="text" placeholder="Juan" value={form.fullName} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Last Name</label>
              <input name="lastName" type="text" placeholder="Pablo" value={form.lastName} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
            </div>
          </div>

          {/* Company + NIT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Company Name</label>
              <input name="companyName" type="text" placeholder="Project Center LLC" value={form.companyName} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">NIT / Tax ID</label>
              <input name="nit" type="text" placeholder="900.123.456-7" value={form.nit} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
            </div>
          </div>

          {/* Phone + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
              <input name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Country</label>
              <select name="country" value={form.country} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition bg-white">
                <option value="">Select country</option>
                <option>United States</option>
                <option>Colombia</option>
                <option>Mexico</option>
                <option>Canada</option>
                <option>Spain</option>
                <option>Argentina</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">City</label>
            <input name="city" type="text" placeholder="Bogotá" value={form.city} onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Confirm Password</label>
            <div className="relative">
              <input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="terms" required className="mt-0.5 accent-cyan-600 cursor-pointer" />
            <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer">
              I agree to the <span className="text-cyan-600 hover:underline">Terms of Service</span> and <span className="text-cyan-600 hover:underline">Privacy Policy</span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white py-2.5 rounded-lg font-medium transition mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500 pt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}