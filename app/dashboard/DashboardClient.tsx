"use client"

import { useSession } from "next-auth/react"
import { TodoDialog } from "@/app/components/TodoDialog"
import { TodoList } from "@/app/components/TodoList"
import { useCallback, useRef } from "react"

export default function DashboardClient() {
  const { data: session, status } = useSession()
  const todoListRef = useRef<{ refresh: () => Promise<void> }>(null)

  const handleRefresh = useCallback(async () => {
    await todoListRef.current?.refresh()
  }, [])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please sign in</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {session.user?.name || 'User'}</h1>
        <TodoDialog onRefresh={handleRefresh} />
      </div>
      <div className="grid gap-6">
        <TodoList ref={todoListRef} />
      </div>
    </div>
  )
} 