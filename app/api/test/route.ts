import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Try to connect to the database
    await prisma.$connect()
    
    // Try a simple query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      status: "ok",
      message: "Database connection successful",
      userCount 
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { 
        error: "Database connection failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 