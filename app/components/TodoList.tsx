"use client"

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { format, isToday, startOfDay, addDays } from "date-fns"
import { DndContext, DragEndEvent, closestCenter, DragOverlay, useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { DraggableTodoItem } from "./DraggableTodoItem"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface Todo {
  id: string
  title: string
  description?: string | null
  priority: string
  dueDate?: Date | null
  completed: boolean
}

// Create a new DroppableSection component
function DroppableSection({ dateKey, children }: { dateKey: string, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${dateKey}`,
    data: { dateKey },
  })

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "min-h-[2rem] transition-colors",
        isOver && "bg-muted/50"
      )}
    >
      {children}
    </div>
  )
}

export interface TodoListRef {
  refresh: () => Promise<void>
}

export const TodoList = forwardRef<TodoListRef>((_, ref) => {
  const { data: session, status } = useSession()
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  console.log("TodoList Session:", { session, status })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchTodos = useCallback(async () => {
    if (!session) {
      console.log("No session available")
      return
    }

    try {
      console.log("Fetching todos with session:", session)
      const response = await fetch('/api/todos', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error("API Error:", data)
        throw new Error(data.error || data.details || 'Failed to fetch todos')
      }

      setTodos(data)
    } catch (error: unknown) {
      console.error("Fetch error:", error)
      toast.error("Failed to load todos")
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Expose the refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchTodos
  }), [fetchTodos])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  if (!session) {
    return null
  }

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
      if (!todo.dueDate) {
        if (!groups['no-date']) {
          groups['no-date'] = []
        }
        groups['no-date'].push(todo)
        return groups
      }

      const date = new Date(todo.dueDate)
      const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
      
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

  // Create today's date key in the same format we use for grouping
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()
    
    // Find the containers
    const activeContainer = findContainer(activeId)
    const overContainer = overId.startsWith('droppable-') 
      ? overId.replace('droppable-', '')
      : findContainer(overId)
    
    if (!activeContainer || !overContainer) return

    // If moving to a different date
    if (activeContainer !== overContainer) {
      try {
        const targetDate = overContainer === 'no-date' ? null : overContainer

        const response = await fetch(`/api/todos/${activeId}/move`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetDate,
          }),
        })

        const responseData = await response.json()
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to move todo')
        }

        await fetchTodos()
      } catch (error) {
        toast.error("Failed to move todo")
        console.error('Move error:', error)
      }
    }
    // If reordering within the same date section
    else if (!overId.startsWith('droppable-')) {
      try {
        const response = await fetch('/api/todos/reorder', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activeId,
            overId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to reorder todos')
        }

        // Update local state for immediate feedback
        const oldIndex = groupedTodos[activeContainer].findIndex(t => t.id === activeId)
        const newIndex = groupedTodos[activeContainer].findIndex(t => t.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newTodos = [...todos]
          const activeDate = groupedTodos[activeContainer]
          const reorderedDate = arrayMove(activeDate, oldIndex, newIndex)
          
          const updatedTodos = newTodos.map(todo => {
            const reorderedTodo = reorderedDate.find(t => t.id === todo.id)
            return reorderedTodo || todo
          })

          setTodos(updatedTodos)
        }
      } catch (error) {
        toast.error("Failed to reorder todos")
        console.error('Reorder error:', error)
        // Refresh to ensure correct order
        await fetchTodos()
      }
    }
  }

  // Helper function to find which date container a todo belongs to
  function findContainer(todoId: string) {
    for (const [dateKey, dateTodos] of Object.entries(groupedTodos)) {
      if (dateTodos.find(todo => todo.id === todoId)) {
        return dateKey
      }
    }
    return null
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-2">
            <div>
              <h3 className="text-sm font-medium">
                {dateKey === 'no-date' ? (
                  'No Due Date'
                ) : dateKey === todayKey ? (
                  'Today'
                ) : (
                  format(new Date(`${dateKey}T12:00:00.000Z`), 'EEEE, MMMM d')
                )}
              </h3>
              <Separator className="mt-2" />
            </div>
            <DroppableSection dateKey={dateKey}>
              <SortableContext 
                items={groupedTodos[dateKey].map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {groupedTodos[dateKey].map((todo, index) => (
                    <div key={todo.id}>
                      <DraggableTodoItem 
                        todo={todo} 
                        onComplete={fetchTodos}
                      />
                      {index < groupedTodos[dateKey].length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DroppableSection>
          </div>
        ))}
      </div>
    </DndContext>
  )
})

TodoList.displayName = 'TodoList' 