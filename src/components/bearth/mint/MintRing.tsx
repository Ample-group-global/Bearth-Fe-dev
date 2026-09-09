"use client";

import { useRef, useState } from "react";
import { useBreathContract } from "@/components/wallet/BreathContractContext";
import { cn } from "@/lib/utils";

export function RingContainer({
  children,
  className,
  style,
  onClick,
  suppressTransition,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // While actively dragging, the rotation needs to track the pointer
  // 1:1 with no lag -- the 700ms ease-out transition (still used for the
  // click-to-jump/snap-on-release cases) would fight a live drag otherwise.
  suppressTransition?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute w-full h-full ease-out",
        suppressTransition ? "duration-0" : "transition-transform duration-700",
        className,
      )}
      style={style}
    >
      {/* onClick/role/tabIndex live here, on the small visible label block,
          NOT on the full w-full/h-full wrapper above (that wrapper is sized
          to the whole ring purely so this label has a full-size parent to
          rotate around the center -- attaching the click target to it made
          the entire rotated 1200x1200 square clickable, not just the label
          the customer actually sees). */}
      <div
        className={cn(
          "text-xs absolute h-[100px] top-0 left-1/2 -translate-x-1/2 text-white flex flex-col items-center justify-center",
          onClick && "cursor-pointer",
        )}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

export function RingItem({
  title,
  value,
  className,
  style,
  inline,
  secondaryValue,
  onClick,
  suppressTransition,
}: {
  title?: string;
  value?: number | string;
  className?: string;
  style?: React.CSSProperties;
  // Renders value beside title on one line instead of stacked below the
  // dot separator -- used for the Wave/Free item per explicit design request.
  inline?: boolean;
  // Fills the space freed up by `inline` (previously the stacked value slot)
  // with a second stat below the dot separator -- e.g. mint progress.
  secondaryValue?: number | string;
  // Lets a customer click any wave label to manually rotate the ring and
  // center it, browsing all 7 waves instead of only whichever ones happen
  // to sit near the auto-computed pivot.
  onClick?: () => void;
  suppressTransition?: boolean;
}) {
  if (inline) {
    return (
      <RingContainer
        className={cn("font-semibold", className)}
        style={style}
        onClick={onClick}
        suppressTransition={suppressTransition}
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span>{value ?? " "}</span>
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
    <RingContainer
      className={cn("font-semibold", className)}
      style={style}
      onClick={onClick}
      suppressTransition={suppressTransition}
    >
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

// Position of each wave is relative to the pivot wave, not a fixed anchor: the
// pivot sits at 0deg (top/middle), earlier waves rotate anticlockwise to the
// left (negative), later waves sit clockwise to the right (positive).
//
// 20deg/step (not the ring's full 360/7 spacing): on this ring's large radius even
// a ~51deg step swings an item most of the way to the viewport edge, and any step
// whose max offset (x6) reaches or passes 180deg visually wraps to the opposite
// side -- exactly what put wave 7 on the left while wave 1 was still active. 20deg
// keeps every offset (max 120deg) unambiguously on its correct side and on-screen.
const DEGREES_PER_STEP = 20;

// Roughly how many horizontal pixels of drag correspond to one 20deg step --
// tuned for a natural-feeling "grab and spin the wheel" drag, not derived from
// the ring's actual on-screen radius (which changes with the scale-75/100
// responsive breakpoint). Adjust this single constant if the drag ever feels
// too twitchy or too heavy.
const PIXELS_PER_STEP = 90;

// Ignore pointer movement below this threshold so a plain click (via
// RingItem's onClick) still works for jumping straight to a wave -- without
// this, any drag at all, even a few px of natural hand tremor during a click,
// would suppress the click.
const DRAG_THRESHOLD_PX = 6;

export function RingLine({ className }: { className?: string }) {
  return (
    <RingContainer className={className}>
      <div className="relative flex h-[24px] my-1">
        <div className="absolute z-0 h-[24px] left-1/2 -translate-x-1/2 top-0 w-[2px] bg-white"></div>
      </div>
    </RingContainer>
  );
}

// Fixed 7-wave collection (see DEGREES_PER_STEP's own comment) -- used only
// to size the loading skeleton below, not to assume real wave data.
const SKELETON_WAVE_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

export default function MintRing({ children }: { children: React.ReactNode }) {
  // 7-wave model: the old 4-stage whitelist/public/phase2/sold-out ring math doesn't map to
  // discrete waves, so this shows a simple current-wave status card instead of a progress ring.
  const contract = useBreathContract();

  // waves.state defaults to [] before its SWR fetch resolves -- previously
  // this rendered zero ring items with no loading indication, so every page
  // refresh showed the wave labels vanish for ~300-500ms then pop back in.
  const isLoadingWaves = contract.waves.isLoading || contract.activeWave.isLoading;

  const waveList = [...contract.waves.state].sort(
    (a, b) => a.waveNum - b.waveNum,
  );
  // pivotWave/setPivotWave live in BreathContractContext (not local state
  // here) so a click or drag updates the SAME value the status box and price
  // fields read -- see BreathContractContext for why.
  const pivot = contract.pivotWave ?? 1;
  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));

  // Drag-to-rotate: dragOffsetDeg is a LIVE, continuous rotation added on top
  // of every item's discrete pivot-based angle while a drag is in progress,
  // so the ring visually tracks the pointer 1:1 instead of only jumping
  // between fixed 20deg steps. On release, it's converted back into a
  // discrete pivot change (however many 20deg steps were dragged through) and
  // reset to 0 -- the existing transition-transform then animates the final
  // snap smoothly.
  const [dragOffsetDeg, setDragOffsetDeg] = useState(0);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    isDragging: boolean;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { pointerId: e.pointerId, startX: e.clientX, isDragging: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const deltaX = e.clientX - drag.startX;
    if (!drag.isDragging && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
    drag.isDragging = true;
    setDragOffsetDeg((deltaX / PIXELS_PER_STEP) * DEGREES_PER_STEP);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.isDragging && waveList.length > 0) {
      // Dragging right (positive deltaX/dragOffsetDeg) rotates every item
      // further clockwise -- which brings earlier, lower-numbered waves
      // (sitting at negative angles) toward center, hence the negation here.
      const steps = Math.round(dragOffsetDeg / DEGREES_PER_STEP);
      const minWave = waveList[0].waveNum;
      const maxWave = waveList[waveList.length - 1].waveNum;
      const nextPivot = Math.min(maxWave, Math.max(minWave, pivot - steps));
      contract.setPivotWave(nextPivot);
    }
    setDragOffsetDeg(0);
    dragState.current = null;
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 -bottom-[850px] md:-bottom-[930px] w-[1200px] h-[1200px] scale-75 md:scale-100 flex items-center justify-center tk-hoss-round-wide touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="relative rounded-full bg-black/50 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
        {/* Ring Items -- one per wave, positioned relative to the pivot wave */}
        {isLoadingWaves
          ? SKELETON_WAVE_NUMBERS.map((waveNum) => (
              <RingContainer
                key={waveNum}
                className="font-semibold"
                style={{ transform: `rotate(${(waveNum - 1) * DEGREES_PER_STEP}deg)` }}
              >
                <div className="h-[14px] w-[70px] animate-pulse rounded bg-white/20" />
              </RingContainer>
            ))
          : waveList.map((w) => {
              // Deliberately NOT `w.waveNum === pivot` -- pivot only controls
              // ring position now (see above), so the centered wave doesn't
              // fall back to "no wave is active" (bright/highlighted styling
              // is what tells the customer a wave can actually be minted right
              // now; Wave 2 sitting in the center slot before it opens should
              // still read as muted/disabled, not falsely active).
              const isActive = w.waveNum === contract.activeWave.state;
              // Time-based, not just w.closed -- a wave that ran out its
              // scheduled window (like Wave 1) reads as "done" here even
              // though the separate manual waveClosed flag is still false,
              // matching the same time-aware logic used for pivotWave.
              const isDone =
                !isActive &&
                (w.closed || (w.endTime > 0n && w.endTime <= nowSeconds));
              return (
                <RingItem
                  key={w.waveNum}
                  title={`Wave ${w.waveNum}`}
                  secondaryValue={`${w.soldCount.toString()} / ${w.qty.toString()}`}
                  style={{
                    transform: `rotate(${(w.waveNum - pivot) * DEGREES_PER_STEP + dragOffsetDeg}deg)`,
                  }}
                  suppressTransition={dragState.current?.isDragging}
                  className={cn(
                    isActive &&
                      "text-primary opacity-100 font-extrabold drop-shadow-[0_0_10px_rgba(65,175,235,0.7)]",
                    // text-gray-400 -- the same color MintForm's STATUS text
                    // already uses for "MINT CLOSED" elsewhere on this page,
                    // reused here rather than a varying-opacity white so
                    // closed/upcoming/live genuinely read as three different
                    // colors, not three shades of the same white.
                    isDone && "text-gray-400 font-medium",
                    !isActive && !isDone && "text-white font-semibold",
                  )}
                  inline
                  onClick={() => contract.setPivotWave(w.waveNum)}
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
