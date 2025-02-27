"use client"

import { LucideIcon } from "lucide-react"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tasks</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive}>
              <a href={item.url}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
