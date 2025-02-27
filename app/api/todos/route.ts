import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"


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
          createdAt: true,
          updatedAt: true
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' }
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, priority, dueDate } = await req.json()

    const todosForDate = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      orderBy: { order: 'desc' },
      take: 1
    })

    const newOrder = todosForDate.length > 0 ? todosForDate[0].order + 1 : 0

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || "LOW",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
        order: newOrder
      }
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Failed to create todo:", error)
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    )
  }
} 