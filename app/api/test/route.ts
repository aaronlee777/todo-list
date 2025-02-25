import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Try to connect and get user count
    const count = await prisma.user.count()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 