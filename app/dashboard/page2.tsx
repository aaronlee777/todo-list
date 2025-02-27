import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import DashboardClient from "./DashboardClient"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <DashboardClient />
} 