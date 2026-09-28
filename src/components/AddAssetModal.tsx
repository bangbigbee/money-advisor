"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Coins, TrendingUp, DollarSign, Building } from "lucide-react";
import { usePortfolio, PortfolioAsset } from "@/context/PortfolioContext";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_OPTIONS = [
  { symbol: "BTC", name: "Bitcoin", category: "crypto", currency: "USD", defaultPrice: 94850 },
  { symbol: "ETH", name: "Ethereum", category: "crypto", currency: "USD", defaultPrice: 3420 },
  { symbol: "SOL", name: "Solana", category: "crypto", currency: "USD", defaultPrice: 198.6 },
  { symbol: "SJC", name: "Vàng SJC 9999", category: "gold", currency: "VND", defaultPrice: 88500000 },
  { symbol: "PNJ", name: "Vàng Nhẫn PNJ 24K", category: "gold", currency: "VND", defaultPrice: 87200000 },
  { symbol: "USD", name: "Đô la Mỹ (USD)", category: "forex", currency: "USD", defaultPrice: 1 },
  { symbol: "VND", name: "Tiết kiệm / Tiền mặt", category: "cash", currency: "VND", defaultPrice: 1 },
];

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const { addAsset } = usePortfolio();

  const [category, setCategory] = useState<PortfolioAsset["category"]>("crypto");
  const [symbol, setSymbol] = useState("BTC");
  const [name, setName] = useState("Bitcoin");
  const [amount, setAmount] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("94850");
  const [currency, setCurrency] = useState<"USD" | "VND">("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_OPTIONS)[0]) => {
    setCategory(preset.category as PortfolioAsset["category"]);
    setSymbol(preset.symbol);
    setName(preset.name);
    setCurrency(preset.currency as "USD" | "VND");
    setBuyPrice(preset.defaultPrice.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numBuyPrice = parseFloat(buyPrice);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ (> 0)");
      return;
    }

    if (isNaN(numBuyPrice) || numBuyPrice < 0) {
      alert("Vui lòng nhập giá mua hợp lệ (>= 0)");
      return;
    }

    setIsSubmitting(true);
    try {
      await addAsset({
        symbol: symbol.toUpperCase().trim(),
        name: name.trim(),
        category,
        amount: numAmount,
        buyPrice: numBuyPrice,
        currency,
      });
      onClose();
      // Reset form
      setAmount("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thêm tài sản mới</h3>
              <p className="text-xs text-zinc-400">Ghi nhận giao dịch mua vào danh mục cá nhân</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Mẫu tài sản nhanh:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_OPTIONS.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer border ${
                  symbol === item.symbol
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {item.name} ({item.symbol})
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Phân loại tài sản
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "crypto", label: "Crypto", icon: Coins },
                { id: "gold", label: "Vàng", icon: Sparkles },
                { id: "forex", label: "Ngoại tệ", icon: DollarSign },
                { id: "cash", label: "Tiền mặt", icon: Building },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as PortfolioAsset["category"])}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm"
                        : "bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symbol & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Ký hiệu (Symbol)
              </label>
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="VD: BTC, SJC, USD"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tên tài sản
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Bitcoin"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Số lượng nắm giữ
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 0.5 (BTC), 2 (Lượng)"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Đơn vị tiền tệ tính giá
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "VND")}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="USD">USD ($ - Đô la Mỹ)</option>
                <option value="VND">VND (₫ - Đồng Việt Nam)</option>
              </select>
            </div>
          </div>

          {/* Buy Price */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Giá mua trung bình ({currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder={`VD: ${currency === "USD" ? "65000" : "85000000"}`}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
