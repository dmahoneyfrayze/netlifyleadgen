// Type declaration for import.meta.env
interface ImportMetaEnv {
  readonly VITE_WEBHOOK_URL: string | undefined;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Environment variables
// Default to the hardcoded URL if environment variable is not available
export const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || "https://n8n.frayze.ca/webhook-test/d685ac24-5d07-43af-8311-bac8fbfe651d";

// Create an alternative URL for CORS issues
// For development, you could use a CORS proxy service
export const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/";

// Create a URL for the Netlify function proxy
export const NETLIFY_FUNCTION_URL = "/.netlify/functions/webhook-proxy";

// Get the appropriate webhook URL based on the environment
export const getProxiedWebhookUrl = () => {
  // Prefer the Netlify function approach for all environments
  return NETLIFY_FUNCTION_URL;
  
  // Fallback to direct URL with CORS proxy if needed
  // if (import.meta.env.DEV) {
  //   return CORS_PROXY_URL + WEBHOOK_URL;
  // }
  // return WEBHOOK_URL;
}; 