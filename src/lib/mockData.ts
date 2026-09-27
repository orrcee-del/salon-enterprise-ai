// src/lib/mockData.ts
// TrimFlow AI - Initial Tenant Seed & Mock Store for Local Development & Testing

import { Tenant, Staff, Service, Client, Appointment } from '@/types/database';

export const mockTenant: Tenant = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Legends Barbershop & Lounge',
  slug: 'legends-barbershop-avondale',
  phone: '+263 77 212 3456',
  address: 'Shop 4, Avondale Shopping Centre, Harare',
  city: 'Harare',
  currency_preference: 'USD',
  has_solar_backup: true, // Crucial for load-shedding resilience!
  has_borehole_water: true,
  subscription_plan: 'pro',
  notification_credits: 245,
  created_at: new Date().toISOString(),
};

export const mockStaff: Staff[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    tenant_id: mockTenant.id,
    full_name: 'Tinashe "Blade" Moyo',
    phone: '+263 77 111 1111',
    role: 'barber',
    compensation_type: 'commission',
    booth_rent_fee: 0,
    commission_rate: 0.50, // 50% split
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    specialties: ['Skin Fades', 'Beard Sculpting', 'Hot Towel'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    tenant_id: mockTenant.id,
    full_name: 'Farai Chiweshe',
    phone: '+263 77 222 2222',
    role: 'barber',
    compensation_type: 'booth_rent',
    booth_rent_fee: 15.00, // $15 daily chair rent
    commission_rate: 0.00,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    specialties: ['Classic Scissor Cuts', 'Taper Fades', 'Kids Cuts'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    tenant_id: mockTenant.id,
    full_name: 'Kelvin "FadeKing" Sibanda',
    phone: '+263 77 333 3333',
    role: 'barber',
    compensation_type: 'commission',
    booth_rent_fee: 0,
    commission_rate: 0.55,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    specialties: ['Executive Packages', 'Line-ups', 'Charcoal Facials'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockServices: Service[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    tenant_id: mockTenant.id,
    category: 'Haircut',
    name: 'Signature Precision Skin Fade',
    description: 'Crisp razor finish, clipper sculpting, alcohol cooling spritz & temple balm.',
    duration_minutes: 30,
    price_usd: 10.00,
    price_zwg: 270.00,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    tenant_id: mockTenant.id,
    category: 'Beard',
    name: 'Hot Towel Beard Sculpt & Oil',
    description: 'Eucalyptus steam wrap, straight-razor cheek alignment & organic argan oil conditioning.',
    duration_minutes: 20,
    price_usd: 7.00,
    price_zwg: 190.00,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    tenant_id: mockTenant.id,
    category: 'Combo',
    name: 'The Executive VIP Package',
    description: 'Full Signature Fade + Hot Towel Shave + Black Charcoal Face Mask + Scalp Relief.',
    duration_minutes: 50,
    price_usd: 20.00,
    price_zwg: 540.00,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    tenant_id: mockTenant.id,
    category: 'Treatment',
    name: 'Charcoal Blackhead Mask & Steam',
    description: 'Deep pore detox, ultrasonic nose extraction, and chilled rosewater splash.',
    duration_minutes: 25,
    price_usd: 8.00,
    price_zwg: 215.00,
    is_featured: false,
    created_at: new Date().toISOString(),
  },
];

export const mockClients: Client[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    tenant_id: mockTenant.id,
    full_name: 'Tatenda Mutasa',
    phone: '+263774888999',
    email: 'tatenda@example.co.zw',
    store_credit_change_usd: 5.00, // Has $5 change credited to his wallet!
    hair_profile_notes: 'Drop fade #1.5 on top, avoid alcohol on neckline, prefers matte pomade.',
    total_visits: 6,
    last_visit_at: '2026-09-15T14:30:00Z',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    tenant_id: mockTenant.id,
    full_name: 'Kudakwashe Shumba',
    phone: '+263782555444',
    store_credit_change_usd: 0.00,
    hair_profile_notes: 'High bald taper, keep beard thick, razor lineup only.',
    total_visits: 3,
    last_visit_at: '2026-09-20T11:00:00Z',
    created_at: '2026-08-10T11:00:00Z',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    tenant_id: mockTenant.id,
    client_id: mockClients[0].id,
    staff_id: mockStaff[0].id,
    service_id: mockServices[2].id, // Executive VIP
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    end_time: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    status: 'completed',
    booking_source: 'web_client',
    total_amount: 20.00,
    deposit_amount: 0.00,
    client: mockClients[0],
    staff: mockStaff[0],
    service: mockServices[2],
    created_at: new Date().toISOString(),
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    tenant_id: mockTenant.id,
    client_id: mockClients[1].id,
    staff_id: mockStaff[0].id,
    service_id: mockServices[0].id, // Signature Fade
    start_time: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    status: 'confirmed',
    booking_source: 'web_client',
    total_amount: 10.00,
    deposit_amount: 0.00,
    client: mockClients[1],
    staff: mockStaff[0],
    service: mockServices[0],
    created_at: new Date().toISOString(),
  },
];
