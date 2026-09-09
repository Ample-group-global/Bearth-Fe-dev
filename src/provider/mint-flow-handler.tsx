"use client";
import { createContext, useContext, useState } from "react";

interface MintFlowContextType {
  setTxHash: (txHash: string) => void;
  txHash: string | null;
  // Set alongside setTxHash("failed") for a pre-flight failure (no transaction
  // ever broadcast) so the reason travels with the swap instead of a URL param.
  setFailureReason: (reason: string) => void;
  failureReason: string | null;
}

const MintFlowContext = createContext<MintFlowContextType>({
  setTxHash: () => {},
  txHash: null,
  setFailureReason: () => {},
  failureReason: null,
});

export function MintFlowProvider({
  mintPageSlot,
  mintingAnimationSlot,
}: {
  mintPageSlot: React.ReactNode;
  mintingAnimationSlot: React.ReactNode;
}) {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  return (
    <MintFlowContext.Provider
      value={{ txHash, setTxHash, failureReason, setFailureReason }}
    >
      {txHash ? mintingAnimationSlot : mintPageSlot}
    </MintFlowContext.Provider>
  );
}

export function useMintFlow() {
  return useContext(MintFlowContext);
}
