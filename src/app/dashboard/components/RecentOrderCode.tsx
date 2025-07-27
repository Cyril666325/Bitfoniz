import { Copy } from "lucide-react";
import React from "react";

const RecentOrderCode = () => {
  return (
    <div className="bg-[#181818] w-full rounded-[9.45px] p-4 flex flex-row items-center justify-between gap-3 sm:gap-0 md:items-start">
      <span className="font-poppins font-medium text-sm sm:text-[16.94px] text-[#6D6D6D]">
        Recent order code:
      </span>
      <div className="flex items-center gap-4">
        <span className="font-poppins font-medium text-[16px] md:text-xl sm:text-[25.2px] text-[#fff]">
          56HOXS2
        </span>
        <Copy
          size={20}
          className="text-[#979797] cursor-pointer hover:text-[#3AEBA5] transition-colors text-[13px] md:text-base"
        />
      </div>
    </div>
  );
};

export default RecentOrderCode;
