import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { SessionProvider } from "@/app/providers/SessionProvider"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Todo App",
  description: "A simple todo application",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
