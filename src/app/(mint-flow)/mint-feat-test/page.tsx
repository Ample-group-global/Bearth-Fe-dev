"use client";

import "viem/window";
import { useActiveWallet, usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect } from "react";
import type { Hex } from "viem";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
} from "viem";
import { sepolia } from "viem/chains";
import { parseEther } from "viem/utils";
import { getWhitelistProof } from "@/lib/whitelist-proof";
import BearthNFT from "../../../BearthNFTAbi";
export default function MintPage() {
  const { login, logout, user } = usePrivy();
  const { wallet } = useActiveWallet();

  const mint = useCallback(async () => {
    console.log("button clicked.");

    if (typeof window === "undefined" || !window.ethereum) {
      console.error("No Ethereum provider found. Please install MetaMask.");
      return;
    }

    if (!wallet || wallet.type !== "ethereum") {
      console.error("No active Ethereum wallet found.");
      return;
    }

    console.log("wallet:", wallet);

    const provider = await wallet.getEthereumProvider();

    console.log("provider:", provider);

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
    });

    console.log("publicClient:", publicClient);

    const walletClient = createWalletClient({
      account: wallet.address as Hex,
      chain: sepolia,
      transport: custom(provider),
    });

    console.log("walletClient:", walletClient);

    const contract = getContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: BearthNFT.abi,
      client: { public: publicClient, wallet: walletClient },
    });

    console.log("contract:", contract.address);

    // For public mint
    const price = parseEther("0.0303");
    const totalPrice = price * BigInt(5);
    console.log("totalPrice:", totalPrice);

    // const { request } = await contract.simulate.wlMint();
    // const { request } = await contract.simulate.paidMint([totalPrice]);
    // const { request } = await contract.simulate.publicMint();

    // console.log("request:", request);

    // const hash = await walletClient.writeContract(request);
    // const hash = await contract.write.publicMint();
    // const eli = await checkEligibility(wallet.address)
    // console.log(eli);

    const proofResult = await getWhitelistProof(wallet.address);
    console.log("proofResult:", proofResult);
    if (!proofResult.is_whitelisted) {
      console.log("Address is not whitelisted");
      return;
    }

    const wlLimit = await publicClient.getStorageAt({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      slot: "0x14",
    });
    console.log("wlLimit:", BigInt(wlLimit as `0x${string}`));

    // const hash = await contract.write.wlMint([localProof.proof], {
    const hash = await contract.write.wlMint([proofResult.proof], {
      gas: BigInt(500_000),
    });

    console.log("contract call successful, hash:", hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("transaction receipt:", receipt);
  }, [wallet, wallet?.type]);

  return (
    <div className="p-32 bg-white">
      <main>
        {JSON.stringify(user)}

        {user ? (
          <button
            type="button"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              login();
            }}
          >
            Connect Wallet
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            mint();
          }}
        >
          Test Mint
        </button>
      </main>
    </div>
  );
}
