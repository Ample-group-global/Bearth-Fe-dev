import BazaarMarketBrowser from "@/components/bearth/market/BazaarMarketBrowser";
import Heading from "@/components/bearth/Heading";
import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";
import { getMarketFloors } from "@/lib/market";

export default async function MarketPage() {
  const floors = await getMarketFloors();

  return (
    <MaxWidthConstraintedLayout
      as="main"
      fullHeight
      paddingHeader
      paddingFooter
      outerDivClassName="w-full bg-secondary"
    >
      <header className="pt-8">
        <Heading
          type="h1"
          className="text-primary title-stroke title-strokecolor-white"
        >
          BEARTH SHOPPING MARKET
        </Heading>
        <p className="max-w-2xl text-sm leading-relaxed text-white">
          A bustling market of whimsical inventions and heartwarming handmade
          crafts — browse shops by floor below.
        </p>
      </header>

      <BazaarMarketBrowser floors={floors} />
    </MaxWidthConstraintedLayout>
  );
}
