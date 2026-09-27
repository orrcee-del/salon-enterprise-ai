// src/types/database.ts
// TrimFlow AI - Multi-Tenant Enterprise Database Types

export type CurrencyPreference = 'USD' | 'ZWG' | 'MULTI';

export type StaffRole = 'owner' | 'manager' | 'barber' | 'stylist';

export type CompensationType = 'booth_rent' | 'commission' | 'salary';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_chair'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentMethod =
  | 'cash_usd'
  | 'innbucks'
  | 'ecocash_usd'
  | 'card'
  | 'store_credit';

export type ServiceCategory = 'Haircut' | 'Beard' | 'Treatment' | 'Combo' | 'Styling';

/**
 * 1. Tenant (Salon or Barbershop Organization)
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string; // e.g., "legends-barbershop-avondale"
  phone: string;
  address: string;
  city: string; // Harare, Bulawayo, etc.
  currency_preference: CurrencyPreference;
  has_solar_backup: boolean;
  has_borehole_water: boolean;
  subscription_plan: 'starter' | 'pro' | 'enterprise';
  notification_credits: number;
  created_at: string;
}

/**
 * 2. Staff / Barbers / Stylists
 */
export interface Staff {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  role: StaffRole;
  compensation_type: CompensationType;
  booth_rent_fee: number; // e.g. $15/day or $80/week
  commission_rate: number; // e.g. 0.50 (50% split)
  avatar_url?: string;
  specialties?: string[];
  is_active: boolean;
  created_at: string;
}

/**
 * 3. Services Catalog
 */
export interface Service {
  id: string;
  tenant_id: string;
  category: ServiceCategory;
  name: string;
  description?: string;
  duration_minutes: number;
  price_usd: number;
  price_zwg?: number;
  is_featured: boolean;
  created_at: string;
}

/**
 * 4. Clients / Customers
 */
export interface Client {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string; // WhatsApp enabled format e.g. +263771234567
  email?: string;
  store_credit_change_usd: number; // Digital Change Wallet balance!
  hair_profile_notes?: string; // e.g. "Low skin fade, #1.5 guard on top, sensitive neck"
  total_visits: number;
  last_visit_at?: string;
  created_at: string;
}

/**
 * 5. Appointments & Bookings
 */
export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string;
  staff_id: string;
  service_id: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  status: AppointmentStatus;
  booking_source: 'web_client' | 'whatsapp_bot' | 'walk_in' | 'phone';
  total_amount: number;
  deposit_amount: number;
  notes?: string;
  ai_consultation_summary?: string;
  created_at: string;

  // Joined relations for convenience
  client?: Client;
  staff?: Staff;
  service?: Service;
}

/**
 * 6. Transactions & POS Ledger
 */
export interface Transaction {
  id: string;
  tenant_id: string;
  appointment_id?: string;
  staff_id: string;
  payment_method: PaymentMethod;
  amount: number;
  tip_amount: number;
  shop_cut: number; // Salon revenue share
  staff_cut: number; // Barber/Stylist earnings
  change_credited_to_wallet: number; // Amount redirected to store credit change
  created_at: string;
}
