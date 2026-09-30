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
  category?: "crypto" | "gold" | "forex";
  chartSymbol?: string;
  unit?: string;
  sparkline_in_7d?: { price: number[] };
}

export interface GoldForexItem {
  id?: string;
  name: string;
  code: string;
  symbol?: string;
  type: "gold" | "forex";
  category?: "gold" | "forex";
  buyPrice: number;
  sellPrice: number;
  current_price?: number;
  change24h: number;
  price_change_percentage_24h?: number;
  unit: string;
  chartSymbol?: string;
  image?: string;
}

export const initialGoldForexData: GoldForexItem[] = [
  // Vàng & Kim loại quý
  {
    id: "gold-xauusd",
    name: "Vàng Thế Giới (Spot Gold)",
    code: "XAU/USD",
    symbol: "XAUUSD",
    type: "gold",
    category: "gold",
    buyPrice: 2748.5,
    sellPrice: 2749.2,
    current_price: 2748.5,
    change24h: 0.65,
    price_change_percentage_24h: 0.65,
    unit: "USD/Ounce",
    chartSymbol: "OANDA:XAUUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },
  {
    id: "gold-sjc",
    name: "Vàng Miếng SJC 9999",
    code: "SJC",
    symbol: "SJC",
    type: "gold",
    category: "gold",
    buyPrice: 88500000,
    sellPrice: 90500000,
    current_price: 90500000,
    change24h: 1.25,
    price_change_percentage_24h: 1.25,
    unit: "VND/Lượng",
    chartSymbol: "OANDA:XAUUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },
  {
    id: "gold-pnj",
    name: "Vàng Nhẫn PNJ 24K",
    code: "PNJ",
    symbol: "PNJ",
    type: "gold",
    category: "gold",
    buyPrice: 87200000,
    sellPrice: 88400000,
    current_price: 88400000,
    change24h: 0.85,
    price_change_percentage_24h: 0.85,
    unit: "VND/Lượng",
    chartSymbol: "OANDA:XAUUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },
  {
    id: "gold-doji",
    name: "Vàng Nhẫn Doji 9999",
    code: "DOJI",
    symbol: "DOJI",
    type: "gold",
    category: "gold",
    buyPrice: 87500000,
    sellPrice: 88600000,
    current_price: 88600000,
    change24h: 0.92,
    price_change_percentage_24h: 0.92,
    unit: "VND/Lượng",
    chartSymbol: "OANDA:XAUUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },
  {
    id: "silver-xagusd",
    name: "Bạc Thế Giới (Spot Silver)",
    code: "XAG/USD",
    symbol: "XAGUSD",
    type: "gold",
    category: "gold",
    buyPrice: 33.85,
    sellPrice: 33.92,
    current_price: 33.85,
    change24h: 1.45,
    price_change_percentage_24h: 1.45,
    unit: "USD/Ounce",
    chartSymbol: "OANDA:XAGUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },
  {
    id: "platinum-xptusd",
    name: "Bạch Kim Thế Giới (Platinum)",
    code: "XPT/USD",
    symbol: "XPTUSD",
    type: "gold",
    category: "gold",
    buyPrice: 1024.5,
    sellPrice: 1026.0,
    current_price: 1024.5,
    change24h: 0.38,
    price_change_percentage_24h: 0.38,
    unit: "USD/Ounce",
    chartSymbol: "OANDA:XPTUSD",
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
  },

  // Ngoại tệ Forex
  {
    id: "forex-usdvnd",
    name: "Đô la Mỹ (USD / VNĐ)",
    code: "USD",
    symbol: "USDVND",
    type: "forex",
    category: "forex",
    buyPrice: 25150,
    sellPrice: 25480,
    current_price: 25480,
    change24h: 0.05,
    price_change_percentage_24h: 0.05,
    unit: "VND",
    chartSymbol: "FX_IDC:USDVND",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-eurusd",
    name: "Euro / US Dollar (EUR/USD)",
    code: "EUR/USD",
    symbol: "EURUSD",
    type: "forex",
    category: "forex",
    buyPrice: 1.0842,
    sellPrice: 1.0845,
    current_price: 1.0845,
    change24h: -0.18,
    price_change_percentage_24h: -0.18,
    unit: "USD",
    chartSymbol: "FX:EURUSD",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-gbpusd",
    name: "Bảng Anh / USD (GBP/USD)",
    code: "GBP/USD",
    symbol: "GBPUSD",
    type: "forex",
    category: "forex",
    buyPrice: 1.2975,
    sellPrice: 1.2980,
    current_price: 1.2980,
    change24h: 0.22,
    price_change_percentage_24h: 0.22,
    unit: "USD",
    chartSymbol: "FX:GBPUSD",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-usdjpy",
    name: "USD / Yên Nhật (USD/JPY)",
    code: "USD/JPY",
    symbol: "USDJPY",
    type: "forex",
    category: "forex",
    buyPrice: 153.15,
    sellPrice: 153.25,
    current_price: 153.25,
    change24h: 0.42,
    price_change_percentage_24h: 0.42,
    unit: "JPY",
    chartSymbol: "FX:USDJPY",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-eurvnd",
    name: "Đồng Euro (EUR / VNĐ)",
    code: "EUR",
    symbol: "EURVND",
    type: "forex",
    category: "forex",
    buyPrice: 27200,
    sellPrice: 27650,
    current_price: 27650,
    change24h: -0.32,
    price_change_percentage_24h: -0.32,
    unit: "VND",
    chartSymbol: "FX_IDC:EURVND",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-jpyvnd",
    name: "Yên Nhật (JPY / VNĐ)",
    code: "JPY",
    symbol: "JPYVND",
    type: "forex",
    category: "forex",
    buyPrice: 164.2,
    sellPrice: 169.8,
    current_price: 169.8,
    change24h: -0.15,
    price_change_percentage_24h: -0.15,
    unit: "VND",
    chartSymbol: "FX_IDC:JPYVND",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-audusd",
    name: "Đô la Úc (AUD / USD)",
    code: "AUD/USD",
    symbol: "AUDUSD",
    type: "forex",
    category: "forex",
    buyPrice: 0.6575,
    sellPrice: 0.6582,
    current_price: 0.6582,
    change24h: 0.15,
    price_change_percentage_24h: 0.15,
    unit: "USD",
    chartSymbol: "FX:AUDUSD",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "forex-cnyvnd",
    name: "Nhân Dân Tệ (CNY / VNĐ)",
    code: "CNY",
    symbol: "CNYVND",
    type: "forex",
    category: "forex",
    buyPrice: 3520,
    sellPrice: 3580,
    current_price: 3580,
    change24h: 0.08,
    price_change_percentage_24h: 0.08,
    unit: "VND",
    chartSymbol: "FX_IDC:CNYVND",
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
];

const KNOWN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "XRP",
  DOGE: "Dogecoin",
  ADA: "Cardano",
  SUI: "Sui",
  AVAX: "Avalanche",
  LINK: "Chainlink",
  NEAR: "NEAR Protocol",
  PEPE: "Pepe",
  SHIB: "Shiba Inu",
  DOT: "Polkadot",
  UNI: "Uniswap",
  TAO: "Bittensor",
  RENDER: "Render",
  FET: "Artificial Superintelligence",
  APT: "Aptos",
  ICP: "Internet Computer",
  LTC: "Litecoin",
  XLM: "Stellar",
  BCH: "Bitcoin Cash",
  HBAR: "Hedera",
  TRX: "TRON",
  ATOM: "Cosmos",
  FIL: "Filecoin",
  ARB: "Arbitrum",
  OP: "Optimism",
  INJ: "Injective",
  KAS: "Kaspa",
  STX: "Stacks",
  TIA: "Celestia",
  SEI: "Sei",
  WIF: "dogwifhat",
  BONK: "Bonk",
  FLOKI: "Floki",
  POL: "Polygon (POL)",
  AAVE: "Aave",
  RUNE: "THORChain",
  CRV: "Curve DAO",
  MKR: "Maker",
  LDO: "Lido DAO",
  ENA: "Ethena",
  PENDLE: "Pendle",
  ONDO: "Ondo Finance",
  TON: "Toncoin",
  JUP: "Jupiter",
  WLD: "Worldcoin",
  PYTH: "Pyth Network",
  GALA: "Gala",
  SAND: "The Sandbox",
  MANA: "Decentraland",
  CHZ: "Chiliz",
  AXS: "Axie Infinity",
  FLOW: "Flow",
  DYDX: "dYdX",
  QNT: "Quant",
  ALGO: "Algorand",
  VET: "VeChain",
  FTM: "Fantom",
  THETA: "Theta Network",
};

export async function fetchTopCryptos(count: number = 250): Promise<CryptoItem[]> {
  try {
    // 1. Try CoinGecko API first
    const perPage = Math.min(250, count);
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    );

    if (res.ok) {
      const rawData = await res.json();
      if (Array.isArray(rawData) && rawData.length > 20) {
        return rawData.map((c: any) => ({
          id: c.id || c.symbol?.toLowerCase() || "",
          symbol: (c.symbol || "").toUpperCase(),
          name: c.name || c.symbol || "",
          current_price: typeof c.current_price === "number" ? c.current_price : 0,
          price_change_percentage_24h: typeof c.price_change_percentage_24h === "number" ? c.price_change_percentage_24h : 0,
          total_volume: typeof c.total_volume === "number" ? c.total_volume : 0,
          market_cap: typeof c.market_cap === "number" ? c.market_cap : 0,
          market_cap_rank: c.market_cap_rank || undefined,
          image: c.image || `https://assets.coingecko.com/coins/images/1/large/${c.id}.png`,
          category: "crypto",
          chartSymbol: `BINANCE:${(c.symbol || "").toUpperCase()}USDT`,
          sparkline_in_7d: c.sparkline_in_7d,
        }));
      }
    }
  } catch (err) {
    console.warn("CoinGecko API unavailable, loading full Binance market tickers...");
  }

  // 2. Comprehensive Binance Fallback: Fetch ALL 350+ active USDT pairs sorted by 24h volume
  try {
    const binanceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr", { next: { revalidate: 30 } });
    if (binanceRes.ok) {
      const binanceData = await binanceRes.json();
      if (Array.isArray(binanceData) && binanceData.length > 0) {
        const usdtPairs = binanceData
          .filter(
            (item: any) =>
              item.symbol.endsWith("USDT") &&
              !item.symbol.includes("UP") &&
              !item.symbol.includes("DOWN") &&
              !item.symbol.includes("BEAR") &&
              !item.symbol.includes("BULL")
          )
          .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, count);

        return usdtPairs.map((item: any, index: number) => {
          const rawSymbol = item.symbol.replace("USDT", "").toUpperCase();
          const cleanName = KNOWN_NAMES[rawSymbol] || rawSymbol;
          const price = parseFloat(item.lastPrice);
          const volume = parseFloat(item.quoteVolume);
          const change = parseFloat(item.priceChangePercent);

          return {
            id: rawSymbol.toLowerCase(),
            symbol: rawSymbol,
            name: cleanName,
            current_price: price,
            price_change_percentage_24h: change,
            total_volume: volume,
            market_cap: volume * 15,
            market_cap_rank: index + 1,
            image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${rawSymbol.toLowerCase()}.png`,
            category: "crypto",
            chartSymbol: `BINANCE:${rawSymbol}USDT`,
          };
        });
      }
    }
  } catch (binanceErr) {
    console.warn("Binance ticker fetch failed", binanceErr);
  }

  // 3. Static Essential Fallback
  return [
    { id: "btc", symbol: "BTC", name: "Bitcoin", current_price: 83500, price_change_percentage_24h: 2.4, total_volume: 38000000000, market_cap: 1650000000000, market_cap_rank: 1, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", category: "crypto" },
    { id: "eth", symbol: "ETH", name: "Ethereum", current_price: 3420, price_change_percentage_24h: 1.8, total_volume: 2100000000, market_cap: 410000000000, market_cap_rank: 2, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", category: "crypto" },
    { id: "sol", symbol: "SOL", name: "Solana", current_price: 198.5, price_change_percentage_24h: 5.2, total_volume: 7200000000, market_cap: 93000000000, market_cap_rank: 3, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", category: "crypto" },
    { id: "bnb", symbol: "BNB", name: "BNB", current_price: 665.0, price_change_percentage_24h: -0.4, total_volume: 1800000000, market_cap: 97000000000, market_cap_rank: 4, image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", category: "crypto" },
    { id: "xrp", symbol: "XRP", name: "XRP", current_price: 1.48, price_change_percentage_24h: 8.9, total_volume: 4900000000, market_cap: 84000000000, market_cap_rank: 5, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", category: "crypto" },
    { id: "doge", symbol: "DOGE", name: "Dogecoin", current_price: 0.38, price_change_percentage_24h: -2.1, total_volume: 3200000000, market_cap: 56000000000, market_cap_rank: 6, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", category: "crypto" },
    { id: "sui", symbol: "SUI", name: "Sui", current_price: 3.42, price_change_percentage_24h: 7.2, total_volume: 1950000000, market_cap: 9800000000, market_cap_rank: 7, image: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png", category: "crypto" },
    { id: "pepe", symbol: "PEPE", name: "Pepe", current_price: 0.000021, price_change_percentage_24h: 12.4, total_volume: 2400000000, market_cap: 9100000000, market_cap_rank: 8, image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png", category: "crypto" },
  ];
}
