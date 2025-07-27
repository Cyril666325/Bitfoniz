"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface CoinDetails {
  uuid: string;
  symbol: string;
  name: string;
  description: string;
  iconUrl: string;
  websiteUrl: string;
  price: string;
  change: string;
  marketCap: string;
  volume24h: string;
  rank: number;
  allTimeHigh: {
    price: string;
    timestamp: number;
  };
  supply: {
    total: string;
    circulating: string;
  };
}

interface CoinHistory {
  price: string;
  timestamp: number;
}

interface TimeFrame {
  label: string;
  value: "24h" | "7d" | "30d" | "1y" | "5y";
}

const timeFrames: TimeFrame[] = [
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

const CoinPage = ({ params }: { params: Promise<{ coinId: string }> }) => {
  const { coinId } = use(params);
  const router = useRouter();
  const [coin, setCoin] = useState<CoinDetails | null>(null);
  const [history, setHistory] = useState<CoinHistory[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame["value"]>("24h");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        const [detailsResponse, historyResponse] = await Promise.all([
          axios.get(`https://api.coinranking.com/v2/coin/${coinId}`, {
            headers: {
              "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API_KEY,
            },
          }),
          axios.get(`https://api.coinranking.com/v2/coin/${coinId}/history`, {
            params: { timePeriod: timeFrame },
            headers: {
              "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API_KEY,
            },
          }),
        ]);

        const coinData = detailsResponse.data.data.coin;
        setCoin({
          ...coinData,
          price: parseFloat(coinData.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          marketCap: (parseFloat(coinData.marketCap) / 1e9).toFixed(2) + "B",
          volume24h: (parseFloat(coinData["24hVolume"]) / 1e9).toFixed(2) + "B",
        });

        const historyData = historyResponse.data.data.history.map(
          (item: CoinHistory) => ({
            price: parseFloat(item.price),
            timestamp: item.timestamp,
          })
        );
        setHistory(historyData.reverse());
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coin details:", error);
        setLoading(false);
      }
    };

    fetchCoinDetails();
  }, [coinId, timeFrame]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-medium mb-4">Coin not found</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#3AEBA5]"
        >
          <ArrowLeft size={20} />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center bg-[#181818] rounded-xl hover:bg-[#202020] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <Image
            src={coin.iconUrl}
            alt={coin.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl font-medium">
              {coin.name}{" "}
              <span className="text-[#717171]">({coin.symbol})</span>
            </h1>
            <p className="text-[#717171]">Rank #{coin.rank}</p>
          </div>
        </div>
      </div>

      {/* Price and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181818] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-medium mb-2">${coin.price}</h2>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-md ${
                  parseFloat(coin.change) >= 0
                    ? "text-[#3AEBA5] bg-[#3AEBA5]/10"
                    : "text-[#FF5A5A] bg-[#FF5A5A]/10"
                }`}
              >
                {parseFloat(coin.change) >= 0 ? "+" : ""}
                {coin.change}%
              </span>
            </div>
            {coin.websiteUrl && (
              <a
                href={coin.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#3AEBA5] text-black rounded-xl font-medium hover:bg-[#2ED994] transition-colors"
              >
                Website
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-[#717171] text-sm mb-1">Market Cap</h3>
              <p className="font-medium">${coin.marketCap}</p>
            </div>
            <div>
              <h3 className="text-[#717171] text-sm mb-1">Volume (24h)</h3>
              <p className="font-medium">${coin.volume24h}</p>
            </div>
            <div>
              <h3 className="text-[#717171] text-sm mb-1">
                Circulating Supply
              </h3>
              <p className="font-medium">
                {parseFloat(coin.supply.circulating).toLocaleString()}{" "}
                {coin.symbol}
              </p>
            </div>
            <div>
              <h3 className="text-[#717171] text-sm mb-1">Total Supply</h3>
              <p className="font-medium">
                {parseFloat(coin.supply.total).toLocaleString()} {coin.symbol}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#181818] rounded-2xl p-6"
        >
          <h2 className="text-xl font-medium mb-4">About {coin.name}</h2>
          <p className="text-[#717171] leading-relaxed">{coin.description}</p>
        </motion.div>
      </div>

      {/* Price Chart */}
      <div className="bg-[#181818] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Price Chart</h2>
          <div className="flex items-center gap-2">
            {timeFrames.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeFrame(tf.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFrame === tf.value
                    ? "bg-[#3AEBA5] text-black"
                    : "text-[#717171] hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2A2A2A"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp * 1000).toLocaleDateString()
                }
                stroke="#717171"
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#717171"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#202020",
                  border: "none",
                  borderRadius: "8px",
                }}
                labelFormatter={(timestamp) =>
                  new Date(timestamp * 1000).toLocaleString()
                }
                formatter={(value: number) => [
                  `$${parseFloat(value.toString()).toLocaleString()}`,
                  "Price",
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3AEBA5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CoinPage;
