import Link from "next/link";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { Button } from "../components/ui/button";
import { SignOutButton } from "./_components/sign-out-button";
export default async function Home() {
  const session = await auth();
  return (
    <HydrateClient>
      {session ? (
        // Content for authenticated users
        <div>
          {session.user.email}
          <div>
            <SignOutButton />
          </div>
        </div>
      ) : (
        // Content for unauthenticated users
        <div className="flex h-screen w-full items-center justify-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Copy Panda</h2>
            <p className="mb-6">Copy Panda is currently in private alpha.</p>
            <Link href="/auth/sign-in">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
        </div>
      )}
    </HydrateClient>
  );
}
