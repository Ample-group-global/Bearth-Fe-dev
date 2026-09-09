"use client";

import { BearthButton } from "../BearthButton";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";

export function WalletConnectControl({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login, authenticated, wallet, walletsReady } = useWalletConnect();

  if (authenticated && !walletsReady) {
    // Authenticated, but Privy's wallet list hasn't resolved yet -- showing
    // "Connect Wallet" here would be misleading (the user IS connected) and
    // clicking it just reopens the login modal for no reason.
    return <BearthButton href="#" type="secondary">Loading wallet...</BearthButton>;
  }

  if (!wallet || !authenticated) {
    return (
      <BearthButton href="#" type="secondary" onClick={() => login()}>
        Connect Wallet
      </BearthButton>
    );
  }

  return <>{children}</>;
}
