// src/lib/supabase.ts
// TrimFlow AI - Database Client & Data Access Layer
// Works seamlessly in both live Supabase (PostgreSQL with RLS) & Local Mock Mode

import { createClient } from '@supabase/supabase-js';
import {
  Tenant,
  Staff,
  Service,
  Client,
  Appointment,
  Transaction,
  PaymentMethod,
  AppointmentStatus,
} from '@/types/database';
import {
  mockTenant,
  mockStaff,
  mockServices,
  mockClients,
  mockAppointments,
} from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// IN-MEMORY STORE (Fallback for smooth local development & live demoing)
// ============================================================================
let localTenants: Tenant[] = [mockTenant];
let localStaff: Staff[] = [...mockStaff];
let localServices: Service[] = [...mockServices];
let localClients: Client[] = [...mockClients];
let localAppointments: Appointment[] = [...mockAppointments];
let localTransactions: Transaction[] = [];

// ============================================================================
// DATA ACCESS LAYER: Multi-Tenant Queries
// ============================================================================

/**
 * Fetch a salon tenant by its URL slug (e.g. "legends-barbershop-avondale")
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as Tenant;
  }

  const found = localTenants.find((t) => t.slug === slug);
  return found || localTenants[0]; // fallback to default demo salon
}

/**
 * Fetch active staff for a salon
 */
export async function getTenantStaff(tenantId: string): Promise<Staff[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);
    return (data as Staff[]) || [];
  }

  return localStaff.filter((s) => s.tenant_id === tenantId && s.is_active);
}

/**
 * Fetch services catalog for a salon
 */
export async function getTenantServices(tenantId: string): Promise<Service[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId);
    return (data as Service[]) || [];
  }

  return localServices.filter((s) => s.tenant_id === tenantId);
}

/**
 * Fetch all appointments for a salon (Owner Operations View)
 */
export async function getTenantAppointments(tenantId: string): Promise<Appointment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('appointments')
      .select('*, client:clients(*), staff:staff(*), service:services(*)')
      .eq('tenant_id', tenantId)
      .order('start_time', { ascending: true });
    return (data as Appointment[]) || [];
  }

  return localAppointments.filter((a) => a.tenant_id === tenantId);
}

/**
 * Find or create a client by phone number (retains hair profile notes and digital change wallet)
 */
export async function findOrCreateClient(
  tenantId: string,
  fullName: string,
  phone: string,
  email?: string
): Promise<Client> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .single();

    if (existing) {
      return existing as Client;
    }

    const { data: created, error } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenantId,
        full_name: fullName,
        phone,
        email,
        store_credit_change_usd: 0,
        total_visits: 1,
      })
      .select()
      .single();

    if (error || !created) throw new Error('Failed to create client');
    return created as Client;
  }

  let client = localClients.find((c) => c.tenant_id === tenantId && c.phone === phone);
  if (!client) {
    client = {
      id: `d0000000-0000-0000-${Date.now()}`,
      tenant_id: tenantId,
      full_name: fullName,
      phone,
      email,
      store_credit_change_usd: 0,
      total_visits: 1,
      created_at: new Date().toISOString(),
    };
    localClients.push(client);
  }
  return client;
}

/**
 * Create a new appointment booking
 */
export async function createAppointment(params: {
  tenantId: string;
  clientName: string;
  clientPhone: string;
  staffId: string;
  serviceId: string;
  startTime: string; // ISO 8601
  notes?: string;
  aiConsultation?: string;
}): Promise<Appointment> {
  const client = await findOrCreateClient(
    params.tenantId,
    params.clientName,
    params.clientPhone
  );

  const services = await getTenantServices(params.tenantId);
  const service = services.find((s) => s.id === params.serviceId);
  if (!service) throw new Error('Service not found');

  const staffList = await getTenantStaff(params.tenantId);
  const staff = staffList.find((s) => s.id === params.staffId);
  if (!staff) throw new Error('Staff member not found');

  const startDate = new Date(params.startTime);
  const endDate = new Date(startDate.getTime() + service.duration_minutes * 60 * 1000);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        tenant_id: params.tenantId,
        client_id: client.id,
        staff_id: params.staffId,
        service_id: params.serviceId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'confirmed',
        booking_source: 'web_client',
        total_amount: service.price_usd,
        deposit_amount: 0,
        notes: params.notes,
        ai_consultation_summary: params.aiConsultation,
      })
      .select('*, client:clients(*), staff:staff(*), service:services(*)')
      .single();

    if (error || !data) throw new Error('Failed to create appointment');
    return data as Appointment;
  }

  const newAppointment: Appointment = {
    id: `e0000000-0000-0000-${Date.now()}`,
    tenant_id: params.tenantId,
    client_id: client.id,
    staff_id: params.staffId,
    service_id: params.serviceId,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    status: 'confirmed',
    booking_source: 'web_client',
    total_amount: service.price_usd,
    deposit_amount: 0,
    notes: params.notes,
    ai_consultation_summary: params.aiConsultation,
    client,
    staff,
    service,
    created_at: new Date().toISOString(),
  };

  localAppointments.unshift(newAppointment);
  return newAppointment;
}

/**
 * Update an appointment's status (e.g. 'in_chair', 'completed', 'no_show')
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('appointments').update({ status }).eq('id', appointmentId);
    return;
  }

  const appt = localAppointments.find((a) => a.id === appointmentId);
  if (appt) {
    appt.status = status;
  }
}

/**
 * POS Checkout with Digital Change Ledger & Commission Splits
 * The competitive game changer:
 * If a customer owes $15 and pays with $20 cash, the $5 change is credited to their phone wallet!
 */
export async function processPOSCheckout(params: {
  tenantId: string;
  appointmentId?: string;
  clientId: string;
  staffId: string;
  serviceAmount: number;
  amountTendered: number; // e.g. $20.00
  paymentMethod: PaymentMethod;
  creditChangeToWallet: boolean; // Turn $5 change into customer store credit
  tipAmount?: number;
}): Promise<{ transaction: Transaction; newClientBalance: number; changeGiven: number }> {
  const tip = params.tipAmount || 0;
  const staffList = await getTenantStaff(params.tenantId);
  const staff = staffList.find((s) => s.id === params.staffId);
  
  // Calculate commission or booth rental cut
  let staffCut = 0;
  let shopCut = 0;

  if (staff?.compensation_type === 'commission') {
    const rate = staff.commission_rate || 0.5;
    staffCut = params.serviceAmount * rate + tip;
    shopCut = params.serviceAmount * (1 - rate);
  } else {
    // Booth rent: barber retains 100% of service + tips; shop collects flat booth rent
    staffCut = params.serviceAmount + tip;
    shopCut = 0;
  }

  // Calculate change
  const rawChange = Math.max(0, params.amountTendered - params.serviceAmount - tip);
  const changeToCredit = params.creditChangeToWallet ? rawChange : 0;
  const cashHandedBack = params.creditChangeToWallet ? 0 : rawChange;

  let newBalance = 0;
  const client = localClients.find((c) => c.id === params.clientId);
  if (client) {
    client.store_credit_change_usd += changeToCredit;
    newBalance = client.store_credit_change_usd;
  }

  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    tenant_id: params.tenantId,
    appointment_id: params.appointmentId,
    staff_id: params.staffId,
    payment_method: params.paymentMethod,
    amount: params.serviceAmount,
    tip_amount: tip,
    shop_cut: shopCut,
    staff_cut: staffCut,
    change_credited_to_wallet: changeToCredit,
    created_at: new Date().toISOString(),
  };

  localTransactions.push(transaction);

  if (params.appointmentId) {
    await updateAppointmentStatus(params.appointmentId, 'completed');
  }

  return {
    transaction,
    newClientBalance: newBalance,
    changeGiven: cashHandedBack,
  };
}
