"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import {
  ArrowRight,
  Crown,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useState } from "react";

export function LoginView() {
  const { login, register } = useWardrobe();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("Sagu");
  const [username, setUsername] = useState("sagu");
  const [password, setPassword] = useState("sagu");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both your username and password.");
      return;
    }

    if (mode === "signup") {
      const ok = await register(name, username, password);
      if (!ok) setError("Could not create account. Please try again.");
    } else {
      const ok = await login(username, password);
      if (!ok) setError("Incorrect username or password.");
    }
  };

  const handleQuickSaguLogin = async () => {
    setError(null);
    await login("sagu", "sagu");
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f8ff] dark:bg-[#090909] text-[#090909] dark:text-white flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-[400px] rounded-[25px] bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-[0_6px_16px_rgba(2,136,209,0.18)] space-y-5">
        {/* Brand Header with Custom Logo */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-20 h-20 rounded-[18px] overflow-hidden border-2 border-[#0288d1]/30 shadow-[0_6px_16px_rgba(2,136,209,0.18)] bg-[#2E2E2E]">
            <img
              src="/logo.png"
              alt="Sagu's Wardrobe Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[16.5px] font-bold tracking-tight text-[#090909] dark:text-white">
              Sagu&apos;s Wardrobe
            </h1>
            <p className="text-[13px] text-[#666666] dark:text-slate-400 mt-0.5">
              Personal Digital Closet &amp; Outfit Planner
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`py-2 rounded-[10px] text-[13.5px] font-semibold transition-all duration-fast ${
              mode === "signin"
                ? "bg-[#0288d1] text-white shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
                : "text-[#666666] dark:text-slate-400"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2 rounded-[10px] text-[13.5px] font-semibold transition-all duration-fast ${
              mode === "signup"
                ? "bg-[#0288d1] text-white shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
                : "text-[#666666] dark:text-slate-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[13px] font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-[13px] font-semibold text-[#090909] dark:text-slate-200 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sagu"
                  className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[14px] text-[#090909] dark:text-white focus:outline-none focus:border-[#0288d1]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-[#090909] dark:text-slate-200 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sagu"
                className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[14px] text-[#090909] dark:text-white focus:outline-none focus:border-[#0288d1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#090909] dark:text-slate-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 pl-10 pr-10 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[14px] text-[#090909] dark:text-white focus:outline-none focus:border-[#0288d1]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#090909] p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 px-5 rounded-[12px] bg-[#0288d1] hover:bg-[#0277bd] active:scale-[0.99] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(2,136,209,0.18)] transition-all duration-fast"
          >
            <span>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* One-Tap Quick Sign In */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <button
            type="button"
            onClick={handleQuickSaguLogin}
            className="w-full h-10 px-4 rounded-[12px] bg-[#f5f8ff] dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[13px] font-semibold text-[#0288d1] inline-flex items-center justify-center gap-2 transition-colors duration-fast"
          >
            <Crown className="w-4 h-4" />
            <span>Quick Sign In as Sagu</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#666666]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#269238]" />
            <span>Stored privately on your device</span>
          </div>
        </div>
      </div>
    </div>
  );
}
