"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TodoList } from "@/app/components/TodoList"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react"

export default function Page() {
  const [todoCount, setTodoCount] = useState(0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
              <p className="text-sm text-muted-foreground">
                {todoCount === 0 
                  ? "No tasks yet" 
                  : `${todoCount} ${todoCount === 1 ? 'task' : 'tasks'}`
                }
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <TodoList 
            onCountChange={setTodoCount}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
