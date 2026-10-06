// src/types/database.ts
// TrimFlow AI - Multi-Tenant Enterprise Database Types

export type CurrencyPreference = 'USD' | 'ZWG' | 'MULTI';

export type StaffRole = 
  | 'owner' 
  | 'manager' 
  | 'barber' 
  | 'stylist' 
  | 'braider' 
  | 'nail_tech' 
  | 'lash_tech'
  | 'makeup_artist' 
  | 'massage_therapist' 
  | 'esthetician';
  export type ServiceCategory = 
  | 'Haircut' 
  | 'Beard' 
  | 'Braids & Weaves' 
  | 'Nails & Pedicure' 
  | 'Lashes & Brows'
  | 'Makeup & Glam' 
  | 'Spa & Massage' 
  | 'Skincare & Facials' 
  | 'Treatment' 
  | 'Combo';
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
  ai_tryon_data?: {
    category: 'hair' | 'nails' | 'lashes_brows';
    style_name: string;
    details?: {
      color?: string;
      nail_shape?: 'Almond' | 'Coffin' | 'Stiletto' | 'Square';
      max_recommended_length_mm?: number; // e.g. 13mm based on eye-to-brow spacing
      lash_map_style?: 'Cat-Eye' | 'Doll-Eye' | 'Wispy-Hybrid' | 'Classic-Natural';
      brow_shape?: string; // e.g. "Soft Ombre Arch"
    };
  };
    
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
/**
 * 7. Salon Retail & Hairpieces in Stock (Darling, Expressions, Ointments)
 */
export interface InventoryItem {
  id: string;
  tenant_id: string;
  category: 'Braids' | 'Weaves' | 'Product' | 'Accessory';
  name: string; // e.g. "Darling Abuja Braid #1B" or "Expressions French Curl"
  brand: string;
  price_usd: number;
  stock_quantity: number;
  is_active: boolean;
}
