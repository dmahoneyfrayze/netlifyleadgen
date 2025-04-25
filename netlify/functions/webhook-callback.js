// Netlify serverless function to handle the callback from n8n
// This receives the AI-generated content after n8n processes the form data

// This would be a database in a real implementation
// For demo purposes, we'll use an in-memory store
const responseStore = {};

exports.handler = async function(event, context) {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    };
  }
  
  // Extract formId from query parameters if available
  const queryParams = event.queryStringParameters || {};
  const formId = queryParams.formId || 'unknown';
  
  // Handle GET requests to check if we have a response for a formId
  if (event.httpMethod === "GET") {
    console.log(`GET request for formId: ${formId}`);
    
    // Check if we have a stored response for this formId
    if (responseStore[formId]) {
      console.log(`Found stored response for formId: ${formId}`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          ...responseStore[formId]
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }
    
    // No stored response yet
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        message: `No response available yet for formId: ${formId}`,
        formId: formId
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
  
  // Only allow POST requests for submitting new data
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: {
        "Allow": "POST, GET",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }

  try {
    // Log the request for debugging
    console.log(`Received callback from n8n for formId: ${formId} with body length: ${event.body.length}`);
    
    // Parse the incoming data from n8n
    const data = JSON.parse(event.body);
    
    // Format HTML to be compatible with React's JSX requirements if aiResponse exists
    if (data.aiResponse) {
      console.log(`AI response content received for formId: ${formId}, length: ${data.aiResponse.length}`);
      console.log('First 100 chars of content:', data.aiResponse.substring(0, 100));
      
      // Replace class with className for React compatibility
      data.aiResponse = data.aiResponse.replace(/class=/g, 'className=');
      // Ensure self-closing tags have proper JSX format
      data.aiResponse = data.aiResponse.replace(/<(img|br|hr|input)([^>]*)>/g, '<$1$2/>');
    } else {
      console.log(`Warning: No aiResponse found in callback data for formId: ${formId}`);
    }
    
    // Ensure formId is included in the response
    data.formId = formId;
    
    // Store the response for later retrieval via GET requests
    responseStore[formId] = {
      formId: formId,
      aiResponse: data.aiResponse || null,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Stored response for formId: ${formId} for later retrieval`);
    
    // For now, we'll just log it and return a success response
    console.log(`Webhook callback processed successfully for formId: ${formId}`);
    
    // Add CORS headers to allow calls from anywhere
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Callback received successfully",
        formId: formId,
        aiResponse: data.aiResponse || null, // Include the processed aiResponse if it exists
        timestamp: new Date().toISOString()
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    };
  } catch (error) {
    console.error(`Webhook callback error for formId: ${formId}:`, error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        message: "Internal Server Error",
        formId: formId,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    };
  }
}; 