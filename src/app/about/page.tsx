import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, ArrowUpRight } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Navigation */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="Huristi Logo" className="w-8 h-8" />
                        <span className="font-bold text-xl tracking-tight">Huristi</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
                        <Link href="/" className="hover:text-[#0066FF] transition-colors">Home</Link>
                        <Link href="/about" className="text-[#0066FF]">About Us</Link>
                    </nav>
                    <Link href="/login" className="hidden md:flex items-center gap-2 bg-[#0066FF] text-white px-6 py-2.5 rounded-none clip-diagonal font-medium hover:bg-blue-700 transition-colors">
                        Login <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0066FF] transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-[#0066FF] font-bold tracking-[0.2em] text-[11px] uppercase mb-6 block">.About Huristi</span>
                        <h1 className="text-5xl lg:text-[64px] font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                            Proactive Privacy<br />Protection
                        </h1>

                        <div className="text-gray-500 text-[17px] leading-[1.8] space-y-6 max-w-[90%]">
                            <p>
                                Huristi is a privacy security prototype designed to protect users from unauthorized camera and microphone access. The system continuously monitors device usage on Windows, detects suspicious activity through heuristic process analysis, and responds to potential threats in real time.
                            </p>
                            <p>
                                When risky behavior is detected, Huristi can automatically disable the affected hardware device to prevent possible surveillance or privacy breaches. By combining device activity monitoring, behavioral threat detection, and hardware-level containment, Huristi provides a proactive approach to safeguarding personal privacy in modern digital environments.
                            </p>
                        </div>
                    </div>

                    <div className="relative order-1 md:order-2 pl-4 pb-4 md:pl-8 md:pb-8">
                        {/* The image with a clip path for the top left corner */}
                        <div className="relative w-full aspect-[4/3] rounded-3xl clip-diagonal-top-left overflow-hidden shadow-2xl bg-gray-900 border border-gray-100">
                            <Image
                                src="/images/about_company_image_1773148174495.png"
                                alt="Cybersecurity Command Center"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* The blue floating box with a shield */}
                        <div className="absolute bottom-0 left-0 bg-[#0066FF] text-white w-28 h-28 md:w-36 md:h-36 clip-diagonal flex items-center justify-center shadow-xl">
                            <img src="/images/logo.png" alt="Huristi Logo" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ filter: 'brightness(0) invert(1)' }} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
