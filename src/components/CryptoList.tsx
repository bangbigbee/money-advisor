"use client";

import React, { useState, useMemo } from "react";
import { CryptoItem } from "@/lib/marketApi";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Scan,
  Sparkles,
  Search,
  SlidersHorizontal,
  Coins,
} from "lucide-react";

interface CryptoListProps {
  cryptos: CryptoItem[];
  onSelectSymbol?: (symbol: string) => void;
  onScanCoin?: (coin: CryptoItem) => void;
  onOpenScanModal?: () => void;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  {
    id: "l1",
    label: "Layer 1 / L2",
    symbols: ["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX", "SUI", "NEAR", "APT", "DOT", "MATIC", "XRP", "BCH", "LTC"],
  },
  {
    id: "ai",
    label: "AI & Big Data",
    symbols: ["TAO", "FET", "RENDER", "NEAR", "ICP", "GRT", "AGIX", "OCEAN", "WLD", "ARKM"],
  },
  {
    id: "meme",
    label: "Meme Coins",
    symbols: ["DOGE", "SHIB", "PEPE", "BONK", "FLOKI", "WIF", "BOME", "MEME", "BRETT", "POPCAT"],
  },
  {
    id: "defi",
    label: "DeFi & DEX",
    symbols: ["UNI", "LINK", "INJ", "AAVE", "MKR", "CRV", "SNX", "LDO", "RUNE", "CAKE", "JUP"],
  },
];

export function CryptoList({
  cryptos,
  onSelectSymbol,
  onScanCoin,
  onOpenScanModal,
}: CryptoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"market_cap" | "gainers" | "losers" | "volume">("market_cap");

  const filteredCryptos = useMemo(() => {
    let list = [...cryptos];

    // Category filter
    if (selectedCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat?.symbols) {
        list = list.filter((c) => cat.symbols.includes(c.symbol.toUpperCase()));
      }
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.symbol.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term)
      );
    }

    // Sorting
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

  return (
    <div className="bg-[#0f1225] border border-indigo-950/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span>Danh sách Tiền mã hóa ({filteredCryptos.length})</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Dữ liệu thị trường thời gian thực từ CoinGecko ({cryptos.length} đồng coin)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenScanModal && (
            <button
              onClick={onOpenScanModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quét AI chuyên sâu</span>
            </button>
          )}

          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap font-mono">
            Live Data ({cryptos.length} Coins)
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 pt-1">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã coin (BTC, SOL, SUI, NEAR, ETH...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#141830] border border-indigo-900/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>

        {/* Categories Pills & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1 text-xs self-start sm:self-center">
            <span className="text-[11px] text-slate-500 mr-1">Sắp xếp theo:</span>
            <button
              onClick={() => setSortBy("market_cap")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                sortBy === "market_cap"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Vốn hóa
            </button>
            <button
              onClick={() => setSortBy("gainers")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                sortBy === "gainers"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Tăng mạnh
            </button>
            <button
              onClick={() => setSortBy("volume")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                sortBy === "volume"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-[#141830] text-slate-400 hover:text-white border border-indigo-950"
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Dark Scrollbar */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto scrollbar-thin rounded-xl border border-indigo-950/60">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-[#0f1225] z-10 border-b border-indigo-950/80 text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-medium">Tài sản</th>
              <th className="py-3 px-4 font-medium text-right">Giá (USD)</th>
              <th className="py-3 px-4 font-medium text-right">Biến động 24h</th>
              <th className="py-3 px-4 font-medium text-right hidden sm:table-cell">Khối lượng 24h</th>
              <th className="py-3 px-4 font-medium text-right hidden md:table-cell">Vốn hóa</th>
              <th className="py-3 px-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-950/50 font-sans">
            {filteredCryptos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  Không tìm thấy đồng coin nào phù hợp
                </td>
              </tr>
            ) : (
              filteredCryptos.map((coin, index) => {
                const change24h = coin.price_change_percentage_24h ?? 0;
                const isPositive = change24h >= 0;
                const price = coin.current_price ?? 0;
                const volume = coin.total_volume ?? 0;
                const marketCap = coin.market_cap ?? 0;

                return (
                  <tr key={coin.id} className="hover:bg-[#141830]/80 transition">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-500 w-5">
                        #{coin.market_cap_rank || index + 1}
                      </span>
                      {coin.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full bg-black shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-bold text-white text-xs">{coin.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{coin.symbol}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-white font-mono text-xs">
                      ${price.toLocaleString("en-US", {
                        maximumFractionDigits: price < 1 ? 4 : 2,
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                          isPositive
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {isPositive ? "+" : ""}
                        {change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400 hidden sm:table-cell font-mono">
                      ${(volume / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400 hidden md:table-cell font-mono">
                      ${(marketCap / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* AI Scan Button */}
                        {onScanCoin && (
                          <button
                            onClick={() => onScanCoin(coin)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
                            title={`Quét AI phân tích kỹ thuật ${coin.name}`}
                          >
                            <Scan className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Scan AI</span>
                          </button>
                        )}

                        {/* TradingView Chart Button */}
                        <button
                          onClick={() =>
                            onSelectSymbol &&
                            onSelectSymbol(`BINANCE:${coin.symbol.toUpperCase()}USDT`)
                          }
                          className="p-1.5 rounded-lg bg-[#141830] hover:bg-[#1a2040] text-slate-300 hover:text-white border border-indigo-950 transition cursor-pointer"
                          title="Xem biểu đồ TradingView"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
