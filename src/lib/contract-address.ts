import { getPublicCollection } from "./public-collection";

export async function getContractAddress(): Promise<string> {
  const { contractAddress } = await getPublicCollection();
  return (contractAddress ?? "").replace(/\s+/g, "");
}
