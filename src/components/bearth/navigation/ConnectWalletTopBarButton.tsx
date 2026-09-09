"use client";

import { WalletIcon } from "lucide-react";
import { BearthButton } from "@/components/bearth/BearthButton";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";

export function ConnectWalletTopBarButton() {
  const { login, logout, authenticated, privyReady } = useWalletConnect();

  // Same responsive footprint as before (desktop only -- mobile uses the
  // separate side-menu link). A fully invisible placeholder here read as the
  // button vanishing on refresh rather than loading -- a visible pulsing
  // skeleton, sized to match the real button, signals "loading" instead of
  // "missing" during the brief window before Privy rehydrates.
  if (!privyReady) {
    return (
      <div
        aria-hidden
        className="hidden md:flex absolute right-2 h-[42px] w-[160px] animate-pulse rounded-sm bg-white/20"
      />
    );
  }

  return (
    <div className="hidden md:flex absolute right-2">
      <BearthButton
        type="secondary"
        onClick={async () => (authenticated ? await logout() : login())}
      >
        <WalletIcon className="size-4" />
        {authenticated ? "DISCONNECT" : "CONNECT"}
      </BearthButton>
    </div>
  );
}
