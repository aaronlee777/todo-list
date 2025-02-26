"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CustomCheckbox } from "@/app/components/ui/custom-checkbox"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditDialog } from "./EditDialog"
import type { Todo } from "@/app/types/todo"
import { DeleteAlert } from "./DeleteAlert"

interface TodoItemProps {
  todo: Todo
  onComplete?: () => Promise<void>
  onUpdate: (updatedTodo: Partial<Todo> & { id: string }) => Promise<void>
}

export function TodoItem({ todo, onComplete, onUpdate }: TodoItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [completed, setCompleted] = useState(todo.completed)
  const [isVisible, setIsVisible] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: true })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update todo')
      }

      setCompleted(true)
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 300)
      }, 300)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update todo")
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
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <EditDialog 
        todo={todo}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onRefresh={onUpdate}
      />
      <DeleteAlert
        todoId={todo.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={onComplete || (() => Promise.resolve())}
      />
    </div>
  )
} 