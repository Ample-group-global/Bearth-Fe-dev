"use client";

import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";
import { WalletConnectControl } from "@/components/bearth/mint/wallet-connect-control";
import { WalletAddress } from "@/components/wallet/WalletAddress";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import MintPageBackground from "../../../components/bearth/MintPageBackground";
import { BreathMintQty } from "@/components/wallet/BreathMintQty";
import { BreathMintPrice } from "@/components/wallet/BreathMintPrice";
import Image from "next/image";
import { BreathMintButton } from "@/components/wallet/BreathMintButton";
import MintRing from "@/components/bearth/mint/MintRing";
import { useBreathContract } from "@/components/wallet/BreathContractContext";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { waveSeriesName } from "@/lib/wave-display";
import { cn } from "@/lib/utils";
import { useDelayedLoading } from "@/lib/use-delayed-loading";

interface MintPageComponentProps {
  className?: string;
}

export function MintPageComponent({ className }: MintPageComponentProps) {
  return (
    <MaxWidthConstraintedLayout
      as="main"
      paddingHeader
      paddingFooter
      fullHeight
      outerDivClassName="w-dvw h-dvh relative overflow-hidden"
      className={cn(
        "text-white w-full flex flex-col items-center px-4 lg:py-40",
        className,
      )}
    >
      <MintPageBackground />

      <WaveStatusBox />

      <MintRing>
        <WalletConnectControl>
          <MintForm />
        </WalletConnectControl>
      </MintRing>
    </MaxWidthConstraintedLayout>
  );
}
function TotalMintedBadge() {
  const { waves } = useBreathContract();
  if (waves.isLoading || waves.state.length === 0) return null;

  const totalMinted = waves.state.reduce((sum, w) => sum + w.soldCount, 0n);
  const totalSupply = waves.state.reduce((sum, w) => sum + w.qty, 0n);
  if (totalSupply === 0n) return null;

  return (
    <div className="text-[10px] font-bold uppercase tracking-wide text-white/80 lg:text-[13px]">
      {totalMinted.toLocaleString()} / {totalSupply.toLocaleString()} minted
      across all waves
    </div>
  );
}

function WaveStatusBox() {
  const { activeWave, pivotWave, waves, waveCatalog } = useBreathContract();
  const isLoading = activeWave.isLoading || waveCatalog.isLoading;
  const showLoadingSkeleton = useDelayedLoading(isLoading);
  const displayWaveNum = pivotWave;
  const isLive = activeWave.state !== null && activeWave.state === pivotWave;
  const waveInfo = waves.state.find((w) => w.waveNum === displayWaveNum);
  const isFree = waveInfo?.price === 0n;
  const catalogEntry = waveCatalog.state.find(
    (w) => w.waveNumber === displayWaveNum,
  );
  const waveTitle = catalogEntry
    ? `${waveSeriesName(catalogEntry.name).toUpperCase()} WAVE ${displayWaveNum}`
    : displayWaveNum
      ? `WAVE ${displayWaveNum}`
      : "MINT NOT OPEN";

  return (
    <div className="w-full max-w-[500px] h-[200px] absolute top-0 right-0">
      <div className="relative text-white h-full w-full">
        <div className="absolute right-0 bottom-0 pb-6 px-8 text-right font-hoss-round z-1">
          {isLoading ? (
            showLoadingSkeleton ? (
              <div className="flex flex-col items-end gap-2 animate-in fade-in duration-300">
                <div className="h-[20px] w-[180px] animate-pulse rounded bg-white/20 lg:h-[24px]" />
                <div className="h-[14px] w-[140px] animate-pulse rounded bg-white/20 lg:h-[20px]" />
              </div>
            ) : null
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="text-[20px] lg:text-[24px] font-semibold">
                {waveTitle}
              </div>
              {waveInfo && (
                <>
                  <div className="text-[14px] lg:text-[20px] font-semibold">
                    {isFree ? "FREE MINTING" : "PAID MINTING"}
                    {!isLive && " · COMING SOON"}
                  </div>
                  {isFree ? (
                    <>
                      <div className="text-[10px] lg:text-[16px]">
                        MINTERS ONLY NEED TO PAY THE GAS FEE
                      </div>
                      <div className="text-[10px] lg:text-[16px]">
                        EACH WALLET CAN ONLY MINT ONE NFT
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] lg:text-[16px]">
                      {`PRICE: ${Number(waveInfo.price) / 10 ** 18} ETH PER NFT`}
                    </div>
                  )}
                </>
              )}
              <div className="mt-1.5">
                <TotalMintedBadge />
              </div>
            </div>
          )}
        </div>
        <Image
          src="/assets/mint-status-bg.svg"
          alt="mint phase status"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

function StatusPill({
  wrongNetwork,
  isBlocked,
  isLoading,
  isPaused,
  isLive,
  allWavesDone,
}: {
  wrongNetwork: boolean;
  isBlocked: boolean;
  isLoading: boolean;
  isPaused: boolean;
  isLive: boolean;
  allWavesDone: boolean;
}) {
  const { label, classes } = wrongNetwork
    ? { label: "WRONG NETWORK", classes: "bg-red-500/15 text-red-400 ring-red-500/40" }
    : isBlocked
      ? { label: "WALLET BLOCKED", classes: "bg-red-500/15 text-red-400 ring-red-500/40" }
      : isLoading
        ? { label: "LOADING...", classes: "bg-white/10 text-gray-300 ring-white/20" }
        : isPaused
          ? { label: "MINTING PAUSED", classes: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/40" }
          : isLive
            ? { label: "MINT LIVE", classes: "bg-green-500/15 text-green-400 ring-green-500/40" }
            : allWavesDone
              ? { label: "MINT CLOSED", classes: "bg-white/10 text-gray-300 ring-white/20" }
              : { label: "COMING SOON", classes: "bg-primary/20 text-primary ring-primary/50" };

  return (
    <div
      className={cn(
        "mt-1 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 lg:text-sm",
        classes,
      )}
    >
      {label}
    </div>
  );
}

export function MintForm() {
  const { activeWave, pivotWave, waves, waveCatalog, isPaused, isBlocked } =
    useBreathContract();
  const { wrongNetwork } = useWalletConnect();
  const nowSecondsForStatus = BigInt(Math.floor(Date.now() / 1000));
  const allWavesDone =
    waves.state.length > 0 &&
    waves.state.every(
      (w) => w.closed || (w.endTime > 0n && w.endTime <= nowSecondsForStatus),
    );
  const isLive = activeWave.state !== null && activeWave.state === pivotWave;
  const pivotCatalogEntry = waveCatalog.state.find(
    (w) => w.waveNumber === pivotWave,
  );
  const priceLabel = isLive
    ? pivotCatalogEntry
      ? `${waveSeriesName(pivotCatalogEntry.name).toUpperCase()} WAVE ${pivotCatalogEntry.waveNumber} PRICE`
      : "TOTAL PRICE"
    : "PER NFT PRICE";
  const showStatusLoading = useDelayedLoading(activeWave.isLoading);

  return (
    <div className="h-full grid grid-cols-3 grid-rows-2 text-center z-10">
      <div className="flex flex-col">
        <div className="font-semibold">ADDRESS</div>
        <WalletAddress className="max-w-[120px] truncate" />
      </div>
      <div className="flex flex-col">
        <div className="font-semibold">MINT QUANTITY</div>
        <BreathMintQty></BreathMintQty>
      </div>
      <div className="flex flex-col">
        <div className="font-semibold">{priceLabel}</div>
        <BreathMintPrice></BreathMintPrice>
      </div>
      <div className="flex flex-col">
        <div className="font-semibold">ETH BALANCE</div>
        <WalletBalance className="max-w-[120px] truncate" />
      </div>
      <div className="flex flex-col">
        <BreathMintButton></BreathMintButton>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-semibold">STATUS</div>
        <StatusPill
          wrongNetwork={wrongNetwork}
          isBlocked={isBlocked.state}
          isLoading={showStatusLoading}
          isPaused={isPaused.state}
          isLive={Boolean(activeWave.state)}
          allWavesDone={allWavesDone}
        />
      </div>
    </div>
  );
}
