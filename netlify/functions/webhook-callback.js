// Netlify serverless function to handle the callback from n8n
// This receives the AI-generated content after n8n processes the form data

// Import the database module
const db = require('./db');

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
    
    try {
      // Check if we have a stored response for this formId in the database
      const storedResponse = await db.getAiResponse(formId);
      
      if (storedResponse) {
        console.log(`Found stored response in database for formId: ${formId}`);
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            formId: formId,
            aiResponse: storedResponse.ai_response,
            timestamp: storedResponse.created_at
          }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        };
      }
      
      // If not found by exact formId, try to get the latest response
      // This is useful for testing when formIds might change
      const latestSubmission = await db.getLatestFormSubmission();
      if (latestSubmission) {
        console.log(`No response for formId: ${formId}, checking latest submission: ${latestSubmission.form_id}`);
        
        const latestResponse = await db.getAiResponse(latestSubmission.form_id);
        if (latestResponse) {
          console.log(`Found response for latest formId: ${latestSubmission.form_id}`);
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              formId: latestSubmission.form_id,
              originalFormId: formId,
              aiResponse: latestResponse.ai_response,
              timestamp: latestResponse.created_at,
              note: "Using response from latest submission"
            }),
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          };
        }
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
    } catch (error) {
      console.error(`Error retrieving AI response from database for formId: ${formId}:`, error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: "Error retrieving AI response",
          error: error.message,
          formId: formId
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }
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
      
      // Store the AI response in the database
      try {
        await db.saveAiResponse(formId, data.aiResponse, 'html');
        console.log(`AI response saved to database for formId: ${formId}`);
      } catch (dbError) {
        console.error('Error saving AI response to database:', dbError);
      }
    } else {
      console.log(`Warning: No aiResponse found in callback data for formId: ${formId}`);
    }
    
    // Ensure formId is included in the response
    data.formId = formId;
    
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