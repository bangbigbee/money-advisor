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
  Star,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Coins,
  Wallet,
  Check,
  TrendingDown as TrendDownIcon,
  HelpCircle,
} from "lucide-react";
import { CryptoItem } from "@/lib/marketApi";
import { ScanResult } from "@/app/api/ai-scan/route";
import { useAuth } from "@/context/AuthContext";

interface ScannerPageProps {
  cryptos: CryptoItem[];
  onOpenAddAssetModal?: (prefill?: { symbol: string; name: string; price: number }) => void;
  onOpenUpgradeModal?: () => void;
}

const DEFAULT_CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "gainers", label: "Top Gainer" },
  { id: "losers", label: "Top Loser" },
  { id: "watchlist", label: "Watchlist +" },
];

export function ScannerPage({
  cryptos,
  onOpenAddAssetModal,
  onOpenUpgradeModal,
}: ScannerPageProps) {
  const { role, remainingScans, scansLimit, useScanQuota, canScan } = useAuth();

  const [selectedCoin, setSelectedCoin] = useState<CryptoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [tradingMode, setTradingMode] = useState<"spot" | "future">("future");
  const [watchlist, setWatchlist] = useState<string[]>(["BTC", "ETH", "SOL"]);
  const [mobileView, setMobileView] = useState<"analysis" | "coins">("analysis");

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

  // Toggle watchlist
  const toggleWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist((prev) =>
      prev.includes(symbol.toUpperCase())
        ? prev.filter((s) => s !== symbol.toUpperCase())
        : [...prev, symbol.toUpperCase()]
    );
  };

  // Filter & sort coins list
  const filteredCoins = useMemo(() => {
    let list = [...cryptos];

    // Quick tab filters
    if (activeFilter === "gainers") {
      list = list.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
      list.sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    } else if (activeFilter === "losers") {
      list = list.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
      list.sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0));
    } else if (activeFilter === "watchlist") {
      list = list.filter((c) => watchlist.includes(c.symbol.toUpperCase()));
    } else {
      list.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
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

    return list;
  }, [cryptos, activeFilter, searchTerm, watchlist]);

  // Execute AI Scan
  const handleStartScan = async (coinToScan = selectedCoin) => {
    if (!coinToScan) return;

    if (!canScan) {
      setShowLimitReached(true);
      return;
    }

    setIsScanning(true);
    setErrorMessage("");
    setShowLimitReached(false);

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

  // Dynamic fallback calculation if not scanned yet
  const currentCoinPrice = selectedCoin?.current_price ?? 0;
  const currentCoinChange = selectedCoin?.price_change_percentage_24h ?? 0;
  const isPositive = currentCoinChange >= 0;

  // Render mock or real scan data
  const spotData = scanResult?.spot || {
    signal: isPositive ? "BUY" : "HOLD",
    signalLabel: isPositive ? "MUA GOM" : "QUAN SÁT",
    winRatePercent: 72,
    overallScore: 8.2,
    riskRewardRatio: "1 : 2.8",
    trend: isPositive ? "Tăng trưởng Bullish" : "Tích lũy Sideway",
    entryZone: `$${(currentCoinPrice * 0.97).toLocaleString("en-US", { maximumFractionDigits: 4 })} - $${(currentCoinPrice * 0.99).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice1: `$${(currentCoinPrice * 1.06).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice2: `$${(currentCoinPrice * 1.15).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice3: `$${(currentCoinPrice * 1.25).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    stopLoss: `$${(currentCoinPrice * 0.92).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    liquidity: {
      highLiquidityZone: `$${(currentCoinPrice * 0.95).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Order Block Mua)`,
      thinLiquidityZone: `$${(currentCoinPrice * 1.08).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      supplyZone: `$${(currentCoinPrice * 1.18).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Vùng Chốt Lời Kháng Cự)`,
    },
    indicators: {
      emaTrend: "Nằm trên EMA 50 & 200",
      rsi: { value: 58, status: "Vùng Tích Lũy Lành Mạnh" },
      macd: "Giao cắt MACD hướng lên (Bullish Cross)",
      volumeProfile: "Khối lượng mua chủ động tăng 28%",
      supportResistance: {
        support: `$${(currentCoinPrice * 0.94).toFixed(2)}`,
        resistance: `$${(currentCoinPrice * 1.12).toFixed(2)}`,
      },
    },
    strategyAdvice: "Chiến lược Spot: Phân bổ vốn DCA 3 đợt tại vùng hỗ trợ. Giữ kỷ luật chốt lời từng phần khi giá tiệm cận kháng cự.",
    riskWarning: "Không dồn toàn bộ vốn all-in một điểm; đặt Stoploss bảo vệ danh mục.",
    finalVerdict: {
      action: isPositive ? "NÊN MUA" : "QUAN SÁT",
      actionType: isPositive ? "BUY" : "WAIT",
      summaryText: isPositive
        ? "Cấu trúc thị trường Spot duy trì đà tăng trưởng ổn định. Dòng tiền tích lũy tốt tại các vùng giá hỗ trợ cứng."
        : "Thị trường đang tích lũy đi ngang. Nên quan sát thêm tín hiệu xác nhận dòng tiền trước khi giải ngân lớn.",
      keyReason: "Chỉ báo RSI & EMA đồng thuận hỗ trợ xu hướng tăng trung hạn.",
      recommendedAction: "DCA vùng entry, chia chốt lời tại TP1 & TP2.",
    },
  };

  const futureData = scanResult?.future || {
    position: isPositive ? "LONG" : "SHORT",
    positionLabel: isPositive ? "LONG" : "SHORT",
    recommendedLeverage: "3x - 5x (An Toàn)",
    capitalRiskPercent: "3%",
    winRatePercent: 65,
    overallScore: 8.5,
    riskRewardRatio: "1 : 3",
    entryZone: `$${(currentCoinPrice * 0.985).toLocaleString("en-US", { maximumFractionDigits: 4 })} - $${currentCoinPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice1: `$${(currentCoinPrice * 1.058).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice2: `$${(currentCoinPrice * 1.134).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice3: `$${(currentCoinPrice * 1.248).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    stopLoss: `$${(currentCoinPrice * 0.945).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    estLiquidationPrice: `$${(currentCoinPrice * 0.82).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    metrics: {
      longShortRatio: {
        longPercent: 62,
        shortPercent: 38,
        ratioText: "1.63",
        sentiment: "Bullish",
      },
      fundingRate: {
        rate: "+0.016%",
        status: "Longs trả phí cho Shorts",
      },
      openInterest: "Tăng 18%",
      liquidationHeatmap: {
        shortLiquidationPool: `$${(currentCoinPrice * 1.04).toFixed(1)} - $${(currentCoinPrice * 1.07).toFixed(1)}`,
        longLiquidationPool: `$${(currentCoinPrice * 0.93).toFixed(1)} - $${(currentCoinPrice * 0.96).toFixed(1)}`,
        stopHuntRisk: "Thấp",
      },
      volatilityATR: "12.4",
    },
    riskManagementRules: [
      "Quản lý vốn tối đa 2-3% NAV trên mỗi vị thế.",
      "Luôn cài Stoploss trước khi vào lệnh, dời SL về Entry khi đạt TP1.",
      "Đòn bẩy khuyến nghị không vượt quá 5x trong giai đoạn biến động mạnh.",
    ],
    finalVerdict: {
      action: isPositive ? "NÊN LONG" : "QUAN SÁT",
      actionType: isPositive ? "LONG" : "WAIT",
      summaryText: isPositive
        ? "Cấu trúc thị trường futures cho thấy áp lực mua mạnh và tỷ lệ long vượt trội. Ưu tiên canh các nhịp điều chỉnh để vào lệnh theo xu hướng."
        : "Lực bán ngắn hạn đang chiếm ưu thế nhẹ. Thận trọng với các bẫy quét thanh lý hai đầu.",
      keyReason: "Tỷ lệ Long/Short 62% kết hợp Funding Rate dương nhẹ và Open Interest tăng trưởng vững chắc.",
      recommendedAction: "Vào vị thế Long theo vùng Entry, đặt SL bảo toàn vốn.",
    },
  };

  return (
    <div className="space-y-5 bg-[#090b14] min-h-screen text-slate-100 p-2 sm:p-4 rounded-3xl">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0f1225] border border-indigo-950/80 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shrink-0">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                AI Crypto Scanner 2.0
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Spot & Phái Sinh
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Phân tích đa chiều: Tín hiệu Mua/Bán Spot, Vùng thanh khoản Order Block, Tỷ lệ Long/Short & Bản đồ Thanh lý Futures
            </p>
          </div>
        </div>

        {/* User Account / Role Pill Badge */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <div className="flex items-center gap-3 bg-[#141830] px-3.5 py-2 rounded-2xl border border-indigo-900/40">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              {role === "ADMIN" ? "👑" : "👤"}
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{isUnlimited ? "Không giới hạn" : `Còn ${remainingScans}/${scansLimit} lượt`}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {role === "ADMIN" ? "+ ADMIN" : role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Đã kích hoạt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Coins List) & Right Column (Analysis & Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT COLUMN: COIN WATCHLIST & SELECTOR (4 Cols) ================= */}
        <div className="lg:col-span-4 bg-[#0f1225] border border-indigo-950/80 rounded-2xl p-4 space-y-3.5 shadow-xl">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã coin (BTC, ETH, SOL...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-[#141830] border border-indigo-900/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
            <SlidersHorizontal className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" />
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Tất cả ({cryptos.length})
            </button>
            <button
              onClick={() => setActiveFilter("gainers")}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "gainers"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Top Gainer
            </button>
            <button
              onClick={() => setActiveFilter("losers")}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "losers"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Top Loser
            </button>
            <button
              onClick={() => setActiveFilter("watchlist")}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "watchlist"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Watchlist +
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-indigo-950/60">
            <span className="col-span-1">#</span>
            <span className="col-span-5 flex items-center gap-1">Coin ▾</span>
            <span className="col-span-3 text-right">Giá (USD)</span>
            <span className="col-span-3 text-right">24h %</span>
          </div>

          {/* Coins List Table Body */}
          <div className="space-y-1 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
            {filteredCoins.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Không tìm thấy coin phù hợp
              </div>
            ) : (
              filteredCoins.map((coin, index) => {
                const isSelected = selectedCoin?.id === coin.id;
                const change = coin.price_change_percentage_24h ?? 0;
                const isGain = change >= 0;
                const isStarred = watchlist.includes(coin.symbol.toUpperCase());

                return (
                  <div
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin)}
                    className={`grid grid-cols-12 items-center px-2 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#191f42] border border-indigo-500/40 shadow-inner"
                        : "hover:bg-[#141830]/80 border border-transparent"
                    }`}
                  >
                    {/* Index */}
                    <span className="col-span-1 text-[11px] font-mono text-slate-500">
                      {index + 1}
                    </span>

                    {/* Coin Icon & Info */}
                    <div className="col-span-5 flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-5 h-5 rounded-full shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-xs text-white leading-tight">
                          {coin.symbol.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate leading-tight">
                          {coin.name}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 text-right font-mono text-xs font-semibold text-white">
                      ${coin.current_price?.toLocaleString("en-US", {
                        maximumFractionDigits: coin.current_price < 1 ? 4 : 2,
                      })}
                    </div>

                    {/* 24h Change & Star */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isGain ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isGain ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                      </span>
                      <button
                        onClick={(e) => toggleWatchlist(coin.symbol, e)}
                        className="text-slate-600 hover:text-amber-400 transition"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isStarred ? "text-amber-400 fill-amber-400" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-indigo-950/80 px-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-slate-400 text-[11px]">Tổng số coin theo dõi</span>
              <span className="font-mono font-bold text-white text-xs">
                {cryptos.length}
              </span>
            </div>
            <button
              onClick={() => setActiveFilter("watchlist")}
              className="px-3 py-1 rounded-xl bg-[#141830] hover:bg-[#1a2040] text-indigo-300 text-xs font-semibold border border-indigo-900/50 transition cursor-pointer"
            >
              Quản lý
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MAIN ANALYSIS ENGINE (8 Cols) ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Coin Header Card with Sparkline & Scan Button */}
          {selectedCoin && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f1225] border border-indigo-950/80 shadow-xl">
              {/* Coin identity & price */}
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedCoin.image}
                  alt={selectedCoin.name}
                  className="w-11 h-11 rounded-full border border-indigo-800/40 p-0.5 bg-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {selectedCoin.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-700/40 uppercase">
                      {selectedCoin.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono">
                      ${selectedCoin.current_price?.toLocaleString("en-US", {
                        maximumFractionDigits: selectedCoin.current_price < 1 ? 4 : 2,
                      })}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? `+${currentCoinChange.toFixed(2)}%` : `${currentCoinChange.toFixed(2)}%`} (24h)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sparkline Graphic Preview */}
              <div className="hidden md:flex items-center h-9 w-28 px-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                  <path
                    d={
                      isPositive
                        ? "M0,25 Q15,22 30,18 T60,12 T85,8 T100,2"
                        : "M0,5 Q15,10 30,14 T60,20 T85,24 T100,28"
                    }
                    fill="none"
                    stroke={isPositive ? "#10b981" : "#f43f5e"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Timeframe selector & Trigger Scan button */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center bg-[#141830] p-1 rounded-xl border border-indigo-900/50 text-xs">
                  <button
                    onClick={() => setTimeframe("short")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      timeframe === "short"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Lướt sóng
                  </button>
                  <button
                    onClick={() => setTimeframe("medium")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      timeframe === "medium"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Trung hạn
                  </button>
                  <button
                    onClick={() => setTimeframe("long")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      timeframe === "long"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Hold / DCA
                  </button>
                </div>

                <button
                  onClick={() => handleStartScan(selectedCoin)}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                  <span>{isScanning ? "Đang quét AI..." : `Quét AI ${selectedCoin.symbol.toUpperCase()}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= DUAL-STREAM SWITCHER (SPOT vs FUTURE) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Stream 1: SPOT (Nắm Giữ) */}
            <button
              onClick={() => setTradingMode("spot")}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                tradingMode === "spot"
                  ? "bg-[#131a38] border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                  : "bg-[#0f1225] border-indigo-950/80 hover:bg-[#141830] text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    tradingMode === "spot"
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-slate-600 bg-transparent"
                  }`}
                />
                <span className="font-bold text-xs sm:text-sm text-white">
                  Luồng 1: Giao Dịch SPOT (Nắm Giữ)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {spotData.signalLabel || "MUA GOM"}
              </span>
            </button>

            {/* Stream 2: FUTURE / MARGIN (Đòn Bẩy) */}
            <button
              onClick={() => setTradingMode("future")}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                tradingMode === "future"
                  ? "bg-[#131a38] border-cyan-500/50 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/30"
                  : "bg-[#0f1225] border-indigo-950/80 hover:bg-[#141830] text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    tradingMode === "future"
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-slate-600 bg-transparent"
                  }`}
                />
                <span className="font-bold text-xs sm:text-sm text-white">
                  Luồng 2: FUTURE / MARGIN (Đòn Bẩy)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {futureData.positionLabel || "LONG"}
              </span>
            </button>
          </div>

          {/* ================= DETAILED STREAM VIEW ================= */}
          {tradingMode === "future" ? (
            /* ==================== FUTURE / MARGIN STREAM VIEW ==================== */
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 px-1 pt-1">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="uppercase tracking-wider">TỔNG QUAN PHÂN TÍCH PHÁI SINH</span>
              </div>

              {/* 3 KPI Cards: Winrate, Capital Risk, Risk/Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Winrate */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Tỷ lệ Thắng (Winrate Futures)</span>
                  </div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {futureData.winRatePercent}%
                  </div>
                  <div className="w-full h-1.5 bg-[#141830] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                      style={{ width: `${futureData.winRatePercent}%` }}
                    />
                  </div>
                </div>

                {/* 2. Capital Risk */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Mức Rủi Ro Vốn (Risk per Trade)</span>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {futureData.capitalRiskPercent}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Giới hạn tối đa không cháy tài khoản
                  </div>
                </div>

                {/* 3. Risk / Reward */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>Tỷ lệ Risk / Reward (R:R Phái sinh)</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {futureData.riskRewardRatio}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tỷ lệ kỳ vọng lợi nhuận trên vốn
                  </div>
                </div>
              </div>

              {/* 4 Execution Strategy Cards: Entry, TP1, TP2/TP3, Stop Loss/Liq */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Entry Zone */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                    <Target className="w-3.5 h-3.5" />
                    <span>VÙNG ENTRY LỆNH</span>
                  </div>
                  <div className="text-base font-black text-white font-mono pt-1">
                    {futureData.entryZone}
                  </div>
                  <div className="text-[11px] text-slate-500">Vào lệnh có kỷ luật</div>
                </div>

                {/* TP1 */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>CHỐT LỜI TP1</span>
                  </div>
                  <div className="text-base font-black text-emerald-400 font-mono pt-1">
                    {futureData.targetPrice1}
                  </div>
                  <div className="text-[11px] text-slate-500">Đạt L1 về hòa vốn</div>
                </div>

                {/* TP2 / TP3 */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <Crown className="w-3.5 h-3.5" />
                    <span>CHỐT LỜI TP2 / TP3</span>
                  </div>
                  <div className="text-base font-black text-emerald-300 font-mono pt-1">
                    {futureData.targetPrice2}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {futureData.targetPrice3}
                  </div>
                </div>

                {/* Stop Loss / Liq Price */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-rose-950/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>STOP LOSS / LIQ PRICE</span>
                  </div>
                  <div className="text-base font-black text-rose-400 font-mono pt-1">
                    {futureData.stopLoss}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Giá thanh lý: {futureData.estLiquidationPrice}
                  </div>
                </div>
              </div>

              {/* 2 Wide Technical Modules: Long/Short Ratio & Liquidation Heatmap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Long/Short Ratio Module */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <BarChart2 className="w-4 h-4 text-cyan-400" />
                      <span>Tỷ lệ Long / Short Ratio (Tâm lý Phái sinh)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {futureData.metrics.longShortRatio.sentiment || "Bullish"}
                    </span>
                  </div>

                  {/* Dual color progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-emerald-400">
                        LONG: {futureData.metrics.longShortRatio.longPercent}%
                      </span>
                      <span className="text-rose-400">
                        SHORT: {futureData.metrics.longShortRatio.shortPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full flex rounded-full overflow-hidden bg-[#141830]">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${futureData.metrics.longShortRatio.longPercent}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${futureData.metrics.longShortRatio.shortPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning / Explanation Text */}
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hệ số: {futureData.metrics.longShortRatio.ratioText} Long / Short. Cảnh báo: Nếu tỷ lệ Long quá áp đảo (&gt;65%), nguy cơ bị thị trường đảo giá quét thanh lý Long (Long Squeeze) là rất cao.
                  </p>

                  {/* Bottom Submetric: Funding Rate */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-400">Funding Rate Hiện Tại:</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-emerald-400">
                        {futureData.metrics.fundingRate.rate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({futureData.metrics.fundingRate.status})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Liquidation Heatmap Module */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Bản đồ Cụm Thanh Lý (Liquidation Heatmap)</span>
                    </div>
                    <button className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <span>Xem chi tiết</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Short Liquidation Pool */}
                  <div className="p-2.5 rounded-xl bg-[#141830] border border-rose-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-300 text-[11px]">Cụm Thanh Lý Phía Short</span>
                      <span className="font-mono font-bold text-rose-400">
                        {futureData.metrics.liquidationHeatmap.shortLiquidationPool}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#090b14] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-rose-500 rounded-full" />
                    </div>
                  </div>

                  {/* Long Liquidation Pool */}
                  <div className="p-2.5 rounded-xl bg-[#141830] border border-emerald-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-300 text-[11px]">Cụm Thanh Lý Phía Long</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {futureData.metrics.liquidationHeatmap.longLiquidationPool}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#090b14] rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* Open Interest Submetric */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Hợp Đồng Mở (Open Interest):</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-cyan-300">
                        {futureData.metrics.openInterest}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ATR: {futureData.metrics.volatilityATR}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Verdict Banner (Futures) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0c2221] via-[#0f192b] to-[#0f1225] border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                      KẾT LUẬN THỜI ĐIỂM HIỆN TẠI (FUTURES & MARGIN)
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Khuyến Nghị Vị Thế Phái Sinh
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {futureData.finalVerdict.summaryText}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 tracking-wider uppercase cursor-default">
                    <TrendingUp className="w-4 h-4 text-slate-950" />
                    <span>{futureData.finalVerdict.action}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== SPOT TRADING STREAM VIEW ==================== */
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 px-1 pt-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="uppercase tracking-wider">TỔNG QUAN PHÂN TÍCH SPOT (NẮM GIỮ DÀI HẠN)</span>
              </div>

              {/* 3 KPI Cards for Spot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Winrate */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>Chỉ số Winrate Spot Kỳ Vọng</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {spotData.winRatePercent}%
                  </div>
                  <div className="w-full h-1.5 bg-[#141830] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                      style={{ width: `${spotData.winRatePercent}%` }}
                    />
                  </div>
                </div>

                {/* 2. Primary Trend */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>Xu Hướng Chính (Trend)</span>
                  </div>
                  <div className="text-base font-black text-cyan-300 pt-1">
                    {spotData.trend}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {spotData.indicators.emaTrend}
                  </div>
                </div>

                {/* 3. Risk / Reward */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Tỷ lệ Risk / Reward (R:R)</span>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {spotData.riskRewardRatio}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Được tính toán theo phân bổ DCA
                  </div>
                </div>
              </div>

              {/* 4 Spot Execution Strategy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Entry Zone */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <Target className="w-3.5 h-3.5" />
                    <span>VÙNG MUA GOM (BUY)</span>
                  </div>
                  <div className="text-base font-black text-white font-mono pt-1">
                    {spotData.entryZone}
                  </div>
                  <div className="text-[11px] text-slate-500">Chia vốn mua 3 đợt</div>
                </div>

                {/* TP1 */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>CHỐT LỜI TP1</span>
                  </div>
                  <div className="text-base font-black text-cyan-400 font-mono pt-1">
                    {spotData.targetPrice1}
                  </div>
                  <div className="text-[11px] text-slate-500">Chốt 30-40% gốc</div>
                </div>

                {/* TP2 / TP3 */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
                    <Crown className="w-3.5 h-3.5" />
                    <span>CHỐT LỜI TP2 / TP3</span>
                  </div>
                  <div className="text-base font-black text-cyan-300 font-mono pt-1">
                    {spotData.targetPrice2}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {spotData.targetPrice3}
                  </div>
                </div>

                {/* Stop Loss */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-rose-950/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>CẮT LỖ AN TOÀN (SL)</span>
                  </div>
                  <div className="text-base font-black text-rose-400 font-mono pt-1">
                    {spotData.stopLoss}
                  </div>
                  <div className="text-[11px] text-slate-500">Bảo toàn vốn danh mục</div>
                </div>
              </div>

              {/* 2 Spot Technical Modules: Order Block & Liquidity Zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Order Block & FVG */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      <span>Vùng Thanh Khoản & Khối Lệnh (Order Block)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      RSI: {spotData.indicators.rsi.value}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#141830] border border-emerald-950/40">
                      <div className="text-[11px] text-emerald-400 font-semibold">Vùng Cầu Mua (Demand Zone):</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">
                        {spotData.liquidity.highLiquidityZone}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141830] border border-rose-950/40">
                      <div className="text-[11px] text-rose-400 font-semibold">Vùng Cung Bán (Supply Zone):</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">
                        {spotData.liquidity.supplyZone}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Tín hiệu MACD:</span>
                    <span className="font-semibold text-cyan-300">{spotData.indicators.macd}</span>
                  </div>
                </div>

                {/* 2. Spot Liquidity & Volume */}
                <div className="p-4 rounded-2xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Dòng Tiền & Hỗ Trợ Kháng Cự</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      {spotData.indicators.volumeProfile}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs">
                      <span className="text-slate-400">Hỗ trợ quan trọng:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {spotData.indicators.supportResistance.support}
                      </span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs">
                      <span className="text-slate-400">Kháng cự then chốt:</span>
                      <span className="font-mono font-bold text-rose-400">
                        {spotData.indicators.supportResistance.resistance}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141830] border border-indigo-950/60 text-xs text-slate-300">
                      {spotData.strategyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Verdict Banner (Spot) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0c2221] via-[#0f192b] to-[#0f1225] border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                      KẾT LUẬN THỜI ĐIỂM HIỆN TẠI (SPOT TRADING)
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Khuyến Nghị Tích Lũy Spot
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {spotData.finalVerdict.summaryText}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 tracking-wider uppercase cursor-default">
                    <TrendingUp className="w-4 h-4 text-slate-950" />
                    <span>{spotData.finalVerdict.action}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
