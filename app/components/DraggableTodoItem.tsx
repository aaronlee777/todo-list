"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TodoItem } from "./TodoItem"
import type { Todo } from "@/app/types/todo"

interface DraggableTodoItemProps {
  todo: Todo
  onComplete?: () => Promise<void>
  onUpdate: (updatedTodo: Partial<Todo> & { id: string }) => Promise<void>
}

export function DraggableTodoItem({ 
  todo, 
  onComplete, 
  onUpdate, 
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
    pointerEvents: isDragging ? 'none' as const : undefined,
  } as const;

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
      <TodoItem 
        todo={todo} 
        onComplete={onComplete}
        onUpdate={onUpdate}
      />
    </div>
  )
} 