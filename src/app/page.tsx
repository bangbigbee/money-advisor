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
import { useTheme } from "@/context/ThemeContext";
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
  const [activeTab, setActiveTab] = useState("scan");
  const [selectedChartSymbol, setSelectedChartSymbol] = useState("BINANCE:BTCUSDT");
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [goldForex, setGoldForex] = useState<GoldForexItem[]>(initialGoldForexData);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPrefill, setAddModalPrefill] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { role, remainingScans } = useAuth();
  const { theme } = useTheme();
  const isUnlimited = role === "ADMIN" || role === "ULTRA";

  const loadCryptoData = async () => {
    setIsLoading(true);
    const data = await fetchTopCryptos(250);
    setCryptos(data);
    if (!selectedAsset && data.length > 0) {
      setSelectedAsset(data[0]);
    }
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
          cryptos={cryptos}
          goldForex={goldForex}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 pb-20 md:pb-6 space-y-4">
          {/* Tab: Admin Dashboard */}
          {activeTab === "admin" && <AdminDashboard />}

          {/* Tab: Phân tích AI Chuyên sâu */}
          {activeTab === "scan" && (
            <ScannerPage
              cryptos={cryptos}
              goldForex={goldForex}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
              onOpenAddAssetModal={handleOpenAddWithPrefill}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            />
          )}

          {/* Tab 1: Tổng quan (Dashboard) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Portfolio Summary & Allocation */}
              <PortfolioOverview
                onOpenAddModal={() => {
                  setAddModalPrefill(null);
                  setIsAddModalOpen(true);
                }}
              />

              {/* TradingView Chart Section */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
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
                <TradingViewWidget symbol={selectedChartSymbol} theme={theme === "light" ? "light" : "dark"} />
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
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-lg">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-zinc-100">Biểu đồ Phân tích Kỹ thuật Crypto</h2>
                  <p className="text-xs text-zinc-400">Chọn đồng coin để soi biểu đồ nến và chỉ báo</p>
                </div>
                <TradingViewWidget symbol={selectedChartSymbol} theme={theme === "light" ? "light" : "dark"} />
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
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-lg">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-zinc-100">Biểu đồ Vàng Thế Giới & Ngoại hối</h2>
                  <p className="text-xs text-zinc-400">Xem diễn biến XAU/USD, DXY, EUR/USD thời gian thực</p>
                </div>
                <TradingViewWidget symbol={selectedChartSymbol} theme={theme === "light" ? "light" : "dark"} />
              </div>

              <GoldForexList
                items={goldForex}
                onSelectSymbol={(sym) => setSelectedChartSymbol(sym)}
              />
            </div>
          )}

          {/* Tab 4: Danh mục đầu tư cá nhân */}
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
      </div>
    </PortfolioProvider>
  );
}
