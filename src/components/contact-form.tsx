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
import { storeResponse, getStoredResponse, prepareHtmlForReact } from "@/lib/callback-storage";
import { 
  CheckIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  UserIcon, 
  BuildingOfficeIcon 
} from "@heroicons/react/24/outline";

interface ContactFormProps {
  totalPrice: number;
  selected: Addon[];
  onSubmit: (data: any, responseData?: { formId?: string, aiResponse?: string }) => void;
  onBack: () => void;
}

// Function to check for callback results from n8n
const checkForCallbackResults = async (formId: string): Promise<{ aiResponse: string } | null> => {
  try {
    console.log(`Attempting to find response for formId: ${formId}`);
    
    // Use our enhanced storage utility to get the response with fallbacks
    const result = getStoredResponse(formId);
    if (result) {
      return result;
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
          
          // Store using our utility
          storeResponse(formId, responseData.aiResponse, 'callback');
          
          return {
            aiResponse: responseData.aiResponse
          };
        }
      }
    } catch (apiError) {
      console.error('Error checking callback endpoint:', apiError);
    }
    
    // If we get here, we couldn't find a response through any method
    return null;
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
          // First try the API directly
          try {
            console.log('Checking server API directly...');
            const callbackResponse = await fetch(`/.netlify/functions/webhook-callback?formId=${formId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (callbackResponse.ok) {
              const responseData = await callbackResponse.json();
              
              // If we have an AI response, save it and stop polling
              if (responseData && responseData.aiResponse) {
                console.log('Received real API response from server');
                clearInterval(pollingInterval!);
                setWaitingForCallback(false);
                
                // Process the HTML for React
                const processedHtml = prepareHtmlForReact(responseData.aiResponse);
                setAiResponse(processedHtml);
                
                // Store the response for future retrieval
                storeResponse(formId, processedHtml, 'callback');
                return;
              }
            }
          } catch (apiError) {
            console.error('API polling error:', apiError);
          }
          
          // Only check localStorage if API call didn't return a result
          // First try without fallbacks
          const result = getStoredResponse(formId, false);
          
          // If we have results, stop polling and update UI
          if (result && result.aiResponse) {
            console.log('Found stored response for formId:', formId);
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
            setAiResponse(result.aiResponse);
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
              
              // Store fallback for retrieval
              storeResponse(formId, fallbackHtml, 'fallback');
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
          
          // Store the response using our utility
          storeResponse(uniqueFormId, response.aiResponse, 'webhook');
        } else {
          // Start polling for the callback response
          setWaitingForCallback(true);
        }
        
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
      
      // First try the API directly - prioritize real data
      try {
        console.log('Checking server API directly...');
        const callbackResponse = await fetch(`/.netlify/functions/webhook-callback?formId=${formId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (callbackResponse.ok) {
          const responseData = await callbackResponse.json();
          
          // If we have an AI response, use it
          if (responseData && responseData.aiResponse) {
            console.log('Received real AI response from server API');
            
            // Process the HTML for React
            const processedHtml = prepareHtmlForReact(responseData.aiResponse);
            setAiResponse(processedHtml);
            
            // Store the response for future retrieval
            storeResponse(formId, processedHtml, 'callback');
            
            // Show the modal with the response
            setShowActionPlanModal(true);
            setIsLoadingActionPlan(false);
            return;
          }
        }
      } catch (apiError) {
        console.error('Error checking server API:', apiError);
      }
      
      // Check without fallbacks first (only look for direct match in localStorage)
      const directResult = getStoredResponse(formId, false);
      if (directResult && directResult.aiResponse) {
        console.log('Found direct match in localStorage');
        setAiResponse(directResult.aiResponse);
        setShowActionPlanModal(true);
        setIsLoadingActionPlan(false);
        return;
      }
      
      // If nothing found, try with fallbacks enabled
      console.log('No direct match found, trying with fallbacks enabled');
      const fallbackResult = getStoredResponse(formId, true);
      if (fallbackResult && fallbackResult.aiResponse) {
        console.log('Found response with fallbacks');
        setAiResponse(fallbackResult.aiResponse);
        setShowActionPlanModal(true);
        setIsLoadingActionPlan(false);
        return;
      }
      
      // If we get here, we couldn't find a response through any method
      setActionPlanError("No action plan found. Our team may still be working on your custom plan.");
      
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
                      Frayzi is generating a personalized action plan based on your selections.
                      This usually takes 15-30 seconds while Frayzi works.
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader className="space-y-4">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">Complete Your Quote</CardTitle>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-base sm:text-lg lg:text-xl font-semibold">Total: {formatCurrency(totalPrice)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={onBack}
            >
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Back to Builder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Business Name</label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Contact Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Phone</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Budget</label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-plus">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Timeline</label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-3-months">2-3 months</SelectItem>
                    <SelectItem value="3-plus-months">3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium">Best Time to Contact</label>
              <Select
                value={formData.bestTimeToContact}
                onValueChange={(value) => setFormData({ ...formData, bestTimeToContact: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select preferred contact time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                  <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium">Additional Information</label>
              <Textarea
                placeholder="Tell us more about your needs..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="min-h-[100px] text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium">Website URL (if applicable)</label>
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="w-full sm:w-auto text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Quote Request
                  </>
                )}
              </Button>
              {submitError && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {submitError}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action Plan Modal */}
      <Dialog open={showActionPlanModal} onOpenChange={setShowActionPlanModal}>
        <DialogContent className="max-w-4xl" aria-describedby="action-plan-description">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Custom Action Plan</DialogTitle>
            <p id="action-plan-description" className="text-sm text-muted-foreground">
              Review your personalized steps based on your package selection
            </p>
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
    </div>
  );
}