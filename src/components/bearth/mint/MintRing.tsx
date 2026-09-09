"use client";

import { useBreathContract } from "@/components/wallet/BreathContractContext";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";

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
      <div className="text-xs absolute h-[100px] top-0 left-1/2 -translate-x-1/2 text-white flex flex-col items-center justify-center">
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
}: {
  title?: string;
  value?: number | string;
  className?: string;
  // Renders value beside title on one line instead of stacked below the
  // dot separator -- used for the Wave/Free item per explicit design request.
  inline?: boolean;
  // Fills the space freed up by `inline` (previously the stacked value slot)
  // with a second stat below the dot separator -- e.g. mint progress.
  secondaryValue?: number | string;
}) {
  if (inline) {
    return (
      <RingContainer className={cn("font-semibold", className)}>
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span>{value ?? "\u00A0"}</span>
        </div>
        {secondaryValue !== undefined && (
          <>
            <div className="relative flex h-[35px] my-1">
              <div className="absolute z-0 h-[35px] left-1/2 -translate-x-1/2 top-0 w-[2px] bg-white"></div>
              <div className="z-1 w-[24px] h-[24px] rounded-full bg-black border-2 border-white flex items-center justify-center place-self-center">
                <div className="w-[9px] h-[9px] rounded-full bg-white"></div>
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
      <div>{value ?? "\u00A0"}</div>
    </RingContainer>
  );
}

// Position of each wave is relative to the ACTIVE wave, not a fixed anchor: the
// active wave sits at rotate-0 (top/middle), finished waves rotate anticlockwise
// to the left (negative), upcoming waves sit clockwise to the right (positive).
// Indexed by (waveNum - activeWaveNum) + 6, covering every possible offset for a
// fixed 7-wave layout (-6..+6). As activeWave advances, each wave's offset shifts
// by one slot, which combined with the transition on RingContainer animates the
// whole ring rotating anticlockwise -- past waves exit left, the next wave enters
// from the right into the middle.
//
// 20deg/step (not the ring's full 360/7 spacing): on this ring's large radius even
// a ~51deg step swings an item most of the way to the viewport edge, and any step
// whose max offset (x6) reaches or passes 180deg visually wraps to the opposite
// side -- exactly what put wave 7 on the left while wave 1 was still active. 20deg
// keeps every offset (max 120deg) unambiguously on its correct side and on-screen.
const ROTATION_BY_OFFSET = [
  "-rotate-120", // -6
  "-rotate-100", // -5
  "-rotate-80", // -4
  "-rotate-60", // -3
  "-rotate-40", // -2
  "-rotate-20", // -1
  "rotate-0", // 0 (active -- middle)
  "rotate-20", // +1
  "rotate-40", // +2
  "rotate-60", // +3
  "rotate-80", // +4
  "rotate-100", // +5
  "rotate-120", // +6
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

export default function MintRing({ children }: { children: React.ReactNode }) {
  // 7-wave model: the old 4-stage whitelist/public/phase2/sold-out ring math doesn't map to
  // discrete waves, so this shows a simple current-wave status card instead of a progress ring.
  const { authenticated } = usePrivy();
  const contract = useBreathContract();

  if (
    authenticated &&
    (contract.waves.isLoading || contract.activeWave.isLoading)
  ) {
    return <></>;
  }

  const waveList = [...contract.waves.state].sort(
    (a, b) => a.waveNum - b.waveNum,
  );
  // Falls back to wave 1 as the pivot when no wave is active (e.g. mint not open
  // yet) so the ring still has a defined layout instead of every offset being NaN.
  const pivot = contract.activeWave.state ?? 1;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-[850px] md:-bottom-[930px] w-[1200px] h-[1200px] scale-75 md:scale-100 flex items-center justify-center tk-hoss-round-wide">
      <div className="relative rounded-full bg-black/50 w-full h-full flex items-center justify-center">
        {/* Ring Items -- one per wave, positioned relative to the active wave */}
        {waveList.map((w) => {
          const isActive = w.waveNum === pivot;
          return (
            <RingItem
              key={w.waveNum}
              title={`Wave ${w.waveNum}`}
              secondaryValue={`${w.soldCount.toString()} / ${w.qty.toString()}`}
              className={cn(
                ROTATION_BY_OFFSET[w.waveNum - pivot + 6],
                isActive
                  ? "opacity-100 font-extrabold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  : "opacity-45 font-medium",
              )}
              inline
            />
          );
        })}

        {/* Inner Circle */}
        <div className="rounded-full w-[1100px] h-[1100px] border-3 border-white flex items-center justify-center">
          <div className="rounded-full w-[1000px] h-[1000px] bg-black/20 border border-white/20 relative">
            <div className="rounded-full absolute top-0 left-0 w-full h-full justify-center flex flex-row mt-9 text-sm">
              {/* 3x2 grid, height is fit-content */}
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
