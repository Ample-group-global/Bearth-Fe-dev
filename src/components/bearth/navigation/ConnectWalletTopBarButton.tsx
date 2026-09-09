"use client";

import {
  ArrowLeftRightIcon,
  CheckIcon,
  CopyIcon,
  LogOutIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { BearthButton } from "@/components/bearth/BearthButton";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWalletTopBarButton() {
  const { login, logout, authenticated, privyReady, wallet, switchWallet } =
    useWalletConnect();
  const [copied, setCopied] = useState(false);

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

  if (authenticated && wallet) {
    return (
      <div className="hidden md:flex absolute right-2 items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          title="Copy wallet address"
          className="flex items-center gap-2 rounded-sm bg-white px-4 py-2 font-figtree text-sm uppercase text-black hover:bg-white/80"
        >
          <span className="size-2 rounded-full bg-emerald-500" />
          {truncateAddress(wallet.address)}
          {copied ? (
            <CheckIcon className="size-3.5 text-emerald-600" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => switchWallet()}
          title="Switch wallet"
          className="flex items-center justify-center rounded-sm bg-white p-2.5 text-black hover:bg-white/80"
        >
          <ArrowLeftRightIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => logout()}
          title="Logout"
          className="flex items-center justify-center rounded-sm bg-red-600 p-2.5 text-white hover:bg-red-700"
        >
          <LogOutIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex absolute right-2">
      <BearthButton type="secondary" onClick={() => login()}>
        <WalletIcon className="size-4" />
        CONNECT
      </BearthButton>
    </div>
  );
}
