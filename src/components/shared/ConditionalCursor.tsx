"use client";

import { usePathname } from "next/navigation";
import AnimatedCursor from "./AnimatedCursor";
import { useEffect } from "react";

const ConditionalCursor = () => {
  const pathname = usePathname();
  const isAuthOrDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  useEffect(() => {
    // When in dashboard/auth, show default cursor
    if (isAuthOrDashboard) {
      document.body.style.cursor = "auto";
    } else {
      document.body.style.cursor = "none"; // Hide default cursor when using AnimatedCursor
    }

    return () => {
      document.body.style.cursor = "auto"; // Reset on unmount
    };
  }, [isAuthOrDashboard]);

  // Don't show cursor in dashboard or auth routes
  if (isAuthOrDashboard) {
    return null;
  }

  return <AnimatedCursor />;
};

export default ConditionalCursor;
