"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, Loader2, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    if (!username || !password || !confirmPassword) {
      setErrorMessage("All fields are required.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setErrorMessage("Username must be at least 3 characters long.")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5328/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("username", username)
        toast({
          title: "Account created successfully!",
          description: "Redirecting to your workspace...",
          variant: "default",
        })
        router.push("/newupload")
      } else {
        setErrorMessage(data.error || "Failed to create account.")
      }
    } catch (error) {
      setErrorMessage("Failed to connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 p-4">
      {/* Medical-themed decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full text-center mb-6 relative">
        <div className="inline-flex items-center justify-center mb-2">
          <BrainCircuit className="h-12 w-12 text-teal-400 mr-2" />
          <h1 className="text-5xl sm:text-6xl font-bold text-white">IntelliClinix</h1>
        </div>
        <p className="text-teal-200 text-lg">AI-Powered Medical Imaging Annotation</p>
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-teal-900/30 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
          <CardDescription className="text-teal-200 text-center">
            Join IntelliClinix to start annotating medical images
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-teal-300" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username (min 3 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white pl-10 focus-visible:ring-teal-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-teal-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white pl-10 focus-visible:ring-teal-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-teal-300" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white pl-10 focus-visible:ring-teal-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-teal-200 hover:text-white underline"
            >
              Already have an account? Sign in
            </button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 text-center text-teal-200/60 text-sm max-w-md">
        <p>MedNet uses advanced ML algorithms to enhance medical imaging annotation accuracy and efficiency.</p>
      </div>
    </div>
  )
}
