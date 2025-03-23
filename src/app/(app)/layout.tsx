import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";

import { UserIcon } from "./_components/user-icon";
import { NavItem } from "./_components/nav-item";
import Image from "next/image";

// Server component
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  return (
    <main className="h-screen w-full">
      <div className="">
        <div className="@container h-[calc(100vh)] w-full bg-gray-50 px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <header className="flex h-16 items-center justify-between">
              <Link
                href="/dashboard"
                className="text-lg font-medium tracking-tight hover:opacity-80"
              >
                <Image
                  src="https://s6cu1jk9yf.ufs.sh/f/mlJw8X6SQkxj8bLLY2K9cOPvtjZwmBhDefzQIWT6E2KVN4JG"
                  width={150}
                  height={100}
                  alt="logo"
                />
              </Link>

              <div className="flex items-center gap-6">
                <NavItem href="/dashboard">Dashboard</NavItem>
                <UserIcon />
              </div>
            </header>
            <TooltipProvider>
              <div className="pt-6">{children}</div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
