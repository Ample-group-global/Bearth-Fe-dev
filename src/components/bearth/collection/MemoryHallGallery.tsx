"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { BearthButton } from "@/components/bearth/BearthButton";
import { chainOptions } from "@/components/wallet/chains";
import { cn } from "@/lib/utils";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { getOwnedNfts, type MemoryHallNft } from "@/lib/memory-hall";
import { getWaveCatalog, type WaveCatalogEntry } from "@/lib/wave-catalog";
import { waveSeriesName } from "@/lib/wave-display";

// Rarity Rank/Tier/Score already have their own dedicated badge line on the
// card -- the traits blob also carries them as ordinary attributes, which
// duplicated all three as trait tiles again further down the same card.
const RARITY_TRAIT_KEYS = new Set(["Rarity Rank", "Rarity Tier", "Rarity Score"]);

const TIER_STYLES: Record<string, { text: string; glow: string; chip: string }> = {
  common: {
    text: "text-slate-200",
    glow: "shadow-[0_0_40px_rgba(148,163,184,0.25)]",
    chip: "bg-slate-400/15 text-slate-200 ring-1 ring-slate-300/30",
  },
  rare: {
    text: "text-sky-300",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.3)]",
    chip: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/40",
  },
  epic: {
    text: "text-violet-300",
    glow: "shadow-[0_0_40px_rgba(167,139,250,0.35)]",
    chip: "bg-violet-400/15 text-violet-300 ring-1 ring-violet-300/40",
  },
  legendary: {
    text: "text-amber-300",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.4)]",
    chip: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/40",
  },
};

function tierStyle(tier: string | null) {
  return TIER_STYLES[tier?.toLowerCase() ?? ""] ?? TIER_STYLES.common;
}

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

function CopyableAddress({
  address,
  light,
}: {
  address: string;
  light?: boolean;
}) {
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
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded font-mono text-[10px] transition-colors",
        light
          ? "text-white/50 hover:text-white"
          : "text-secondary/50 hover:text-primary",
      )}
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
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

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
    // Matches the real grid + card layout below exactly (same classes) so
    // nothing shifts or resizes once actual data arrives -- a bare spinner in
    // an otherwise-empty page read as a jarring stall rather than a gallery
    // already in the middle of loading.
    return (
      <div className="grid grid-cols-2 gap-2.5 py-8 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-[0_2px_10px_rgba(36,49,95,0.08)]"
          >
            <div className="aspect-square w-full animate-pulse bg-secondary/10" />
            <div className="flex flex-col gap-1.5 p-3">
              <div className="h-3.5 w-16 animate-pulse rounded bg-secondary/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-secondary/10" />
            </div>
          </div>
        ))}
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
  const selectedNft = nfts.find((n) => n.tokenId === selectedTokenId) ?? null;

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
    <>
      <div className="grid grid-cols-2 gap-2.5 py-8 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {nfts.map((nft) => (
          <NftCard
            key={nft.tokenId}
            nft={nft}
            waveEntry={waveCatalog?.find((w) => w.waveNumber === nft.waveNumber)}
            onOpen={() => setSelectedTokenId(nft.tokenId)}
          />
        ))}
      </div>
      {selectedNft && (
        <NftDetailModal
          nft={selectedNft}
          waveEntry={waveCatalog?.find((w) => w.waveNumber === selectedNft.waveNumber)}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </>
  );
}

function NftCard({
  nft,
  waveEntry,
  onOpen,
}: {
  nft: MemoryHallNft;
  waveEntry: WaveCatalogEntry | undefined;
  onOpen: () => void;
}) {
  const imageUrl = nftImageUrl(nft.imageIpfsHash, nft.isRevealed);
  const isFreeWave = waveEntry ? waveEntry.priceEth === 0 : undefined;
  const traitCount = Object.keys(nft.traits ?? {}).filter(
    (traitType) => !RARITY_TRAIT_KEYS.has(traitType),
  ).length;

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-[0_2px_10px_rgba(36,49,95,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(36,49,95,0.16)]"
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
      <div className="flex flex-col gap-1 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-secondary">
            Bearth #{nft.tokenId}
          </span>
          {nft.rarityTier && (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {nft.rarityTier}
            </span>
          )}
        </div>
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
          {nft.rarityRank !== null && (
            <span className="text-xs text-secondary/60">
              Rank #{nft.rarityRank}
            </span>
          )}
        </div>
        {nft.isRevealed && traitCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <SparklesIcon className="size-3" />
            {traitCount} attributes · tap to reveal
          </span>
        )}
        <div
          className="flex items-center justify-between gap-2 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <CopyableAddress address={nft.ownerAddress} />
          {CONTRACT_ADDRESS && (
            <a
              href={chainOption.openseaUrl(CONTRACT_ADDRESS, String(nft.tokenId))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary no-underline hover:underline"
            >
              OpenSea
              <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function NftDetailModal({
  nft,
  waveEntry,
  onClose,
}: {
  nft: MemoryHallNft;
  waveEntry: WaveCatalogEntry | undefined;
  onClose: () => void;
}) {
  const imageUrl = nftImageUrl(nft.imageIpfsHash, nft.isRevealed);
  const isFreeWave = waveEntry ? waveEntry.priceEth === 0 : undefined;
  const traitEntries = Object.entries(nft.traits ?? {}).filter(
    ([traitType]) => !RARITY_TRAIT_KEYS.has(traitType),
  );
  const tier = tierStyle(nft.rarityTier);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-secondary/80 p-4 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease-out forwards" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-2xl overflow-hidden rounded-3xl bg-secondary ring-1 ring-white/10",
          tier.glow,
        )}
        style={{ animation: "modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-1.5 text-white/80 transition-colors hover:bg-black/50 hover:text-white"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>

        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden bg-black/20 sm:aspect-auto">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Bearth #${nft.tokenId}`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : nft.blindBoxVideoUrl ? (
              <video
                src={nft.blindBoxVideoUrl}
                poster={nft.blindBoxImageUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : nft.blindBoxImageUrl ? (
              <Image
                src={nft.blindBoxImageUrl}
                alt="Sealed Bearth"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-white/50">
                Blind Box
              </div>
            )}
          </div>

          <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-5 sm:p-6">
            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  tier.chip,
                )}
              >
                <SparklesIcon className="size-3" />
                {nft.rarityTier ?? (nft.isRevealed ? "Revealed" : "Blind Box")}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-white">
                Bearth #{nft.tokenId}
              </h2>
              <p className="text-sm text-white/60">
                {waveEntry
                  ? `${waveSeriesName(waveEntry.name)} · Wave ${nft.waveNumber}`
                  : nft.waveNumber !== null
                    ? `Wave ${nft.waveNumber}`
                    : null}
                {isFreeWave !== undefined && (isFreeWave ? " · Free mint" : " · Paid mint")}
              </p>
            </div>

            {nft.isRevealed && (nft.rarityRank !== null || nft.rarityScore !== null) && (
              <div className="grid grid-cols-2 gap-2">
                {nft.rarityRank !== null && (
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                      Rarity Rank
                    </p>
                    <p className={cn("text-lg font-bold", tier.text)}>
                      #{nft.rarityRank}
                    </p>
                  </div>
                )}
                {nft.rarityScore !== null && (
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                      Rarity Score
                    </p>
                    <p className="text-lg font-bold text-white">{nft.rarityScore}</p>
                  </div>
                )}
              </div>
            )}

            {nft.isRevealed && traitEntries.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-white/40">
                  Attributes
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {traitEntries.map(([traitType, value]) => (
                    <div
                      key={traitType}
                      className="rounded-xl bg-white/5 p-2 ring-1 ring-white/5"
                    >
                      <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-white/40">
                        {traitType}
                      </p>
                      <p className="truncate text-sm font-semibold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
              <CopyableAddress address={nft.ownerAddress} light />
              {CONTRACT_ADDRESS && (
                <a
                  href={chainOption.openseaUrl(CONTRACT_ADDRESS, String(nft.tokenId))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary no-underline hover:underline"
                >
                  View on OpenSea
                  <ExternalLinkIcon className="size-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
