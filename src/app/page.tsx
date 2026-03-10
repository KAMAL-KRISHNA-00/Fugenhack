"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight, Shield, Globe, Lock, Code, Database, Server, Star, Plus, Camera, Activity } from "lucide-react"
import Link from "next/link"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function Home() {
  const [heroKey, setHeroKey] = useState(0);
  const [aboutKey, setAboutKey] = useState(0);

  const coolScroll = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (targetId === 'home') setHeroKey(prev => prev + 1);
    if (targetId === 'about') setAboutKey(prev => prev + 1);

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1500; // 1.5s for a majestic glide
    let start: number | null = null;

    const easeOutQuart = (t: number) => 1 - (--t) * t * t * t;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, startPosition + distance * easeOutQuart(progress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  return (
    <div id="home" className="min-h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
        >
          <button
            onClick={() => coolScroll('home')}
            className="flex items-center gap-4 cursor-pointer outline-none group"
          >
            <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
              <Image src="/images/logo.png" alt="Huristi Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase text-gray-900 group-hover:text-[#0066FF] transition-colors">Huristi</span>
          </button>
          <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
            {['Home', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => coolScroll(item.toLowerCase())}
                className="relative group py-2 outline-none"
              >
                <span className="group-hover:text-[#0066FF] transition-colors">
                  {item}
                </span>
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0066FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                />
              </button>
            ))}
          </nav>
          <Link href="/login" className="hidden md:flex items-center gap-2 bg-[#0066FF] text-white px-6 py-2.5 rounded-none clip-diagonal font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all">
            Login <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
        {/* Background Network Pattern - simple CSS placeholder */}
        <div className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-40" style={{ backgroundImage: "url('/images/business_network_bg_1773148190638.png')", backgroundSize: "cover" }} />

        <div key={heroKey} className="relative z-10 max-w-5xl mx-auto">
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
            <button className="flex items-center group">
              <span className="bg-gray-900 text-white px-8 py-4 font-semibold text-lg hover:bg-gray-800 transition-colors">Download</span>
              <span className="bg-[#0066FF] text-white p-4 clip-diagonal-both group-hover:bg-blue-700 transition-colors">
                <ArrowUpRight className="w-6 h-6" />
              </span>
            </button>
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
          <motion.div key={aboutKey} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.About Our Company</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">We provide the best security solutions</h2>

            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <button className="text-gray-900 border-b-2 border-[#0066FF] pb-4 font-semibold">Mission</button>
              <button className="text-gray-500 pb-4 font-semibold hover:text-gray-900">Vision</button>
            </div>

            <p className="text-gray-600 mb-10 leading-relaxed text-lg">
              Our mission is to safeguard personal privacy by detecting unauthorized webcam activity and preventing potential surveillance threats. Huristi combines intelligent process analysis with automated hardware containment to protect users from hidden digital intrusions.
            </p>

            <button className="bg-gray-900 text-white px-8 py-4 font-medium hover:bg-[#0066FF] clip-diagonal transition-colors">
              About Us
            </button>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative">
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-gray-200 clip-diagonal-top-left overflow-hidden">
              <Image src="/images/about_company_image_1773148174495.png" alt="About us" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-[#0066FF] text-white p-8 clip-diagonal shadow-2xl">
              
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 bg-gray-50 relative overflow-hidden flex items-center justify-center">
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
                <button className="flex items-center text-sm font-bold text-[#0066FF] gap-2 group-hover:gap-4 transition-all uppercase">
                  READ MORE <ArrowUpRight className="w-4 h-4" />
                </button>
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
      <footer className="bg-[#0A0A0A] text-white pt-24 pb-12 px-6 border-t-[8px] border-[#0066FF]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 uppercase tracking-tighter">Ready To Discuss?</h2>
          <button className="bg-[#0066FF] text-white px-12 py-5 text-xl font-bold hover:bg-white hover:text-black transition-colors clip-diagonal">
            LET&apos;S TALK
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 font-medium text-gray-400 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-8 text-white">
              <Shield className="w-8 h-8 text-[#0066FF]" />
              <span className="font-bold text-2xl tracking-tight">Cybery</span>
            </div>
            <p className="leading-relaxed mb-6 font-normal">Securing the digital world one network at a time. Your trusted partner in global cyber defense operations.</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Services</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">Network Security</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cloud Protection</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Risk Assessment</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Incident Response</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">News & Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Subscribe</h4>
            <p className="mb-4 text-sm font-normal">Get the latest security updates and news.</p>
            <div className="flex">
              <input type="email" placeholder="Email Address" className="bg-gray-900 border border-gray-800 p-3 w-full focus:outline-none focus:border-[#0066FF] text-white font-normal" />
              <button className="bg-[#0066FF] px-4 hover:bg-blue-700 transition-colors"><ArrowUpRight className="w-5 h-5 text-white" /></button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm font-normal text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Cybery Clone. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
