"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Lock, User, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Simulate network delay
        setTimeout(() => {
            if (username === "admin" && password === "admin123") {
                router.push("/dashboard")
            } else {
                setError("Invalid username or password. Try admin/admin123")
                setIsLoading(false)
            }
        }, 800)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center flex-col items-center"
                >
                    <div className="w-32 h-32 relative mb-6 rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
                        <Image src="/images/logo.png" alt="Huristi Logo" fill className="object-cover" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{" "}
                        <Link href="/" className="font-medium text-[#0066FF] hover:text-blue-500 transition-colors">
                            return to home page
                        </Link>
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-white py-8 px-4 border border-gray-100 shadow-xl clip-diagonal-top-left sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-none shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-none shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-none bg-red-50 p-4 border border-red-200"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded-none cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-[#0066FF] hover:text-blue-500 transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent clip-diagonal text-sm font-medium text-white bg-[#0066FF] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066FF] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Authenticating..." : "Sign in"}
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="mt-6 text-xs text-center text-gray-500 border-t border-gray-100 pt-6">
                            <p>Demo Credentials:</p>
                            <div className="flex justify-center gap-4 border border-gray-200 py-2 mt-2 bg-gray-50">
                                <div><span className="font-semibold text-gray-700">Admin:</span> admin / admin123</div>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
