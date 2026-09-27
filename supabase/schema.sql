-- supabase/schema.sql
-- TrimFlow AI: Multi-Tenant Enterprise Database Schema with Row-Level Security (RLS)
-- Tailored for African & Emerging Markets

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENANTS (Salons / Barbershops)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(60) UNIQUE NOT NULL, -- e.g. "legends-barbershop-avondale"
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(50) DEFAULT 'Harare',
  currency_preference VARCHAR(10) DEFAULT 'USD',
  has_solar_backup BOOLEAN DEFAULT TRUE,
  has_borehole_water BOOLEAN DEFAULT TRUE,
  subscription_plan VARCHAR(20) DEFAULT 'starter',
  notification_credits INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. STAFF & BARBERS (Chair Operators)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('owner', 'manager', 'barber', 'stylist')) DEFAULT 'barber',
  compensation_type VARCHAR(20) CHECK (compensation_type IN ('booth_rent', 'commission', 'salary')) DEFAULT 'commission',
  booth_rent_fee NUMERIC(10, 2) DEFAULT 0.00,
  commission_rate NUMERIC(5, 2) DEFAULT 0.50, -- e.g. 50% split
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. SERVICE CATALOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'Haircut', 'Beard', 'Treatment', 'Combo', 'Styling'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price_usd NUMERIC(10, 2) NOT NULL,
  price_zwg NUMERIC(12, 2),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CLIENTS / CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL, -- WhatsApp number: e.g. +263771234567
  email VARCHAR(100),
  store_credit_change_usd NUMERIC(10, 2) DEFAULT 0.00, -- Digital change wallet
  hair_profile_notes TEXT, -- e.g. "Low skin fade, #1.5 guard on top, sensitive neck"
  total_visits INT DEFAULT 0,
  last_visit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_tenant_client_phone UNIQUE (tenant_id, phone)
);

-- ============================================================================
-- 5. APPOINTMENTS & BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'in_chair', 'completed', 'cancelled', 'no_show')) DEFAULT 'confirmed',
  booking_source VARCHAR(20) DEFAULT 'web_client',
  total_amount NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
  notes TEXT,
  ai_consultation_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. TRANSACTIONS & POS LEDGER
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  staff_id UUID REFERENCES staff(id),
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash_usd', 'innbucks', 'ecocash_usd', 'card', 'store_credit')) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  tip_amount NUMERIC(10, 2) DEFAULT 0.00,
  shop_cut NUMERIC(10, 2) NOT NULL,
  staff_cut NUMERIC(10, 2) NOT NULL,
  change_credited_to_wallet NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_phone ON clients(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_time ON appointments(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures complete isolation between different salons!
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy for Tenants & Services (Needed so public clients can view booking page)
CREATE POLICY "Public can view active tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public can view tenant services" ON services FOR SELECT USING (true);
CREATE POLICY "Public can view tenant staff" ON staff FOR SELECT USING (is_active = true);

-- 2. Clients can insert bookings
CREATE POLICY "Public clients can create appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public clients can register or find their record" ON clients FOR SELECT USING (true);
CREATE POLICY "Public clients can insert their client profile" ON clients FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SEED DATA: Realistic Harare Flagship Barbershop
-- ============================================================================
INSERT INTO tenants (id, name, slug, phone, address, city, currency_preference, has_solar_backup, has_borehole_water, subscription_plan, notification_credits)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Legends Barbershop & Lounge',
  'legends-barbershop-avondale',
  '+263772123456',
  'Shop 4, Avondale Shopping Centre, Harare',
  'Harare',
  'USD',
  true,
  true,
  'pro',
  250
) ON CONFLICT (slug) DO NOTHING;

-- Staff members (Chairs)
INSERT INTO staff (id, tenant_id, full_name, phone, role, compensation_type, booth_rent_fee, commission_rate, avatar_url)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Tinashe "Blade" Moyo', '+263771111111', 'barber', 'commission', 0, 0.50, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Farai Chiweshe', '+263772222222', 'barber', 'booth_rent', 15.00, 0.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Kelvin "FadeKing" Sibanda', '+263773333333', 'barber', 'commission', 0, 0.55, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO services (id, tenant_id, category, name, description, duration_minutes, price_usd, is_featured)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Haircut', 'Signature Precision Fade', 'Precision skin fade, clipper sculpt, razor edge & alcohol rub.', 30, 10.00, true),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Beard', 'Hot Towel Beard Sculpt & Oil', 'Steamed essential oil towel, warm lather straight-razor lineup, and beard balm.', 20, 7.00, true),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Combo', 'The Executive VIP Package', 'Signature Fade + Hot Towel Shave + Black Charcoal Face Mask + Scalp Massage.', 50, 20.00, true),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Treatment', 'Charcoal Detox Mask & Steam', 'Deep pore blackhead extraction and eucalyptus facial mist.', 25, 8.00, false)
ON CONFLICT (id) DO NOTHING;
