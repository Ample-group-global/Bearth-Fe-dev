"use client";

import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { BearthSideMenuLink } from "./BearthSideMenu";

export function ConnectWalletBearthSideMenuLink() {
  const { login, logout, authenticated, privyReady } = useWalletConnect();

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

  return (
    <BearthSideMenuLink
      href="#"
      onClick={async () => (authenticated ? await logout() : login())}
    >
      {authenticated ? "DISCONNECT" : "CONNECT"}
    </BearthSideMenuLink>
  );
}
