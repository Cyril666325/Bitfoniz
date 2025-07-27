// app/code/ClientRedirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Loading UI component
const LoadingUI = () => (
  <div className="min-h-screen bg-[#0C0E12] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-[#3AEBA5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">
        Processing Referral...
      </h2>
      <p className="text-gray-400">Please wait while we redirect you</p>
    </div>
  </div>
);

// Client component that handles the redirect
const ClientRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      // Redirect to signup with the referral code
      router.replace(`/signup?ref=${ref}`);
    } else {
      // If no ref code, redirect to home
      router.replace("/");
    }
  }, [ref, router]);

  return <LoadingUI />;
};

export default ClientRedirect;
