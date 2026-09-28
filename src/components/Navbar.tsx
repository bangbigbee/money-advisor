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
  Settings,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenGuideModal: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenGuideModal,
}: NavbarProps) {
  const { user, isLoading, isConfigured, signInWithGoogle, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: Wallet },
    { id: "crypto", label: "Crypto Market", icon: Coins },
    { id: "forex-gold", label: "Vàng & Ngoại hối", icon: TrendingUp },
    { id: "portfolio", label: "Danh mục đầu tư", icon: Layers },
  ];

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Người dùng";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
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
                Live & Cloud
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
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
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Add Asset Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Giao dịch mới</span>
              <span className="sm:hidden">+ Thêm</span>
            </button>

            {/* Cloud Config Guide Trigger */}
            <button
              onClick={onOpenGuideModal}
              title="Hướng dẫn cấu hình Cloud & Google OAuth"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition cursor-pointer"
            >
              <Settings className="h-4 w-4" />
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
                  <span className="text-xs font-medium text-zinc-200 hidden sm:inline max-w-[100px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 text-xs text-zinc-200 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <div className="font-bold text-white truncate">{userName}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
                        <Cloud className="w-3 h-3" />
                        <span>Đã kết nối Google Cloud</span>
                      </div>
                    </div>

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
                <span>Đăng nhập Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
