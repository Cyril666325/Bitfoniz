import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "assets.coingecko.com",
      "coin-images.coingecko.com",
      "cdn.coinranking.com",
      "resource.cwallet.com",
      "api.dicebear.com",
      "resource.ccpayment.com",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
