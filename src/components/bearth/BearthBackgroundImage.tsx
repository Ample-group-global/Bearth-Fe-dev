"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function BearthBackgroundImage({
  src,
  absolute = false,
  containerClassName,
  imageClassName,
  unoptimized,
  showGradient = true,
  videoLoop = true,
  videoOptions = {},
}: {
  src: string;
  absolute?: boolean;
  containerClassName?: string;
  imageClassName?: string;
  unoptimized?: boolean;
  showGradient?: boolean;
  videoLoop?: boolean;
  videoOptions?: React.VideoHTMLAttributes<HTMLVideoElement>;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "inset-0 -z-1 flex flex-col items-center justify-center",
        absolute ? "absolute w-full h-full" : "fixed w-dvw h-dvh",
        containerClassName,
      )}
    >
      {showGradient && (
        <div className="absolute z-1 w-full xl:w-auto h-full xl:aspect-video">
          <div className="hidden xl:block absolute -left-px top-0 h-full w-[150px] bg-linear-to-r from-secondary to-secondary/0"></div>
          <div className="hidden xl:block absolute -right-px top-0 h-full w-[150px] bg-linear-to-l from-secondary to-secondary/0"></div>
        </div>
      )}
      {/* gradient from left to right, from black to transparent */}
      <div className="w-full xl:w-auto h-full xl:aspect-video relative">
        {src.endsWith(".webm") || src.endsWith(".mp4") ? (
          <video
            autoPlay
            src={src}
            preload="auto"
            muted
            loop={videoLoop}
            playsInline
            className={cn("object-cover w-full h-full", imageClassName)}
            {...videoOptions}
          />
        ) : (
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            className={cn("object-cover", imageClassName)}
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            unoptimized={unoptimized}
          />
        )}
      </div>
    </div>
  );
}
