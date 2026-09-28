export interface CryptoItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank?: number;
  high_24h?: number;
  low_24h?: number;
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

export async function fetchTopCryptos(perPage: number = 100): Promise<CryptoItem[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to fetch CoinGecko API");
    const rawData: any[] = await res.json();
    const data: CryptoItem[] = rawData.map((c) => ({
      id: c.id || "",
      symbol: c.symbol || "",
      name: c.name || "",
      current_price: typeof c.current_price === "number" ? c.current_price : 0,
      price_change_percentage_24h:
        typeof c.price_change_percentage_24h === "number"
          ? c.price_change_percentage_24h
          : 0,
      total_volume: typeof c.total_volume === "number" ? c.total_volume : 0,
      market_cap: typeof c.market_cap === "number" ? c.market_cap : 0,
      market_cap_rank: c.market_cap_rank || undefined,
      image: c.image || "",
      sparkline_in_7d: c.sparkline_in_7d,
    }));
    return data;
  } catch (err) {
    console.warn("CoinGecko rate limit or offline, using extensive top coins fallback");
    // Extensive fallback list of top 30 coins
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 94850,
        price_change_percentage_24h: 3.45,
        total_volume: 38500000000,
        market_cap: 1870000000000,
        market_cap_rank: 1,
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
        market_cap_rank: 2,
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
        market_cap_rank: 3,
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
        market_cap_rank: 4,
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
        market_cap_rank: 5,
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      },
      {
        id: "cardano",
        symbol: "ada",
        name: "Cardano",
        current_price: 0.96,
        price_change_percentage_24h: 4.15,
        total_volume: 1400000000,
        market_cap: 34000000000,
        market_cap_rank: 6,
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      },
      {
        id: "dogecoin",
        symbol: "doge",
        name: "Dogecoin",
        current_price: 0.385,
        price_change_percentage_24h: 6.72,
        total_volume: 3200000000,
        market_cap: 56000000000,
        market_cap_rank: 7,
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      },
      {
        id: "sui",
        symbol: "sui",
        name: "Sui",
        current_price: 3.48,
        price_change_percentage_24h: 7.85,
        total_volume: 1600000000,
        market_cap: 9800000000,
        market_cap_rank: 8,
        image: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png",
      },
      {
        id: "avalanche-2",
        symbol: "avax",
        name: "Avalanche",
        current_price: 42.5,
        price_change_percentage_24h: 3.82,
        total_volume: 850000000,
        market_cap: 17200000000,
        market_cap_rank: 9,
        image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
      },
      {
        id: "near",
        symbol: "near",
        name: "NEAR Protocol",
        current_price: 6.85,
        price_change_percentage_24h: 4.65,
        total_volume: 680000000,
        market_cap: 8200000000,
        market_cap_rank: 10,
        image: "https://assets.coingecko.com/coins/images/10365/large/near.png",
      },
      {
        id: "pepe",
        symbol: "pepe",
        name: "Pepe",
        current_price: 0.0000195,
        price_change_percentage_24h: 12.4,
        total_volume: 2400000000,
        market_cap: 8200000000,
        market_cap_rank: 11,
        image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png",
      },
      {
        id: "chainlink",
        symbol: "link",
        name: "Chainlink",
        current_price: 22.4,
        price_change_percentage_24h: 3.15,
        total_volume: 750000000,
        market_cap: 13800000000,
        market_cap_rank: 12,
        image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      },
      {
        id: "render-token",
        symbol: "render",
        name: "Render",
        current_price: 9.85,
        price_change_percentage_24h: 8.42,
        total_volume: 520000000,
        market_cap: 5100000000,
        market_cap_rank: 13,
        image: "https://assets.coingecko.com/coins/images/11636/large/render.png",
      },
      {
        id: "shiba-inu",
        symbol: "shib",
        name: "Shiba Inu",
        current_price: 0.0000258,
        price_change_percentage_24h: 4.75,
        total_volume: 1200000000,
        market_cap: 15200000000,
        market_cap_rank: 14,
        image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
      },
      {
        id: "polkadot",
        symbol: "dot",
        name: "Polkadot",
        current_price: 8.65,
        price_change_percentage_24h: 1.85,
        total_volume: 410000000,
        market_cap: 12400000000,
        market_cap_rank: 15,
        image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      },
      {
        id: "uniswap",
        symbol: "uni",
        name: "Uniswap",
        current_price: 11.2,
        price_change_percentage_24h: 3.65,
        total_volume: 380000000,
        market_cap: 6700000000,
        market_cap_rank: 16,
        image: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
      },
      {
        id: "aptos",
        symbol: "apt",
        name: "Aptos",
        current_price: 13.4,
        price_change_percentage_24h: 6.25,
        total_volume: 480000000,
        market_cap: 6800000000,
        market_cap_rank: 17,
        image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
      },
      {
        id: "bittensor",
        symbol: "tao",
        name: "Bittensor",
        current_price: 540.2,
        price_change_percentage_24h: 9.15,
        total_volume: 290000000,
        market_cap: 3900000000,
        market_cap_rank: 18,
        image: "https://assets.coingecko.com/coins/images/31802/large/bittensor.png",
      },
      {
        id: "injective-protocol",
        symbol: "inj",
        name: "Injective",
        current_price: 28.6,
        price_change_percentage_24h: 5.4,
        total_volume: 220000000,
        market_cap: 2800000000,
        market_cap_rank: 19,
        image: "https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png",
      },
      {
        id: "fetch-ai",
        symbol: "fet",
        name: "Artificial Superintelligence",
        current_price: 1.65,
        price_change_percentage_24h: 7.12,
        total_volume: 310000000,
        market_cap: 4200000000,
        market_cap_rank: 20,
        image: "https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg",
      },
    ];
  }
}
