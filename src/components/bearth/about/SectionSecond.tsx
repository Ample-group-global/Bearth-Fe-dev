import Image from "next/image";
import { CarouselItem } from "@/components/ui/carousel";
import Heading from "../Heading";
import BearthLiquidGlassEffect from "../navigation/BearthLiquidGlassEffect";
import Paragraph from "../Paragraph";
import AnimatedTitle from "./AnimatedTitle";
import { CarouselButton } from "./CarouselButton";
import { CarouselProvider } from "./CarouselContext";
import { SectionSecondCarousel } from "./SectionSecondCarousel";

const sections = [
  {
    order: 1,
    image: "/assets/about-1-1.png",
    title: "THE BEGINNING",
    text: (
      <>
        <Paragraph type="normal" style={{ fontWeight: "bold", fontSize: "25px", color: "#fbead4" }}>
          Why We Left Earth
        </Paragraph>
        <Paragraph type="normal">
          Earth was no longer the cozy home it used to be.
        </Paragraph>
        <Paragraph type="normal">
          So four little bears set off into the stars, searching for a new place to call home — and the perfect place for a nap.
        </Paragraph>
        {/* <Paragraph type="normal">
          To these groggy new tenants, the abandoned city wasn't a crisis.
          Through sleepy eyes, it wasn't a ruin.
        </Paragraph>
        <Paragraph type="normal" className="font-bold">
          It was a giant, unopened playground.
        </Paragraph> */}
      </>
    ),
  },
  {
    order: 2,
    image: "/assets/about-1-2.png",
    title: "THE JOURNEY",
    text: (
      <>
        <Paragraph type="normal" style={{ fontWeight: "bold", fontSize: "25px", color: "#fbead4" }}>
          A Home Among the Stars
        </Paragraph>
        <Paragraph type="normal">
          They traveled from planet to planet, following the stars and perhaps the smell of honey. Some places were too hot, some were too cold, and some just weren’t right for a good nap. So they kept going.
        </Paragraph>
        {/* <Paragraph type="normal">
          We slowed time and rewrote the "Second Layer" rules.
        </Paragraph>
        <Paragraph type="normal" className="font-bold">
          We repurposed humanity's highest technology for the serious business
          of relaxation.
        </Paragraph> */}
      </>
    ),
  },
  {
    order: 3,
    image: "/assets/about-1-3.png",
    title: "WELCOME TO BEARTH",
    text: (
      <>
        <Paragraph type="normal" style={{ fontWeight: "bold", fontSize: "25px", color: "#fbead4" }}>
          A New World, A New Home
        </Paragraph>
        <Paragraph type="normal">
          They found a quiet little world among the stars and decided to make it their own. Together, they turned it into a home filled with honey, cozy naps, new friends, and memories worth holding onto.
        </Paragraph>
        <Paragraph type="normal">
          <b style={{ fontWeight: "bold", fontSize: "18px", color: "#fbead4" }}>They called it BEARTH.</b>
        </Paragraph>
        {/* <Paragraph type="normal">
          So four little bears set off into the stars, searching for a new place to call home — and the perfect place for a nap.
        </Paragraph> */}
        {/* <Paragraph type="normal">
          Our mission: find the ultimate napping spot.
        </Paragraph>
        <Paragraph type="normal" className="font-bold">
          As for saving the world? That might just be the best side effect of
          the journey.
        </Paragraph> */}
      </>
    ),
  },
];

export default function SectionSecond() {
  return (
    <section className="py-16 md:py-24 text-white flex flex-col justify-center items-center">
      <CarouselProvider>
        <div className="w-full max-w-[1280px] px-4">
          <div className="flex flex-col">
            <AnimatedTitle>
              <Heading
                type="h1"
                className="uppercase text-primary title-stroke title-strokecolor-black"
              >
                Welcome to Bearth!
              </Heading>
            </AnimatedTitle>
            <div className="flex justify-between items-center">
              <Heading type="h3" as="h2" className="font-semibold">
                BEARTH = BEAR+EARTH+BIRTH
              </Heading>
              <CarouselButton className="hidden desktop:flex mr-8" />
            </div>
          </div>
        </div>

        <div className="w-full place-self-center overflow-hidden relative mt-4 xl:h-[545px]">
          <SectionSecondCarousel>
            {sections.map((section) => (
              <CarouselItem
                key={section.order}
                className="basis-11/12 max-w-[1232px]"
              >
                <BearthLiquidGlassEffect
                  shineType="2"
                  tintColor="bg-primary/50"
                  borderRadius="rounded-2xl"
                  className="h-full"
                  contentClassName="w-full"
                >
                  <div className="flex flex-col desktop:flex-col gap-4 p-4 lg:p-8 desktop:p-8 h-full">
                    <div className="flex flex-row gap-4 text-white items-center">
                      <div className="font-bold text-4xl desktop:text-7xl">
                        {section.order}
                      </div>
                      <div className="text-2xl desktop:text-[40px] font-bold leading-none">
                        {section.title}
                      </div>
                    </div>
                    <div className="flex flex-col xl:flex-row grow gap-4">
                      <div className="flex justify-center flex-1">
                        <div className="h-full w-full aspect-16/10 xl:aspect-auto relative">
                          <Image
                            src={section.image}
                            alt=""
                            className="object-cover rounded-2xl"
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                          />
                        </div>
                      </div>
                      <div className="grow text-white flex flex-col gap-2 justify-end xl:max-w-[400px] xl:min-w-[300px]">
                        {section.text}
                      </div>
                    </div>
                  </div>
                </BearthLiquidGlassEffect>
              </CarouselItem>
            ))}
          </SectionSecondCarousel>
        </div>
        <div className="flex desktop:hidden items-center justify-center mt-8">
          <CarouselButton className="flex" />
        </div>
      </CarouselProvider>
    </section>
  );
}
