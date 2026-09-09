/**
 * Placeholder catalog data shaped to match BearthApi's real product_categories
 * schema (category codes below mirror the seeded codes: t-shirts, headwear,
 * bags, accessories, outerwear, socks, hoodies). BearthApi has no public,
 * unauthenticated read endpoint yet — every /api/products and /api/catalog
 * route requires admin auth — so this module returns static placeholder
 * products until that endpoint exists. Swapping to live data later means
 * replacing getMarketFloors()'s body with a fetch call; the shapes below
 * (MarketFloor/MarketShop/MarketProduct) should stay the same.
 */

export interface MarketProduct {
  id: string;
  name: string;
  price: number;
}

export type MarketShopIcon =
  | "shirt"
  | "hoodie"
  | "outerwear"
  | "socks"
  | "headwear"
  | "bags"
  | "accessories"
  | "eyewear"
  | "plushies"
  | "drinkware"
  | "stickers"
  | "home-decor";

export interface MarketShop {
  id: string;
  name: string;
  categoryCode: string;
  icon: MarketShopIcon;
  description: string;
  products: MarketProduct[];
}

export interface MarketFloor {
  floor: number;
  name: string;
  shops: MarketShop[];
}

const MARKET_FLOORS: MarketFloor[] = [
  {
    floor: 1,
    name: "Ground Floor — Apparel Row",
    shops: [
      {
        id: "t-shirts",
        name: "T-Shirt Shop",
        categoryCode: "t-shirts",
        icon: "shirt",
        description: "Everyday tees printed with Bearth City artwork.",
        products: [
          { id: "tee-01", name: "Starport Launch Tee", price: 24.99 },
          { id: "tee-02", name: "Bear Clan Crest Tee", price: 24.99 },
          { id: "tee-03", name: "Memory Hall Tee", price: 26.99 },
        ],
      },
      {
        id: "hoodies",
        name: "Hoodie Shop",
        categoryCode: "hoodies",
        icon: "hoodie",
        description: "Warm pullovers for expeditions outside the plaza.",
        products: [
          { id: "hood-01", name: "Council Hoodie", price: 54.99 },
          { id: "hood-02", name: "Dream Archive Hoodie", price: 54.99 },
          { id: "hood-03", name: "Starport Zip Hoodie", price: 59.99 },
        ],
      },
      {
        id: "outerwear",
        name: "Outerwear Shop",
        categoryCode: "outerwear",
        icon: "outerwear",
        description: "Jackets and windbreakers for the floating city's chill.",
        products: [
          { id: "jkt-01", name: "Atmosphere Tower Windbreaker", price: 74.99 },
          { id: "jkt-02", name: "Salmon Stream Rain Shell", price: 69.99 },
        ],
      },
      {
        id: "socks",
        name: "Sock Shop",
        categoryCode: "socks",
        icon: "socks",
        description: "Cozy crew socks in Bearth City colorways.",
        products: [
          { id: "sock-01", name: "Bear Paw Crew Socks", price: 12.99 },
          { id: "sock-02", name: "Rocket Stripe Socks", price: 12.99 },
        ],
      },
    ],
  },
  {
    floor: 2,
    name: "First Floor — Headwear & Accessories",
    shops: [
      {
        id: "headwear",
        name: "Cap Shop",
        categoryCode: "headwear",
        icon: "headwear",
        description: "Caps and beanies for every explorer.",
        products: [
          { id: "cap-01", name: "Starport Snapback", price: 22.99 },
          { id: "cap-02", name: "Council Beanie", price: 19.99 },
          { id: "cap-03", name: "Bazaar Bucket Hat", price: 24.99 },
        ],
      },
      {
        id: "bags",
        name: "Bag Shop",
        categoryCode: "bags",
        icon: "bags",
        description: "Totes and packs for carrying home the day's finds.",
        products: [
          { id: "bag-01", name: "Moose Station Tote", price: 18.99 },
          { id: "bag-02", name: "Explorer Backpack", price: 64.99 },
        ],
      },
      {
        id: "accessories",
        name: "Accessories Shop",
        categoryCode: "accessories",
        icon: "accessories",
        description: "Small everyday carry pieces with Bearth City flair.",
        products: [
          { id: "acc-01", name: "Bearth Pin Set", price: 14.99 },
          { id: "acc-02", name: "City Skyline Watch", price: 89.99 },
        ],
      },
      {
        id: "eyewear",
        name: "Sunglasses Corner",
        categoryCode: "accessories",
        icon: "eyewear",
        description: "Shade for bright days over the plaza.",
        products: [{ id: "sun-01", name: "Plaza Sunglasses", price: 29.99 }],
      },
    ],
  },
  {
    floor: 3,
    name: "Second Floor — Collectibles & Lifestyle",
    shops: [
      {
        id: "plushies",
        name: "Bear Plushies",
        categoryCode: "plushies",
        icon: "plushies",
        description: "Huggable plush versions of Bearth City's residents.",
        products: [
          { id: "plush-01", name: "Vendor Bear Plush", price: 34.99 },
          { id: "plush-02", name: "Council Bear Plush", price: 34.99 },
        ],
      },
      {
        id: "drinkware",
        name: "Mug & Drinkware",
        categoryCode: "drinkware",
        icon: "drinkware",
        description: "Mugs and tumblers for honey nectar refills.",
        products: [
          { id: "mug-01", name: "Honey Nectar Mug", price: 16.99 },
          { id: "mug-02", name: "Starport Travel Tumbler", price: 22.99 },
        ],
      },
      {
        id: "stickers",
        name: "Sticker Shop",
        categoryCode: "stickers",
        icon: "stickers",
        description: "Landmark sticker packs for laptops and journals.",
        products: [{ id: "stk-01", name: "13 Landmarks Sticker Pack", price: 9.99 }],
      },
      {
        id: "home-decor",
        name: "Home & Decor",
        categoryCode: "home-decor",
        icon: "home-decor",
        description: "Bring a little of the floating city home.",
        products: [{ id: "dec-01", name: "Bearth City Skyline Print", price: 39.99 }],
      },
    ],
  },
];

export async function getMarketFloors(): Promise<MarketFloor[]> {
  return MARKET_FLOORS;
}
