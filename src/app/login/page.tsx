"use client"

import Image from "next/image";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/utils/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const normalizedEmail = email.trim().toLowerCase()

            const { data: user, error: queryError } = await supabase
                .from('users')
                .select('id, email, password_hash, name, devices')
                .eq('email', normalizedEmail)
                .maybeSingle()

            if (queryError || !user) {
                setError("Invalid email address or password.")
                setIsLoading(false)
                return
            }

            if (user.password_hash !== password) {
                setError("Invalid email address or password.")
                setIsLoading(false)
                return
            }

            // Set auth session
            localStorage.setItem("huristi_session", JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                devices: Array.isArray(user.devices) ? user.devices : [],
                role: "user",
                loggedInAt: Date.now(),
            }))

            router.push("/dashboard")

        } catch {
            setError("An unexpected error occurred during login.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center flex-col items-center"
                >
                    <div className="w-16 h-16 bg-[#0066FF] clip-diagonal flex items-center justify-center mb-6">
                        <Image src="/images/logo.png" alt="Huristi Logo" width={32} height={32} className="w-8 h-8" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-medium text-[#0066FF] hover:text-blue-500 transition-colors">
                            Create one now
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-none shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                    placeholder="you@company.com"
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
                                <Link href="/signup" className="font-medium text-[#0066FF] hover:text-blue-500 transition-colors">
                                    Register instead
                                </Link>
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
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
