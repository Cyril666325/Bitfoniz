"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface SearchParamsWrapperProps {
  onParamsChange: (ref: string | null) => void;
}

const SearchParamsWrapper = ({ onParamsChange }: SearchParamsWrapperProps) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    onParamsChange(ref);
  }, [searchParams, onParamsChange]);

  return null;
};

export default SearchParamsWrapper;
