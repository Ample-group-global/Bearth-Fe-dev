"use server";

export async function getWalletMintedInWave(
  address: string,
  waveNum: number,
): Promise<number> {
  const url = new URL(`${process.env.BEARTH_API_URL}/api/nft-sell/collection/tokens`);
  url.searchParams.set("owner", address);
  url.searchParams.set("contract_address", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "");
  url.searchParams.set("limit", "500");

  const res = await fetch(url.toString());
  if (!res.ok) return 0;
  const data = (await res.json()) as { tokens?: Array<{ on_chain_wave_num: number | null }> };
  return (data.tokens ?? []).filter((t) => t.on_chain_wave_num === waveNum).length;
}
