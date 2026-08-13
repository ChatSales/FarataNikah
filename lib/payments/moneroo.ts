import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Moneroo Standard API — https://docs.moneroo.io/payments/initialize-payment
const MONEROO_API_BASE = "https://api.moneroo.io/v1";

export interface MonerooCheckoutParams {
  amountFcfa: number;
  description: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  returnUrl: string;
  metadata: Record<string, string>;
}

export interface MonerooCheckoutResult {
  checkoutUrl: string;
  transactionId: string;
}

export async function createMonerooCheckout(
  params: MonerooCheckoutParams
): Promise<MonerooCheckoutResult> {
  const apiKey = process.env.MONEROO_API_KEY;
  if (!apiKey) throw new Error("MONEROO_API_KEY n'est pas configurée.");

  const response = await fetch(`${MONEROO_API_BASE}/payments/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount: params.amountFcfa,
      currency: "XOF",
      description: params.description,
      customer: {
        email: params.customerEmail,
        first_name: params.customerFirstName,
        last_name: params.customerLastName,
      },
      return_url: params.returnUrl,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Moneroo a refusé la requête (${response.status}) : ${errorBody}`);
  }

  const json = await response.json();
  const checkoutUrl: string | undefined = json?.data?.checkout_url;
  const transactionId: string | undefined = json?.data?.id;
  if (!checkoutUrl || !transactionId) {
    throw new Error("Réponse Moneroo inattendue : " + JSON.stringify(json));
  }

  return { checkoutUrl, transactionId };
}

export type MonerooWebhookEventType =
  | "payment.initiated"
  | "payment.success"
  | "payment.failed"
  | "payment.cancelled";

export interface MonerooWebhookPayload {
  event: MonerooWebhookEventType;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

// HMAC-SHA256(payload, webhook secret), sent as X-Moneroo-Signature.
// https://docs.moneroo.io/introduction/webhooks
export function verifyMonerooSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.MONEROO_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}
