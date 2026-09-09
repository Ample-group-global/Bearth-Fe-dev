"use client";
import { useContext } from "react";
import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { CarouselContext } from "./CarouselContext";

export function SectionSecondCarousel({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setCarouselApi } = useContext(CarouselContext);

  return (
    <Carousel
      className="h-full"
      setApi={setCarouselApi}
      opts={{
        align: "start",
        containScroll: false,
      }}
    >
      <CarouselContent
        outerClassName="h-full"
        className="h-full"
        outerStyle={{
          paddingLeft: "max(8px, calc((100vw - 1280px) / 2) + 8px)",
        }}
      >
        {children}
      </CarouselContent>
    </Carousel>
  );
}
