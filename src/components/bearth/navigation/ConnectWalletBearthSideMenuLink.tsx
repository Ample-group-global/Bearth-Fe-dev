"use client";

import { ArrowLeftRightIcon, LogOutIcon } from "lucide-react";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { cn } from "@/lib/utils";
import { BearthSideMenuLink } from "./BearthSideMenu";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWalletBearthSideMenuLink() {
  const {
    login,
    logout,
    authenticated,
    privyReady,
    wallet,
    switchWallet,
    isSwitchingWallet,
  } = useWalletConnect();

  // Same fix as ConnectWalletTopBarButton -- avoid flashing "CONNECT" during
  // the brief window before Privy finishes rehydrating the session on load.
  // A visible pulsing skeleton (not a blank/nbsp placeholder) signals
  // "loading" instead of reading as the link vanishing.
  if (!privyReady) {
    return (
      <BearthSideMenuLink href="#">
        <span
          aria-hidden
          className="inline-block h-[1em] w-24 animate-pulse rounded bg-black/10"
        />
      </BearthSideMenuLink>
    );
  }

  if (authenticated && wallet) {
    return (
      <div className="leading-[50px] w-full after:content-[''] after:block after:h-px after:w-full after:bg-black/10">
        <div className="flex items-center justify-between">
          <span className="font-mono text-base normal-case text-black/70">
            {truncateAddress(wallet.address)}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchWallet()}
              disabled={isSwitchingWallet}
              className="flex items-center gap-1 text-black/70 disabled:opacity-50"
            >
              <ArrowLeftRightIcon
                className={cn("size-4", isSwitchingWallet && "animate-spin")}
              />
              SWITCH
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1 text-red-600"
            >
              <LogOutIcon className="size-4" />
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BearthSideMenuLink href="#" onClick={() => login()}>
      CONNECT
    </BearthSideMenuLink>
  );
}
