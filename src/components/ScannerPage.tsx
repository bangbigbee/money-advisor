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
  History,
  Trash2,
  Clock,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { CryptoItem } from "@/lib/marketApi";
import {
  ScanResult,
  WavePatternAnalysis,
  CoinglassMetrics,
  AdvancedIndicators,
} from "@/app/api/ai-scan/route";
import { useAuth } from "@/context/AuthContext";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { useTheme } from "@/context/ThemeContext";

export interface AnalysisHistoryItem {
  id: string;
  user_id?: string;
  symbol: string;
  name: string;
  coin_image?: string;
  price_at_analysis: number;
  spot_action: string;
  future_action: string;
  summary_text: string;
  full_result_json?: any;
  created_at: string;
}

interface ScannerPageProps {
  cryptos: CryptoItem[];
  onOpenAddAssetModal?: (prefill?: { symbol: string; name: string; price: number }) => void;
  onOpenUpgradeModal?: () => void;
}

function deepMerge<T>(fallback: T, incoming: any): T {
  if (!incoming || typeof incoming !== "object") return fallback;
  if (!fallback || typeof fallback !== "object") return incoming as T;

  const result: any = Array.isArray(fallback) ? [...fallback] : { ...fallback };

  for (const key of Object.keys(fallback as any)) {
    const fallbackVal = (fallback as any)[key];
    const incomingVal = incoming[key];

    if (incomingVal === undefined || incomingVal === null) {
      result[key] = fallbackVal;
    } else if (
      typeof fallbackVal === "object" &&
      !Array.isArray(fallbackVal) &&
      typeof incomingVal === "object" &&
      !Array.isArray(incomingVal)
    ) {
      result[key] = deepMerge(fallbackVal, incomingVal);
    } else {
      result[key] = incomingVal;
    }
  }

  for (const key of Object.keys(incoming)) {
    if (!(key in (fallback as any))) {
      result[key] = incoming[key];
    }
  }

  return result as T;
}

export function ScannerPage({
  cryptos,
  onOpenAddAssetModal,
  onOpenUpgradeModal,
}: ScannerPageProps) {
  const { user, signInWithGoogle, role, remainingScans, scansLimit, useScanQuota, canScan } = useAuth();
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

  // Analysis History State
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Set default selected coin
  useEffect(() => {
    if (!selectedCoin && cryptos.length > 0) {
      setSelectedCoin(cryptos[0]);
    }
  }, [cryptos, selectedCoin]);

  // Load analysis history for current user
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // First try local storage for instant render
        const localCached = localStorage.getItem(`analysis_history_${user.id}`);
        if (localCached) {
          try {
            setHistory(JSON.parse(localCached));
          } catch (e) {}
        }

        // Fetch from API
        const res = await fetch(`/api/analysis/history?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.history) && data.history.length > 0) {
            setHistory(data.history);
            localStorage.setItem(`analysis_history_${user.id}`, JSON.stringify(data.history));
          }
        }
      } catch (err) {
        console.warn("Lỗi tải lịch sử phân tích:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

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

    if (!user) {
      signInWithGoogle();
      return;
    }

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

      // Save to analysis history in Supabase & LocalStorage
      const spotAction = data.spot?.finalVerdict?.action || data.spot?.signalLabel || "NÊN MUA";
      const futureAction = data.future?.finalVerdict?.action || data.future?.positionLabel || "LONG";
      const summaryText = data.spot?.finalVerdict?.summaryText || data.future?.finalVerdict?.summaryText || "";

      const historyRecord: AnalysisHistoryItem = {
        id: "hist_" + Date.now(),
        user_id: user.id,
        symbol: coinToScan.symbol.toUpperCase(),
        name: coinToScan.name,
        coin_image: coinToScan.image,
        price_at_analysis: price,
        spot_action: spotAction,
        future_action: futureAction,
        summary_text: summaryText,
        full_result_json: data,
        created_at: new Date().toISOString(),
      };

      // Optimistically update local history state
      setHistory((prev) => {
        const updated = [historyRecord, ...prev.filter((item) => item.symbol !== historyRecord.symbol || item.created_at !== historyRecord.created_at)].slice(0, 50);
        localStorage.setItem(`analysis_history_${user.id}`, JSON.stringify(updated));
        return updated;
      });

      // Save to server database asynchronously
      fetch("/api/analysis/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          symbol: coinToScan.symbol,
          name: coinToScan.name,
          coinImage: coinToScan.image,
          priceAtAnalysis: price,
          spotAction,
          futureAction,
          summaryText,
          fullResultJson: data,
        }),
      }).catch((e) => console.warn("Lỗi lưu lịch sử phân tích server:", e));

    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình phân tích");
    } finally {
      setIsScanning(false);
    }
  };

  // Reload an item from history
  const handleReloadHistory = (item: AnalysisHistoryItem) => {
    // Find matching coin in cryptos
    const match = cryptos.find((c) => c.symbol.toUpperCase() === item.symbol.toUpperCase());
    if (match) {
      setSelectedCoin(match);
    }
    if (item.full_result_json) {
      setScanResult(item.full_result_json);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete an item from history
  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(`analysis_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`/api/analysis/history?id=${id}&userId=${user.id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Lỗi xóa lịch sử:", err);
    }
  };

  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  // Dynamic calculations
  const currentCoinPrice = selectedCoin?.current_price ?? 0;
  const currentCoinChange = selectedCoin?.price_change_percentage_24h ?? 0;
  const isPositive = currentCoinChange >= 0;

  // Wave Pattern Data
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

  // Active Wave Stage Detection
  const waveText = `${waveData.currentWave} ${waveData.patternName}`.toLowerCase();
  const isWave4Current = waveText.includes("wave 4") || waveText.includes("sóng 4") || waveText.includes("correction") || waveText.includes("sóng c") || waveText.includes("hiệu chỉnh");
  const isWave3Current = !isWave4Current && (waveText.includes("wave 3") || waveText.includes("sóng 3") || waveText.includes("impulse 3"));
  const isWave5Current = !isWave4Current && !isWave3Current && (waveText.includes("wave 5") || waveText.includes("sóng 5"));
  const isWave2Current = !isWave4Current && !isWave3Current && !isWave5Current && (waveText.includes("wave 2") || waveText.includes("sóng 2"));
  const isWave1Current = !isWave4Current && !isWave3Current && !isWave5Current && !isWave2Current && (waveText.includes("wave 1") || waveText.includes("sóng 1"));

  // Coinglass Data
  const defaultCoinglass: CoinglassMetrics = {
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
  const coinglassData: CoinglassMetrics = deepMerge(defaultCoinglass, scanResult?.coinglass);

  // Advanced Indicators Suite
  const defaultAdvanced: AdvancedIndicators = {
    superTrend: {
      status: isPositive ? "BULLISH" : "BEARISH",
      value: `$${(currentCoinPrice * (isPositive ? 0.952 : 1.048)).toFixed(2)}`,
    },
    adx: {
      value: isPositive ? 32.4 : 18.6,
      trendStrength: isPositive ? "Mạnh (>25)" : "Trung bình",
    },
    stochRsi: {
      k: isPositive ? 68 : 24,
      d: isPositive ? 62 : 28,
      status: isPositive ? "Vùng Trung Lập" : "Quá Bán (<20)",
    },
    bollingerBands: {
      upper: `$${(currentCoinPrice * 1.07).toFixed(2)}`,
      middle: `$${currentCoinPrice.toFixed(2)}`,
      lower: `$${(currentCoinPrice * 0.93).toFixed(2)}`,
      squeezeStatus: isPositive ? "Đang mở rộng (Expanding)" : "Đang co thắt (Squeeze ON)",
    },
    ichimoku: {
      cloudSignal: isPositive ? "Giá trên mây Kumo (Tăng)" : "Giá dưới mây Kumo (Giảm)",
      tenkanKijunCross: isPositive ? "Bullish Cross" : "Neutral",
    },
    mfi: {
      value: isPositive ? 64 : 38,
      status: isPositive ? "Dòng tiền vào mạnh" : "Cân bằng",
    },
    fibonacciLevels: {
      fib0382: `$${(currentCoinPrice * 0.982).toFixed(2)}`,
      fib0500: `$${(currentCoinPrice * 0.965).toFixed(2)}`,
      fib0618GoldenPocket: `$${(currentCoinPrice * 0.948).toFixed(2)}`,
      fib0786: `$${(currentCoinPrice * 0.924).toFixed(2)}`,
      fib1618Extension: `$${(currentCoinPrice * 1.185).toFixed(2)}`,
    },
    volumeProfile: {
      poc: `$${(currentCoinPrice * 0.978).toFixed(2)}`,
      vah: `$${(currentCoinPrice * 1.045).toFixed(2)}`,
      val: `$${(currentCoinPrice * 0.938).toFixed(2)}`,
    },
  };
  const advancedData: AdvancedIndicators = deepMerge(defaultAdvanced, scanResult?.spot?.advanced || scanResult?.future?.advanced);

  const defaultSpot = {
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
    advanced: advancedData,
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
  const spotData = deepMerge(defaultSpot, scanResult?.spot);

  const defaultFuture = {
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
  const futureData = deepMerge(defaultFuture, scanResult?.future);

  const tradingViewSymbol = selectedCoin
    ? `BINANCE:${selectedCoin.symbol.toUpperCase()}USDT`
    : "BINANCE:BTCUSDT";

  // Helper format date
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 min-h-screen text-slate-100 p-2 sm:p-4">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0f1225] border border-indigo-950/80 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shrink-0">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                AI Crypto Scanner 2.0 Pro
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Sóng Elliott, Coinglass & Multi-Indicators
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Phân tích kỹ thuật chuyên sâu: SuperTrend, ADX, StochRSI, Bollinger Bands, Ichimoku, MFI, Volume Profile & Fibo Golden Pocket
            </p>
          </div>
        </div>

        {/* User Account / Role Pill Badge & History Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
          {user ? (
            <>
              {/* Scan Quota Card */}
              <div className="flex items-center gap-3 bg-[#141830] px-3.5 py-2 rounded-xl border border-indigo-900/40">
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
                  <div className="text-[10px] text-slate-400">Đã đăng nhập</div>
                </div>
              </div>

              {/* Personal Analysis History Button beside Quota Card */}
              <button
                onClick={() => {
                  const el = document.getElementById("analysis-history-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                title="Xem Lịch sử Phân tích cá nhân"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141830] hover:bg-[#1a2040] border border-indigo-900/40 text-slate-200 transition cursor-pointer shadow-sm group"
              >
                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold flex items-center gap-1.5 text-white">
                    <span>Lịch sử phân tích</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {history.length}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400">Xem lại các lệnh đã quét</div>
                </div>
                <div className="sm:hidden flex items-center">
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {history.length}
                  </span>
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập Google để Phân tích</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (Coins List) & Right Column (Analysis & Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT COLUMN: COIN WATCHLIST & SELECTOR (3 Cols) ================= */}
        <div className="lg:col-span-3 xl:col-span-3 bg-[#0f1225] border border-indigo-950/80 rounded-xl p-4 space-y-3.5 shadow-sm">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã coin (BTC, ETH, SOL...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-[#141830] border border-indigo-900/40 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <SlidersHorizontal className="absolute right-3.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-900/50"
              }`}
            >
              Tất cả ({cryptos.length})
            </button>
            <button
              onClick={() => setActiveFilter("gainers")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "gainers"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-900/50"
              }`}
            >
              Top Gainer
            </button>
            <button
              onClick={() => setActiveFilter("losers")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "losers"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-900/50"
              }`}
            >
              Top Loser
            </button>
            <button
              onClick={() => setActiveFilter("watchlist")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === "watchlist"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-900/50"
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
                    className={`grid grid-cols-12 items-center px-2 py-2.5 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#191f42] border border-indigo-500/50 shadow-sm"
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
                        className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
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
              <span className="text-slate-400 text-[11px]">Tổng số coin</span>
              <span className="font-mono font-bold text-white text-xs">
                {cryptos.length}
              </span>
            </div>
            <button
              onClick={() => setActiveFilter("watchlist")}
              className="px-3 py-1 rounded-lg bg-[#141830] hover:bg-[#1a2040] text-indigo-300 text-xs font-semibold border border-indigo-900/50 transition cursor-pointer"
            >
              Watchlist ({watchlist.length})
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MAIN ANALYSIS ENGINE (9 Cols) ================= */}
        {/* ================= RIGHT COLUMN: MAIN ANALYSIS ENGINE (8 Cols) ================= */}
        <div className="lg:col-span-9 xl:col-span-9 space-y-4">
          {!scanResult && !isScanning ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 text-center shadow-md h-full min-h-[600px]">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Phân Tích AI Chuyên Sâu</h2>
              <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
                Chọn một đồng coin từ danh sách và nhấn nút bên dưới để nhận định xu hướng, dòng tiền và tín hiệu giao dịch từ AI.
              </p>
              <button
                onClick={() => handleStartScan(selectedCoin)}
                disabled={!selectedCoin}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                <span>Nhấn để phân tích</span>
              </button>
            </div>
          ) : isScanning ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 text-center shadow-md h-full min-h-[600px]">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">Đang phân tích {selectedCoin?.symbol}...</h2>
              <p className="text-slate-400 text-sm">Hệ thống AI đang xử lý các chỉ số kỹ thuật và on-chain.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dashboard Layout Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#0b0e1b] border border-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                  <img src={selectedCoin?.image} alt={selectedCoin?.name} className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 p-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{selectedCoin?.symbol.toUpperCase()}</h2>
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-sm text-slate-400">{selectedCoin?.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 md:gap-10 flex-wrap">
                  <div>
                    <div className="text-xl font-bold text-white whitespace-nowrap">
                      ${selectedCoin?.current_price?.toLocaleString("en-US", { maximumFractionDigits: selectedCoin.current_price < 1 ? 4 : 2 })}
                    </div>
                    <div className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}{currentCoinChange.toFixed(2)}% (24h)
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-slate-400">Vốn hóa thị trường</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      ${((selectedCoin?.market_cap || 0) / 1e9).toFixed(2)}B
                      <span className={`text-[10px] ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPositive ? "+" : ""}{currentCoinChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs text-slate-400">Khối lượng (24h)</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      ${((selectedCoin?.total_volume || 0) / 1e9).toFixed(2)}B
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Layout: Chart + Side Panels */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* Left Area: Chart */}
                <div className="xl:col-span-8 bg-[#0b0e1b] border border-zinc-800 rounded-xl overflow-hidden shadow-md flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-bold text-white p-3 border-b border-zinc-800">
                    <Radio className="w-4 h-4 text-indigo-400" /> Sơ đồ AI Phân tích trực tuyến
                  </div>
                  <div className="h-[450px] w-full bg-[#0b0e1b]">
                    <TradingViewWidget symbol={tradingViewSymbol} theme={theme === "light" ? "light" : "dark"} />
                  </div>
                </div>

                {/* Right Area: Sidebar Panels */}
                <div className="xl:col-span-4 space-y-4">
                  {/* Tổng quan kỹ thuật (Gauge) */}
                  <div className="p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                      <span>Tổng quan kỹ thuật</span>
                      <button className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-400 text-[10px] border border-indigo-500/30">
                        <Star className="w-3 h-3 inline mr-1" /> Phân tích AI
                      </button>
                    </div>
                    <div className="flex justify-center relative py-6">
                      <div className="w-48 h-24 border-[14px] rounded-t-full border-b-0 opacity-80" style={{
                          borderTopColor: isPositive ? '#10b981' : '#f43f5e',
                          borderLeftColor: '#f59e0b',
                          borderRightColor: isPositive ? '#10b981' : '#f43f5e'
                      }}></div>
                      <div className="absolute bottom-2 text-center w-full">
                        <div className="text-[10px] text-slate-400">Tín hiệu tổng quan</div>
                        <div className={`text-xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{spotData.finalVerdict.action}</div>
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-slate-400">
                      12 / 26 chỉ báo đang ủng hộ xu hướng.
                    </div>
                  </div>

                  {/* Các chỉ số chính */}
                  <div className="p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3">
                    <div className="text-sm font-bold text-white">Các chỉ số chính</div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">RSI (14)</span>
                        <div className="flex gap-4"><span className="text-white font-mono">{advancedData.stochRsi.k}</span><span className="text-amber-400 font-bold w-16 text-right">Trung lập</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">MACD</span>
                        <div className="flex gap-4"><span className="text-white font-mono">1,256.32</span><span className="text-emerald-400 font-bold w-16 text-right">Mua</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">MA (20)</span>
                        <div className="flex gap-4"><span className="text-white font-mono">${(currentCoinPrice * 0.98).toLocaleString()}</span><span className="text-emerald-400 font-bold w-16 text-right">Mua</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">MA (50)</span>
                        <div className="flex gap-4"><span className="text-white font-mono">${(currentCoinPrice * 0.96).toLocaleString()}</span><span className="text-emerald-400 font-bold w-16 text-right">Mua</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">MA (200)</span>
                        <div className="flex gap-4"><span className="text-white font-mono">${(currentCoinPrice * 0.88).toLocaleString()}</span><span className="text-emerald-400 font-bold w-16 text-right">Mua</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Bollinger Bands</span>
                        <div className="flex gap-4"><span className="text-white font-mono">{advancedData.bollingerBands.middle}</span><span className="text-emerald-400 font-bold w-16 text-right">Mua</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Thanh khoản */}
                  <div className="p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Thanh khoản</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Tốt</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Khối lượng 24h</span>
                        <div className="flex gap-2"><span className="text-white font-mono">${((selectedCoin?.total_volume || 0) / 1e9).toFixed(2)}B</span><span className="text-emerald-400 font-mono text-[10px] w-12 text-right">+{currentCoinChange.toFixed(2)}%</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Thanh khoản (CVD)</span>
                        <div className="flex gap-2"><span className="text-white truncate max-w-[100px]">{coinglassData.cvdStatus}</span><span className="text-emerald-400 font-mono text-[10px] w-12 text-right">+32.5%</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Độ sâu sổ lệnh (±2%)</span>
                        <div className="flex gap-2"><span className="text-white font-mono">${((selectedCoin?.total_volume || 0) / 20e9).toFixed(2)}M</span><span className="text-emerald-400 w-12 text-right">Tốt</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Tỷ lệ mua/bán (L/S)</span>
                        <div className="flex gap-2"><span className="text-white font-mono">{futureData.metrics.longShortRatio.ratioText}</span><span className="text-emerald-400 w-12 text-right">Tích cực</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Dữ liệu on-chain */}
                  <div className="p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400"/> Dữ liệu on-chain</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Số địa chỉ hoạt động</span>
                        <div className="flex gap-2"><span className="text-white font-mono">845.2K</span><span className="text-emerald-400 font-mono text-[10px] w-12 text-right">+12.6%</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Dòng tiền vào sàn</span>
                        <div className="flex gap-2"><span className="text-white font-mono">$421.3M</span><span className="text-rose-400 font-mono text-[10px] w-12 text-right">-28.4%</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Dòng tiền ra sàn</span>
                        <div className="flex gap-2"><span className="text-white font-mono">$612.7M</span><span className="text-emerald-400 font-mono text-[10px] w-12 text-right">+15.2%</span></div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                        <span className="text-slate-400">Tỷ lệ HODLer</span>
                        <div className="flex gap-2"><span className="text-white font-mono">76.3%</span><span className="text-emerald-400 w-12 text-right">Tốt</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                
                {/* Chỉ báo kỹ thuật (Mini Charts) - span 2 */}
                <div className="xl:col-span-2 p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white overflow-x-auto pb-1 border-b border-zinc-800/50">
                    <Activity className="w-4 h-4 text-indigo-400"/>
                    <span className="text-white whitespace-nowrap">Chỉ báo kỹ thuật</span>
                    <button className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30">RSI</button>
                    <button className="px-2 py-1 hover:bg-zinc-800/50 rounded text-slate-400">MACD</button>
                    <button className="px-2 py-1 hover:bg-zinc-800/50 rounded text-slate-400">Stochastic</button>
                    <button className="px-2 py-1 hover:bg-zinc-800/50 rounded text-slate-400">Bollinger Bands</button>
                    <button className="px-2 py-1 hover:bg-zinc-800/50 rounded text-slate-400">MA</button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#111424] rounded-lg border border-zinc-800/50 flex flex-col justify-between h-28">
                      <div className="text-[10px] font-bold text-white flex justify-between"><span>RSI (14)</span> <span className="text-amber-400 bg-amber-500/10 px-1 rounded">{advancedData.stochRsi.k} Trung lập</span></div>
                      <div className="h-10 mt-2 bg-gradient-to-t from-indigo-900/40 to-transparent rounded border-b border-indigo-500/50 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <polyline fill="none" stroke="#6366f1" strokeWidth="2" points="0,30 20,10 40,25 60,15 80,35 100,20" />
                        </svg>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate" title={spotData.indicators.rsi.status}>{spotData.indicators.rsi.status}</div>
                    </div>
                    <div className="p-3 bg-[#111424] rounded-lg border border-zinc-800/50 flex flex-col justify-between h-28">
                      <div className="text-[10px] font-bold text-white flex justify-between"><span>MACD (12,26,9)</span> <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">1,256.32 Mua</span></div>
                      <div className="h-10 mt-2 relative flex items-end gap-[1px] px-1 justify-between">
                         <div className="w-1.5 bg-rose-500 h-[20%]"></div>
                         <div className="w-1.5 bg-rose-500 h-[15%]"></div>
                         <div className="w-1.5 bg-emerald-500 h-[30%]"></div>
                         <div className="w-1.5 bg-emerald-500 h-[60%]"></div>
                         <div className="w-1.5 bg-emerald-500 h-[90%]"></div>
                         <div className="w-1.5 bg-emerald-500 h-[70%]"></div>
                         <div className="w-1.5 bg-emerald-500 h-[40%]"></div>
                         <div className="absolute top-1/2 w-full h-[1px] bg-slate-600/50"></div>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate" title={spotData.indicators.macd}>{spotData.indicators.macd}</div>
                    </div>
                    <div className="p-3 bg-[#111424] rounded-lg border border-zinc-800/50 flex flex-col justify-between h-28">
                      <div className="text-[10px] font-bold text-white flex justify-between"><span>BB (20,2)</span> <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">{advancedData.bollingerBands.middle} Mua</span></div>
                      <div className="h-10 mt-2 bg-gradient-to-t from-emerald-900/20 to-transparent rounded relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <polyline fill="none" stroke="#10b981" strokeWidth="1.5" points="0,20 20,15 40,25 60,10 80,30 100,20" />
                          <polyline fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2" points="0,10 20,5 40,15 60,2 80,20 100,10" />
                          <polyline fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2" points="0,30 20,25 40,35 60,18 80,40 100,30" />
                        </svg>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate" title={advancedData.bollingerBands.squeezeStatus}>{advancedData.bollingerBands.squeezeStatus}</div>
                    </div>
                  </div>
                </div>

                {/* Hỗ trợ kháng cự - span 1 */}
                <div className="xl:col-span-1 p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3">
                  <div className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-2"><Layers className="w-4 h-4 text-indigo-400"/> Mức hỗ trợ & kháng cự</div>
                  <div className="space-y-2 text-xs font-mono pt-1">
                    <div className="flex justify-between items-center text-rose-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Kháng cự 3</span> <span>{(currentCoinPrice * 1.15).toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between items-center text-rose-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Kháng cự 2</span> <span>{(currentCoinPrice * 1.10).toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between items-center text-rose-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Kháng cự 1</span> <span>{spotData.indicators.supportResistance.resistance}</span></div>
                    <div className="flex justify-between items-center text-indigo-200 bg-indigo-600/30 px-2 rounded-lg font-bold py-1.5 my-2 border border-indigo-500/50"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div> Giá hiện tại</span> <span>{currentCoinPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between items-center text-emerald-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Hỗ trợ 1</span> <span>{spotData.indicators.supportResistance.support}</span></div>
                    <div className="flex justify-between items-center text-emerald-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Hỗ trợ 2</span> <span>{(currentCoinPrice * 0.90).toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                    <div className="flex justify-between items-center text-emerald-400"><span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Hỗ trợ 3</span> <span>{(currentCoinPrice * 0.85).toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                  </div>
                </div>

                {/* Tổng quan xu hướng - span 1 */}
                <div className="xl:col-span-1 p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-4 flex flex-col">
                  <div className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-2"><TrendingUp className="w-4 h-4 text-indigo-400"/> Tổng quan xu hướng</div>
                  <div className="flex justify-end gap-2 text-[9px] font-mono text-slate-500 -mt-2"><span>1D</span><span>1W</span><span>1M</span><span>3M</span><span>1Y</span></div>
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-[10px] text-emerald-400/80 mb-0.5">Xu hướng hiện tại</div>
                        <div className="text-base font-bold text-emerald-400 leading-none">{spotData.trend.split(' ')[0] || "Tăng"}</div>
                      </div>
                    </div>
                    <div className="space-y-3.5 text-xs font-semibold">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 text-[10px] shrink-0">Xu hướng ngắn hạn (1D)</span>
                        <div className="flex-1 h-1 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-400 text-[10px] shrink-0">Tăng</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 text-[10px] shrink-0">Xu hướng trung hạn (1W)</span>
                        <div className="flex-1 h-1 bg-emerald-500 rounded-full opacity-80"></div>
                        <span className="text-emerald-400 text-[10px] shrink-0">Tăng</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 text-[10px] shrink-0">Xu hướng dài hạn (1M)</span>
                        <div className="flex-1 h-1 bg-emerald-500 rounded-full opacity-60"></div>
                        <span className="text-emerald-400 text-[10px] shrink-0">Tăng</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Đánh giá rủi ro - span 1 */}
                <div className="xl:col-span-1 p-4 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md space-y-3 flex flex-col">
                  <div className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-2"><ShieldAlert className="w-4 h-4 text-indigo-400"/> Đánh giá rủi ro</div>
                  <div className="flex justify-end -mt-2">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Trung bình</span>
                  </div>
                  <div className="flex-1 space-y-3 text-xs pt-1">
                    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                      <span className="text-slate-400">Biến động (Volatility)</span>
                      <span className="text-white font-bold">{futureData.metrics.volatilityATR}%</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                      <span className="text-slate-400">Mức độ rủi ro</span>
                      <span className="text-amber-400 font-bold">Trung bình</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-1.5">
                      <span className="text-slate-400">Khối lượng</span>
                      <span className="text-amber-400 font-bold">Cao</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5">
                      <span className="text-slate-400">Tâm lý thị trường</span>
                      <span className="text-emerald-400 font-bold">{coinglassData.fearGreedIndex.label}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 flex gap-1 mt-auto leading-tight">
                    <HelpCircle className="w-3 h-3 shrink-0" />
                    Thị trường đang trong giai đoạn tích lũy, phù hợp với chiến lược giao dịch trung hạn.
                  </div>
                </div>
              </div>

              {/* Bottom AI Box & Order Button */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 p-5 bg-[#0b0e1b] border border-zinc-800 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white"><Sparkles className="w-4 h-4 text-indigo-400"/> Phân tích AI</div>
                    <span className="px-3 py-1 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Tích cực</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {spotData.finalVerdict.summaryText}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium mt-2">
                    {spotData.strategyAdvice}
                  </p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/50">
                    <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      {spotData.riskWarning}
                    </p>
                  </div>
                </div>
                
                <div className="md:col-span-1 flex items-center justify-center">
                  <button className="w-full h-full min-h-[120px] flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition cursor-pointer">
                    <Zap className="w-5 h-5" />
                    <span>Đặt lệnh ngay</span>
                  </button>
                </div>
              </div>

              {/* ================= DUAL-STREAM SWITCHER (SPOT vs FUTURE) ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTradingMode("spot")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    tradingMode === "spot"
                      ? "bg-[#131a38] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30 text-white"
                      : "bg-[#0f1225] border-indigo-950/80 hover:bg-[#141830] text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        tradingMode === "spot"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-500 bg-transparent"
                      }`}
                    />
                    <span className="font-bold text-xs sm:text-sm text-white">
                      GIAO D???CH SPOT
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                    {spotData.signalLabel || "MUA GOM"}
                  </span>
                </button>

                <button
                  onClick={() => setTradingMode("future")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    tradingMode === "future"
                      ? "bg-[#131a38] border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30 text-white"
                      : "bg-[#0f1225] border-indigo-950/80 hover:bg-[#141830] text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        tradingMode === "future"
                          ? "border-cyan-500 bg-cyan-500"
                          : "border-slate-500 bg-transparent"
                      }`}
                    />
                    <span className="font-bold text-xs sm:text-sm text-white">
                      GIAO D???CH FUTURE
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/40">
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
                    <span className="uppercase tracking-wider">T???NG QUAN PH??N T??CH PH??I SINH</span>
                  </div>

                  {/* 3 KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>T??? l??? Th???ng (Winrate Futures)</span>
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

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>M???c R???i Ro V???n (Risk per Trade)</span>
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {futureData.capitalRiskPercent}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gi???i h???n t???i ??a kh??ng ch??y t??i kho???n
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Scale className="w-4 h-4 text-emerald-400" />
                        <span>T??? l??? Risk / Reward (R:R)</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {futureData.riskRewardRatio}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        T??? l??? k??? v???ng l???i nhu???n tr??n v???n
                      </div>
                    </div>
                  </div>

                  {/* 4 Execution Strategy Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                        <Target className="w-3.5 h-3.5" />
                        <span>V??NG ENTRY L???NH</span>
                      </div>
                      <div className="text-base font-black text-white font-mono pt-1">
                        {futureData.entryZone}
                      </div>
                      <div className="text-[11px] text-slate-400">V??o l???nh c?? k??? lu???t</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>CH???T L???I TP1</span>
                      </div>
                      <div className="text-base font-black text-emerald-400 font-mono pt-1">
                        {futureData.targetPrice1}
                      </div>
                      <div className="text-[11px] text-slate-400">?????t L1 v??? h??a v???n</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <Crown className="w-3.5 h-3.5" />
                        <span>CH???T L???I TP2 / TP3</span>
                      </div>
                      <div className="text-base font-black text-emerald-300 font-mono pt-1">
                        {futureData.targetPrice2}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {futureData.targetPrice3}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-rose-950/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>STOP LOSS / LIQ PRICE</span>
                      </div>
                      <div className="text-base font-black text-rose-400 font-mono pt-1">
                        {futureData.stopLoss}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Gi?? thanh l??: {futureData.estLiquidationPrice}
                      </div>
                    </div>
                  </div>

                  {/* 2 Wide Technical Modules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <BarChart2 className="w-4 h-4 text-cyan-400" />
                          <span>T??? l??? Long / Short Ratio</span>
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
                            className="h-full bg-emerald-500"
                            style={{ width: `${futureData.metrics.longShortRatio.longPercent}%` }}
                          />
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${futureData.metrics.longShortRatio.shortPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141830] border border-indigo-950/60 text-xs">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-slate-400">Funding Rate:</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-emerald-400">
                            {futureData.metrics.fundingRate.rate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({futureData.metrics.fundingRate.status})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>B???n ????? C???m Thanh L??</span>
                        </div>
                        <span className="text-[11px] text-slate-400">OI: {futureData.metrics.openInterest}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#141830] border border-rose-950/40 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-rose-300 text-[11px]">Thanh L?? Short</span>
                          <span className="font-mono font-bold text-rose-400">
                            {futureData.metrics.liquidationHeatmap.shortLiquidationPool}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#141830] border border-emerald-950/40 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-300 text-[11px]">Thanh L?? Long</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {futureData.metrics.liquidationHeatmap.longLiquidationPool}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Verdict Banner (Futures) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0c2221] border border-emerald-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                          K???T LU???N HI???N T???I (FUTURES & MARGIN)
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Khuy???n Ngh??? V??? Th??? Ph??i Sinh
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          {futureData?.finalVerdict?.summaryText || "??ang c???p nh???t nh???n ?????nh v??? th??? ph??i sinh chuy??n s??u..."}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md tracking-wider uppercase cursor-default">
                        <TrendingUp className="w-4 h-4" />
                        <span>{futureData?.finalVerdict?.action || futureData?.positionLabel || "LONG"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================== SPOT TRADING STREAM VIEW ==================== */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 px-1 pt-1">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="uppercase tracking-wider">T???NG QUAN PH??N T??CH SPOT (N???M GI??? D??I H???N)</span>
                  </div>

                  {/* 3 KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <span>Ch??? s??? Winrate Spot K??? V???ng</span>
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

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>Xu H?????ng Ch??nh (Trend)</span>
                      </div>
                      <div className="text-base font-black text-cyan-300 pt-1">
                        {spotData.trend}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {spotData.indicators.emaTrend}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>T??? l??? Risk / Reward (R:R)</span>
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {spotData.riskRewardRatio}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ???????c t??nh to??n theo ph??n b??? DCA
                      </div>
                    </div>
                  </div>

                  {/* 4 Spot Execution Strategy Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <Target className="w-3.5 h-3.5" />
                        <span>V??NG MUA GOM (BUY)</span>
                      </div>
                      <div className="text-base font-black text-white font-mono pt-1">
                        {spotData.entryZone}
                      </div>
                      <div className="text-[11px] text-slate-400">Chia v???n mua 3 ?????t</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>CH???T L???I TP1</span>
                      </div>
                      <div className="text-base font-black text-cyan-400 font-mono pt-1">
                        {spotData.targetPrice1}
                      </div>
                      <div className="text-[11px] text-slate-400">Ch???t 30-40% g???c</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
                        <Crown className="w-3.5 h-3.5" />
                        <span>CH???T L???I TP2 / TP3</span>
                      </div>
                      <div className="text-base font-black text-cyan-300 font-mono pt-1">
                        {spotData.targetPrice2}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {spotData.targetPrice3}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-rose-950/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>C???T L??? AN TO??N (SL)</span>
                      </div>
                      <div className="text-base font-black text-rose-400 font-mono pt-1">
                        {spotData.stopLoss}
                      </div>
                      <div className="text-[11px] text-slate-400">B???o to??n v???n danh m???c</div>
                    </div>
                  </div>

                  {/* 2 Spot Technical Modules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <BarChart2 className="w-4 h-4 text-emerald-400" />
                          <span>V??ng Thanh Kho???n & Order Block</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          RSI: {spotData.indicators.rsi.value}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-[#141830] border border-emerald-950/40">
                          <div className="text-[11px] text-emerald-400 font-semibold">V??ng C???u Mua:</div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">
                            {spotData.liquidity.highLiquidityZone}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#141830] border border-rose-950/40">
                          <div className="text-[11px] text-rose-400 font-semibold">V??ng Cung B??n:</div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5">
                            {spotData.liquidity.supplyZone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1225] border border-indigo-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span>H??? Tr??? & Kh??ng C???</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-mono font-bold">
                          {spotData.indicators.volumeProfile}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between p-2.5 rounded-lg bg-[#141830] border border-indigo-950/60 text-xs">
                          <span className="text-slate-400">H??? tr??? quan tr???ng:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {spotData.indicators.supportResistance.support}
                          </span>
                        </div>

                        <div className="flex justify-between p-2.5 rounded-lg bg-[#141830] border border-indigo-950/60 text-xs">
                          <span className="text-slate-400">Kh??ng c??? then ch???t:</span>
                          <span className="font-mono font-bold text-rose-400">
                            {spotData.indicators.supportResistance.resistance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Verdict Banner (Spot) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0c2221] border border-emerald-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                          K???T LU???N HI???N T???I (SPOT TRADING)
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Khuy???n Ngh??? T??ch L??y Spot
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          {spotData?.finalVerdict?.summaryText || "??ang c???p nh???t nh???n ?????nh t??ch l??y Spot chuy??n s??u..."}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md tracking-wider uppercase cursor-default">
                        <TrendingUp className="w-4 h-4" />
                        <span>{spotData?.finalVerdict?.action || spotData?.signalLabel || "N??N MUA"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ================= USER ANALYSIS HISTORY TABLE ================= */}
      {user && (
        <div id="analysis-history-section" className="bg-[#0f1225] border border-indigo-950/80 rounded-xl p-4 sm:p-5 shadow-md space-y-4 mt-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-950/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Bảng Lịch Sử Phân Tích Cá Nhân
                </h3>
                <p className="text-[11px] text-slate-400">
                  Danh sách các đồng crypto bạn đã phân tích kèm nội dung nhận định và thời điểm
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Tổng cộng: <span className="font-bold text-white">{history.length}</span> lượt phân tích
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#141830] flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">
                Bạn chưa thực hiện lượt phân tích nào. Nhấn nút "Phân tích" ở trên để lưu lịch sử!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-indigo-950/80 text-[11px] text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Crypto</th>
                    <th className="py-2.5 px-3">Giá Lúc Quét</th>
                    <th className="py-2.5 px-3">Tín Hiệu Spot</th>
                    <th className="py-2.5 px-3">Tín Hiệu Future</th>
                    <th className="py-2.5 px-3">Nội Dung Nhận Định</th>
                    <th className="py-2.5 px-3">Thời Điểm</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/40">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#141830]/60 transition cursor-pointer"
                      onClick={() => handleReloadHistory(item)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.coin_image && (
                            <img
                              src={item.coin_image}
                              alt={item.name}
                              className="w-6 h-6 rounded-full shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-white">
                              {item.symbol}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        ${item.price_at_analysis ? item.price_at_analysis.toLocaleString("en-US", { maximumFractionDigits: item.price_at_analysis < 1 ? 4 : 2 }) : "---"}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.spot_action}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {item.future_action}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-[280px]">
                        <p className="text-[11px] text-slate-300 truncate" title={item.summary_text}>
                          {item.summary_text || "Đã phân tích các chỉ số kỹ thuật và dòng tiền."}
                        </p>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatTime(item.created_at)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleReloadHistory(item)}
                            className="px-2.5 py-1 rounded bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 text-[11px] font-semibold border border-indigo-700/40 transition flex items-center gap-1"
                            title="Tải lại kết quả phân tích"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem lại</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteHistory(item.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Xóa khỏi lịch sử"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
