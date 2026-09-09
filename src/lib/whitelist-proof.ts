"use server";

import { Hex } from "viem";

export interface MerkleProofResult {
  proof: Hex[];
  root: string;
  is_whitelisted: boolean;
}

export async function getWhitelistProof(
  address: string,
): Promise<MerkleProofResult> {
  const result = fetch(`${process.env.BEARTH_API_URL}/api/whitelist/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  })
    .then((res) => res.json())
    .then((data) => {
      return {
        proof: data.proof,
        root: data.root,
        is_whitelisted: data.is_whitelisted,
      };
    });

  return result;
}
