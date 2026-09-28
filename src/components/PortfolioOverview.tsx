"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, ShieldCheck, Plus, Cloud, UserCheck } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";

interface PortfolioOverviewProps {
  onOpenAddModal?: () => void;
}

export function PortfolioOverview({ onOpenAddModal }: PortfolioOverviewProps) {
  const { user } = useAuth();
  const {
    totalValueUSD,
    totalValueVND,
    totalPnLUSD,
    pnlPercent,
    allocationData,
    computedAssets,
  } = usePortfolio();

  const isProfitable = totalPnLUSD >= 0;

  // Determine portfolio risk based on crypto / asset allocation
  const cryptoShare =
    allocationData.find((a) => a.name.includes("Crypto"))?.value || 0;
  const riskLevel =
    cryptoShare > 60 ? "Cao (High Risk)" : cryptoShare > 25 ? "Cân bằng (Moderate)" : "Bảo toàn (Conservative)";
  const riskColor =
    cryptoShare > 60 ? "text-rose-400" : cryptoShare > 25 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột 1: Thống kê tổng quan */}
      <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Tổng giá trị tài sản ròng
            </span>
            {user ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                <Cloud className="w-3 h-3" />
                Google Cloud Sync
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
                Lưu cục bộ
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              ${Math.round(totalValueUSD ?? 0).toLocaleString("en-US")}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-mono">
              ≈ {Math.round(totalValueVND ?? 0).toLocaleString("vi-VN")} VNĐ
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Lợi nhuận ròng (All-time PnL):</span>
              <span
                className={`font-semibold flex items-center gap-1 font-mono ${
                  isProfitable ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {isProfitable ? "+" : ""}
                ${Math.round(totalPnLUSD ?? 0).toLocaleString("en-US")} ({isProfitable ? "+" : ""}
                {(pnlPercent ?? 0).toFixed(2)}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Mức độ rủi ro danh mục:</span>
              <span className={`font-medium flex items-center gap-1 ${riskColor}`}>
                <ShieldCheck className="w-3.5 h-3.5" /> {riskLevel}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Số lượng mã tài sản:</span>
              <span className="text-zinc-200 font-mono font-semibold">
                {computedAssets.length} mã
              </span>
            </div>
          </div>
        </div>

        {onOpenAddModal && (
          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <button
              onClick={onOpenAddModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-semibold transition border border-zinc-700/60 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Thêm tài sản vào danh mục
            </button>
          </div>
        )}
      </div>

      {/* Cột 2 & 3: Phân bổ tài sản & Biểu đồ tròn */}
      <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#18181b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, "Tỷ trọng"]}
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "0.75rem",
                  color: "#f4f4f5",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-1/2 space-y-2.5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">
            Phân bổ danh mục thực tế
          </h3>
          {allocationData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-300 font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-zinc-100 font-semibold font-mono">{item.amount}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
