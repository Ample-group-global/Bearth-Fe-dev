"use server";

import { getContractAddress } from "@/lib/contract-address";

export async function getWalletMintedInWave(
  address: string,
  waveNum: number,
): Promise<number> {
  const url = new URL(
    `${(process.env.BEARTH_API_URL ?? "").trim()}/api/nft-sell/collection/tokens`,
  );
  url.searchParams.set("owner", address);
  url.searchParams.set("contract_address", await getContractAddress());

  const res = await fetch(url.toString());
  if (!res.ok) return 0;
  const data = (await res.json()) as { tokens?: Array<{ on_chain_wave_num: number | null }> };
  return (data.tokens ?? []).filter((t) => t.on_chain_wave_num === waveNum).length;
}
