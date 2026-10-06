// src/app/[salonSlug]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Clock,
  MapPin,
  Phone,
  Sun,
  Droplets,
  Star,
  ShieldCheck,
  Sparkles,
  Scissors,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Tenant, Service, Staff } from '@/types/database';
import { getTenantBySlug, getTenantServices, getTenantStaff } from '@/lib/supabase';

export default function SalonStorefrontPage() {
  const params = useParams();
  const slug = (params?.salonSlug as string) || 'legends-barbershop-avondale';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSalonData() {
      setLoading(true);
      try {
        const tenantData = await getTenantBySlug(slug);
        if (tenantData) {
          setTenant(tenantData);
          const [servicesData, staffData] = await Promise.all([
            getTenantServices(tenantData.id),
            getTenantStaff(tenantData.id),
          ]);
          setServices(servicesData);
          setStaff(staffData);
        }
      } catch (err) {
        console.error('Failed to load salon:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSalonData();
  }, [slug]);

  if (loading || !tenant) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400 text-sm tracking-wide">Loading salon chair experience...</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Banner / Utility Badges (African Market Optimization) */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-xs px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {tenant.has_solar_backup && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                100% Solar Backup (No Load-Shedding)
              </span>
            )}
            {tenant.has_borehole_water && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Borehole Water Running
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              {tenant.phone}
            </span>
            <Link
              href="/admin/dashboard"
              className="text-neutral-400 hover:text-amber-400 transition-colors underline underline-offset-4"
            >
              Barber / Staff Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Premium Grooming Lounge
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 (184 client reviews)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {tenant.name}
              </h1>
              <p className="mt-2 text-neutral-400 flex items-center gap-1.5 text-sm sm:text-base">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {tenant.address}
              </p>
            </div>

            {/* Direct Booking CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/${tenant.slug}/ai-studio`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-sm border border-amber-500/40 shadow-lg shadow-black/40 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Virtual Try-On (Nails & Hair)
              </Link>
              <Link
                href={`/${tenant.slug}/book`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Scissors className="w-5 h-5" />
                Book Your Chair (30s)
              </Link>
            </div>
          </div>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-neutral-800/60">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Zero Wait Time</p>
                <p className="text-sm font-semibold text-neutral-200">Guaranteed Reserved Chair</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <Wallet className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">No Small Change Stress</p>
                <p className="text-sm font-semibold text-neutral-200">Digital Change Wallet Ready</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">Multi-Payment Methods</p>
                <p className="text-sm font-semibold text-neutral-200">USD Cash, EcoCash, InnBucks</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Menu Grid */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Service Menu & Pricing
            </h2>
            <span className="text-xs text-neutral-400">
              {filteredServices.length} options available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group relative p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between"
              >
                {service.is_featured && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    VIP Choice
                  </span>
                )}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mt-0.5">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-white">
                      ${service.price_usd.toFixed(2)}
                    </span>
                    {service.price_zwg && (
                      <span className="text-xs text-neutral-400">
                        / ZiG {service.price_zwg.toFixed(0)}
                      </span>
                    )}
                    <span className="text-xs text-neutral-500 flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes}m
                    </span>
                  </div>

                  <Link
                    href={`/${tenant.slug}/book?serviceId=${service.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-xs font-semibold text-neutral-200 transition-all"
                  >
                    Select
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Master Stylists / Chairs */}
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              Resident Master Barbers
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Choose your favorite barber or select &apos;First Available&apos; during booking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {staff.map((barber) => (
              <div
                key={barber.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/40 mb-3 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      barber.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                    }
                    alt={barber.full_name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full"></span>
                </div>
                <h3 className="font-bold text-white text-base">{barber.full_name}</h3>
                <span className="text-xs text-amber-400 font-medium capitalize mt-0.5">
                  Senior Chair Master
                </span>

                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {barber.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/${tenant.slug}/book?barberId=${barber.id}`}
                  className="mt-4 w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
                >
                  Book with {barber.full_name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Digital Change Wallet Feature Callout (Monetization & Retention Moat) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block mb-3">
                Local Cashflow Innovation
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Never worry about $1, $2, or $5 change again
              </h3>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                When paying in USD cash at our shop, any remaining change can instantly be credited
                to your personal Digital Change Wallet attached to your WhatsApp phone number.
                Redeem it automatically on your next haircut!
              </p>
            </div>
            <Link
              href={`/${tenant.slug}/book`}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm whitespace-nowrap transition-transform active:scale-95"
            >
              Reserve Chair Now →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 px-4 text-center text-xs text-neutral-500">
        <p>© 2026 {tenant.name}. Powered by TrimFlow AI Enterprise SaaS.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/admin/dashboard" className="hover:text-neutral-400 underline">
            Salon Admin Cockpit
          </Link>
          <Link href="/admin/pos" className="hover:text-neutral-400 underline">
            POS & Change Wallet
          </Link>
        </div>
      </footer>
    </div>
  );
}
