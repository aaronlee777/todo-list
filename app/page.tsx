import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Todo App</h1>
        <p className="text-xl text-gray-600">
          A simple and efficient way to manage your tasks
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
