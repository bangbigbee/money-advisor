"use client";

import React from "react";
import { CryptoItem } from "@/lib/marketApi";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface CryptoListProps {
  cryptos: CryptoItem[];
  onSelectSymbol?: (symbol: string) => void;
}

export function CryptoList({ cryptos, onSelectSymbol }: CryptoListProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Bảng giá Tiền mã hóa (Top Cryptos)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Dữ liệu thời gian thực theo dõi biến động 24h</p>
        </div>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Live CoinGecko
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
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
              const isPositive = coin.price_change_percentage_24h >= 0;
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
                  <td className="py-3.5 text-right font-medium text-zinc-100">
                    ${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right">
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
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-xs text-zinc-400 hidden sm:table-cell">
                    ${(coin.total_volume / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M
                  </td>
                  <td className="py-3.5 text-right text-xs text-zinc-400 hidden md:table-cell">
                    ${(coin.market_cap / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B
                  </td>
                  <td className="py-3.5 text-center">
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
