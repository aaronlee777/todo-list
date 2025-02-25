import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Welcome to TodoApp</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Stay organized and boost your productivity with our simple and effective todo list application.
      </p>
      <div className="space-x-4">
        <Link 
          href="/auth" 
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}
