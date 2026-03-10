"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Users, Activity, AlertTriangle, Settings, LogOut, CheckCircle2, ChevronRight, BarChart3, Bell } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 bottom-0 z-50 flex flex-col hidden md:flex">
                <div className="h-20 flex items-center px-6 border-b border-gray-800">
                    <Shield className="w-8 h-8 text-[#0066FF] mr-3" />
                    <span className="font-bold text-xl tracking-tight uppercase">Admin Panel</span>
                </div>

                <div className="flex-1 py-8 px-4 flex flex-col gap-2">
                    {[
                        { id: "overview", icon: Activity, label: "System Overview" },
                        { id: "users", icon: Users, label: "User Management" },
                        { id: "alerts", icon: AlertTriangle, label: "Security Alerts", badge: "3" },
                        { id: "reports", icon: BarChart3, label: "Analytics Reports" },
                        { id: "settings", icon: Settings, label: "Platform Settings" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors clip-diagonal-top-left ${activeTab === item.id
                                    ? "bg-[#0066FF] text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center">
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </div>
                            {item.badge && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/login" className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors clip-diagonal-top-left">
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                            <div className="w-10 h-10 bg-[#0066FF] clip-diagonal flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div className="hidden sm:block text-sm">
                                <p className="font-bold text-gray-900">Administrator</p>
                                <p className="text-gray-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: "Total Active Users", value: "2,543", change: "+12.5%", positive: true },
                            { label: "Threats Blocked", value: "14,092", change: "+5.1%", positive: true },
                            { label: "Critical Alerts", value: "3", change: "-2.4%", positive: true },
                            { label: "System Uptime", value: "99.99%", change: "0.00%", positive: true },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 border border-gray-200 clip-diagonal-top-left shadow-sm"
                            >
                                <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                    <span className={`text-sm font-semibold flex items-center ${stat.positive ? "text-green-600" : "text-red-600"}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2 bg-white border border-gray-200 p-6 clip-diagonal-top-left"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Recent System Activity</h2>
                                <button className="text-sm font-semibold text-[#0066FF] hover:text-blue-800">View All Log</button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { text: "Suspicious login attempt blocked from IP 192.168.1.1", time: "2 mins ago", type: "alert" },
                                    { text: "System daily backup completed successfully", time: "1 hour ago", type: "success" },
                                    { text: "New user 'TechCorp Solutions' registered", time: "3 hours ago", type: "info" },
                                    { text: "Database maintenance finished", time: "5 hours ago", type: "success" },
                                    { text: "Firewall rules updated by sysadmin", time: "1 day ago", type: "info" },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-[#0066FF]">
                                        <div className="mt-1">
                                            {log.type === "alert" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                            {log.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            {log.type === "info" && <Activity className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{log.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">{log.time}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-900 text-white border border-gray-800 p-6 clip-diagonal-top-left"
                        >
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[#0066FF]" />
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <button className="w-full bg-white/10 hover:bg-[#0066FF] transition-colors p-4 text-left text-sm font-semibold flex items-center justify-between group clip-diagonal-both">
                                    Run Security Scan
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full bg-white/10 hover:bg-[#0066FF] transition-colors p-4 text-left text-sm font-semibold flex items-center justify-between group clip-diagonal-both">
                                    Update Firewall Rules
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full bg-white/10 hover:bg-[#0066FF] transition-colors p-4 text-left text-sm font-semibold flex items-center justify-between group clip-diagonal-both">
                                    Add New Admin User
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full bg-white/10 hover:bg-[#0066FF] transition-colors p-4 text-left text-sm font-semibold flex items-center justify-between group clip-diagonal-both">
                                    Generate Month Report
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
