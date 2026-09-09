import Image from "next/image";
import Link from "next/link";
import Heading from "@/components/bearth/Heading";
import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";
import BearthSocialLinks from "@/components/bearth/navigation/BearthSocialLinks";
import { socialLinks } from "@/config";

export default function ContactPage() {
  return (
    <MaxWidthConstraintedLayout
      as="main"
      paddingHeader
      paddingFooter
      fullHeight
      outerDivClassName="w-full bg-secondary flex flex-col items-center justify-center"
      className="text-background flex flex-col items-center justify-center gap-4"
    >
      <Heading type="h1" className="text-center">
        Contact
      </Heading>
      <div className="flex flex-row gap-12 justify-center">
        <Link href={socialLinks.inquiries}>
          <Heading
            type="h2"
            className="text-2xl transition-transform hover:scale-110"
          >
            Inquiries
          </Heading>
        </Link>

        <Link href={socialLinks.support}>
          <Heading
            type="h2"
            className="text-2xl transition-transform hover:scale-110"
          >
            Support
          </Heading>
        </Link>
      </div>

      <div className="flex flex-row gap-4 justify-center">
        <BearthSocialLinks />
      </div>

      <Image
        className="mt-4 aspect-square w-full max-w-[500px] object-contain"
        src="/assets/contact.webp"
        unoptimized={true}
        alt="Contact"
        width={1400}
        height={1100}
      />
    </MaxWidthConstraintedLayout>
  );
}
