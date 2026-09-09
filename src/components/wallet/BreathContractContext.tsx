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
import { getWaveCatalog, type WaveCatalogEntry } from "@/lib/wave-catalog";
import { useWalletConnect } from "./WalletConnectContext";

export type BreathAbi = typeof BearthNFTAbi.abi;

export enum Phase {
  Whitelist, // 0: Wave 1 free/allowlist claim
  PaidMint, // 1: Waves 2-7 paid mint
  Revealed, // 2: Post-mint
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
  waves: SWRState<WaveInfo[]>;
  price: SWRState<bigint>;
  waveCatalog: SWRState<WaveCatalogEntry[]>;
  limit: SWRState<bigint>;
  isWhitelisted: SWRState<boolean>;
  // Registered in customer_wallets (is_whitelisted=true) — a frontend-only gate applied
  // to ALL waves (1-7), not just the on-chain merkle check that only covers wave 1.
  isRegistered: SWRState<boolean>;
  allowlistClaimed: SWRState<boolean>;
  walletTotalMinted: SWRState<bigint>;

  mint: () => Promise<Hex>;
  mintQty: number;
  setMintQty: (qty: number) => void;
}

const defaultValue: BreathContractContextValue = {
  phase: { state: Phase.Whitelist, isLoading: true },
  activeWave: { state: null, isLoading: true },
  waves: { state: [], isLoading: true },
  price: { state: BigInt(0), isLoading: true },
  waveCatalog: { state: [], isLoading: true },
  limit: { state: BigInt(0), isLoading: true },
  isWhitelisted: { state: false, isLoading: true },
  isRegistered: { state: false, isLoading: true },
  allowlistClaimed: { state: false, isLoading: true },
  walletTotalMinted: { state: BigInt(0), isLoading: true },
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
  // Bounds the whitelist-proof poll below -- reset per wallet so switching
  // wallets gets a fresh set of retries instead of inheriting an exhausted count.
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
            // The per-wave read below fires 7 waves x 7 fields = 49 eth_call
            // requests in one Promise.all burst -- easily trips Infura's free-tier
            // rate limit (429). Multicall batching folds same-tick contract reads
            // into a single eth_call against the standard Multicall3 contract
            // (already deployed at its canonical address on Sepolia), so this
            // burst becomes ~1 RPC round-trip instead of 49.
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

  // Only publicClient is required to build a read-capable contract instance --
  // it depends solely on the static `chain` constant, not on the wallet's async
  // getEthereumProvider() call. Requiring walletClient here too meant EVERY read
  // (phase, waves, everything -- not just the mint write) silently never fired
  // whenever that provider call was slow or never resolved for a given wallet
  // connector, permanently showing "MINT NOT OPEN" even though the contract and
  // network were fine.
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

  // Separate instance for the actual mint write -- genuinely needs walletClient,
  // unlike every read above. Kept apart so `contract`'s type stays read-capable
  // without walletClient's possible-undefined-ness narrowing away .write/.estimateGas.
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
      // Previously only checked !closed -- waveClosed only ever flips true via
      // an explicit admin "move unsold to treasury" action (see BearthNFT.sol),
      // never automatically when the schedule's end time passes. That meant
      // Wave 1's "MINT LIVE" status could keep showing indefinitely past its
      // real end time (until an admin happens to run that action), unlike
      // Waves 2-7 below, which already correctly check the time window. The
      // contract itself was never at risk (whitelistMint() enforces the same
      // window on-chain regardless of what the UI shows) -- this was purely a
      // misleading customer-facing status display bug.
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

  // Wave names/sale-method labels live only in Postgres (the contract has no name
  // field) -- fetched separately via a public, no-auth BearthApi-V1 route since this
  // is independent of wallet/contract state.
  const { data: waveCatalog } = useSWR("wave-catalog", getWaveCatalog);

  const { data: whitelistProof, isLoading: whitelistProofLoading } = useSWR(
    wallet ? (["whitelist-proof", wallet.address] as const) : null,
    async ([, address]) => {
      const result = await getWhitelistProof(address);
      // This zeroing was one-way: nothing ever set mintQty back up once
      // is_whitelisted flipped true again, so a wallet caught mid-registration
      // (auto-registration on connect isn't instant -- a freshly connected
      // wallet can briefly read is_whitelisted:false before the backend
      // finishes registering it) got permanently stuck at "0 / 1" -- eligible
      // per every other check (proof valid, not yet claimed, limit=1) but
      // unable to mint because the qty field itself was zeroed and never
      // recovered. Restoring to 1 here whenever whitelisting is confirmed
      // true fixes that without affecting the already-correct zeroing for
      // wallets that are genuinely not whitelisted.
      setMintQty(result.is_whitelisted ? 1 : 0);
      if (!result.is_whitelisted) whitelistPollCountRef.current += 1;
      return result;
    },
    {
      // registerWallet() (auto-registration, fired independently in
      // WalletConnectContext on connect) and this proof fetch race each other
      // with no coordination -- if this wins, is_whitelisted reads false
      // before registration lands, and with revalidateOnFocus disabled
      // globally this SWR entry would otherwise never refetch, leaving a
      // genuinely-eligible wallet stuck looking unwhitelisted indefinitely.
      // Poll briefly until it flips true; capped so a wallet that's
      // genuinely never going to be whitelisted (blocked, unregistered)
      // doesn't poll the backend forever.
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

  const isRegistered = whitelistProof?.is_whitelisted ?? false;

  // wavePurchaseLimit (if set for the active wave) caps a private per-wave-per-wallet
  // counter with no public getter — enforced on-chain (PurchaseLimitExceeded revert) but
  // not pre-checkable here. Only the global purchaseLimitEnabled/normalMaxPerWallet limit
  // can be validated client-side.
  const limit = useMemo(() => {
    // Frontend-only gate: a wallet not registered/whitelisted in customer_wallets
    // cannot mint ANY wave (1-7), even though only wave 1 enforces this on-chain.
    if (!isRegistered) return 0n;

    if (activeWave === 1) {
      return allowlistClaimed ? 0n : 1n;
    }
    if (!activeWaveInfo) return 0n;

    const remainingSupply = activeWaveInfo.qty - activeWaveInfo.soldCount;

    let remaining = remainingSupply;
    if (
      activeWaveInfo.purchaseLimit === 0n &&
      purchaseLimitConfig?.enabled &&
      walletTotalMinted !== undefined
    ) {
      const remainingGlobal =
        purchaseLimitConfig.maxPerWallet - walletTotalMinted;
      remaining =
        remainingGlobal < remainingSupply ? remainingGlobal : remainingSupply;
    }

    return remaining < 0n ? 0n : remaining;
  }, [
    isRegistered,
    activeWave,
    activeWaveInfo,
    allowlistClaimed,
    purchaseLimitConfig,
    walletTotalMinted,
  ]);

  const getFeeOverrides = useCallback(async () => {
    if (!publicClient) return {};
    try {
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const fees = await publicClient.estimateFeesPerGas();
      const baseFee = block.baseFeePerGas ?? 0n;
      const priority = fees.maxPriorityFeePerGas ?? 1_500_000_000n; // 1.5 gwei fallback
      // pad maxFeePerGas: 2x base fee + priority to absorb base-fee bumps
      const maxFeePerGas = baseFee * 2n + priority;
      return { maxFeePerGas, maxPriorityFeePerGas: priority };
    } catch {
      return {};
    }
  }, [publicClient]);

  const mint = useCallback(async () => {
    // writableContract requires walletClient (unlike the read-only `contract`
    // above), so this guard is what actually gates the write on the wallet being
    // fully ready -- reads elsewhere on the page no longer wait on this at all.
    if (!writableContract || !wallet)
      throw new Error("Not initialized");
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
      // waveMint (waves 2-7) requires the same allowlist proof as whitelistMint —
      // fetch fresh rather than reuse the cached SWR value, since the on-chain root
      // may have moved since it was last fetched.
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
      waves: {
        state: waves ?? [],
        isLoading: wavesLoading || waves === undefined,
      },
      price: {
        state: activeWaveInfo?.price ?? BigInt(0),
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
      mint,
      mintQty,
      setMintQty,
    }),
    [
      phase,
      phaseLoading,
      activeWave,
      waves,
      wavesLoading,
      activeWaveInfo,
      limit,
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
