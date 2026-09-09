"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import ScrollTransformContainer from "./ScrollTransformContainer";

const bearImages = [
  {
    url: "/assets/animated-bear-1.webp",
    playTime: 4200,
  },
  {
    url: "/assets/animated-bear-2.webp",
    playTime: 4200,
  },
  {
    url: "/assets/animated-bear-3.webp",
    playTime: 4500,
  },
  {
    url: "/assets/animated-bear-4.webp",
    playTime: 5000,
  },
];

export default function RandomBear() {
  const waitTime = 5000;
  const [key, setKey] = useState(0);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [direction2, setDirection2] = useState<"top" | "bottom">("top");
  const [bearImage, setBearImage] = useState<string>("");
  const [isHideBear, setIsHideBear] = useState(true);

  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bearRef = useRef<HTMLImageElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastIsIntersectingRef = useRef<boolean>(false);

  const imageRefForObserver = (ref: HTMLImageElement) => {
    if (observer.current) {
      observer.current.disconnect();
    }

    bearRef.current = ref;

    if (!ref) {
      return;
    }
    observer.current?.observe(ref);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (
          lastIsIntersectingRef.current !== entry.isIntersecting &&
          entry.isIntersecting
        ) {
          if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
          }

          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }

          showTimeoutRef.current = null;
          hideTimeoutRef.current = null;
          hideBear();

          scheduleBear(0);
        }
        lastIsIntersectingRef.current = entry.isIntersecting;
      });
    });

    return () => {
      observer.current?.disconnect();
    };
  }, []);

  const showAndPlayVideo = useCallback((bearImage: string) => {
    setKey((key) => key + 1);
    setPosition(Math.random() * 50);
    setDirection(Math.random() > 0.5 ? "left" : "right");
    setDirection2(Math.random() > 0.5 ? "top" : "bottom");
    setBearImage(bearImage);
    setIsHideBear(false);
  }, []);

  const hideBear = useCallback(() => {
    setIsHideBear(true);
  }, []);

  const scheduleBear = useCallback(
    (waitTimeOverride?: number) => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      const randomBear =
        bearImages[Math.floor(Math.random() * bearImages.length)];

      if (!randomBear) {
        return;
      }

      preload(randomBear.url, { as: "image" });

      showTimeoutRef.current = setTimeout(() => {
        showAndPlayVideo(randomBear.url);

        hideTimeoutRef.current = setTimeout(() => {
          hideBear();
          scheduleBear();
        }, randomBear.playTime);
      }, waitTimeOverride ?? waitTime);
    },
    [hideBear, showAndPlayVideo],
  );

  useEffect(() => {
    scheduleBear();
  }, [scheduleBear]);

  return (
    <ScrollTransformContainer
      id="random-bear"
      className="fixed inset-0 z-23 pointer-events-none w-full"
    >
      {!isHideBear && (
        <Image
          ref={imageRefForObserver}
          alt=""
          width={200}
          height={400}
          key={key}
          style={{
            bottom: direction2 === "bottom" ? `${position}%` : undefined,
            top: direction2 === "top" ? `${position}%` : undefined,
            left: direction === "left" ? `0` : undefined,
            right: direction === "right" ? `0` : undefined,
            transform: direction === "right" ? "scaleX(-1)" : "scaleX(1)",
          }}
          className={cn(
            "w-[110px] md:w-[160px] absolute",
          )}
          unoptimized={true}
          src={bearImage}
        ></Image>
      )}
    </ScrollTransformContainer>
  );
}
