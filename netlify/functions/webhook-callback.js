// Netlify serverless function to handle the callback from n8n
// This receives the AI-generated content after n8n processes the form data

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
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: {
        "Allow": "POST",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }

  try {
    // Log the request for debugging
    console.log('Received callback from n8n with body length:', event.body.length);
    
    // Parse the incoming data from n8n
    const data = JSON.parse(event.body);
    
    // Check if there's AI response content
    if (data.aiResponse) {
      console.log('AI response content received, length:', data.aiResponse.length);
      console.log('First 100 chars of content:', data.aiResponse.substring(0, 100));
    } else {
      console.log('Warning: No aiResponse found in callback data');
    }
    
    // At this point, you would typically store this data somewhere that your frontend can access
    // For example, you could use a database, a file in the Netlify functions environment,
    // or leverage a real-time service like Pusher or Server-Sent Events
    
    // For now, we'll just log it and return a success response
    console.log('Webhook callback processed successfully');
    
    // Add CORS headers to allow calls from anywhere
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Callback received successfully",
        timestamp: new Date().toISOString()
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  } catch (error) {
    console.error("Webhook callback error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        message: "Internal Server Error",
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }
}; 