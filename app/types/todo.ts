export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: Date | null;
  completed: boolean;
} 