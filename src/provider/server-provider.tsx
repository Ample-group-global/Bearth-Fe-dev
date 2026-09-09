import { ClientPrivyProvider } from "./client-privy-provider";

export const ServerProvider = ({ children }: { children: React.ReactNode }) => {
  const appId = process.env.PRIVY_APP_ID;
  if (!appId) {
    throw new Error("PRIVY_APP_ID is not set");
  }

  return <ClientPrivyProvider appId={appId}>{children}</ClientPrivyProvider>;
};
