"use client";
import { useMintFlow } from "@/provider/mint-flow-handler";
import { BearthButton } from "../bearth/BearthButton";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintButton() {
  const contract = useBreathContract();
  const { setTxHash, setFailureReason } = useMintFlow();

  const disabled =
    !contract.isRegistered.state ||
    contract.activeWave.state === null ||
    contract.limit.state <= 0n ||
    (contract.activeWave.state === 1 && !contract.isWhitelisted.state);

  return (
    <div>
      <BearthButton
        disabled={disabled}
        onClick={async () => {
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
          }
        }}
        className="h-[35px]"
        type="secondary"
      >
        Mint
      </BearthButton>
    </div>
  );
}
