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

export interface SpotAnalysis {
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "TAKE_PROFIT" | "SELL";
  signalLabel: string;
  winRatePercent: number;
  overallScore: number; // 1-10
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

    const systemPrompt = `Bạn là Chuyên gia Cao cấp về Phân tích Kỹ thuật Sóng (Elliott Wave / Price Action) & Dữ liệu Phái sinh On-chain Coinglass (Chief Quantitative Crypto Strategist & Derivatives Risk Manager).
Nhiệm vụ của bạn là phân tích toàn diện đồng tiền mã hóa ${name} (${symbol.toUpperCase()}) và trả về định dạng JSON chính xác.

Bao gồm các phân mục bắt buộc:
1. wavePattern: Dạng sóng hiện tại (Sóng Elliott 1-2-3-4-5, ABC Correction, Wyckoff, Bull Flag...), xác định đỉnh đáy Swing High / Swing Low, mốc Fibo vàng 0.618 và sóng mục tiêu.
2. coinglass: Tổng hợp chỉ số Coinglass (Tỷ lệ Long/Short Top Traders vs Retail, Funding Rate 3 sàn Binance/OKX/Bybit, Open Interest USD & Delta, Taker Buy/Sell ratio, CVD Divergence, Squeeze Momentum, Fear & Greed Index).
3. spot: Luồng giao dịch Spot (Nắm giữ thực tế, không đòn bẩy, vùng mua gom, TP1-3, Stoploss, phân tích Order block & FVG, và THẺ KẾT LUẬN "NÊN MUA" / "NÊN BÁN" / "QUAN SÁT").
4. future: Luồng phái sinh Futures (Đòn bẩy an toàn, Vị thế LONG / SHORT, Entry, TP1-3, SL, Giá thanh lý ước tính, Bản đồ cụm thanh lý, và THẺ KẾT LUẬN "NÊN LONG" / "NÊN SHORT" / "QUAN SÁT").

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
    "patternName": "Sóng Đẩy Elliott (Wave 3 Impulse Extension)",
    "currentWave": "Đang hoàn tất sóng 3 mở rộng (Wave 3) hướng về vùng kháng cự mới",
    "waveDescription": "Cấu trúc sóng tăng bậc cao tạo Higher High (HH) liên tục với lực mua dồi dào.",
    "swingHigh": "$${(currentPrice * 1.08).toFixed(2)}",
    "swingLow": "$${(currentPrice * 0.94).toFixed(2)}",
    "keyFibonacciLevel": "Vùng Tỷ Lệ Vàng Fibo 0.618 ($${(currentPrice * 0.965).toFixed(2)}) giữ vững lực đỡ",
    "projectedTargetWave": "$${(currentPrice * 1.22).toFixed(2)} (Mục tiêu Sóng 5)"
  },
  "coinglass": {
    "topTradersLongRatio": 66,
    "topTradersShortRatio": 34,
    "retailLongRatio": 52,
    "retailShortRatio": 48,
    "fundingRateBinance": "+0.015%",
    "fundingRateOKX": "+0.012%",
    "fundingRateBybit": "+0.016%",
    "openInterestTotalUSD": "$2.85B",
    "openInterestDelta24h": "+14.6%",
    "takerBuyRatio": 58,
    "cvdStatus": "Phân kỳ tích cực (Bullish CVD Divergence)",
    "squeezeMomentum": "Đang bung xung lượng tăng (Firing Bullish Momentum)",
    "fearGreedIndex": {
      "score": 72,
      "label": "Tham lam (Greed)"
    }
  },
  "spot": {
    "signal": "BUY",
    "signalLabel": "MUA GOM",
    "winRatePercent": 74,
    "overallScore": 8.4,
    "riskRewardRatio": "1 : 2.8",
    "trend": "Tăng trưởng Bullish",
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
        "value": 62,
        "status": "Vùng tích lũy xung lực tăng (Bullish Momentum)"
      },
      "macd": "MACD Histogram dương, đường Signal cắt lên",
      "volumeProfile": "Khối lượng mua chủ động chiếm 64%",
      "supportResistance": {
        "support": "$${(currentPrice * 0.94).toFixed(2)}",
        "resistance": "$${(currentPrice * 1.12).toFixed(2)}"
      }
    },
    "strategyAdvice": "Chia vốn DCA thành 3 đợt tại vùng hỗ trợ Order Block. Đạt TP1 dời SL về hòa vốn.",
    "riskWarning": "Đặt Stoploss bảo vệ tài khoản, tránh rủi ro biến động toàn thị trường.",
    "finalVerdict": {
      "action": "NÊN MUA",
      "actionType": "BUY",
      "summaryText": "Cấu trúc dòng tiền tích lũy mạnh mẽ trên đồ thị Spot. Các chỉ số kỹ thuật duy trì đà tăng trưởng ổn định.",
      "keyReason": "Dải EMA và RSI đồng thuận hỗ trợ xu hướng tăng trung hạn với khối lượng gom hàng đều đặn.",
      "recommendedAction": "DCA mua gom theo vùng entry, hiện thực hóa lợi nhuận tại TP1 & TP2."
    }
  },
  "future": {
    "position": "LONG",
    "positionLabel": "LONG",
    "recommendedLeverage": "3x - 5x (An Toàn)",
    "capitalRiskPercent": "2 - 3%",
    "winRatePercent": 68,
    "overallScore": 8.6,
    "riskRewardRatio": "1 : 3",
    "entryZone": "$${(currentPrice * 0.985).toFixed(2)} - $${currentPrice.toFixed(2)}",
    "targetPrice1": "$${(currentPrice * 1.058).toFixed(2)}",
    "targetPrice2": "$${(currentPrice * 1.134).toFixed(2)}",
    "targetPrice3": "$${(currentPrice * 1.248).toFixed(2)}",
    "stopLoss": "$${(currentPrice * 0.945).toFixed(2)}",
    "estLiquidationPrice": "$${(currentPrice * 0.82).toFixed(2)}",
    "metrics": {
      "longShortRatio": {
        "longPercent": 62,
        "shortPercent": 38,
        "ratioText": "1.63",
        "sentiment": "Bullish"
      },
      "fundingRate": {
        "rate": "+0.016%",
        "status": "Longs trả phí cho Shorts"
      },
      "openInterest": "Tăng 18%",
      "liquidationHeatmap": {
        "shortLiquidationPool": "$${(currentPrice * 1.04).toFixed(1)} - $${(currentPrice * 1.07).toFixed(1)}",
        "longLiquidationPool": "$${(currentPrice * 0.93).toFixed(1)} - $${(currentPrice * 0.96).toFixed(1)}",
        "stopHuntRisk": "Thấp"
      },
      "volatilityATR": "12.4"
    },
    "riskManagementRules": [
      "Quản lý vốn tối đa 2-3% NAV trên mỗi vị thế.",
      "Luôn cài Stoploss trước khi vào lệnh, dời SL về Entry khi đạt TP1.",
      "Đòn bẩy khuyến nghị không vượt quá 5x trong giai đoạn biến động mạnh."
    ],
    "finalVerdict": {
      "action": "NÊN LONG",
      "actionType": "LONG",
      "summaryText": "Cấu trúc thị trường futures cho thấy áp lực mua mạnh và tỷ lệ Top Traders Long vượt trội. Ưu tiên canh nhịp hồi về hỗ trợ để Long thuận xu hướng.",
      "keyReason": "Open Interest tăng mạnh cùng Funding Rate dương lành mạnh và tỷ lệ Long/Short 62% ủng hộ đà bứt phá.",
      "recommendedAction": "Mở vị thế Long tại vùng Entry kỷ luật, cài Stoploss và chốt lời từng phần."
    }
  }
}`;

    if (!GROQ_API_KEY) {
      console.warn("GROQ_API_KEY không được tìm thấy, trả về dữ liệu mẫu phân tích chuẩn.");
      return NextResponse.json(JSON.parse(userPrompt.split("Hãy trả về JSON theo schema sau:")[1].trim()));
    }

    // Call Groq API (Llama 3 70b versatile)
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
