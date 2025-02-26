"use client"

import { useCallback, useRef } from "react"
import { Session } from "next-auth"
import { TodoDialog } from "@/app/components/TodoDialog"
import { TodoList } from "@/app/components/TodoList"

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const refreshTodos = useRef<() => Promise<void>>(null)

  const handleRefresh = useCallback(async () => {
    await refreshTodos.current?.()
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session.user?.name || 'User'}</h1>
          <TodoDialog onSuccess={handleRefresh} />
        </div>
        <div className="grid gap-6">
          <TodoList onRefresh={refresh => refreshTodos.current = refresh} />
        </div>
      </div>
    </main>
  )
} 