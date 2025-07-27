import React, { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  height = 400,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(
    `tradingview_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    if (!chartRef.current) return;

    // Clear the container
    chartRef.current.innerHTML = "";

    // Create a unique container div with proper ID
    const containerId = widgetIdRef.current;
    const widgetContainer = document.createElement("div");
    widgetContainer.id = containerId;
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    chartRef.current.appendChild(widgetContainer);

    // Load TradingView widget safely
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      try {
        // @ts-expect-error TradingView is loaded dynamically from external script
        if (typeof TradingView !== "undefined") {
          // @ts-expect-error TradingView widget constructor not in types
          new TradingView.widget({
            container_id: containerId,
            autosize: true,
            symbol: symbol,
            interval: "15",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            backgroundColor: "rgba(19, 23, 34, 1)",
            gridColor: "rgba(42, 46, 57, 0.5)",
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            studies: [],
            disabled_features: [
              "use_localstorage_for_settings",
              "volume_force_overlay",
              "create_volume_indicator_by_default",
            ],
            enabled_features: ["study_templates"],
          });
        }
      } catch (error) {
        console.error("TradingView widget error:", error);
        // Fallback display
        if (chartRef.current) {
          chartRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #888;">
              <div style="text-align: center;">
                <div style="margin-bottom: 12px;">📈</div>
                <div style="font-size: 14px;">Chart: ${symbol}</div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">TradingView Loading...</div>
              </div>
            </div>
          `;
        }
      }
    };

    script.onerror = () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #888;">
            <div style="text-align: center;">
              <div style="margin-bottom: 12px;">⚠️</div>
              <div style="font-size: 14px;">Chart Unavailable</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Failed to load TradingView</div>
            </div>
          </div>
        `;
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch {
        // Silent cleanup
      }
    };
  }, [symbol, height]);

  return (
    <div
      ref={chartRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="bg-[#13171E] rounded"
    />
  );
};
