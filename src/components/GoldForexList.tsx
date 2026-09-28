"use client";

import React from "react";
import { GoldForexItem } from "@/lib/marketApi";
import { TrendingUp, TrendingDown, DollarSign, Award, ArrowUpRight } from "lucide-react";

interface GoldForexListProps {
  items: GoldForexItem[];
  onSelectSymbol?: (symbol: string) => void;
}

export function GoldForexList({ items, onSelectSymbol }: GoldForexListProps) {
  const goldItems = items.filter((i) => i.type === "gold");
  const forexItems = items.filter((i) => i.type === "forex");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Bảng Giá Vàng */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100">Bảng giá Vàng (Gold Rate)</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">SJC, PNJ và Giá Vàng Thế Giới (Spot Gold)</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
            Hôm nay
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Loại Vàng</th>
                <th className="pb-3 font-medium text-right">Mua vào</th>
                <th className="pb-3 font-medium text-right">Bán ra</th>
                <th className="pb-3 font-medium text-right">24h</th>
                <th className="pb-3 font-medium text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {goldItems.map((item) => (
                <tr key={item.code} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3.5">
                    <div className="font-semibold text-zinc-100">{item.name}</div>
                    <div className="text-[11px] text-zinc-400">{item.unit}</div>
                  </td>
                  <td className="py-3.5 text-right font-medium text-emerald-400 font-mono">
                    {item.code === "XAU/USD"
                      ? `$${item.buyPrice.toLocaleString()}`
                      : `${(item.buyPrice / 1e6).toFixed(2)} tr`}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-zinc-100 font-mono">
                    {item.code === "XAU/USD"
                      ? `$${item.sellPrice.toLocaleString()}`
                      : `${(item.sellPrice / 1e6).toFixed(2)} tr`}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    <span className="text-xs font-semibold text-emerald-400 inline-flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />+{item.change24h}%
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() =>
                        onSelectSymbol &&
                        onSelectSymbol(item.code === "XAU/USD" ? "OANDA:XAUUSD" : "OANDA:XAUUSD")
                      }
                      className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng Tỷ Giá Ngoại Tệ */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100">Tỷ giá Ngoại tệ (Forex)</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">Tỷ giá quy đổi với VNĐ tham khảo ngân hàng</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 whitespace-nowrap">
            VCB
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Ngoại tệ</th>
                <th className="pb-3 font-medium text-right">Mua vào (VNĐ)</th>
                <th className="pb-3 font-medium text-right">Bán ra (VNĐ)</th>
                <th className="pb-3 font-medium text-right">Biến động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {forexItems.map((item) => {
                const isPos = item.change24h >= 0;
                return (
                  <tr key={item.code} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5">
                      <div className="font-semibold text-zinc-100">{item.name}</div>
                      <div className="text-xs text-zinc-400 uppercase font-mono">{item.code}</div>
                    </td>
                    <td className="py-3.5 text-right font-medium text-zinc-200">
                      {item.buyPrice.toLocaleString()} ₫
                    </td>
                    <td className="py-3.5 text-right font-semibold text-zinc-100">
                      {item.sellPrice.toLocaleString()} ₫
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                          isPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isPos ? "+" : ""}
                        {item.change24h}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
