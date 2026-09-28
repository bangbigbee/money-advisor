"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { CryptoList } from "@/components/CryptoList";
import { GoldForexList } from "@/components/GoldForexList";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { fetchTopCryptos, initialGoldForexData, CryptoItem } from "@/lib/marketApi";
import {
  TrendingUp,
  Activity,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedChartSymbol, setSelectedChartSymbol] = useState("BINANCE:BTCUSDT");
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadCryptoData = async () => {
    setIsLoading(true);
    const data = await fetchTopCryptos();
    setCryptos(data);
    setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
    setIsLoading(false);
  };

  useEffect(() => {
    loadCryptoData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Market Status Ticker & Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Trợ lý Giám sát Thị trường & Tài sản
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Theo dõi biến động Crypto, Vàng SJC, Ngoại tệ & Quản lý danh mục đầu tư cá nhân
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {lastUpdated && (
              <span className="text-xs text-zinc-400 font-mono">
                Cập nhật: {lastUpdated}
              </span>
            )}
            <button
              onClick={loadCryptoData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Tab 1: Tổng quan (Dashboard) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Portfolio Summary */}
            <PortfolioOverview />

            {/* TradingView Chart Section */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-semibold text-zinc-100">
                    Biểu đồ Kỹ thuật Trực tuyến (TradingView Pro)
                  </h2>
                </div>

                {/* Quick Symbol Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80">
                  {[
                    { label: "Bitcoin", symbol: "BINANCE:BTCUSDT" },
                    { label: "Ethereum", symbol: "BINANCE:ETHUSDT" },
                    { label: "Solana", symbol: "BINANCE:SOLUSDT" },
                    { label: "Vàng Thế Giới", symbol: "OANDA:XAUUSD" },
                    { label: "USD / DXY", symbol: "CAPITALCOM:DXY" },
                  ].map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => setSelectedChartSymbol(s.symbol)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                        selectedChartSymbol === s.symbol
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TradingView Chart */}
              <TradingViewWidget symbol={selectedChartSymbol} theme="dark" />
            </div>

            {/* Market Lists */}
            <div className="space-y-6">
              <CryptoList
                cryptos={cryptos}
                onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
              />
              <GoldForexList
                items={initialGoldForexData}
                onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Crypto */}
        {activeTab === "crypto" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100">Biểu đồ Phân tích Kỹ thuật Crypto</h2>
                <p className="text-xs text-zinc-400">Chọn đồng coin để soi biểu đồ nến và chỉ báo</p>
              </div>
              <TradingViewWidget symbol={selectedChartSymbol} theme="dark" />
            </div>

            <CryptoList
              cryptos={cryptos}
              onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
            />
          </div>
        )}

        {/* Tab 3: Vàng & Ngoại hối */}
        {activeTab === "forex-gold" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-100">Biểu đồ Vàng & Tiền tệ Thế giới</h2>
                <p className="text-xs text-zinc-400">Theo dõi tỷ giá vàng giao ngay XAU/USD & DXY</p>
              </div>
              <TradingViewWidget symbol="OANDA:XAUUSD" theme="dark" />
            </div>

            <GoldForexList
              items={initialGoldForexData}
              onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
            />
          </div>
        )}

        {/* Tab 4: Danh mục đầu tư */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <PortfolioOverview />
            
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">
                Nhật ký & Lịch sử Giao dịch
              </h3>
              <div className="p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
                Chưa có giao dịch mới. Bạn có thể kết nối Supabase Database để lưu trữ lịch sử nạp/rút và mua bán.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/90 py-6 text-center text-xs text-zinc-500">
        <p>MoneyAdvisor © 2026 - Nền tảng quản lý tài chính & thị trường thông minh.</p>
      </footer>
    </div>
  );
}
