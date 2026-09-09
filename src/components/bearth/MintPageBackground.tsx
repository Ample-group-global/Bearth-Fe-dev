"use client";

import BearthBackgroundImage from "@/components/bearth/BearthBackgroundImage";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";

export default function MintPageBackground() {
  const walletConnect = useWalletConnect();
  if (walletConnect.wallet) {
    return <BearthBackgroundImage src="/assets/mint-setup.webp" />;
  } else {
    return <BearthBackgroundImage src="/assets/mint-connect-bg.webp" />;
  }
}
