"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const GetStarted = () => {
  const router = useRouter();
  return (
    <section className="relative py-[8rem] px-4 max-container flex items-center justify-center">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-full h-[258.35px] md:w-[750px] lg:w-[1600px] md:h-[522.17px]">
        <Image
          src="/assets/home/unlock-bg.svg"
          width={1825.37}
          height={1132}
          alt="unlock-bg"
          className="object-contain"
        />
      </div>

      <div className="w-full flex items-center justify-center flex-col -mt-50">
        <div className="relative w-[123.24px] h-[119.17px] md:w-[540px] md:h-[522.17px]">
          <Image
            src="/assets/home/unlock-icon.svg"
            alt="unlock-icon"
            fill
            className="object-contain"
          />
        </div>

        <div className="max-w-[1158px] w-full flex items-center flex-col justify-center">
          <h1 className="font-sg text-[22.37px] md:text-[98px] font-bold not-first text-center leading-[121%] bg-clip-text text-transparent bg-gradient-to-r from-[#FCFCFC] to-[#464646]">
            Precision Trading Awaits You
          </h1>
          <p className="font-poppins text-[10.96px] md:text-[48px] font-medium text-center">
            Join a community that trades smarter — with control, transparency,
            and code.
          </p>

          <button
            className="w-[278px] h-[69.84px] lg:w-full lg:h-[306px] rounded-full bg-[#3AEBA5] mt-10 font-semibold text-[21.94px] lg:text-[96.12px] text-[#1E1E1E] cursor-pointer drop-shadow-2xl drop-shadow-[#14803A]"
            onClick={() => router.push("/signup")}
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
