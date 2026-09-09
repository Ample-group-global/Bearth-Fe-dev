import Link from "next/link";
import Heading from "@/components/bearth/Heading";
import { cityPortals } from "./city-portals.config";

export default function CityFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 overflow-y-auto bg-secondary px-4 py-12 text-center text-white">
      <div className="space-y-2">
        <Heading
          type="h1"
          className="text-primary title-stroke title-strokecolor-white"
        >
          BEARTH CITY
        </Heading>
        <p className="max-w-md text-sm leading-relaxed text-secondary-foreground">
          Your browser can&apos;t render our 3D city yet, but you can still get
          where you&apos;re going.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        {cityPortals.map((portal) => {
          const Icon = portal.icon;
          const content = (
            <>
              <Icon className="size-6" style={{ color: portal.color }} />
              <span className="text-xs font-semibold uppercase leading-tight">
                {portal.label}
              </span>
              {portal.status !== "live" && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-secondary-foreground/60">
                  {portal.status === "coming-soon" ? "Coming Soon" : "Lore"}
                </span>
              )}
            </>
          );

          if (!portal.href) {
            return (
              <div
                key={portal.id}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-5 opacity-70"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={portal.id}
              href={portal.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-5 transition-colors hover:bg-white/10"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
