"use client";
import { useState } from "react";
import { useMintFlow } from "@/provider/mint-flow-handler";
import { BearthButton } from "../bearth/BearthButton";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintButton() {
  const contract = useBreathContract();
  const { setTxHash, setFailureReason } = useMintFlow();
  // Previously the button gave zero feedback between click and the MetaMask
  // prompt appearing -- gas estimation alone can take a few seconds, so a
  // real in-flight mint looked identical to the click doing nothing at all,
  // making "is it stuck or just slow" impossible to tell from the UI.
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
            // In-context state swap (MintFlowProvider), not a route change --
            // a raw transaction hash in the address bar is confusing and
            // bookmarkable/shareable in a way that serves no purpose here.
            setTxHash(hash);
          } catch (e) {
            console.error("Minting failed:", e);
            if (
              e instanceof Error &&
              e.message.includes("User rejected the request")
            ) {
              return;
            }

            // viem decodes custom contract errors (e.g. AlreadyClaimed,
            // PurchaseLimitExceeded) into shortMessage when the ABI is known --
            // surfacing it means a failed mint actually explains why, instead of
            // always showing the same generic "please try again" regardless of
            // cause (insufficient funds, already claimed, limit exceeded, etc.
            // used to all look identical).
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
      >
        {isPending ? "Minting..." : "Mint"}
      </BearthButton>
    </div>
  );
}
