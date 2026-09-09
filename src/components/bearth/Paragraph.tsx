import { createElement } from "react";
import { cn } from "@/lib/utils";

export default function Paragraph({
  children,
  className,
  style,
  type = "normal",
  as = "p",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: "normal" | "large" | "large2" | "normal2";
  as?: "p" | "div";
}) {
  return createElement(
    as || "p",
    {
      className: cn(
        "leading-tight tracking-tight font-medium",
        type === "normal" && "text-xs md:text-base",
        type === "large" && "text-xs md:text-2xl",
        type === "large2" && "text-base md:text-2xl",
        type === "normal2" && "text-base leading-[1.25]",
        className,
      ),
      style,
    },
    children,
  );
}
