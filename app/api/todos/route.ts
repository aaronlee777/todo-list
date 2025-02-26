import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"
import { startOfDay, parseISO } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("API GET Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log("API: No user ID in session")
      return NextResponse.json(
        { error: "Unauthorized", details: "No user ID in session" }, 
        { status: 401 }
      )
    }

    try {
      const userId = session.user.id
      const todos = await prisma.todo.findMany({
        where: {
          userId: userId,
          completed: false
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          dueDate: true,
          completed: true,
          order: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: [
          { dueDate: 'asc' },
          { order: 'asc' }
        ]
      })

      return NextResponse.json(todos)
    } catch (dbError) {
      console.error("Database Error:", dbError)
      return NextResponse.json(
        { 
          error: "Database error", 
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Failed to fetch todos:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch todos",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Create Todo - Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log("Create Todo - No user ID in session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const { title, description, priority, dueDate } = json

    console.log('API - Received date:', { dueDate })

    let adjustedDueDate = null
    if (dueDate) {
      adjustedDueDate = new Date(dueDate)
    }

    try {
      // Get all todos for the same date to determine order
      const todosForDate = await prisma.todo.findMany({
        where: {
          userId: session.user.id,
          dueDate: adjustedDueDate,
          completed: false
        },
        orderBy: {
          order: 'desc'
        }
      })

      const newOrder = todosForDate.length > 0 ? todosForDate[0].order + 1 : 0

      const todo = await prisma.todo.create({
        data: {
          title,
          description,
          priority,
          dueDate: adjustedDueDate,
          order: newOrder,
          userId: session.user.id
        }
      })

      console.log('Successfully created todo:', todo)
      return NextResponse.json(todo)
    } catch (dbError) {
      console.error("Database Error:", dbError)
      return NextResponse.json(
        { 
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Failed to create todo:", error)
    return NextResponse.json(
      { 
        error: "Failed to create todo",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 