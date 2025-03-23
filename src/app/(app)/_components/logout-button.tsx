"use client";

import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutButton() {
  return (
    <DropdownMenuItem onClick={() => signOut()}>
      <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}
