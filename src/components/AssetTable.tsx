"use client";

import React, { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Coins,
  Sparkles,
  DollarSign,
  Building,
  Layers,
  Plus,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  crypto: Coins,
  gold: Sparkles,
  forex: DollarSign,
  cash: Building,
  stock: Layers,
};

const CATEGORY_LABELS: Record<string, string> = {
  crypto: "Crypto",
  gold: "Vàng",
  forex: "Ngoại tệ",
  cash: "Tiền mặt",
  stock: "Cổ phiếu",
};

export function AssetTable({ onOpenAddModal }: { onOpenAddModal: () => void }) {
  const { computedAssets, removeAsset, resetToDefault } = usePortfolio();
  const [filter, setFilter] = useState<string>("all");

  const filteredAssets = computedAssets.filter((item) =>
    filter === "all" ? true : item.category === filter
  );

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Chi tiết Danh mục & Lợi nhuận từng Tài sản
          </h3>
          <p className="text-xs text-zinc-400">
            Dữ liệu được định giá tự động theo biến động thị trường thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80 text-xs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "crypto", label: "Crypto" },
              { id: "gold", label: "Vàng" },
              { id: "forex", label: "Ngoại tệ" },
              { id: "cash", label: "Tiền mặt" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === f.id
                    ? "bg-zinc-800 text-emerald-400 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm tài sản
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredAssets.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl space-y-3">
          <p>Chưa có tài sản nào trong danh mục này.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              + Thêm tài sản ngay
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
            >
              Tải danh mục mẫu
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Tài sản / Ký hiệu</th>
                <th className="py-3 px-4 font-semibold">Phân loại</th>
                <th className="py-3 px-4 font-semibold text-right">Số lượng</th>
                <th className="py-3 px-4 font-semibold text-right">Giá vốn / Giá hiện tại</th>
                <th className="py-3 px-4 font-semibold text-right">Tổng giá trị (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">Lợi nhuận (PnL)</th>
                <th className="py-3 px-4 font-semibold text-center">Tỷ trọng</th>
                <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredAssets.map((asset) => {
                const Icon = CATEGORY_ICONS[asset.category] || Coins;
                const isProfitable = asset.pnlUSD >= 0;

                return (
                  <tr key={asset.id} className="hover:bg-zinc-800/30 transition">
                    {/* Asset Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                            {asset.symbol}
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({asset.currency})
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">{asset.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/40">
                        {CATEGORY_LABELS[asset.category] || asset.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-zinc-200">
                      {asset.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                    </td>

                    {/* Prices */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="text-zinc-400">
                        Mua:{" "}
                        {asset.currency === "VND"
                          ? `${asset.buyPrice.toLocaleString()}₫`
                          : `$${asset.buyPrice.toLocaleString()}`}
                      </div>
                      <div className="text-zinc-100 font-semibold">
                        Hiện tại:{" "}
                        {asset.currency === "VND"
                          ? `${Math.round(asset.currentPrice).toLocaleString()}₫`
                          : `$${asset.currentPrice.toLocaleString()}`}
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-100">
                      ${Math.round(asset.totalValueUSD).toLocaleString("en-US")}
                      <div className="text-[10px] text-zinc-500 font-normal">
                        ≈ {Math.round(asset.totalValueVND).toLocaleString("vi-VN")}₫
                      </div>
                    </td>

                    {/* PnL */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          isProfitable ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isProfitable ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isProfitable ? "+" : ""}
                          ${Math.round(asset.pnlUSD).toLocaleString("en-US")}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] ${
                          isProfitable ? "text-emerald-400/80" : "text-rose-400/80"
                        }`}
                      >
                        {isProfitable ? "+" : ""}
                        {asset.pnlPercent.toFixed(2)}%
                      </div>
                    </td>

                    {/* Share percent */}
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-300">
                      {asset.sharePercent.toFixed(1)}%
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => removeAsset(asset.id)}
                        title="Xóa tài sản khỏi danh mục"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
