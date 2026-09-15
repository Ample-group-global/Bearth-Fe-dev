export function getContractAddress(): string {
  return (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "").replace(/\s+/g, "");
}
