"use client";

import { BearthButton } from "../BearthButton";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";

export function WalletConnectControl({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login, authenticated, wallet, walletsReady, linkWallet } =
    useWalletConnect();

  if (authenticated && !walletsReady) {
    // Authenticated, but Privy's wallet list hasn't resolved yet -- showing
    // "Connect Wallet" here would be misleading (the user IS connected) and
    // clicking it just reopens the login modal for no reason.
    return <BearthButton href="#" type="secondary">Loading wallet...</BearthButton>;
  }

  if (authenticated && !wallet) {
    // Real session, but no wallet attached (e.g. an email-only login) --
    // login() is a Privy no-op here ("already logged in, use a `link` helper
    // instead"), which previously left this exact case stuck on a button
    // that did nothing when clicked. linkWallet() is Privy's actual helper
    // for attaching a wallet to an existing session.
    return (
      <BearthButton
        href="#"
        type="secondary"
        onClick={() => linkWallet()}
        data-testid="ring-connect-wallet-button"
      >
        Connect Wallet
      </BearthButton>
    );
  }

  if (!authenticated) {
    return (
      <BearthButton
        href="#"
        type="secondary"
        onClick={() => login()}
        data-testid="ring-connect-wallet-button"
      >
        Connect Wallet
      </BearthButton>
    );
  }

  return <>{children}</>;
}
