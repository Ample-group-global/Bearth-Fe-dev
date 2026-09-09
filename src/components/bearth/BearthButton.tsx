import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createElement, Fragment } from "react";

export function BearthButton({
  children,
  href,
  className,
  type = "primary",
  onClick,
  target,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  type?: "primary" | "secondary";
  onClick?: () => void;
  target?: string;
  disabled?: boolean;
}) {
  return createElement(
    href
      ? (Link as unknown as React.ElementType)
      : (Fragment as React.ElementType),
    href
      ? { href, target, key: "button-link" }
      : {
          key: "button-fragment",
        },
    <Button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-sm font-figtree uppercase hover:brightness-105",
        type === "primary" && "bg-accent text-accent-foreground",
        type === "secondary" && "bg-white hover:bg-white/80 text-black",
        className,
        disabled && "opacity-50 cursor-default",
      )}
      disabled={disabled}
    >
      {children}
      <Badge
        className={cn(
          `rounded-sm p-0.5`,
          type === "primary" && "bg-foreground text-background",
          type === "secondary" && "bg-primary text-black",
        )}
      >
        <ArrowRight className="h-6 w-6 stroke-3" />
      </Badge>
    </Button>,
  );
}

createElement(Fragment, {}, <div>Test</div>);
createElement(Link, { href: "" }, <div>Test</div>);
