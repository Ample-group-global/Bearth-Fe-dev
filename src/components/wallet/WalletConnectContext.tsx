"use client";

import {
  type ConnectedWallet,
  type User,
  useActiveWallet,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { createPublicClient, formatEther, http } from "viem";
import { registerWallet } from "@/lib/wallet-register";
import { chains } from "./chains";

interface WalletConnectContextValue {
  login: ReturnType<typeof usePrivy>["login"];
  logout: () => Promise<void>;
  authenticated: boolean;
  // True once Privy has finished restoring the session from storage on page
  // load. Privy's own docs: "You should always check that `ready` is true
  // before using [authenticated] -- otherwise the value may [be] outdated."
  // On a hard refresh, `authenticated` reads false for a brief moment before
  // Privy rehydrates -- consumers should treat that window as "loading", not
  // as "logged out", to avoid a CONNECT/DISCONNECT flash.
  privyReady: boolean;
  user: User | null;
  wallet: ConnectedWallet | null;
  // True once Privy's wallet list has resolved (whether or not any wallet is
  // connected). Lets consumers distinguish "still syncing" from "genuinely not
  // connected" -- see the wallet fallback below for why this matters.
  walletsReady: boolean;
  // True if the connected wallet rejected (or failed) the prompt to switch to
  // the configured chain -- previously this failure was silently swallowed,
  // leaving the wallet on the wrong network with no indication why nothing works.
  wrongNetwork: boolean;
  balance?: string | null;
  chain?: (typeof chains)[keyof typeof chains] | null;
  // Prompts the connected user to pick a different external wallet, replacing
  // the currently active one -- distinct from login() (full auth flow) and
  // logout()+login() (extra round trip); this is Privy's dedicated in-place
  // wallet-switch flow.
  switchWallet: () => Promise<void>;
  // True while a switchWallet() request is in flight -- lets the button
  // disable itself instead of relying solely on the internal re-entry guard.
  isSwitchingWallet: boolean;
}

export const WalletConnectContext = createContext<WalletConnectContextValue>({
  login: async () => {},
  logout: async () => {},
  authenticated: false,
  privyReady: false,
  user: null,
  wallet: null,
  walletsReady: false,
  wrongNetwork: false,
  balance: null,
  chain: null,
  switchWallet: async () => {},
  isSwitchingWallet: false,
});

interface WalletConnectContextProps {
  children: React.ReactNode;
}

export function WalletConnectProvider({ children }: WalletConnectContextProps) {
  const { login, logout, user, authenticated, ready: privyReady } =
    usePrivy();

  // useActiveWallet()'s `wallet` reflects Privy's internal "which wallet is
  // active" designation, which can lag behind authentication -- observed in
  // practice as one connected wallet showing the mint UI immediately while
  // another sits authenticated but stuck on "Connect Wallet" for no apparent
  // reason. useWallets() exposes the actual connected-wallets list plus a real
  // `ready` flag, so falling back to it here means the app treats a wallet as
  // usable as soon as it's genuinely connected, not only once Privy has also
  // finished picking an "active" one.
  const { wallet: activeWallet, connect: connectActiveWallet } =
    useActiveWallet();
  const { wallets, ready: walletsReady } = useWallets();
  const wallet = activeWallet ?? wallets[0];
  const registeredAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!wallet || wallet.type !== "ethereum") return;
    if (registeredAddressRef.current === wallet.address) return;
    registeredAddressRef.current = wallet.address;
    registerWallet(wallet.address);
  }, [wallet]);

  const chain =
    chains[process.env.NEXT_PUBLIC_CONTRACT_NET as keyof typeof chains] ??
    chains.sepolia;

  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Was previously duplicated as two near-identical effects, neither of which
  // caught a rejected/failed switchChain -- a user who dismissed the network
  // switch prompt was silently left on the wrong chain with no indication why
  // reads/writes weren't working.
  useEffect(() => {
    if (!wallet || wallet.type !== "ethereum") return;
    setWrongNetwork(false);
    wallet.switchChain(chain.id).catch(() => setWrongNetwork(true));
  }, [wallet, chain]);

  const publicClient = useMemo(() => {
    const publicClient = createPublicClient({
      chain,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
    });
    return publicClient;
  }, [chain]);

  // Guards against a second wallet_requestPermissions firing while MetaMask's
  // first request is still pending -- MetaMask rejects the second call with
  // an "already pending" RPC error rather than queueing or replacing it, and
  // without this guard that rejection fell into the catch below and
  // incorrectly triggered Privy's fallback reconnect on top of the still-open
  // MetaMask popup (observed as a burst of repeated RPC errors from rapid
  // clicks on the switch-wallet button).
  const switchInFlightRef = useRef(false);
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);

  const switchWallet = useCallback(async () => {
    if (!wallet || wallet.type !== "ethereum") return;
    if (switchInFlightRef.current) return;
    switchInFlightRef.current = true;
    setIsSwitchingWallet(true);
    try {
      const provider = await wallet.getEthereumProvider();
      // Forces MetaMask (and other injected wallets supporting EIP-2255) to
      // re-show its account picker -- a plain reconnect silently reuses the
      // already-granted authorization instead of letting the user pick a
      // different account.
      await provider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (err) {
      // -32002 ("already pending") means a request is already in flight --
      // nothing to fall back to, just let it resolve on its own. Any other
      // error (e.g. the wallet doesn't support wallet_requestPermissions at
      // all) falls back to Privy's own reset-and-reconnect flow.
      const code = (err as { code?: number })?.code;
      if (code !== -32002) {
        await connectActiveWallet({ reset: true });
      }
    } finally {
      switchInFlightRef.current = false;
      setIsSwitchingWallet(false);
    }
  }, [wallet, connectActiveWallet]);

  const balance = useSWR(wallet ? [wallet.address] : null, async () => {
    if (!authenticated || !wallet) return null;
    const balance = await publicClient.getBalance({
      address: wallet?.address as `0x${string}`,
    });
    return formatEther(balance);
  });

  return (
    <WalletConnectContext.Provider
      value={{
        login,
        logout,
        authenticated,
        privyReady,
        user,
        wallet: (wallet as ConnectedWallet) ?? null,
        wrongNetwork,
        walletsReady,
        balance: balance.data,
        chain,
        switchWallet,
        isSwitchingWallet,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnect() {
  return useContext(WalletConnectContext);
}
