"use client";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintPrice() {
  const { price, mintQty, activeWave, pivotWave } = useBreathContract();
  if (price.isLoading) {
    return <div>Loading...</div>;
  }

  if (price.state === BigInt(0)) {
    return <div>Free</div>;
  }

  // Only multiply by mintQty once this wave is genuinely live -- mintQty
  // isn't meaningful for a wave that hasn't opened yet, and multiplying it
  // into a not-yet-mintable wave's preview price would show a fabricated
  // "total" the customer can't actually pay right now.
  const isLive = activeWave.state !== null && activeWave.state === pivotWave;
  const perNft = Number(price.state) / 10 ** 18;
  if (!isLive) {
    return <div>{perNft} ETH</div>;
  }

  // price.state is the per-NFT wave price -- must multiply by mintQty so this
  // actually shows the total the wallet will be prompted to pay, matching the
  // value the mint() call itself sends (see mint() in BreathContractContext.tsx).
  const total = perNft * mintQty;
  return <div>{total} ETH</div>;
}
