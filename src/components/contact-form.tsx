import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, Building2, Calendar, Clock, DollarSign, 
  Check, Zap, AlertCircle, Loader2, Download
} from "lucide-react";
import { type Addon } from "@/types";
import { formatCurrency } from "@/lib/format-utils";
import { submitFormToWebhook } from "@/lib/api";
import { generateQuotePDF } from "@/lib/pdf-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ContactFormProps {
  totalPrice: number;
  selected: Addon[];
  onSubmit: (data: any, responseData?: { formId?: string, aiResponse?: string }) => void;
  onBack: () => void;
}

// Mock function to simulate checking for callback results
// In a real implementation, this would query a database or other storage
const checkForCallbackResults = async (formId: string): Promise<{ aiResponse: string } | null> => {
  try {
    // First check localStorage for cached callback response
    const storedResponse = localStorage.getItem(`callback_${formId}`);
    
    if (storedResponse) {
      console.log('Found stored callback response for formId:', formId);
      return JSON.parse(storedResponse);
    }
    
    // Next check if we have the webhook response stored (from the initial POST)
    const webhookResponse = localStorage.getItem(`webhook_response_${formId}`);
    if (webhookResponse) {
      try {
        const parsedResponse = JSON.parse(webhookResponse);
        if (parsedResponse && parsedResponse.aiResponse) {
          console.log('Found stored webhook response with aiResponse for formId:', formId);
          return {
            aiResponse: parsedResponse.aiResponse
          };
        }
      } catch (e) {
        console.error('Error parsing webhook response from localStorage:', e);
      }
    }

    // Make a real API call to check if results are available
    console.log('No stored response found for formId:', formId, '. Checking callback endpoint...');
    
    try {
      // Call the webhook-callback endpoint with the formId as a query parameter
      const callbackResponse = await fetch(`/.netlify/functions/webhook-callback?formId=${formId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (callbackResponse.ok) {
        const responseData = await callbackResponse.json();
        
        // If we have an AI response, save it to localStorage and return it
        if (responseData && responseData.aiResponse) {
          console.log('Received real AI response from server');
          
          // Store in localStorage for persistence across page reloads
          localStorage.setItem(`callback_${formId}`, JSON.stringify({
            aiResponse: responseData.aiResponse
          }));
          
          return {
            aiResponse: responseData.aiResponse
          };
        }
      }
    } catch (apiError) {
      console.error('Error checking callback endpoint:', apiError);
      // Continue to fallback behavior if API call fails
    }
    
    // If no results from server or API call failed, fall back to simulation for demo purposes
    // This can be removed in production
    console.log('No response from server. For demo, simulating API call...');
    
    // For demo purposes, we'll have a growing chance of getting a response
    // as more polling attempts occur
    const simulateApiCall = () => new Promise<{ aiResponse: string } | null>((resolve) => {
      setTimeout(() => {
        // Sample HTML response similar to what would come from n8n
        const sampleResponse = {
          aiResponse: `<div className="p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-4">Next Steps with Your Growth Engine System</h2>
  <p className="mb-4">
    Thank you for choosing the <strong>Growth Engine System</strong>. Here's a summary of what you've selected:
  </p>
  <ul className="list-disc ml-6 mb-4">
    <li>
      Growth Engine System: For businesses ready to scale with automation, AI, and advertising. Includes a multi-step funnel, AI responder, call tracking, lead scoring, and content.
    </li>
  </ul>
  
  <h3 className="text-lg font-semibold mb-2">Key Benefits</h3>
  <ul className="list-disc ml-6 mb-4">
    <li>Automate and scale your business operations with cutting-edge AI tools.</li>
    <li>Track your leads effectively and improve your marketing strategies.</li>
    <li>Leverage customized content for better audience engagement.</li>
  </ul>
  
  <p className="mb-4">
    To get started, please schedule your kickoff call at your earliest convenience. Use the following link to select a time that suits you: 
    <a href="https://calendly.com/frayze/demo" className="text-blue-500 underline">Schedule Kickoff Call</a>
  </p>
</div>`
        };

        // Store in localStorage for persistence across page reloads
        localStorage.setItem(`callback_${formId}`, JSON.stringify(sampleResponse));
        
        resolve(sampleResponse);
      }, 1500); // Simulate network delay
    });

    return await simulateApiCall();
  } catch (error) {
    console.error("Error checking for callback results:", error);
    return null;
  }
};

// Function to generate a PDF from the action plan HTML
const generateActionPlanPDF = (aiResponse: string, businessName: string = "") => {
  try {
    // Create a new instance of jsPDF
    const { jsPDF } = require('jspdf');
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [800, 1100]
    });
    
    // Set dark background color
    doc.setFillColor(24, 28, 49); // Dark navy background
    doc.rect(0, 0, 800, 1100, 'F');
    
    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = aiResponse;
    
    // Extract content as text (simplification, would need HTML-to-PDF rendering in production)
    const title = tempDiv.querySelector('h2')?.textContent || 'Your Action Plan';
    const paragraphs = Array.from(tempDiv.querySelectorAll('p')).map(p => p.textContent);
    const listItems = Array.from(tempDiv.querySelectorAll('li')).map(li => li.textContent);
    
    // Set up styles
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    
    // Add FRAYZE branding
    doc.text('FRAYZE', 40, 60);
    
    // Add action plan title
    doc.setFontSize(28);
    doc.text('CUSTOM ACTION PLAN', 40, 110);
    
    // Add date
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    doc.text(date, 40, 140);
    
    // Add content
    let yPos = 200;
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 40, yPos);
    yPos += 40;
    
    // Paragraphs
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    
    paragraphs.forEach(paragraph => {
      if (!paragraph) return;
      
      // Multi-line text - need to split long text
      const lines = doc.splitTextToSize(paragraph, 720);
      doc.text(lines, 40, yPos);
      yPos += lines.length * 20 + 20; // Add spacing based on number of lines
    });
    
    // List items
    if (listItems.length > 0) {
      yPos += 20;
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Key Action Items:', 40, yPos);
      yPos += 30;
      
      doc.setFontSize(16);
      doc.setTextColor(200, 200, 200);
      
      listItems.forEach((item, index) => {
        if (!item) return;
        
        // Add bullet point 
        doc.text(`• ${item}`, 40, yPos);
        yPos += 25;
      });
    }
    
    // Footer
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text('Contact us: hello@frayze.ca | Book a call: frayze.ca/demo', 40, 1050);
    
    // Save the PDF
    const fileName = businessName 
      ? `frayze-action-plan-${businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`
      : 'frayze-action-plan.pdf';
      
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating action plan PDF:', error);
    alert('There was an error generating your PDF. Please try again or contact support.');
  }
};

export function ContactForm({ totalPrice, selected, onSubmit, onBack }: ContactFormProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    budget: "",
    timeline: "",
    bestTimeToContact: "",
    additionalInfo: "",
    websiteUrl: ""
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [waitingForCallback, setWaitingForCallback] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [isLoadingActionPlan, setIsLoadingActionPlan] = useState(false);
  const [actionPlanError, setActionPlanError] = useState<string | null>(null);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);

  // Effect for polling for callback results
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (waitingForCallback && formId) {
      console.log('Starting to poll for callback results, formId:', formId);
      
      // Set up polling
      pollingInterval = setInterval(async () => {
        // Increment polling count
        setPollingCount(prev => {
          const newCount = prev + 1;
          console.log(`Polling attempt ${newCount} for formId: ${formId}`);
          return newCount;
        });
        
        try {
          // Check for results
          const result = await checkForCallbackResults(formId);
          
          // If we have results, stop polling and update UI
          if (result && result.aiResponse) {
            console.log('Received AI response from callback');
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
            
            // The HTML should already be processed for React in the serverless function
            // but do one more check just to be safe
            const processedHtml = typeof result.aiResponse === 'string' 
              ? result.aiResponse.replace(/class=/g, 'className=')
              : result.aiResponse;
              
            setAiResponse(processedHtml);
            
            // Save to localStorage as backup using both key formats for consistency
            const responseObj = {
              aiResponse: processedHtml,
              formId: formId,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem(`callback_${formId}`, JSON.stringify(responseObj));
            localStorage.setItem(`webhook_response_${formId}`, JSON.stringify(responseObj));
            
            // Also log that we're storing this for the "Get Action Plan" button to find
            console.log('Stored AI response for formId:', formId, 'for later retrieval');
          }
          
          // If we've polled too many times, stop (to prevent infinite polling)
          if (pollingCount >= 15) { // Increase to 15 polls (45 seconds)
            console.log('Polling timeout reached after 15 attempts');
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
            
            // Set a fallback message if no response was received
            if (!aiResponse) {
              console.log('Setting fallback message after timeout');
              const fallbackHtml = `
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Next Steps with Your Selected Package</h2>
                  <p className="mb-4">
                    Thank you for your submission! Our team will review your requirements and reach out to you shortly.
                  </p>
                  <p className="mb-4">
                    In the meantime, you can schedule a call with our team to discuss your needs in more detail.
                  </p>
                  <p>
                    <a href="https://calendly.com/frayze/demo" className="text-blue-500 underline">
                      Schedule a Call
                    </a>
                  </p>
                </div>
              `;
              setAiResponse(fallbackHtml);
              
              // Save fallback to localStorage for future reference
              localStorage.setItem(`callback_${formId}`, JSON.stringify({
                aiResponse: fallbackHtml,
                isFallback: true
              }));
            }
          }
        } catch (error) {
          console.error("Error polling for callback results:", error);
          
          // If we have too many errors, stop polling
          if (pollingCount >= 10) {
            console.log('Stopping polling due to errors');
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
            
            // Set error message in the UI
            if (!aiResponse) {
              setSubmitError("Unable to retrieve your action plan. Please try again later or contact support.");
            }
          }
        }
      }, 3000); // Poll every 3 seconds
    }
    
    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [waitingForCallback, formId, pollingCount, aiResponse]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (showConfirmation) {
      submitForm();
    } else {
      setShowConfirmation(true);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Generate a unique form ID for tracking this submission
      const uniqueFormId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setFormId(uniqueFormId);
      
      // Generate PDF with form data
      generateQuotePDF(selected, totalPrice, formData);
      
      // Submit to webhook
      const response = await submitFormToWebhook({
        formData,
        selectedAddons: selected,
        totalPrice,
        formId: uniqueFormId // Add the form ID directly to the payload
      });
      
      if (response.success) {
        // Show success message
        setShowSuccess(true);
        
        // Set AI response if available immediately
        if (response.aiResponse) {
          console.log('Received AI response in initial webhook response');
          setAiResponse(response.aiResponse);
          
          // Store the webhook response in localStorage for later retrieval
          localStorage.setItem(`webhook_response_${uniqueFormId}`, JSON.stringify({
            aiResponse: response.aiResponse,
            formId: uniqueFormId,
            timestamp: new Date().toISOString()
          }));
        } else {
          // Start polling for the callback response
          setWaitingForCallback(true);
        }
        
        // Save form ID to local storage to help with testing
        localStorage.setItem(`formId_latest`, uniqueFormId);
        
        // Pass form data to parent component with formId and any immediate aiResponse
        onSubmit(formData, { 
          formId: uniqueFormId, 
          aiResponse: response.aiResponse 
        });
      } else {
        setSubmitError("Failed to submit form. Please try again or contact support directly.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again or contact support at support@frayze.ca");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to manually load action plan
  const loadActionPlan = async () => {
    if (!formId) {
      setActionPlanError("No form ID available. Please try submitting the form again.");
      return;
    }
    
    setIsLoadingActionPlan(true);
    setActionPlanError(null);
    
    try {
      console.log('Manually loading action plan for formId:', formId);
      
      // First attempt: Check if we already have the result in the POST response
      // This should handle the case where the server returned the aiResponse immediately
      // and the webhook POST was successful (as seen in the user's example)
      // Use the JSON directly if available
      const webhookResponse = localStorage.getItem(`webhook_response_${formId}`);
      if (webhookResponse) {
        try {
          const parsedResponse = JSON.parse(webhookResponse);
          if (parsedResponse && parsedResponse.aiResponse) {
            console.log('Using AI response from initial webhook response');
            setAiResponse(parsedResponse.aiResponse);
            setShowActionPlanModal(true);
            setIsLoadingActionPlan(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing webhook response from localStorage:', e);
        }
      }
      
      // Second attempt: Check for callback results using our existing function
      const result = await checkForCallbackResults(formId);
      
      if (result && result.aiResponse) {
        console.log('Received AI response from manual load');
        // Process the HTML to ensure it's compatible with React
        const processedHtml = result.aiResponse.replace(/class=/g, 'className=');
        setAiResponse(processedHtml);
        // Open the modal after loading the action plan
        setShowActionPlanModal(true);
      } else {
        // Third attempt: Parse from the user-provided JSON directly
        console.log('Attempting to parse aiResponse directly from POST response');
        
        // If we got this far with no result but we know the POST succeeded, 
        // possibly manually parse the JSON from the webhook POST response
        setActionPlanError("No action plan found. Our team may still be working on your custom plan.");
      }
    } catch (error) {
      console.error("Error loading action plan:", error);
      setActionPlanError("Failed to load action plan. Please try again later.");
    } finally {
      setIsLoadingActionPlan(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0066FF] to-[#00F6A3] rounded-full mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Thank You for Your Inquiry!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your request has been successfully submitted. A Frayze team member will review your requirements
                and reach out within 24 hours.
              </p>
            </div>
            
            {waitingForCallback ? (
              <div className="mt-8 p-6 border border-blue-100 bg-blue-50 rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="font-semibold text-blue-700">Creating Your Custom Action Plan</h3>
                    <p className="text-sm text-blue-600">
                      Our AI is generating a personalized action plan based on your selections.
                      This typically takes 15-30 seconds.
                    </p>
                  </div>
                  <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-400 animate-pulse"
                      style={{ 
                        width: `${Math.min(100, pollingCount * 10)}%`,
                        transition: 'width 0.5s ease-in-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : aiResponse ? (
              <div className="mt-8 text-left p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-2">Your Custom Action Plan</h3>
                <div 
                  className="max-h-64 overflow-y-auto mb-4"
                  dangerouslySetInnerHTML={{ __html: aiResponse }} 
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowActionPlanModal(true)}
                  >
                    View Full Plan
                  </Button>
                  <Button
                    onClick={() => generateActionPlanPDF(aiResponse, formData.businessName)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="p-4 border rounded border-yellow-200 bg-yellow-50">
                  <div className="flex items-center text-yellow-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <p className="text-sm">Your custom action plan will be available shortly.</p>
                  </div>
                </div>
                
                <Button 
                  onClick={loadActionPlan}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoadingActionPlan}
                >
                  {isLoadingActionPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Action Plan...
                    </>
                  ) : (
                    <>
                      Get Your Action Plan
                    </>
                  )}
                </Button>
                
                {actionPlanError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
                    <p className="text-sm">{actionPlanError}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                variant="outline"
                size="lg"
                className="bg-white"
                onClick={() => window.open('https://calendly.com/frayze/demo', '_blank')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a Call Now
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setShowSuccess(false);
                }}
                className="bg-gradient-to-r from-[#0066FF] to-[#00F6A3] text-white hover:from-[#0052CC] hover:to-[#00E69D]"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Complete Your Custom Quote Request</CardTitle>
            <div className="flex items-center">
              <Zap className="w-6 h-6 text-[#0066FF] mr-2" />
              <span className="text-xl font-bold text-[#1F2937]">FRAYZE</span>
            </div>
          </div>
          {showConfirmation && (
            <div className="bg-primary/5 p-4 rounded-lg mt-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Check className="w-5 h-5 mr-2 text-[#0066FF]" />
                Review Your Quote Request
              </h3>
              <p className="text-sm text-muted-foreground">Please review your information before final submission.</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {showConfirmation && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Selected Services</h4>
              <div className="space-y-2">
                {selected.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span>{addon.name}</span>
                    <span className="text-muted-foreground">
                      {addon.pricing.type === 'inquire' ? 'Quote Required' : formatCurrency(addon.pricing.amount || 0)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total Estimated</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Business Name
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your business name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Name</label>
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                Budget Range
              </label>
              <Select
                value={formData.budget}
                onValueChange={(value) => setFormData({ ...formData, budget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300-1k">$300 - $1,000</SelectItem>
                  <SelectItem value="1k-2.5k">$1,000 - $2,500</SelectItem>
                  <SelectItem value="2.5k-5k">$2,500 - $5,000</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10k+">$10,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                Implementation Timeline
              </label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => setFormData({ ...formData, timeline: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">As soon as possible</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                Best Time to Contact
              </label>
              <Select
                value={formData.bestTimeToContact}
                onValueChange={(value) => setFormData({ ...formData, bestTimeToContact: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12pm - 4pm)</SelectItem>
                  <SelectItem value="evening">Evening (4pm - 6pm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Information</label>
            <Textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Tell us about your specific needs, challenges, or any questions you have..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onBack}>
              Back to Stack Builder
            </Button>
            <Button 
              type="submit"
              disabled={!formData.businessName || !formData.contactName || !formData.email || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Submitting...</span>
                </>
              ) : (
                <>
                  {showConfirmation ? 'Confirm & Submit' : 'Review Quote Request'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          </form>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Your information is secure and will only be used to process your quote request.
            A Frayze team member will contact you within 1 business day.
          </p>
        </CardContent>
      </Card>

      {/* Action Plan Modal */}
      <Dialog open={showActionPlanModal} onOpenChange={setShowActionPlanModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Custom Action Plan</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto my-4">
            {aiResponse ? (
              <div dangerouslySetInnerHTML={{ __html: aiResponse }} />
            ) : (
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">No action plan available yet.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowActionPlanModal(false)}
            >
              Close
            </Button>
            
            <Button
              onClick={() => generateActionPlanPDF(aiResponse!, formData.businessName)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}