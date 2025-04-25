// Netlify serverless function to proxy webhook requests
// This avoids CORS issues by having the request come from the server

const fetch = require('node-fetch');

// Get the webhook URL from environment variables
// This will be set in the Netlify dashboard
// If not set, fall back to the hardcoded URL
const WEBHOOK_URL = process.env.VITE_WEBHOOK_URL || "https://n8n.frayze.ca/webhook-test/d685ac24-5d07-43af-8311-bac8fbfe651d";

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: {
        "Allow": "POST"
      }
    };
  }

  try {
    console.log('Forwarding request to webhook URL:', WEBHOOK_URL);
    
    // Parse the incoming request body
    const payload = JSON.parse(event.body);
    
    // Forward the request to the actual webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Get the response from the webhook
    const responseData = await response.text();

    // Return the webhook's response
    return {
      statusCode: response.status,
      body: responseData,
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    console.error("Webhook proxy error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Internal Server Error",
        error: error.message
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
}; 