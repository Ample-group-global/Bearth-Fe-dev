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
    // Previously parsed the response unconditionally with no status check --
    // a non-2xx here (e.g. contract_address rejected by the backend's regex
    // validation) still returned {}.is_whitelisted as undefined, which reads
    // as "not whitelisted" and would silently block minting with no visible
    // error anywhere.
    throw new Error(`Whitelist check failed (${res.status})`);
  }
  const data = await res.json();
  return {
    proof: data.proof,
    root: data.root,
    is_whitelisted: data.is_whitelisted,
  };
}
