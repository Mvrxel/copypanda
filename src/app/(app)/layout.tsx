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
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
      <main className="w-full">
        <SidebarInset>
          <div className="@container bg-gray-50 px-4 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              {" "}
              <header className="flex min-h-20 shrink-0 flex-wrap items-center gap-3 border-b py-4 transition-all ease-linear">
                {/* Left side */}
                <div className="flex flex-1 items-center gap-2">
                  <SidebarTrigger className="-ms-1" />
                  <div className="max-lg:hidden lg:contents">
                    <Separator
                      orientation="vertical"
                      className="me-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
                {/* Right side */}
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create new post
                </Button>
              </header>
              <div className="mt-4">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </main>
    </SidebarProvider>
  );
}
