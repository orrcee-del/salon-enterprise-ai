// src/jobs/re-engagement.ts
// TrimFlow AI - Automated Client Re-Engagement & Retention Worker
// Scans client haircut cycles (e.g., 14 days) and triggers WhatsApp re-booking invites

import { mockClients, mockTenant, mockStaff } from '@/lib/mockData';

export interface RetentionPing {
  clientId: string;
  clientName: string;
  phone: string;
  daysSinceLastCut: number;
  messageText: string;
}

/**
 * Scan client records and identify clients overdue for their routine fresh cut
 */
export async function runRetentionCycleCheck(): Promise<RetentionPing[]> {
  const pings: RetentionPing[] = [];
  const now = Date.now();
  const CYCLE_THRESHOLD_DAYS = 14;

  for (const client of mockClients) {
    if (!client.last_visit_at) continue;

    const lastVisit = new Date(client.last_visit_at).getTime();
    const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

    if (daysSince >= CYCLE_THRESHOLD_DAYS) {
      const barber = mockStaff[0];
      const message = `Hi ${client.full_name.split(' ')[0]}, it's been ${daysSince} days since your last cut at ${mockTenant.name}.\n\n` +
        `Barber ${barber.full_name} has open chairs this Friday at 3:00 PM. Tap here to lock your chair: ` +
        `https://trimflow.app/${mockTenant.slug}/book`;

      pings.push({
        clientId: client.id,
        clientName: client.full_name,
        phone: client.phone,
        daysSinceLastCut: daysSince,
        messageText: message,
      });

      console.log(`[RETENTION DISPATCH] Triggered ping for ${client.full_name} (${daysSince} days overdue)`);
    }
  }

  return pings;
}
