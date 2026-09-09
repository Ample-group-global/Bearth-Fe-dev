import { notFound } from "next/navigation";

export default function MintFeatTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_CONTRACT_NET !== "sepolia") {
    notFound();
  }

  return <div>{children}</div>;
}
