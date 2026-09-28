"use client";

import React from "react";
import {
  TrendingUp,
  Wallet,
  Coins,
  Layers,
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: Wallet },
    { id: "crypto", label: "Crypto Market", icon: Coins },
    { id: "forex-gold", label: "Vàng & Ngoại hối", icon: TrendingUp },
    { id: "portfolio", label: "Danh mục đầu tư", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                MoneyAdvisor
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Live Market
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm mã (BTC, SJC, USD, ...)"
                className="pl-9 pr-4 py-1.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 w-52"
              />
            </div>

            <button className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition">
              <Bell className="h-4 w-4" />
            </button>

            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              <span>Giao dịch mới</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
