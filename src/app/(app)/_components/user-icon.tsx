"use server";

import { auth } from "@/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDownIcon,
  SettingsIcon,
  UserRoundIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";

export async function UserIcon() {
  const session = await auth();

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>
              <UserRoundIcon />
            </AvatarFallback>
          </Avatar>

          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {session.user?.name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {session.user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Settings</span>
          </DropdownMenuItem>
          <LogoutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
