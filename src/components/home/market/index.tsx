"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

const cryptoIds = ["bitcoin", "ethereum", "tether"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const Market = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(
            ","
          )}&order=market_cap_desc&per_page=3&page=1&sparkline=false&locale=en`
        );
        const data = await response.json();
        setCryptoData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      }
    };

    fetchCryptoData();
    // Fetch data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <section className="max-container mx-auto w-full padding-x py-[4rem] md:py-[6rem] overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-2xl md:text-3xl font-bold text-center mb-8"
      >
        Live Market Data
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    variants={cardVariants}
                    className="bg-[#161616] rounded-xl p-6 animate-pulse"
                  >
                    <div className="h-12 bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded-lg w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded-lg w-1/2"></div>
                  </motion.div>
                ))}
            </>
          ) : (
            <>
              {cryptoData.map((crypto, index) => (
                <motion.div
                  key={crypto.id}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(58, 235, 165, 0.1)",
                  }}
                  className="bg-[#161616] rounded-xl p-6 hover:bg-[#1a1a1a] transition-colors relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#3AEBA5] to-transparent opacity-0 group-hover:opacity-5 transition-opacity"
                    initial={false}
                    animate={{
                      x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 8,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Image
                        src={crypto.image}
                        alt={crypto.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="font-semibold text-lg"
                      >
                        {crypto.name}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="text-[#4B4B4B] uppercase"
                      >
                        {crypto.symbol}
                      </motion.p>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.25 }}
                      className="text-2xl font-bold"
                    >
                      {formatPrice(crypto.current_price)}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`flex items-center ${
                          crypto.price_change_percentage_24h >= 0
                            ? "text-[#3AEBA5]"
                            : "text-red-500"
                        }`}
                      >
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                        <span className="font-medium">
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                      <span className="text-[#4B4B4B]">24h</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.35 }}
                      className="flex justify-between text-sm text-[#4B4B4B] mt-4"
                    >
                      <div>
                        <p>Market Cap</p>
                        <p className="text-white font-medium">
                          {formatMarketCap(crypto.market_cap)}
                        </p>
                      </div>
                      <div>
                        <p>Volume (24h)</p>
                        <p className="text-white font-medium">
                          {formatMarketCap(crypto.total_volume)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Market;
