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
    const todo = await prisma.todo.update({
      where: {
        id: params.id,
      },
      data: {
        completed: true,
      },
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Failed to update todo:", error)
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    )
  }
} 