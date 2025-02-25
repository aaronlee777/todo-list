import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../[...nextauth]/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
      authenticated: !!session,
      session,
    })
  } catch (error) {
    console.error('Session Test Error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
} 