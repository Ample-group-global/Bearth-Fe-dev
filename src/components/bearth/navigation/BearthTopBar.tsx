import Image from "next/image";
import Link from "next/link";
import BearthDesktopNavigationBar from "./BearthDesktopNavigationBar";
import { BearthSideMenu } from "./BearthSideMenu";
import { ConnectWalletTopBarButton } from "./ConnectWalletTopBarButton";

export default function BearthTopBar() {
  return (
    <div className="flex w-full items-center justify-center max-w-7xl left-1/2 -translate-x-1/2 pt-2 md:pt-4 fixed z-50">
      <div className="pl-2">
        <Link href="/">
          <Image
            src="/assets/icon.png"
            alt="Bearth Icon"
            width={48}
            height={48}
          />
        </Link>
      </div>

      <div className="flex grow items-center justify-center">
        <BearthDesktopNavigationBar className="hidden md:flex" />
        <ConnectWalletTopBarButton />
      </div>

      <div className="pr-2 md:hidden flex items-center justify-center">
        <BearthSideMenu />
      </div>
    </div>
  );
}
