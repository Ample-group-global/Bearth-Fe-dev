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
  const { activeWave, waves, waveCatalog } = useBreathContract();
  const activeWaveNum = activeWave.state;
  const activeWaveInfo = waves.state.find((w) => w.waveNum === activeWaveNum);
  const isFree = activeWaveInfo?.price === 0n;
  const activeCatalogEntry = waveCatalog.state.find(
    (w) => w.waveNumber === activeWaveNum,
  );
  const waveTitle = activeCatalogEntry
    ? `${waveSeriesName(activeCatalogEntry.name).toUpperCase()} WAVE ${activeWaveNum}`
    : activeWaveNum
      ? `WAVE ${activeWaveNum}`
      : "MINT NOT OPEN";

  return (
    <div className="w-full max-w-[500px] h-[200px] absolute top-0 right-0">
      <div className="relative text-white h-full w-full">
        <div className="absolute right-0 bottom-0 pb-6 px-8 text-right font-hoss-round z-1">
          <div className="text-[20px] lg:text-[24px] font-semibold">
            {waveTitle}
          </div>
          {activeWaveInfo && (
            <>
              <div className="text-[14px] lg:text-[20px] font-semibold">
                {isFree ? "FREE MINTING" : "PAID MINTING"}
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
                  {`PRICE: ${Number(activeWaveInfo.price) / 10 ** 18} ETH PER NFT`}
                </div>
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
  const { activeWave, waveCatalog } = useBreathContract();
  const { wrongNetwork } = useWalletConnect();
  const activeWaveCatalog = waveCatalog.state.find(
    (w) => w.waveNumber === activeWave.state,
  );
  const priceLabel = activeWaveCatalog
    ? `${waveSeriesName(activeWaveCatalog.name).toUpperCase()} WAVE ${activeWaveCatalog.waveNumber} PRICE`
    : "TOTAL PRICE";

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
              : activeWave.state
                ? "text-green-500"
                : "text-gray-400"
          }
        >
          {wrongNetwork
            ? "WRONG NETWORK"
            : activeWave.state
              ? "MINT LIVE"
              : "MINT CLOSED"}
        </div>
      </div>
    </div>
  );
}
