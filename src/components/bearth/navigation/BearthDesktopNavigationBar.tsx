import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import BearthLiquidGlassEffect from "./BearthLiquidGlassEffect";

export function BearthNavigationBarLink({
  children,
  href,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuItem className={cn("relative")}>
      <NavigationMenuLink
        href={href}
        className={cn(
          "text-2xl rounded-3xl px-8 py-2 leading-6 text-background no-underline focus:text-background hover:text-background focus:no-underline hover:no-underline hover:bg-transparent focus:bg-transparent",
        )}
      >
        {children}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export function BearthNavigationBarLinkSeparator() {
  return (
    <div className="h-full w-0 mx-1 border-r border-background">&nbsp;</div>
  );
}

export default function BearthDesktopNavigationBar({
  className,
}: {
  className?: string;
}) {
  return (
    <BearthLiquidGlassEffect>
      <NavigationMenu
        className={cn(
          "rounded-full border-background overflow-visible font-semibold uppercase",
          className,
        )}
      >
        <NavigationMenuList className="gap-0">
          <BearthNavigationBarLink href="/about">About</BearthNavigationBarLink>
          <BearthNavigationBarLink href="/city">City</BearthNavigationBarLink>
          <BearthNavigationBarLink href="/mindmap">
            Mindmap
          </BearthNavigationBarLink>
        </NavigationMenuList>
      </NavigationMenu>
    </BearthLiquidGlassEffect>
  );
}
