"use client"

import { useEffect, useState, useCallback } from "react"
import { format, isToday, startOfDay, addDays } from "date-fns"
import { TodoItem } from "@/app/components/TodoItem"
import { Separator } from "@/components/ui/separator"
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
    } catch (error: unknown) {
      toast.error("Failed to load todos")
      if (error instanceof Error) {
        console.error(error.message)
      }
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

  // Group todos by due date
  const groupedTodos = todos
    .filter(todo => !todo.completed)
    .reduce((groups, todo) => {
      // Add one day to compensate for UTC storage
      const date = todo.dueDate ? 
        addDays(startOfDay(new Date(todo.dueDate)), 1) : null
      const dateKey = date ? format(date, 'yyyy-MM-dd') : 'no-date'
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(todo)
      return groups
    }, {} as Record<string, Todo[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
    if (a === 'no-date') return 1
    if (b === 'no-date') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-2">
          <div>
            <h3 className="text-sm font-medium">
              {dateKey === 'no-date' ? (
                'No Due Date'
              ) : isToday(new Date(dateKey)) ? (
                'Today'
              ) : (
                format(new Date(dateKey), 'EEEE, MMMM d')
              )}
            </h3>
            <Separator className="mt-2" />
          </div>
          <div>
            {groupedTodos[dateKey].map((todo, index) => (
              <div key={todo.id}>
                <TodoItem 
                  todo={todo} 
                  onComplete={fetchTodos}
                />
                {index < groupedTodos[dateKey].length - 1 && (
                  <Separator />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 