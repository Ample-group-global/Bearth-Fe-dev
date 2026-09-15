"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, type Hex, http } from "viem";
import { useSWRConfig } from "swr";
import { BearthButton } from "@/components/bearth/BearthButton";
import MaxWidthConstraintedLayout from "@/components/bearth/MaxWidthConstraintedLayout";
import {
  MintAnimationCanvas,
  type MintAnimationCanvasHandle,
} from "@/components/bearth/mint/MintAnimationCanvas";
import { chainOptions } from "@/components/wallet/chains";
import { useWalletConnect } from "@/components/wallet/WalletConnectContext";
import { useMintFlow } from "@/provider/mint-flow-handler";

enum VideoState {
  Init = "init",
  InProgressLoop = "in_progress_loop",
  Completed = "completed",
  CompletedResult = "completed_result",
  Failed = "failed",
}

function MintResultOverlay({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="absolute w-full h-full inset-0"
      style={{
        backgroundColor: "#40444A",
        backgroundImage: "url(/assets/star.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0,
        animation: "fadeIn 1s ease-in 1s forwards",
      }}
    >
      {children}
    </div>
  );
}

export function MintingAnimation({
  txHash,
  failureReason,
}: {
  txHash: string;
  failureReason?: string;
}) {
  const chainOption =
    chainOptions[process.env.NEXT_PUBLIC_CONTRACT_NET as "mainnet" | "sepolia"];

  const { chain, wallet } = useWalletConnect();
  const { mutate } = useSWRConfig();
  const { clearMintFlow } = useMintFlow();
  const router = useRouter();
  const [tokenId, setTokenId] = useState<[string, string] | null>(null);

  const [videoState, setVideoState] = useState<VideoState>(VideoState.Init);
  const [receiptStatus, setReceiptStatus] = useState<
    "success" | "reverted" | "timeout" | "failed" | null
  >(null);
  const [canComplete, setCanComplete] = useState(false);
  const [revertReason, setRevertReason] = useState<string | null>(null);
  const receiptLoadedRef = useRef(false);
  const canvasRef = useRef<MintAnimationCanvasHandle>(null);

  const publicClient = useMemo(
    () =>
      chain
        ? createPublicClient({
            chain,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
          })
        : null,
    [chain],
  );

  useEffect(() => {
    if (!publicClient || !txHash || receiptLoadedRef.current) return;
    receiptLoadedRef.current = true;

    setTimeout(() => {
      setCanComplete(true);
    }, 5000);

    if (!txHash || txHash === "failed") {
      setReceiptStatus("failed");
      return;
    }

    publicClient
      .waitForTransactionReceipt({
        hash: txHash as Hex,
        timeout: 180_000,
      })
      .then(async (receipt) => {
        if (wallet && receipt.from.toLowerCase() !== wallet.address.toLowerCase()) {
          clearMintFlow();
          return;
        }
        console.log("Transaction Receipt: ", receipt);
        setReceiptStatus(receipt.status);
        const tokenId = receipt?.logs?.[0]?.topics?.[3];
        if (receipt.to && tokenId) {
          setTokenId([receipt.to, BigInt(tokenId).toString()]);
        }

        if (receipt.status === "success" && wallet) {
          mutate(["memory-hall", wallet.address]);
        }

        if (receipt.status === "reverted") {
          try {
            const tx = await publicClient.getTransaction({
              hash: txHash as Hex,
            });
            await publicClient.call({
              account: tx.from,
              to: tx.to ?? undefined,
              data: tx.input,
              value: tx.value,
              blockNumber: receipt.blockNumber,
            });
          } catch (callError) {
            const message =
              callError instanceof Error
                ? ((callError as { shortMessage?: string }).shortMessage ??
                  callError.message)
                : null;
            if (message) setRevertReason(message);
          }
        }
      })
      .catch((e) => {
        console.error("Mint Failed: ", e);

        if (e.name === "WaitForTransactionReceiptTimeoutError") {
          setReceiptStatus("timeout");
        } else {
          setReceiptStatus("reverted");
        }
      });
  }, [publicClient, txHash]);

  useEffect(() => {
    if (canComplete && receiptStatus != null) {
      canvasRef.current?.next();
    }
  }, [canComplete, receiptStatus]);

  useEffect(() => {
    if (videoState !== VideoState.CompletedResult) return;
    const timer = setTimeout(() => {
      clearMintFlow();
      router.push("/collection");
    }, 6000);
    return () => clearTimeout(timer);
  }, [videoState, router, clearMintFlow]);

  return (
    <MaxWidthConstraintedLayout
      as="main"
      paddingHeader
      paddingFooter
      fullHeight
      outerDivClassName="w-dvw h-dvh relative overflow-hidden"
      className="text-white w-full flex flex-col items-center px-4 lg:py-40"
    >
      <MintAnimationCanvas
        ref={canvasRef}
        steps={[
          { src: "/assets/mint-transaction-sent.webm" },
          { src: "/assets/mint-transaction-in-progress-loop.webm", loop: true },
          { src: "/assets/mint-transaction-complete.webm" },
        ]}
        onStepEnd={(stepIndex) => {
          if (stepIndex === 0) {
            setVideoState(VideoState.InProgressLoop);
          } else if (stepIndex === 1) {
            setVideoState(VideoState.Completed);
          } else if (stepIndex === 2) {
            if (receiptStatus === "success") {
              setVideoState(VideoState.CompletedResult);
            } else {
              setVideoState(VideoState.Failed);
            }
          }
        }}
      />

      {[
        VideoState.Completed,
        VideoState.Failed,
        VideoState.CompletedResult,
      ].includes(videoState) && <MintResultOverlay></MintResultOverlay>}

      {[VideoState.Init, VideoState.InProgressLoop].includes(videoState) && (
        <div className="fixed bottom-0 left-0 w-full flex justify-center pointer-events-none">
          <div
            className="relative w-full max-w-[1222px] flex items-center justify-center"
            style={{ aspectRatio: "1222 / 210" }}
          >
            <Image
              src="/assets/mint-text-box.svg"
              alt=""
              aria-hidden="true"
              fill
              className="object-contain"
            />
            <span className="relative text-white text-xl md:text-3xl lg:text-[48px] font-semibold leading-none text-center tk-hoss-round pb-4">
              {(videoState === VideoState.Init ||
                videoState === VideoState.InProgressLoop) &&
                "Minting in progress..."}
            </span>
          </div>
        </div>
      )}

      {[VideoState.Failed, VideoState.CompletedResult].includes(videoState) && (
        <div
          className="absolute left-0 top-0 h-full w-full flex flex-col gap-4 items-center justify-center"
          style={{
            animation: "fadeIn 0.5s ease-in forwards",
            opacity: 0,
          }}
        >
          {videoState === VideoState.CompletedResult && (
            <>
              <h1 className="text-3xl md:text-5xl font-semibold">
                Mint Successful!
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <BearthButton
                  type="secondary"
                  href={
                    tokenId
                      ? chainOption.openseaUrl(tokenId[0], tokenId[1])
                      : undefined
                  }
                  target="_blank"
                >
                  Check in Opensea
                </BearthButton>
                <BearthButton
                  type="secondary"
                  href="/collection"
                  onClick={clearMintFlow}
                >
                  View in Memory Hall
                </BearthButton>
              </div>
            </>
          )}

          {videoState === VideoState.Failed && (
            <>
              <h1 className="text-3xl md:text-5xl font-semibold">
                Mint Failed
              </h1>
              {receiptStatus === "reverted" && (
                <p className="text-center font-semibold text-base max-w-md">
                  {revertReason ??
                    "Unfortunately, your transaction was reverted."}
                </p>
              )}

              {receiptStatus === "timeout" && (
                <p className="text-center font-semibold text-base max-w-md">
                  We couldn't confirm your transaction in time. It might still
                  be processed on the blockchain. Please check your transaction
                  status on a{" "}
                  <Link
                    href={chainOption.blockExplorerUrl(txHash)}
                    target="_blank"
                    className="underline"
                  >
                    block explorer
                  </Link>
                  .
                </p>
              )}
              {receiptStatus === "failed" && (
                <p className="text-center font-semibold text-base max-w-md">
                  {failureReason ??
                    "We couldn't process your transaction. Please try again."}
                </p>
              )}
              <BearthButton type="secondary" href="/mint" onClick={clearMintFlow}>
                Try Again
              </BearthButton>
            </>
          )}
        </div>
      )}
    </MaxWidthConstraintedLayout>
  );
}

export function MintFlowHandlerAnimation() {
  const { txHash, failureReason } = useMintFlow();
  return (
    <MintingAnimation
      txHash={txHash!}
      failureReason={failureReason ?? undefined}
    />
  );
}
