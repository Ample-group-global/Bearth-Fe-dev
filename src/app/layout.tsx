import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import "./font.css";
import "./globals.css";
import { BreathLiquidGlassBase } from "@/components/bearth/navigation/BearthLiquidGlassEffect";
import { GoogleTagManager } from "@next/third-parties/google";
import BearthTopBar from "@/components/bearth/navigation/BearthTopBar";
import { ServerProvider } from "@/provider/server-provider";
import { notFound } from "next/navigation";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

// hoss-round is the site's global body font (see globals.css) -- previously
// loaded via plain @font-face in font.css, which the browser only discovers
// once it parses that stylesheet, with no preload hint and no fallback-font
// metric matching. That meant EVERY page (not just headings) painted with a
// bold system-font fallback first, then visibly swapped to the real font a
// few hundred ms later -- the "loading effect" this fixes. next/font/local
// auto-preloads the files and size-matches the fallback, eliminating the
// visible swap instead of just hiding it.
const hossRound = localFont({
  src: [
    { path: "../../public/fonts/hoss-round/normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/hoss-round/normal-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/hoss-round/normal-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/hoss-round/normal-900.woff2", weight: "900", style: "normal" },
    { path: "../../public/fonts/hoss-round/italic-400.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/hoss-round/italic-700.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-hoss-round",
  display: "swap",
});

const hossRoundWide = localFont({
  src: [
    { path: "../../public/fonts/hoss-round-wide/normal-300.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/hoss-round-wide/normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/hoss-round-wide/normal-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-hoss-round-wide",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BEARTH | Your perfect nap spot is waiting.",
  description:
    "Bearth is an original IP, a universe born from a story of loss and rebirth. We are building a transmedia world that grows and evolves with its community.",
  keywords: [
    "Bearth",
    "Web3",
    "Brand",
    "IP",
    "Community",
    "Merchandise",
    "Toys",
    "Digital Collectibles",
    "Healing",
    "Metaverse",
  ],
  authors: [{ name: "Bearth Lab" }],
  icons: {
    apple: "/assets/apple-touch-icon.png",
  },
  openGraph: {
    title: "BEARTH | Your perfect nap spot is waiting.",
    description:
      "Bearth is an original IP, a universe born from a story of loss and rebirth. We are building a transmedia world that grows and evolves with its community.",
    images: "/assets/og-image.png",
    type: "website",
  },
  twitter: {
    title: "BEARTH | Your perfect nap spot is waiting.",
    description:
      "Bearth is an original IP, a universe born from a story of loss and rebirth. We are building a transmedia world that grows and evolves with its community.",
    images: "/assets/og-image.png",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!process.env.NEXT_PUBLIC_CONTRACT_NET) {
    return notFound();
  }

  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${figtree.variable} ${hossRound.variable} ${hossRoundWide.variable} antialiased bg-secondary`}
      >
        <ServerProvider>
          {/* Top Navigation */}
          <BearthTopBar />
          {children}
          <BreathLiquidGlassBase />
        </ServerProvider>
      </body>
    </html>
  );
}
