"use client";

import { ArrowRightLeft, ArrowUp, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const actions = [
  {
    title: "Deposit",
    icon: Plus,
    href: "/dashboard/deposit",
  },
  {
    title: "Withdraw",
    icon: ArrowUp,
    href: "/dashboard/withdraw",
  },
  // {
  //   title: "Convert",
  //   icon: RefreshCw,
  //   href: "/dashboard/convert",
  // },
  {
    title: "Transfer",
    icon: ArrowRightLeft,
    href: "/dashboard/transfer",
    desktopOnly: false,
  },
];

const QuickActions = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAssetsPage = pathname === "/dashboard/assets";

  return (
    <div className="grid md:grid-cols-1 grid-cols-3 gap-2 md:gap-4 w-full">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={() => router.push(action.href)}
          className={`flex items-center justify-center gap-2 md:gap-3 bg-[#111111] rounded-xl md:rounded-2xl p-3 md:p-4 hover:bg-[#1f1f1f] transition-all hover:scale-[1.02] active:scale-[0.98] w-full cursor-pointer ${
            action.desktopOnly && !isAssetsPage ? "hidden md:flex" : "flex"
          }`}
        >
          <action.icon className="text-[#FCFCFC]" size={20} />
          <span className="text-base md:text-[18.61px] font-medium text-[#FCFCFC]">
            {action.title}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
