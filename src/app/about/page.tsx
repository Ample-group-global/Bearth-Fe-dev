import RandomBear from "@/components/bearth/about/RandomBear";
import ScrollTransformContainer from "@/components/bearth/about/ScrollTransformContainer";
import SectionForth from "@/components/bearth/about/SectionForth";
import SectionLast from "@/components/bearth/about/SectionLast";
import SectionSecond from "@/components/bearth/about/SectionSecond";
import SectionThird from "@/components/bearth/about/SectionThird";
import SectionTop from "@/components/bearth/about/SectionTop";
import BearthBackgroundImage from "@/components/bearth/BearthBackgroundImage";
import BearthFooter from "@/components/bearth/navigation/BearthFooter";

export default function AboutPage() {
  return (
    <main className="w-full flex flex-col justify-center overflow-hidden">
      <BearthFooter className="max-w-[1280px] left-1/2 -translate-x-1/2 z-30" />
      <RandomBear />
      <div className="fixed inset-0 z-1">
        <SectionTop></SectionTop>
      </div>
      <div className="h-dvh"></div>
      <div className="bg-secondary z-22 relative">
        <ScrollTransformContainer className="h-dvh w-dvw fixed inset-0 pointer-events-none">
          <BearthBackgroundImage
            unoptimized
            src="/assets/star.webp"
            showGradient={false}
          />
        </ScrollTransformContainer>
        <SectionForth></SectionForth>
        <SectionThird></SectionThird>
        <SectionSecond></SectionSecond>
        <SectionLast></SectionLast>
      </div>
    </main>
  );
}
