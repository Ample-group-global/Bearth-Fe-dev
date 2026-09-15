"use client";

import { useBreathContract } from "@/components/wallet/BreathContractContext";
import { cn } from "@/lib/utils";

export function RingContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute w-full h-full transition-transform duration-700 ease-out",
        className,
      )}
    >
      <div className="text-xs absolute h-[100px] top-0 left-1/2 -translate-x-1/2 text-white flex flex-col items-center justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        {children}
      </div>
    </div>
  );
}

export function RingItem({
  title,
  value,
  className,
  inline,
  secondaryValue,
  dotClassName,
  lineClassName,
  dotCoreClassName,
}: {
  title?: string;
  value?: number | string;
  className?: string;
  inline?: boolean;
  secondaryValue?: number | string;
  dotClassName?: string;
  lineClassName?: string;
  dotCoreClassName?: string;
}) {
  if (inline) {
    return (
      <RingContainer className={cn("font-semibold", className)}>
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span>{value ?? " "}</span>
        </div>
        {secondaryValue !== undefined && (
          <>
            <div className="relative flex h-[35px] my-1">
              <div
                className={cn(
                  "absolute z-0 h-[35px] left-1/2 -translate-x-1/2 top-0 w-[2px] bg-white",
                  lineClassName,
                )}
              ></div>
              <div
                className={cn(
                  "z-1 w-[24px] h-[24px] rounded-full bg-black border-2 border-white flex items-center justify-center place-self-center",
                  dotClassName,
                )}
              >
                <div className={cn("w-[9px] h-[9px] rounded-full bg-white", dotCoreClassName)}></div>
              </div>
            </div>
            <div>{secondaryValue}</div>
          </>
        )}
      </RingContainer>
    );
  }

  return (
    <RingContainer className={cn("font-semibold", className)}>
      <div>{title}</div>
      <div className="relative flex h-[35px] my-1">
        <div className="absolute z-0 h-[35px] left-1/2 -translate-x-1/2 top-0 w-[2px] bg-white"></div>
        <div className="z-1 w-[24px] h-[24px] rounded-full bg-black border-2 border-white flex items-center justify-center place-self-center">
          <div className="w-[9px] h-[9px] rounded-full bg-white"></div>
        </div>
      </div>
      <div>{value ?? " "}</div>
    </RingContainer>
  );
}

const ROTATION_BY_OFFSET = [
  "-rotate-120",
  "-rotate-100",
  "-rotate-80",
  "-rotate-60",
  "-rotate-40",
  "-rotate-20",
  "rotate-0",
  "rotate-20",
  "rotate-40",
  "rotate-60",
  "rotate-80",
  "rotate-100",
  "rotate-120",
];

export function RingLine({ className }: { className?: string }) {
  return (
    <RingContainer className={className}>
      <div className="relative flex h-[24px] my-1">
        <div className="absolute z-0 h-[24px] left-1/2 -translate-x-1/2 top-0 w-[2px] bg-white"></div>
      </div>
    </RingContainer>
  );
}

const SKELETON_WAVE_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

export default function MintRing({ children }: { children: React.ReactNode }) {
  const contract = useBreathContract();

  const isLoadingWaves = contract.waves.isLoading || contract.activeWave.isLoading;

  const waveList = [...contract.waves.state].sort(
    (a, b) => a.waveNum - b.waveNum,
  );
  const pivot = contract.pivotWave ?? 1;
  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-[850px] md:-bottom-[930px] w-[1200px] h-[1200px] scale-75 md:scale-100 flex items-center justify-center tk-hoss-round-wide">
      <div className="relative rounded-full bg-black/50 w-full h-full flex items-center justify-center">
        {isLoadingWaves
          ? SKELETON_WAVE_NUMBERS.map((waveNum) => (
              <RingContainer
                key={waveNum}
                className={cn(
                  "font-semibold",
                  ROTATION_BY_OFFSET[waveNum - 1 + 6],
                )}
              >
                <div className="h-[14px] w-[70px] animate-pulse rounded bg-white/20" />
              </RingContainer>
            ))
          : waveList.map((w) => {
              const isActive = w.waveNum === contract.activeWave.state;
              const isDone =
                !isActive &&
                (w.closed || (w.endTime > 0n && w.endTime <= nowSeconds));
              const isPivot = w.waveNum === pivot;
              const showSupply = isPivot || isDone;
              const isNext = isPivot && !isActive;
              return (
                <RingItem
                  key={w.waveNum}
                  title={`Wave ${w.waveNum}`}
                  secondaryValue={
                    showSupply
                      ? `${w.soldCount.toString()} / ${w.qty.toString()}`
                      : "0"
                  }
                  className={cn(
                    ROTATION_BY_OFFSET[w.waveNum - pivot + 6],
                    isActive &&
                      "text-green-400 opacity-100 font-extrabold drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]",
                    isDone && "text-gray-500/70 font-medium",
                    !isActive && !isDone && isNext && "text-white font-semibold",
                    !isActive && !isDone && !isNext && "text-white/50 font-medium",
                  )}
                  dotClassName={cn(
                    isActive &&
                      "border-green-400 bg-green-400/25 shadow-[0_0_12px_rgba(74,222,128,0.8)]",
                    isDone && "border-gray-500/50 bg-gray-500/10",
                    !isActive && !isDone && isNext && "border-white",
                    !isActive && !isDone && !isNext && "border-white/35",
                  )}
                  dotCoreClassName={cn(
                    isActive && "bg-green-400",
                    isDone && "bg-gray-500/50",
                    !isActive && !isDone && isNext && "bg-white",
                    !isActive && !isDone && !isNext && "bg-white/35",
                  )}
                  lineClassName={cn(
                    isActive && "bg-green-400",
                    isDone && "bg-gray-500/50",
                    !isActive && !isDone && isNext && "bg-white",
                    !isActive && !isDone && !isNext && "bg-white/35",
                  )}
                  inline
                />
              );
            })}

        <div className="rounded-full w-[1100px] h-[1100px] border-3 border-white flex items-center justify-center">
          <div className="rounded-full w-[1000px] h-[1000px] bg-black/20 border border-white/20 relative">
            <div className="rounded-full absolute top-0 left-0 w-full h-full justify-center flex flex-row mt-9 text-sm">
              <div className="h-[140px]">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
