"use server";

import { getContractAddress } from "@/lib/contract-address";

export async function registerWallet(address: string, privyUserId?: string): Promise<void> {
  await fetch(`${process.env.BEARTH_API_URL}/api/wallets/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, contractAddress: getContractAddress(), privyUserId }),
  }).catch(() => {});
}
