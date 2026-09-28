export interface CryptoItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  image?: string;
  sparkline_in_7d?: { price: number[] };
}

export interface GoldForexItem {
  name: string;
  code: string;
  type: "gold" | "forex";
  buyPrice: number;
  sellPrice: number;
  change24h: number;
  unit: string;
}

export const initialGoldForexData: GoldForexItem[] = [
  {
    name: "Vàng SJC 9999 (1L - 10L)",
    code: "SJC",
    type: "gold",
    buyPrice: 88500000,
    sellPrice: 90500000,
    change24h: 1.25,
    unit: "VND/Lượng",
  },
  {
    name: "Vàng Nhẫn PNJ 24K",
    code: "PNJ",
    type: "gold",
    buyPrice: 87200000,
    sellPrice: 88400000,
    change24h: 0.85,
    unit: "VND/Lượng",
  },
  {
    name: "Vàng Thế Giới (Spot Gold)",
    code: "XAU/USD",
    type: "gold",
    buyPrice: 2748.5,
    sellPrice: 2749.2,
    change24h: 0.65,
    unit: "USD/Ounce",
  },
  {
    name: "Đô la Mỹ (USD/VND)",
    code: "USD",
    type: "forex",
    buyPrice: 25150,
    sellPrice: 25480,
    change24h: 0.05,
    unit: "VND",
  },
  {
    name: "Đồng Euro (EUR/VND)",
    code: "EUR",
    type: "forex",
    buyPrice: 27200,
    sellPrice: 27650,
    change24h: -0.32,
    unit: "VND",
  },
  {
    name: "Yên Nhật (JPY/VND)",
    code: "JPY",
    type: "forex",
    buyPrice: 164.2,
    sellPrice: 169.8,
    change24h: -0.15,
    unit: "VND",
  },
];

export async function fetchTopCryptos(): Promise<CryptoItem[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to fetch CoinGecko API");
    return await res.json();
  } catch (err) {
    // Fallback static high quality data if rate limited or offline
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 94850,
        price_change_percentage_24h: 3.45,
        total_volume: 38500000000,
        market_cap: 1870000000000,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        current_price: 3420,
        price_change_percentage_24h: 2.12,
        total_volume: 21500000000,
        market_cap: 412000000000,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        current_price: 198.6,
        price_change_percentage_24h: 5.84,
        total_volume: 7200000000,
        market_cap: 93500000000,
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        current_price: 665.4,
        price_change_percentage_24h: -0.45,
        total_volume: 1800000000,
        market_cap: 97000000000,
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      },
      {
        id: "ripple",
        symbol: "xrp",
        name: "XRP",
        current_price: 1.88,
        price_change_percentage_24h: 8.92,
        total_volume: 4500000000,
        market_cap: 106000000000,
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      },
    ];
  }
}
