import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const todos = await prisma.todo.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Failed to fetch todos:", error)
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const { title, description, priority, dueDate } = json

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        dueDate,
        user: {
          connect: {
            email: session.user.email
          }
        }
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