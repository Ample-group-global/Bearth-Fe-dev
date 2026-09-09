"use client";
import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import type { OGVPlayer } from "ogv";

export interface VideoStep {
  src: string;
  loop?: boolean;
}

export interface MintAnimationCanvasHandle {
  /** Advance to the next video step. If the current step is looping, it finishes the current loop iteration first. */
  next: () => void;
}

interface MintAnimationCanvasProps {
  steps: VideoStep[];
  containerClassName?: string;
  /** Called when the final step finishes playing (non-looping) or when next() is called on the last step. */
  onFinished?: () => void;
  /** Called whenever a step completes and transitions to the next one, with the index of the step that just finished. */
  onStepEnd?: (stepIndex: number) => void;
}

interface PlayerSlot {
  player: OGVPlayer;
  element: HTMLDivElement;
}

function createPlayerSlot(
  OGVPlayerCtor: typeof OGVPlayer,
  hidden: boolean,
): PlayerSlot {
  const player = new OGVPlayerCtor();
  player.width = 2880;
  player.height = 2048;
  player.muted = true;

  const element = player as unknown as HTMLDivElement;
  element.className = "w-full xl:w-auto h-full xl:aspect-video relative";
  element.style.width = "";
  element.style.height = "";
  if (hidden) {
    element.style.visibility = "hidden";
    element.style.position = "absolute";
  }

  const canvas = element.getElementsByTagName("canvas").item(0);
  if (canvas) {
    canvas.style.objectFit = "cover";
  }

  return { player, element };
}

export const MintAnimationCanvas = forwardRef<
  MintAnimationCanvasHandle,
  MintAnimationCanvasProps
>(function MintAnimationCanvas(
  { steps, containerClassName, onFinished, onStepEnd },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeSlotRef = useRef<PlayerSlot | null>(null);
  const standbySlotRef = useRef<PlayerSlot | null>(null);
  const currentStepRef = useRef(0);
  const pendingNextRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const onStepEndRef = useRef(onStepEnd);
  onStepEndRef.current = onStepEnd;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const preloadStandby = useCallback((stepIndex: number) => {
    const step = stepsRef.current[stepIndex];
    const standby = standbySlotRef.current;
    if (!step || !standby) return;
    standby.player.src = step.src;
    // OGV will load metadata + first frame when src is set
  }, []);

  const swapToStandby = useCallback(() => {
    const active = activeSlotRef.current;
    const standby = standbySlotRef.current;
    if (!active || !standby) return;

    // Hide old active, show standby
    active.element.style.visibility = "hidden";
    active.element.style.position = "absolute";
    standby.element.style.visibility = "";
    standby.element.style.position = "";

    // Swap refs
    activeSlotRef.current = standby;
    standbySlotRef.current = active;

    // Start playback on the now-active player
    standby.player.play();
  }, []);

  const advanceToNext = useCallback(
    (finishedIndex: number) => {
      onStepEndRef.current?.(finishedIndex);
      const nextIndex = finishedIndex + 1;
      if (nextIndex < stepsRef.current.length) {
        currentStepRef.current = nextIndex;
        pendingNextRef.current = false;
        swapToStandby();

        // Preload the step after the one we just started
        const preloadIndex = nextIndex + 1;
        if (preloadIndex < stepsRef.current.length) {
          preloadStandby(preloadIndex);
        }
      } else {
        onFinishedRef.current?.();
      }
    },
    [swapToStandby, preloadStandby],
  );

  useImperativeHandle(
    ref,
    () => ({
      next: () => {
        pendingNextRef.current = true;
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    import("ogv").then(({ OGVPlayer, OGVLoader }) => {
      if (cancelled) return;

      OGVLoader.base = "/ogv";

      const active = createPlayerSlot(OGVPlayer, false);
      const standby = createPlayerSlot(OGVPlayer, true);
      activeSlotRef.current = active;
      standbySlotRef.current = standby;

      if (containerRef.current) {
        containerRef.current.appendChild(active.element);
        containerRef.current.appendChild(standby.element);
      }

      const handleEnded = (slot: PlayerSlot) => {
        // Only handle events from the currently active player
        if (slot !== activeSlotRef.current) return;

        const idx = currentStepRef.current;
        const step = stepsRef.current[idx];
        if (!step) return;

        if (step.loop && !pendingNextRef.current) {
          slot.player.currentTime = 0;
          slot.player.play();
        } else {
          advanceToNext(idx);
        }
      };

      active.player.addEventListener("ended", () => handleEnded(active));
      standby.player.addEventListener("ended", () => handleEnded(standby));

      // Start playing step 0
      const firstStep = stepsRef.current[0];
      if (firstStep) {
        currentStepRef.current = 0;
        active.player.src = firstStep.src;
        active.player.play();

        // Preload step 1 on standby
        if (stepsRef.current.length > 1) {
          preloadStandby(1);
        }
      }
    });

    return () => {
      cancelled = true;
      for (const slotRef of [activeSlotRef, standbySlotRef]) {
        const slot = slotRef.current;
        if (slot) {
          slot.player.pause();
          if (containerRef.current) {
            containerRef.current.removeChild(slot.element);
          }
        }
      }
      activeSlotRef.current = null;
      standbySlotRef.current = null;
    };
  }, [advanceToNext, preloadStandby]);

  return (
    <div
      className={cn(
        "inset-0 -z-1 flex flex-col items-center justify-center fixed w-dvw h-dvh",
        containerClassName,
      )}
      ref={containerRef}
    >
      <div className="absolute z-1 w-full xl:w-auto h-full xl:aspect-video">
        <div className="hidden xl:block absolute -left-px top-0 h-full w-[150px] bg-linear-to-r from-secondary to-secondary/0"></div>
        <div className="hidden xl:block absolute -right-px top-0 h-full w-[150px] bg-linear-to-l from-secondary to-secondary/0"></div>
      </div>
    </div>
  );
});
