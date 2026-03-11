"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Lock, User, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/utils/supabase/client"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const normalizedName = name.trim()
        const normalizedEmail = email.trim().toLowerCase()

        // Validation
        if (!normalizedName) {
            setError("Name is required.")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsLoading(true)

        try {
            // Check if email already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', normalizedEmail)
                .maybeSingle()

            if (checkError) {
                setError(checkError.message || "Failed to validate account.")
                setIsLoading(false)
                return
            }

            if (existingUser) {
                setError("Email is already registered. Please sign in.")
                setIsLoading(false)
                return
            }

            // Insert into custom users table
            // Storing raw password for hackathon simplicity since it's custom auth
            // In production, this should be hashed via an API route!
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        name: normalizedName,
                        email: normalizedEmail,
                        devices: [],
                        password_hash: password
                    }
                ])

            if (insertError) {
                console.error("Insert error:", insertError)
                setError(insertError.message || "Failed to create account.")
                setIsLoading(false)
                return
            }

            setSuccess(true)
            setIsLoading(false)

            // Redirect to login after a moment
            setTimeout(() => router.push("/login"), 1800)

        } catch {
            setError("An unexpected error occurred.")
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
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-[#0066FF] hover:text-blue-500 transition-colors">
                            Sign in instead
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
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 py-6"
                        >
                            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 text-center">Account created successfully!</p>
                            <p className="text-xs text-gray-500 text-center">Redirecting you to sign in...</p>
                        </motion.div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSignup}>
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div className="mt-1 relative rounded-none shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
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
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
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
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative rounded-none shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="focus:ring-[#0066FF] focus:border-[#0066FF] block w-full pl-10 sm:text-sm border-gray-300 bg-gray-50 p-3 border outline-none transition-colors"
                                        placeholder="Repeat your password"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="rounded-none bg-red-50 p-4 border border-red-200"
                                >
                                    <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                                        <h3 className="ml-3 text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </motion.div>
                            )}

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent clip-diagonal text-sm font-medium text-white bg-[#0066FF] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066FF] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Creating account..." : "Create Account"}
                                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="text-xs text-center text-gray-400 border-t border-gray-100 pt-4">
                                Admin access is managed separately and cannot be registered here.
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
