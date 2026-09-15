"use server";

import { Hex } from "viem";
import { getContractAddress } from "@/lib/contract-address";

export interface MerkleProofResult {
  proof: Hex[];
  root: string;
  is_whitelisted: boolean;
}

export async function getWhitelistProof(
  address: string,
): Promise<MerkleProofResult> {
  const res = await fetch(`${process.env.BEARTH_API_URL}/api/whitelist/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, contractAddress: getContractAddress() }),
  });
  if (!res.ok) {
    throw new Error(`Whitelist check failed (${res.status})`);
  }
  const data = await res.json();
  return {
    proof: data.proof,
    root: data.root,
    is_whitelisted: data.is_whitelisted,
  };
}
