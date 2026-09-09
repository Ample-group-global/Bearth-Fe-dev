"use client";

import {
  Backpack,
  Coffee,
  Footprints,
  Glasses,
  HardHat,
  Home,
  PawPrint,
  Shirt,
  ShoppingBag,
  Sticker,
  Watch,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketFloor, MarketShop, MarketShopIcon } from "@/lib/market";

const SHOP_ICONS: Record<MarketShopIcon, LucideIcon> = {
  shirt: Shirt,
  hoodie: ShoppingBag,
  outerwear: Wind,
  socks: Footprints,
  headwear: HardHat,
  bags: Backpack,
  accessories: Watch,
  eyewear: Glasses,
  plushies: PawPrint,
  drinkware: Coffee,
  stickers: Sticker,
  "home-decor": Home,
};

export default function BazaarMarketBrowser({
  floors,
}: {
  floors: MarketFloor[];
}) {
  const [activeFloor, setActiveFloor] = useState(floors[0]?.floor);
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);

  const floor = floors.find((f) => f.floor === activeFloor) ?? floors[0];

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap gap-2">
        {floors.map((f) => (
          <button
            key={f.floor}
            type="button"
            onClick={() => {
              setActiveFloor(f.floor);
              setExpandedShopId(null);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              f.floor === floor.floor
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
            )}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {floor.shops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            expanded={expandedShopId === shop.id}
            onToggle={() =>
              setExpandedShopId((current) =>
                current === shop.id ? null : shop.id,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function ShopCard({
  shop,
  expanded,
  onToggle,
}: {
  shop: MarketShop;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = SHOP_ICONS[shop.icon];

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white/5 transition-colors",
        expanded ? "border-primary sm:col-span-2" : "border-white/10",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-col items-center gap-2 p-5 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon className="size-7" />
        </div>
        <span className="text-sm font-semibold text-white">{shop.name}</span>
        <span className="text-xs text-white/50">
          {shop.products.length} item{shop.products.length === 1 ? "" : "s"}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-white/10 p-4">
          <p className="pb-1 text-xs text-white/60">{shop.description}</p>
          {shop.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white"
            >
              <span>{product.name}</span>
              <span className="text-white/60">${product.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
