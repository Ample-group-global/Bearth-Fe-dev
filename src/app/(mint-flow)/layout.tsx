import { preload } from "react-dom";

interface MintingLayoutProps {
  children: React.ReactNode;
}

export default function MintingLayout({ children }: MintingLayoutProps) {
  preload("/assets/mint-transaction-sent.webm", { as: "video" });
  preload("/assets/mint-transaction-in-progress-loop.webm", { as: "video" });
  preload("/assets/mint-transaction-complete.webm", { as: "video" });
  return <div>{children}</div>;
}
