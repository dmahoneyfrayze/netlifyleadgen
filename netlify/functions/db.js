// Database module for Netlify functions
// Handles SQLite operations for storing form submissions and AI responses

const path = require('path');
const fs = require('fs');

// Use the /tmp directory in Netlify Functions
const dbPath = path.join('/tmp', 'frayze-submissions.db');

// Check if better-sqlite3 is available, otherwise fall back to sqlite3
let db;
let sqlite;
let isFallbackMode = false;

try {
  console.log('Attempting to load better-sqlite3...');
  sqlite = require('better-sqlite3');
  console.log('Successfully loaded better-sqlite3');
  
  try {
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created directory: ${dbDir}`);
    }
    
    db = new sqlite(dbPath);
    console.log('Successfully connected to SQLite database using better-sqlite3');
  } catch (dbError) {
    console.error('Failed to initialize better-sqlite3 database:', dbError.message);
    throw dbError; // Re-throw to be caught by the outer catch
  }
} catch (err) {
  console.log('Failed to load better-sqlite3:', err.message);
  
  try {
    console.log('Attempting to load sqlite3...');
    const sqlite3 = require('sqlite3').verbose();
    console.log('Successfully loaded sqlite3');
    
    try {
      // Ensure the directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`Created directory: ${dbDir}`);
      }
      
      db = new sqlite3.Database(dbPath);
      console.log('Successfully connected to SQLite database using sqlite3');
    } catch (dbError) {
      console.error('Failed to initialize sqlite3 database:', dbError.message);
      throw dbError; // Re-throw to be caught by the outer catch
    }
  } catch (err2) {
    console.error('Failed to load any SQLite implementation:', err2.message);
    console.warn('Creating in-memory fallback database (data will not persist between function invocations)');
    db = createFallbackDb();
    isFallbackMode = true;
  }
}

// Initialize the database
function initializeDb() {
  try {
    console.log('Initializing database schema at', dbPath);
    
    if (isFallbackMode) {
      console.log('Using in-memory fallback database');
      return true; // Fallback DB is already initialized
    }
    
    if (db.exec) {
      // better-sqlite3
      db.exec(`
        CREATE TABLE IF NOT EXISTS form_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          form_id TEXT UNIQUE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          data TEXT
        );
        
        CREATE TABLE IF NOT EXISTS ai_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          form_id TEXT UNIQUE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          ai_response TEXT,
          response_type TEXT
        );
      `);
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS form_submissions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              form_id TEXT UNIQUE,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              data TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Error creating form_submissions table:', err);
              reject(err);
            }
          });
          
          db.run(`
            CREATE TABLE IF NOT EXISTS ai_responses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              form_id TEXT UNIQUE,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              ai_response TEXT,
              response_type TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Error creating ai_responses table:', err);
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      });
    }
    
    console.log('Database schema initialized successfully');
    return true;
  } catch (err) {
    console.error('Failed to initialize database schema:', err);
    return false;
  }
}

// Save form submission data
function saveFormSubmission(formId, formData) {
  try {
    if (isFallbackMode) {
      return db.saveFormSubmission(formId, formData);
    }
    
    const data = JSON.stringify(formData);
    
    if (db.prepare) {
      // better-sqlite3
      const stmt = db.prepare('INSERT OR REPLACE INTO form_submissions (form_id, data) VALUES (?, ?)');
      const result = stmt.run(formId, data);
      return result.changes > 0;
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT OR REPLACE INTO form_submissions (form_id, data) VALUES (?, ?)',
          [formId, data],
          function(err) {
            if (err) {
              console.error('Error saving form submission:', err);
              reject(err);
            } else {
              resolve(this.changes > 0);
            }
          }
        );
      });
    }
  } catch (err) {
    console.error('Error saving form submission:', err);
    return false;
  }
}

// Save AI response data
function saveAiResponse(formId, aiResponse, responseType = 'html') {
  try {
    if (isFallbackMode) {
      return db.saveAiResponse(formId, aiResponse, responseType);
    }
    
    if (db.prepare) {
      // better-sqlite3
      const stmt = db.prepare('INSERT OR REPLACE INTO ai_responses (form_id, ai_response, response_type) VALUES (?, ?, ?)');
      const result = stmt.run(formId, aiResponse, responseType);
      return result.changes > 0;
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT OR REPLACE INTO ai_responses (form_id, ai_response, response_type) VALUES (?, ?, ?)',
          [formId, aiResponse, responseType],
          function(err) {
            if (err) {
              console.error('Error saving AI response:', err);
              reject(err);
            } else {
              resolve(this.changes > 0);
            }
          }
        );
      });
    }
  } catch (err) {
    console.error('Error saving AI response:', err);
    return false;
  }
}

// Get AI response by form ID
function getAiResponse(formId) {
  try {
    if (isFallbackMode) {
      return db.getAiResponse(formId);
    }
    
    if (db.prepare) {
      // better-sqlite3
      const stmt = db.prepare('SELECT * FROM ai_responses WHERE form_id = ?');
      return stmt.get(formId);
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM ai_responses WHERE form_id = ?',
          [formId],
          (err, row) => {
            if (err) {
              console.error('Error getting AI response:', err);
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
    }
  } catch (err) {
    console.error('Error getting AI response:', err);
    return null;
  }
}

// Get form submission by ID
function getFormSubmission(formId) {
  try {
    if (isFallbackMode) {
      return db.getFormSubmission(formId);
    }
    
    if (db.prepare) {
      // better-sqlite3
      const stmt = db.prepare('SELECT * FROM form_submissions WHERE form_id = ?');
      return stmt.get(formId);
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM form_submissions WHERE form_id = ?',
          [formId],
          (err, row) => {
            if (err) {
              console.error('Error getting form submission:', err);
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
    }
  } catch (err) {
    console.error('Error getting form submission:', err);
    return null;
  }
}

// Get the most recent form submission
function getLatestFormSubmission() {
  try {
    if (isFallbackMode) {
      return db.getLatestFormSubmission();
    }
    
    if (db.prepare) {
      // better-sqlite3
      const stmt = db.prepare('SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1');
      return stmt.get();
    } else {
      // sqlite3
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 1',
          (err, row) => {
            if (err) {
              console.error('Error getting latest form submission:', err);
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });
    }
  } catch (err) {
    console.error('Error getting latest form submission:', err);
    return null;
  }
}

// Create a simple in-memory fallback database for when SQLite isn't available
function createFallbackDb() {
  console.warn('Using in-memory fallback database (volatile, will not persist between function invocations)');
  
  const memory = {
    form_submissions: new Map(),
    ai_responses: new Map()
  };
  
  return {
    // Fallback methods
    saveFormSubmission: (formId, formData) => {
      memory.form_submissions.set(formId, {
        form_id: formId,
        data: JSON.stringify(formData),
        created_at: new Date().toISOString()
      });
      console.log(`[Fallback DB] Saved form submission for formId: ${formId}`);
      return true;
    },
    
    saveAiResponse: (formId, aiResponse, responseType) => {
      memory.ai_responses.set(formId, {
        form_id: formId,
        ai_response: aiResponse,
        response_type: responseType,
        created_at: new Date().toISOString()
      });
      console.log(`[Fallback DB] Saved AI response for formId: ${formId}`);
      return true;
    },
    
    getAiResponse: (formId) => {
      const response = memory.ai_responses.get(formId);
      console.log(`[Fallback DB] Retrieved AI response for formId: ${formId}`, response ? 'found' : 'not found');
      return response;
    },
    
    getFormSubmission: (formId) => {
      const submission = memory.form_submissions.get(formId);
      console.log(`[Fallback DB] Retrieved form submission for formId: ${formId}`, submission ? 'found' : 'not found');
      return submission;
    },
    
    getLatestFormSubmission: () => {
      if (memory.form_submissions.size === 0) {
        console.log('[Fallback DB] No form submissions found');
        return null;
      }
      
      // Get the most recently created entry
      const latest = Array.from(memory.form_submissions.values()).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })[0];
      
      console.log(`[Fallback DB] Retrieved latest form submission with formId: ${latest.form_id}`);
      return latest;
    }
  };
}

// Initialize the database
initializeDb();

module.exports = {
  saveFormSubmission,
  saveAiResponse,
  getAiResponse,
  getFormSubmission,
  getLatestFormSubmission,
  isFallbackMode
}; 