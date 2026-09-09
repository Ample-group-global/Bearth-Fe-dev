"use client";

import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { BearthButton } from "@/components/bearth/BearthButton";
import { chainOptions } from "@/components/wallet/chains";
import { cn } from "@/lib/utils";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { getOwnedNfts } from "@/lib/memory-hall";
import { getWaveCatalog } from "@/lib/wave-catalog";
import { waveSeriesName } from "@/lib/wave-display";

const IPFS_GATEWAY = "https://amgbearth.myfilebase.com/ipfs/";
// Same helper the mint-success screen uses -- on Sepolia this correctly
// points at Etherscan's NFT view instead of opensea.io, since OpenSea has no
// testnet listing path (retired July 2025); on mainnet it's a real OpenSea
// item link a holder can list for sale from.
const chainOption =
  chainOptions[process.env.NEXT_PUBLIC_CONTRACT_NET as "mainnet" | "sepolia"];
const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
)?.replace(/\s+/g, "");

function nftImageUrl(imageIpfsHash: string | null, isRevealed: boolean) {
  if (!isRevealed || !imageIpfsHash) return null;
  return `${IPFS_GATEWAY}${imageIpfsHash}`;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center py-8 sm:py-16">
      {/* Solid white card (same language as the NFT tiles below) rather than
          text floating directly on the page background -- guarantees
          readable contrast regardless of what's behind it, and reads as a
          deliberate, defined UI element instead of loose centered text. */}
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-secondary/10 bg-white px-8 py-12 text-center shadow-[0_2px_10px_rgba(36,49,95,0.08)]">
        {children}
      </div>
    </div>
  );
}

function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex w-fit items-center gap-1 rounded font-mono text-[10px] text-secondary/50 transition-colors hover:text-primary"
      title="Copy wallet address"
    >
      {address.slice(0, 6)}...{address.slice(-4)}
      {copied ? (
        <CheckIcon className="size-2.5 text-emerald-600" />
      ) : (
        <CopyIcon className="size-2.5" />
      )}
    </button>
  );
}

export default function MemoryHallGallery() {
  const { authenticated, login, wallet } = useWalletConnect();

  const { data, error, isLoading } = useSWR(
    wallet ? (["memory-hall", wallet.address] as const) : null,
    ([, address]) => getOwnedNfts(address),
  );
  // Same public wave-catalog endpoint the mint page uses -- token records only
  // carry a bare wave number, real names/pricing live in Postgres, not on-chain.
  const { data: waveCatalog } = useSWR("wave-catalog", getWaveCatalog);

  if (!authenticated || !wallet) {
    return (
      <EmptyState>
        <p className="max-w-sm text-sm leading-relaxed text-secondary">
          Connect your wallet to open your exhibition hall in Memory Hall.
        </p>
        <BearthButton onClick={() => login()}>Connect Wallet</BearthButton>
      </EmptyState>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 sm:py-24">
        <div className="size-10 animate-spin rounded-full border-2 border-white/30 border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState>
        <p className="max-w-sm text-sm text-secondary">
          Couldn&apos;t load your collection right now. Please try again shortly.
        </p>
      </EmptyState>
    );
  }

  const nfts = data?.tokens ?? [];

  if (nfts.length === 0) {
    return (
      <EmptyState>
        <p className="max-w-sm text-sm leading-relaxed text-secondary">
          Your exhibition hall is empty — mint your first Bearth at the Starport
          to begin your story.
        </p>
        <BearthButton href="/mint">Visit Starport</BearthButton>
      </EmptyState>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {nfts.map((nft) => {
        const imageUrl = nftImageUrl(nft.imageIpfsHash, nft.isRevealed);
        const waveEntry = waveCatalog?.find(
          (w) => w.waveNumber === nft.waveNumber,
        );
        const isFreeWave = waveEntry ? waveEntry.priceEth === 0 : undefined;

        return (
          <div
            key={nft.tokenId}
            className="group flex flex-col overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-[0_2px_10px_rgba(36,49,95,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(36,49,95,0.16)]"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-secondary">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`Bearth #${nft.tokenId}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : nft.blindBoxVideoUrl ? (
                <video
                  src={nft.blindBoxVideoUrl}
                  poster={nft.blindBoxImageUrl ?? undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : nft.blindBoxImageUrl ? (
                <Image
                  src={nft.blindBoxImageUrl}
                  alt="Sealed Bearth"
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-white/50">
                  Blind Box
                </div>
              )}
              <span
                className={cn(
                  "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
                  nft.isRevealed
                    ? "bg-primary text-white"
                    : "bg-white/90 text-secondary",
                )}
              >
                {nft.isRevealed ? "Revealed" : "Blind Box"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-3">
              <span className="text-sm font-bold text-secondary">
                Bearth #{nft.tokenId}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {nft.waveNumber !== null && (
                  <span className="text-xs font-medium text-secondary/70">
                    {waveEntry
                      ? `${waveSeriesName(waveEntry.name)} · Wave ${nft.waveNumber}`
                      : `Wave ${nft.waveNumber}`}
                  </span>
                )}
                {isFreeWave !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                      isFreeWave
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-secondary/10 text-secondary",
                    )}
                  >
                    {isFreeWave ? "Free" : "Paid"}
                  </span>
                )}
              </div>
              {nft.rarityTier && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-semibold uppercase text-primary">
                    {nft.rarityTier}
                  </span>
                  {nft.rarityRank !== null && (
                    <span className="text-xs text-secondary/60">
                      Rank #{nft.rarityRank}
                    </span>
                  )}
                </div>
              )}
              {nft.isRevealed && nft.traits && (
                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 rounded-lg bg-primary/5 p-2">
                  {Object.entries(nft.traits).map(([traitType, value]) => (
                    <div key={traitType} className="flex flex-col overflow-hidden">
                      <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-secondary/50">
                        {traitType}
                      </span>
                      <span className="truncate text-xs font-medium text-secondary">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <CopyableAddress address={nft.ownerAddress} />
              {CONTRACT_ADDRESS && (
                <a
                  href={chainOption.openseaUrl(
                    CONTRACT_ADDRESS,
                    String(nft.tokenId),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary no-underline hover:underline"
                >
                  View on OpenSea
                  <ExternalLinkIcon className="size-3" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
