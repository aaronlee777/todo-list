"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TodoItemProps {
  todo: {
    id: string
    title: string
    description?: string | null
    priority: string
    dueDate?: Date | null
    completed: boolean
  }
}

export function TodoItem({ todo }: TodoItemProps) {
  const priorityColors = {
    LOW: "bg-blue-100 text-blue-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  }

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{todo.title}</h3>
          <Badge className={cn(priorityColors[todo.priority as keyof typeof priorityColors])}>
            {todo.priority}
          </Badge>
        </div>
        {todo.description && (
          <p className="text-sm text-gray-500">{todo.description}</p>
        )}
        {todo.dueDate && (
          <p className="text-xs text-gray-500">
            Due: {format(new Date(todo.dueDate), "PPP")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={todo.completed}
          className="h-4 w-4 rounded border-gray-300"
          onChange={() => {
            // We'll implement this later
            console.log("Toggle todo:", todo.id)
          }}
        />
      </div>
    </div>
  )
} 