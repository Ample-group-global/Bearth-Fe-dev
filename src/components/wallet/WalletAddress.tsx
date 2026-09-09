"use client";

import { createElement } from "react";
import { useWalletConnect } from "./WalletConnectContext";

interface WalletAddressProps {
  as?: string;
  className?: string;
}

export function WalletAddress({ as = "div", className }: WalletAddressProps) {
  const { wallet } = useWalletConnect();
  return createElement(as, { className }, wallet?.address);
}
