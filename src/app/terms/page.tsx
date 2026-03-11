import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Image from "next/image";

export default function Terms() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans p-6">
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-16">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/images/logo.png" alt="Huristi Logo" width={32} height={32} className="w-8 h-8" />
                    <span className="font-bold text-xl tracking-tight">Huristi</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 hover:text-[#0066FF] transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </header>

            <main className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms & Conditions</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="mb-4 text-sm font-semibold text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
                    <p className="mb-6">
                        Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Disclaimer</h2>
                    <p className="mb-6">
                        The materials on our website are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </div>
            </main>
        </div>
    );
}
