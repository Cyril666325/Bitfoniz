import axios from "@/lib/axios";

export interface CurrencyPair {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  baseMinSize: string;
  priceMinPrecision: number;
  priceMaxPrecision: number;
  expiration: string;
  minBuyAmount: string;
  minSellAmount: string;
}

interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  prev: string | null;
  next: string | null;
}

interface CurrencyResponse {
  success: boolean;
  data: CurrencyPair[];
  meta: PaginationMeta;
}

export const getSpotBalance = async () => {
  const response = await axios.get("/bitmart/wallet/spot-balance");
  return response.data;
};

export const submitSpotOrder = async (
  symbol: string,
  side: string,
  quantity: number,
  price: number,
  type: string
) => {
  const response = await axios.post("/bitmart/spot-order", {
    symbol,
    side,
    quantity,
    price,
    type,
  });
  return response.data;
};

export const getCurrencies = async (
  page: number = 1,
  limit: number = 20
): Promise<CurrencyResponse> => {
  const response = await axios.get("/bitmart/currencies", {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const followOrder = async (copyCode: string) => {
  const response = await axios.post("/trades/follow-order", {
    copyCode,
  });
  return response.data;
};

export const followFuturesOrder = async (copyCode: string) => {
  const response = await axios.post("/trades/follow-futures-order", {
    copyCode,
  });
  return response.data;
};

export const myOrders = async () => {
  const response = await axios.get("/trades/my-orders");
  return response.data;
};

export const myFuturesOrders = async () => {
  const response = await axios.get("/trades/my-futures-orders");
  return response.data;
};
