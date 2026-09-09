import { cn } from "@/lib/utils";

export default function BearthBadge({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color: "green" | "yellow";
}) {
  const colorClass = {
    green: "bg-[#10b981]",
    yellow: "bg-[#FBBF24]",
  };

  return (
    <span
      className={cn(
        "py-[4px] px-[6px] font-semibold text-[10px] text-white rounded-sm",
        colorClass[color],
      )}
    >
      {children}
    </span>
  );
}
