import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardClient>
        {children}
      </DashboardClient>
    </SidebarProvider>
  );
}
