"use client";

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
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  type Hex,
  http,
} from "viem";

import BearthNFTAbi from "@/BearthNFTAbi";
import { getWhitelistProof } from "@/lib/whitelist-proof";
import { getWalletMintedInWave } from "@/lib/wave-mint-status";
import { getWaveCatalog, type WaveCatalogEntry } from "@/lib/wave-catalog";
import { useWalletConnect } from "./WalletConnectContext";

export type BreathAbi = typeof BearthNFTAbi.abi;

export enum Phase {
  Whitelist,
  PaidMint,
  Revealed,
}

export function parsePhase(phase: number): Phase {
  switch (phase) {
    case 0:
      return Phase.Whitelist;
    case 1:
      return Phase.PaidMint;
    case 2:
      return Phase.Revealed;
    default:
      throw new Error(`Unknown phase: ${phase}`);
  }
}

export interface SWRState<T> {
  state: T;
  isLoading: boolean;
}

export interface WaveInfo {
  waveNum: number;
  price: bigint;
  qty: bigint;
  soldCount: bigint;
  startTime: bigint;
  endTime: bigint;
  closed: boolean;
  purchaseLimit: bigint;
}

export interface BreathContractContextValue {
  phase: SWRState<Phase>;
  activeWave: SWRState<number | null>;
  pivotWave: number | null;
  waves: SWRState<WaveInfo[]>;
  price: SWRState<bigint>;
  waveCatalog: SWRState<WaveCatalogEntry[]>;
  limit: SWRState<bigint>;
  isWhitelisted: SWRState<boolean>;
  isRegistered: SWRState<boolean>;
  allowlistClaimed: SWRState<boolean>;
  walletTotalMinted: SWRState<bigint>;
  isPaused: SWRState<boolean>;
  isBlocked: SWRState<boolean>;

  mint: () => Promise<Hex>;
  mintQty: number;
  setMintQty: (qty: number) => void;
}

const defaultValue: BreathContractContextValue = {
  phase: { state: Phase.Whitelist, isLoading: true },
  activeWave: { state: null, isLoading: true },
  pivotWave: null,
  waves: { state: [], isLoading: true },
  price: { state: BigInt(0), isLoading: true },
  waveCatalog: { state: [], isLoading: true },
  limit: { state: BigInt(0), isLoading: true },
  isWhitelisted: { state: false, isLoading: true },
  isRegistered: { state: false, isLoading: true },
  allowlistClaimed: { state: false, isLoading: true },
  walletTotalMinted: { state: BigInt(0), isLoading: true },
  isPaused: { state: false, isLoading: true },
  isBlocked: { state: false, isLoading: true },
  mint: async () => "0x" as Hex,
  mintQty: 1,
  setMintQty: () => {},
};

export const BreathContractContext =
  createContext<BreathContractContextValue>(defaultValue);

export function BreathContractProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mintQty, setMintQty] = useState(1);
  const whitelistPollCountRef = useRef(0);

  const { chain, wallet } = useWalletConnect();
  useEffect(() => {
    whitelistPollCountRef.current = 0;
  }, [wallet?.address]);

  const { data: provider } = useSWR(
    wallet ? ["eth-provider", wallet.address] : null,
    () => {
      if (!wallet) return null;
      return wallet.getEthereumProvider();
    },
  );

  const publicClient = useMemo(
    () =>
      chain
        ? createPublicClient({
            chain,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
            batch: { multicall: true },
          })
        : null,
    [chain],
  );

  const walletClient = useMemo(
    () =>
      wallet && chain && provider
        ? createWalletClient({
            account: wallet.address as Hex,
            chain,
            transport: custom(provider),
          })
        : undefined,
    [wallet, chain, provider],
  );

  const contract = useMemo(
    () =>
      publicClient
        ? getContract({
            address: (
              process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
            )?.replace(/\s+/g, "") as `0x${string}`,
            abi: BearthNFTAbi.abi,
            client: { public: publicClient },
          })
        : null,
    [publicClient],
  );

  const writableContract = useMemo(
    () =>
      publicClient && walletClient
        ? getContract({
            address: (
              process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
            )?.replace(/\s+/g, "") as `0x${string}`,
            abi: BearthNFTAbi.abi,
            client: { public: publicClient, wallet: walletClient },
          })
        : null,
    [publicClient, walletClient],
  );

  const { data: phase, isLoading: phaseLoading } = useSWR(
    contract ? (["contract-phase", wallet?.address, contract] as const) : null,
    ([, , c]) => c.read.currentPhase().then((p) => parsePhase(p as number)),
  );

  const { data: waveCount } = useSWR(
    contract ? (["wave-count", contract] as const) : null,
    async ([, c]) => Number(await c.read.WAVE_COUNT()),
  );

  const { data: waves, isLoading: wavesLoading } = useSWR(
    contract && waveCount ? (["waves", waveCount, contract] as const) : null,
    async ([, count, c]) => {
      const waveNums = Array.from({ length: count }, (_, i) => i + 1);
      return Promise.all(
        waveNums.map(async (waveNum) => {
          const [price, qty, soldCount, startTime, endTime, closed, purchaseLimit] =
            await Promise.all([
              c.read.wavePrice([BigInt(waveNum)]),
              c.read.waveQty([BigInt(waveNum)]),
              c.read.waveSoldCount([BigInt(waveNum)]),
              c.read.waveStartTime([BigInt(waveNum)]),
              c.read.waveEndTime([BigInt(waveNum)]),
              c.read.waveClosed([BigInt(waveNum)]),
              c.read.wavePurchaseLimit([BigInt(waveNum)]),
            ]);
          return {
            waveNum,
            price: price as bigint,
            qty: qty as bigint,
            soldCount: soldCount as bigint,
            startTime: startTime as bigint,
            endTime: endTime as bigint,
            closed: closed as boolean,
            purchaseLimit: purchaseLimit as bigint,
          } satisfies WaveInfo;
        }),
      );
    },
  );

  const activeWave = useMemo(() => {
    if (!waves || phase === undefined) return null;
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (phase === Phase.Whitelist) {
      const wave1 = waves.find((w) => w.waveNum === 1);
      return wave1 &&
        !wave1.closed &&
        wave1.startTime > 0n &&
        now >= wave1.startTime &&
        now <= wave1.endTime
        ? 1
        : null;
    }

    if (phase === Phase.PaidMint) {
      const open = waves.find(
        (w) =>
          w.waveNum >= 2 &&
          !w.closed &&
          w.startTime > 0n &&
          now >= w.startTime &&
          now <= w.endTime,
      );
      return open?.waveNum ?? null;
    }

    return null;
  }, [waves, phase]);

  const activeWaveInfo = useMemo(
    () => waves?.find((w) => w.waveNum === activeWave) ?? null,
    [waves, activeWave],
  );

  const pivotWave = useMemo(() => {
    if (activeWave) return activeWave;
    if (!waves?.length) return null;
    const now = BigInt(Math.floor(Date.now() / 1000));
    const sorted = [...waves].sort((a, b) => a.waveNum - b.waveNum);
    const next = sorted.find(
      (w) => !w.closed && (w.endTime === 0n || w.endTime > now),
    );
    return next?.waveNum ?? sorted[sorted.length - 1]?.waveNum ?? null;
  }, [activeWave, waves]);

  const pivotWaveInfo = useMemo(
    () => waves?.find((w) => w.waveNum === pivotWave) ?? null,
    [waves, pivotWave],
  );

  const { data: waveCatalog } = useSWR("wave-catalog", getWaveCatalog);

  const { data: whitelistProof, isLoading: whitelistProofLoading } = useSWR(
    wallet ? (["whitelist-proof", wallet.address] as const) : null,
    async ([, address]) => {
      const result = await getWhitelistProof(address);
      setMintQty(result.is_whitelisted ? 1 : 0);
      if (!result.is_whitelisted) whitelistPollCountRef.current += 1;
      return result;
    },
    {
      refreshInterval: (data) =>
        data?.is_whitelisted || whitelistPollCountRef.current >= 8
          ? 0
          : 2000,
    },
  );

  const { data: onchainRoot, isLoading: onchainRootLoading } = useSWR(
    contract ? (["wl-root", contract] as const) : null,
    async ([, c]) => (await c.read.allowlistRoot()) as Hex,
  );

  const { data: allowlistClaimed, isLoading: allowlistClaimedLoading } = useSWR(
    contract && wallet
      ? (["allowlist-claimed", wallet.address, contract] as const)
      : null,
    async ([, address, c]) =>
      c.read.allowlistClaimed([address as Hex]) as Promise<boolean>,
  );

  const { data: walletTotalMinted, isLoading: walletTotalMintedLoading } =
    useSWR(
      contract && wallet
        ? (["wallet-total-minted", wallet.address, contract] as const)
        : null,
      async ([, address, c]) =>
        c.read.walletTotalMinted([address as Hex]) as Promise<bigint>,
    );

  const { data: purchaseLimitConfig, isLoading: purchaseLimitConfigLoading } =
    useSWR(
      contract ? (["purchase-limit-config", contract] as const) : null,
      async ([, c]) => {
        const [enabled, maxPerWallet] = await Promise.all([
          c.read.purchaseLimitEnabled(),
          c.read.normalMaxPerWallet(),
        ]);
        return {
          enabled: enabled as boolean,
          maxPerWallet: maxPerWallet as bigint,
        };
      },
    );

  const { data: isPaused, isLoading: isPausedLoading } = useSWR(
    contract ? (["contract-paused", contract] as const) : null,
    ([, c]) => c.read.paused() as Promise<boolean>,
    { refreshInterval: 15_000 },
  );

  const { data: isBlocked, isLoading: isBlockedLoading } = useSWR(
    contract && wallet
      ? (["blocked-accounts", wallet.address, contract] as const)
      : null,
    ([, address, c]) => c.read.blockedAccounts([address as Hex]) as Promise<boolean>,
  );

  const isRegistered = whitelistProof?.is_whitelisted ?? false;

  const { data: waveMintedCount } = useSWR(
    contract && wallet && activeWave && activeWave > 1
      ? (["wave-minted-count", wallet.address, activeWave, contract] as const)
      : null,
    async ([, address, waveNum]) => getWalletMintedInWave(address, waveNum),
  );

  const limit = useMemo(() => {
    if (isPaused || isBlocked) return 0n;
    if (!isRegistered) return 0n;

    if (activeWave === 1) {
      return allowlistClaimed ? 0n : 1n;
    }
    if (!activeWaveInfo) return 0n;

    const remainingSupply = activeWaveInfo.qty - activeWaveInfo.soldCount;

    let remaining = remainingSupply;
    if (activeWaveInfo.purchaseLimit > 0n) {
      const remainingWave = activeWaveInfo.purchaseLimit - BigInt(waveMintedCount ?? 0);
      remaining = remainingWave < remainingSupply ? remainingWave : remainingSupply;
    } else if (purchaseLimitConfig?.enabled && walletTotalMinted !== undefined) {
      const remainingGlobal =
        purchaseLimitConfig.maxPerWallet - walletTotalMinted;
      remaining =
        remainingGlobal < remainingSupply ? remainingGlobal : remainingSupply;
    }

    return remaining < 0n ? 0n : remaining;
  }, [
    isPaused,
    isBlocked,
    isRegistered,
    activeWave,
    activeWaveInfo,
    allowlistClaimed,
    purchaseLimitConfig,
    walletTotalMinted,
    waveMintedCount,
  ]);

  const getFeeOverrides = useCallback(async () => {
    if (!publicClient) return {};
    try {
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const fees = await publicClient.estimateFeesPerGas();
      const baseFee = block.baseFeePerGas ?? 0n;
      const priority = fees.maxPriorityFeePerGas ?? 1_500_000_000n;
      const maxFeePerGas = baseFee * 2n + priority;
      return { maxFeePerGas, maxPriorityFeePerGas: priority };
    } catch {
      return {};
    }
  }, [publicClient]);

  const mint = useCallback(async () => {
    if (!writableContract || !wallet)
      throw new Error("Not initialized");
    if (isPaused) throw new Error("Minting is currently paused");
    if (isBlocked) throw new Error("This wallet is blocked from minting");
    if (!isRegistered) throw new Error("Wallet is not registered/whitelisted");

    if (activeWave === 1) {
      const proofResult = await getWhitelistProof(wallet.address);

      if (!proofResult.is_whitelisted) {
        throw new Error("Address is not whitelisted");
      }

      const account = wallet.address as Hex;
      const gasEstimate = await writableContract.estimateGas.whitelistMint(
        [proofResult.proof],
        { account },
      );
      const fees = await getFeeOverrides();

      return writableContract.write.whitelistMint([proofResult.proof], {
        gas: (gasEstimate * 120n) / 100n,
        ...fees,
      });
    }

    if (activeWave && activeWave >= 2) {
      const proofResult = await getWhitelistProof(wallet.address);
      if (!proofResult.is_whitelisted) {
        throw new Error("Address is not whitelisted");
      }

      const account = wallet.address as Hex;
      const waveNumBig = BigInt(activeWave);
      const qtyBig = BigInt(mintQty);
      const value = (activeWaveInfo?.price ?? 0n) * qtyBig;

      const gasEstimate = await writableContract.estimateGas.waveMint(
        [waveNumBig, qtyBig, proofResult.proof],
        { account, value },
      );
      const fees = await getFeeOverrides();

      return writableContract.write.waveMint(
        [waveNumBig, qtyBig, proofResult.proof],
        {
          gas: (gasEstimate * 120n) / 100n,
          value,
          ...fees,
        },
      );
    }

    throw new Error("No wave is currently open for minting");
  }, [
    writableContract,
    wallet,
    isPaused,
    isBlocked,
    isRegistered,
    activeWave,
    activeWaveInfo,
    mintQty,
    getFeeOverrides,
  ]);

  const value = useMemo(
    () => ({
      phase: {
        state: phase ?? Phase.Whitelist,
        isLoading: phaseLoading || phase === undefined,
      },
      activeWave: {
        state: activeWave,
        isLoading: wavesLoading || phaseLoading,
      },
      pivotWave,
      waves: {
        state: waves ?? [],
        isLoading: wavesLoading || waves === undefined,
      },
      price: {
        state: pivotWaveInfo?.price ?? BigInt(0),
        isLoading: wavesLoading,
      },
      waveCatalog: {
        state: waveCatalog ?? [],
        isLoading: waveCatalog === undefined,
      },
      limit: {
        state: limit,
        isLoading:
          wavesLoading ||
          allowlistClaimedLoading ||
          purchaseLimitConfigLoading ||
          walletTotalMintedLoading,
      },
      isWhitelisted: {
        state:
          (whitelistProof?.is_whitelisted ?? false) &&
          !!onchainRoot &&
          !!whitelistProof?.root &&
          whitelistProof.root.toLowerCase() === onchainRoot.toLowerCase(),
        isLoading:
          whitelistProofLoading ||
          whitelistProof === undefined ||
          onchainRootLoading ||
          onchainRoot === undefined,
      },
      isRegistered: {
        state: isRegistered,
        isLoading: whitelistProofLoading || whitelistProof === undefined,
      },
      allowlistClaimed: {
        state: allowlistClaimed ?? false,
        isLoading: allowlistClaimedLoading || allowlistClaimed === undefined,
      },
      walletTotalMinted: {
        state: walletTotalMinted ?? BigInt(0),
        isLoading:
          walletTotalMintedLoading || walletTotalMinted === undefined,
      },
      isPaused: {
        state: isPaused ?? false,
        isLoading: isPausedLoading || isPaused === undefined,
      },
      isBlocked: {
        state: isBlocked ?? false,
        isLoading: isBlockedLoading || isBlocked === undefined,
      },
      mint,
      mintQty,
      setMintQty,
    }),
    [
      phase,
      phaseLoading,
      activeWave,
      pivotWave,
      pivotWaveInfo,
      waves,
      wavesLoading,
      activeWaveInfo,
      limit,
      isPaused,
      isPausedLoading,
      isBlocked,
      isBlockedLoading,
      allowlistClaimedLoading,
      purchaseLimitConfigLoading,
      walletTotalMintedLoading,
      whitelistProof,
      whitelistProofLoading,
      onchainRoot,
      onchainRootLoading,
      allowlistClaimed,
      walletTotalMinted,
      mint,
      mintQty,
    ],
  );

  return (
    <BreathContractContext.Provider value={value}>
      {children}
    </BreathContractContext.Provider>
  );
}

export function useBreathContract() {
  const context = useContext(BreathContractContext);

  if (!context) {
    throw new Error(
      "useBreathContract must be used within a BreathContractProvider",
    );
  }

  return context;
}
