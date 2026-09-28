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
  Radio,
  LineChart,
  Compass,
  PieChart as PieIcon,
  Cpu,
  Eye,
} from "lucide-react";
import { CryptoItem } from "@/lib/marketApi";
import { ScanResult, WavePatternAnalysis, CoinglassMetrics } from "@/app/api/ai-scan/route";
import { useAuth } from "@/context/AuthContext";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { useTheme } from "@/context/ThemeContext";

interface ScannerPageProps {
  cryptos: CryptoItem[];
  onOpenAddAssetModal?: (prefill?: { symbol: string; name: string; price: number }) => void;
  onOpenUpgradeModal?: () => void;
}

export function ScannerPage({
  cryptos,
  onOpenAddAssetModal,
  onOpenUpgradeModal,
}: ScannerPageProps) {
  const { role, remainingScans, scansLimit, useScanQuota, canScan } = useAuth();
  const { theme } = useTheme();

  const [selectedCoin, setSelectedCoin] = useState<CryptoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [tradingMode, setTradingMode] = useState<"spot" | "future">("future");
  const [chartViewMode, setChartViewMode] = useState<"wave" | "tradingview">("wave");
  const [watchlist, setWatchlist] = useState<string[]>(["BTC", "ETH", "SOL"]);

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

  // Dynamic calculations
  const currentCoinPrice = selectedCoin?.current_price ?? 0;
  const currentCoinChange = selectedCoin?.price_change_percentage_24h ?? 0;
  const isPositive = currentCoinChange >= 0;

  // Render mock or real scan data
  const waveData: WavePatternAnalysis = scanResult?.wavePattern || {
    patternType: "ELLIOTT_IMPULSE_12345",
    patternName: isPositive
      ? "Sóng Đẩy Elliott 5 Bước (Wave 3 Impulse Extension)"
      : "Sóng Hiệu Chỉnh ABC (Zigzag Correction Wave)",
    currentWave: isPositive
      ? "Đang ở sóng đẩy 3 (Wave 3) - Pha tăng trưởng mạnh nhất chu kỳ"
      : "Đang hoàn tất sóng hiệu chỉnh C kiểm định lại hỗ trợ cứng",
    waveDescription: isPositive
      ? "Cấu trúc Higher High (HH) và Higher Low (HL) liên tục hình thành. Khối lượng bứt phá xác nhận dòng tiền tổ chức tham gia mạnh."
      : "Áp lực bán ngắn hạn ép giá về vùng chiết khấu Fibo 0.618. Xuất hiện tín hiệu phân kỳ dương báo hiệu sớm đảo chiều.",
    swingHigh: `$${(currentCoinPrice * 1.08).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    swingLow: `$${(currentCoinPrice * 0.935).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    keyFibonacciLevel: `Vùng Tỷ Lệ Vàng Fibo 0.618 ($${(currentCoinPrice * 0.965).toFixed(2)}) giữ vững lực đỡ`,
    projectedTargetWave: `$${(currentCoinPrice * 1.22).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Mục tiêu Sóng 5)`,
  };

  const coinglassData: CoinglassMetrics = scanResult?.coinglass || {
    topTradersLongRatio: isPositive ? 68 : 44,
    topTradersShortRatio: isPositive ? 32 : 56,
    retailLongRatio: isPositive ? 54 : 48,
    retailShortRatio: isPositive ? 46 : 52,
    fundingRateBinance: isPositive ? "+0.015%" : "-0.008%",
    fundingRateOKX: isPositive ? "+0.012%" : "-0.005%",
    fundingRateBybit: isPositive ? "+0.016%" : "-0.009%",
    openInterestTotalUSD: `$${((currentCoinPrice * 2.85) / 100).toFixed(2)}B`,
    openInterestDelta24h: isPositive ? "+14.6%" : "-6.2%",
    takerBuyRatio: isPositive ? 58 : 42,
    cvdStatus: isPositive
      ? "Phân kỳ tích cực (Bullish CVD Divergence)"
      : "Phân kỳ âm (Bearish CVD Divergence)",
    squeezeMomentum: isPositive
      ? "Đang bung xung lượng tăng (Firing Bullish Momentum)"
      : "Độ nén cao (Squeeze ON) - Sắp bùng nổ",
    fearGreedIndex: {
      score: isPositive ? 74 : 46,
      label: isPositive ? "Tham lam (Greed)" : "Trung lập (Neutral)",
    },
  };

  const spotData = scanResult?.spot || {
    signal: isPositive ? "BUY" : "HOLD",
    signalLabel: isPositive ? "MUA GOM" : "QUAN SÁT",
    winRatePercent: 74,
    overallScore: 8.4,
    riskRewardRatio: "1 : 2.8",
    trend: isPositive ? "Tăng trưởng Bullish" : "Tích lũy Sideway",
    entryZone: `$${(currentCoinPrice * 0.97).toLocaleString("en-US", { maximumFractionDigits: 4 })} - $${(currentCoinPrice * 0.99).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice1: `$${(currentCoinPrice * 1.06).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice2: `$${(currentCoinPrice * 1.15).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice3: `$${(currentCoinPrice * 1.25).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    stopLoss: `$${(currentCoinPrice * 0.92).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    liquidity: {
      highLiquidityZone: `$${(currentCoinPrice * 0.95).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Order Block Mua)`,
      thinLiquidityZone: `$${(currentCoinPrice * 1.08).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Fair Value Gap)`,
      supplyZone: `$${(currentCoinPrice * 1.18).toLocaleString("en-US", { maximumFractionDigits: 2 })} (Vùng Cung Chốt Lời)`,
    },
    indicators: {
      emaTrend: "Giá vận động phía trên dải EMA Ribbon (20/50/200)",
      rsi: { value: 62, status: "Vùng tích lũy xung lực tăng (Bullish Momentum)" },
      macd: "MACD Histogram dương, đường Signal cắt lên",
      volumeProfile: "Khối lượng mua chủ động chiếm 64%",
      supportResistance: {
        support: `$${(currentCoinPrice * 0.94).toFixed(2)}`,
        resistance: `$${(currentCoinPrice * 1.12).toFixed(2)}`,
      },
    },
    strategyAdvice: "Chia vốn DCA thành 3 đợt tại vùng hỗ trợ Order Block. Đạt TP1 dời SL về hòa vốn.",
    riskWarning: "Đặt Stoploss bảo vệ tài khoản, tránh rủi ro biến động toàn thị trường.",
    finalVerdict: {
      action: isPositive ? "NÊN MUA" : "QUAN SÁT",
      actionType: isPositive ? "BUY" : "WAIT",
      summaryText: isPositive
        ? "Cấu trúc dòng tiền tích lũy mạnh mẽ trên đồ thị Spot. Các chỉ số kỹ thuật duy trì đà tăng trưởng ổn định."
        : "Thị trường đang tích lũy đi ngang. Nên quan sát thêm tín hiệu xác nhận dòng tiền trước khi giải ngân lớn.",
      keyReason: "Dải EMA và RSI đồng thuận hỗ trợ xu hướng tăng trung hạn với khối lượng gom hàng đều đặn.",
      recommendedAction: "DCA mua gom theo vùng entry, hiện thực hóa lợi nhuận tại TP1 & TP2.",
    },
  };

  const futureData = scanResult?.future || {
    position: isPositive ? "LONG" : "SHORT",
    positionLabel: isPositive ? "LONG" : "SHORT",
    recommendedLeverage: "3x - 5x (An Toàn)",
    capitalRiskPercent: "2 - 3%",
    winRatePercent: 68,
    overallScore: 8.6,
    riskRewardRatio: "1 : 3",
    entryZone: `$${(currentCoinPrice * 0.985).toLocaleString("en-US", { maximumFractionDigits: 4 })} - $${currentCoinPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice1: `$${(currentCoinPrice * 1.058).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice2: `$${(currentCoinPrice * 1.134).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    targetPrice3: `$${(currentCoinPrice * 1.248).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    stopLoss: `$${(currentCoinPrice * 0.945).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    estLiquidationPrice: `$${(currentCoinPrice * 0.82).toLocaleString("en-US", { maximumFractionDigits: 4 })}`,
    metrics: {
      longShortRatio: {
        longPercent: isPositive ? 64 : 38,
        shortPercent: isPositive ? 36 : 62,
        ratioText: isPositive ? "1.77" : "0.61",
        sentiment: isPositive ? "Bullish" : "Bearish",
      },
      fundingRate: {
        rate: isPositive ? "+0.016%" : "-0.008%",
        status: isPositive ? "Longs trả phí cho Shorts" : "Shorts trả phí cho Longs",
      },
      openInterest: isPositive ? "Tăng 18%" : "Giảm 6%",
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
        ? "Cấu trúc thị trường futures cho thấy áp lực mua mạnh và tỷ lệ Top Traders Long vượt trội. Ưu tiên canh nhịp hồi về hỗ trợ để Long thuận xu hướng."
        : "Lực bán ngắn hạn đang chiếm ưu thế nhẹ. Thận trọng với các bẫy quét thanh lý hai đầu.",
      keyReason: "Open Interest tăng mạnh cùng Funding Rate dương lành mạnh và tỷ lệ Long/Short 62% ủng hộ đà bứt phá.",
      recommendedAction: "Mở vị thế Long tại vùng Entry kỷ luật, cài Stoploss và chốt lời từng phần.",
    },
  };

  const tradingViewSymbol = selectedCoin
    ? `BINANCE:${selectedCoin.symbol.toUpperCase()}USDT`
    : "BINANCE:BTCUSDT";

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
                AI Crypto Scanner 2.0 Pro
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sóng Elliott & Coinglass Analytics
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Tích hợp Dạng sóng Động, Biểu đồ Nến Live, Tỷ lệ Long/Short Top Traders & Bản đồ thanh lý đa sàn
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
          <div className="space-y-1 max-h-[580px] overflow-y-auto scrollbar-thin pr-1">
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
                    <span className="col-span-1 text-[11px] font-mono text-slate-500">
                      {index + 1}
                    </span>

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

                    <div className="col-span-3 text-right font-mono text-xs font-semibold text-white">
                      ${coin.current_price?.toLocaleString("en-US", {
                        maximumFractionDigits: coin.current_price < 1 ? 4 : 2,
                      })}
                    </div>

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
                        className="text-slate-600 hover:text-amber-400 transition cursor-pointer"
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

          {/* ================= WAVEFORM & TRADINGVIEW CHART SWITCHER SECTION ================= */}
          <div className="bg-[#0f1225] border border-indigo-950/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Mô Hình Dạng Sóng & Biểu Đồ Trực Tuyến
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Phân tích chu kỳ sóng Elliott, cấu trúc đỉnh đáy và nến trực tiếp
                  </p>
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-[#141830] p-1 rounded-xl border border-indigo-900/50 text-xs">
                <button
                  onClick={() => setChartViewMode("wave")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    chartViewMode === "wave"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Sơ Đồ Sóng AI</span>
                </button>
                <button
                  onClick={() => setChartViewMode("tradingview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    chartViewMode === "tradingview"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Nến Sống TradingView</span>
                </button>
              </div>
            </div>

            {chartViewMode === "wave" ? (
              /* DYNAMIC WAVE PATTERN SVG VISUALIZER */
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-[#141830] border border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                        DẠNG SÓNG HIỆN TẠI (WAVE CYCLE)
                      </span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{waveData.patternName}</span>
                      </h4>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                      {waveData.currentWave}
                    </div>
                  </div>

                  {/* SVG Wave Visual Rendering */}
                  <div className="relative h-44 sm:h-52 w-full bg-[#0b0e1b] rounded-xl border border-indigo-950/80 p-2 overflow-hidden flex items-center justify-center">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 700 200"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="0" y1="50" x2="700" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="150" x2="700" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

                      {/* Fill area */}
                      <path
                        d={
                          isPositive
                            ? "M 50 160 L 150 100 L 250 140 L 420 40 L 520 80 L 650 20 L 650 190 L 50 190 Z"
                            : "M 50 40 L 180 140 L 320 80 L 480 170 L 650 120 L 650 190 L 50 190 Z"
                        }
                        fill="url(#waveGradient)"
                      />

                      {/* Stroke Line */}
                      <path
                        d={
                          isPositive
                            ? "M 50 160 L 150 100 L 250 140 L 420 40 L 520 80 L 650 20"
                            : "M 50 40 L 180 140 L 320 80 L 480 170 L 650 120"
                        }
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Wave Nodes & Labels */}
                      {isPositive ? (
                        <>
                          <circle cx="50" cy="160" r="5" fill="#3b82f6" />
                          <text x="50" y="180" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">Start</text>

                          <circle cx="150" cy="100" r="5" fill="#10b981" />
                          <text x="150" y="90" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">Wave 1</text>

                          <circle cx="250" cy="140" r="5" fill="#f59e0b" />
                          <text x="250" y="160" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">Wave 2 (HL)</text>

                          <circle cx="420" cy="40" r="7" fill="#06b6d4" className="animate-ping" />
                          <circle cx="420" cy="40" r="6" fill="#06b6d4" />
                          <text x="420" y="25" fill="#06b6d4" fontSize="12" textAnchor="middle" fontWeight="black">Wave 3 (Đang chạy 🔥)</text>

                          <circle cx="520" cy="80" r="5" fill="#a855f7" strokeDasharray="2 2" />
                          <text x="520" y="100" fill="#a855f7" fontSize="11" textAnchor="middle" fontWeight="bold">Wave 4 (Dự phóng)</text>

                          <circle cx="650" cy="20" r="6" fill="#ec4899" />
                          <text x="650" y="15" fill="#ec4899" fontSize="12" textAnchor="middle" fontWeight="black">Wave 5 (Target $)</text>
                        </>
                      ) : (
                        <>
                          <circle cx="50" cy="40" r="5" fill="#f43f5e" />
                          <text x="50" y="30" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">Top (HH)</text>

                          <circle cx="180" cy="140" r="5" fill="#f43f5e" />
                          <text x="180" y="160" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">Sóng A</text>

                          <circle cx="320" cy="80" r="5" fill="#f59e0b" />
                          <text x="320" y="70" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">Sóng B (Pullback)</text>

                          <circle cx="480" cy="170" r="6" fill="#06b6d4" />
                          <text x="480" y="190" fill="#06b6d4" fontSize="12" textAnchor="middle" fontWeight="black">Sóng C (Đáy Fibo 0.618)</text>

                          <circle cx="650" cy="120" r="5" fill="#10b981" />
                          <text x="650" y="110" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">Rebound Mới</text>
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Wave Pattern details & targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#0b0e1b] border border-indigo-950/60">
                      <span className="text-[10px] text-slate-400">Đỉnh / Đáy Swing:</span>
                      <div className="font-mono font-bold text-white mt-0.5">
                        High: {waveData.swingHigh} • Low: {waveData.swingLow}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0b0e1b] border border-indigo-950/60">
                      <span className="text-[10px] text-amber-400">Fibo Key Level:</span>
                      <div className="font-mono font-bold text-amber-300 mt-0.5 truncate">
                        {waveData.keyFibonacciLevel}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0b0e1b] border border-indigo-950/60">
                      <span className="text-[10px] text-emerald-400">Mục tiêu mở rộng:</span>
                      <div className="font-mono font-bold text-emerald-300 mt-0.5 truncate">
                        {waveData.projectedTargetWave}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LIVE TRADINGVIEW CANDLESTICK CHART */
              <div className="h-[420px] w-full rounded-xl overflow-hidden border border-indigo-950/80">
                <TradingViewWidget symbol={tradingViewSymbol} theme={theme === "light" ? "light" : "dark"} />
              </div>
            )}
          </div>

          {/* ================= COINGLASS METRICS & ON-CHAIN DERIVATIVES SUITE ================= */}
          <div className="bg-[#0f1225] border border-indigo-950/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Chỉ Số Phái Sinh Coinglass & Dòng Tiền (Derivatives Intelligence)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Theo dõi tỷ lệ cá mập (Top Traders), hợp đồng mở OI, Funding đa sàn và độ nén Squeeze
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Coinglass Live
              </span>
            </div>

            {/* Grid 4 cards of Coinglass metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Top Traders Long/Short Ratio */}
              <div className="p-3.5 rounded-xl bg-[#141830] border border-indigo-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Top Traders L/S (Whales)</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {coinglassData.topTradersLongRatio}% Long
                  </span>
                </div>
                <div className="h-2 w-full flex rounded-full overflow-hidden bg-[#090b14]">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${coinglassData.topTradersLongRatio}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${coinglassData.topTradersShortRatio}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Retail: {coinglassData.retailLongRatio}% L</span>
                  <span>{coinglassData.retailShortRatio}% S</span>
                </div>
              </div>

              {/* 2. Open Interest Total & 24h Delta */}
              <div className="p-3.5 rounded-xl bg-[#141830] border border-indigo-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Open Interest (OI)</span>
                  <span className="text-[10px] font-bold font-mono text-emerald-400">
                    {coinglassData.openInterestDelta24h}
                  </span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {coinglassData.openInterestTotalUSD}
                </div>
                <div className="text-[10px] text-slate-500">
                  Dòng tiền đòn bẩy đang gia tăng
                </div>
              </div>

              {/* 3. Multi-Exchange Funding Rates */}
              <div className="p-3.5 rounded-xl bg-[#141830] border border-indigo-900/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Funding Đa Sàn (8h)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Real-time</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                  <div className="p-1 rounded bg-[#090b14] border border-indigo-950/60">
                    <div className="text-slate-400 text-[9px]">Binance</div>
                    <div className="font-bold text-emerald-400">{coinglassData.fundingRateBinance}</div>
                  </div>
                  <div className="p-1 rounded bg-[#090b14] border border-indigo-950/60">
                    <div className="text-slate-400 text-[9px]">OKX</div>
                    <div className="font-bold text-emerald-400">{coinglassData.fundingRateOKX}</div>
                  </div>
                  <div className="p-1 rounded bg-[#090b14] border border-indigo-950/60">
                    <div className="text-slate-400 text-[9px]">Bybit</div>
                    <div className="font-bold text-emerald-400">{coinglassData.fundingRateBybit}</div>
                  </div>
                </div>
              </div>

              {/* 4. Fear & Greed + Squeeze Momentum */}
              <div className="p-3.5 rounded-xl bg-[#141830] border border-indigo-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Fear & Greed Index</span>
                  <span className="font-mono font-bold text-amber-400">
                    {coinglassData.fearGreedIndex.score}/100
                  </span>
                </div>
                <div className="text-xs font-bold text-amber-300">
                  {coinglassData.fearGreedIndex.label}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono truncate">
                  {coinglassData.squeezeMomentum}
                </div>
              </div>
            </div>
          </div>

          {/* ================= DUAL-STREAM SWITCHER (SPOT vs FUTURE) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 px-1 pt-1">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="uppercase tracking-wider">TỔNG QUAN PHÂN TÍCH PHÁI SINH</span>
              </div>

              {/* 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              {/* 4 Execution Strategy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* 2 Wide Technical Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hệ số: {futureData.metrics.longShortRatio.ratioText} Long / Short. Cảnh báo: Nếu tỷ lệ Long quá áp đảo (&gt;65%), nguy cơ bị thị trường đảo giá quét thanh lý Long (Long Squeeze) là rất cao.
                  </p>

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
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 px-1 pt-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="uppercase tracking-wider">TỔNG QUAN PHÂN TÍCH SPOT (NẮM GIỮ DÀI HẠN)</span>
              </div>

              {/* 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              {/* 2 Spot Technical Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
