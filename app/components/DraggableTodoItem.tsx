"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TodoItem } from "./TodoItem"
import type { Todo } from "@/types/todo"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"

interface DraggableTodoItemProps {
  todo: Todo
  onComplete?: () => Promise<void>
  showSeparator?: boolean
  isRecentlyPlaced?: boolean
}

export function DraggableTodoItem({ 
  todo, 
  onComplete, 
  showSeparator = false,
  isRecentlyPlaced = false
}: DraggableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      section: todo.dueDate ? 
        new Date(todo.dueDate).toISOString().split('T')[0] : 
        'no-date'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: [
      transition,
      'background-color 0.3s ease-in-out',
      'transform 0.3s ease-in-out'
    ].join(', '),
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? 'none' : undefined,
    backgroundColor: isRecentlyPlaced ? 'var(--highlight-color)' : undefined,
    transform: isRecentlyPlaced ? 'scale(1.02)' : CSS.Transform.toString(transform),
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      data-id={todo.id}
      data-section={todo.dueDate ? 
        new Date(todo.dueDate).toISOString().split('T')[0] : 
        'no-date'
      }
      className="rounded-lg transition-all"
    >
      <TodoItem todo={todo} onComplete={onComplete} />
      {showSeparator && <Separator />}
    </div>
  )
} 