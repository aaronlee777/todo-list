"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TodoItem } from "./TodoItem"
import type { Todo } from "@/types/todo"

interface DraggableTodoItemProps {
  todo: Todo
  onComplete?: () => void
}

export function DraggableTodoItem({ todo, onComplete }: DraggableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoItem todo={todo} onComplete={onComplete} />
    </div>
  )
} 