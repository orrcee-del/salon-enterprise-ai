// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Sun,
  Droplets,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Tenant, Staff, Appointment, AppointmentStatus } from '@/types/database';
import {
  getTenantBySlug,
  getTenantStaff,
  getTenantAppointments,
  updateAppointmentStatus,
} from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter by Barber chair
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');

  async function loadFloorData() {
    setLoading(true);
    try {
      const tenantData = await getTenantBySlug('legends-barbershop-avondale');
      if (tenantData) {
        setTenant(tenantData);
        const [staffData, apptsData] = await Promise.all([
          getTenantStaff(tenantData.id),
          getTenantAppointments(tenantData.id),
        ]);
        setStaff(staffData);
        setAppointments(apptsData);
      }
    } catch (err) {
      console.error('Failed to load floor data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFloorData();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(appointmentId, newStatus);
    // Refresh local state
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
    );
  };

  const toggleSolar = () => {
    if (tenant) {
      setTenant({ ...tenant, has_solar_backup: !tenant.has_solar_backup });
    }
  };

  const toggleBorehole = () => {
    if (tenant) {
      setTenant({ ...tenant, has_borehole_water: !tenant.has_borehole_water });
    }
  };

  const filteredAppointments =
    selectedBarberFilter === 'all'
      ? appointments
      : appointments.filter((a) => a.staff_id === selectedBarberFilter);

  const totalRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.total_amount || 0), 0);

  const activeInChairCount = appointments.filter((a) => a.status === 'in_chair').length;

  if (loading || !tenant) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Admin Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-black">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">TrimFlow</span>
            </Link>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-300">{tenant.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Operations Cockpit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pos"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-neutral-950 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              POS & Change Wallet
            </Link>
            <Link
              href={`/${tenant.slug}`}
              target="_blank"
              className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
            >
              View Client Booking Page ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Today&apos;s Gross Service</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</p>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                Live USD
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Active In Chair</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-amber-400">{activeInChairCount}</p>
              <span className="text-xs text-neutral-500">of {staff.length} chairs</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Today&apos;s Appointments</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white">{appointments.length}</p>
              <span className="text-xs text-neutral-500">booked</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-400 font-medium">WhatsApp Notification Credits</span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white">{tenant.notification_credits}</p>
              <span className="text-xs text-amber-400 hover:underline cursor-pointer">
                + Refill Pack
              </span>
            </div>
          </div>
        </div>

        {/* Live Utility Toggle Controls (Regional Reliability Badges) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Live Infrastructure Status (Visible to Booking Clients)
            </h3>
            <p className="text-xs text-neutral-400">
              Toggle these to let customers know your shop is fully powered during municipal load-shedding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSolar}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                tenant.has_solar_backup
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Solar Backup: {tenant.has_solar_backup ? 'ONLINE' : 'OFFLINE'}
            </button>

            <button
              onClick={toggleBorehole}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                tenant.has_borehole_water
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Borehole Water: {tenant.has_borehole_water ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
        </div>

        {/* Live Floor Schedule */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Live Floor Schedule & Chair Management
              </h2>
              <p className="text-xs text-neutral-400">
                Manage appointment statuses: Client in chair, completed, or no-show.
              </p>
            </div>

            {/* Filter by Chair */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Filter Chair:</span>
              <select
                value={selectedBarberFilter}
                onChange={(e) => setSelectedBarberFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Chairs / Barbers</option>
                {staff.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointments Table / Card List */}
          <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-900/60">
            <div className="divide-y divide-neutral-800">
              {filteredAppointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No appointments found for the selected chair filter.
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const statusColors: Record<AppointmentStatus, string> = {
                    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    in_chair: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
                    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    cancelled: 'bg-neutral-800 text-neutral-400 border-neutral-700',
                    no_show: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };

                  return (
                    <div
                      key={appt.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex flex-col items-center justify-center flex-shrink-0 text-xs border border-neutral-700">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] text-neutral-300 font-mono mt-0.5">
                            {new Date(appt.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">
                              {appt.client?.full_name || 'Walk-in Client'}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                statusColors[appt.status]
                              }`}
                            >
                              {appt.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 flex items-center gap-2">
                            <span>{appt.service?.name}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">
                              Barber: {appt.staff?.full_name}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-neutral-300">
                              {appt.client?.phone}
                            </span>
                          </p>
                          {appt.client?.hair_profile_notes && (
                            <p className="text-[11px] text-neutral-500 italic">
                              Note: {appt.client.hair_profile_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right-Hand Action Controls */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-sm font-black text-emerald-400 mr-2">
                          ${appt.total_amount.toFixed(2)}
                        </span>

                        {appt.status !== 'in_chair' && appt.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'in_chair')}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white text-xs font-semibold transition-all"
                          >
                            Seat in Chair
                          </button>
                        )}

                        {appt.status === 'in_chair' && (
                          <Link
                            href={`/admin/pos?appointmentId=${appt.id}&clientId=${appt.client_id}&staffId=${appt.staff_id}&amount=${appt.total_amount}`}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                          >
                            Checkout POS →
                          </Link>
                        )}

                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'no_show')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
                          >
                            No-Show
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
