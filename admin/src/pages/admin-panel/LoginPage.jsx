import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) return "Email or username is required.";
    if (!password.trim()) return "Password is required.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/login`,
        { email, password }
      );
      login(data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <section className="min-h-screen flex bg-white">

      {/* ════════ Left · Form ════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[380px]">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] leading-tight font-bold text-gray-900">Welcome back</h1>
            <p className="text-[15px] text-gray-500 mt-2">
              Please sign in to your admin account to continue.
            </p>
          </div>

          {/* Email / Username */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your email or username"
                autoComplete="username"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M6 10.5h12a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0118 19.5H6A1.5 1.5 0 014.5 18v-6A1.5 1.5 0 016 10.5z" />
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px]">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-150"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>

          {/* Footer · maker credit */}
          <p className="text-center mt-10 text-[13px] text-gray-400">
            Designed &amp; developed by{" "}
            <a
              href="https://pixel-orbit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Pixel Orbit
            </a>
          </p>
        </div>
      </div>

      {/* ════════ Right · Brand panel ════════ */}
      <div className="hidden lg:flex relative w-[46%] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">

        {/* Mesh / glow accents */}
        <div className="absolute -top-32 -right-20 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-[90px]" />
        <div className="absolute -bottom-40 -left-24 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-14 py-16 text-white">

          {/* Top · logo lockup */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img src="/SVG/maulshree_logo.svg" alt="" className="w-6 h-6 brightness-0 invert" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Maulshree CRM</span>
          </div>

          {/* Middle · headline + glass dashboard card */}
          <div className="py-10">
            <h2 className="text-[34px] leading-[1.2] font-bold max-w-md">
              Run your business from a single dashboard.
            </h2>
            <p className="text-blue-100/80 text-[15px] mt-4 max-w-sm leading-relaxed">
              Projects, teams, clients and sales — organised, in real time, all in one place.
            </p>

            {/* Floating glass stat card */}
            <div className="mt-10 max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium text-blue-50/90">Performance overview</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200">
                  +18.2%
                </span>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-2 h-24">
                {[42, 64, 38, 78, 52, 88, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div
                      className={`w-full rounded-md ${i === 5 ? "bg-white" : "bg-white/35"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom · feature pills */}
          <div className="flex flex-wrap gap-2.5">
            {["Project Tracking", "Team Management", "Sales Insights"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 text-[13px] text-blue-50/90 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5"
              >
                <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
