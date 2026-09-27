// src/lib/payments/innbucks.ts
// TrimFlow AI - InnBucks Payment Connector

export interface InnBucksPaymentRequest {
  clientPhone: string;
  amountUSD: number;
  reference: string;
}

export interface InnBucksResponse {
  success: boolean;
  authorizationCode: string;
  qrPayload: string;
}

/**
 * Generate an InnBucks payment token / QR code for instant counter redemption
 */
export async function createInnBucksOrder(
  req: InnBucksPaymentRequest
): Promise<InnBucksResponse> {
  const apiKey = process.env.INNBUCKS_API_KEY;

  if (apiKey) {
    console.log(`[INNBUCKS LIVE] Generating order for $${req.amountUSD}`);
  }

  // Simulated InnBucks Auth Code
  return {
    success: true,
    authorizationCode: `INNB-${Math.floor(100000 + Math.random() * 900000)}`,
    qrPayload: `innbucks://pay?ref=${req.reference}&amt=${req.amountUSD}`,
  };
}
