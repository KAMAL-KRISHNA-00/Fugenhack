import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Image from "next/image";

export default function Privacy() {
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
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="mb-4 text-sm font-semibold text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p className="mb-6">
                        We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                    <p className="mb-6">
                        Any of the information we collect from you may be used in one of the following ways:
                    </p>
                    <ul className="list-disc pl-5 mt-2 mb-6 space-y-2">
                        <li>To personalize your experience</li>
                        <li>To improve our website</li>
                        <li>To improve customer service</li>
                        <li>To send periodic emails</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Protection</h2>
                    <p className="mb-6">
                        We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
                    </p>
                </div>
            </main>
        </div>
    );
}
