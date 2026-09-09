import { MintingAnimation } from "@/components/bearth/mint/MintingAnimation";

export default async function MintingPage({
  params,
  searchParams,
}: {
  params: Promise<{ txHash: string }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const { txHash } = await params;
  const { reason } = await searchParams;
  return <MintingAnimation txHash={txHash} failureReason={reason} />;
}
