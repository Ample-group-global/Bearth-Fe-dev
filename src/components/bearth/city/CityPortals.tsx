"use client";

import CityPortal from "./CityPortal";
import { cityPortals } from "./city-portals.config";

export default function CityPortals() {
  return (
    <>
      {cityPortals.map((portal) => (
        <CityPortal key={portal.id} portal={portal} />
      ))}
    </>
  );
}
