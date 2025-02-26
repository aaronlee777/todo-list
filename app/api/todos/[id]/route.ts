import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let data = {}
    
    // Only try to parse body if content exists
    if (req.headers.get("content-length") !== "0") {
      data = await req.json()
    } else {
      // If no body, this is a completion request
      data = { completed: true }
    }

    const todo = await prisma.todo.update({
      where: {
        id: params.id,
        userId: session.user.id, // Make sure user owns the todo
      },
      data,
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Failed to update todo:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update todo" },
      { status: 500 }
    )
  }
} 