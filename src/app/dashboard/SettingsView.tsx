import { useState } from "react";
import { Shield, Bell, Lock, Server, Cpu, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsView({ theme }: { theme: 'light' | 'dark' }) {
    const [settings, setSettings] = useState({
        threatThreshold: 75,
        autoLockdown: false,
        emailAlerts: true,
        smsAlerts: false,
        strictMode: true,
        sessionTimeout: "30",
        webhookUrl: "https://api.huristi.com/v1/webhook",
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 scrollbar-custom">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                        <Shield className="w-7 h-7 text-[#0066FF] dark:text-blue-500" />
                        Platform Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        Manage global thresholds, automated responses, and platform integrations.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Security Automation */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 clip-diagonal-top-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/5 dark:bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                                <Cpu className="w-5 h-5 text-[#0066FF] dark:text-blue-400" /> Security Automation
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Auto-Kill Threat Threshold</label>
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${settings.threatThreshold >= 80 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-[#0066FF] dark:bg-blue-900/40 dark:text-blue-400'}`}>
                                            {settings.threatThreshold}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50" max="100"
                                        value={settings.threatThreshold}
                                        onChange={(e) => setSettings({ ...settings, threatThreshold: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#0066FF] dark:accent-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Devices exceeding this threat score will be automatically isolated.
                                    </p>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Global Auto-Lockdown</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically lock down all devices if &gt;3 threats detected within 60s.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, autoLockdown: !settings.autoLockdown })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoLockdown ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoLockdown ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Strict App Monitoring Mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Flag any unverified binary attempting to access mic/camera.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, strictMode: !settings.strictMode })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.strictMode ? 'bg-[#0066FF] dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.strictMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 clip-diagonal-top-left">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                                <Server className="w-5 h-5 text-purple-500" /> Platform Infrastructure
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">SOC Webhook URL</label>
                                    <input
                                        type="text"
                                        value={settings.webhookUrl}
                                        onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#0066FF] dark:focus:border-blue-500 transition-colors text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Log Retention Period</label>
                                    <select className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-[#0066FF] dark:focus:border-blue-500 transition-colors text-sm">
                                        <option value="7">7 Days</option>
                                        <option value="30">30 Days</option>
                                        <option value="90">90 Days</option>
                                        <option value="365">1 Year</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 clip-diagonal-top-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] pointer-events-none" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-green-500 dark:text-green-400" /> Alerts & Notifications
                            </h2>
                            <div className="space-y-5">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.emailAlerts ? 'bg-[#0066FF] border-[#0066FF] dark:bg-blue-500 dark:border-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {settings.emailAlerts && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={settings.emailAlerts} onChange={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Critical Email Alerts</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.smsAlerts ? 'bg-[#0066FF] border-[#0066FF] dark:bg-blue-500 dark:border-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {settings.smsAlerts && <span className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={settings.smsAlerts} onChange={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">SMS Incident Paging</span>
                                </label>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 clip-diagonal-top-left">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                                <Lock className="w-5 h-5 text-orange-500" /> Admin Security
                            </h2>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Panel Session Timeout (Mins)</label>
                                <select
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors text-sm"
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                </select>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Save controls */}
                <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2"
                        >
                            ✓ Settings applied successfully
                        </motion.span>
                    )}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 pl-8 pr-4 py-3 text-sm font-bold tracking-wider transition-colors bg-[#0066FF] text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 clip-diagonal-top-left"
                    >
                        <Save className="w-4 h-4" /> SAVE CONFIGURATION
                    </button>
                </div>
            </div>
        </div>
    );
}
