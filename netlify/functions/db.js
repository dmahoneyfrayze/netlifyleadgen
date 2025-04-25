// Database module for Netlify functions
// Handles SQLite operations for storing form submissions and AI responses

const path = require('path');
const fs = require('fs');

// Use the /tmp directory in Netlify Functions
const dbPath = path.join('/tmp', 'frayze-submissions.db');

// Check if better-sqlite3 is available, otherwise fall back to sqlite3
let db;
let sqlite;

try {
  sqlite = require('better-sqlite3');
  console.log('Using better-sqlite3');
  db = new sqlite(dbPath);
} catch (err) {
  console.log('Falling back to sqlite3:', err.message);
  try {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(dbPath);
  } catch (err2) {
    console.error('Failed to load SQLite:', err2.message);
    // Create a simple in-memory fallback
    db = createFallbackDb();
  }
}

// Initialize the database
function initializeDb() {
  try {
    console.log('Initializing database at', dbPath);
    
    // Create directories if they don't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
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
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS form_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_id TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            data TEXT
          )
        `);
        
        db.run(`
          CREATE TABLE IF NOT EXISTS ai_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_id TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            ai_response TEXT,
            response_type TEXT
          )
        `);
      });
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    return false;
  }
}

// Save form submission data
function saveFormSubmission(formId, formData) {
  try {
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
  console.warn('Using in-memory fallback database (volatile, will not persist)');
  
  const memory = {
    form_submissions: new Map(),
    ai_responses: new Map()
  };
  
  return {
    // Better-sqlite3 style interface
    prepare: () => null,
    exec: () => null,
    
    // Custom methods
    saveFormSubmission: (formId, formData) => {
      memory.form_submissions.set(formId, {
        form_id: formId,
        data: JSON.stringify(formData),
        created_at: new Date().toISOString()
      });
      return true;
    },
    
    saveAiResponse: (formId, aiResponse, responseType) => {
      memory.ai_responses.set(formId, {
        form_id: formId,
        ai_response: aiResponse,
        response_type: responseType,
        created_at: new Date().toISOString()
      });
      return true;
    },
    
    getAiResponse: (formId) => {
      return memory.ai_responses.get(formId);
    },
    
    getFormSubmission: (formId) => {
      return memory.form_submissions.get(formId);
    },
    
    getLatestFormSubmission: () => {
      if (memory.form_submissions.size === 0) return null;
      
      // Get the most recently created entry
      return Array.from(memory.form_submissions.values()).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })[0];
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
  getLatestFormSubmission
}; 