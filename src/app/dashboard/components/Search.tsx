"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Coin {
  uuid: string;
  symbol: string;
  name: string;
  iconUrl: string;
  price: string;
  change: string;
}

interface CoinRankingCoin {
  uuid: string;
  symbol: string;
  name: string;
  iconUrl: string;
  price: string;
  change: string;
}

interface CoinRankingResponse {
  data: {
    coins: CoinRankingCoin[];
  };
  status: string;
}

const Search = () => {
  const [search, setSearch] = useState("");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCoins = async () => {
      if (search.length < 2) {
        setCoins([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get<CoinRankingResponse>(
          "https://api.coinranking.com/v2/coins",
          {
            params: {
              search: search,
              limit: 5,
            },
            headers: {
              "x-access-token": process.env.NEXT_PUBLIC_COINRANKING_API_KEY,
            },
          }
        );

        const formattedCoins = response.data.data.coins.map((coin) => ({
          uuid: coin.uuid,
          symbol: coin.symbol,
          name: coin.name,
          iconUrl: coin.iconUrl,
          price: parseFloat(coin.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          change: parseFloat(coin.change).toFixed(2),
        }));

        setCoins(formattedCoins);
      } catch (error) {
        console.error("Error searching coins:", error);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchCoins, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  return (
    <div
      ref={searchRef}
      className="relative w-full flex justify-center max-w-[518.4px]"
    >
      <div className="bg-[#181818] rounded-full h-[39px] lg:h-[54px] w-full flex items-center gap-2 px-4">
        <SearchIcon size={20} className="text-[#717171]" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="🔥 ETH/USDT"
          className="bg-transparent outline-none border-none w-full h-full text-white placeholder:text-[#717171]"
        />
      </div>

      <AnimatePresence>
        {showResults && (search.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[60px] left-0 right-0 bg-[#181818] rounded-2xl p-2 shadow-lg shadow-black/50 border border-[#2A2A2A] max-h-[300px] overflow-y-auto z-50 max-w-[518.4px] w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-[#3AEBA5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : coins.length > 0 ? (
              coins.map((coin) => (
                <motion.div
                  key={coin.uuid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Image
                    src={coin.iconUrl}
                    alt={coin.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{coin.name}</h3>
                      <span className="text-sm text-[#717171]">
                        ${coin.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#717171]">
                        {coin.symbol}
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
                  </div>
                </motion.div>
              ))
            ) : (
              search.length > 0 && (
                <div className="text-[#717171] text-center py-4">
                  No coins found
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
