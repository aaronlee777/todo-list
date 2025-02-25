import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const testConnection = await prisma.$connect()
    
    // Get some basic stats
    const userCount = await prisma.user.count()
    const sessionCount = await prisma.session.count()
    
    return NextResponse.json({
      status: 'connected',
      stats: {
        users: userCount,
        sessions: sessionCount
      }
    })
  } catch (error) {
    console.error('Database Connection Error:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 