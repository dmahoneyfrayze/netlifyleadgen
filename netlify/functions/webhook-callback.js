// Netlify serverless function to handle the callback from n8n
// This receives the AI-generated content after n8n processes the form data

exports.handler = async function(event, context) {
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
    // Log the request for debugging
    console.log('Received callback from n8n:', event.body);
    
    // Parse the incoming data from n8n
    const data = JSON.parse(event.body);
    
    // At this point, you would typically store this data somewhere that your frontend can access
    // For example, you could use a database, a file in the Netlify functions environment,
    // or leverage a real-time service like Pusher or Server-Sent Events
    
    // For now, we'll just log it and return a success response
    console.log('Processed callback data:', data);
    
    // Add CORS headers to allow calls from anywhere
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Callback received successfully"
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
        error: error.message
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