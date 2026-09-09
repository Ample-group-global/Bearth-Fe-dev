"use client";
import Image from "next/image";
import BearthBackgroundImage from "@/components/bearth/BearthBackgroundImage";
import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";
import BearthFooter from "@/components/bearth/navigation/BearthFooter";
import { BearthButton } from "../../components/bearth/BearthButton";

export default function HomePage() {
  return (
    <MaxWidthConstraintedLayout
      as="main"
      fullHeight
      outerDivClassName="relative"
      className="relative w-full"
    >
      <BearthBackgroundImage src="/assets/home-bg.webp"></BearthBackgroundImage>
      {/* Content Container */}
      <div className="relative z-1 flex min-h-dvh flex-col items-center justify-between px-4 py-6 md:px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center grow w-full">
          {/* Main Logo */}
          <div className="w-full flex flex-col grow justify-center max-h-[70dvh] pb-14 md:pb-38">
            <div className="relative flex items-center justify-center h-[20dvh]">
              <Image
                src="/assets/home-logo.svg"
                alt="Bearth Logo"
                unoptimized
                className="w-full h-full object-contain"
                fill
                sizes="100vw"
              />
            </div>

            {/* Subtitle */}

            <h2 className="text-primary title-stroke4 lg:title-stroke8 title-strokecolor-white text-[32px] md:text-[48px] lg:text-[64px] xl:text-[68px] font-black mb-8 leading-[1.05]">
              A Universe <br /> Born from Love
            </h2>
            <BearthButton href="/mint">Join the Journey</BearthButton>
          </div>
          {/* CTA Button */}
        </div>

        <BearthFooter absolute />
      </div>
    </MaxWidthConstraintedLayout>

    // <MaxWidthConstraintedLayout
    //   as="main"
    //   fullHeight
    //   outerDivClassName="relative"
    //   className="relative w-full"
    //   slotOutside={<BearthBackgroundImage showGradient={false} absolute src="/assets/home-bg.webp" />}
    // >
    //   {/* Hero Section */}
    //   <div className="p-4 lg:p-12 flex flex-col grow items-center justify-center text-center">
    //     <div className="w-full flex flex-col grow justify-between max-h-[70dvh]">
    //       <div
    //         className="relative flex items-center justify-center h-[20dvh]"
    //         ref={imageRef}
    //       >
    //         <Image
    //           src="/assets/logo.svg"
    //           alt="Bearth Logo"
    //           unoptimized
    //           className="w-full h-full object-contain"
    //           fill
    //           sizes="100vw"
    //         />
    //       </div>

    //       <div ref={textRef}>
    //         <h2 className="text-white title-stroke2 title-strokecolor-primary text-[20px] font-black">
    //           A Universe <br /> Born from Love
    //         </h2>
    //       </div>
    //     </div>
    //   </div>
    // </MaxWidthConstraintedLayout>
  );
}
