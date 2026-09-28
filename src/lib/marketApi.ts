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

export async function fetchTopCryptos(count: number = 250): Promise<CryptoItem[]> {
  try {
    const perPage = Math.min(250, count);
    const numPages = Math.ceil(count / perPage);

    // Fetch pages in parallel
    const pagePromises = Array.from({ length: numPages }, (_, i) =>
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${
          i + 1
        }&sparkline=true&price_change_percentage=24h`,
        { next: { revalidate: 60 } }
      )
        .then((res) => {
          if (!res.ok) throw new Error(`CoinGecko page ${i + 1} failed: ${res.status}`);
          return res.json();
        })
        .catch((err) => {
          console.warn(`Could not fetch page ${i + 1}:`, err);
          return [];
        })
    );

    const pagesData = await Promise.all(pagePromises);
    const combinedRaw = pagesData.flat();

    if (combinedRaw.length === 0) {
      throw new Error("No data returned from CoinGecko");
    }

    const data: CryptoItem[] = combinedRaw.map((c: any) => ({
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
    console.warn("CoinGecko rate limit or offline, using fallback list");
    // Comprehensive fallback
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
        current_price: 1.48,
        price_change_percentage_24h: 8.92,
        total_volume: 4900000000,
        market_cap: 84000000000,
        market_cap_rank: 5,
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      },
      {
        id: "dogecoin",
        symbol: "doge",
        name: "Dogecoin",
        current_price: 0.385,
        price_change_percentage_24h: -2.31,
        total_volume: 3200000000,
        market_cap: 56000000000,
        market_cap_rank: 6,
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      },
      {
        id: "cardano",
        symbol: "ada",
        name: "Cardano",
        current_price: 0.825,
        price_change_percentage_24h: 4.15,
        total_volume: 1400000000,
        market_cap: 29500000000,
        market_cap_rank: 7,
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      },
      {
        id: "sui",
        symbol: "sui",
        name: "Sui",
        current_price: 3.42,
        price_change_percentage_24h: 7.21,
        total_volume: 1950000000,
        market_cap: 9800000000,
        market_cap_rank: 8,
        image: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png",
      },
      {
        id: "avalanche-2",
        symbol: "avax",
        name: "Avalanche",
        current_price: 38.4,
        price_change_percentage_24h: 1.85,
        total_volume: 850000000,
        market_cap: 15600000000,
        market_cap_rank: 9,
        image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
      },
      {
        id: "chainlink",
        symbol: "link",
        name: "Chainlink",
        current_price: 18.75,
        price_change_percentage_24h: 3.12,
        total_volume: 680000000,
        market_cap: 11400000000,
        market_cap_rank: 10,
        image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      },
      {
        id: "near",
        symbol: "near",
        name: "NEAR Protocol",
        current_price: 6.85,
        price_change_percentage_24h: 4.62,
        total_volume: 720000000,
        market_cap: 8300000000,
        market_cap_rank: 11,
        image: "https://assets.coingecko.com/coins/images/10365/large/near.png",
      },
      {
        id: "pepe",
        symbol: "pepe",
        name: "Pepe",
        current_price: 0.0000215,
        price_change_percentage_24h: 12.4,
        total_volume: 2400000000,
        market_cap: 9100000000,
        market_cap_rank: 12,
        image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png",
      },
      {
        id: "shiba-inu",
        symbol: "shib",
        name: "Shiba Inu",
        current_price: 0.0000258,
        price_change_percentage_24h: -1.45,
        total_volume: 1100000000,
        market_cap: 15200000000,
        market_cap_rank: 13,
        image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
      },
      {
        id: "polkadot",
        symbol: "dot",
        name: "Polkadot",
        current_price: 8.92,
        price_change_percentage_24h: 2.75,
        total_volume: 480000000,
        market_cap: 12800000000,
        market_cap_rank: 14,
        image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      },
      {
        id: "uniswap",
        symbol: "uni",
        name: "Uniswap",
        current_price: 11.45,
        price_change_percentage_24h: 5.14,
        total_volume: 380000000,
        market_cap: 6900000000,
        market_cap_rank: 15,
        image: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
      },
      {
        id: "quant-network",
        symbol: "qnt",
        name: "Quant",
        current_price: 264.51,
        price_change_percentage_24h: 52.58,
        total_volume: 1250000000,
        market_cap: 3850000000,
        market_cap_rank: 16,
        image: "https://assets.coingecko.com/coins/images/3370/large/5F9Sn7Pp_400x400.jpg",
      },
    ];
  }
}
