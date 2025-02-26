import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import DashboardClient from '@/app/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth')
  }

  return <DashboardClient session={session} />
} 