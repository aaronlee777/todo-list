"use client"

import { Session } from "next-auth"

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session.user?.name || 'User'}</h1>
          <p className="text-gray-600">{session.user?.email}</p>
        </div>
        <div className="grid gap-6">
          {/* Todo list will go here */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No todos yet. Create your first todo!</p>
          </div>
        </div>
      </div>
    </main>
  )
} 