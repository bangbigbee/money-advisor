"use client";

import React from "react";
import { CryptoItem } from "@/lib/marketApi";
import { TrendingUp, TrendingDown, ArrowUpRight, Scan, Sparkles } from "lucide-react";

interface CryptoListProps {
  cryptos: CryptoItem[];
  onSelectSymbol?: (symbol: string) => void;
  onScanCoin?: (coin: CryptoItem) => void;
  onOpenScanModal?: () => void;
}

export function CryptoList({
  cryptos,
  onSelectSymbol,
  onScanCoin,
  onOpenScanModal,
}: CryptoListProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Bảng giá Tiền mã hóa (Top Cryptos)
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
            Dữ liệu thời gian thực theo dõi biến động 24h & Tích hợp Quét AI
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

          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
            Live CoinGecko
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider">
              <th className="pb-3 font-medium">Tài sản</th>
              <th className="pb-3 font-medium text-right">Giá (USD)</th>
              <th className="pb-3 font-medium text-right">Biến động 24h</th>
              <th className="pb-3 font-medium text-right hidden sm:table-cell">Khối lượng 24h</th>
              <th className="pb-3 font-medium text-right hidden md:table-cell">Vốn hóa</th>
              <th className="pb-3 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {cryptos.map((coin) => {
              const change24h = coin.price_change_percentage_24h ?? 0;
              const isPositive = change24h >= 0;
              const price = coin.current_price ?? 0;
              const volume = coin.total_volume ?? 0;
              const marketCap = coin.market_cap ?? 0;

              return (
                <tr key={coin.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 flex items-center gap-3">
                    {coin.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                    )}
                    <div>
                      <div className="font-semibold text-zinc-100">{coin.name}</div>
                      <div className="text-xs text-zinc-400 uppercase">{coin.symbol}</div>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-medium text-zinc-100 font-mono">
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
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
                  <td className="py-3.5 text-right text-xs text-zinc-400 hidden sm:table-cell font-mono">
                    ${(volume / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M
                  </td>
                  <td className="py-3.5 text-right text-xs text-zinc-400 hidden md:table-cell font-mono">
                    ${(marketCap / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* AI Scan Button */}
                      {onScanCoin && (
                        <button
                          onClick={() => onScanCoin(coin)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                        title="Xem biểu đồ TradingView"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
