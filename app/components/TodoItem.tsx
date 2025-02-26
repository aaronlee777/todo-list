"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CustomCheckbox } from "@/app/components/ui/custom-checkbox"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TodoItemProps {
  todo: {
    id: string
    title: string
    description?: string | null
    priority: string
    completed: boolean
  }
  onComplete?: () => void
}

export function TodoItem({ todo, onComplete }: TodoItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [completed, setCompleted] = useState(todo.completed)
  const [isVisible, setIsVisible] = useState(true)

  const priorityColors = {
    LOW: "bg-blue-100 text-blue-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  }

  async function handleComplete() {
    if (completed || isCompleting) return
    
    setIsCompleting(true)
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      setCompleted(true)
      // Start fade out
      setTimeout(() => {
        setIsVisible(false)
        // Wait for fade animation to complete before removing from list
        setTimeout(() => {
          onComplete?.()
        }, 300)
      }, 300)
    } catch (error: unknown) {
      toast.error("Failed to update todo")
      if (error instanceof Error) {
        console.error(error.message)
      }
      setIsCompleting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "flex items-start gap-4 py-3 transition-all duration-300",
      isCompleting && "opacity-0"
    )}>
      <CustomCheckbox
        checked={completed}
        onCheckedChange={handleComplete}
        className={cn(
          "transition-colors duration-300",
          isCompleting && "!border-green-500 !bg-green-500"
        )}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm">
            {todo.title}
          </h3>
          <Badge className={cn(priorityColors[todo.priority as keyof typeof priorityColors])}>
            {todo.priority}
          </Badge>
        </div>
        {todo.description && (
          <p className="text-sm text-gray-500">{todo.description}</p>
        )}
      </div>
    </div>
  )
} 