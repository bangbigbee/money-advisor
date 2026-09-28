"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Scan,
  Sparkles,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Plus,
  Crown,
  Lock,
  Layers,
  Zap,
  Activity,
  Scale,
  Flame,
  Droplets,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Gauge,
} from "lucide-react";
import { CryptoItem } from "@/lib/marketApi";
import { ScanResult } from "@/app/api/ai-scan/route";
import { useAuth } from "@/context/AuthContext";
import { TradingViewWidget } from "@/components/TradingViewWidget";

interface ScannerPageProps {
  cryptos: CryptoItem[];
  onOpenAddAssetModal?: (prefill?: { symbol: string; name: string; price: number }) => void;
  onOpenUpgradeModal?: () => void;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "l1", label: "Layer 1 / L2", symbols: ["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX", "SUI", "NEAR", "APT", "DOT", "MATIC", "XRP"] },
  { id: "ai", label: "AI & Big Data", symbols: ["TAO", "FET", "RENDER", "NEAR", "ICP", "GRT", "AGIX", "OCEAN"] },
  { id: "meme", label: "Meme Coins", symbols: ["DOGE", "SHIB", "PEPE", "BONK", "FLOKI", "WIF", "BOME"] },
  { id: "defi", label: "DeFi & DEX", symbols: ["UNI", "LINK", "INJ", "AAVE", "MKR", "CRV", "SNX", "LDO"] },
];

export function ScannerPage({
  cryptos,
  onOpenAddAssetModal,
  onOpenUpgradeModal,
}: ScannerPageProps) {
  const { role, remainingScans, scansLimit, useScanQuota, canScan } = useAuth();

  const [selectedCoin, setSelectedCoin] = useState<CryptoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"market_cap" | "gainers" | "losers" | "volume">("market_cap");
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [mobileView, setMobileView] = useState<"analysis" | "coins">("analysis");
  const [tradingMode, setTradingMode] = useState<"spot" | "future">("spot");

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLimitReached, setShowLimitReached] = useState(false);

  // Set default selected coin
  useEffect(() => {
    if (!selectedCoin && cryptos.length > 0) {
      setSelectedCoin(cryptos[0]);
    }
  }, [cryptos, selectedCoin]);

  // Filter & sort coins list
  const filteredCoins = useMemo(() => {
    let list = [...cryptos];

    // Category filter
    if (selectedCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat?.symbols) {
        list = list.filter((c) => cat.symbols.includes(c.symbol.toUpperCase()));
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.symbol.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === "gainers") {
      list.sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
      );
    } else if (sortBy === "losers") {
      list.sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)
      );
    } else if (sortBy === "volume") {
      list.sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0));
    } else {
      list.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
    }

    return list;
  }, [cryptos, selectedCategory, searchTerm, sortBy]);

  const handleStartScan = async (coinToScan = selectedCoin) => {
    if (!coinToScan) return;

    if (!canScan) {
      setShowLimitReached(true);
      return;
    }

    setIsScanning(true);
    setErrorMessage("");
    setShowLimitReached(false);
    setScanResult(null);

    const price = coinToScan.current_price ?? 0;
    const change24h = coinToScan.price_change_percentage_24h ?? 0;
    const marketCap = coinToScan.market_cap ?? 0;
    const totalVolume = coinToScan.total_volume ?? 0;

    try {
      const res = await fetch("/api/ai-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: coinToScan.symbol,
          name: coinToScan.name,
          currentPrice: price,
          priceChange24h: change24h,
          timeframe,
          marketCap,
          totalVolume,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể kết nối đến AI Scanner");
      }

      const data: ScanResult = await res.json();
      useScanQuota();
      setScanResult(data);
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình quét AI");
    } finally {
      setIsScanning(false);
    }
  };

  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  const getSpotSignalBadgeStyle = (signal: string) => {
    switch (signal) {
      case "STRONG_BUY":
      case "BUY":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20";
      case "TAKE_PROFIT":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-cyan-500/20";
      case "SELL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-500/20";
    }
  };

  const getFuturePositionStyle = (position: string) => {
    if (position === "LONG") {
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20";
    }
    if (position === "SHORT") {
      return "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20";
    }
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  const chartSymbol = selectedCoin ? `BINANCE:${selectedCoin.symbol.toUpperCase()}USDT` : "BINANCE:BTCUSDT";

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-zinc-900/60 border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shrink-0">
            <Scan className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                AI Crypto Scanner 2.0 (Spot & Phái Sinh)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                Dual Engine Pro
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Phân tích đa chiều: Tín hiệu Mua/Bán Spot, Vùng thanh khoản Order Block, Tỷ lệ Long/Short & Bản đồ Thanh lý Futures
            </p>
          </div>
        </div>

        {/* User Quota & Role Badge */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="flex items-center gap-2.5 bg-zinc-950/80 px-4 py-2 rounded-2xl border border-zinc-800 shadow-inner">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-zinc-950 font-mono font-black text-sm shadow-md">
              {isUnlimited ? "∞" : remainingScans}
            </div>
            <div className="text-xs leading-tight">
              <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{isUnlimited ? "Không giới hạn" : `Còn ${remainingScans}/${scansLimit} lượt`}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400 font-mono font-black">
                  {role === "ADMIN" ? "👑 ADMIN" : role}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                {role === "STARTER" ? "Gói STARTER (3 lượt quét)" : "Đã kích hoạt"}
              </div>
            </div>
          </div>

          {onOpenUpgradeModal && role === "STARTER" && (
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Nâng cấp PRO</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Mode Switcher (Visible only on lg:hidden) */}
      <div className="lg:hidden flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setMobileView("analysis")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mobileView === "analysis"
              ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>Biểu đồ & AI ({selectedCoin?.symbol.toUpperCase() || "BTC"})</span>
        </button>

        <button
          onClick={() => setMobileView("coins")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            mobileView === "coins"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Chọn Coin ({filteredCoins.length})</span>
        </button>
      </div>

      {/* Main Scanner Layout: Left Sidebar (Coins) + Right Canvas (Chart & AI Result) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Crypto Selector (4 cols on lg) */}
        <div className={`lg:col-span-4 space-y-4 ${mobileView === "coins" ? "block" : "hidden lg:block"}`}>
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Danh sách Tiền mã hóa ({filteredCoins.length})
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Data
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm mã coin (BTC, SOL, SUI, NEAR,...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
              <span>Sắp xếp theo:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: "market_cap", label: "Vốn hóa" },
                  { id: "gainers", label: "Tăng mạnh" },
                  { id: "volume", label: "Volume" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      sortBy === s.id
                        ? "bg-zinc-800 text-cyan-400 font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Coin List */}
            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredCoins.map((coin) => {
                const isSelected = selectedCoin?.symbol.toUpperCase() === coin.symbol.toUpperCase();
                const change24h = coin.price_change_percentage_24h ?? 0;
                const isPositive = change24h >= 0;
                const price = coin.current_price ?? 0;

                return (
                  <div
                    key={coin.id}
                    onClick={() => {
                      setSelectedCoin(coin);
                      setScanResult(null);
                      setShowLimitReached(false);
                      setMobileView("analysis");
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-zinc-900 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                        : "bg-zinc-950/50 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {coin.image ? (
                        <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                          {coin.symbol.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{coin.symbol.toUpperCase()}</span>
                          {coin.market_cap_rank && (
                            <span className="text-[9px] text-zinc-400 font-normal">
                              #{coin.market_cap_rank}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">{coin.name}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs text-zinc-100 font-mono">
                        ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-[10px] font-semibold font-mono flex items-center justify-end gap-0.5 ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Main Canvas with Chart & AI Analysis Result (8 cols on lg) */}
        <div className={`lg:col-span-8 space-y-6 ${mobileView === "analysis" ? "block" : "hidden lg:block"}`}>
          {/* Selected Coin Action Header */}
          {selectedCoin && (
            <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-3xl p-5 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Coin Info */}
                <div className="flex items-center gap-3.5">
                  {selectedCoin.image && (
                    <img src={selectedCoin.image} alt={selectedCoin.name} className="w-11 h-11 rounded-full shadow-md" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white">
                        {selectedCoin.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-300 uppercase font-mono">
                        {selectedCoin.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-xl font-black text-white font-mono">
                        ${(selectedCoin.current_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                          (selectedCoin.price_change_percentage_24h ?? 0) >= 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {(selectedCoin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                        {(selectedCoin.price_change_percentage_24h ?? 0).toFixed(2)}% (24h)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy Timeframe & Scan Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                    {[
                      { id: "short", label: "Lướt sóng" },
                      { id: "medium", label: "Trung hạn" },
                      { id: "long", label: "Hold / DCA" },
                    ].map((tf) => (
                      <button
                        key={tf.id}
                        onClick={() => setTimeframe(tf.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                          timeframe === tf.id
                            ? "bg-zinc-800 text-cyan-400 font-bold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStartScan()}
                    disabled={isScanning}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang phân tích 2 luồng...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Quét AI {selectedCoin.symbol.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Limit Reached Notice */}
          {showLimitReached && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-base font-bold text-white">
                    Bạn đã sử dụng hết 3 lượt Quét AI của gói STARTER!
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Để quét không giới hạn toàn bộ hơn 100+ đồng crypto và nhận chiến lược chi tiết cả Spot & Futures, hãy nâng cấp lên gói <strong>PRO</strong> hoặc <strong>ULTRA</strong>.
                  </p>
                </div>
              </div>

              {onOpenUpgradeModal && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onOpenUpgradeModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Nâng cấp Gói Ngay</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Result View (When Available) */}
          {scanResult && !isScanning && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Dual Mode Switcher: SPOT vs FUTURES / MARGIN */}
              <div className="p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2">
                <button
                  onClick={() => setTradingMode("spot")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                    tradingMode === "spot"
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/10 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Luồng 1: Giao Dịch SPOT (Nắm Giữ)</span>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {scanResult.spot.signalLabel}
                  </span>
                </button>

                <button
                  onClick={() => setTradingMode("future")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                    tradingMode === "future"
                      ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Luồng 2: FUTURE / MARGIN (Đòn Bẩy)</span>
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      scanResult.future.position === "LONG"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {scanResult.future.position}
                  </span>
                </button>
              </div>

              {/* ========================================================= */}
              {/* TAB 1: SPOT TRADING VIEW */}
              {/* ========================================================= */}
              {tradingMode === "spot" && (
                <div className="space-y-6">
                  {/* Signal & Probabilities Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Chiến lược Giao dịch SPOT:
                        </div>
                        <div className="text-lg font-bold text-white mt-0.5">
                          {scanResult.name} ({scanResult.symbol}) • {scanResult.spot.trend}
                        </div>
                      </div>

                      <div
                        className={`px-5 py-2.5 rounded-2xl border text-sm font-black tracking-wider uppercase shadow-xl ${getSpotSignalBadgeStyle(
                          scanResult.spot.signal
                        )}`}
                      >
                        {scanResult.spot.signalLabel}
                      </div>
                    </div>

                    {/* Score Meters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-zinc-800/80">
                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Xác suất thành công (Spot):</div>
                        <div className="text-2xl font-black text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                          <TrendingUp className="w-5 h-5" />
                          {scanResult.spot.winRatePercent}%
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                            style={{ width: `${scanResult.spot.winRatePercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Điểm tiềm năng (Spot Score):</div>
                        <div className="text-2xl font-black text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                          <BarChart2 className="w-5 h-5" />
                          {scanResult.spot.overallScore} / 10
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                            style={{ width: `${scanResult.spot.overallScore * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Tỷ lệ Lời / Lỗ (R:R Spot):</div>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-1 flex items-center gap-1.5">
                          <Target className="w-5 h-5" />
                          {scanResult.spot.riskRewardRatio}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-2.5">
                          Tối ưu biên độ sinh lời trên vốn nắm giữ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-5 Price Targets Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Vùng Mua DCA
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.spot.entryZone}
                      </div>
                      <p className="text-[10px] text-zinc-400">Gom hàng giá đỏ</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                      <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="w-4 h-4" /> Chốt Lời TP1
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.spot.targetPrice1}
                      </div>
                      <p className="text-[10px] text-zinc-400">Chốt 40% & kéo SL hòa</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                      <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" /> Chốt Lời TP2 / TP3
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.spot.targetPrice2}
                      </div>
                      <p className="text-[10px] text-zinc-400">{scanResult.spot.targetPrice3 || "Đỉnh sóng chu kỳ"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4" /> Cắt Lỗ (SL)
                      </div>
                      <div className="text-sm sm:text-base font-black text-rose-300 font-mono mt-1">
                        {scanResult.spot.stopLoss}
                      </div>
                      <p className="text-[10px] text-zinc-400">Bảo vệ an toàn danh mục</p>
                    </div>
                  </div>

                  {/* Liquidity Profile (Order Blocks & FVG) */}
                  <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                    <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      Bản đồ Thanh khoản Thị trường (Liquidity & Order Blocks)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                      <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                        <div className="font-bold text-emerald-400 flex items-center gap-1">
                          <span>🟢 Vùng Cầu / Thanh Khoản Dồi Dào</span>
                        </div>
                        <p className="text-zinc-300 font-medium">
                          {scanResult.spot.liquidity?.highLiquidityZone || scanResult.spot.entryZone}
                        </p>
                        <span className="text-[10px] text-zinc-400 block">Khu vực cá mập và tổ chức đặt lệnh mua chờ lớn</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <span>🟡 Vùng Thanh Khoản Mỏng (FVG)</span>
                        </div>
                        <p className="text-zinc-300 font-medium">
                          {scanResult.spot.liquidity?.thinLiquidityZone || "Khoảng trống giá - biến động nhanh"}
                        </p>
                        <span className="text-[10px] text-zinc-400 block">Giá có xu hướng lấp đầy khoảng trống mất cân bằng</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                        <div className="font-bold text-rose-400 flex items-center gap-1">
                          <span>🔴 Vùng Áp Lực Bán (Supply Zone)</span>
                        </div>
                        <p className="text-zinc-300 font-medium">
                          {scanResult.spot.liquidity?.supplyZone || scanResult.spot.targetPrice2}
                        </p>
                        <span className="text-[10px] text-zinc-400 block">Khu vực nhà đầu tư kẹt hàng có xu hướng thoát vốn</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Technical Indicators Breakdown (Each in dedicated Section) */}
                  <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      Phân Tích Chi Tiết Từng Chỉ Số Kỹ Thuật
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      {/* Section 1: EMA Trend */}
                      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                        <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Activity className="w-4 h-4" /> 1. Cấu trúc Xu hướng & EMA Ribbon (20/50/200)
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {scanResult.spot.indicators?.emaTrend || "Giá duy trì ổn định quanh các dải trung bình động chính."}
                        </p>
                      </div>

                      {/* Section 2: RSI */}
                      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Gauge className="w-4 h-4" /> 2. Chỉ số Sức mạnh RSI 14 & Phân kỳ
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {scanResult.spot.indicators?.rsi?.status || "RSI 14 đang ở vùng trung tính, dòng tiền vào đều đặn."}
                        </p>
                      </div>

                      {/* Section 3: MACD */}
                      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                        <div className="font-bold text-purple-400 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" /> 3. Động lượng MACD & Histogram
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {scanResult.spot.indicators?.macd || "MACD duy trì phân kỳ dương, áp lực bán yếu dần."}
                        </p>
                      </div>

                      {/* Section 4: Volume & Support/Resistance */}
                      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                        <div className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Shield className="w-4 h-4" /> 4. Volume Profile & Kháng cự / Hỗ trợ
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          🟢 Hỗ trợ: {scanResult.spot.indicators?.supportResistance?.support || scanResult.spot.entryZone} <br />
                          🔴 Kháng cự: {scanResult.spot.indicators?.supportResistance?.resistance || scanResult.spot.targetPrice1}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spot Capital Advice & Portfolio Button */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-zinc-900 border border-emerald-500/20 space-y-3">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Chiến lược Phân Bổ Vốn Spot Tối Ưu
                    </h4>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {scanResult.spot.strategyAdvice}
                    </p>
                    <div className="text-[11px] text-zinc-400 italic pt-2 border-t border-zinc-800/60">
                      ⚠️ {scanResult.spot.riskWarning}
                    </div>

                    {onOpenAddAssetModal && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            onOpenAddAssetModal({
                              symbol: scanResult.symbol,
                              name: scanResult.name,
                              price: scanResult.currentPrice,
                            });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm {scanResult.symbol} vào Danh mục Đầu tư</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: FUTURES / MARGIN TRADING VIEW */}
              {/* ========================================================= */}
              {tradingMode === "future" && (
                <div className="space-y-6">
                  {/* Position & Derivatives Strategy Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-cyan-500/30 shadow-2xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          Khuyến nghị Vị thế Đòn bẩy (Futures & Margin):
                        </div>
                        <div className="text-lg font-bold text-white mt-0.5">
                          {scanResult.name} ({scanResult.symbol}) • Đòn bẩy: {scanResult.future.recommendedLeverage}
                        </div>
                      </div>

                      <div
                        className={`px-5 py-2.5 rounded-2xl border text-sm font-black tracking-wider uppercase shadow-xl ${getFuturePositionStyle(
                          scanResult.future.position
                        )}`}
                      >
                        {scanResult.future.positionLabel}
                      </div>
                    </div>

                    {/* Future Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-zinc-800/80">
                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Tỷ lệ Thắng (Winrate Futures):</div>
                        <div className="text-2xl font-black text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                          <Flame className="w-5 h-5 text-amber-400" />
                          {scanResult.future.winRatePercent}%
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full"
                            style={{ width: `${scanResult.future.winRatePercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Mức Rủi Ro Vốn (Risk per Trade):</div>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-1 flex items-center gap-1.5">
                          <ShieldAlert className="w-5 h-5 text-amber-400" />
                          {scanResult.future.capitalRiskPercent}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-2.5">
                          Giới hạn tối đa không cháy tài khoản
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="text-xs text-zinc-400 font-medium">Tỷ lệ Risk / Reward (R:R Phái sinh):</div>
                        <div className="text-2xl font-black text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                          <Target className="w-5 h-5" />
                          {scanResult.future.riskRewardRatio}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-2.5">
                          Tỷ lệ kỳ vọng lợi nhuận trên đòn bẩy
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Targets & Stop Loss */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                      <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="w-4 h-4" /> Vùng Entry Lệnh
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.future.entryZone}
                      </div>
                      <p className="text-[10px] text-zinc-400">Vào lệnh có kỷ luật</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" /> Chốt Lời TP1
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.future.targetPrice1}
                      </div>
                      <p className="text-[10px] text-zinc-400">Dời SL về hòa vốn</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                      <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Flame className="w-4 h-4" /> Chốt Lời TP2 / TP3
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-100 font-mono mt-1">
                        {scanResult.future.targetPrice2}
                      </div>
                      <p className="text-[10px] text-zinc-400">{scanResult.future.targetPrice3}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4" /> Stop Loss / Liq Price
                      </div>
                      <div className="text-sm sm:text-base font-black text-rose-300 font-mono mt-1">
                        {scanResult.future.stopLoss}
                      </div>
                      <p className="text-[10px] text-zinc-400">Giá thanh lý: {scanResult.future.estLiquidationPrice}</p>
                    </div>
                  </div>

                  {/* Long/Short Ratio & Liquidation Heatmap Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Long/Short Ratio Box */}
                    <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-zinc-100 flex items-center gap-2 text-xs sm:text-sm">
                          <Scale className="w-4 h-4 text-cyan-400" />
                          Tỷ lệ Long / Short Ratio (Tâm lý Phái sinh)
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold">
                          {scanResult.future.metrics?.longShortRatio?.sentiment || "Cân Bằng"}
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className="text-emerald-400">
                            LONG: {scanResult.future.metrics?.longShortRatio?.longPercent || 58}%
                          </span>
                          <span className="text-rose-400">
                            SHORT: {scanResult.future.metrics?.longShortRatio?.shortPercent || 42}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-full flex overflow-hidden border border-zinc-700/50">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full"
                            style={{
                              width: `${scanResult.future.metrics?.longShortRatio?.longPercent || 58}%`,
                            }}
                          />
                          <div
                            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full"
                            style={{
                              width: `${scanResult.future.metrics?.longShortRatio?.shortPercent || 42}%`,
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300">
                        Hệ số: <strong>{scanResult.future.metrics?.longShortRatio?.ratioText || "1.38"}</strong>.
                        Cảnh báo: Nếu tỷ lệ Long quá áp đảo (&gt;65%), nguy cơ bị thị trường đạp giá quét thanh lý Long (Long Squeeze) là rất cao.
                      </p>
                    </div>

                    {/* Liquidation Heatmap Box */}
                    <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-zinc-100 flex items-center gap-2 text-xs sm:text-sm">
                          <Flame className="w-4 h-4 text-rose-400" />
                          Bản đồ Cụm Thanh Lý (Liquidation Heatmap)
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                          {scanResult.future.metrics?.liquidationHeatmap?.stopHuntRisk || "Cảnh giác quét râu"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                          <span className="text-zinc-400">Cụm Thanh Lý Phe Short:</span>
                          <div className="font-mono font-bold text-rose-300 mt-0.5">
                            {scanResult.future.metrics?.liquidationHeatmap?.shortLiquidationPool || scanResult.future.targetPrice1}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                          <span className="text-zinc-400">Cụm Thanh Lý Phe Long:</span>
                          <div className="font-mono font-bold text-emerald-300 mt-0.5">
                            {scanResult.future.metrics?.liquidationHeatmap?.longLiquidationPool || scanResult.future.stopLoss}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Funding Rate & Open Interest */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                      <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Funding Rate Hiện Tại: {scanResult.future.metrics?.fundingRate?.rate || "+0.01%"}
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        {scanResult.future.metrics?.fundingRate?.status || "Funding Rate ổn định, không có hiện tượng quá nhiệt hay phí âm sâu."}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                      <div className="font-bold text-purple-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> Hợp Đồng Mở (Open Interest - OI) & Biến Động ATR
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        {scanResult.future.metrics?.openInterest || "Dòng tiền hợp đồng mở duy trì tích cực."} {scanResult.future.metrics?.volatilityATR}
                      </p>
                    </div>
                  </div>

                  {/* 3 Golden Risk Management Rules */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/30 via-zinc-900 to-zinc-900 border border-rose-500/30 space-y-3">
                    <h4 className="font-bold text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      3 Nguyên Tắc Kỷ Luật Sống Còn (Bảo Vệ Tài Khoản Futures)
                    </h4>
                    <div className="space-y-1.5 text-xs text-zinc-200">
                      {(scanResult.future.riskManagementRules || []).map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive TradingView Chart Section */}
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                Biểu đồ Kỹ thuật Thời gian Thực (TradingView)
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                Mã: {chartSymbol}
              </span>
            </div>

            <TradingViewWidget symbol={chartSymbol} theme="dark" />
          </div>
        </div>
      </div>
    </div>
  );
}
