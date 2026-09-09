"use client";

interface ScrollSnapContainerProps {
  children: React.ReactNode;
  totalSections: number;
}

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ScrollSnapContainer({
  children,
  totalSections,
}: ScrollSnapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const isScrollingRef = useRef(false);
  const touchStartRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024 && window.innerHeight >= 700);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      // Find the nearest section based on current scroll position
      const scrollTop = container.scrollTop || window.scrollY;
      const sectionHeight = window.innerHeight;
      const nearestSection = Math.round(scrollTop / sectionHeight);
      const clampedSection = Math.max(
        0,
        Math.min(nearestSection, totalSections - 1),
      );

      setCurrentSection(clampedSection);

      // Snap to the nearest section
      const targetSection = container.children[clampedSection] as HTMLElement;
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "instant", block: "start" });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [totalSections]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isDesktop) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingRef.current) return;

      const threshold = 10;
      if (Math.abs(e.deltaY) < threshold) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + direction;

      if (nextSection >= 0 && nextSection < totalSections) {
        isScrollingRef.current = true;
        setCurrentSection(nextSection);

        const targetSection = container.children[nextSection] as HTMLElement;
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;

      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStartRef.current - touchEnd;
      const threshold = 100;

      if (Math.abs(diff) < threshold) return;

      const direction = diff > 0 ? 1 : -1;
      const nextSection = currentSection + direction;

      if (nextSection >= 0 && nextSection < totalSections) {
        isScrollingRef.current = true;
        setCurrentSection(nextSection);

        const targetSection = container.children[nextSection] as HTMLElement;
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection, isDesktop]);

  return (
    <div
      ref={containerRef}
      className={cn(
        `h-dvh no-scrollbar`,
        isDesktop ? "overflow-hidden" : "overflow-y-auto",
      )}
      id="scroll-snap-container"
    >
      {children}
    </div>
  );
}
