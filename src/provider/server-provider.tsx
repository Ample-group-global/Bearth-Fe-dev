import { ClientPrivyProvider } from "./client-privy-provider";
import { getPublicCollection } from "@/lib/public-collection";

export const ServerProvider = async ({ children }: { children: React.ReactNode }) => {
  const appId = process.env.PRIVY_APP_ID;
  if (!appId) {
    throw new Error("PRIVY_APP_ID is not set");
  }

  const { contractAddress, network } = await getPublicCollection();

  return (
    <ClientPrivyProvider appId={appId} contractAddress={contractAddress} network={network}>
      {children}
    </ClientPrivyProvider>
  );
};
