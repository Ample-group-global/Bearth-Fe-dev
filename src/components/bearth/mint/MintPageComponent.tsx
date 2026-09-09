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

      {/* Top-Right Status Box */}
      <WaveStatusBox />

      {/* Ring Container */}
      <MintRing>
        <WalletConnectControl>
          <MintForm />
        </WalletConnectControl>
      </MintRing>
    </MaxWidthConstraintedLayout>
  );
}
function WaveStatusBox() {
  const { activeWave, pivotWave, waves, waveCatalog } = useBreathContract();
  // Neither activeWave.state being null nor waveCatalog.state being empty
  // distinguishes "still loading" from "genuinely no wave is active" -- on a
  // fresh page load/refresh this previously collapsed straight to "MINT NOT
  // OPEN" for the ~300-500ms before data arrived, reading as the wave info
  // vanishing rather than loading.
  const isLoading = activeWave.isLoading || waveCatalog.isLoading;
  // Describes pivotWave (same wave the ring below centers) rather than only
  // activeWave.state -- previously this box only ever showed real info while
  // a wave was genuinely live, collapsing to a bare "MINT NOT OPEN" for the
  // entire gap between waves even though the next wave's price/details are
  // already known and worth showing as a preview.
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
            <div className="flex flex-col items-end gap-2">
              <div className="h-[20px] w-[180px] animate-pulse rounded bg-white/20 lg:h-[24px]" />
              <div className="h-[14px] w-[140px] animate-pulse rounded bg-white/20 lg:h-[20px]" />
            </div>
          ) : (
            <>
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
            </>
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

export function MintForm() {
  const { activeWave, pivotWave, waves, waveCatalog } = useBreathContract();
  const { wrongNetwork } = useWalletConnect();
  // Every wave closed or past its scheduled end -- distinct from "no wave
  // active yet" (a real upcoming wave is still queued). Only this genuine
  // end-of-collection case still reads as "MINT CLOSED"; everything else
  // that isn't live yet is "COMING SOON" instead of the same terminal-
  // sounding label.
  const nowSecondsForStatus = BigInt(Math.floor(Date.now() / 1000));
  const allWavesDone =
    waves.state.length > 0 &&
    waves.state.every(
      (w) => w.closed || (w.endTime > 0n && w.endTime <= nowSecondsForStatus),
    );
  // Live (activeWave === pivotWave): show the real wave name + "TOTAL PRICE"
  // for however many NFTs are queued to mint. Not live yet (pivotWave is
  // just the next upcoming wave): "PER NFT PRICE" instead -- qty isn't
  // meaningful for a wave that isn't open, so labeling it "total" would
  // misleadingly imply a computed total the customer can't actually pay yet.
  const isLive = activeWave.state !== null && activeWave.state === pivotWave;
  const pivotCatalogEntry = waveCatalog.state.find(
    (w) => w.waveNumber === pivotWave,
  );
  const priceLabel = isLive
    ? pivotCatalogEntry
      ? `${waveSeriesName(pivotCatalogEntry.name).toUpperCase()} WAVE ${pivotCatalogEntry.waveNumber} PRICE`
      : "TOTAL PRICE"
    : "PER NFT PRICE";

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
      <div className="flex flex-col">
        <div className="font-semibold">STATUS</div>
        <div
          className={
            wrongNetwork
              ? "text-red-500"
              : activeWave.isLoading
                ? "text-gray-400"
                : activeWave.state
                  ? "text-green-500"
                  : allWavesDone
                    ? "text-gray-400"
                    : "text-primary"
          }
        >
          {wrongNetwork
            ? "WRONG NETWORK"
            : activeWave.isLoading
              ? "LOADING..."
              : activeWave.state
                ? "MINT LIVE"
                : allWavesDone
                  ? "MINT CLOSED"
                  : "COMING SOON"}
        </div>
      </div>
    </div>
  );
}
