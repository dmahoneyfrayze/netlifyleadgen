// Netlify serverless function to proxy webhook requests
// This avoids CORS issues by having the request come from the server

const fetch = require('node-fetch');

// Get the webhook URL from environment variables
// This will be set in the Netlify dashboard
// If not set, fall back to the hardcoded URL
const WEBHOOK_URL = process.env.VITE_WEBHOOK_URL || "https://n8n.frayze.ca/webhook-test/d685ac24-5d07-43af-8311-bac8fbfe651d";

// Get the current site URL
const getSiteUrl = (event) => {
  // Try to get from headers
  const host = event.headers.host || 'frayze.online';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

exports.handler = async function(event, context) {
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No content
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      }
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: {
        "Allow": "POST",
        "Content-Type": "application/json"
      }
    };
  }

  try {
    console.log('Forwarding request to webhook URL:', WEBHOOK_URL);
    
    // Parse the incoming request body
    const payload = JSON.parse(event.body);
    
    // Ensure the callbackUrl is an absolute URL
    if (payload.callbackUrl && !payload.callbackUrl.startsWith('http')) {
      const siteUrl = getSiteUrl(event);
      // Create the full callback URL
      const fullCallbackUrl = `${siteUrl}/.netlify/functions/webhook-callback`;
      console.log('Using callback URL:', fullCallbackUrl);
      payload.callbackUrl = fullCallbackUrl;
    }
    
    // Forward the request to the actual webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Get the response from the webhook
    let responseData;
    const contentType = response.headers.get('content-type');
    
    // Check if the response is JSON
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // If not JSON, just get text
      const textData = await response.text();
      try {
        // Try to parse as JSON anyway (sometimes content-type is wrong)
        responseData = JSON.parse(textData);
      } catch (e) {
        // If parsing fails, just use the text
        responseData = { text: textData };
      }
    }

    // For demonstration purposes, if n8n doesn't provide an AI response,
    // we'll use the sample HTML snippet provided
    if (!responseData.aiResponse) {
      // In a real implementation, you wouldn't do this here - the callback would handle this
      console.log('No AI response in initial response. Using callback for AI response.');
    }

    // Return the webhook's response with AI-generated content included
    return {
      statusCode: response.status,
      body: JSON.stringify(responseData),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  } catch (error) {
    console.error("Webhook proxy error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        message: "Internal Server Error",
        error: error.message
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
}; 