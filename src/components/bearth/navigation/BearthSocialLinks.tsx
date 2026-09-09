import { socialLinks } from "@/config";
import Image from "next/image";
import Link from "next/link";

export default function BearthSocialLinks() {
  return (
    <>
      <Link
        href={socialLinks.discord}
        className="transition-transform hover:scale-110"
      >
        <Image
          src="/assets/icon-discord.svg"
          alt="Discord"
          width={40}
          height={40}
        />
      </Link>
      <Link
        href={socialLinks.instagram}
        className="transition-transform hover:scale-110"
      >
        <Image
          src="/assets/icon-instagram.svg"
          alt="Instagram"
          width={40}
          height={40}
        />
      </Link>
      <Link
        href={socialLinks.x}
        className="transition-transform hover:scale-110"
      >
        <Image
          src="/assets/icon-x.svg"
          alt="X (Twitter)"
          width={40}
          height={40}
        />
      </Link>
    </>
  );
}
