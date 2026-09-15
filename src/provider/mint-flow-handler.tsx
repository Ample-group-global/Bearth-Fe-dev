"use client";
import { createContext, useContext, useState } from "react";

const STORAGE_KEY_TX = "bearth:mint-tx-hash";
const STORAGE_KEY_REASON = "bearth:mint-failure-reason";

function readStoredTxHash(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY_TX);
}

function readStoredFailureReason(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY_REASON);
}

interface MintFlowContextType {
  setTxHash: (txHash: string) => void;
  txHash: string | null;
  setFailureReason: (reason: string) => void;
  failureReason: string | null;
  clearMintFlow: () => void;
}

const MintFlowContext = createContext<MintFlowContextType>({
  setTxHash: () => {},
  txHash: null,
  setFailureReason: () => {},
  failureReason: null,
  clearMintFlow: () => {},
});

export function MintFlowProvider({
  mintPageSlot,
  mintingAnimationSlot,
}: {
  mintPageSlot: React.ReactNode;
  mintingAnimationSlot: React.ReactNode;
}) {
  const [txHash, setTxHashState] = useState<string | null>(readStoredTxHash);
  const [failureReason, setFailureReasonState] = useState<string | null>(
    readStoredFailureReason,
  );

  const setTxHash = (hash: string) => {
    window.sessionStorage.setItem(STORAGE_KEY_TX, hash);
    setTxHashState(hash);
  };

  const setFailureReason = (reason: string) => {
    window.sessionStorage.setItem(STORAGE_KEY_REASON, reason);
    setFailureReasonState(reason);
  };

  const clearMintFlow = () => {
    window.sessionStorage.removeItem(STORAGE_KEY_TX);
    window.sessionStorage.removeItem(STORAGE_KEY_REASON);
    setTxHashState(null);
    setFailureReasonState(null);
  };

  return (
    <MintFlowContext.Provider
      value={{ txHash, setTxHash, failureReason, setFailureReason, clearMintFlow }}
    >
      {txHash ? mintingAnimationSlot : mintPageSlot}
    </MintFlowContext.Provider>
  );
}

export function useMintFlow() {
  return useContext(MintFlowContext);
}
