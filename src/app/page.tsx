// src/app/page.tsx
import Link from 'next/link';
import {
  Scissors,
  Calendar,
  Wallet,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Sun,
  Droplets,
  DollarSign,
  MessageSquare,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function SaaSPlatformHomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">TrimFlow</span>
              <span className="text-amber-400 font-semibold text-xs ml-1">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <Link
              href="/legends-barbershop-avondale"
              className="text-neutral-300 hover:text-white transition-colors hidden sm:inline"
            >
              Demo Barbershop
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-all border border-neutral-700"
            >
              Owner Cockpit
            </Link>
            <Link
              href="/legends-barbershop-avondale/book"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Book Demo Cut
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900/60 via-neutral-950 to-neutral-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            B2B Enterprise SaaS Architecture for African & Emerging Markets
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            The Operating System for Modern Salons & Barbershops
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Eliminate double bookings, paper logbooks, and WhatsApp chaos. Powered by live
            multi-chair scheduling, a game-changing <strong>Digital Change Wallet</strong> for cash
            economies, and multimodal Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/legends-barbershop-avondale"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              View Client Booking Experience
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm sm:text-base border border-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              Enter Salon Operations Admin
            </Link>
          </div>

          {/* Regional Proof Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-emerald-400" />
              Solar Backup Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Borehole Resilience
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" />
              USD Change Shortage Solved
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              WhatsApp Automated Tickets
            </span>
          </div>
        </div>
      </section>

      {/* The 4 Architectural Pillars */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Engineered For High Growth
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built to Solve Real Commercial Bottlenecks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">30-Second Client Booking</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mobile-first flow with zero app downloads. Verified barber availability, automated
                WhatsApp pass delivery, and calendar sync.
              </p>
            </div>
            <Link
              href="/legends-barbershop-avondale/book"
              className="mt-6 text-xs font-semibold text-amber-400 flex items-center gap-1 hover:underline"
            >
              Test booking flow →
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Digital Change Wallet</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Solves the chronic USD small bill crisis. Remaining $1, $2, or $5 is credited to the
                client’s phone number, locking in repeat visits.
              </p>
            </div>
            <Link
              href="/admin/pos"
              className="mt-6 text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
            >
              Test POS ledger →
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Multi-Chair Floor Cockpit</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Live view of all chairs side-by-side. Handles both booth rental agreements ($15/day)
                and 50/50 commission split reconciliations.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="mt-6 text-xs font-semibold text-cyan-400 flex items-center gap-1 hover:underline"
            >
              Open Live Floor →
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Gemini AI Style Suite</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Face-shape and beard density analysis via Gemini Flash Vision + automated 14-day
                re-engagement reminder worker.
              </p>
            </div>
            <span className="mt-6 text-xs font-semibold text-purple-400">Phase 4 AI Module</span>
          </div>
        </div>
      </section>

      {/* Developer Monetization Infrastructure */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50 border-t border-b border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              SaaS Business Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How TrimFlow Generates Recurring Monthly Revenue
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Starter Shop</h4>
                <span className="text-amber-400 font-extrabold text-lg">$29/mo</span>
              </div>
              <p className="text-xs text-neutral-400">Up to 3 chairs, client booking portal, digital change wallet.</p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border-2 border-amber-500/50 space-y-2 relative">
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500 text-neutral-950">
                Most Popular
              </span>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Pro Lounge</h4>
                <span className="text-amber-400 font-extrabold text-lg">$49/mo</span>
              </div>
              <p className="text-xs text-neutral-400">Unlimited chairs, booth rent audit, WhatsApp reminder tickets.</p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Enterprise Chain</h4>
                <span className="text-amber-400 font-extrabold text-lg">$89/mo</span>
              </div>
              <p className="text-xs text-neutral-400">Multi-branch franchises, custom domain, AI face consultation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-neutral-500">
        <p>© 2026 TrimFlow AI. Open Source & Commercial B2B SaaS Blueprint.</p>
        <p className="mt-1">Built with Next.js 14, TypeScript, Tailwind CSS & Supabase.</p>
      </footer>
    </div>
  );
}
