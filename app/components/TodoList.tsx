"use client"

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from "react"
import { format } from "date-fns"
import { DndContext, DragEndEvent, closestCenter, useSensors, useSensor, PointerSensor, DragOverlay, DragStartEvent, MeasuringStrategy, DragOverEvent, pointerWithin, Modifier, Active, Over } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { DraggableTodoItem } from "./DraggableTodoItem"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { DragOverlayItem } from "./DragOverlayItem"
import type { Transform } from "@dnd-kit/core"

interface Todo {
  id: string
  title: string
  description?: string | null
  priority: string
  dueDate?: Date | null
  completed: boolean
}

// Types can stay at the top level
type SortingState = {
  activeId: string | null;
  overId: string | null;
  activeRect?: DOMRect | null;
  overRect?: DOMRect | null;
};

type Position = {
  x: number;
  y: number;
};

type DragState = {
  initialParent: string | null;
  currentParent: string | null;
};

// Add this type for section-based todos
type SectionTodos = Record<string, Todo[]>;

export interface TodoListRef {
  refresh: () => Promise<void>
}

const measuringStrategy = {
  strategy: MeasuringStrategy.Always
}

// Move findContainer outside the component
function createFindContainer(todos: Todo[]) {
  return function findContainer(todoId: string) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return null;
    
    return todo.dueDate 
      ? new Date(todo.dueDate).toISOString().split('T')[0]
      : 'no-date';
  };
}

export const TodoList = forwardRef<TodoListRef>((_, ref) => {
  const { data: session, status } = useSession();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    initialParent: null,
    currentParent: null,
  });
  const [sorting, setSorting] = useState<SortingState>({
    activeId: null,
    overId: null,
    activeRect: null,
    overRect: null,
  });

  console.log("TodoList Session:", { session, status })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Memoize the findContainer function
  const findContainer = useMemo(() => createFindContainer(todos), [todos]);

  const fetchTodos = useCallback(async () => {
    if (!session) {
      console.log("No session available")
      return
    }

    try {
      const response = await fetch('/api/todos', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch todos');
      }

      setTodos(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const todo = todos.find(t => t.id === event.active.id);
    setActiveTodo(todo || null);
    
    const container = findContainer(event.active.id.toString());
    setDragState({
      initialParent: container,
      currentParent: container,
    });
  }, [todos, findContainer]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id.toString();
    const overContainer = overId.startsWith('droppable-') 
      ? overId.replace('droppable-', '') 
      : findContainer(overId);

    setDragState(prev => ({
      ...prev,
      currentParent: overContainer,
    }));

    setSorting({
      activeId: active.id.toString(),
      overId: overId,
      activeRect: active.rect.current,
      overRect: over.rect,
    });
  }, [findContainer]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const activeContainer = findContainer(activeId);
    const overContainer = overId.startsWith('droppable-') 
      ? overId.replace('droppable-', '')
      : findContainer(overId);
    
    if (!activeContainer || !overContainer) return;

    // Store current state for rollback
    const previousTodos = [...todos];

    try {
      // Update UI immediately
      setTodos(prev => {
        const newTodos = [...prev];
        const oldIndex = newTodos.findIndex(t => t.id === activeId);
        const newIndex = overId.startsWith('droppable-')
          ? newTodos.length
          : newTodos.findIndex(t => t.id === overId);

        if (oldIndex !== -1) {
          const [item] = newTodos.splice(oldIndex, 1);
          if (overContainer !== activeContainer) {
            item.dueDate = overContainer === 'no-date' ? null : new Date(overContainer);
          }
          newTodos.splice(newIndex, 0, item);
        }

        return newTodos;
      });

      // Make API call after UI update
      if (activeContainer !== overContainer) {
        const response = await fetch(`/api/todos/${activeId}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetDate: overContainer === 'no-date' ? null : overContainer,
            overId: overId.startsWith('droppable-') ? null : overId,
          }),
        });

        if (!response.ok) throw new Error('Failed to move todo');
      } else if (!overId.startsWith('droppable-')) {
        const response = await fetch('/api/todos/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeId, overId }),
        });

        if (!response.ok) throw new Error('Failed to reorder todos');
      }
    } catch (error) {
      // Revert to previous state on error
      setTodos(previousTodos);
      toast.error("Failed to update todos");
      console.error('Update error:', error);
    }

    // Reset states
    setActiveTodo(null);
    setSorting({
      activeId: null,
      overId: null,
      activeRect: null,
      overRect: null,
    });
    setDragState({
      initialParent: null,
      currentParent: null,
    });
  }, [todos, findContainer]);

  // Expose the refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchTodos
  }), [fetchTodos])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Add DroppableSection component inside TodoList
  function DroppableSection({ dateKey, children }: { dateKey: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
      id: `droppable-${dateKey}`,
      data: { dateKey },
    });

    return (
      <div ref={setNodeRef}>
        {children}
      </div>
    );
  }

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

  // Group todos by date in the render function
  const groupedTodos = todos
    .filter(todo => !todo.completed)
    .reduce((groups, todo) => {
      const dateKey = todo.dueDate 
        ? new Date(todo.dueDate).toISOString().split('T')[0]
        : 'no-date';
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(todo);
      return groups;
    }, {} as Record<string, Todo[]>);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {Object.keys(groupedTodos).map((dateKey) => {
          const dateTodos = groupedTodos[dateKey];

          return (
            <div key={dateKey} className="space-y-2">
              <div>
                <h3 className="text-sm font-medium">
                  {dateKey === 'no-date' ? (
                    'No Due Date'
                  ) : dateKey === 'today' ? (
                    'Today'
                  ) : (
                    format(new Date(`${dateKey}T12:00:00.000Z`), 'EEEE, MMMM d')
                  )}
                </h3>
                <Separator className="mt-2" />
              </div>
              <DroppableSection dateKey={dateKey}>
                <SortableContext 
                  items={dateTodos.map(todo => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div>
                    {dateTodos.map((todo, index) => {
                      const isLastItem = index === dateTodos.length - 1;
                      const isOverThisItem = sorting.overId === todo.id && dragState.currentParent === dateKey;
                      const isOverSection = sorting.overId === `droppable-${dateKey}`;
                      
                      const showGap = (() => {
                        if (!isOverThisItem && !isOverSection) return null;
                        if (isOverSection && isLastItem) return 'after';
                        if (!isOverThisItem || sorting.activeId === todo.id) return null;

                        const activeRect = sorting.activeRect;
                        const overRect = sorting.overRect;
                        if (!activeRect || !overRect) return null;

                        const activeCenter = activeRect.top + activeRect.height / 2;
                        const overCenter = overRect.top + overRect.height / 2;
                        
                        return activeCenter < overCenter ? 'before' : 'after';
                      })();

                      return (
                        <div key={`${dateKey}-${todo.id}${dragState.currentParent === dateKey ? '-current' : ''}`}>
                          {showGap === 'before' && (
                            <div style={{ height: '72px' }} />
                          )}
                          <div 
                            style={{
                              display: dragState.initialParent === dateKey && 
                                      dragState.currentParent !== dateKey && 
                                      activeTodo?.id === todo.id ? 'none' : undefined
                            }}
                          >
                            <DraggableTodoItem 
                              todo={todo} 
                              onComplete={fetchTodos}
                              showSeparator={!isLastItem}
                            />
                          </div>
                          {showGap === 'after' && (
                            <div style={{ height: '72px' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SortableContext>
              </DroppableSection>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTodo && (
          <div 
            style={{ 
              width: 'calc(100vw - 2rem)', 
              maxWidth: '42rem',
              cursor: 'grabbing',
              transform: 'rotate(2deg)',
            }}
          >
            <DragOverlayItem todo={activeTodo} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
})

TodoList.displayName = 'TodoList' 