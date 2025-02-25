import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    // First check if test user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    })

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser
      return NextResponse.json({
        message: "Test user already exists",
        user: userWithoutPassword
      })
    }

    // Create test user if doesn't exist
    const hashedPassword = await bcrypt.hash("password123", 10)
    
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User"
      }
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      message: "Test user created",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Test User Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 