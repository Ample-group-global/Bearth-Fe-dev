import Link from "next/link";
import { cn } from "@/lib/utils";
import BearthSocialLinks from "./BearthSocialLinks";
import BearthLiquidGlassEffect from "./BearthLiquidGlassEffect";
import Image from "next/image";
import BearthLiquidGlassSocialLinks from "./BearthLiquidGlassSocialLinks";

export default function BearthFooter({
  absolute = false,
  className,
}: {
  absolute?: boolean;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "w-full items-end justify-between pb-4 hidden md:flex text-white mt-8",
        "h-[64px] px-4 z-10",
        "bottom-0 left-0",
        absolute ? "absolute" : "fixed",
        className,
      )}
    >
      <BearthLiquidGlassEffect className="h-[40px]" contentClassName="flex items-center justify-center">
        <div className="text-2xl text-white px-5 font-semibold tracking-wide drop-shadow-md">
          <Link href="/contact">Contact</Link>
        </div>
      </BearthLiquidGlassEffect>

      <div className="flex items-center gap-4">
        <BearthLiquidGlassSocialLinks />
      </div>
    </footer>
  );
}
