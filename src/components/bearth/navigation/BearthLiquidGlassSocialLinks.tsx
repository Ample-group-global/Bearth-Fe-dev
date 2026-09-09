import Link from "next/link";
import BearthLiquidGlassEffect from "./BearthLiquidGlassEffect";
import Image from "next/image";
import { socialLinks } from "@/config";

export default function BearthLiquidGlassSocialLinks() {
  return (
    <>
      <BearthLiquidGlassEffect className="p-2">
        <Link
          href={socialLinks.discord}
          className="transition-transform hover:scale-110"
        >
          <Image
            src="/assets/icon-discord.svg"
            alt="Discord"
            width={24}
            height={24}
          />
        </Link>
      </BearthLiquidGlassEffect>

      <BearthLiquidGlassEffect className="p-2">
        <Link
          href={socialLinks.instagram}
          className="transition-transform hover:scale-110"
        >
          <Image
            src="/assets/icon-instagram.svg"
            alt="Instagram"
            width={24}
            height={24}
          />
        </Link>
      </BearthLiquidGlassEffect>

      <BearthLiquidGlassEffect className="p-2">
        <Link
          href={socialLinks.x}
          className="transition-transform hover:scale-110"
        >
          <Image
            src="/assets/icon-x.svg"
            alt="X (Twitter)"
            width={24}
            height={24}
          />
        </Link>
      </BearthLiquidGlassEffect>
    </>
  );
}
