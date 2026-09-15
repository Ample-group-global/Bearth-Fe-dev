"use server";

export async function registerWallet(address: string, privyUserId?: string): Promise<void> {
  await fetch(`${process.env.BEARTH_API_URL}/api/wallets/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, privyUserId }),
  }).catch(() => {});
}
