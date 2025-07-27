import Image from "next/image";

interface EmptyStateIconProps {
  className?: string;
}

const EmptyStateIcon = ({ className = "" }: EmptyStateIconProps) => {
  return (
    <Image
      src="/assets/dashboard/EmptyState.svg"
      alt="Empty State"
      width={300}
      height={300}
      className={className}
    />
  );
};

export default EmptyStateIcon;
