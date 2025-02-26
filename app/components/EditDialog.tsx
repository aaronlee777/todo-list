"use client"

import { useState, forwardRef } from "react"
import { DatePicker } from "@/app/components/DatePicker"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Todo } from "@/app/types/todo"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.date().nullable(),
})

type TodoFormValues = z.infer<typeof formSchema>

interface EditDialogProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: (updatedTodo: Partial<Todo> & { id: string }) => Promise<void>;
}

export function EditDialog({ todo, open, onOpenChange, onRefresh }: EditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority as "LOW" | "MEDIUM" | "HIGH",
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    },
  })

  async function onSubmit(data: TodoFormValues) {
    setIsLoading(true)
    try {
      const updatedTodo = {
        id: todo.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate?.toISOString(),
      }

      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      })

      if (!response.ok) throw new Error('Failed to update todo')

      await onRefresh(updatedTodo)
      
      toast.success("Todo updated successfully")
      onOpenChange(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error("Failed to update todo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter todo title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker 
                      date={field.value} 
                      onSelect={(date) => {
                        if (!date) {
                          field.onChange(null)
                          return
                        }
                        
                        // Set to noon UTC to avoid timezone issues
                        const adjustedDate = new Date(Date.UTC(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          12, 0, 0, 0
                        ))
                        
                        field.onChange(adjustedDate)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Todo"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 