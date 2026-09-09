import type { Metadata } from "next";
import { Figtree } from "next/font/google";
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
      <body className={`${figtree.variable} antialiased bg-secondary`}>
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
