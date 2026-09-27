// src/app/admin/pos/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Scissors,
  CreditCard,
  Wallet,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  User,
  Phone,
  Receipt,
  Sparkles,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { Staff, Client, PaymentMethod, Transaction } from '@/types/database';
import {
  getTenantBySlug,
  getTenantStaff,
  processPOSCheckout,
  getTenantServices,
} from '@/lib/supabase';
import { mockClients } from '@/lib/mockData';

export default function POSCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get('appointmentId') || '';
  const initialAmount = parseFloat(searchParams.get('amount') || '15.00');

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+263774888999');
  const [clientName, setClientName] = useState<string>('Tatenda Mutasa');
  const [clientWalletBalance, setClientWalletBalance] = useState<number>(5.00);

  // POS State
  const [serviceAmount, setServiceAmount] = useState<number>(initialAmount);
  const [tenderedAmount, setTenderedAmount] = useState<number>(20.00); // e.g. Customer hands $20 bill
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_usd');
  const [creditChangeToWallet, setCreditChangeToWallet] = useState<boolean>(true);
  const [tipAmount, setTipAmount] = useState<number>(0.00);

  const [completedTx, setCompletedTx] = useState<{
    tx: Transaction;
    newBalance: number;
    changeGiven: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function init() {
      const tenant = await getTenantBySlug('legends-barbershop-avondale');
      if (tenant) {
        const staff = await getTenantStaff(tenant.id);
        setStaffList(staff);
        if (staff.length > 0) setSelectedStaffId(staff[0].id);
      }
    }
    init();
  }, []);

  const changeDue = Math.max(0, tenderedAmount - serviceAmount - tipAmount);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setIsProcessing(true);
    try {
      const res = await processPOSCheckout({
        tenantId: 'a0000000-0000-0000-0000-000000000001',
        appointmentId: appointmentId || undefined,
        clientId: 'd0000000-0000-0000-0000-000000000001',
        staffId: selectedStaffId,
        serviceAmount,
        amountTendered: tenderedAmount,
        paymentMethod,
        creditChangeToWallet,
        tipAmount,
      });

      setCompletedTx({
        tx: res.transaction,
        newBalance: res.newClientBalance,
        changeGiven: res.changeGiven,
      });
    } catch (err) {
      console.error('POS Checkout failed:', err);
      alert('Checkout failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Live Floor
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">TrimFlow POS</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Change Ledger Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {completedTx ? (
          /* Receipt / Completed State */
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">Payment Reconciled!</h2>
              <p className="text-xs text-neutral-400">
                Transaction recorded with split commission ledger and digital change balance.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs text-neutral-400">Transaction ID</span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {completedTx.tx.id}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Service Rendered</span>
                  <span className="font-semibold text-white">${completedTx.tx.amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tip</span>
                  <span className="font-semibold text-white">${completedTx.tx.tip_amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Tendered</span>
                  <span className="font-semibold text-emerald-400">${tenderedAmount.toFixed(2)} USD</span>
                </div>

                {/* Change Ledger Breakdown */}
                {completedTx.tx.change_credited_to_wallet > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-amber-400 font-bold block">
                        +${completedTx.tx.change_credited_to_wallet.toFixed(2)} Change Credited
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Added to client&apos;s phone wallet!
                      </span>
                    </div>
                    <Wallet className="w-5 h-5 text-amber-400" />
                  </div>
                ) : (
                  <div className="flex justify-between text-neutral-400">
                    <span>Physical Cash Change Given</span>
                    <span>${completedTx.changeGiven.toFixed(2)}</span>
                  </div>
                )}

                {/* Back-office Split Ledger */}
                <div className="border-t border-neutral-800 pt-3 space-y-1 text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>Barber / Stylist Payout</span>
                    <span className="font-mono text-neutral-200">
                      ${completedTx.tx.staff_cut.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Shop Revenue Share</span>
                    <span className="font-mono text-neutral-200">
                      ${completedTx.tx.shop_cut.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setCompletedTx(null);
                    router.push('/admin/dashboard');
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
                >
                  Return to Live Floor
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* POS Checkout Form */
          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Payment Inputs */}
            <div className="md:col-span-2 space-y-6">
              {/* Client & Chair Section */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Client & Chair Assignment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">
                      WhatsApp Phone (Wallet ID)
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-neutral-400 block mb-1">Servicing Barber</label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.compensation_type === 'commission' ? '50% Split' : 'Booth Rent'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Existing Change Credit Badge */}
                {clientWalletBalance > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-emerald-400">
                      Existing Change Credit on Phone: <strong>${clientWalletBalance.toFixed(2)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAmount((prev) => Math.max(0, prev - clientWalletBalance));
                        setClientWalletBalance(0);
                      }}
                      className="px-2 py-1 rounded bg-emerald-500 text-neutral-950 font-bold text-[10px]"
                    >
                      Apply Store Credit
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Select Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_usd')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cash_usd'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">Cash USD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('innbucks')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'innbucks'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">InnBucks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ecocash_usd')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'ecocash_usd'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold">EcoCash USD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold">Bank Card</span>
                  </button>
                </div>
              </div>

              {/* Tendering & Quick Cash Pills */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Amount Tendered (USD Bill Given)
                </h3>

                <div className="flex gap-2">
                  {[10, 20, 50, 100].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setTenderedAmount(bill)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        tenderedAmount === bill
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-500'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      ${bill}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Custom Cash In Hand</label>
                    <input
                      type="number"
                      step="1"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Barber Tip ($)</label>
                    <input
                      type="number"
                      step="1"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Summary & Digital Change Ledger */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 sticky top-20 shadow-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Checkout Summary
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">Total Due</span>
                    <span className="text-2xl font-black text-white">
                      ${(serviceAmount + tipAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Change Calculation Box */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Change Due:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${changeDue.toFixed(2)} USD
                    </span>
                  </div>

                  {changeDue > 0 && (
                    <div className="pt-2 border-t border-neutral-800/80">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={creditChangeToWallet}
                          onChange={(e) => setCreditChangeToWallet(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-0 bg-neutral-800 border-neutral-600"
                        />
                        <div className="text-[11px] leading-tight text-neutral-300">
                          <span className="font-bold text-amber-400 block">
                            Credit ${changeDue.toFixed(2)} to Digital Change Wallet
                          </span>
                          Locks change to client&apos;s phone number for their next cut.
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Reconciling...' : 'Complete POS Checkout →'}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
