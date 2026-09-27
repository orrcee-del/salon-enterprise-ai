// src/types/salon.ts
// Multi-Tenant AI Salon & Enterprise Management System Blueprint

/**
 * Enterprise Organization (The Top-Level Parent)
 * E.g., "Luxe Beauty Group", "Drybar Corporate", or a single boutique owner.
 */
export interface Organization {
  id: string;
  name: string;
  plan: 'single_salon' | 'enterprise_multi_location';
  logoUrl?: string;
  contactEmail: string;
  createdAt: string;
}

/**
 * Physical Salon Location (The Storefront / Branch)
 * Single salons will have 1 location; enterprise chains will have many.
 */
export interface Location {
  id: string;
  organizationId: string;
  name: string; // e.g. "SoHo Flagship", "Downtown Austin"
  address: string;
  phone: string;
  timezone: string;
  chairsCount: number;
  openTime: string; // "09:00"
  closeTime: string; // "19:00"
}

/**
 * Staff / Stylists / Floor Team
 */
export type StaffRole = 'owner' | 'salon_manager' | 'senior_stylist' | 'junior_stylist' | 'receptionist';

export interface StaffMember {
  id: string;
  locationId: string;
  organizationId: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  avatarUrl: string;
  specialties: string[]; // ["Balayage", "Vivid Colors", "Precision Cuts"]
  stationNumber?: number;
  commissionRate: number; // e.g. 0.50 (50%)
  isActive: boolean;
}

/**
 * Salon Services Catalog
 */
export type ServiceCategory = 'Haircut' | 'Color & Balayage' | 'Blowout & Styling' | 'Treatments' | 'Nails & Spa';

export interface SalonService {
  id: string;
  locationId?: string; // Optional: if undefined, applies globally across all locations
  organizationId: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number; // e.g. 120 mins for balayage
  bufferMinutes: number; // cleanup time between clients (e.g. 15 mins)
  price: number; // in USD
  description: string;
}

/**
 * Confidential Client Hair Formula & History Record
 * Crucial for colorists: records exact tint mixes, developer volumes, and processing times.
 */
export interface ClientFormulaRecord {
  id: string;
  date: string;
  stylistId: string;
  stylistName: string;
  serviceRendered: string;
  formulaNotes: string; // e.g., "Redken Shades EQ 09P (30ml) + 09V (30ml) + Processing Solution (60ml)"
  processingTimeMinutes: number;
  allergies?: string[]; // e.g. ["PPD allergy", "Bleach sensitivity"]
  photoUrls?: string[];
}

/**
 * Client Profile & History
 */
export interface ClientProfile {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email: string;
  isVip: boolean;
  notes: string;
  formulas: ClientFormulaRecord[];
  totalVisits: number;
  lastVisitDate?: string;
  preferredStylistId?: string;
}

/**
 * Live Appointment Lifecycle Status
 */
export type AppointmentStatus =
  | 'scheduled'   // Booked ahead of time
  | 'confirmed'   // Client replied "YES" to SMS reminder
  | 'in_chair'    // Client is currently receiving service at a station
  | 'completed'   // Finished and paid
  | 'cancelled'   // Cancelled
  | 'no_show';    // Client did not arrive

export interface Appointment {
  id: string;
  organizationId: string;
  locationId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  startTime: string; // ISO 8601 string: "2026-09-20T10:00:00Z"
  endTime: string;   // ISO 8601 string: "2026-09-20T12:00:00Z"
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  bookedVia: 'ai_phone' | 'ai_web_chat' | 'receptionist_manual' | 'online_portal';
}

/**
 * Salon Floor Hardware & Connected Equipment
 */
export interface EquipmentState {
  frontDeskKiosk: {
    status: 'online' | 'offline';
    lastHeartbeat: string;
    deviceType: 'iPad Pro 11-inch';
  };
  cardTerminal: {
    status: 'connected' | 'idle' | 'processing';
    readerModel: 'Stripe Reader M2 (Bluetooth/USB)';
    batteryLevel: number;
  };
  voiceAiReceptionist: {
    status: 'active';
    phoneLine: '+1 (555) 839-2244';
    provider: 'Twilio + Gemini AI Voice Stream';
    totalCallsHandledToday: number;
  };
}
