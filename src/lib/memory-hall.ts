"use server";

import { getContractAddress } from "@/lib/contract-address";

export interface MemoryHallNft {
  tokenId: number;
  ownerAddress: string;
  waveNumber: number | null;
  rarityTier: string | null;
  rarityScore: string | null;
  rarityRank: number | null;
  traits: Record<string, string> | null;
  isRevealed: boolean;
  imageIpfsHash: string | null;
  blindBoxImageUrl: string | null;
  blindBoxVideoUrl: string | null;
  mintedAt: string | null;
}

interface MemoryHallResponse {
  tokens: MemoryHallNft[];
  total: number;
}

interface RawToken {
  token_id: number;
  owner_address: string;
  wave_number: number | null;
  rarity_tier: string | null;
  rarity_score: string | null;
  rarity_rank: number | null;
  traits: Record<string, string> | null;
  is_revealed: boolean;
  image_ipfs_hash: string | null;
  blind_box_image_url: string | null;
  blind_box_video_url: string | null;
  minted_at: string | null;
}

export async function getOwnedNfts(
  address: string,
): Promise<MemoryHallResponse> {
  const url = new URL(
    `${(process.env.BEARTH_API_URL ?? "").trim()}/api/nft-sell/collection/tokens`,
  );
  url.searchParams.set("owner", address);
  const contractAddress = await getContractAddress();
  if (contractAddress) {
    url.searchParams.set("contract_address", contractAddress);
  }
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to load NFTs (${response.status})`);
  }

  const data = (await response.json()) as {
    tokens: RawToken[];
    total: number;
  };

  return {
    total: data.total ?? 0,
    tokens: (data.tokens ?? []).map((token) => ({
      tokenId: token.token_id,
      ownerAddress: token.owner_address,
      waveNumber: token.wave_number,
      rarityTier: token.rarity_tier,
      rarityScore: token.rarity_score,
      rarityRank: token.rarity_rank,
      traits: token.traits,
      isRevealed: token.is_revealed,
      imageIpfsHash: token.image_ipfs_hash,
      blindBoxImageUrl: token.blind_box_image_url,
      blindBoxVideoUrl: token.blind_box_video_url,
      mintedAt: token.minted_at,
    })),
  };
}
