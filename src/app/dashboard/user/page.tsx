"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, ShieldCheck, Lock, Globe, Bell, LogOut, CheckCircle, ChevronRight, Download, Server } from "lucide-react"
import Link from "next/link"

export default function UserDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Top Navbar */}
            <header className="bg-white border-b border-gray-200 h-20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-[#0066FF]" />
                        <span className="font-bold text-xl tracking-tight">Cybery Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="w-10 h-10 bg-gray-100 clip-diagonal flex items-center justify-center text-gray-900 font-bold border border-gray-200">
                                U
                            </div>
                            <div className="hidden sm:block text-sm">
                                <p className="font-bold text-gray-900">John User</p>
                                <p className="text-[#0066FF]">Standard Account</p>
                            </div>
                            <Link href="/login" className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 border border-gray-200 clip-diagonal">
                                <LogOut className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Welcome back, John</h1>
                        <p className="text-gray-500 mt-1">Here is the security status of your registered services.</p>
                    </div>
                    <button className="bg-[#0066FF] text-white px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition-colors clip-diagonal flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Security Report
                    </button>
                </div>

                {/* Global Security Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 text-white p-8 lg:p-12 mb-8 relative overflow-hidden clip-diagonal-top-left flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    {/* Abstract background lines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute transform rotate-45 border-t border-white/40 w-full top-1/4 -left-1/4"></div>
                        <div className="absolute transform -rotate-45 border-t border-white/40 w-full top-3/4 -right-1/4"></div>
                        <div className="absolute transform rotate-12 border-t border-white/20 w-full top-1/2 left-0"></div>
                    </div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center bg-gray-800 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <span className="text-3xl font-black">98</span><span className="text-lg font-bold text-green-500">%</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                                Overall Security Score <ShieldCheck className="w-6 h-6 text-green-500" />
                            </h2>
                            <p className="text-gray-400">Your network infrastructure is well protected.</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 w-full md:w-auto">
                        <div className="bg-white/10 p-4 flex-1 md:w-32 text-center border border-white/10">
                            <p className="text-3xl font-bold mb-1 text-white">0</p>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Threats</p>
                        </div>
                        <div className="bg-white/10 p-4 flex-1 md:w-32 text-center border border-white/10">
                            <p className="text-3xl font-bold mb-1 text-white">4</p>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Protected Assets</p>
                        </div>
                    </div>
                </motion.div>

                {/* Active Services */}
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#0066FF]" /> Your Monitored Assets
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                        { name: "Main Website Network", type: "Web Defense", icon: Globe, status: "Secure", ip: "192.168.0.100" },
                        { name: "Customer Database", type: "Data Encryption", icon: Lock, status: "Secure", ip: "Internal" },
                        { name: "Cloud Storage Bucket", type: "Cloud Security", icon: Server, status: "Secure", ip: "AWS-East-1" },
                    ].map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-transform hover:-translate-y-1 relative group clip-diagonal-top-left"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-blue-50 text-[#0066FF] clip-diagonal flex items-center justify-center">
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 font-bold rounded-full flex items-center gap-1 border border-green-200">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {service.status}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h4>
                            <p className="text-sm text-gray-500 font-medium mb-4">{service.type}</p>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-mono text-xs">{service.ip}</span>
                                <button className="text-[#0066FF] font-semibold flex items-center hover:gap-2 transition-all cursor-pointer">
                                    Details <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Scan Results */}
                <div className="bg-white border border-gray-200 p-8 clip-diagonal-top-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Security Scans</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-y border-gray-200">
                                <tr>
                                    <th className="py-3 px-4">Scan Type</th>
                                    <th className="py-3 px-4">Target Asset</th>
                                    <th className="py-3 px-4">Date Performed</th>
                                    <th className="py-3 px-4">Result</th>
                                    <th className="py-3 px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { type: "Vulnerability Assessment", target: "Main Website", date: "Today, 10:00 AM", result: "Passed" },
                                    { type: "Malware Detection", target: "Cloud Storage", date: "Yesterday, 2:30 PM", result: "Passed" },
                                    { type: "Port Scan", target: "Internal Network", date: "Oct 12, 11:15 AM", result: "Passed" },
                                    { type: "DDoS Simulation", target: "Main Website", date: "Oct 10, 09:00 AM", result: "Passed" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="py-4 px-4 font-medium text-gray-900">{row.type}</td>
                                        <td className="py-4 px-4 text-gray-500">{row.target}</td>
                                        <td className="py-4 px-4 text-gray-500">{row.date}</td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center text-green-600 bg-green-50 px-2.5 py-1 text-xs font-bold border border-green-200">
                                                <CheckCircle className="w-3 h-3 mr-1" /> {row.result}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button className="text-[#0066FF] hover:text-blue-800 font-semibold text-xs border border-gray-200 bg-white px-3 py-1.5 shadow-sm hover:shadow transition-shadow">
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
