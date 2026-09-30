import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 30;

const KNOWN_COIN_DETAILS: Record<string, { name: string; image?: string }> = {
  BTC: { name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  ETH: { name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  SOL: { name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  BNB: { name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  XRP: { name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  DOGE: { name: "Dogecoin", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  ADA: { name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  SUI: { name: "Sui", image: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png" },
  AVAX: { name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  LINK: { name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
  NEAR: { name: "NEAR Protocol", image: "https://assets.coingecko.com/coins/images/10365/large/near.png" },
  PEPE: { name: "Pepe", image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png" },
  SHIB: { name: "Shiba Inu", image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png" },
  DOT: { name: "Polkadot", image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  UNI: { name: "Uniswap", image: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png" },
  TAO: { name: "Bittensor", image: "https://assets.coingecko.com/coins/images/30048/large/bittensor.png" },
  RENDER: { name: "Render", image: "https://assets.coingecko.com/coins/images/11636/large/rndr.png" },
  FET: { name: "Artificial Superintelligence", image: "https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg" },
  APT: { name: "Aptos", image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png" },
  ICP: { name: "Internet Computer", image: "https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png" },
  LTC: { name: "Litecoin", image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  XLM: { name: "Stellar", image: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png" },
  BCH: { name: "Bitcoin Cash", image: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png" },
  HBAR: { name: "Hedera", image: "https://assets.coingecko.com/coins/images/3688/large/hbar.png" },
  TRX: { name: "TRON", image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png" },
  ATOM: { name: "Cosmos", image: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png" },
  FIL: { name: "Filecoin", image: "https://assets.coingecko.com/coins/images/12817/large/filecoin.png" },
  ARB: { name: "Arbitrum", image: "https://assets.coingecko.com/coins/images/16547/large/arbitrum_logo.png" },
  OP: { name: "Optimism", image: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png" },
  INJ: { name: "Injective", image: "https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png" },
  KAS: { name: "Kaspa", image: "https://assets.coingecko.com/coins/images/28898/large/kaspa.png" },
  STX: { name: "Stacks", image: "https://assets.coingecko.com/coins/images/2069/large/Stacks_Logo_Normal.png" },
  TIA: { name: "Celestia", image: "https://assets.coingecko.com/coins/images/31967/large/celestia.png" },
  SEI: { name: "Sei", image: "https://assets.coingecko.com/coins/images/28205/large/sei.png" },
  WIF: { name: "dogwifhat", image: "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg" },
  BONK: { name: "Bonk", image: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg" },
  FLOKI: { name: "Floki", image: "https://assets.coingecko.com/coins/images/16746/large/FLOKI.png" },
  POL: { name: "Polygon (POL)", image: "https://assets.coingecko.com/coins/images/4713/large/polygon.png" },
  AAVE: { name: "Aave", image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png" },
  RUNE: { name: "THORChain", image: "https://assets.coingecko.com/coins/images/6595/large/thorchain.png" },
  CRV: { name: "Curve DAO", image: "https://assets.coingecko.com/coins/images/12124/large/Curve.png" },
  MKR: { name: "Maker", image: "https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png" },
  LDO: { name: "Lido DAO", image: "https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png" },
  ENA: { name: "Ethena", image: "https://assets.coingecko.com/coins/images/36530/large/ethena.png" },
  PENDLE: { name: "Pendle", image: "https://assets.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png" },
  ONDO: { name: "Ondo Finance", image: "https://assets.coingecko.com/coins/images/34685/large/ondo.png" },
  TON: { name: "Toncoin", image: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png" },
  JUP: { name: "Jupiter", image: "https://assets.coingecko.com/coins/images/34188/large/jup.png" },
  WLD: { name: "Worldcoin", image: "https://assets.coingecko.com/coins/images/31062/large/worldcoin.png" },
  PYTH: { name: "Pyth Network", image: "https://assets.coingecko.com/coins/images/33058/large/pyth.png" },
  GALA: { name: "Gala", image: "https://assets.coingecko.com/coins/images/12493/large/GALA-COINGECKO.png" },
  SAND: { name: "The Sandbox", image: "https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg" },
  MANA: { name: "Decentraland", image: "https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png" },
  CHZ: { name: "Chiliz", image: "https://assets.coingecko.com/coins/images/8834/large/Chiliz.png" },
  AXS: { name: "Axie Infinity", image: "https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png" },
  FLOW: { name: "Flow", image: "https://assets.coingecko.com/coins/images/13446/large/5f6294c0c7a8cda55d1c4b7b_symbol.png" },
  DYDX: { name: "dYdX", image: "https://assets.coingecko.com/coins/images/17500/large/dydx.png" },
  QNT: { name: "Quant", image: "https://assets.coingecko.com/coins/images/3370/large/5daae7ac8531e8bf1125ae83_Quant_Logo_Color_Square.png" },
  ALGO: { name: "Algorand", image: "https://assets.coingecko.com/coins/images/4380/large/download.png" },
  VET: { name: "VeChain", image: "https://assets.coingecko.com/coins/images/1167/large/VET_Token_Icon.png" },
  FTM: { name: "Fantom", image: "https://assets.coingecko.com/coins/images/4001/large/Fantom_round.png" },
  THETA: { name: "Theta Network", image: "https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png" },
  ZEC: { name: "Zcash", image: "https://assets.coingecko.com/coins/images/486/large/circle-zcash-color.png" },
  USDC: { name: "USDC", image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
  FDUSD: { name: "First Digital USD", image: "https://assets.coingecko.com/coins/images/31079/large/FDUSD.png" },
  NEO: { name: "NEO", image: "https://assets.coingecko.com/coins/images/480/large/NEO_512_512.png" },
  EOS: { name: "EOS", image: "https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png" },
  IOTA: { name: "IOTA", image: "https://assets.coingecko.com/coins/images/692/large/IOTA_Swirl.png" },
  ETC: { name: "Ethereum Classic", image: "https://assets.coingecko.com/coins/images/453/large/ethereum-classic-logo.png" },
  XMR: { name: "Monero", image: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png" },
  KSM: { name: "Kusama", image: "https://assets.coingecko.com/coins/images/9568/large/m4zRhP5e_400x400.jpg" },
  EGLD: { name: "MultiversX", image: "https://assets.coingecko.com/coins/images/12335/large/egld-token-logo.png" },
  FTT: { name: "FTX Token", image: "https://assets.coingecko.com/coins/images/9026/large/Ftx_token_logo.png" },
  TWT: { name: "Trust Wallet Token", image: "https://assets.coingecko.com/coins/images/11085/large/Trust.png" },
  CFX: { name: "Conflux", image: "https://assets.coingecko.com/coins/images/13079/large/3.png" },
  ORDI: { name: "ORDI", image: "https://assets.coingecko.com/coins/images/30162/large/ordi.png" },
  SATS: { name: "SATS (Ordinals)", image: "https://assets.coingecko.com/coins/images/31034/large/sats.png" },
  MEME: { name: "Memecoin", image: "https://assets.coingecko.com/coins/images/32578/large/meme.png" },
  BLUR: { name: "Blur", image: "https://assets.coingecko.com/coins/images/28453/large/blur.png" },
  ARKM: { name: "Arkham", image: "https://assets.coingecko.com/coins/images/30929/large/arkm.png" },
  ALT: { name: "Altlayer", image: "https://assets.coingecko.com/coins/images/34720/large/altlayer.png" },
  STRK: { name: "Starknet", image: "https://assets.coingecko.com/coins/images/35344/large/starknet.png" },
  W: { name: "Wormhole", image: "https://assets.coingecko.com/coins/images/35087/large/wormhole.png" },
  ETHFI: { name: "Ether.fi", image: "https://assets.coingecko.com/coins/images/35958/large/etherfi.png" },
  BB: { name: "BounceBit", image: "https://assets.coingecko.com/coins/images/37397/large/bouncebit.png" },
  NOT: { name: "Notcoin", image: "https://assets.coingecko.com/coins/images/37774/large/notcoin.png" },
  IO: { name: "io.net", image: "https://assets.coingecko.com/coins/images/38150/large/io.png" },
  ZK: { name: "ZKsync", image: "https://assets.coingecko.com/coins/images/38075/large/zksync.png" },
  ZRO: { name: "LayerZero", image: "https://assets.coingecko.com/coins/images/38641/large/layerzero.png" },
  DOGS: { name: "DOGS", image: "https://assets.coingecko.com/coins/images/39739/large/dogs.png" },
  HMSTR: { name: "Hamster Kombat", image: "https://assets.coingecko.com/coins/images/39109/large/hamster.png" },
  CATI: { name: "Catizen", image: "https://assets.coingecko.com/coins/images/39567/large/catizen.png" },
  NEIRO: { name: "Neiro", image: "https://assets.coingecko.com/coins/images/39535/large/neiro.png" },
  TURBO: { name: "Turbo", image: "https://assets.coingecko.com/coins/images/30116/large/Turbo.png" },
  BABYDOGE: { name: "Baby Doge Coin", image: "https://assets.coingecko.com/coins/images/16125/large/babydoge.jpg" },
  "1000SATS": { name: "1000SATS", image: "https://assets.coingecko.com/coins/images/31034/large/sats.png" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = parseInt(searchParams.get("count") || "300", 10);

  try {
    const binanceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
      next: { revalidate: 30 },
    });

    if (!binanceRes.ok) {
      throw new Error(`Binance HTTP error ${binanceRes.status}`);
    }

    const binanceData = await binanceRes.json();
    if (!Array.isArray(binanceData) || binanceData.length === 0) {
      throw new Error("Empty data from Binance");
    }

    // Filter valid USDT spot trading pairs (excluding leveraged tokens)
    const usdtPairs = binanceData
      .filter((item: any) => {
        const s = item.symbol;
        return (
          s.endsWith("USDT") &&
          !s.includes("UP") &&
          !s.includes("DOWN") &&
          !s.includes("BEAR") &&
          !s.includes("BULL") &&
          parseFloat(item.lastPrice) > 0 &&
          parseFloat(item.quoteVolume) > 10000
        );
      })
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, count);

    const items = usdtPairs.map((item: any, index: number) => {
      const rawSymbol = item.symbol.replace("USDT", "").toUpperCase();
      const known = KNOWN_COIN_DETAILS[rawSymbol];
      const cleanName = known?.name || rawSymbol;
      const price = parseFloat(item.lastPrice);
      const volume = parseFloat(item.quoteVolume);
      const change = parseFloat(item.priceChangePercent);

      const logo =
        known?.image ||
        `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${rawSymbol.toLowerCase()}.png`;

      return {
        id: rawSymbol.toLowerCase(),
        symbol: rawSymbol,
        name: cleanName,
        current_price: price,
        price_change_percentage_24h: change,
        total_volume: volume,
        market_cap: volume * 18,
        market_cap_rank: index + 1,
        high_24h: parseFloat(item.highPrice) || price * 1.05,
        low_24h: parseFloat(item.lowPrice) || price * 0.95,
        image: logo,
        category: "crypto",
        chartSymbol: `BINANCE:${rawSymbol}USDT`,
      };
    });

    return NextResponse.json({ success: true, count: items.length, cryptos: items });
  } catch (error: any) {
    console.error("Failed to fetch cryptos route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load market cryptos" },
      { status: 500 }
    );
  }
}
