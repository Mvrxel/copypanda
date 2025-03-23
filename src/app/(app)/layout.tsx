import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "./_components/app-sidebar";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
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
    <SidebarProvider>
      <AppSidebar />
      <main className="h-screen w-full bg-slate-100 p-2">
        <SidebarInset className="bg-slate-100">
          <div className="@container h-[calc(100vh-1rem)] w-full rounded-lg border bg-gray-50 px-4 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mt-4">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </main>
    </SidebarProvider>
  );
}
