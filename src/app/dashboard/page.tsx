"use client";

import MarketData from "./components/MarketData";
import QuickActions from "./components/QuickActions";
import TransactionHistory from "./components/TransactionHistory";
import WalletBalance from "./components/WalletBalance";

const Dashboard = () => {
  return (
    <div className="pb-8 flex flex-col justify-center items-center pt-4 ">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 w-full">
        <div className="xl:col-span-7 w-full space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <WalletBalance />
            </div>

            <div className="hidden md:flex md:w-[140.9px]">
              <QuickActions />
            </div>
          </div>
{/* 
          <div className="w-full">
            <RecentOrderCode />
          </div> */}

          <div className="md:hidden w-full">
            <QuickActions /> 
          </div>
        </div>

        <div className="xl:col-span-5 w-full hidden md:block">
          <TransactionHistory />
        </div>
      </div>

      <div className="w-full md:mt-6">
        <MarketData />
      </div>
    </div>
  );
};

export default Dashboard;
