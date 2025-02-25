import { NextResponse } from "next/server"

// Handle all HTTP methods
export async function GET() {
  return NextResponse.json({ success: true })
}

export async function POST() {
  return NextResponse.json({ success: true })
}

export async function PUT() {
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}

export async function PATCH() {
  return NextResponse.json({ success: true })
}

// Add runtime directive
export const runtime = 'nodejs' 