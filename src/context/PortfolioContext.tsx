"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CryptoItem, GoldForexItem, initialGoldForexData } from "@/lib/marketApi";

export interface PortfolioAsset {
  id: string;
  user_id?: string;
  symbol: string;
  name: string;
  category: "crypto" | "gold" | "forex" | "cash" | "stock";
  amount: number;
  buyPrice: number;
  currency: "USD" | "VND";
  createdAt?: string;
}

export interface ComputedAsset extends PortfolioAsset {
  currentPrice: number; // Unit price in native currency
  currentPriceUSD: number;
  totalValueUSD: number;
  totalValueVND: number;
  costBasisUSD: number;
  pnlUSD: number;
  pnlPercent: number;
  sharePercent: number;
}

export interface AllocationItem {
  name: string;
  value: number; // Percentage
  color: string;
  amount: string; // Formatted USD
}

interface PortfolioContextType {
  assets: PortfolioAsset[];
  computedAssets: ComputedAsset[];
  totalValueUSD: number;
  totalValueVND: number;
  totalCostBasisUSD: number;
  totalPnLUSD: number;
  pnlPercent: number;
  allocationData: AllocationItem[];
  isLoading: boolean;
  addAsset: (asset: Omit<PortfolioAsset, "id" | "user_id" | "createdAt">) => Promise<void>;
  updateAsset: (id: string, updates: Partial<PortfolioAsset>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  resetToDefault: () => void;
}

const DEFAULT_ASSETS: PortfolioAsset[] = [
  {
    id: "demo-1",
    symbol: "BTC",
    name: "Bitcoin",
    category: "crypto",
    amount: 0.45,
    buyPrice: 62500,
    currency: "USD",
  },
  {
    id: "demo-2",
    symbol: "ETH",
    name: "Ethereum",
    category: "crypto",
    amount: 3.2,
    buyPrice: 2850,
    currency: "USD",
  },
  {
    id: "demo-3",
    symbol: "SJC",
    name: "Vàng SJC 9999",
    category: "gold",
    amount: 7.5,
    buyPrice: 82000000,
    currency: "VND",
  },
  {
    id: "demo-4",
    symbol: "USD",
    name: "Đô la Mỹ (Tiền mặt)",
    category: "forex",
    amount: 12000,
    buyPrice: 24800,
    currency: "USD",
  },
  {
    id: "demo-5",
    symbol: "VND",
    name: "Tiết kiệm Ngân hàng",
    category: "cash",
    amount: 200000000,
    buyPrice: 1,
    currency: "VND",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  crypto: "#10b981", // Emerald
  gold: "#f59e0b",   // Amber
  forex: "#3b82f6",  // Blue
  cash: "#8b5cf6",   // Purple
  stock: "#ec4899",  // Pink
};

const CATEGORY_NAMES: Record<string, string> = {
  crypto: "Crypto Assets",
  gold: "Vàng & Kim loại quý",
  forex: "Ngoại tệ tiền mặt",
  cash: "Tiền mặt & Tiết kiệm",
  stock: "Cổ phiếu & Chứng khoán",
};

const USD_TO_VND_DEFAULT = 25480;

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({
  children,
  cryptos = [],
  goldForex = initialGoldForexData,
}: {
  children: React.ReactNode;
  cryptos?: CryptoItem[];
  goldForex?: GoldForexItem[];
}) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine current USD/VND rate from goldForex data if available
  const usdToVnd = useMemo(() => {
    const usdItem = goldForex.find((item) => item.code === "USD");
    return usdItem?.sellPrice || USD_TO_VND_DEFAULT;
  }, [goldForex]);

  // Load assets based on Auth state
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      if (user && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("portfolio_assets")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Lỗi khi tải tài sản từ Supabase:", error.message);
            // Fallback to local storage if table doesn't exist yet
            loadFromLocalStorage();
          } else if (data && data.length > 0) {
            const mappedAssets: PortfolioAsset[] = data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              symbol: item.symbol,
              name: item.name,
              category: item.category,
              amount: Number(item.amount),
              buyPrice: Number(item.buy_price || item.buyPrice || 0),
              currency: item.currency || "USD",
              createdAt: item.created_at,
            }));
            if (isMounted) setAssets(mappedAssets);
          } else {
            // New user with no assets yet in Supabase: check local storage or start empty
            const localSaved = localStorage.getItem(`portfolio_${user.id}`);
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (isMounted) setAssets(parsed);
              } catch {
                if (isMounted) setAssets([]);
              }
            } else {
              if (isMounted) setAssets([]);
            }
          }
        } catch (err) {
          console.error("Lỗi kết nối Supabase:", err);
          loadFromLocalStorage();
        }
      } else {
        // Guest user: load from localStorage or default
        loadFromLocalStorage();
      }

      if (isMounted) setIsLoading(false);
    }

    function loadFromLocalStorage() {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem("moneyadvisor_guest_assets");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            if (isMounted) setAssets(parsed);
            return;
          }
        } catch (e) {
          console.error("Lỗi đọc localStorage:", e);
        }
      }
      if (isMounted) setAssets(DEFAULT_ASSETS);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist guest assets to local storage
  useEffect(() => {
    if (!user && typeof window !== "undefined" && assets.length > 0) {
      localStorage.setItem("moneyadvisor_guest_assets", JSON.stringify(assets));
    }
  }, [assets, user]);

  // Helper to find live price for an asset
  const getLivePriceUSD = (asset: PortfolioAsset): number => {
    const sym = asset.symbol.toUpperCase();

    // 1. Crypto check
    const matchedCrypto = cryptos.find(
      (c) => c.symbol.toUpperCase() === sym || c.name.toLowerCase() === asset.name.toLowerCase()
    );
    if (matchedCrypto) {
      return matchedCrypto.current_price;
    }

    // 2. Gold & Forex check
    const matchedGoldForex = goldForex.find(
      (g) => g.code.toUpperCase() === sym || g.name.toLowerCase().includes(asset.name.toLowerCase())
    );
    if (matchedGoldForex) {
      if (matchedGoldForex.unit.includes("VND")) {
        // Convert VND price to USD
        return matchedGoldForex.sellPrice / usdToVnd;
      }
      return matchedGoldForex.sellPrice;
    }

    // 3. Cash VND
    if (sym === "VND") {
      return 1 / usdToVnd;
    }

    // 4. Default if currency is USD
    if (sym === "USD" || ((asset.category === "cash" || asset.category === "forex") && asset.currency === "USD")) {
      return 1;
    }

    // Fallback to buy price
    return asset.currency === "VND" ? asset.buyPrice / usdToVnd : asset.buyPrice;
  };

  // Real-time calculations
  const { computedAssets, totalValueUSD, totalValueVND, totalCostBasisUSD, totalPnLUSD, pnlPercent, allocationData } =
    useMemo(() => {
      let sumValueUSD = 0;
      let sumCostBasisUSD = 0;

      const rawComputed = assets.map((asset) => {
        const livePriceUSD = getLivePriceUSD(asset);
        const livePriceNative = asset.currency === "VND" ? livePriceUSD * usdToVnd : livePriceUSD;

        const totalValUSD = asset.amount * livePriceUSD;
        const totalValVND = totalValUSD * usdToVnd;

        const costUSD =
          asset.currency === "VND"
            ? (asset.amount * asset.buyPrice) / usdToVnd
            : asset.amount * asset.buyPrice;

        const pnl = totalValUSD - costUSD;
        const pnlPct = costUSD > 0 ? (pnl / costUSD) * 100 : 0;

        sumValueUSD += totalValUSD;
        sumCostBasisUSD += costUSD;

        return {
          ...asset,
          currentPrice: livePriceNative,
          currentPriceUSD: livePriceUSD,
          totalValueUSD: totalValUSD,
          totalValueVND: totalValVND,
          costBasisUSD: costUSD,
          pnlUSD: pnl,
          pnlPercent: pnlPct,
          sharePercent: 0,
        };
      });

      // Calculate share percent
      const computedWithShare = rawComputed.map((item) => ({
        ...item,
        sharePercent: sumValueUSD > 0 ? (item.totalValueUSD / sumValueUSD) * 100 : 0,
      }));

      const totalPnL = sumValueUSD - sumCostBasisUSD;
      const totalPnLPct = sumCostBasisUSD > 0 ? (totalPnL / sumCostBasisUSD) * 100 : 0;

      // Group by category for allocation chart
      const categorySums: Record<string, number> = {};
      computedWithShare.forEach((item) => {
        categorySums[item.category] = (categorySums[item.category] || 0) + item.totalValueUSD;
      });

      const allocation: AllocationItem[] = Object.entries(categorySums).map(([cat, val]) => {
        const pct = sumValueUSD > 0 ? Math.round((val / sumValueUSD) * 100) : 0;
        return {
          name: CATEGORY_NAMES[cat] || cat,
          value: pct,
          color: CATEGORY_COLORS[cat] || "#64748b",
          amount: `$${Math.round(val).toLocaleString("en-US")}`,
        };
      });

      return {
        computedAssets: computedWithShare,
        totalValueUSD: sumValueUSD,
        totalValueVND: sumValueUSD * usdToVnd,
        totalCostBasisUSD: sumCostBasisUSD,
        totalPnLUSD: totalPnL,
        pnlPercent: totalPnLPct,
        allocationData: allocation.length > 0 ? allocation : [
          { name: "Chưa có tài sản", value: 100, color: "#3f3f46", amount: "$0" },
        ],
      };
    }, [assets, cryptos, goldForex, usdToVnd]);

  // Actions: Add asset
  const addAsset = async (newAssetData: Omit<PortfolioAsset, "id" | "user_id" | "createdAt">) => {
    const tempId = `asset-${Date.now()}`;
    const newAsset: PortfolioAsset = {
      ...newAssetData,
      id: tempId,
      user_id: user?.id,
      createdAt: new Date().toISOString(),
    };

    if (user && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("portfolio_assets")
          .insert([
            {
              user_id: user.id,
              symbol: newAssetData.symbol,
              name: newAssetData.name,
              category: newAssetData.category,
              amount: newAssetData.amount,
              buy_price: newAssetData.buyPrice,
              currency: newAssetData.currency,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Lỗi khi lưu tài sản vào Supabase:", error.message);
          // Fallback locally
          setAssets((prev) => [newAsset, ...prev]);
        } else if (data) {
          setAssets((prev) => [
            {
              id: data.id,
              user_id: data.user_id,
              symbol: data.symbol,
              name: data.name,
              category: data.category,
              amount: Number(data.amount),
              buyPrice: Number(data.buy_price),
              currency: data.currency,
              createdAt: data.created_at,
            },
            ...prev,
          ]);
        }
      } catch (err) {
        console.error("Lỗi kết nối Supabase:", err);
        setAssets((prev) => [newAsset, ...prev]);
      }
    } else {
      setAssets((prev) => [newAsset, ...prev]);
    }
  };

  // Actions: Update asset
  const updateAsset = async (id: string, updates: Partial<PortfolioAsset>) => {
    setAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    if (user && isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.symbol !== undefined) dbUpdates.symbol = updates.symbol;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.buyPrice !== undefined) dbUpdates.buy_price = updates.buyPrice;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;

        await supabase.from("portfolio_assets").update(dbUpdates).eq("id", id);
      } catch (err) {
        console.error("Lỗi cập nhật Supabase:", err);
      }
    }
  };

  // Actions: Remove asset
  const removeAsset = async (id: string) => {
    setAssets((prev) => prev.filter((item) => item.id !== id));

    if (user && isSupabaseConfigured) {
      try {
        await supabase.from("portfolio_assets").delete().eq("id", id);
      } catch (err) {
        console.error("Lỗi xóa từ Supabase:", err);
      }
    }
  };

  const resetToDefault = () => {
    setAssets(DEFAULT_ASSETS);
    if (typeof window !== "undefined") {
      localStorage.setItem("moneyadvisor_guest_assets", JSON.stringify(DEFAULT_ASSETS));
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        assets,
        computedAssets,
        totalValueUSD,
        totalValueVND,
        totalCostBasisUSD,
        totalPnLUSD,
        pnlPercent,
        allocationData,
        isLoading,
        addAsset,
        updateAsset,
        removeAsset,
        resetToDefault,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
