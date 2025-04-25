// Admin utility to view SQLite database contents
// This is for debugging purposes and should be secured in production

const db = require('./db');

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers
    };
  }
  
  // Basic auth check - in production you'd want something more secure
  // For example, require an API key or proper authentication
  const params = event.queryStringParameters || {};
  if (params.key !== 'frayzeadmin') {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
      headers
    };
  }

  try {
    // Check if we're in fallback mode
    const isFallback = db.isFallbackMode || false;
    
    // Get data based on requested table
    const table = params.table || 'all';
    let data = {};
    
    // Check database connection status
    const dbStatus = {
      mode: isFallback ? 'in-memory fallback' : 'SQLite database',
      path: isFallback ? 'N/A' : '/tmp/frayze-submissions.db'
    };
    
    // Get form submissions
    if (table === 'all' || table === 'forms') {
      // Custom function to get all form submissions - we'll need to implement this
      let formSubmissions;
      
      try {
        formSubmissions = await getAllFormSubmissions();
      } catch (error) {
        console.error('Error getting form submissions:', error);
        formSubmissions = { error: error.message };
      }
      
      data.formSubmissions = formSubmissions;
    }
    
    // Get AI responses
    if (table === 'all' || table === 'responses') {
      // Custom function to get all AI responses - we'll need to implement this
      let aiResponses;
      
      try {
        aiResponses = await getAllAiResponses();
      } catch (error) {
        console.error('Error getting AI responses:', error);
        aiResponses = { error: error.message };
      }
      
      data.aiResponses = aiResponses;
    }
    
    // Return the data
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        dbStatus,
        data
      }),
      headers
    };
  } catch (error) {
    console.error('Database admin error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
      headers
    };
  }
};

// Helper function to get all form submissions
async function getAllFormSubmissions() {
  try {
    if (db.isFallbackMode) {
      // For fallback mode, just return what we have in memory
      return 'In-memory fallback mode - submission data not available via API';
    }
    
    // Use the appropriate SQLite API based on which library is being used
    if (db.getAllFormSubmissions) {
      // If we've added this method to the db module
      return await db.getAllFormSubmissions();
    } else {
      // Otherwise create a custom implementation
      // This is for better-sqlite3
      try {
        const sqlite = require('better-sqlite3');
        const dbPath = '/tmp/frayze-submissions.db';
        const dbInstance = new sqlite(dbPath);
        
        const rows = dbInstance.prepare('SELECT * FROM form_submissions ORDER BY created_at DESC').all();
        
        // Parse the JSON data in each row
        return rows.map(row => {
          try {
            return {
              ...row,
              data: JSON.parse(row.data)
            };
          } catch (e) {
            return {
              ...row,
              data: 'Error parsing JSON: ' + e.message
            };
          }
        });
      } catch (error) {
        console.error('Error with better-sqlite3:', error);
        
        // Try sqlite3
        try {
          return new Promise((resolve, reject) => {
            const sqlite3 = require('sqlite3').verbose();
            const dbPath = '/tmp/frayze-submissions.db';
            const dbInstance = new sqlite3.Database(dbPath);
            
            dbInstance.all('SELECT * FROM form_submissions ORDER BY created_at DESC', (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              
              // Parse the JSON data in each row
              const results = rows.map(row => {
                try {
                  return {
                    ...row,
                    data: JSON.parse(row.data)
                  };
                } catch (e) {
                  return {
                    ...row,
                    data: 'Error parsing JSON: ' + e.message
                  };
                }
              });
              
              resolve(results);
            });
          });
        } catch (sqliteError) {
          console.error('Error with sqlite3:', sqliteError);
          return `Error retrieving submissions: ${error.message}, ${sqliteError.message}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting all form submissions:', error);
    return `Error retrieving submissions: ${error.message}`;
  }
}

// Helper function to get all AI responses
async function getAllAiResponses() {
  try {
    if (db.isFallbackMode) {
      // For fallback mode, just return what we have in memory
      return 'In-memory fallback mode - AI response data not available via API';
    }
    
    // Use the appropriate SQLite API based on which library is being used
    if (db.getAllAiResponses) {
      // If we've added this method to the db module
      return await db.getAllAiResponses();
    } else {
      // Otherwise create a custom implementation
      // This is for better-sqlite3
      try {
        const sqlite = require('better-sqlite3');
        const dbPath = '/tmp/frayze-submissions.db';
        const dbInstance = new sqlite(dbPath);
        
        // Limit the size of the response to prevent huge payloads
        const rows = dbInstance.prepare('SELECT id, form_id, created_at, response_type, substr(ai_response, 1, 500) as ai_response_preview FROM ai_responses ORDER BY created_at DESC').all();
        
        return rows.map(row => ({
          ...row,
          ai_response_preview: row.ai_response_preview + (row.ai_response_preview.length >= 500 ? '...(truncated)' : '')
        }));
      } catch (error) {
        console.error('Error with better-sqlite3:', error);
        
        // Try sqlite3
        try {
          return new Promise((resolve, reject) => {
            const sqlite3 = require('sqlite3').verbose();
            const dbPath = '/tmp/frayze-submissions.db';
            const dbInstance = new sqlite3.Database(dbPath);
            
            dbInstance.all('SELECT id, form_id, created_at, response_type, substr(ai_response, 1, 500) as ai_response_preview FROM ai_responses ORDER BY created_at DESC', (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              
              const results = rows.map(row => ({
                ...row,
                ai_response_preview: row.ai_response_preview + (row.ai_response_preview.length >= 500 ? '...(truncated)' : '')
              }));
              
              resolve(results);
            });
          });
        } catch (sqliteError) {
          console.error('Error with sqlite3:', sqliteError);
          return `Error retrieving AI responses: ${error.message}, ${sqliteError.message}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting all AI responses:', error);
    return `Error retrieving AI responses: ${error.message}`;
  }
} 