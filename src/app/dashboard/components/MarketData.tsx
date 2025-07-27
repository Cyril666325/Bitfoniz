"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Coin {
  symbol: string;
  price: string;
  volume24h: string;
  change: string;
  iconUrl: string;
  marketCap: string;
  rank: number;
  name: string;
}

interface CoinRankingCoin {
  symbol: string;
  price: string;
  ["24hVolume"]: string;
  change: string;
  name: string;
  rank: number;
  uuid: string;
  iconUrl: string;
  marketCap: string;
}

interface CoinRankingResponse {
  data: {
    coins: CoinRankingCoin[];
  };
  status: string;
}

const MarketData = () => {
  const [activeTab, setActiveTab] = useState<"Hot" | "New">("Hot");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<CoinRankingResponse>(
          "https://api.coinranking.com/v2/coins",
          {
            headers: {
              "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API_KEY,
            },
          }
        );

        const formattedCoins = response.data.data.coins.map((coin) => ({
          symbol: coin.symbol + "USDT",
          price: parseFloat(coin.price).toLocaleString(),
          volume24h: (parseFloat(coin["24hVolume"]) / 1e9).toFixed(2) + "B",
          change: parseFloat(coin.change).toFixed(2),
          iconUrl: coin.iconUrl,
          marketCap: (parseFloat(coin.marketCap) / 1e9).toFixed(2) + "B",
          rank: coin.rank,
          name: coin.name,
        }));

        setCoins(formattedCoins.slice(0, 15));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-[#141414] rounded-2xl p-4 md:p-6 w-full mt-6">
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={() => setActiveTab("Hot")}
          className={`text-lg md:text-[21.1px] font-medium transition-colors ${
            activeTab === "Hot" ? "text-white" : "text-[#717171]"
          }`}
        >
          Hot
        </button>
        <button
          onClick={() => setActiveTab("New")}
          className={`text-lg md:text-[21.1px] font-medium transition-colors ${
            activeTab === "New" ? "text-white" : "text-[#717171]"
          }`}
        >
          New
        </button>
      </div>

      {/* Desktop Headers - Hidden on Mobile */}
      <div className="hidden md:grid grid-cols-7 gap-4 mb-4">
        <div className="text-[12.66px] text-[#717171]">#</div>
        <div className="text-[12.66px] text-[#717171]">Coin</div>
        <div className="text-[12.66px] text-[#717171]">Name</div>
        <div className="text-[12.66px] text-[#717171]">24H turnover</div>
        <div className="text-[12.66px] text-[#717171]">Market Cap</div>
        <div className="text-[12.66px] text-[#717171]">Price</div>
        <div className="text-[12.66px] text-[#717171]">24H change</div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {loading ? (
          <div className="text-center text-[#717171]">Loading...</div>
        ) : (
          coins.map((coin, index) => (
            <div
              key={index}
              className="flex md:grid md:grid-cols-7 md:gap-4 items-center border-b border-[#202020] last:border-0 pb-4 md:pb-0 md:border-0"
            >
              {/* Mobile Layout */}
              <div className="flex items-center flex-1 gap-3 md:hidden">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-[#717171] min-w-[20px]">
                    {coin.rank}
                  </span>
                  <Image
                    src={coin.iconUrl}
                    alt={coin.symbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">
                      {coin.symbol}
                    </span>
                    <span className="text-xs text-[#717171]">{coin.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-white font-medium">
                    ${coin.price}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      parseFloat(coin.change) >= 0
                        ? "text-[#3AEBA5]"
                        : "text-[#FF5A5A]"
                    }`}
                  >
                    {parseFloat(coin.change) >= 0 ? "+" : ""}
                    {coin.change}%
                  </span>
                </div>
                <ChevronRight size={16} className="text-[#717171] ml-2" />
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block text-[16px] text-white font-medium">
                {coin.rank}
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Image
                  src={coin.iconUrl}
                  alt={coin.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-[16px] text-white font-medium">
                  {coin.symbol}
                </span>
              </div>
              <div className="hidden md:block text-[14px] text-[#fff]">
                {coin.name}
              </div>
              <div className="hidden md:block text-[14px] text-white">
                {coin.volume24h} USDT
              </div>
              <div className="hidden md:block text-[14px] text-white">
                {coin.marketCap} USDT
              </div>
              <div className="hidden md:block text-[16px] text-white">
                {coin.price}
              </div>
              <div
                className={`hidden md:block text-[12.66px] font-medium px-2 py-1 rounded-md w-fit ${
                  parseFloat(coin.change) >= 0
                    ? "text-[#3AEBA5] bg-[#3AEBA5]/10"
                    : "text-[#FF5A5A] bg-[#FF5A5A]/10"
                }`}
              >
                {parseFloat(coin.change) >= 0 ? "+" : ""}
                {coin.change}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketData;
