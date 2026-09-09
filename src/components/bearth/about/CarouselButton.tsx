"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CarouselContext } from "./CarouselContext";

export function CarouselButton({ className }: { className?: string }) {
  const { carouselApi } = useContext(CarouselContext);

  const [slideInView, setSlideInView] = useState<number[] | null>(null);
  carouselApi?.on("slidesInView", (api) => {
    setSlideInView(api.slidesInView());
  });

  const [canScrollPrev, canScrollNext] = useMemo(() => {
    return [carouselApi?.canScrollPrev(), carouselApi?.canScrollNext()];
  }, [carouselApi, slideInView]);

  return (
    <div
      className={cn(
        "flex bg-white rounded-full w-30 justify-between",
        className,
      )}
    >
      <Button
        onClick={() => carouselApi?.scrollPrev()}
        className={cn(
          "rounded-l-full rounded-r-none bg-white text-black hover:bg-white/80",
          !canScrollPrev && "opacity-20 cursor-not-allowed",
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        onClick={() => carouselApi?.scrollNext()}
        className={cn(
          "rounded-r-full rounded-l-none bg-white text-black hover:bg-white/80",
          !canScrollNext && "opacity-20 cursor-not-allowed",
        )}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
