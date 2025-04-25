import { WEBHOOK_URL } from './environment';
import { type Addon } from '@/types';

interface FormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  budget: string;
  timeline: string;
  bestTimeToContact: string;
  additionalInfo: string;
  websiteUrl: string;
}

export interface WebhookPayload {
  formData: FormData;
  selectedAddons: Addon[];
  totalPrice: number;
}

/**
 * Sends form data to the webhook
 */
export const submitFormToWebhook = async (payload: WebhookPayload): Promise<boolean> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to submit form data to webhook:', error);
    return false;
  }
}; 