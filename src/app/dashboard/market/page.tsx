"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Search, SlidersHorizontal } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Coin {
  uuid: string;
  symbol: string;
  name: string;
  iconUrl: string;
  price: string;
  change: string;
  marketCap: string;
  "24hVolume": string;
  volume24h: string;
  rank: number;
  sparkline: string[];
}

interface CoinRankingResponse {
  data: {
    stats: {
      total: number;
      totalMarketCap: string;
      total24hVolume: string;
      totalCoins: number;
    };
    coins: Coin[];
  };
  status: string;
}

type SortKey = "price" | "marketCap" | "24hVolume" | "change" | "listedAt";

const Market = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get<CoinRankingResponse>(
          "https://api.coinranking.com/v2/coins",
          {
            params: {
              limit: 50,
              orderBy: sortBy,
              orderDirection: sortOrder,
              timePeriod: "24h",
              sparkline: true,
            },
            headers: {
              "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API_KEY,
            },
          }
        );

        const formattedCoins = response.data.data.coins.map((coin) => ({
          ...coin,
          price: parseFloat(coin.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          marketCap: (parseFloat(coin.marketCap) / 1e9).toFixed(2) + "B",
          volume24h: (parseFloat(coin["24hVolume"]) / 1e9).toFixed(2) + "B",
        }));

        setCoins(formattedCoins);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching coins:", error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, [sortBy, sortOrder]);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const getSparklineData = (sparkline: string[]) => {
    return sparkline.map((price, index) => ({
      value: parseFloat(price),
      index,
    }));
  };

  return (
    <div className="lg:p-6 pt-6">
      {/* Top 3 Coins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-[#141414] rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-32 bg-[#2A2A2A] rounded mb-4"></div>
                  <div className="h-10 w-48 bg-[#2A2A2A] rounded mb-4"></div>
                  <div className="h-[100px] bg-[#2A2A2A] rounded"></div>
                </div>
              ))
          : coins.slice(0, 3).map((coin) => (
              <motion.div
                key={coin.uuid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src={coin.iconUrl}
                    alt={coin.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-white font-medium">
                    {coin.symbol}/USDT
                  </span>
                  <span
                    className={`text-sm ${
                      parseFloat(coin.change) >= 0
                        ? "text-[#3AEBA5]"
                        : "text-[#FF5A5A]"
                    }`}
                  >
                    {parseFloat(coin.change) >= 0 ? "+" : ""}
                    {coin.change}%
                  </span>
                </div>
                <h2 className="text-4xl font-medium mb-4">{coin.price}</h2>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getSparklineData(coin.sparkline)}>
                      <defs>
                        <linearGradient
                          id={`gradient-${coin.uuid}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={
                              parseFloat(coin.change) >= 0
                                ? "#3AEBA5"
                                : "#FF5A5A"
                            }
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              parseFloat(coin.change) >= 0
                                ? "#3AEBA5"
                                : "#FF5A5A"
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={
                          parseFloat(coin.change) >= 0 ? "#3AEBA5" : "#FF5A5A"
                        }
                        strokeWidth={2}
                        fill={`url(#gradient-${coin.uuid})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717171]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-[#141414] rounded-xl pl-12 pr-4 text-white placeholder:text-[#717171] outline-none"
          />
        </div>
        <button className="h-12 px-4 bg-[#141414] rounded-xl flex items-center gap-2 text-[#717171] hover:bg-[#202020] transition-colors">
          <SlidersHorizontal size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Coins Table */}
      <div className="bg-[#141414] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left p-4 text-[#717171] font-medium">#</th>
                <th className="text-left p-4 text-[#717171] font-medium">
                  Coin
                </th>
                <th
                  className="text-right p-4 text-[#717171] font-medium cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Price
                    {sortBy === "price" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className="text-right p-4 text-[#717171] font-medium cursor-pointer"
                  onClick={() => handleSort("change")}
                >
                  <div className="flex items-center justify-end gap-1">
                    24h Change
                    {sortBy === "change" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className="text-right p-4 text-[#717171] font-medium cursor-pointer"
                  onClick={() => handleSort("24hVolume")}
                >
                  <div className="flex items-center justify-end gap-1">
                    24h Volume
                    {sortBy === "24hVolume" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className="text-right p-4 text-[#717171] font-medium cursor-pointer"
                  onClick={() => handleSort("marketCap")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Market Cap
                    {sortBy === "marketCap" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="text-right p-4 text-[#717171] font-medium">
                  Last 7 Days
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoins.map((coin) => (
                  <motion.tr
                    key={coin.uuid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-[#2A2A2A] hover:bg-[#202020] transition-colors"
                  >
                    <td className="p-4 text-[#717171]">{coin.rank}</td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/market/${coin.uuid}`}
                        className="flex items-center gap-3"
                      >
                        <Image
                          src={coin.iconUrl}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {coin.name}
                          </h3>
                          <span className="text-sm text-[#717171]">
                            {coin.symbol}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-right text-white">${coin.price}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`${
                          parseFloat(coin.change) >= 0
                            ? "text-[#3AEBA5]"
                            : "text-[#FF5A5A]"
                        }`}
                      >
                        {parseFloat(coin.change) >= 0 ? "+" : ""}
                        {coin.change}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-white">
                      ${coin.volume24h}
                    </td>
                    <td className="p-4 text-right text-white">
                      ${coin.marketCap}
                    </td>
                    <td className="p-4">
                      <div className="w-[120px] h-[40px] ml-auto">
                        {/* Add sparkline chart here */}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Market;
