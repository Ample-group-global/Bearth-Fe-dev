"use client";

import { createElement } from "react";
import { useWalletConnect } from "./WalletConnectContext";

interface WalletBalanceProps {
  as?: string;
  className?: string;
}

export function WalletBalance({ as = "div", className }: WalletBalanceProps) {
  const { balance } = useWalletConnect();
  // balance is formatEther()'s full-precision string (e.g. "0.0586084969...")
  // -- round to 4 decimals for display, the standard wallet-UI convention.
  const display = balance != null ? Number(balance).toFixed(4) : "0.0000";
  return createElement(as, { className }, display);
}
