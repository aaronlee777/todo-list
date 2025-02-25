import { NextResponse } from "next/server"

export async function POST() {
  // Accept and log the request but don't do anything with it
  return NextResponse.json({ success: true })
} 