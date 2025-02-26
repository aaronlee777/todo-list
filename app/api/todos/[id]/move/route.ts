import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"
import { parseISO, startOfDay } from "date-fns"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const { targetDate } = json

    // Ensure the todo belongs to the user
    const todo = await prisma.todo.findUnique({
      where: {
        id: params.id,
        user: {
          email: session.user.email
        }
      },
    })

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    // Handle date conversion
    const adjustedDueDate = targetDate ? 
      startOfDay(parseISO(targetDate)) : null

    const updatedTodo = await prisma.todo.update({
      where: {
        id: params.id,
      },
      data: {
        dueDate: adjustedDueDate,
      },
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Failed to move todo:", error)
    return NextResponse.json(
      { error: "Failed to move todo", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 