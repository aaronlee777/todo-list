import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { activeId, overId } = await req.json()

    // Get all todos for the current date to reorder
    const activeTodo = await prisma.todo.findUnique({
      where: { 
        id: activeId,
        user: {
          email: session.user.email
        }
      }
    })

    const overTodo = await prisma.todo.findUnique({
      where: { 
        id: overId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!activeTodo || !overTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    // Get all todos with the same date to update their order
    const todosInSameDate = await prisma.todo.findMany({
      where: {
        user: {
          email: session.user.email
        },
        dueDate: activeTodo.dueDate,
        completed: false
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Calculate new order
    const oldIndex = todosInSameDate.findIndex(t => t.id === activeId)
    const newIndex = todosInSameDate.findIndex(t => t.id === overId)

    // Move the todo to its new position
    const reorderedTodos = Array.from(todosInSameDate)
    reorderedTodos.splice(oldIndex, 1)
    reorderedTodos.splice(newIndex, 0, activeTodo)

    // Update all todos with their new order
    await prisma.$transaction(
      reorderedTodos.map((todo, index) => 
        prisma.todo.update({
          where: { id: todo.id },
          data: { order: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder todos:", error)
    return NextResponse.json(
      { error: "Failed to reorder todos" },
      { status: 500 }
    )
  }
} 