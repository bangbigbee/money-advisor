"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Scan,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  BarChart2,
  DollarSign,
  Layers,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  Plus,
  Crown,
  Zap,
  Lock,
} from "lucide-react";
import { CryptoItem } from "@/lib/marketApi";
import { ScanResult } from "@/app/api/ai-scan/route";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptos: CryptoItem[];
  initialSelectedCoin?: CryptoItem | null;
  onOpenAddAssetModal?: (prefill?: { symbol: string; name: string; price: number }) => void;
  onOpenUpgradeModal?: () => void;
}

const POPULAR_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", defaultPrice: 94850 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", defaultPrice: 3420 },
  { id: "solana", symbol: "SOL", name: "Solana", defaultPrice: 198.6 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", defaultPrice: 665.4 },
  { id: "ripple", symbol: "XRP", name: "XRP", defaultPrice: 1.88 },
  { id: "cardano", symbol: "ADA", name: "Cardano", defaultPrice: 0.95 },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", defaultPrice: 0.38 },
  { id: "sui", symbol: "SUI", name: "Sui Network", defaultPrice: 3.45 },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol", defaultPrice: 6.8 },
  { id: "pepe", symbol: "PEPE", name: "Pepe", defaultPrice: 0.000019 },
];

export function ScanModal({
  isOpen,
  onClose,
  cryptos,
  initialSelectedCoin,
  onOpenAddAssetModal,
  onOpenUpgradeModal,
}: ScanModalProps) {
  const { role, remainingScans, scansLimit, scansUsed, useScanQuota, canScan, user } = useAuth();

  const [selectedCoin, setSelectedCoin] = useState<CryptoItem | (typeof POPULAR_COINS)[0] | null>(
    null
  );
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLimitReached, setShowLimitReached] = useState(false);

  // Sync initial coin if provided
  useEffect(() => {
    if (initialSelectedCoin) {
      setSelectedCoin(initialSelectedCoin);
      handleStartScan(initialSelectedCoin);
    } else if (!selectedCoin && cryptos.length > 0) {
      setSelectedCoin(cryptos[0]);
    } else if (!selectedCoin) {
      setSelectedCoin(POPULAR_COINS[0]);
    }
  }, [initialSelectedCoin, isOpen]);

  if (!isOpen) return null;

  // Search filtered coins
  const availableCoins = cryptos.length > 0 ? cryptos : (POPULAR_COINS as any[]);
  const filteredCoins = availableCoins.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartScan = async (coinToScan = selectedCoin) => {
    if (!coinToScan) return;

    // Check quota for STARTER
    if (!canScan) {
      setShowLimitReached(true);
      return;
    }

    setIsScanning(true);
    setErrorMessage("");
    setShowLimitReached(false);
    setScanResult(null);

    const price = (coinToScan as CryptoItem).current_price || (coinToScan as any).defaultPrice || 100;
    const change24h = (coinToScan as CryptoItem).price_change_percentage_24h || 0;
    const marketCap = (coinToScan as CryptoItem).market_cap;
    const totalVolume = (coinToScan as CryptoItem).total_volume;

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
      // Deduct 1 scan quota
      useScanQuota();
      setScanResult(data);
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình quét AI");
    } finally {
      setIsScanning(false);
    }
  };

  const getSignalBadgeStyle = (signal: string) => {
    switch (signal) {
      case "STRONG_BUY":
      case "BUY":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10";
      case "TAKE_PROFIT":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-cyan-500/10";
      case "SELL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/10";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10";
    }
  };

  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header with User Tier & Circular Quota Badge */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
              <Scan className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  AI Market Scanner
                </h3>
                {/* User Tier Badge */}
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                    role === "ADMIN"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      : role === "ULTRA"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : role === "PRO"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700"
                  }`}
                >
                  {role === "ADMIN" ? "ADMIN 👑" : role}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Phân tích kỹ thuật chuyên sâu, xác suất đầu tư & điểm vào lệnh tối ưu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular Remaining Quota Badge */}
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-mono font-black text-xs shadow-md shadow-emerald-500/20">
                {isUnlimited ? "∞" : remainingScans}
              </div>
              <div className="text-[11px] leading-tight hidden sm:block">
                <div className="font-semibold text-zinc-200">
                  {isUnlimited ? "Không giới hạn" : `Còn ${remainingScans}/${scansLimit} lượt`}
                </div>
                <div className="text-[9px] text-zinc-400">
                  {role === "STARTER" ? "Gói STARTER" : "Đã kích hoạt"}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
          {/* Quota Exhausted Warning Card */}
          {showLimitReached && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Bạn đã sử dụng hết 3 lượt quét AI của gói STARTER!
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Để tiếp tục quét không giới hạn các đồng coin và nhận điểm vào lệnh tối ưu, bạn hãy nâng cấp lên gói <strong>PRO</strong> hoặc <strong>ULTRA</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {onOpenUpgradeModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpgradeModal();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Nâng cấp ngay</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top Controls: Coin Select & Timeframe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            {/* Search / Coin Selection */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Chọn đồng Crypto để quét:
                </span>
                {selectedCoin && (
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Đang chọn: {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                  </span>
                )}
              </div>

              {/* Coin Quick Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {availableCoins.slice(0, 8).map((coin) => {
                  const isSelected = selectedCoin?.symbol.toUpperCase() === coin.symbol.toUpperCase();
                  return (
                    <button
                      key={coin.symbol}
                      onClick={() => {
                        setSelectedCoin(coin);
                        setScanResult(null);
                        setShowLimitReached(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                          : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      <span>{coin.symbol.toUpperCase()}</span>
                      <span className="text-[10px] font-normal text-zinc-400">
                        ${((coin as any).current_price || (coin as any).defaultPrice || 0).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe & Action */}
            <div className="space-y-2 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Chiến lược nắm giữ:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "short", label: "Lướt sóng" },
                  { id: "medium", label: "Trung hạn" },
                  { id: "long", label: "Hold / DCA" },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id as any)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition cursor-pointer text-center ${
                      timeframe === tf.id
                        ? "bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200 bg-zinc-900"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleStartScan()}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang phân tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Bắt đầu Quét AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Radar Animation State */}
          {isScanning && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 border border-zinc-800/80 rounded-2xl bg-zinc-950/40 backdrop-blur-sm">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-teal-500/40 animate-spin" />
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <Scan className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-zinc-100 animate-pulse">
                  Đang phân tích On-chain & Kỹ thuật {selectedCoin?.name}...
                </p>
                <p className="text-xs text-zinc-400">
                  Đang tính toán vùng giá mua, mục tiêu chốt lời (TP) và xác suất đầu tư
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scan Results View */}
          {scanResult && !isScanning && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Card 1: Main Signal & Score Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-lg font-bold text-emerald-400">
                      {scanResult.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-white">
                          {scanResult.name}
                        </h4>
                        <span className="text-sm text-zinc-400 font-mono">
                          (${scanResult.currentPrice.toLocaleString("en-US")})
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Xu hướng: <span className="font-semibold text-zinc-200">{scanResult.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signal Badge */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div
                      className={`px-4 py-2 rounded-2xl border text-sm font-black tracking-wide uppercase shadow-lg ${getSignalBadgeStyle(
                        scanResult.signal
                      )}`}
                    >
                      {scanResult.signalLabel}
                    </div>
                  </div>
                </div>

                {/* Score & Probability Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[11px] text-zinc-400 font-medium">Xác suất thành công:</div>
                    <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {scanResult.winRatePercent}%
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${scanResult.winRatePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[11px] text-zinc-400 font-medium">Điểm tiềm năng (Score):</div>
                    <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4" />
                      {scanResult.overallScore} / 10
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${scanResult.overallScore * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[11px] text-zinc-400 font-medium">Tỷ lệ Risk / Reward (R:R):</div>
                    <div className="text-xl font-extrabold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      {scanResult.riskRewardRatio}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-2">
                      Kỳ vọng lợi nhuận vượt trội
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Price Action Targets (Entry / TP / SL) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Entry Zone */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vùng Mua Tối Ưu
                  </div>
                  <div className="text-sm font-extrabold text-zinc-100 font-mono mt-1">
                    {scanResult.entryZone}
                  </div>
                  <p className="text-[10px] text-zinc-400">Canh gom giá đỏ/DCA</p>
                </div>

                {/* TP 1 */}
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5" /> Chốt lời TP1
                  </div>
                  <div className="text-sm font-extrabold text-zinc-100 font-mono mt-1">
                    {scanResult.targetPrice1}
                  </div>
                  <p className="text-[10px] text-zinc-400">Chốt 40-50% vị thế</p>
                </div>

                {/* TP 2 */}
                <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                  <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" /> Chốt lời TP2
                  </div>
                  <div className="text-sm font-extrabold text-zinc-100 font-mono mt-1">
                    {scanResult.targetPrice2}
                  </div>
                  <p className="text-[10px] text-zinc-400">Mục tiêu trung hạn</p>
                </div>

                {/* Stop Loss */}
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                  <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" /> Cắt lỗ an toàn (SL)
                  </div>
                  <div className="text-sm font-extrabold text-rose-300 font-mono mt-1">
                    {scanResult.stopLoss}
                  </div>
                  <p className="text-[10px] text-zinc-400">Dừng lỗ khi thủng hỗ trợ</p>
                </div>
              </div>

              {/* Card 3: Technical Details Breakdown */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5">
                <h5 className="font-bold text-zinc-100 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Phân tích Kỹ thuật & Chỉ số Thị trường
                </h5>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                  {scanResult.technicalSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60 space-y-1">
                    <span className="text-zinc-400 text-[11px]">Hỗ trợ / Kháng cự:</span>
                    <div className="text-zinc-200 font-mono font-semibold">
                      Hỗ trợ: {scanResult.supportLevel} <br />
                      Kháng cự: {scanResult.resistanceLevel}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60 space-y-1">
                    <span className="text-zinc-400 text-[11px]">Chỉ báo RSI & Volume:</span>
                    <div className="text-zinc-200 font-medium">
                      {scanResult.rsiStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Strategy Advice & Risk Warning */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-zinc-900 border border-emerald-500/20 space-y-2.5">
                <h5 className="font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Khuyến nghị Quản lý Vốn từ Chuyên gia AI
                </h5>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {scanResult.strategyAdvice}
                </p>
                <div className="text-[11px] text-zinc-400 italic pt-2 border-t border-zinc-800/60">
                  ⚠️ {scanResult.riskWarning}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleStartScan()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Quét lại phân tích
                </button>

                {onOpenAddAssetModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddAssetModal({
                        symbol: scanResult.symbol,
                        name: scanResult.name,
                        price: scanResult.currentPrice,
                      });
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm {scanResult.symbol} vào Danh mục của tôi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
