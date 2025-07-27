"use client";

import { useEffect, useState } from "react";
import { getAssets } from "@/services/ccpayment/ccpayment";
import { Asset } from "@/types/ccpayment";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const coinImages: Record<string, string> = {
  ETH: "https://resource.cwallet.com/token/icon/ETH.png",
  SOL: "https://resource.cwallet.com/token/icon/sol.png",
  USDT: "https://resource.cwallet.com/token/icon/usdt.png",
  USDC: "https://resource.cwallet.com/token/icon/usdc.png",
  BTC: "https://resource.cwallet.com/token/icon/btc.png",
};

const Portfolio = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const data = await getAssets();
        setAssets(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch assets");
        console.error("Error fetching assets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const totalBalance = assets.reduce((total, asset) => {
    return total + parseFloat(asset.available || "0");
  }, 0);

  const formatBalance = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  return (
    <div className="bg-[#181818] rounded-2xl p-4 md:p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-[22.25px] text-[#4B4B4B] font-medium font-poppins">
          Portfolio
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 h-[200px] justify-center">
          <Loader2 size={24} className="text-[#3AEBA5] animate-spin" />
          <span className="text-gray-400">Loading assets...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 rounded-lg text-center bg-red-500/10">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Balance */}
          <div>
            <h3 className="text-sm text-[#717171] mb-1">Total Balance</h3>
            <p className="text-2xl md:text-3xl font-medium">
              ${formatBalance(totalBalance)}
            </p>
          </div>

          {/* Assets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.coinId}
                className="flex items-center justify-between p-4 rounded-xl bg-[#202020] hover:bg-[#282828] transition-colors border border-transparent hover:border-[#3AEBA5] group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#282828]">
                    <Image
                      src={
                        coinImages[asset.coinSymbol] ||
                        `/assets/coins/${asset.coinSymbol.toLowerCase()}.png`
                      }
                      alt={asset.coinSymbol}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-[#3AEBA5] transition-colors">
                      {asset.coinSymbol}
                    </p>
                    <p className="text-sm text-[#717171]">
                      {formatBalance(asset.available)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${formatBalance(parseFloat(asset.available || "0") * 1)}
                  </p>
                  <p className="text-sm text-[#717171]">
                    {parseFloat(asset.available || "0") > 0
                      ? "+0.00%"
                      : "0.00%"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
