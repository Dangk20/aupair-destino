export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />

          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-md transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}