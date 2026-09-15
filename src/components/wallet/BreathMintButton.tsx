"use client";
import { useState } from "react";
import { useMintFlow } from "@/provider/mint-flow-handler";
import { BearthButton } from "../bearth/BearthButton";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintButton() {
  const contract = useBreathContract();
  const { setTxHash, setFailureReason } = useMintFlow();
  const [isPending, setIsPending] = useState(false);

  const disabled =
    isPending ||
    !contract.isRegistered.state ||
    contract.activeWave.state === null ||
    contract.limit.state <= 0n ||
    (contract.activeWave.state === 1 && !contract.isWhitelisted.state);

  return (
    <div>
      <BearthButton
        disabled={disabled}
        onClick={async () => {
          setIsPending(true);
          try {
            const hash = await contract.mint();
            setTxHash(hash);
          } catch (e) {
            console.error("Minting failed:", e);
            if (
              e instanceof Error &&
              e.message.includes("User rejected the request")
            ) {
              return;
            }

            const reason =
              e instanceof Error
                ? ((e as { shortMessage?: string }).shortMessage ?? e.message)
                : "Unknown error";
            setFailureReason(reason);
            setTxHash("failed");
          } finally {
            setIsPending(false);
          }
        }}
        className="h-[35px]"
        type="secondary"
        data-testid="mint-button"
      >
        {isPending ? "Minting..." : "Mint"}
      </BearthButton>
    </div>
  );
}
