import React from "react"
import Header from "@/app/components/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {children}
      </main>
    </div>
  )
} 