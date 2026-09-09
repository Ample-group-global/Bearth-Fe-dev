"use client";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintPrice() {
  const { price, mintQty } = useBreathContract();
  if (price.isLoading) {
    return <div>Loading...</div>;
  }

  if (price.state === BigInt(0)) {
    return <div>Free</div>;
  }

  // price.state is the per-NFT wave price -- must multiply by mintQty so this
  // actually shows the total the wallet will be prompted to pay, matching the
  // value the mint() call itself sends (see mint() in BreathContractContext.tsx).
  const total = (Number(price.state) / 10 ** 18) * mintQty;
  return <div>{total} ETH</div>;
}
