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
      / {limit.state.toString()}
    </div>
  );
}
