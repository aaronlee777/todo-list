import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import React from "react"
import Header from "@/app/components/Header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
} 