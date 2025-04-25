// Netlify serverless function to proxy webhook requests
// This avoids CORS issues by having the request come from the server

const fetch = require('node-fetch');
const db = require('./db');

// Get the webhook URL from environment variables
// This will be set in the Netlify dashboard
const WEBHOOK_URL = process.env.VITE_WEBHOOK_URL;
if (!WEBHOOK_URL) {
  console.error('VITE_WEBHOOK_URL environment variable is not set');
}

// Get the current site URL
const getSiteUrl = (event) => {
  // Try to get from headers
  const host = event.headers.host || 'frayze.online';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

// Format HTML to be compatible with React's JSX requirements
const prepareHtmlForReact = (html) => {
  // If HTML isn't provided, return an empty string
  if (!html) return '';
  
  try {
    // Replace class with className for React compatibility
    let processed = html.replace(/class=/g, 'className=');
    // Ensure self-closing tags have proper JSX format
    processed = processed.replace(/<(img|br|hr|input)([^>]*)>/g, '<$1$2/>');
    return processed;
  } catch (error) {
    console.error('Error formatting HTML for React:', error);
    return html; // Return original if processing fails
  }
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
  
  // Check if webhook URL is configured
  if (!WEBHOOK_URL) {
    console.error('Webhook URL not configured. Set VITE_WEBHOOK_URL environment variable.');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        message: "Server configuration error: Webhook URL not set"
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
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
    
    // Extract formId early to ensure we always have it available
    const formId = payload.formId || '';
    console.log('Request formId:', formId);
    
    // Store the form submission in the database
    if (formId) {
      try {
        await db.saveFormSubmission(formId, payload);
        console.log('Form submission saved to database for formId:', formId);
      } catch (dbError) {
        console.error('Error saving form submission to database:', dbError);
      }
    }
    
    // Ensure the callbackUrl is an absolute URL
    if (payload.callbackUrl && !payload.callbackUrl.startsWith('http')) {
      const siteUrl = getSiteUrl(event);
      
      // Create the full callback URL with the formId
      const callbackPath = payload.callbackUrl || '/.netlify/functions/webhook-callback';
      const fullCallbackUrl = `${siteUrl}${callbackPath}${callbackPath.includes('?') ? '&' : '?'}formId=${formId}`;
      console.log('Using callback URL:', fullCallbackUrl);
      payload.callbackUrl = fullCallbackUrl;
    }
    
    // Log the payload being sent (excluding sensitive data)
    console.log('Forwarding payload with data structure:', {
      hasFormData: !!payload.formData,
      selectedAddons: payload.selectedAddons?.length || 0,
      totalPrice: payload.totalPrice,
      hasCallbackUrl: !!payload.callbackUrl,
      formId: formId
    });
    
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
      console.log('Received JSON response from webhook');
    } else {
      // If not JSON, just get text
      const textData = await response.text();
      console.log('Received text response from webhook, length:', textData.length);
      try {
        // Try to parse as JSON anyway (sometimes content-type is wrong)
        responseData = JSON.parse(textData);
        console.log('Successfully parsed text response as JSON');
      } catch (e) {
        // If parsing fails, just use the text
        console.log('Response is not JSON, treating as plain text');
        responseData = { text: textData };
      }
    }

    // Check for AI response in the data
    if (responseData.aiResponse) {
      console.log('AI response found in webhook response, length:', responseData.aiResponse.length);
      // Process HTML to be React-compatible
      responseData.aiResponse = prepareHtmlForReact(responseData.aiResponse);
      
      // Store the AI response in the database
      if (formId) {
        try {
          await db.saveAiResponse(formId, responseData.aiResponse, 'html');
          console.log('AI response saved to database for formId:', formId);
        } catch (dbError) {
          console.error('Error saving AI response to database:', dbError);
        }
      }
    } else {
      console.log('No AI response found in webhook response');
    }
    
    // Always include the formId in the response
    responseData.formId = formId;

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
    
    // Get formId from payload if possible
    let formId = '';
    try {
      const payload = JSON.parse(event.body);
      formId = payload.formId || '';
    } catch (e) {
      console.error("Could not extract formId from error payload", e);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        message: "Internal Server Error",
        error: error.message,
        formId: formId // Include formId even in error responses
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
}; 