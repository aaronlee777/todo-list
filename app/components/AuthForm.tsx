"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    try {
      if (isLogin) {
        console.group('Login Attempt')
        console.log('Email:', data.email)
        
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        }).catch(err => {
          console.error('SignIn Error:', err)
          return null
        })

        console.log('SignIn Result:', result)

        if (!result) {
          const error = 'Authentication failed - no result'
          console.error(error)
          setError(error)
          console.groupEnd()
          return
        }

        if (result.error) {
          console.error('SignIn Error:', result.error)
          setError(result.error)
          console.groupEnd()
          return
        }

        if (result.ok) {
          console.log('Login successful, redirecting...')
          console.groupEnd()
          // Add delay before redirect
          await new Promise(resolve => setTimeout(resolve, 1000))
          window.location.href = '/dashboard'
          return
        }
        console.groupEnd()
      } else {
        // Registration
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name || undefined
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || "Registration failed")
        }

        // Auto-login after registration
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        if (result?.ok) {
          // Force navigation and refresh
          window.location.href = '/dashboard'
          return
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      console.error("Auth Error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full"
          disabled={isLoading}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </Button>
      </CardFooter>
    </Card>
  )
}