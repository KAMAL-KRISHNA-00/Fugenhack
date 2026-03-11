"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Shield, ShieldAlert, MonitorX, MicOff, WifiOff, RotateCcw, AlertTriangle, Users, Activity, Settings, LogOut, ChevronRight, BarChart3, Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Sparkline } from '@/components/Sparkline'
import { SlaveDevice, LogEntry, CommandType } from '@/types'
import SettingsView from './SettingsView'
import { supabase } from '@/utils/supabase/client'

type DashboardSession = {
    id?: string
    email?: string
    name?: string
    devices?: string[]
}

type DeviceStatusRow = {
    cpu_usage?: number | null
    ram_usage?: number | null
    disk_usage?: number | null
    camera_app?: string | null
    mic_app?: string | null
    threat_score?: number | null
}

type DeviceRow = {
    device_id: string
    device_name?: string | null
    os?: string | null
    camera_enabled?: boolean | null
    mic_enabled?: boolean | null
    last_seen?: string | null
    device_status?: DeviceStatusRow | DeviceStatusRow[] | null
}

const normalizeDeviceStatus = (status: DeviceRow['device_status']): DeviceStatusRow | null => {
    if (!status) {
        return null
    }

    if (Array.isArray(status)) {
        return status[0] ?? null
    }

    return status
}

const buildThreatHistory = (threatScore: number) => {
    return Array.from({ length: 24 }, (_value, index) => {
        const spread = (index % 5) * 2
        return Math.max(0, Math.min(100, threatScore - 4 + spread))
    })
}

const mapDeviceRowToSlaveDevice = (row: DeviceRow): SlaveDevice => {
    const status = normalizeDeviceStatus(row.device_status)
    const threatScore = Number(status?.threat_score ?? 0)
    const cameraApp = String(status?.camera_app ?? "").trim()
    const micApp = String(status?.mic_app ?? "").trim()
    const lastSeenMs = row.last_seen ? new Date(row.last_seen).getTime() : 0
    const statusLabel = lastSeenMs && Date.now() - lastSeenMs <= 15000 ? 'online' : 'timeout'

    return {
        device_id: row.device_id,
        hostname: row.device_name || row.device_id,
        ip: row.device_id,
        platform: row.os || 'Unknown',
        status: statusLabel,
        threat_score: threatScore,
        threat_history: buildThreatHistory(threatScore),
        camera_active: Boolean(cameraApp),
        camera_locked: row.camera_enabled === false,
        mic_locked: row.mic_enabled === false,
        cpu_percent: Number(status?.cpu_usage ?? 0),
        ram_percent: Number(status?.ram_usage ?? 0),
        disk_percent: Number(status?.disk_usage ?? 0),
        suspicious_processes: [cameraApp, micApp].filter(Boolean),
        active_camera_apps: cameraApp ? [cameraApp] : [],
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    // Socket & Devices State
    const [devices, setDevices] = useState<Record<string, SlaveDevice>>({});
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [fetchError, setFetchError] = useState("")

    // Modals state
    const [pairModalOpen, setPairModalOpen] = useState(false);
    const [enteredDeviceId, setEnteredDeviceId] = useState("");
    const [pairingLoading, setPairingLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, type: CommandType | null, target: string, message: string }>({
        open: false, type: null, target: '', message: ''
    });
    const [autoKillAlert, setAutoKillAlert] = useState<string | null>("LAPTOP-ALPHA");

    // Handle pairing authorization
    const handlePairAuthorize = async () => {
        if (!enteredDeviceId.trim()) {
            alert("Please enter a device ID")
            return
        }

        const rawSession = localStorage.getItem("huristi_session")
        if (!rawSession) {
            alert("Session expired. Please log in again.")
            return
        }

        let session: DashboardSession = {}
        try {
            session = JSON.parse(rawSession) as DashboardSession
        } catch {
            alert("Invalid session. Please log in again.")
            return
        }

        if (!session.id) {
            alert("User ID not found. Please log in again.")
            return
        }

        setPairingLoading(true)
        try {
            const response = await fetch("/api/device/pair", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    device_id: enteredDeviceId.trim(),
                    user_id: session.id
                })
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw new Error(error.message || `HTTP ${response.status}`)
            }

            const result = await response.json()
            alert("Device paired successfully!")
            setEnteredDeviceId("")
            setPairModalOpen(false)
        } catch (error) {
            console.error("Pairing error:", error)
            alert(`Pairing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setPairingLoading(false)
        }
    }

    // Auth guard — redirect if no session
    useEffect(() => {
        const session = localStorage.getItem("huristi_session")
        if (!session) {
            router.replace("/login")
        }
    }, [router])

    useEffect(() => {
        let cancelled = false

        const fetchDevices = async () => {
            const rawSession = localStorage.getItem("huristi_session")
            if (!rawSession) {
                router.replace("/login")
                return
            }

            let session: DashboardSession = {}
            try {
                session = JSON.parse(rawSession) as DashboardSession
            } catch {
                localStorage.removeItem("huristi_session")
                router.replace("/login")
                return
            }

            const { data: authData } = await supabase.auth.getUser()
            const authUserId = authData.user?.id ?? ''
            const sessionUserId = typeof session.id === 'string' ? session.id : ''
            const userId = authUserId || sessionUserId
            if (!userId) {
                setFetchError('Missing user session id. Please sign in again.')
                setWsConnected(false)
                return
            }

            const { data, error } = await supabase
                .from('devices')
                .select(`
                    device_id,
                    device_name,
                    os,
                    camera_enabled,
                    mic_enabled,
                    last_seen,
                    device_status (
                        cpu_usage,
                        ram_usage,
                        disk_usage,
                        camera_app,
                        mic_app,
                        threat_score
                    )
                `)
                .eq('user_id', userId)

            if (cancelled) {
                return
            }

            if (error) {
                setFetchError(error.message || 'Failed to load devices.')
                setWsConnected(false)
                return
            }

            const rows = (data ?? []) as DeviceRow[]
            const nextDevices = rows.reduce<Record<string, SlaveDevice>>((acc, row) => {
                acc[row.device_id] = mapDeviceRowToSlaveDevice(row)
                return acc
            }, {})

            const nextLogs: LogEntry[] = rows.map((row, index) => {
                const status = normalizeDeviceStatus(row.device_status)
                const cameraApp = String(status?.camera_app ?? '').trim()
                const micApp = String(status?.mic_app ?? '').trim()
                const threatScore = Number(status?.threat_score ?? 0)
                const suffix = cameraApp || micApp
                    ? ` | active: ${[cameraApp, micApp].filter(Boolean).join(', ')}`
                    : ''

                return {
                    id: `${row.device_id}-${index}`,
                    timestamp: Date.now() - index * 1000,
                    device_id: row.device_id,
                    event: `STATUS SYNC: threat=${Math.round(threatScore)} cpu=${Math.round(Number(status?.cpu_usage ?? 0))}% ram=${Math.round(Number(status?.ram_usage ?? 0))}%${suffix}`,
                }
            })

            setDevices(nextDevices)
            setLogs(nextLogs)
            setFetchError('')
            setWsConnected(true)
        }

        fetchDevices()
        const intervalId = window.setInterval(fetchDevices, 10000)

        return () => {
            cancelled = true
            window.clearInterval(intervalId)
        }
    }, [router])

    const handleSignOut = useCallback(() => {
        localStorage.removeItem("huristi_session")
        router.push("/login")
    }, [router])

    useEffect(() => {
        if (autoKillAlert) {
            const t = setTimeout(() => setAutoKillAlert(null), 4000);
            return () => clearTimeout(t);
        }
    }, [autoKillAlert]);

    const allDevices = Object.values(devices);
    const onlineCount = allDevices.filter(d => d.status === 'online').length;
    const threatCount = allDevices.filter(d => d.threat_score >= 50).length;
    const lockedCount = allDevices.filter(d => d.camera_locked || d.mic_locked).length;

    const handleCommand = (type: CommandType, target: string, msg: string) => {
        setConfirmModal({ open: true, type, target, message: msg });
    };

    const executeCommand = async () => {
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            device_id: confirmModal.target !== 'all' ? confirmModal.target : undefined,
            event: `COMMAND SENT: ${confirmModal.type} targeting ${confirmModal.target}`
        };
        setLogs(prev => [newLog, ...prev].slice(0, 200));

        const deviceIds = confirmModal.target === 'all'
            ? Object.keys(devices)
            : [confirmModal.target];

        try {
            // Handle restore commands
            if (confirmModal.type === 'restore_device' || confirmModal.type === 'restore_all') {
                console.log("[DASHBOARD] Calling restore API with devices:", deviceIds);
                const response = await fetch("/api/device/restore", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        device_ids: deviceIds
                    })
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || `HTTP ${response.status}`);
                }

                const result = await response.json();
                console.log("[DASHBOARD] Restore success:", result);
                alert("Devices restored successfully!");
            }
            // Handle kill commands
            else if (confirmModal.type === 'kill_camera' || confirmModal.type === 'kill_mic' || confirmModal.type === 'full_lockdown') {
                let action = 'kill_both';
                if (confirmModal.type === 'kill_camera') {
                    action = 'kill_camera';
                } else if (confirmModal.type === 'kill_mic') {
                    action = 'kill_mic';
                } else if (confirmModal.type === 'full_lockdown') {
                    action = 'kill_both';
                }

                console.log("[DASHBOARD] Calling kill API with action:", action, "devices:", deviceIds);
                const response = await fetch("/api/device/kill", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        device_ids: deviceIds,
                        action: action
                    })
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || `HTTP ${response.status}`);
                }

                const result = await response.json();
                console.log("[DASHBOARD] Kill success:", result);
                alert(`Devices killed successfully (${action})!`);

                if (confirmModal.target === 'all' && action === 'kill_both') {
                    setAutoKillAlert('ALL_DEVICES');
                    setTimeout(() => setAutoKillAlert(null), 4000);
                }
            }
        } catch (error) {
            console.error("[DASHBOARD] Command error:", error);
            alert(`Command failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }

        setConfirmModal({ open: false, type: null, target: '', message: '' });
    };

    const scoreColor = (score: number) => {
        if (score >= 80) return '#ef4444';
        if (score >= 50) return '#eab308';
        return '#10b981';
    };

    const getLogColorClass = (event: string) => {
        const t = event.toUpperCase();
        if (/CONNECTED|PAIRED|SUCCESS|RESTORE/.test(t)) return 'border-green-500';
        if (/DISCONNECT|TIMEOUT/.test(t)) return 'border-yellow-500';
        if (/KILL|AUTO_KILL|LOCKDOWN|BREACH/.test(t)) return 'border-red-500';
        return 'border-[#0066FF]';
    };

    return (
        <div className={`h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col md:flex-row overflow-hidden relative ${theme === 'light' ? '' : 'dark'}`}>
            {/* Auto-Kill Alert Banner */}
            <div className={`fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-bold tracking-widest transition-transform duration-300 ${autoKillAlert ? 'translate-y-0' : '-translate-y-full'}`}>
                🚨 AUTO-KILL TRIGGERED ON {autoKillAlert}
            </div>

            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white min-h-screen shrink-0 z-40 hidden md:flex flex-col transition-colors duration-200">
                <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="w-12 h-12 mr-3 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                        <Image src="/images/logo.png" alt="Huristi Logo" width={48} height={48} className="object-cover w-full h-full z=20" />
                    </div>
                    <span className="font-bold text-xl tracking-tight uppercase text-[#0066FF]">Admin Hub</span>
                </div>
                <div className="flex-1 py-6 px-4 flex flex-col gap-4 overflow-y-auto scrollbar-custom">
                    {/* Cyber Tips Section */}
                    <div className="mb-1">
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-gray-600 px-1">Security Tips</p>
                    </div>

                    {[
                        {
                            icon: "🔐",
                            title: "Zero Trust Architecture",
                            tip: "Never trust, always verify. Grant least-privilege access and re-authenticate continuously.",
                        },
                        {
                            icon: "📡",
                            title: "Network Segmentation",
                            tip: "Isolate critical systems in separate VLANs to limit lateral movement during breaches.",
                        },
                        {
                            icon: "🧬",
                            title: "Threat Intelligence",
                            tip: "Correlate IOCs across devices. A single abnormal process can indicate APT activity.",
                        },
                        {
                            icon: "🛡️",
                            title: "Endpoint Hardening",
                            tip: "Disable unused ports, enforce application whitelisting, and audit privileged accounts regularly.",
                        },
                        {
                            icon: "⚡",
                            title: "Incident Response",
                            tip: "Contain first, investigate second. Preserve logs before isolating a compromised host.",
                        },
                        {
                            icon: "👁️",
                            title: "Behavioral Analytics",
                            tip: "Baseline normal user activity. Deviations in login times or data access often signal insider threats.",
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-sm p-3 flex flex-col gap-1.5"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm leading-none">{item.icon}</span>
                                <span className="text-[10px] font-bold tracking-wider uppercase text-[#0066FF] dark:text-blue-400 leading-none">{item.title}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed pl-0.5">
                                {item.tip}
                            </p>
                        </div>
                    ))}

                    <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-600 mb-2 px-1">Did You Know?</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-sm p-3">
                            <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed">
                                <span className="font-bold">68%</span> of breaches involve a human element — phishing, credential theft, or insider misuse. Train your users as your first line of defense.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 shrink-0">
                    <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors clip-diagonal-top-left">
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-50 dark:bg-gray-950">
                {/* Header components */}
                <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-gray-100 tracking-tight">HURISTI <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 tracking-widest font-normal">SOC</span></span>
                    </div>

                    <div className="hidden lg:flex gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold leading-none text-[#0066FF] dark:text-blue-400">{onlineCount}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Online</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold leading-none text-gray-900 dark:text-gray-100">{allDevices.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Devices</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold leading-none text-red-600 dark:text-red-400">{threatCount}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Threats</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold leading-none text-yellow-600 dark:text-yellow-400">{lockedCount}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Locked</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? '☾' : '☀'}
                        </button>

                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 pr-4">
                            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-red-500 dark:bg-red-400'}`}></span>
                            {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
                        </div>
                        <button
                            onClick={() => setPairModalOpen(true)}
                            className="bg-transparent border-2 border-[#0066FF] dark:border-blue-500 text-[#0066FF] dark:text-blue-400 pl-10 pr-5 py-2.5 font-bold text-xs tracking-wider clip-diagonal-top-left hover:bg-[#0066FF] hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
                        >
                            ＋ PAIR DEVICE
                        </button>
                    </div>
                </header>

                {fetchError && (
                    <div className="mx-4 md:mx-8 mt-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                        {fetchError}
                    </div>
                )}

                {/* Global Controls */}
                {activeTab === 'overview' && (
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3 shrink-0 flex-wrap">
                        <button onClick={() => handleCommand('full_lockdown', 'all', '🚨 Full lockdown on ALL devices?')} className="flex items-center gap-2 pl-10 pr-5 py-2.5 text-xs font-bold tracking-wider transition-colors bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 clip-diagonal-top-left">
                            <ShieldAlert className="w-4 h-4" /> FULL LOCKDOWN
                        </button>
                        <button onClick={() => handleCommand('kill_camera', 'all', '📷 Kill cameras on ALL devices?')} className="flex items-center gap-2 pl-10 pr-5 py-2.5 text-xs font-bold tracking-wider transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-red-500 dark:hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 clip-diagonal-top-left">
                            <MonitorX className="w-4 h-4" /> KILL CAMERAS
                        </button>
                        <button onClick={() => handleCommand('kill_mic', 'all', '🎙 Kill mics on ALL devices?')} className="flex items-center gap-2 pl-10 pr-5 py-2.5 text-xs font-bold tracking-wider transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-yellow-500 dark:hover:border-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400 clip-diagonal-top-left">
                            <MicOff className="w-4 h-4" /> KILL MICS
                        </button>
                        <button onClick={() => handleCommand('restore_all', 'all', '↺ Restore ALL devices to normal?')} className="flex items-center gap-2 pl-10 pr-5 py-2.5 text-xs font-bold tracking-wider transition-colors bg-white dark:bg-gray-800 border border-[#0066FF] dark:border-blue-500 text-[#0066FF] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 clip-diagonal-top-left">
                            <RotateCcw className="w-4 h-4" /> RESTORE ALL
                        </button>
                    </div>
                )}

                {/* Main Area: Grid & Logs */}
                {activeTab === 'overview' ? (
                    <div className="flex flex-1 overflow-hidden">

                        {/* Device Grid */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-gray-50/50 dark:bg-gray-950/50">
                            {allDevices.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-4 text-center">
                                    <Image src="/images/logo.png" alt="Huristi Logo" width={64} height={64} className="w-16 h-16 opacity-30" style={{ filter: 'brightness(0) invert(1)' }} />
                                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                                        <strong className="text-gray-700 dark:text-gray-200 block text-lg mb-2">No devices connected yet.</strong>
                                        Click <strong>＋ Pair Device</strong> on the top right to add a monitoring agent.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
                                    {allDevices.map(d => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={d.device_id}
                                            className={`bg-white dark:bg-gray-900 border p-5 flex flex-col gap-4 relative transition-all duration-300 clip-diagonal-top-left ${d.status !== 'online' ? 'opacity-50' : ''} ${d.threat_score >= 80 && d.status === 'online' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:border-red-500 dark:shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none'}`}
                                        >
                                            {d.camera_active && (
                                                <div className="bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-1.5 text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-800">
                                                    ⚠ CAMERA IN USE: {d.active_camera_apps.join(', ') || 'unknown'}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{d.hostname}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{d.ip}</div>
                                                </div>
                                                <div className={`flex items-center gap-2 px-3 py-1 text-[10px] uppercase tracking-wider font-bold border ${d.status === 'online' ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0066FF] dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                                                    d.status === 'timeout' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${d.status === 'online' ? 'bg-[#0066FF] dark:bg-blue-400 animate-pulse' : d.status === 'timeout' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                                    {d.status}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5 mt-2">
                                                <div className="flex justify-between items-end text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                                    <span>THREAT SCORE</span>
                                                    <span className="text-xl font-bold font-sans" style={{ color: scoreColor(d.threat_score) }}>{Math.round(d.threat_score)}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full transition-all duration-500" style={{ width: `${d.threat_score}%`, backgroundColor: scoreColor(d.threat_score) }}></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-1">
                                                <div className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-colors ${d.camera_locked ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${d.camera_locked ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                    CAMERA {d.camera_locked ? 'DISABLED' : 'ENABLED'}
                                                </div>
                                                <div className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-colors ${d.mic_locked ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${d.mic_locked ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                                    MIC {d.mic_locked ? 'DISABLED' : 'ENABLED'}
                                                </div>
                                            </div>

                                            <Sparkline history={d.threat_history} color={scoreColor(d.threat_score)} />

                                            <div className="grid grid-cols-3 gap-2 mt-1">
                                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-2 text-center clip-diagonal-top-left">
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">CPU</div>
                                                    <div className="text-sm font-bold mt-1 text-gray-900 dark:text-gray-200">{Math.round(d.cpu_percent)}%</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-2 text-center clip-diagonal-top-left">
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">RAM</div>
                                                    <div className="text-sm font-bold mt-1 text-gray-900 dark:text-gray-200">{Math.round(d.ram_percent)}%</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-2 text-center clip-diagonal-top-left">
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">DISK</div>
                                                    <div className="text-sm font-bold mt-1 text-gray-900 dark:text-gray-200">{Math.round(d.disk_percent)}%</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-wrap mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <button onClick={() => handleCommand('kill_camera', d.device_id, `📷 Kill camera on ${d.device_id}?`)} className="flex-1 px-3 py-2.5 text-[11px] uppercase tracking-wider font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors clip-diagonal-sm flex items-center justify-center whitespace-nowrap">📷 CAM</button>
                                                <button onClick={() => handleCommand('kill_mic', d.device_id, `🎙 Kill mic on ${d.device_id}?`)} className="flex-1 px-3 py-2.5 text-[11px] uppercase tracking-wider font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors clip-diagonal-sm flex items-center justify-center whitespace-nowrap">🎙 MIC</button>
                                                <button onClick={() => handleCommand('restore_device', d.device_id, `↺ Restore ${d.device_id}?`)} className="flex-1 px-3 py-2.5 text-[11px] uppercase tracking-wider font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-colors clip-diagonal-sm flex items-center justify-center whitespace-nowrap">↺ RESTORE</button>
                                                <button onClick={() => handleCommand('full_lockdown', d.device_id, `🔒 Full lockdown on ${d.device_id}?`)} className="w-full mt-1 px-4 py-3 text-xs uppercase tracking-widest font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors clip-diagonal-sm flex items-center justify-center">LOCKDOWN</button>
                                            </div>

                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Incident Log Panel */}
                        <div className="hidden lg:flex flex-col w-80 shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">Incident Log</span>
                                <button onClick={() => setLogs([])} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-2 py-1 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">CLEAR</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-custom space-y-2 bg-gray-50/30 dark:bg-transparent">
                                {logs.map(log => (
                                    <div key={log.id} className={`p-3 text-xs border-l-4 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none font-medium ${getLogColorClass(log.event)}`}>
                                        <div className="flex justify-between items-start mb-1.5">
                                            {log.device_id ? <span className="text-[#0066FF] dark:text-blue-400 font-bold">{log.device_id}</span> : <span className="text-gray-400 dark:text-gray-500">System</span>}
                                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-mono">{new Date(log.timestamp).toLocaleTimeString('en-GB')}</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 leading-snug block">{log.event}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <SettingsView theme={theme} />
                ) : null}
            </main>

            {/* Pair Modal */}
            {pairModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 w-[460px] max-w-full shadow-2xl clip-diagonal-top-left">
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight flex items-center gap-3">
                            <Image src="/images/logo.png" alt="Huristi Logo" width={24} height={24} className="w-6 h-6 mr-2" style={{ filter: 'brightness(0) invert(1)' }} /> PAIRED NEW DEVICE
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-sm">
                            On the slave laptop, run <code className="font-bold text-[#0066FF] dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5">python slave_agent.py</code>. The device ID will appear on that screen. Enter it below to authorize the pairing.
                        </div>
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Device ID</label>
                            <input type="text" placeholder="DESKTOP-BETA" value={enteredDeviceId} onChange={(e) => setEnteredDeviceId(e.target.value)} disabled={pairingLoading} className="w-full py-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#0066FF] dark:focus:border-blue-500 text-center text-xl font-mono tracking-wider transition-colors disabled:opacity-50" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setPairModalOpen(false); setEnteredDeviceId(""); }} disabled={pairingLoading} className="px-6 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">CANCEL</button>
                            <button onClick={handlePairAuthorize} disabled={pairingLoading} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0066FF] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors clip-diagonal-top-left disabled:opacity-50">{pairingLoading ? "PAIRING..." : "AUTHORIZE"}</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 border-t-[6px] border-red-500 p-8 w-[420px] max-w-full shadow-2xl">
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" /> CONFIRM ACTION
                        </div>
                        <div className="text-base text-gray-700 dark:text-gray-300 mb-8 font-medium">{confirmModal.message}</div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmModal({ open: false, type: null, target: '', message: '' })} className="px-6 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">CANCEL</button>
                            <button onClick={executeCommand} className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">EXECUTE</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
