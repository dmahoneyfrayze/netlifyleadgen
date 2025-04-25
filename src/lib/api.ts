import { WEBHOOK_URL, getProxiedWebhookUrl } from './environment';
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
    // Use the potentially proxied URL to avoid CORS issues
    const webhookUrl = getProxiedWebhookUrl();
    console.log('Submitting to webhook URL:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No need for no-cors mode when using the Netlify function as a proxy
      body: JSON.stringify(payload),
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`Server responded with ${response.status}: ${await response.text()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to submit form data to webhook:', error);
    return false;
  }
}; 