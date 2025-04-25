/**
 * Callback Storage Utility
 * 
 * This module provides utilities for storing and retrieving n8n callback responses
 * with enhanced fallback mechanisms to ensure data is always available.
 */

// Store a response from n8n in localStorage
export function storeResponse(formId: string, aiResponse: string, source: 'webhook' | 'callback' | 'latest' | 'hardcoded' = 'webhook') {
  if (!formId || !aiResponse) {
    console.error('Cannot store response: Missing formId or aiResponse');
    return false;
  }

  try {
    // Always clean HTML for React compatibility
    const processedResponse = prepareHtmlForReact(aiResponse);
    
    // Prepare the storage object
    const storageObject = {
      formId,
      aiResponse: processedResponse,
      timestamp: new Date().toISOString(),
      source
    };
    
    // Store in both formats for compatibility
    localStorage.setItem(`callback_${formId}`, JSON.stringify(storageObject));
    localStorage.setItem(`webhook_response_${formId}`, JSON.stringify(storageObject));
    
    // Also store as latest response for easier retrieval
    localStorage.setItem('latest_response', JSON.stringify(storageObject));
    
    // Record this formId as the latest
    localStorage.setItem('formId_latest', formId);
    
    // For testing, also store the raw response directly under the formId
    localStorage.setItem(formId, processedResponse);
    
    console.log(`Stored AI response for formId: ${formId} (source: ${source})`);
    return true;
  } catch (error) {
    console.error('Error storing response in localStorage:', error);
    return false;
  }
}

// Get response from localStorage with fallbacks
export function getStoredResponse(formId: string, useFallback: boolean = false): { aiResponse: string } | null {
  if (!formId) {
    console.warn('Cannot get stored response: Missing formId');
    return null;
  }

  try {
    console.log(`Attempting to find response for formId: ${formId}`);
    
    // Log all localStorage keys for debugging
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }
    console.log('Available localStorage keys:', allKeys);
    
    // Strategy 1: Direct lookup by formId
    const directResponse = localStorage.getItem(formId);
    if (directResponse) {
      console.log('Found direct response for formId:', formId);
      return { aiResponse: directResponse };
    }
    
    // Strategy 2: Check callback_formId
    const callbackResponse = localStorage.getItem(`callback_${formId}`);
    if (callbackResponse) {
      try {
        const parsed = JSON.parse(callbackResponse);
        if (parsed && parsed.aiResponse) {
          console.log('Found callback response for formId:', formId);
          return { aiResponse: parsed.aiResponse };
        }
      } catch (e) {
        console.error('Error parsing callback response:', e);
      }
    }
    
    // Strategy 3: Check webhook_response_formId
    const webhookResponse = localStorage.getItem(`webhook_response_${formId}`);
    if (webhookResponse) {
      try {
        const parsed = JSON.parse(webhookResponse);
        if (parsed && parsed.aiResponse) {
          console.log('Found webhook response for formId:', formId);
          return { aiResponse: parsed.aiResponse };
        }
      } catch (e) {
        console.error('Error parsing webhook response:', e);
      }
    }
    
    // If useFallback is false, stop here - only look for direct matches
    // This prevents falling back to hardcoded examples during initial loading
    if (!useFallback) {
      console.log('No direct response found and fallbacks disabled');
      return null;
    }
    
    // Strategy 4: Try latest formId
    const latestFormId = localStorage.getItem('formId_latest');
    if (latestFormId && latestFormId !== formId) {
      console.log(`FormId ${formId} not found, trying latest formId: ${latestFormId}`);
      
      // Try direct lookup for latest formId
      const latestDirectResponse = localStorage.getItem(latestFormId);
      if (latestDirectResponse) {
        console.log('Found direct response for latest formId');
        // Also store for current formId
        localStorage.setItem(formId, latestDirectResponse);
        return { aiResponse: latestDirectResponse };
      }
      
      // Try callback for latest formId
      const latestCallbackResponse = localStorage.getItem(`callback_${latestFormId}`);
      if (latestCallbackResponse) {
        try {
          const parsed = JSON.parse(latestCallbackResponse);
          if (parsed && parsed.aiResponse) {
            console.log('Found callback response for latest formId');
            // Store for current formId too
            storeResponse(formId, parsed.aiResponse, 'callback');
            return { aiResponse: parsed.aiResponse };
          }
        } catch (e) {
          console.error('Error parsing latest callback response:', e);
        }
      }
      
      // Try webhook for latest formId
      const latestWebhookResponse = localStorage.getItem(`webhook_response_${latestFormId}`);
      if (latestWebhookResponse) {
        try {
          const parsed = JSON.parse(latestWebhookResponse);
          if (parsed && parsed.aiResponse) {
            console.log('Found webhook response for latest formId');
            // Store for current formId too
            storeResponse(formId, parsed.aiResponse, 'webhook');
            return { aiResponse: parsed.aiResponse };
          }
        } catch (e) {
          console.error('Error parsing latest webhook response:', e);
        }
      }
    }
    
    // Strategy 5: Check generic latest_response
    const latestResponse = localStorage.getItem('latest_response');
    if (latestResponse) {
      try {
        const parsed = JSON.parse(latestResponse);
        if (parsed && parsed.aiResponse) {
          console.log('Found latest_response entry');
          // Store for current formId too
          storeResponse(formId, parsed.aiResponse, 'latest');
          return { aiResponse: parsed.aiResponse };
        }
      } catch (e) {
        console.error('Error parsing latest_response:', e);
      }
    }
    
    // Strategy 6: Fall back to hardcoded example
    console.log('No response found in localStorage, using hardcoded example');
    const hardcodedHtml = getHardcodedExample();
    storeResponse(formId, hardcodedHtml, 'hardcoded');
    return { aiResponse: hardcodedHtml };
    
  } catch (error) {
    console.error('Error retrieving stored response:', error);
    return null;
  }
}

// Helper to prepare HTML for React
export function prepareHtmlForReact(html: string): string {
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
}

// Clear all stored responses
export function clearAllResponses(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('callback_') || 
                key.startsWith('webhook_response_') || 
                key === 'latest_response' || 
                key === 'formId_latest')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} stored responses`);
}

// Get a hardcoded example for fallback
function getHardcodedExample(): string {
  return `<div className="p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-4">Next Steps with Your Growth Engine System</h2>
  <p className="mb-4">
    Thank you for choosing the <strong>Growth Engine System</strong> for your business. Here's a quick overview of your selection:
  </p>
  <ul className="list-disc list-inside mb-4">
    <li>Growth Engine System includes multi-step funnel, AI responder, call tracking, lead scoring.</li>
  </ul>
  <h3 className="text-xl font-semibold mb-3">3 Key Benefits:</h3>
  <ul className="list-disc list-inside mb-4">
    <li>Effortlessly scale with advanced automation and AI tools.</li>
    <li>Enhance customer engagement through multi-step funnels.</li>
    <li>Improve decision-making with accurate call tracking.</li>
  </ul>
  <h3 className="text-xl font-semibold mb-3">Projected Action Plan:</h3>
  <ul className="list-disc list-inside mb-4">
    <li>Week 1: Kickoff call and campaign goals alignment.</li>
    <li>Week 2: Set up multi-step funnels and AI responders.</li>
    <li>Week 3: Initiate call tracking and lead scoring.</li>
    <li>Week 4: Launch and optimize advertising strategies.</li>
  </ul>
  <p className="mb-4">
    To get started, please schedule a kickoff call using the following link: <a href="https://calendar.notion.so/meet/denis-mahoney/introduction" className="text-blue-500">Schedule Call</a>
  </p>
</div>`;
} 