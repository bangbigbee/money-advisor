"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { AssetTable } from "@/components/AssetTable";
import { AddAssetModal } from "@/components/AddAssetModal";
import { ScannerPage } from "@/components/ScannerPage";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UpgradeModal } from "@/components/UpgradeModal";
import { CryptoList } from "@/components/CryptoList";
import { GoldForexList } from "@/components/GoldForexList";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import {
  fetchTopCryptos,
  initialGoldForexData,
  CryptoItem,
  GoldForexItem,
} from "@/lib/marketApi";
import {
  Activity,
  RefreshCw,
  Sparkles,
  Scan,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedChartSymbol, setSelectedChartSymbol] = useState("BINANCE:BTCUSDT");
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [goldForex, setGoldForex] = useState<GoldForexItem[]>(initialGoldForexData);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { role, remainingScans } = useAuth();
  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  const loadCryptoData = async () => {
    setIsLoading(true);
    const data = await fetchTopCryptos(250);
    setCryptos(data);
    setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
    setIsLoading(false);
  };

  useEffect(() => {
    loadCryptoData();
  }, []);

  const handleOpenScanWithCoin = (_coin: CryptoItem) => {
    setActiveTab("scan");
  };

  const handleOpenAddWithPrefill = (prefill?: { symbol: string; name: string; price: number }) => {
    if (prefill) {
      setAddModalPrefill({
        symbol: prefill.symbol,
        name: prefill.name,
        price: prefill.price,
        category: "crypto",
        currency: "USD",
      });
    } else {
      setAddModalPrefill(null);
    }
    setIsAddModalOpen(true);
  };

  return (
    <PortfolioProvider cryptos={cryptos} goldForex={goldForex}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col transition-colors duration-200">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => {
            setAddModalPrefill(null);
            setIsAddModalOpen(true);
          }}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 space-y-6">
          {/* Market Status Ticker & Banner (Hidden on scan & admin tabs for clean workspace) */}
          {activeTab !== "scan" && activeTab !== "admin" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    MoneyAdvisor Pro
                    <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      {role === "ADMIN" ? "ADMIN 👑" : `Gói ${role}`}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Tự động định giá danh mục từ CoinGecko ({cryptos.length} coins), Vàng SJC & Quét AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-center justify-between sm:justify-end">
                {/* Scan Trigger Button on Banner with Circular Quota Counter */}
                <button
                  onClick={() => setActiveTab("scan")}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-500/40 transition cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <Scan className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quét AI</span>
                  <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-400 text-zinc-950 text-[9px] sm:text-[10px] font-black font-mono">
                    {isUnlimited ? "∞" : remainingScans}
                  </span>
                </button>

                {lastUpdated && (
                  <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
                    Cập nhật: {lastUpdated}
                  </span>
                )}

                <button
                  onClick={loadCryptoData}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Admin Dashboard (Dedicated view for Admin) */}
          {activeTab === "admin" && <AdminDashboard />}

          {/* Tab: Quét AI Chuyên sâu (Dedicated Full-screen Scanner View) */}
          {activeTab === "scan" && (
            <ScannerPage
              cryptos={cryptos}
              onOpenAddAssetModal={handleOpenAddWithPrefill}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            />
          )}

          {/* Tab 1: Tổng quan (Dashboard) */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Portfolio Summary & Allocation */}
              <PortfolioOverview
                onOpenAddModal={() => {
                  setAddModalPrefill(null);
                  setIsAddModalOpen(true);
                }}
              />

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
                  <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto max-w-full scrollbar-thin">
                    {[
                      { label: "BTC", fullLabel: "Bitcoin", symbol: "BINANCE:BTCUSDT" },
                      { label: "ETH", fullLabel: "Ethereum", symbol: "BINANCE:ETHUSDT" },
                      { label: "SOL", fullLabel: "Solana", symbol: "BINANCE:SOLUSDT" },
                      { label: "Vàng", fullLabel: "Vàng Thế Giới", symbol: "OANDA:XAUUSD" },
                      { label: "DXY", fullLabel: "USD / DXY", symbol: "CAPITALCOM:DXY" },
                    ].map((s) => (
                      <button
                        key={s.symbol}
                        onClick={() => setSelectedChartSymbol(s.symbol)}
                        className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                          selectedChartSymbol === s.symbol
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="sm:hidden">{s.label}</span>
                        <span className="hidden sm:inline">{s.fullLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TradingView Chart */}
                <TradingViewWidget symbol={selectedChartSymbol} theme="dark" />
              </div>

              {/* User Asset Table */}
              <AssetTable
                onOpenAddModal={() => {
                  setAddModalPrefill(null);
                  setIsAddModalOpen(true);
                }}
              />

              {/* Market Lists */}
              <div className="space-y-6">
                <CryptoList
                  cryptos={cryptos}
                  onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
                  onScanCoin={handleOpenScanWithCoin}
                  onOpenScanModal={() => setActiveTab("scan")}
                />
                <GoldForexList
                  items={goldForex}
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
                onScanCoin={handleOpenScanWithCoin}
                onOpenScanModal={() => setActiveTab("scan")}
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
                items={goldForex}
                onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
              />
            </div>
          )}

          {/* Tab 4: Danh mục đầu tư */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <PortfolioOverview
                onOpenAddModal={() => {
                  setAddModalPrefill(null);
                  setIsAddModalOpen(true);
                }}
              />
              <AssetTable
                onOpenAddModal={() => {
                  setAddModalPrefill(null);
                  setIsAddModalOpen(true);
                }}
              />
            </div>
          )}
        </main>

        {/* Modals */}
        <AddAssetModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalPrefill(null);
          }}
          initialData={addModalPrefill}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />

        {/* Footer */}
        <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/90 py-6 text-center text-xs text-zinc-500">
          <p>MoneyAdvisor © 2026 - Quản lý tài chính cá nhân & Thị trường thông minh.</p>
        </footer>
      </div>
    </PortfolioProvider>
  );
}
