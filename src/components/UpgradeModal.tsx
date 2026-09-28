"use client";

import React from "react";
import { X, Check, Zap, Crown, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIERS = [
  {
    id: "STARTER" as UserRole,
    name: "STARTER",
    price: "0₫ / Miễn phí",
    badge: "Mặc định",
    color: "zinc",
    scansText: "3 lượt Quét AI",
    features: [
      "Theo dõi thị trường Live Crypto & Vàng",
      "Quản lý danh mục cơ bản",
      "3 lượt phân tích AI Scanner",
      "Biểu đồ TradingView Pro",
    ],
    highlight: false,
  },
  {
    id: "PRO" as UserRole,
    name: "PRO ADVISOR",
    price: "199.000₫ / tháng",
    badge: "Phổ biến",
    color: "emerald",
    scansText: "50 lượt Quét AI / ngày",
    features: [
      "Tất cả tính năng của gói Starter",
      "50 lượt Quét AI chuyên sâu / ngày",
      "Điểm vào lệnh tối ưu & Vùng DCA",
      "Tỷ lệ xác suất Win-rate thời gian thực",
      "Cảnh báo rủi ro & Chốt lời đa mục tiêu",
    ],
    highlight: true,
  },
  {
    id: "ULTRA" as UserRole,
    name: "ULTRA VIP",
    price: "499.000₫ / tháng",
    badge: "Không giới hạn",
    color: "amber",
    scansText: "Quét AI Không giới hạn (∞)",
    features: [
      "Tất cả tính năng của gói PRO",
      "Không giới hạn số lượt Quét AI",
      "Phân tích On-chain Whale Tracker",
      "Hỗ trợ ưu tiên 1:1 từ chuyên gia",
      "Huy hiệu VIP độc quyền trên tài khoản",
    ],
    highlight: false,
  },
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { role, setRole, resetScans, user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Nâng cấp Phân cấp Tài khoản
              </h3>
              <p className="text-xs text-zinc-400">
                Mở khóa không giới hạn lượt quét AI và các công cụ phân tích tài chính chuyên sâu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Current Tier Alert */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-zinc-400">Gói hiện tại của bạn:</span>
              <div className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    role === "ADMIN"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : role === "ULTRA"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : role === "PRO"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}
                >
                  {role}
                </span>
                <span className="text-xs text-zinc-400 font-normal">
                  ({user?.email || "Khách"})
                </span>
              </div>
            </div>

            {/* Quick Reset button for demo/testing */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetScans();
                  alert("Đã làm mới lại số lượt quét về 3 lượt!");
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Reset lượt quét (Demo)
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const isCurrent = role === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`relative p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    tier.highlight
                      ? "bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10"
                      : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                      Khuyên Dùng
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{tier.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                        {tier.badge}
                      </span>
                    </div>

                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {tier.price}
                    </div>
                    <div className="text-xs font-semibold text-zinc-300 mt-1 pb-4 border-b border-zinc-800">
                      ⚡ {tier.scansText}
                    </div>

                    <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60">
                    <button
                      onClick={() => {
                        setRole(tier.id);
                        alert(`Đã nâng cấp tài khoản sang gói ${tier.name}!`);
                        onClose();
                      }}
                      disabled={isCurrent}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        isCurrent
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : tier.highlight
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      }`}
                    >
                      {isCurrent ? "Đang sử dụng" : "Nâng cấp gói này"}
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 text-center text-xs text-zinc-500">
          Cần hỗ trợ gói doanh nghiệp hoặc nạp thanh toán tự động? Liên hệ Admin: bangdtbk@gmail.com
        </div>
      </div>
    </div>
  );
}
