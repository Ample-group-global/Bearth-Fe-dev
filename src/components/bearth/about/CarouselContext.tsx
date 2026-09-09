"use client";

import { createContext, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

export const CarouselContext = createContext<{
  carouselApi: CarouselApi;
  setCarouselApi: (api: CarouselApi) => void;
}>({
  carouselApi: undefined,
  setCarouselApi: () => {},
});

export function CarouselProvider({ children }: { children: React.ReactNode }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>(undefined);

  return (
    <CarouselContext.Provider value={{ carouselApi, setCarouselApi }}>
      {children}
    </CarouselContext.Provider>
  );
}
