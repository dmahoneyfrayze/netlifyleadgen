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
  callbackUrl?: string; // Optional callback URL for n8n to send the AI response
}

export interface WebhookResponse {
  success: boolean;
  aiResponse?: string;
  message?: string;
}

// Get the current site URL for building the callback URL
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser environment
    return window.location.origin;
  }
  // Fallback for SSR context or non-browser environments
  return 'https://frayze.online';
};

/**
 * Sends form data to the webhook
 */
export const submitFormToWebhook = async (payload: WebhookPayload): Promise<WebhookResponse> => {
  try {
    // Use the potentially proxied URL to avoid CORS issues
    const webhookUrl = getProxiedWebhookUrl();
    console.log('Submitting to webhook URL:', webhookUrl);
    
    // Add the callback URL to the payload
    const enhancedPayload = {
      ...payload,
      callbackUrl: `${getSiteUrl()}/.netlify/functions/webhook-callback`
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No need for no-cors mode when using the Netlify function as a proxy
      body: JSON.stringify(enhancedPayload),
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`Server responded with ${response.status}: ${await response.text()}`);
      return { 
        success: false,
        message: `Server error: ${response.status}`
      };
    }

    // Try to parse the response for AI content
    try {
      const responseData = await response.json();
      
      // Check if n8n sent back AI-generated content in the initial response
      if (responseData && responseData.aiResponse) {
        return {
          success: true,
          aiResponse: responseData.aiResponse
        };
      }
      
      // If no AI response in the initial response, that's okay - 
      // n8n will send it to the callback URL asynchronously
      return { 
        success: true,
        message: "Form submitted successfully. Response will be sent to callback URL."
      };
    } catch (parseError) {
      // If we can't parse JSON, assume success but no immediate AI response
      console.warn('Could not parse webhook response JSON:', parseError);
      return { 
        success: true,
        message: "Form submitted, waiting for callback response."
      };
    }
  } catch (error) {
    console.error('Failed to submit form data to webhook:', error);
    return { 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 