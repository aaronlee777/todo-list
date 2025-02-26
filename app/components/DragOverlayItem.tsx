"use client"

import { TodoItem } from "./TodoItem"
import type { Todo } from "@/types/todo"

export function DragOverlayItem({ todo }: { todo: Todo }) {
  return (
    <div className="bg-background border rounded-lg shadow-lg p-2">
      <TodoItem todo={todo} />
    </div>
  )
} 