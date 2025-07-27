// app/code/page.tsx
import { Suspense } from "react";
import ClientRedirect from "./ClientRedirect";

// Loading UI component for Suspense fallback
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

const ReferralRedirectPage = () => {
  return (
    <Suspense fallback={<LoadingUI />}>
      <ClientRedirect />
    </Suspense>
  );
};

export default ReferralRedirectPage;
