"use client"

import { useEffect, useState, useCallback } from "react"
import { TodoItem } from "@/app/components/TodoItem"
import { toast } from "sonner"

interface Todo {
  id: string
  title: string
  description?: string | null
  priority: string
  dueDate?: Date | null
  completed: boolean
}

export function TodoList({ onRefresh }: { onRefresh?: (refresh: () => Promise<void>) => void }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      toast.error("Failed to load todos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  useEffect(() => {
    onRefresh?.(fetchTodos)
  }, [onRefresh, fetchTodos])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No todos yet. Create your first todo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
} 