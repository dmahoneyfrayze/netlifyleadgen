import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, Building2, Calendar, Clock, DollarSign, 
  Check, Zap, AlertCircle, Loader2
} from "lucide-react";
import { type Addon } from "@/types";
import { formatCurrency } from "@/lib/format-utils";
import { submitFormToWebhook } from "@/lib/api";
import { generateQuotePDF } from "@/lib/pdf-utils";

interface ContactFormProps {
  totalPrice: number;
  selected: Addon[];
  onSubmit: (data: any) => void;
  onBack: () => void;
}

// Mock function to simulate checking for callback results
// In a real implementation, this would query a database or other storage
const checkForCallbackResults = (formId: string): Promise<{ aiResponse: string } | null> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Query a database or storage to see if there's a result for this form ID
  // 2. Return the result if found
  // 3. Return null if not found
  
  // For now, we'll simulate a delay and then return the sample response
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate getting a response 30% of the time
      if (Math.random() < 0.3) {
        resolve({
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
    <a href="https://calendar.notion.so/meet/denis-mahoney/introduction" className="text-blue-500 underline">Schedule Kickoff Call</a>
  </p>
</div>`
        });
      } else {
        resolve(null);
      }
    }, 3000); // Simulate a 3 second delay
  });
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

  // Effect for polling for callback results
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (waitingForCallback && formId) {
      // Set up polling
      pollingInterval = setInterval(async () => {
        // Increment polling count
        setPollingCount(count => count + 1);
        
        try {
          // Check for results
          const result = await checkForCallbackResults(formId);
          
          // If we have results, stop polling and update UI
          if (result && result.aiResponse) {
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
            setAiResponse(result.aiResponse);
          }
          
          // If we've polled too many times, stop (to prevent infinite polling)
          if (pollingCount > 10) { // Stop after ~30 seconds (10 polls * 3 seconds)
            clearInterval(pollingInterval!);
            setWaitingForCallback(false);
          }
        } catch (error) {
          console.error("Error polling for callback results:", error);
          clearInterval(pollingInterval!);
          setWaitingForCallback(false);
        }
      }, 3000); // Poll every 3 seconds
    }
    
    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [waitingForCallback, formId, pollingCount]);

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
        callbackUrl: uniqueFormId // Pass the form ID as part of the callback context
      });
      
      if (response.success) {
        // Show success message
        setShowSuccess(true);
        
        // Set AI response if available immediately
        if (response.aiResponse) {
          setAiResponse(response.aiResponse);
        } else {
          // Start polling for the callback response
          setWaitingForCallback(true);
        }
        
        // Pass form data to parent component
        onSubmit(formData);
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
                and reach out within 1 business day.
              </p>
            </div>
            
            {waitingForCallback ? (
              <div className="mt-8 flex flex-col items-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating your personalized action plan...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="mt-8 text-left">
                <div dangerouslySetInnerHTML={{ __html: aiResponse }} />
              </div>
            ) : null}
            
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
  );
}