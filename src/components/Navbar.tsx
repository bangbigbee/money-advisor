"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Wallet,
  Coins,
  Layers,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Cloud,
  ChevronDown,
  Scan,
  Crown,
  Zap,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenUpgradeModal?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenUpgradeModal,
}: NavbarProps) {
  const { user, isLoading, role, remainingScans, signInWithGoogle, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: Wallet },
    { id: "scan", label: "Quét AI", icon: Scan, isSpecial: true },
    { id: "crypto", label: "Crypto Market", icon: Coins },
    { id: "forex-gold", label: "Vàng & Ngoại hối", icon: TrendingUp },
    { id: "portfolio", label: "Danh mục đầu tư", icon: Layers },
  ];

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Người dùng";

  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                MoneyAdvisor
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                AI & Cloud
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/30 via-emerald-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                        : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border-cyan-500/20"
                    }`}
                  >
                    <Icon className="h-4 w-4 animate-pulse text-cyan-400" />
                    <span>{item.label}</span>
                    {/* Circular Quota Indicator */}
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400 text-zinc-950 text-[10px] font-black font-mono shadow-sm">
                      {isUnlimited ? "∞" : remainingScans}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-800/90 text-emerald-400 shadow-inner border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Scan Button */}
            <button
              onClick={() => setActiveTab("scan")}
              className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                activeTab === "scan"
                  ? "bg-cyan-500/30 text-cyan-300 border-cyan-500/50"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Quét AI</span>
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-zinc-950 text-[9px] font-black flex items-center justify-center">
                {isUnlimited ? "∞" : remainingScans}
              </span>
            </button>

            {/* Quick Add Asset Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Giao dịch mới</span>
              <span className="sm:hidden">+ Thêm</span>
            </button>

            {/* Google Auth / Profile Button */}
            {isLoading ? (
              <div className="h-9 w-24 bg-zinc-800 animate-pulse rounded-xl" />
            ) : user ? (
              /* User is Logged in */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="text-xs font-medium text-zinc-200 hidden sm:inline max-w-[90px] truncate">
                    {userName}
                  </span>

                  {/* Tier Badge in Navbar */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      role === "ADMIN"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        : role === "ULTRA"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : role === "PRO"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {role === "ADMIN" ? "👑 ADMIN" : role}
                  </span>

                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 text-xs text-zinc-200 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <div className="font-bold text-white truncate flex items-center justify-between">
                        <span>{userName}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {isUnlimited ? "Quét: ∞" : `Quét: ${remainingScans} lượt`}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400">Gói tài khoản:</span>
                        <span className="font-black text-amber-400">{role}</span>
                      </div>
                    </div>

                    {/* Upgrade Tier Button in Menu */}
                    {onOpenUpgradeModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenUpgradeModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 transition text-left cursor-pointer mb-1 border border-amber-500/20"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="font-bold">Nâng cấp Phân cấp</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab("scan");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition text-left cursor-pointer"
                    >
                      <Scan className="w-4 h-4 text-cyan-400" />
                      <span>Trang Quét AI</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab("portfolio");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition text-left cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Danh mục của tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User is Guest / Not Logged in */
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-100 text-xs font-medium shadow-sm transition cursor-pointer"
              >
                {/* Google "G" SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.68-5.17 3.68-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
