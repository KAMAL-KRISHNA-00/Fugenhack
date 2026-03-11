"use client"

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const subject = encodeURIComponent(`Contact Form Submission from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

        // Open the default mail client
        window.location.href = `mailto:kamalkrishna428@gmail.com?subject=${subject}&body=${body}`;

        // Optional: clear form
        setName("");
        setEmail("");
        setMessage("");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans p-6">
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-16">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Huristi Logo" className="w-8 h-8" />
                    <span className="font-bold text-xl tracking-tight">Huristi</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 hover:text-[#0066FF] transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </header>

            <main className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Contact Us</h1>
                <p className="text-gray-600 mb-8 text-lg">We&apos;re here to help. Send us a message and we&apos;ll get back to you as soon as possible.</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                            placeholder="Your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                            placeholder="How can we help you?"
                        ></textarea>
                    </div>
                    <button type="submit" className="bg-[#0066FF] text-white px-8 py-4 font-bold hover:bg-blue-700 transition-colors clip-diagonal w-full mt-4">
                        SEND MESSAGE
                    </button>
                </form>
            </main>
        </div>
    );
}
