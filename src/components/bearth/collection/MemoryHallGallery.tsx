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
import { useDelayedLoading } from "@/lib/use-delayed-loading";

const RARITY_TRAIT_KEYS = new Set(["Rarity Rank", "Rarity Tier", "Rarity Score"]);

const TIER_STYLES: Record<
  string,
  { text: string; glow: string; glowColor: string; ring: string; chip: string; wash: string }
> = {
  common: {
    text: "text-slate-600",
    glow: "shadow-[0_0_40px_rgba(148,163,184,0.25)]",
    glowColor: "rgba(148,163,184,0.14)",
    ring: "ring-slate-200",
    chip: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    wash: "from-slate-50 to-white",
  },
  rare: {
    text: "text-sky-600",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.3)]",
    glowColor: "rgba(56,189,248,0.16)",
    ring: "ring-sky-200",
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    wash: "from-sky-50 to-white",
  },
  epic: {
    text: "text-violet-600",
    glow: "shadow-[0_0_40px_rgba(167,139,250,0.35)]",
    glowColor: "rgba(167,139,250,0.18)",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    wash: "from-violet-50 to-white",
  },
  legendary: {
    text: "text-amber-600",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.4)]",
    glowColor: "rgba(251,191,36,0.2)",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    wash: "from-amber-50 to-white",
  },
};

function tierStyle(tier: string | null) {
  return TIER_STYLES[tier?.toLowerCase() ?? ""] ?? TIER_STYLES.common;
}

const STARS = [
  { top: "8%", left: "12%", size: 2, delay: "0s" },
  { top: "18%", left: "78%", size: 1.5, delay: "0.6s" },
  { top: "30%", left: "45%", size: 1, delay: "1.2s" },
  { top: "12%", left: "60%", size: 1.5, delay: "1.8s" },
  { top: "40%", left: "20%", size: 1, delay: "0.3s" },
  { top: "55%", left: "85%", size: 2, delay: "0.9s" },
  { top: "70%", left: "10%", size: 1.5, delay: "1.5s" },
  { top: "65%", left: "55%", size: 1, delay: "2.1s" },
  { top: "80%", left: "70%", size: 1.5, delay: "0.4s" },
  { top: "85%", left: "30%", size: 1, delay: "1.1s" },
  { top: "25%", left: "90%", size: 1, delay: "1.7s" },
  { top: "5%", left: "35%", size: 1.5, delay: "0.7s" },
] as const;

function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

const IPFS_GATEWAY = "https://amgbearth.myfilebase.com/ipfs/";
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
  const { data: waveCatalog } = useSWR("wave-catalog", getWaveCatalog);
  const showLoadingSkeleton = useDelayedLoading(isLoading);

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
    if (!showLoadingSkeleton) return null;
    return (
      <div className="grid grid-cols-2 gap-2.5 py-8 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 animate-in fade-in duration-300">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10" />
            <div className="flex flex-col gap-1.5 pt-2.5">
              <div className="h-3.5 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
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
      <div className="animate-in fade-in flex flex-wrap justify-center gap-2.5 py-8 duration-300 sm:gap-3.5">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="w-[calc(50%-0.3125rem)] sm:w-[calc(33.333%-0.5834rem)] lg:w-[calc(25%-0.6563rem)] xl:w-[calc(20%-0.7rem)] 2xl:w-[calc(16.6667%-0.7292rem)]"
          >
            <NftCard
              nft={nft}
              waveEntry={waveCatalog?.find((w) => w.waveNumber === nft.waveNumber)}
              onOpen={() => setSelectedTokenId(nft.tokenId)}
            />
          </div>
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
      className="group flex cursor-pointer flex-col transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_10px_30px_rgba(65,175,235,0.3)] group-hover:ring-white/20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Bearth #${nft.tokenId}`}
            fill
            unoptimized
            className="animate-in fade-in object-cover duration-500 transition-transform group-hover:scale-105"
          />
        ) : nft.blindBoxVideoUrl ? (
          <video
            src={nft.blindBoxVideoUrl}
            poster={nft.blindBoxImageUrl ?? undefined}
            autoPlay
            loop
            muted
            playsInline
            className="animate-in fade-in h-full w-full object-cover duration-500 transition-transform group-hover:scale-105"
          />
        ) : nft.blindBoxImageUrl ? (
          <Image
            src={nft.blindBoxImageUrl}
            alt="Sealed Bearth"
            fill
            unoptimized
            className="animate-in fade-in object-cover duration-500 transition-transform group-hover:scale-105"
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
      <div className="flex flex-col gap-1 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">
            Bearth #{nft.tokenId}
          </span>
          {nft.rarityTier && (
            <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80 ring-1 ring-white/15">
              {nft.rarityTier}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {nft.waveNumber !== null && (
            <span className="text-xs font-medium text-white/60">
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
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-white/10 text-white/70",
              )}
            >
              {isFreeWave ? "Free" : "Paid"}
            </span>
          )}
          {nft.rarityRank !== null && (
            <span className="text-xs text-white/50">
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
          <CopyableAddress address={nft.ownerAddress} light />
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
      className="fixed inset-0 z-50 grid overflow-y-auto bg-secondary/80 p-4 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease-out forwards" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative m-auto w-full max-w-[32rem] overflow-hidden rounded-3xl bg-white ring-1 ring-secondary/10",
          tier.glow,
        )}
        style={{ animation: "modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/85 p-1.5 text-secondary shadow-sm transition-colors hover:bg-white"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>

        <div className="relative aspect-square max-h-[42vh] w-full overflow-hidden bg-[#0d1330]">
          {imageUrl ? (
            <>
              <Starfield />
              <div className="absolute inset-4">
                <Image
                  src={imageUrl}
                  alt={`Bearth #${nft.tokenId}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="reveal-sheen pointer-events-none absolute inset-0" />
            </>
          ) : nft.blindBoxVideoUrl ? (
            <>
              <Starfield />
              <video
                src={nft.blindBoxVideoUrl}
                poster={nft.blindBoxImageUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                className="relative h-full w-full object-contain p-4"
              />
            </>
          ) : nft.blindBoxImageUrl ? (
            <>
              <Starfield />
              <div className="absolute inset-4">
                <Image
                  src={nft.blindBoxImageUrl}
                  alt="Sealed Bearth"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </>
          ) : (
            <>
              <Starfield />
              <div className="relative flex h-full items-center justify-center text-xs uppercase tracking-wide text-white/50">
                Blind Box
              </div>
            </>
          )}
        </div>

        <div
          className="relative overflow-hidden p-3 pb-4"
          style={{
            background: `radial-gradient(120% 60% at 0% 0%, ${tier.glowColor}, transparent 60%)`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold tracking-tight text-secondary">
                Bearth #{nft.tokenId}
              </h2>
              <p className="truncate text-xs text-secondary/60">
                {waveEntry
                  ? `${waveSeriesName(waveEntry.name)} · Wave ${nft.waveNumber}`
                  : nft.waveNumber !== null
                    ? `Wave ${nft.waveNumber}`
                    : null}
                {isFreeWave !== undefined && (isFreeWave ? " · Free mint" : " · Paid mint")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                tier.chip,
              )}
            >
              <SparklesIcon className="size-3" />
              {nft.rarityTier ?? (nft.isRevealed ? "Revealed" : "Blind Box")}
            </span>
          </div>

          <div className="mt-2">
            {nft.isRevealed && (nft.rarityRank !== null || nft.rarityScore !== null) && (
              <div className="grid grid-cols-2 gap-1.5">
                {nft.rarityRank !== null && (
                  <div
                    className={cn(
                      "rounded-lg bg-gradient-to-b p-1.5 ring-1",
                      tier.wash,
                      tier.ring,
                    )}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-secondary/45">
                      Rarity Rank
                    </p>
                    <p className={cn("text-sm font-bold", tier.text)}>
                      #{nft.rarityRank}
                    </p>
                  </div>
                )}
                {nft.rarityScore !== null && (
                  <div
                    className={cn(
                      "rounded-lg bg-gradient-to-b p-1.5 ring-1",
                      tier.wash,
                      tier.ring,
                    )}
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-secondary/45">
                      Rarity Score
                    </p>
                    <p className="text-sm font-bold text-secondary">{nft.rarityScore}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <CopyableAddress address={nft.ownerAddress} />
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

            {nft.isRevealed && traitEntries.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-secondary/45">
                  Attributes
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {traitEntries.map(([traitType, value]) => (
                    <div
                      key={traitType}
                      className="rounded-md bg-secondary/[0.04] px-1.5 py-1 ring-1 ring-secondary/[0.06] transition-colors hover:bg-secondary/[0.07]"
                    >
                      <p className="truncate text-[7px] font-semibold uppercase tracking-wide text-secondary/45">
                        {traitType}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-secondary">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        @keyframes revealSheen {
          from {
            transform: translateX(-120%) skewX(-12deg);
          }
          to {
            transform: translateX(120%) skewX(-12deg);
          }
        }
        .reveal-sheen {
          background: linear-gradient(
            100deg,
            transparent 40%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 60%
          );
          animation: revealSheen 1.1s 0.15s ease-out both;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        .star {
          animation: twinkle 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-sheen {
            animation: none;
            display: none;
          }
          .star {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
