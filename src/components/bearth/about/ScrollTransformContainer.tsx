"use client";
import { useRef } from "react";
import { useScroll } from "motion/react";
export default function ScrollTransformContainer({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  scrollY.on("change", (scrollY: number) => {
    if (divRef.current) {
      divRef.current.style.transform = `translateY(max(calc(100dvh - ${scrollY}px), 0px))`;
    }
  });

  return (
    <div
      {...props}
      ref={divRef}
      style={{
        transform: `translateY(100dvh)`,
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}
