"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight, Shield, Globe, Lock, Code, Database, Server, Star, PlayCircle, Plus } from "lucide-react"
import Link from "next/link"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#0066FF]" />
            <span className="font-bold text-xl tracking-tight">Huristi</span>
          </div>
          <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
            <Link href="#" className="text-[#0066FF]">Home</Link>
            <Link href="#" className="hover:text-[#0066FF] transition-colors">About Us</Link>

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
          <p className="text-center text-sm font-semibold text-gray-500 mb-8 uppercase tracking-widest">Trusted by the world's most innovative teams</p>
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
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.About Our Company</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">We provide the best security solutions</h2>

            <div className="flex gap-8 mb-8 border-b border-gray-200">
              <button className="text-gray-900 border-b-2 border-[#0066FF] pb-4 font-semibold">Mission</button>
              <button className="text-gray-500 pb-4 font-semibold hover:text-gray-900">Vision</button>
            </div>

            <p className="text-gray-600 mb-10 leading-relaxed text-lg">
              Our mission is to arm organizations with the tools and expertise they need to defend against the ever-evolving landscape of cyber threats. We deliver comprehensive, proactive security solutions tailored to your unique infrastructure.
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
              <p className="text-4xl font-bold mb-2">1200+</p>
              <p className="text-sm font-medium opacity-90">Successful projects</p>
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
              { icon: Shield, title: "Network Security", desc: "Protect your infrastructure from unauthorized access and cyber attacks." },
              { icon: Database, title: "Data Protection", desc: "Ensure your sensitive data remains confidential and secure." },
              { icon: Lock, title: "Cloud Security", desc: "Secure your cloud environments and applications effectively." },
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

      {/* Stats Counter */}
      <section className="bg-[#0066FF] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/20">
          {[
            { value: "30+", label: "Years Experience" },
            { value: "1200+", label: "Solutions Delivered" },
            { value: "100%", label: "Satisfaction Rate" },
            { value: "2.9%", label: "Average Growth" }
          ].map((stat, i) => (
            <div key={i} className="pl-0 border-l first:border-l-0 border-white/20 pt-4 md:pt-0">
              <p className="text-5xl md:text-6xl font-black mb-4">{stat.value}</p>
              <p className="text-white/80 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 leading-tight">Passwords matter more than you think.</h2>
          <div className="relative aspect-video bg-gray-900 w-full rounded-2xl overflow-hidden clip-diagonal-top-left group cursor-pointer shadow-xl">
            <Image src="/images/video_thumbnail_1773148219266.png" alt="Video thumbnail" fill className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <PlayCircle className="w-16 h-16 text-white bg-[#0066FF]/90 backdrop-blur rounded-full p-2 group-hover:bg-[#0066FF] transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-32 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <span className="text-[#0066FF] font-bold tracking-wider text-sm uppercase mb-4 block">.Case Studies</span>
              <h2 className="text-4xl md:text-5xl font-bold">Our Latest Projects</h2>
            </div>
            <button className="flex items-center gap-2 mt-6 md:mt-0 font-bold hover:text-[#0066FF] transition-colors uppercase">
              VIEW ALL PROJECTS <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Financial Security Upgrade", client: "FinBank", time: "3 Months", img: "/images/case_study_1_1773148235144.png" },
              { title: "Healthcare Data Protection", client: "MediCare", time: "6 Months", img: "/images/case_study_2_1773148252247.png" },
              { title: "E-Commerce Fraud Prevention", client: "ShopGlobal", time: "2 Months", img: "/images/case_study_1_1773148235144.png" },
            ].map((study, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-gray-200 mb-6 clip-diagonal-top-left relative overflow-hidden">
                  <Image src={study.img} alt={study.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#0066FF] transition-colors">{study.title}</h3>
                <div className="flex gap-6 text-sm text-gray-500 font-medium">
                  <p>Client: <span className="text-gray-900">{study.client}</span></p>
                  <p>Timeline: <span className="text-gray-900">{study.time}</span></p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-32 px-6 bg-black text-white">
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
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-2 gap-4">
            {/* 4 avatars arranged in a grid or C shape */}
            <div className="aspect-square bg-gray-200 clip-diagonal-top-left relative grayscale hover:grayscale-0 transition-all cursor-pointer"><Image src="/images/about_company_image_1773148174495.png" alt="Avatar" fill className="object-cover" /></div>
            <div className="aspect-square bg-[#0066FF] text-white flex items-center justify-center p-8 text-center text-xl md:text-2xl leading-none font-bold clip-diagonal relative translate-y-8">400+<br /><span className="text-sm font-medium mt-2 block opacity-80 uppercase tracking-widest">Reviews</span></div>
            <div className="aspect-square bg-gray-200 clip-diagonal relative grayscale hover:grayscale-0 transition-all cursor-pointer"><Image src="/images/about_company_image_1773148174495.png" alt="Avatar" fill className="object-cover" /></div>
            <div className="aspect-square bg-gray-200 object-cover relative grayscale hover:grayscale-0 transition-all cursor-pointer"><Image src="/images/about_company_image_1773148174495.png" alt="Avatar" fill className="object-cover" /></div>
          </div>

          <div className="bg-gray-50 p-12 md:p-16 clip-diagonal-top-left border border-gray-100 relative">
            <div className="absolute top-0 right-12 w-16 h-16 bg-[#0066FF] text-white flex items-center justify-center clip-diagonal -translate-y-1/2 shadow-lg">
              <Star className="fill-white w-6 h-6" />
            </div>
            <div className="flex gap-1 text-yellow-400 mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-current w-5 h-5" />)}
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 italic text-gray-800">
              "Their cybersecurity team fundamentally transformed our network defenses. We went from constant breaches to zero incidents in the last year. Truly exceptional expertise."
            </p>
            <div>
              <h4 className="font-bold text-lg">Sarah Jenkins</h4>
              <p className="text-[#0066FF] text-sm font-medium">CTO, Global Tech</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-24 pb-12 px-6 border-t-[8px] border-[#0066FF]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 uppercase tracking-tighter">Ready To Discuss?</h2>
          <button className="bg-[#0066FF] text-white px-12 py-5 text-xl font-bold hover:bg-white hover:text-black transition-colors clip-diagonal">
            LET'S TALK
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
