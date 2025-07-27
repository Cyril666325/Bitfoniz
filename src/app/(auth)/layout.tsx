// app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <Link href={"/"}>
        <Image
          src={"/assets/logo.svg"}
          alt="logo"
          height={50}
          width={120.93}
          className="lg:absolute lg:top-4 lg:left-10 mt-4 mb-8 mx-4"
        />
      </Link>
      <div className="padding-x flex items-center justify-between">
        <div className="lg:flex flex-col items-center hidden">
          <Image
            src={"/assets/auth/auth-img.png"}
            width={676.8}
            height={1605}
            alt="auth-img"
          />
          <div className="flex flex-col gap-3 max-w-[655.02px] w-full">
            <h1 className="font-semibold text-[51.7px] font-geist text-center bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent leading-[100%] pt-6">
              Where Intelligence Meets Precision in Trading
            </h1>
            <p className="text-[#8A8A8A] text-center font-poppins text-[25.86px]">
              Your gateway to secure, code-driven trades and real earning
              potential.
            </p>
          </div>
        </div>
        <div className="">{children}</div>
      </div>
    </div>
  );
}
