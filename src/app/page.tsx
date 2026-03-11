"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, Shield, Globe, Lock, Code, Database, Server, Star, Plus, Camera, Activity } from "lucide-react"
import Link from "next/link"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision'>('mission');

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Huristi Logo" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Huristi</span>
          </div>
          <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#0066FF] cursor-pointer">Home</button>
            <button onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-[#0066FF] transition-colors cursor-pointer">About Us</button>

          </nav>
          <Link href="/login" className="hidden md:flex items-center gap-2 bg-[#0066FF] text-white px-6 py-2.5 rounded-none clip-diagonal font-medium hover:bg-blue-700 transition-colors">
            Login <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
        {/* Background Network Pattern - simple CSS placeholder */}
        <div className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-40" style={{ backgroundImage: "url('/images/business_network_bg_1773148190638.png')", backgroundSize: "cover" }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-gray-200 text-sm font-semibold tracking-wider text-gray-600 mb-8 uppercase bg-white/50 backdrop-blur-sm">
              Elevate Your Security
            </span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeInUp}
            className="text-6xl md:text-7xl lg:text-8xl font-poppins font-medium tracking-tighter leading-[1.1] mb-8 flex flex-col items-center justify-center"
          >
            <span className="block pb-2 text-[#1e6aff] font-medium">Privacy Protection for</span>
            <span className="flex items-center justify-center gap-3 md:gap-5 pb-2">
              <span>the</span>
              <span className="inline-block overflow-hidden clip-diagonal w-32 h-14 md:w-56 md:h-20 bg-gray-200">
                <Image src="/images/hero_headline_image_1773148154713.png" alt="Hero inline" width={224} height={80} className="object-cover w-full h-full object-center" />
              </span>
              <span>Modern</span>
            </span>
            <span className="block">Cyber World</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-gray-500 mb-12">
            We provide advanced cybersecurity solutions to protect your digital assets. Stay ahead of threats with our state-of-the-art technology.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="flex items-center group cursor-pointer inline-flex">
              <span className="bg-gray-900 text-white px-8 py-4 font-semibold text-lg hover:bg-gray-800 transition-colors">Get Started</span>
              <span className="bg-[#0066FF] text-white p-4 clip-diagonal-both group-hover:bg-blue-700 transition-colors">
                <ArrowUpRight className="w-6 h-6" />
              </span>
            </Link>
            <a href="https://github.com/KAMAL-KRISHNA-00/Fugenhack/releases/download/v1.0/HuristiAgent.zip" className="flex items-center group cursor-pointer inline-flex border border-gray-200 hover:border-gray-300 transition-colors">
              <span className="bg-white text-gray-900 px-8 py-4 font-semibold text-lg hover:bg-gray-50 transition-colors">Download App</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Logo Wall */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-500 mb-8 uppercase tracking-widest">Trusted by the world&apos;s most innovative teams</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <Globe className="w-12 h-12" />
            <Server className="w-12 h-12" />
            <Database className="w-12 h-12" />
            <Code className="w-12 h-12" />
            <Lock className="w-12 h-12" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.About Our Company</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">We provide the best security solutions</h2>

            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('mission')}
                className={`pb-4 font-semibold transition-colors relative ${activeTab === 'mission' ? 'text-gray-900 border-b-2 border-[#0066FF]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Mission
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`pb-4 font-semibold transition-colors relative ${activeTab === 'vision' ? 'text-gray-900 border-b-2 border-[#0066FF]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Vision
              </button>
            </div>

            <div className="relative min-h-[120px] mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'mission' ? (
                  <motion.p
                    key="mission"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-600 leading-relaxed text-lg absolute top-0 left-0"
                  >
                    Our mission is to safeguard personal privacy by detecting unauthorized webcam activity and preventing potential surveillance threats. Huristi combines intelligent process analysis with automated hardware containment to protect users from hidden digital intrusions.
                  </motion.p>
                ) : (
                  <motion.p
                    key="vision"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-600 leading-relaxed text-lg absolute top-0 left-0"
                  >
                    Our vision is a world where every individual can navigate the digital space with absolute confidence in their privacy and security, knowing their devices are proactively protected by intelligent and automated defense systems.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className="bg-gray-900 text-white px-8 py-4 font-medium hover:bg-[#0066FF] clip-diagonal transition-colors inline-block mt-8">
              Learn More
            </Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative">
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-gray-200 clip-diagonal-top-left overflow-hidden">
              <Image src="/images/about_company_image_1773148174495.png" alt="About us" fill className="object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="expertise" className="py-32 px-6 bg-gray-50 relative overflow-hidden flex items-center justify-center">
        {/* Massive scrolling text background */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[12vw] font-bold text-gray-900/[0.03] whitespace-nowrap pointer-events-none w-full text-center">
          CYBER SECURITY
        </div>

        <div className="max-w-7xl w-full mx-auto relative z-10">
          <div className="mb-16">
            <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-bold">Comprehensive Security Services</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: "Camera & Microphone Monitoring", desc: "Detect unauthorized access to cameras and microphones by monitoring Windows privacy consent registry activity and identifying active applications using these devices." },
              { icon: Activity, title: "Heuristic Threat Detection", desc: "Analyze running processes using behavioral indicators like abnormal thread activity and unusual system write patterns to identify potentially malicious applications." },
              { icon: Lock, title: "Hardware Kill-Switch Protection", desc: "Automatically disable compromised camera or microphone hardware when suspicious behavior crosses the threat threshold, preventing unauthorized surveillance instantly." },
            ].map((service, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-white p-8 border border-gray-100 hover:shadow-xl transition-all group clip-diagonal-top-left cursor-pointer">
                <div className="w-16 h-16 bg-blue-50 text-[#0066FF] rounded-none clip-diagonal flex items-center justify-center mb-6 group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-8">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Banner */}
      <section className="bg-[#0066FF] text-white py-12 md:py-20 overflow-hidden flex items-center relative select-none">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ ease: "linear", duration: 15, repeat: Infinity }}
          className="flex whitespace-nowrap gap-12 md:gap-24"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-24">
              <span className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}>
                HURISTI
              </span>
              <span className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white opacity-90">
                HURISTI
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="py-60 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Your camera sees more than you realize.</h2>
        </div>
      </section>



      {/* Leadership */}
      {/* <section className="py-32 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.Our Leadership</span>
            <h2 className="text-4xl md:text-5xl font-bold">Meet The Experts</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((member, i) => (
              <div key={i} className="relative group overflow-hidden bg-gray-900 aspect-[3/4] clip-diagonal-top-left cursor-pointer">
                <Image src={`/images/about_company_image_1773148174495.png`} alt="Team Member" fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <h4 className="text-xl font-bold">John Doe</h4>
                  <p className="text-[#0066FF] text-sm">Security Analyst</p>
                </div>
                <button className="absolute bottom-4 right-4 bg-[#0066FF] p-3 text-white clip-diagonal translate-y-16 group-hover:translate-y-0 transition-transform">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* Footer */}
      <footer id="contact-cta" className="bg-[#0A0A0A] text-white pt-24 pb-12 px-6 border-t-[8px] border-[#0066FF]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 uppercase tracking-tighter">Ready To Discuss?</h2>
          <Link href="/contact" className="inline-block bg-[#0066FF] text-white px-12 py-5 text-xl font-bold hover:bg-white hover:text-black transition-colors clip-diagonal">
            LET&apos;S TALK
          </Link>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 md:gap-12 font-medium text-gray-400 mb-16 items-start">
          <div>
            <div className="flex items-center gap-2 mb-8 text-white">
              <img src="/images/logo.png" alt="Huristi Logo" className="w-8 h-8" />
              <span className="font-bold text-2xl tracking-tight">Huristi</span>
            </div>
            <p className="leading-relaxed mb-6 font-normal">Securing the digital world one network at a time. Your trusted partner in global cyber defense operations.</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><button onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-white transition-colors cursor-pointer text-left">About Us</button></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Subscribe</h4>
            <p className="mb-4 text-sm font-normal">Get the latest security updates and news.</p>
            <div className="flex">
              <input type="email" placeholder="Email Address" className="bg-gray-900 border border-gray-800 p-3 w-full focus:outline-none focus:border-[#0066FF] text-white font-normal" />
              <button onClick={() => alert("Subscribed! (Demo feature)")} className="bg-[#0066FF] px-4 hover:bg-blue-700 transition-colors"><ArrowUpRight className="w-5 h-5 text-white" /></button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm font-normal text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} HURISTI. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
