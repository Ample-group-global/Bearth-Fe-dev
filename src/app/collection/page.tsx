import MemoryHallGallery from "@/components/bearth/collection/MemoryHallGallery";
import Heading from "@/components/bearth/Heading";
import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";

// No custom background here on purpose: <body> already carries the site's
// standard navy (bg-secondary, see app/layout.tsx) which every other page
// (mint, about, mindmap) relies on for its own dark theme. An earlier
// version of this page overrode it with a light banner-to-pale-blue design,
// which read as visually disconnected from the rest of the site once
// compared side by side -- and needed a fragile full-bleed banner just to
// manage the color transition. Matching the site's existing background
// removes that whole problem: white NFT cards (already used below) provide
// all the contrast this page needs, exactly like every other white-card-on
// navy pattern already established elsewhere on the site.
export default function CollectionPage() {
  return (
    <MaxWidthConstraintedLayout as="main" fullHeight paddingHeader paddingFooter>
      {/* Extra clearance below the fixed nav, scoped to this header only --
          the base paddingHeader clearance (72px) alone was tight enough to
          visually collide with this page's large h1. Mobile only shows the
          hamburger icon (shorter than the full desktop pill nav), so needs
          less clearance. */}
      <header className="pt-20 sm:pt-24 md:pt-28">
        <Heading
          type="h1"
          className="text-primary title-stroke title-strokecolor-white"
        >
          MEMORY HALL
        </Heading>
        <p className="max-w-2xl text-sm leading-relaxed text-white/90">
          A living museum preserving every explorer&apos;s journey — this is
          your exclusive exhibition hall within Bearth City.
        </p>
      </header>

      <MemoryHallGallery />
    </MaxWidthConstraintedLayout>
  );
}
