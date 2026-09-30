"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  TrendingUp,
  ChevronDown,
  Search,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  LogIn,
  Crown,
  History,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { CryptoItem, GoldForexItem } from "@/lib/marketApi";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cryptos: CryptoItem[];
  goldForex: GoldForexItem[];
  selectedAsset: any;
  onSelectAsset: (asset: any) => void;
  onStartScan?: (asset?: any) => void;
  isScanning?: boolean;
  onOpenUpgradeModal?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  cryptos,
  goldForex,
  selectedAsset,
  onSelectAsset,
  onStartScan,
  isScanning = false,
  onOpenUpgradeModal,
}: NavbarProps) {
  const { user, isLoading, role, remainingScans, signInWithGoogle, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "crypto" | "gold" | "forex">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "ADMIN" || user?.email?.toLowerCase() === "bangdtbk@gmail.com";
  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Merge Crypto + Gold + Forex into a unified market asset list
  const allMarketAssets = useMemo(() => {
    const cryptoItems = (cryptos || []).map((c) => ({
      ...c,
      category: "crypto" as const,
      chartSymbol: c.chartSymbol || `BINANCE:${c.symbol.toUpperCase()}USDT`,
    }));

    const goldForexItems = (goldForex || []).map((g) => ({
      id: g.id || g.code?.toLowerCase() || g.name,
      symbol: (g.symbol || g.code || "").toUpperCase(),
      name: g.name,
      current_price: g.current_price || g.sellPrice || g.buyPrice || 0,
      price_change_percentage_24h: g.price_change_percentage_24h || g.change24h || 0,
      total_volume: 1000000000,
      market_cap: 10000000000,
      image: g.image || "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
      category: (g.category || g.type || "gold") as "gold" | "forex",
      chartSymbol: g.chartSymbol || (g.type === "gold" ? "OANDA:XAUUSD" : "FX:EURUSD"),
      unit: g.unit,
    }));

    return [...cryptoItems, ...goldForexItems];
  }, [cryptos, goldForex]);

  const filteredAssets = useMemo(() => {
    let list = allMarketAssets;
    if (categoryFilter !== "all") {
      list = list.filter((a) => a.category === categoryFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [allMarketAssets, categoryFilter, searchQuery]);

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Người dùng";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-[#090d1a]/90 border-b border-slate-200 dark:border-indigo-950/80 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* 1. Left: Brand / Logo */}
          <div
            onClick={() => setActiveTab("scan")}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                MoneyAdvisor
              </span>
              <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-md font-mono">
                AI Pro
              </span>
            </div>
          </div>

          {/* 2. Middle: Integrated Compact Asset Dropdown + Quick Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 justify-center max-w-5xl mx-auto min-w-0">
            {/* Dropdown Selector */}
            <div ref={dropdownRef} className="relative w-[175px] sm:w-[220px] md:w-[240px] shrink-0">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-[#12162e] border border-slate-200 dark:border-indigo-900/60 hover:border-indigo-500 text-left transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                  {selectedAsset?.image && (
                    <img
                      src={selectedAsset.image}
                      alt=""
                      className="w-5 h-5 rounded-full shrink-0 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5"
                    />
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-1 sm:gap-1.5 leading-tight">
                      <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {selectedAsset?.symbol?.toUpperCase() || "CHỌN TÀI SẢN"}
                      </span>
                      <span className="text-[8px] px-1 py-0.2 rounded font-bold uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0">
                        {selectedAsset?.category === "gold" ? "VÀNG" : selectedAsset?.category === "forex" ? "FOREX" : "CRYPTO"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 font-mono">
                  {selectedAsset?.current_price && (
                    <span className="font-bold text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400">
                      {selectedAsset.unit?.includes("VND")
                        ? `${(selectedAsset.current_price / 1e6).toFixed(1)}M đ`
                        : `$${selectedAsset.current_price.toLocaleString("en-US", { maximumFractionDigits: selectedAsset.current_price < 1 ? 4 : 2 })}`}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Dropdown Menu Modal */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-[320px] sm:w-[400px] max-h-[460px] rounded-2xl bg-white dark:bg-[#101428] border border-slate-200 dark:border-indigo-900/90 shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-2xl">
                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-[#0c0f1f] border-b border-slate-200 dark:border-indigo-950 overflow-x-auto text-[10px] sm:text-[11px] font-bold">
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                        categoryFilter === "all" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      🔥 Tất cả ({allMarketAssets.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter("crypto")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                        categoryFilter === "crypto" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      🪙 Top Crypto ({cryptos.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter("gold")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                        categoryFilter === "gold" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      🥇 Vàng
                    </button>
                    <button
                      onClick={() => setCategoryFilter("forex")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                        categoryFilter === "forex" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      💱 Ngoại Tệ
                    </button>
                  </div>

                  {/* Search inside dropdown */}
                  <div className="p-2.5 border-b border-slate-200 dark:border-indigo-950 flex items-center gap-2 bg-slate-50 dark:bg-[#0d1020]">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm 300+ mã (BTC, ETH, SOL, SUI, XAU, SJC, EUR...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-0.5"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white px-1.5 py-0.5 rounded"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* Asset List */}
                  <div className="overflow-y-auto max-h-72 p-1.5 space-y-1">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAsset?.symbol?.toUpperCase() === asset.symbol?.toUpperCase();
                      const isGain = (asset.price_change_percentage_24h || 0) >= 0;
                      return (
                        <div
                          key={`${asset.category}-${asset.symbol}-${asset.id}`}
                          onClick={() => {
                            onSelectAsset(asset);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-600/20 border border-indigo-500/50 text-indigo-600 dark:text-white font-bold shadow-sm"
                              : "hover:bg-slate-100 dark:hover:bg-[#181e3d] text-slate-700 dark:text-slate-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={asset.image}
                              alt=""
                              className="w-6 h-6 rounded-full shrink-0 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5"
                              onError={(e: any) => {
                                e.target.src = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 leading-none">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{asset.symbol.toUpperCase()}</span>
                                <span className="text-[8px] px-1 py-0.2 rounded uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-zinc-800">
                                  {asset.category}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[150px] mt-0.5">
                                {asset.name}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono shrink-0 pl-2">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              {asset.unit?.includes("VND")
                                ? `${asset.current_price?.toLocaleString("vi-VN")} đ`
                                : `$${asset.current_price?.toLocaleString("en-US", { maximumFractionDigits: asset.current_price < 1 ? 4 : 2 })}`}
                            </div>
                            <div className={`text-[10px] font-bold ${isGain ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {isGain ? "+" : ""}{(asset.price_change_percentage_24h || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredAssets.length === 0 && (
                      <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                        Không tìm thấy tài sản khớp với &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Selection Chips (Always permanently visible & scrollable) */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1 shrink min-w-0">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold hidden xl:inline mr-0.5 shrink-0">
                Phổ biến:
              </span>
              {[
                { sym: "BTC", label: "BTC" },
                { sym: "ETH", label: "ETH" },
                { sym: "SOL", label: "SOL" },
                { sym: "SUI", label: "SUI" },
                { sym: "XAUUSD", label: "🥇 Vàng XAU" },
                { sym: "SJC", label: "🏆 Vàng SJC" },
                { sym: "USDVND", label: "💵 USD/VNĐ" },
                { sym: "EURUSD", label: "💶 EUR/USD" },
              ].map((item) => {
                const isSelected = selectedAsset?.symbol?.toUpperCase() === item.sym.toUpperCase();
                const matchAsset = allMarketAssets.find((a) => a.symbol?.toUpperCase() === item.sym.toUpperCase());
                return (
                  <button
                    key={item.sym}
                    onClick={() => {
                      if (matchAsset) {
                        onSelectAsset(matchAsset);
                      } else {
                        onSelectAsset({
                          symbol: item.sym,
                          name: item.label,
                          category: item.sym.includes("XAU") || item.sym.includes("SJC") ? "gold" : item.sym.includes("USD") ? "forex" : "crypto",
                          chartSymbol: item.sym.includes("XAU") || item.sym.includes("SJC") ? "OANDA:XAUUSD" : item.sym.includes("USD") ? `FX:${item.sym}` : `BINANCE:${item.sym}USDT`,
                        });
                      }
                    }}
                    className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm border border-indigo-400/40"
                        : "bg-slate-100 dark:bg-[#12162e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1a2040] border border-slate-200 dark:border-indigo-950"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Right: Theme Toggle & Google Auth / Profile Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
            </button>

            {/* Scan Quota Badge in Navbar */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#12162e] border border-slate-200 dark:border-indigo-900/60 text-xs font-mono shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Quét:</span>
                <span className={`font-bold ${remainingScans === 0 && !isUnlimited ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {isUnlimited ? "∞" : `${remainingScans} lượt`}
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  {isAdmin ? "ADMIN" : role}
                </span>
              </div>
            )}

            {/* Google Auth / Profile Button */}
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition cursor-pointer whitespace-nowrap"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 hidden sm:inline max-w-[80px] truncate">
                    {userName}
                  </span>

                  <ChevronDown className="w-3 h-3 text-slate-500 dark:text-zinc-400 hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 text-xs text-slate-800 dark:text-zinc-200 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-800 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate flex items-center justify-between">
                        <span>{userName}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {isUnlimited ? "Quét: ∞" : `Quét: ${remainingScans} lượt`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-zinc-400">Gói tài khoản:</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">{isAdmin ? "ADMIN" : role}</span>
                      </div>
                    </div>

                    {/* Admin Dashboard Entry */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab("admin");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition text-left cursor-pointer mb-1 border border-rose-500/20"
                      >
                        <Crown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        <span className="font-bold">Admin Dashboard</span>
                      </button>
                    )}

                    {/* History Link */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        const el = document.getElementById("analysis-history-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition text-left cursor-pointer"
                    >
                      <History className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span>Lịch sử phân tích</span>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition text-left cursor-pointer border-t border-slate-200 dark:border-zinc-800/80 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md transition cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
