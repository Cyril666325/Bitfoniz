import Image from "next/image";

interface CoinIconProps {
  symbol: string;
  size?: number;
}

export const CoinIcon = ({ symbol, size = 24 }: CoinIconProps) => {
  const iconUrl = `/icons/crypto/${symbol.toLowerCase()}.svg`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={iconUrl}
        alt={`${symbol} icon`}
        width={size}
        height={size}
        className="rounded-full"
        onError={(e) => {
          // Fallback to a generic crypto icon if the specific one fails to load
          (e.target as HTMLImageElement).src = "/icons/crypto/generic.svg";
        }}
      />
    </div>
  );
};
