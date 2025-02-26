"use client";

import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { format } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableTodoItem } from "./DraggableTodoItem";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDroppable } from "@dnd-kit/core";
import { DragOverlayItem } from "./DragOverlayItem";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TodoDialog } from "./TodoDialog";
import type { ClientRect } from "@dnd-kit/core";

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: Date | null;
  completed: boolean;
}

// Types can stay at the top level
type SortingState = {
  activeId: string | null;
  overId: string | null;
  activeRect?: {
    initial: ClientRect | null;
    translated: ClientRect | null;
  } | null;
  overRect?: ClientRect | null;
};

type DragState = {
  initialParent: string | null;
  currentParent: string | null;
};

export interface TodoListRef {
  refresh: () => Promise<void>;
}

// Move findContainer outside the component
function createFindContainer(todos: Todo[]) {
  return function findContainer(todoId: string) {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return null;

    return todo.dueDate
      ? new Date(todo.dueDate).toISOString().split("T")[0]
      : "no-date";
  };
}

// Move DroppableSection outside TodoList component
function DroppableSection({
  dateKey,
  children,
}: {
  dateKey: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: `droppable-${dateKey}`,
    data: { dateKey },
  });

  return <div ref={setNodeRef}>{children}</div>;
}

// Add this common card structure
function TodoListCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full mx-auto transition-opacity duration-200">
      {children}
    </Card>
  );
}

export const TodoList = forwardRef<TodoListRef>((_, ref) => {
  const { data: session } = useSession();
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
  const dialogRef = useRef<{ showModal: () => void }>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Memoize the findContainer function
  const findContainer = useMemo(() => createFindContainer(todos), [todos]);

  // Memoize fetchTodos with proper dependencies
  const fetchTodos = useCallback(async () => {
    if (!session) {
      setTodos([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/todos", {
        credentials: "include",
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to fetch todos");
      }

      const todosWithDates = data.map((todo: Todo) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null
      }));

      setTodos(todosWithDates);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const todo = todos.find((t) => t.id === event.active.id);
      setActiveTodo(todo || null);

      const container = findContainer(event.active.id.toString());
      setDragState({
        initialParent: container,
        currentParent: container,
      });
    },
    [todos, findContainer]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const overId = over.id.toString();
      const overContainer = overId.startsWith("droppable-")
        ? overId.replace("droppable-", "")
        : findContainer(overId);

      // Combine state updates into a single batch
      const newState = {
        dragState: {
          initialParent: dragState.initialParent,
          currentParent: overContainer,
        },
        sorting: {
          activeId: active.id.toString(),
          overId: overId,
          activeRect: active.rect.current,
          overRect: over.rect,
        },
      };

      // Update both states at once
      setDragState(newState.dragState);
      setSorting(newState.sorting);
    },
    [findContainer, dragState.initialParent]
  ); // Add dragState.initialParent as dependency

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id.toString();
      const overId = over.id.toString();

      const activeContainer = findContainer(activeId);
      const overContainer = overId.startsWith("droppable-")
        ? overId.replace("droppable-", "")
        : findContainer(overId);

      if (!activeContainer || !overContainer) return;

      // Store current state for rollback
      const previousTodos = [...todos];

      try {
        // Update UI immediately
        setTodos((prev) => {
          const newTodos = [...prev];
          const oldIndex = newTodos.findIndex((t) => t.id === activeId);
          const newIndex = overId.startsWith("droppable-")
            ? newTodos.length
            : newTodos.findIndex((t) => t.id === overId);

          if (oldIndex !== -1) {
            const [item] = newTodos.splice(oldIndex, 1);
            if (overContainer !== activeContainer) {
              item.dueDate =
                overContainer === "no-date"
                  ? null
                  : new Date(`${overContainer}T12:00:00.000Z`);
            }
            newTodos.splice(newIndex, 0, item);
          }

          return newTodos;
        });

        // Make API call after UI update
        if (activeContainer !== overContainer) {
          const response = await fetch(`/api/todos/${activeId}/move`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetDate:
                overContainer === "no-date"
                  ? null
                  : new Date(`${overContainer}T12:00:00.000Z`).toISOString(),
              overId: overId.startsWith("droppable-") ? null : overId,
            }),
          });

          if (!response.ok) throw new Error("Failed to move todo");
        } else if (!overId.startsWith("droppable-")) {
          const response = await fetch("/api/todos/reorder", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activeId, overId }),
          });

          if (!response.ok) throw new Error("Failed to reorder todos");
        }
      } catch (error) {
        // Revert to previous state on error
        setTodos(previousTodos);
        toast.error("Failed to update todos");
        console.error("Update error:", error);
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
    },
    [todos, findContainer]
  );

  // Add a new function to handle todo updates
  const handleTodoUpdate = useCallback(async (updatedTodo: Partial<Todo> & { id: string }) => {
    // Update local state first
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id 
        ? { ...todo, ...updatedTodo, completed: todo.completed }
        : todo
    ));
    // Then fetch fresh data
    await fetchTodos();
  }, [fetchTodos]);

  // Expose the refresh method via ref
  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchTodos,
    }),
    [fetchTodos]
  );

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <TodoListCard>
        <CardContent className="space-y-4 pt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg border border-gray-200 animate-pulse"
            />
          ))}
        </CardContent>
      </TodoListCard>
    );
  }

  // Calculate active todos count here
  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  if (activeTodosCount === 0) {
    return (
      <TodoListCard>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>You have no tasks</CardTitle>
          <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
            <Plus className="h-4 w-4" />
            Add new todo
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Create your first todo!</p>
        </CardContent>
        <TodoDialog ref={dialogRef} onRefresh={fetchTodos} />
      </TodoListCard>
    );
  }

  // Group todos and continue with the rest of the component
  const groupedTodos = todos.reduce((groups, todo) => {
    if (!todo.completed) {
      const dateKey = todo.dueDate
        ? new Date(todo.dueDate).toISOString().split('T')[0]
        : 'no-date';

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(todo);
    }
    return groups;
  }, {} as Record<string, Todo[]>);

  return (
    <TodoListCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          You have {activeTodosCount} task{activeTodosCount !== 1 ? "s" : ""}
        </CardTitle>
        <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
          <Plus className="h-4 w-4" />
          Add new todo
        </Button>
      </CardHeader>
      <Separator />
      <CardContent>
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
                      {dateKey === "no-date"
                        ? "No Due Date"
                        : dateKey === "today"
                        ? "Today"
                        : format(
                            new Date(`${dateKey}T12:00:00.000Z`),
                            "EEEE, MMMM d"
                          )}
                    </h3>
                    <Separator className="mt-2" />
                  </div>
                  <DroppableSection dateKey={dateKey}>
                    <SortableContext
                      items={dateTodos.map((todo) => todo.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div>
                        {dateTodos.map((todo, index) => {
                          const isLastItem = index === dateTodos.length - 1;
                          const isOverThisItem =
                            sorting.overId === todo.id &&
                            dragState.currentParent === dateKey;
                          const isOverSection =
                            sorting.overId === `droppable-${dateKey}`;

                          const showGap = (() => {
                            if (!isOverThisItem && !isOverSection) return null;
                            if (isOverSection && isLastItem) return "after";
                            if (!isOverThisItem || sorting.activeId === todo.id)
                              return null;

                            const activeRect = sorting.activeRect;
                            const overRect = sorting.overRect;
                            if (!activeRect?.initial || !overRect) return null;

                            const activeCenter = activeRect.initial.top + activeRect.initial.height / 2;
                            const overCenter = overRect.top + overRect.height / 2;

                            return activeCenter < overCenter ? "before" : "after";
                          })();

                          return (
                            <div
                              key={`${dateKey}-${todo.id}${
                                dragState.currentParent === dateKey
                                  ? "-current"
                                  : ""
                              }`}
                            >
                              {showGap === "before" && (
                                <div style={{ height: "72px" }} />
                              )}
                              <div
                                style={{
                                  display:
                                    dragState.initialParent === dateKey &&
                                    dragState.currentParent !== dateKey &&
                                    activeTodo?.id === todo.id
                                      ? "none"
                                      : undefined,
                                  opacity: todo.completed ? 0 : 1,
                                  transition: "opacity 150ms ease-in-out",
                                }}
                              >
                                <DraggableTodoItem
                                  todo={todo}
                                  onComplete={() => {
                                    // Update local state only
                                    setTodos(prev => prev.map(t => 
                                      t.id === todo.id ? { ...t, completed: true } : t
                                    ))
                                    return Promise.resolve()
                                  }}
                                  onUpdate={handleTodoUpdate}
                                />
                                {!isLastItem && !todo.completed && (
                                  <Separator />
                                )}
                              </div>
                              {showGap === "after" && (
                                <div style={{ height: "72px" }} />
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
                  width: "calc(100vw - 2rem)",
                  maxWidth: "64rem",
                  cursor: "grabbing",
                  transform: "rotate(2deg)",
                }}
              >
                <DragOverlayItem todo={activeTodo} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </CardContent>
      <TodoDialog ref={dialogRef} onRefresh={fetchTodos} />
    </TodoListCard>
  );
});

TodoList.displayName = "TodoList";
