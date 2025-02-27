"use client"

import { TodoList } from "@/app/components/TodoList"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function Page() {
  const [todoCount, setTodoCount] = useState({ total: 0, filtered: 0 })
  const todoListRef = useRef<{ refresh: () => Promise<void> }>(null)

  return (
    <SidebarProvider>
      <AppSidebar onRefresh={() => todoListRef.current?.refresh()} />
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
                {todoCount.filtered === 0 
                  ? "No tasks yet" 
                  : `${todoCount.filtered} ${todoCount.filtered === 1 ? 'task' : 'tasks'}`
                }
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <TodoList 
            ref={todoListRef}
            onCountChange={setTodoCount}
            filter="today"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 