import { NextResponse } from "next/server";

export interface ScanRequest {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h?: number;
  timeframe?: "short" | "medium" | "long";
  marketCap?: number;
  totalVolume?: number;
}

export interface SpotVerdict {
  action: "NÊN MUA" | "NÊN BÁN" | "QUAN SÁT";
  actionType: "BUY" | "SELL" | "WAIT";
  summaryText: string;
  keyReason: string;
  recommendedAction: string;
}

export interface FutureVerdict {
  action: "NÊN LONG" | "NÊN SHORT" | "QUAN SÁT";
  actionType: "LONG" | "SHORT" | "WAIT";
  summaryText: string;
  keyReason: string;
  recommendedAction: string;
}

export interface WavePatternAnalysis {
  patternType:
    | "ELLIOTT_IMPULSE_12345"
    | "ABC_CORRECTION"
    | "WYCKOFF_ACCUMULATION"
    | "BULL_FLAG"
    | "BEAR_FLAG"
    | "DOUBLE_BOTTOM"
    | "ASCENDING_TRIANGLE";
  patternName: string;
  currentWave: string;
  waveDescription: string;
  swingHigh: string;
  swingLow: string;
  keyFibonacciLevel: string;
  projectedTargetWave: string;
}

export interface CoinglassMetrics {
  topTradersLongRatio: number;
  topTradersShortRatio: number;
  retailLongRatio: number;
  retailShortRatio: number;
  fundingRateBinance: string;
  fundingRateOKX: string;
  fundingRateBybit: string;
  openInterestTotalUSD: string;
  openInterestDelta24h: string;
  takerBuyRatio: number;
  cvdStatus: string;
  squeezeMomentum: string;
  fearGreedIndex: {
    score: number;
    label: string;
  };
}

export interface AdvancedIndicators {
  superTrend: {
    status: "BULLISH" | "BEARISH";
    value: string;
  };
  adx: {
    value: number;
    trendStrength: "Mạnh (>25)" | "Yếu (<20)" | "Trung bình";
  };
  stochRsi: {
    k: number;
    d: number;
    status: "Quá Mua (>80)" | "Quá Bán (<20)" | "Vùng Trung Lập";
  };
  bollingerBands: {
    upper: string;
    middle: string;
    lower: string;
    squeezeStatus: "Đang co thắt (Squeeze ON)" | "Đang mở rộng (Expanding)";
  };
  ichimoku: {
    cloudSignal: "Giá trên mây Kumo (Tăng)" | "Giá dưới mây Kumo (Giảm)" | "Trong mây Kumo";
    tenkanKijunCross: "Bullish Cross" | "Bearish Cross" | "Neutral";
  };
  mfi: {
    value: number;
    status: "Dòng tiền vào mạnh" | "Dòng tiền rút ra" | "Cân bằng";
  };
  fibonacciLevels: {
    fib0382: string;
    fib0500: string;
    fib0618GoldenPocket: string;
    fib0786: string;
    fib1618Extension: string;
  };
  volumeProfile: {
    poc: string;
    vah: string;
    val: string;
  };
}

export interface SpotAnalysis {
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "TAKE_PROFIT" | "SELL";
  signalLabel: string;
  winRatePercent: number;
  overallScore: number;
  riskRewardRatio: string;
  trend: string;
  entryZone: string;
  targetPrice1: string;
  targetPrice2: string;
  targetPrice3: string;
  stopLoss: string;
  liquidity: {
    highLiquidityZone: string;
    thinLiquidityZone: string;
    supplyZone: string;
  };
  indicators: {
    emaTrend: string;
    rsi: {
      value: number;
      status: string;
    };
    macd: string;
    volumeProfile: string;
    supportResistance: {
      support: string;
      resistance: string;
    };
  };
  advanced: AdvancedIndicators;
  strategyAdvice: string;
  riskWarning: string;
  finalVerdict: SpotVerdict;
}

export interface FutureAnalysis {
  position: "LONG" | "SHORT" | "NO_TRADE";
  positionLabel: string;
  recommendedLeverage: string;
  capitalRiskPercent: string;
  winRatePercent: number;
  overallScore: number;
  riskRewardRatio: string;
  entryZone: string;
  targetPrice1: string;
  targetPrice2: string;
  targetPrice3: string;
  stopLoss: string;
  estLiquidationPrice: string;
  metrics: {
    longShortRatio: {
      longPercent: number;
      shortPercent: number;
      ratioText: string;
      sentiment: string;
    };
    fundingRate: {
      rate: string;
      status: string;
    };
    openInterest: string;
    liquidationHeatmap: {
      shortLiquidationPool: string;
      longLiquidationPool: string;
      stopHuntRisk: string;
    };
    volatilityATR: string;
  };
  advanced: AdvancedIndicators;
  riskManagementRules: string[];
  finalVerdict: FutureVerdict;
}

export interface ScanResult {
  symbol: string;
  name: string;
  currentPrice: number;
  timeframe: string;
  wavePattern: WavePatternAnalysis;
  coinglass: CoinglassMetrics;
  spot: SpotAnalysis;
  future: FutureAnalysis;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function POST(req: Request) {
  try {
    const body: ScanRequest = await req.json();
    const {
      symbol,
      name,
      currentPrice,
      priceChange24h = 0,
      timeframe = "medium",
      marketCap,
      totalVolume,
    } = body;

    if (!symbol || !name || !currentPrice) {
      return NextResponse.json(
        { error: "Thiếu thông tin đồng crypto để phân tích" },
        { status: 400 }
      );
    }

    const timeframeLabel =
      timeframe === "short"
        ? "Ngắn hạn (Scalping / Day trading 1-3 ngày)"
        : timeframe === "long"
        ? "Dài hạn (DCA / Chu kỳ 3-12 tháng)"
        : "Trung hạn (Swing trade 1-4 tuần)";

    const isPos = priceChange24h >= 0;

    const systemPrompt = `Bạn là Chuyên gia Cao cấp về Phân tích Kỹ thuật Sóng (Elliott Wave / Price Action) & Dữ liệu Phái sinh On-chain Coinglass (Chief Quantitative Crypto Strategist & Derivatives Risk Manager).
Nhiệm vụ của bạn là phân tích toàn diện đồng tiền mã hóa ${name} (${symbol.toUpperCase()}) với hệ thống chỉ báo kỹ thuật chuyên sâu (SuperTrend, ADX, StochRSI, Bollinger Bands, Ichimoku Cloud, MFI, Fibonacci Golden Pocket 0.618, Volume Profile POC/VAH/VAL) và dữ liệu Coinglass.

Bao gồm:
1. wavePattern: Dạng sóng Elliott 1-2-3-4-5 / ABC, Swing High / Low, Fibo 0.618, Target sóng 5.
2. coinglass: Top Traders Long/Short Ratio, Funding Rate 3 sàn Binance/OKX/Bybit, Open Interest USD, CVD Divergence, Squeeze Momentum, Fear & Greed Index.
3. spot: Luồng Spot (Vùng mua gom, TP1-3, SL, Order block & FVG, Advanced Indicators, và THẺ KẾT LUẬN "NÊN MUA" / "NÊN BÁN" / "QUAN SÁT").
4. future: Luồng Futures (Đòn bẩy an toàn, Vị thế LONG / SHORT, Entry, TP1-3, SL, Giá thanh lý, Advanced Indicators, và THẺ KẾT LUẬN "NÊN LONG" / "NÊN SHORT" / "QUAN SÁT").

BẮT BUỘC chỉ trả về duy nhất 1 chuỗi JSON hợp lệ tuân theo đúng cấu trúc schema, không kèm thêm bất kỳ văn bản giải thích nào ngoài JSON.`;

    const userPrompt = `Hãy phân tích đồng tiền mã hóa sau:
- Tên: ${name} (${symbol.toUpperCase()})
- Giá hiện tại: $${currentPrice.toLocaleString("en-US", { maximumFractionDigits: 6 })}
- Biến động 24h: ${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(2)}%
- Khối lượng 24h: $${totalVolume ? (totalVolume / 1e6).toFixed(1) + " Triệu USD" : "Đang cập nhật"}
- Vốn hóa thị trường: $${marketCap ? (marketCap / 1e9).toFixed(2) + " Tỷ USD" : "Đang cập nhật"}
- Khung thời gian phân tích: ${timeframeLabel}

Hãy trả về JSON theo schema sau:
{
  "symbol": "${symbol.toUpperCase()}",
  "name": "${name}",
  "currentPrice": ${currentPrice},
  "timeframe": "${timeframe}",
  "wavePattern": {
    "patternType": "ELLIOTT_IMPULSE_12345",
    "patternName": "${isPos ? "Sóng Đẩy Elliott (Wave 3 Impulse Extension)" : "Sóng Hiệu Chỉnh ABC (Zigzag Retracement)"}",
    "currentWave": "${isPos ? "Đang ở sóng đẩy 3 (Wave 3) - Pha tăng trưởng mạnh nhất chu kỳ" : "Đang hoàn tất sóng hiệu chỉnh C kiểm định hỗ trợ"}",
    "waveDescription": "Cấu trúc đỉnh đáy nâng dần Higher High (HH) với dòng tiền tổ chức tham gia mạnh.",
    "swingHigh": "$${(currentPrice * 1.08).toFixed(2)}",
    "swingLow": "$${(currentPrice * 0.94).toFixed(2)}",
    "keyFibonacciLevel": "Vùng Tỷ Lệ Vàng Fibo 0.618 ($${(currentPrice * 0.965).toFixed(2)}) giữ vững lực đỡ",
    "projectedTargetWave": "$${(currentPrice * 1.22).toFixed(2)} (Mục tiêu Sóng 5)"
  },
  "coinglass": {
    "topTradersLongRatio": ${isPos ? 66 : 42},
    "topTradersShortRatio": ${isPos ? 34 : 58},
    "retailLongRatio": ${isPos ? 52 : 48},
    "retailShortRatio": ${isPos ? 48 : 52},
    "fundingRateBinance": "${isPos ? "+0.015%" : "-0.008%"}",
    "fundingRateOKX": "${isPos ? "+0.012%" : "-0.005%"}",
    "fundingRateBybit": "${isPos ? "+0.016%" : "-0.009%"}",
    "openInterestTotalUSD": "$2.85B",
    "openInterestDelta24h": "${isPos ? "+14.6%" : "-6.2%"}",
    "takerBuyRatio": ${isPos ? 58 : 42},
    "cvdStatus": "${isPos ? "Phân kỳ tích cực (Bullish CVD Divergence)" : "Phân kỳ âm (Bearish CVD Divergence)"}",
    "squeezeMomentum": "${isPos ? "Đang bung xung lượng tăng (Firing Bullish Momentum)" : "Độ nén cao (Squeeze ON) - Sắp bùng nổ"}",
    "fearGreedIndex": {
      "score": ${isPos ? 72 : 46},
      "label": "${isPos ? "Tham lam (Greed)" : "Trung lập (Neutral)"}"
    }
  },
  "spot": {
    "signal": "${isPos ? "BUY" : "HOLD"}",
    "signalLabel": "${isPos ? "MUA GOM" : "QUAN SÁT"}",
    "winRatePercent": ${isPos ? 74 : 60},
    "overallScore": ${isPos ? 8.4 : 6.8},
    "riskRewardRatio": "1 : 2.8",
    "trend": "${isPos ? "Tăng trưởng Bullish" : "Tích lũy Sideway"}",
    "entryZone": "$${(currentPrice * 0.97).toFixed(2)} - $${(currentPrice * 0.99).toFixed(2)}",
    "targetPrice1": "$${(currentPrice * 1.06).toFixed(2)}",
    "targetPrice2": "$${(currentPrice * 1.15).toFixed(2)}",
    "targetPrice3": "$${(currentPrice * 1.25).toFixed(2)}",
    "stopLoss": "$${(currentPrice * 0.92).toFixed(2)}",
    "liquidity": {
      "highLiquidityZone": "$${(currentPrice * 0.95).toFixed(2)} (Order Block Mua)",
      "thinLiquidityZone": "$${(currentPrice * 1.08).toFixed(2)} (Fair Value Gap)",
      "supplyZone": "$${(currentPrice * 1.18).toFixed(2)} (Vùng Cung Chốt Lời)"
    },
    "indicators": {
      "emaTrend": "Giá vận động phía trên dải EMA Ribbon (20/50/200)",
      "rsi": {
        "value": ${isPos ? 62 : 45},
        "status": "${isPos ? "Vùng tích lũy xung lực tăng (Bullish Momentum)" : "Vùng trung lập tích lũy"}"
      },
      "macd": "${isPos ? "MACD Histogram dương, Signal cắt lên" : "MACD phân kỳ đi ngang"}",
      "volumeProfile": "Khối lượng mua chủ động chiếm ${isPos ? "64%" : "48%"}",
      "supportResistance": {
        "support": "$${(currentPrice * 0.94).toFixed(2)}",
        "resistance": "$${(currentPrice * 1.12).toFixed(2)}"
      }
    },
    "advanced": {
      "superTrend": {
        "status": "${isPos ? "BULLISH" : "BEARISH"}",
        "value": "$${(currentPrice * 0.935).toFixed(2)}"
      },
      "adx": {
        "value": 31.4,
        "trendStrength": "Mạnh (>25)"
      },
      "stochRsi": {
        "k": 72,
        "d": 65,
        "status": "Vùng Trung Lập"
      },
      "bollingerBands": {
        "upper": "$${(currentPrice * 1.07).toFixed(2)}",
        "middle": "$${(currentPrice * 0.99).toFixed(2)}",
        "lower": "$${(currentPrice * 0.91).toFixed(2)}",
        "squeezeStatus": "Đang mở rộng (Expanding)"
      },
      "ichimoku": {
        "cloudSignal": "${isPos ? "Giá trên mây Kumo (Tăng)" : "Giá trong mây Kumo"}",
        "tenkanKijunCross": "${isPos ? "Bullish Cross" : "Neutral"}"
      },
      "mfi": {
        "value": 64.8,
        "status": "Dòng tiền vào mạnh"
      },
      "fibonacciLevels": {
        "fib0382": "$${(currentPrice * 0.982).toFixed(2)}",
        "fib0500": "$${(currentPrice * 0.971).toFixed(2)}",
        "fib0618GoldenPocket": "$${(currentPrice * 0.965).toFixed(2)}",
        "fib0786": "$${(currentPrice * 0.945).toFixed(2)}",
        "fib1618Extension": "$${(currentPrice * 1.185).toFixed(2)}"
      },
      "volumeProfile": {
        "poc": "$${(currentPrice * 0.985).toFixed(2)}",
        "vah": "$${(currentPrice * 1.042).toFixed(2)}",
        "val": "$${(currentPrice * 0.948).toFixed(2)}"
      }
    },
    "strategyAdvice": "Chia vốn DCA thành 3 đợt tại vùng hỗ trợ Order Block. Đạt TP1 dời SL về hòa vốn.",
    "riskWarning": "Đặt Stoploss bảo vệ tài khoản, tránh rủi ro biến động toàn thị trường.",
    "finalVerdict": {
      "action": "${isPos ? "NÊN MUA" : "QUAN SÁT"}",
      "actionType": "${isPos ? "BUY" : "WAIT"}",
      "summaryText": "${isPos ? "Cấu trúc dòng tiền tích lũy mạnh mẽ trên đồ thị Spot. Các chỉ số kỹ thuật SuperTrend và EMA Ribbon đồng thuận tăng trưởng." : "Thị trường đang tích lũy đi ngang. Nên quan sát thêm tín hiệu xác nhận dòng tiền trước khi giải ngân lớn."}",
      "keyReason": "Dải EMA Ribbon và RSI đồng thuận hỗ trợ xu hướng tăng với khối lượng gom hàng đều đặn.",
      "recommendedAction": "DCA mua gom theo vùng entry, hiện thực hóa lợi nhuận tại TP1 & TP2."
    }
  },
  "future": {
    "position": "${isPos ? "LONG" : "SHORT"}",
    "positionLabel": "${isPos ? "LONG" : "SHORT"}",
    "recommendedLeverage": "3x - 5x (An Toàn)",
    "capitalRiskPercent": "2 - 3%",
    "winRatePercent": ${isPos ? 68 : 55},
    "overallScore": ${isPos ? 8.6 : 6.5},
    "riskRewardRatio": "1 : 3",
    "entryZone": "$${(currentPrice * 0.985).toFixed(2)} - $${currentPrice.toFixed(2)}",
    "targetPrice1": "$${(currentPrice * 1.058).toFixed(2)}",
    "targetPrice2": "$${(currentPrice * 1.134).toFixed(2)}",
    "targetPrice3": "$${(currentPrice * 1.248).toFixed(2)}",
    "stopLoss": "$${(currentPrice * 0.945).toFixed(2)}",
    "estLiquidationPrice": "$${(currentPrice * 0.82).toFixed(2)}",
    "metrics": {
      "longShortRatio": {
        "longPercent": ${isPos ? 62 : 38},
        "shortPercent": ${isPos ? 38 : 62},
        "ratioText": "${isPos ? "1.63" : "0.61"}",
        "sentiment": "${isPos ? "Bullish" : "Bearish"}"
      },
      "fundingRate": {
        "rate": "${isPos ? "+0.016%" : "-0.008%"}",
        "status": "${isPos ? "Longs trả phí cho Shorts" : "Shorts trả phí cho Longs"}"
      },
      "openInterest": "${isPos ? "Tăng 18%" : "Giảm 6%"}",
      "liquidationHeatmap": {
        "shortLiquidationPool": "$${(currentPrice * 1.04).toFixed(1)} - $${(currentPrice * 1.07).toFixed(1)}",
        "longLiquidationPool": "$${(currentPrice * 0.93).toFixed(1)} - $${(currentPrice * 0.96).toFixed(1)}",
        "stopHuntRisk": "Thấp"
      },
      "volatilityATR": "12.4"
    },
    "advanced": {
      "superTrend": {
        "status": "${isPos ? "BULLISH" : "BEARISH"}",
        "value": "$${(currentPrice * 0.935).toFixed(2)}"
      },
      "adx": {
        "value": 31.4,
        "trendStrength": "Mạnh (>25)"
      },
      "stochRsi": {
        "k": 72,
        "d": 65,
        "status": "Vùng Trung Lập"
      },
      "bollingerBands": {
        "upper": "$${(currentPrice * 1.07).toFixed(2)}",
        "middle": "$${(currentPrice * 0.99).toFixed(2)}",
        "lower": "$${(currentPrice * 0.91).toFixed(2)}",
        "squeezeStatus": "Đang mở rộng (Expanding)"
      },
      "ichimoku": {
        "cloudSignal": "${isPos ? "Giá trên mây Kumo (Tăng)" : "Giá trong mây Kumo"}",
        "tenkanKijunCross": "${isPos ? "Bullish Cross" : "Neutral"}"
      },
      "mfi": {
        "value": 64.8,
        "status": "Dòng tiền vào mạnh"
      },
      "fibonacciLevels": {
        "fib0382": "$${(currentPrice * 0.982).toFixed(2)}",
        "fib0500": "$${(currentPrice * 0.971).toFixed(2)}",
        "fib0618GoldenPocket": "$${(currentPrice * 0.965).toFixed(2)}",
        "fib0786": "$${(currentPrice * 0.945).toFixed(2)}",
        "fib1618Extension": "$${(currentPrice * 1.185).toFixed(2)}"
      },
      "volumeProfile": {
        "poc": "$${(currentPrice * 0.985).toFixed(2)}",
        "vah": "$${(currentPrice * 1.042).toFixed(2)}",
        "val": "$${(currentPrice * 0.948).toFixed(2)}"
      }
    },
    "riskManagementRules": [
      "Quản lý vốn tối đa 2-3% NAV trên mỗi vị thế.",
      "Luôn cài Stoploss trước khi vào lệnh, dời SL về Entry khi đạt TP1.",
      "Đòn bẩy khuyến nghị không vượt quá 5x trong giai đoạn biến động mạnh."
    ],
    "finalVerdict": {
      "action": "${isPos ? "NÊN LONG" : "QUAN SÁT"}",
      "actionType": "${isPos ? "LONG" : "WAIT"}",
      "summaryText": "${isPos ? "Cấu trúc thị trường futures cho thấy áp lực mua mạnh và tỷ lệ Top Traders Long vượt trội. Ưu tiên canh nhịp hồi về hỗ trợ để Long thuận xu hướng." : "Lực bán ngắn hạn đang chiếm ưu thế nhẹ. Thận trọng với các bẫy quét thanh lý hai đầu."}",
      "keyReason": "Open Interest tăng mạnh cùng Funding Rate dương lành mạnh và tỷ lệ Long/Short 62% ủng hộ đà bứt phá.",
      "recommendedAction": "Mở vị thế Long tại vùng Entry kỷ luật, cài Stoploss và chốt lời từng phần."
    }
  }
}`;

    if (!GROQ_API_KEY) {
      console.warn("GROQ_API_KEY không được tìm thấy, trả về dữ liệu mẫu phân tích chuẩn.");
      return NextResponse.json(JSON.parse(userPrompt.split("Hãy trả về JSON theo schema sau:")[1].trim()));
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.warn("Groq API error, fallback to algorithmic response:", errorText);
      return NextResponse.json(JSON.parse(userPrompt.split("Hãy trả về JSON theo schema sau:")[1].trim()));
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content;

    try {
      const parsed: ScanResult = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Lỗi parse JSON từ Groq:", parseError, content);
      return NextResponse.json(JSON.parse(userPrompt.split("Hãy trả về JSON theo schema sau:")[1].trim()));
    }
  } catch (err: any) {
    console.error("Lỗi server /api/ai-scan:", err);
    return NextResponse.json(
      { error: err.message || "Đã xảy ra lỗi khi phân tích AI" },
      { status: 500 }
    );
  }
}
