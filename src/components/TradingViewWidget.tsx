"use client";

import React, { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "dark" | "light";
  autosize?: boolean;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(
  function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", theme = "dark" }) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!container.current) return;

      // Clean up previous script if any
      container.current.innerHTML = "";

      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.height = "100%";
      widgetContainer.style.width = "100%";
      container.current.appendChild(widgetContainer);

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: "Asia/Ho_Chi_Minh",
        theme: theme,
        style: "1",
        locale: "vi_VN",
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
      });

      container.current.appendChild(script);
    }, [symbol, theme]);

    return (
      <div
        className="tradingview-widget-container h-[480px] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/60 shadow-xl"
        ref={container}
      />
    );
  }
);
