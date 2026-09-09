"use client";

import Image from "next/image";
import BearthBackgroundImage from "../BearthBackgroundImage";
import MaxWidthConstraintedLayout from "../MaxWidthConstraintedLayout";
import TypewriterEffect from "../TypewriterEffect";
import { useEffect, useRef } from "react";

export default function SectionTop() {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  function calculateScale() {
    let scale = 1;
    // check image scale (contain, 500*150) check both width and height
    if (imageRef.current) {
      const image = imageRef.current;
      const imageWidth = image.offsetWidth;
      const imageHeight = image.offsetHeight;

      const widthRatio = imageWidth / 500;
      const heightRatio = imageHeight / 150;
      scale = Math.min(widthRatio, heightRatio);
    }

    // set the scale size to text
    if (textRef.current) {
      const text = textRef.current;
      text.style.transform = `scale(${scale})`;
    }
  }

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    resizeObserverRef.current = new ResizeObserver(calculateScale);

    calculateScale();
    resizeObserverRef.current?.observe(document.body);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <MaxWidthConstraintedLayout
      as="section"
      outerDivClassName="relative z-21 bg-secondary"
      className="flex flex-col justify-between relative min-h-dvh py-16 md:py-24"
      slotOutside={
        <BearthBackgroundImage src="/assets/about-bg-top.webm" absolute />
      }
    >
      {/* Hero Section */}
      <div className="p-4 lg:p-12 flex flex-col grow items-center justify-center text-center">
        <div className="w-full flex flex-col grow justify-between max-h-[70dvh]">
          <div
            className="relative flex items-center justify-center h-[20dvh]"
            ref={imageRef}
          >
            <Image
              src="/assets/logo.svg"
              alt="Bearth Logo"
              unoptimized
              className="w-full h-full object-contain"
              fill
              sizes="100vw"
            />
          </div>

          <div ref={textRef}>
            <h2 className="text-white title-stroke2 title-strokecolor-primary text-[20px] font-semibold">
              BEARTH Is For Everyone
            </h2>
            <h2>
              <TypewriterEffect
                {...typewriterDefaultOptions}
                className="text-white title-stroke2 title-strokecolor-primary"
                font={{
                  fontFamily: "hoss-round",
                  fontSize: "20px",
                  fontWeight: "600",
                  lineHeight: "1",
                }}
                cursorMarginLeft={2}
              />
            </h2>
          </div>
        </div>
      </div>
    </MaxWidthConstraintedLayout>
  );
}

const typewriterDefaultOptions = {
  prefix: "Who ",
  className: "text-shadow-lg",
  words: [
    { word: "Has Lost Something Precious" },
    { word: "Believes In Second Chances" },
    { word: "Dreams Of A Gentler World" },
  ],
  typingSpeed: 65,
  deletingSpeed: 65,
  pauseDuration: 1000,
  cursorColor: "#FFFFFF",
  cursorWidth: 2,
  cursorHeight: 110,
};
