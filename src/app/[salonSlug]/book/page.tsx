// src/app/[salonSlug]/book/page.tsx
'use client';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Phone,
  MessageSquare,
  ShieldCheck,
  Sun,
  Share2,
} from 'lucide-react';
import { Tenant, Service, Staff, Appointment } from '@/types/database';
import {
  getTenantBySlug,
  getTenantServices,
  getTenantStaff,
  createAppointment,
} from '@/lib/supabase';

const TIME_SLOTS = [
  '09:00 AM',
  '09:45 AM',
  '10:30 AM',
  '11:15 AM',
  '12:00 PM',
  '01:00 PM',
  '01:45 PM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:30 PM',
];

function BookingWizardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.salonSlug as string) || 'legends-barbershop-avondale';

  const initialServiceId = searchParams.get('serviceId') || '';
  const initialBarberId = searchParams.get('barberId') || '';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard Steps: 1: Service, 2: Barber, 3: Date/Time, 4: Client Info, 5: Ticket Confirmed
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [selectedBarberId, setSelectedBarberId] = useState<string>(initialBarberId);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+263');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    async function loadData() {
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

          if (!selectedServiceId && servicesData.length > 0) {
            setSelectedServiceId(servicesData[0].id);
          }
          if (!selectedBarberId && staffData.length > 0) {
            setSelectedBarberId(staffData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load booking context:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedBarber = staff.find((b) => b.id === selectedBarberId);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !selectedServiceId || !selectedBarberId) return;

    if (!clientName.trim() || clientPhone.trim().length < 8) {
      alert('Please enter your full name and valid WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build ISO Start Time from selectedDate and selectedTime
      const [time, modifier] = selectedTime.split(' ');
      const [rawHours, minutes] = time.split(':').map(Number);
      let hours = rawHours;
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const dateObj = new Date(selectedDate);
      dateObj.setHours(hours, minutes, 0, 0);

      const appt = await createAppointment({
        tenantId: tenant.id,
        clientName,
        clientPhone,
        staffId: selectedBarberId,
        serviceId: selectedServiceId,
        startTime: dateObj.toISOString(),
        notes,
      });
      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
      });
      setConfirmedAppointment(appt);
      setStep(5); // Show Ticket
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Could not complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !tenant) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/${tenant.slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Salon
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-bold text-white">{tenant.name}</h1>
            <p className="text-[11px] text-amber-400">VIP Chair Booking</p>
          </div>
          <div className="w-16 flex justify-end">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              Step {step}/4
            </span>
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {/* Step 5: Digital Appointment Ticket (Success State) */}
        {step === 5 && confirmedAppointment && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Your Chair Is Reserved!</h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                An instant confirmation ticket has been dispatched to your WhatsApp (
                <span className="text-amber-400 font-medium">{clientPhone}</span>).
              </p>
            </div>

            {/* The Luxury Boarding Pass Ticket */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/40 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                    Digital Appointment Pass
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">{tenant.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Ref</span>
                  <p className="text-xs font-mono font-bold text-amber-400">
                    #{confirmedAppointment.id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-b border-neutral-800 text-sm">
                <div>
                  <span className="text-xs text-neutral-500 block">Client</span>
                  <p className="font-bold text-white mt-0.5">{clientName}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Master Barber</span>
                  <p className="font-bold text-amber-400 mt-0.5">
                    {confirmedAppointment.staff?.full_name || selectedBarber?.full_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Selected Service</span>
                  <p className="font-semibold text-neutral-200 mt-0.5">
                    {confirmedAppointment.service?.name || selectedService?.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Amount Due</span>
                  <p className="font-extrabold text-emerald-400 mt-0.5">
                    ${confirmedAppointment.total_amount.toFixed(2)} USD
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Date & Time</span>
                  <p className="font-bold text-white mt-0.5">
                    {selectedDate} @ {selectedTime}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Shop Guarantee</span>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <Sun className="w-3.5 h-3.5" />
                    Solar Backup Active
                  </p>
                </div>
              </div>
              {/* Scannable Mirror QR Code */}
              <div className="my-5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Mirror Check-In Code
                  </span>
                  <p className="text-xs text-neutral-300">
                    Scan this code at the salon mirror scanner on arrival.
                  </p>
                  <p className="font-mono text-[10px] text-neutral-500">
                    TICKET:#{confirmedAppointment.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl flex-shrink-0 shadow-md">
                  <QRCodeSVG
                    value={`https://trimflow.app/ticket/${confirmedAppointment.id}`}
                    size={72}
                    level="M"
                  />
                </div>
              </div>
              {/* WhatsApp & Wallet Callout */}
              <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-neutral-300">
                  <span className="text-amber-400 font-semibold">Change Wallet Active:</span> If you
                  pay with USD cash, any balance change will automatically accumulate on your phone
                  number!
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Save / Screenshot Pass
                </button>
                <Link
                  href={`/${tenant.slug}`}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                Step 1: Choose Your Experience
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Select the service package for your visit today.
              </p>
            </div>

            <div className="space-y-3">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {service.category}
                        </span>
                        {service.is_featured && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white">{service.name}</h3>
                      <p className="text-xs text-neutral-400 max-w-sm">{service.description}</p>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-base font-extrabold text-white">
                        ${service.price_usd.toFixed(2)}
                      </p>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {service.duration_minutes}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedServiceId}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all"
              >
                Continue to Barber
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Barber / Chair */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                Step 2: Choose Your Stylist / Barber
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Select your preferred chair operator or pick First Available for quickest service.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {staff.map((barber) => {
                const isSelected = selectedBarberId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all text-center flex flex-col items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        barber.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                      }
                      alt={barber.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700 mb-2"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white">{barber.full_name}</h3>
                      <p className="text-[11px] text-amber-400 font-medium">Chair Master</p>
                    </div>
                    <span
                      className={`mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                disabled={!selectedBarberId}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all"
              >
                Continue to Date & Time
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Verified Time Slots */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                Step 3: Pick Appointment Slot
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Real-time open chairs for {selectedBarber?.full_name}.
              </p>
            </div>

            {/* Date Selector */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Select Day</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Available Chair Times
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all"
              >
                Continue to Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Client Info & Final Confirmation */}
        {step === 4 && (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Step 4: Confirm Your VIP Ticket
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your WhatsApp number to receive your digital ticket and reminder.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Service:</span>
                <span className="font-semibold text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Barber:</span>
                <span className="font-semibold text-white">{selectedBarber?.full_name}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Time:</span>
                <span className="font-semibold text-amber-400">
                  {selectedDate} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300 border-t border-neutral-800 pt-2 font-bold text-sm">
                <span>Total Due at Shop:</span>
                <span className="text-emerald-400">${selectedService?.price_usd.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farai Mukanya"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp Phone Number (for Instant Ticket)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+263 77 123 4567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Cut Preference / Barber Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Low skin fade, beard oil only, sensitive neck..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? 'Securing Chair...' : 'Confirm Appointment (Instant Pass)'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="border-t border-neutral-900 py-4 text-center text-xs text-neutral-500">
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          No upfront deposit required • Pay cash, EcoCash, or InnBucks on arrival
        </p>
      </footer>
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <BookingWizardContent />
    </Suspense>
  );
}
