"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-end">
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    </header>
  )
} 