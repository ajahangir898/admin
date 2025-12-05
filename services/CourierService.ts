import { CourierConfig, Order } from '../types';

const STEADFAST_ENDPOINT = 'https://portal.steadfast.com.bd/api/v1/create_order';

const sanitizePhone = (value?: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('88') && digits.length > 11) return digits.slice(2);
  if (!digits.startsWith('0')) return `0${digits}`;
  return digits;
};

const normalizeInvoice = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '').slice(-20) || `INV-${Date.now()}`;

const buildSteadfastPayload = (order: Order, config: CourierConfig) => {
  const payload: Record<string, unknown> = {
    invoice: normalizeInvoice(order.id),
    recipient_name: order.customer,
    recipient_phone: sanitizePhone(order.phone),
    recipient_address: order.location,
    recipient_city: order.division || 'Dhaka',
    cod_amount: Math.round(order.amount),
    note: config.instruction || `Delivery type: ${order.deliveryType || 'Regular'}`,
    delivery_type: order.deliveryType === 'Express' ? 'express' : 'regular',
    item_weight: 1,
    requested_delivery_time: order.deliveryType === 'Express' ? 'asap' : undefined,
    product_id: order.productId ? String(order.productId) : undefined,
    product_description: order.productName,
    customer_email: order.email,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, val]) => val !== undefined && val !== null));
};

export interface CourierSyncResult {
  trackingId: string;
  reference?: string;
  payload: Record<string, unknown>;
  response: any;
}

export class CourierService {
  static async sendToSteadfast(order: Order, config: CourierConfig): Promise<CourierSyncResult> {
    if (!config.apiKey || !config.secretKey) {
      throw new Error('Steadfast credentials are missing. Update Courier Settings and try again.');
    }
    if (!order.phone) {
      throw new Error('Customer phone number is missing for this order.');
    }

    const payload = buildSteadfastPayload(order, config);

    try {
      const response = await fetch(STEADFAST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': config.apiKey.trim(),
          'Secret-Key': config.secretKey.trim()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || data?.error || 'Steadfast API request failed.';
        throw new Error(message);
      }

      const trackingId = data?.tracking_id || data?.tracking_code || data?.consignment_id || data?.invoice;
      if (!trackingId) {
        throw new Error('Steadfast response did not include a tracking ID.');
      }

      return {
        trackingId,
        reference: data?.consignment_id || data?.invoice,
        payload,
        response: data
      };
    } catch (error) {
      if (import.meta?.env?.DEV) {
        console.error('Failed to sync with Steadfast', error);
      }
      throw error instanceof Error ? error : new Error('Unexpected error while contacting Steadfast.');
    }
  }
}
