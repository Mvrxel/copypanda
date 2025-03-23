"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={`text-sm ${isActive ? "bg-black hover:bg-black/90" : ""}`}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
