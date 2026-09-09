import { MintFlowProvider } from "@/provider/mint-flow-handler";
import { MintFlowHandlerAnimation } from "@/components/bearth/mint/MintingAnimation";
import { MintPageComponent } from "@/components/bearth/mint/MintPageComponent";

export default function MintPage() {
  return (
    <MintFlowProvider
      mintPageSlot={<MintPageComponent></MintPageComponent>}
      mintingAnimationSlot={<MintFlowHandlerAnimation />}
    />
  );
}
