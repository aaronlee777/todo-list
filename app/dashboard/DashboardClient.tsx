"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export function DashboardClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid lg:grid-cols-[270px_1fr] min-h-screen">
      <AppSidebar onRefresh={() => {}} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </div>
  )
}
