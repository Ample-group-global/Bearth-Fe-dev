"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { Fragment } from "react";
import { SWRConfig } from "swr";
import { BreathContractProvider } from "@/components/wallet/BreathContractContext";
import { WalletConnectProvider } from "@/components/wallet/WalletConnectContext";

export const ClientPrivyProvider = ({
  appId,
  contractAddress,
  network,
  children,
}: {
  children: React.ReactNode;
  appId: string;
  contractAddress: string;
  network: string;
}) => {
  if (typeof window === "undefined") {
    return <Fragment key="client-privy-provider">{children}</Fragment>;
  }

  return (
    <Fragment key="client-privy-provider">
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          onError: (err) => {
            console.error("SWR Error:", err);
          },
        }}
      >
        <PrivyProvider
          key="privy-provider"
          appId={appId}
          config={{
            appearance: {
              walletList: [
                "bitget_wallet",
                "detected_ethereum_wallets"
              ],
            },
          }}
        >
          <WalletConnectProvider network={network}>
            <BreathContractProvider contractAddress={contractAddress}>{children}</BreathContractProvider>
          </WalletConnectProvider>
        </PrivyProvider>
      </SWRConfig>
    </Fragment>
  );
};
