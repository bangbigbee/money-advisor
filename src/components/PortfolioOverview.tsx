"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Wallet, TrendingUp, ShieldCheck, ArrowUpRight, Plus } from "lucide-react";

const portfolioData = [
  { name: "Crypto (BTC, ETH, SOL)", value: 45, color: "#10b981", amount: "$38,500" },
  { name: "Vàng SJC & Spot Gold", value: 30, color: "#f59e0b", amount: "$25,600" },
  { name: "Ngoại tệ & Tiền mặt (USD/VND)", value: 15, color: "#3b82f6", amount: "$12,800" },
  { name: "Tiết kiệm ngân hàng", value: 10, color: "#8b5cf6", amount: "$8,500" },
];

export function PortfolioOverview() {
  const totalValue = 85400; // USD
  const totalPnL = 12450; // USD
  const pnlPercent = 17.06;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột 1: Thống kê tổng quan */}
      <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tổng giá trị tài sản ròng
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${totalValue.toLocaleString("en-US")}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-mono">
              ≈ {(totalValue * 25480).toLocaleString("vi-VN")} VNĐ
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Lợi nhuận ròng (All-time PnL):</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +${totalPnL.toLocaleString()} (+{pnlPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mt-2.5">
              <span>Mức độ rủi ro danh mục:</span>
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Trung bình
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-semibold transition border border-zinc-700/60 cursor-pointer">
            <Plus className="w-4 h-4" />
            Thêm tài sản vào danh mục
          </button>
        </div>
      </div>

      {/* Cột 2 & 3: Phân bổ tài sản & Biểu đồ tròn */}
      <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
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

        <div className="w-full md:w-1/2 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">Phân bổ danh mục</h3>
          {portfolioData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-300 font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-zinc-100 font-semibold">{item.amount}</div>
                <div className="text-[10px] text-zinc-400">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
