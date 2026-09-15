"use client";
import { useBreathContract } from "./BreathContractContext";

export function BreathMintQty() {
  const breathContract = useBreathContract();
  const { activeWave, limit, isRegistered } = breathContract;

  if (activeWave.isLoading || limit.isLoading || isRegistered.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input
        name="mintQty"
        disabled={
          !isRegistered.state ||
          activeWave.state === null ||
          activeWave.state === 1
        }
        value={breathContract.mintQty}
        className="w-[38px] h-[36px] border-[1.5px] border-[rgba(255,255,255,0.14)] rounded-sm text-center m-1 outline-none focus:ring-0"
        onChange={(e) => {
          const value = parseInt(e.target.value);
          if (isNaN(value) || value < 0) {
            breathContract.setMintQty(1);
          } else {
            breathContract.setMintQty(value);
          }
        }}
      ></input>
      {/* "0" here is ambiguous between two very different situations: no
          wave is open yet (limit is a meaningless placeholder, set for real
          once Bearth team schedules/activates the wave) vs a wave IS live
          and this wallet's per-wave/global allowance is genuinely used up.
          Only the second case is a real "0 remaining" -- the first shows a
          dash instead so it doesn't read as an exhausted limit. */}
      / {activeWave.state === null ? "—" : limit.state.toString()}
    </div>
  );
}
